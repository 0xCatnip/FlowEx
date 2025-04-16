// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CurveAMM is ERC20 {
    address public tokenA;
    address public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public feeRate = 30; // 0.3% 手续费
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public amplification = 1000; // A 值，放大系数（通常较大）


    struct Trade {
        address user;
        string action;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 share;
        uint256 timestamp;
    }

    Trade[] public trades; // 所有交易记录

    event LiquidityAdded(
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 lpTokens
    );
    event LiquidityRemoved(
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 lpBurned
    );
    event Swapped(
        address indexed user,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        uint256 outputAmount,
        uint256 fee
    );
    event TradeRecord(
        address user,
        string action,
        uint256 amountA,
        uint256 amountB,
        uint256 timestamp
    );

    constructor(address _tokenA, address _tokenB) ERC20("LP Token", "LPT") {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    // ========== 添加流动性 ==========
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Zero amount");

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        uint256 lpToMint;
        if (totalSupply() == 0) {
            lpToMint = sqrt(amountA * amountB);
        } else {
            lpToMint = min(
                (amountA * totalSupply()) / reserveA,
                (amountB * totalSupply()) / reserveB
            );
        }

        _mint(msg.sender, lpToMint);
        reserveA += amountA;
        reserveB += amountB;

        trades.push(
            Trade({
                user: msg.sender,
                action: "AddLiquidity",
                tokenA: tokenA,
                tokenB: tokenB,
                amountA: amountA,
                amountB: amountB,
                share: lpToMint,
                timestamp: block.timestamp
            })
        );

        emit LiquidityAdded(msg.sender, amountA, amountB, lpToMint);
        emit TradeRecord(
            msg.sender,
            "AddLiquidity",
            amountA,
            amountB,
            block.timestamp
        );
    }

    // ========== 撤回流动性 ==========
    function removeLiquidity(uint256 lpAmount) external {
        require(lpAmount > 0, "Zero LP");

        uint256 amountA = (lpAmount * reserveA) / totalSupply();
        uint256 amountB = (lpAmount * reserveB) / totalSupply();

        _burn(msg.sender, lpAmount);

        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);

        reserveA -= amountA;
        reserveB -= amountB;

        trades.push(
            Trade({
                user: msg.sender,
                action: "RemoveLiquidity",
                tokenA: tokenA,
                tokenB: tokenB,
                amountA: amountA,
                amountB: amountB,
                share: lpAmount,
                timestamp: block.timestamp
            })
        );

        emit LiquidityRemoved(msg.sender, amountA, amountB, lpAmount);
        emit TradeRecord(
            msg.sender,
            "RemoveLiquidity",
            amountA,
            amountB,
            block.timestamp
        );
    }

    // ========== 预测 ==========
    function previewSwap(
        address inputToken,
        uint256 inputAmount
    ) public view returns (uint256 outputAmount, uint256 fee) {
        require(inputToken == tokenA || inputToken == tokenB, "Invalid token");

        uint256 inputAfterFee = (inputAmount * (FEE_DENOMINATOR - feeRate)) /
            FEE_DENOMINATOR;
        fee = inputAmount - inputAfterFee;

        (uint256 x, uint256 y) = inputToken == tokenA
            ? (reserveA, reserveB)
            : (reserveB, reserveA);
        outputAmount = getOutputAmount(x, y, inputAfterFee);
    }

    // ========== 兑换 ==========
    function swap(
        address inputToken,
        uint256 inputAmount
    ) external returns (uint256 outputAmount) {
        require(inputAmount > 0, "Invalid amount");
        require(inputToken == tokenA || inputToken == tokenB, "Invalid token");

        address outputToken = inputToken == tokenA ? tokenB : tokenA;
        (uint256 x, uint256 y) = inputToken == tokenA
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        IERC20(inputToken).transferFrom(msg.sender, address(this), inputAmount);

        uint256 inputAfterFee = (inputAmount * (FEE_DENOMINATOR - feeRate)) /
            FEE_DENOMINATOR;
        outputAmount = getOutputAmount(x, y, inputAfterFee);

        IERC20(outputToken).transfer(msg.sender, outputAmount);

        // 更新储备
        if (inputToken == tokenA) {
            reserveA += inputAmount;
            reserveB -= outputAmount;
        } else {
            reserveB += inputAmount;
            reserveA -= outputAmount;
        }

        trades.push(
            Trade({
                user: msg.sender,
                action: "Swap",
                tokenA: inputToken,
                tokenB: outputToken,
                amountA: inputAmount,
                amountB: outputAmount,
                share: 0,
                timestamp: block.timestamp
            })
        );

        emit Swapped(
            msg.sender,
            inputToken,
            inputAmount,
            outputToken,
            outputAmount,
            inputAmount - inputAfterFee
        );
        emit TradeRecord(
            msg.sender,
            "Swap",
            inputToken == tokenA ? inputAmount : 0,
            inputToken == tokenB ? inputAmount : 0,
            block.timestamp
        );
    }

    function previewReservesAfterSwap(
        address inputToken,
        uint256 inputAmount
    ) external view returns (uint256 newReserveA, uint256 newReserveB) {
        (uint256 outputAmount, ) = previewSwap(inputToken, inputAmount);

        if (inputToken == tokenA) {
            newReserveA = reserveA + inputAmount;
            newReserveB = reserveB - outputAmount;
        } else {
            newReserveB = reserveB + inputAmount;
            newReserveA = reserveA - outputAmount;
        }
    }

    // ========== 核心算法（简化 Curve AMM） ==========
    function getD(
        uint256 x,
        uint256 y,
        uint256 A
    ) internal pure returns (uint256) {
        uint256 S = x + y;
        if (S == 0) return 0;

        uint256 D = S;
        for (uint8 i = 0; i < 256; i++) {
            uint256 D_P = (D * D) / (x * 2);
            D_P = (D_P * D) / (y * 2);
            uint256 prevD = D;
            uint256 numerator = (2 * D * D_P + A * S * D * 2);
            uint256 denominator = (3 * D_P + A * D * 2);
            D = numerator / denominator;
            if (D > prevD ? D - prevD <= 1 : prevD - D <= 1) {
                break;
            }
        }
        return D;
    }

    function getY(
        uint256 x,
        uint256 D,
        uint256 A
    ) internal pure returns (uint256) {
        // Solve y using D = x + y + A * (x*y)^2/(x + y)^2, simplified for 2 tokens
        uint256 c = (D * D * D) / (x * 4 * A);
        uint256 b = D / (2 * A) + x;
        uint256 y = D;

        for (uint8 i = 0; i < 256; i++) {
            uint256 prevY = y;
            uint256 numerator = y * y + c;
            uint256 denominator = 2 * y + b - D;
            y = numerator / denominator;
            if (y > prevY ? y - prevY <= 1 : prevY - y <= 1) break;
        }
        return y;
    }

    function getOutputAmount(
        uint256 x,
        uint256 y,
        uint256 dx
    ) internal view returns (uint256 dy) {
        uint256 A = amplification;
        uint256 D = getD(x, y, A);
        uint256 newX = x + dx;
        uint256 newY = getY(newX, D, A);
        require(y > newY, "Insufficient liquidity");
        dy = y - newY;
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        y = x;
        uint256 z = (x + 1) / 2;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function getAllTrades() external view returns (Trade[] memory) {
        return trades;
    }
}
