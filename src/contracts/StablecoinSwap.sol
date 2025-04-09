// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StablecoinSwap is ReentrancyGuard, Ownable {
    IERC20 public immutable token1; // USDT
    IERC20 public immutable token2; // USDC
    
    uint256 public constant PRECISION = 1e18;
    uint256 public constant FEE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    uint256 public reserve1;
    uint256 public reserve2;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool isToken1);
    event AddLiquidity(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidity);
    event RemoveLiquidity(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidity);
    
    constructor(address _token1, address _token2) {
        require(_token1 != address(0) && _token2 != address(0), "Invalid token addresses");
        require(_token1 != _token2, "Tokens must be different");
        
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }
    
    function addLiquidity(uint256 amount1, uint256 amount2) external nonReentrant returns (uint256 liquidity) {
        require(amount1 > 0 && amount2 > 0, "Amounts must be greater than 0");
        
        uint256 _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount1 * amount2);
        } else {
            uint256 liquidity1 = (amount1 * _totalSupply) / reserve1;
            uint256 liquidity2 = (amount2 * _totalSupply) / reserve2;
            liquidity = Math.min(liquidity1, liquidity2);
        }
        
        require(liquidity > 0, "Insufficient liquidity");
        
        token1.transferFrom(msg.sender, address(this), amount1);
        token2.transferFrom(msg.sender, address(this), amount2);
        
        reserve1 += amount1;
        reserve2 += amount2;
        totalSupply += liquidity;
        balanceOf[msg.sender] += liquidity;
        
        emit AddLiquidity(msg.sender, amount1, amount2, liquidity);
    }
    
    function removeLiquidity(uint256 liquidity) external nonReentrant returns (uint256 amount1, uint256 amount2) {
        require(liquidity > 0, "Liquidity must be greater than 0");
        require(balanceOf[msg.sender] >= liquidity, "Insufficient balance");
        
        amount1 = (liquidity * reserve1) / totalSupply;
        amount2 = (liquidity * reserve2) / totalSupply;
        
        require(amount1 > 0 && amount2 > 0, "Insufficient liquidity");
        
        balanceOf[msg.sender] -= liquidity;
        totalSupply -= liquidity;
        reserve1 -= amount1;
        reserve2 -= amount2;
        
        token1.transfer(msg.sender, amount1);
        token2.transfer(msg.sender, amount2);
        
        emit RemoveLiquidity(msg.sender, amount1, amount2, liquidity);
    }
    
    function swap(uint256 amountIn, bool isToken1) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        uint256 reserveIn = isToken1 ? reserve1 : reserve2;
        uint256 reserveOut = isToken1 ? reserve2 : reserve1;
        
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut > 0, "Insufficient output amount");
        
        if (isToken1) {
            token1.transferFrom(msg.sender, address(this), amountIn);
            token2.transfer(msg.sender, amountOut);
            reserve1 += amountIn;
            reserve2 -= amountOut;
        } else {
            token2.transferFrom(msg.sender, address(this), amountIn);
            token1.transfer(msg.sender, amountOut);
            reserve2 += amountIn;
            reserve1 -= amountOut;
        }
        
        emit Swap(msg.sender, amountIn, amountOut, isToken1);
    }
    
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient reserves");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DENOMINATOR + amountInWithFee;
        
        return numerator / denominator;
    }
}

library Math {
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
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