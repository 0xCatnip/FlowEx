// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CurveAMM is ReentrancyGuard, Ownable {
    IERC20 public token1;
    IERC20 public token2;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant FEE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant A = 100; // Amplification coefficient

    uint256 public reserve1;
    uint256 public reserve2;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Swap(address indexed user, uint256 tokenInAmount, uint256 tokenOutAmount, bool isToken1);
    event AddLiquidity(address indexed user, uint256 token1Amount, uint256 token2Amount, uint256 lpAmount);
    event RemoveLiquidity(address indexed user, uint256 token1Amount, uint256 token2Amount, uint256 lpAmount);

    constructor(address _token1, address _token2) {
        require(_token1 != address(0) && _token2 != address(0), "Invalid token address");
        require(_token1 != _token2, "Tokens must be different");
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function addLiquidity(uint256 amount1, uint256 amount2) external nonReentrant returns (uint256 liquidity) {
        require(amount1 > 0 && amount2 > 0, "Amounts must be greater than 0");

        // Calculate liquidity to mint using Curve's invariant
        if (totalSupply == 0) {
            liquidity = calculateInvariant(amount1, amount2);
        } else {
            uint256 newInvariant = calculateInvariant(reserve1 + amount1, reserve2 + amount2);
            uint256 oldInvariant = calculateInvariant(reserve1, reserve2);
            liquidity = (totalSupply * (newInvariant - oldInvariant)) / oldInvariant;
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        // Transfer tokens from user
        token1.transferFrom(msg.sender, address(this), amount1);
        token2.transferFrom(msg.sender, address(this), amount2);

        // Update state
        reserve1 += amount1;
        reserve2 += amount2;
        balanceOf[msg.sender] += liquidity;
        totalSupply += liquidity;

        emit AddLiquidity(msg.sender, amount1, amount2, liquidity);
    }

    function removeLiquidity(uint256 liquidity) external nonReentrant returns (uint256 amount1, uint256 amount2) {
        require(liquidity > 0, "Amount must be greater than 0");
        require(balanceOf[msg.sender] >= liquidity, "Insufficient balance");

        // Calculate amounts to return using Curve's invariant
        uint256 oldInvariant = calculateInvariant(reserve1, reserve2);
        uint256 newInvariant = (oldInvariant * (totalSupply - liquidity)) / totalSupply;
        
        // Calculate new reserves that maintain the invariant
        (amount1, amount2) = calculateNewReserves(newInvariant);

        require(amount1 > 0 && amount2 > 0, "Insufficient amounts");

        // Update state
        balanceOf[msg.sender] -= liquidity;
        totalSupply -= liquidity;
        reserve1 -= amount1;
        reserve2 -= amount2;

        // Transfer tokens to user
        token1.transfer(msg.sender, amount1);
        token2.transfer(msg.sender, amount2);

        emit RemoveLiquidity(msg.sender, amount1, amount2, liquidity);
    }

    function swap(uint256 amountIn, bool isToken1) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");

        IERC20 tokenIn = isToken1 ? token1 : token2;
        IERC20 tokenOut = isToken1 ? token2 : token1;
        uint256 reserveIn = isToken1 ? reserve1 : reserve2;
        uint256 reserveOut = isToken1 ? reserve2 : reserve1;

        // Calculate amount out using Curve's invariant
        uint256 oldInvariant = calculateInvariant(reserve1, reserve2);
        uint256 newReserveIn = reserveIn + amountIn;
        uint256 newReserveOut = calculateNewReserveOut(newReserveIn, oldInvariant);
        amountOut = reserveOut - newReserveOut;

        require(amountOut > 0, "Insufficient output amount");

        // Apply fee
        amountOut = (amountOut * (FEE_DENOMINATOR - FEE)) / FEE_DENOMINATOR;

        // Transfer tokens
        tokenIn.transferFrom(msg.sender, address(this), amountIn);
        tokenOut.transfer(msg.sender, amountOut);

        // Update reserves
        if (isToken1) {
            reserve1 += amountIn;
            reserve2 -= amountOut;
        } else {
            reserve2 += amountIn;
            reserve1 -= amountOut;
        }

        emit Swap(msg.sender, amountIn, amountOut, isToken1);
    }

    function calculateInvariant(uint256 x, uint256 y) internal pure returns (uint256) {
        // Curve's invariant: D = (x + y) + A * (x * y) / (x + y)
        uint256 sum = x + y;
        if (sum == 0) return 0;
        return sum + (A * x * y) / sum;
    }

    function calculateNewReserves(uint256 invariant) internal view returns (uint256 x, uint256 y) {
        // For simplicity, we assume equal distribution
        uint256 sum = invariant / (1 + A);
        x = sum / 2;
        y = sum / 2;
    }

    function calculateNewReserveOut(uint256 reserveIn, uint256 invariant) internal pure returns (uint256) {
        // Solve for reserveOut given reserveIn and invariant
        uint256 a = A;
        uint256 b = reserveIn;
        uint256 c = (invariant - reserveIn) * reserveIn;
        uint256 discriminant = b * b + 4 * a * c;
        return (sqrt(discriminant) - b) / (2 * a);
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
} 