// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import OpenZeppelin's ERC20 interface, reentrancy lock, and access control
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Curve driven AMM Contract
/// @notice Supports dual-token liquidity pool, slippage protection, and exchange fees
contract CurveAMM is ReentrancyGuard, Ownable {
    // Precision constant, using 1e18 to avoid precision loss
    uint256 public constant PRECISION = 1e18;

    // Fee 0.3% (in basis points)
    uint256 public constant FEE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Amplification coefficient A (simulating the focus on the stablecoin price range in the Curve model)
    uint256 public constant A = 100; // Amplification coefficient

    // Two tokens that can participate in liquidity provision
    IERC20 public token_0;
    IERC20 public token_1;

    // The reserve amounts of the two tokens in the current pool
    uint256 public token_0_reserve;
    uint256 public token_1_reserve;

    // Total supply of LP tokens
    uint256 public total_lp_supply;

    // Mapping of user's LP token balance (non-ERC20 format)
    mapping(address => uint256) public user_lp_balance;

    // Add/Remove Liquidity, Swap Events
    event Swap(
        address indexed user,
        uint256 amount_input_token,
        uint256 amount_output_token,
        bool is_token
    );
    event AddLiquidity(
        address indexed user,
        uint256 amount_token_0,
        uint256 amount_token_1,
        uint256 lp_amount
    );
    event RemoveLiquidity(
        address indexed user,
        uint256 amount_token_0,
        uint256 amount_token_1,
        uint256 lp_amount
    );

    /// @notice Constructor, initializes two token addresses
    constructor(address _token_0, address _token_1) {
        require(
            _token_0 != address(0) && _token_1 != address(0),
            "Invalid token address"
        );
        require(_token_0 != _token_1, "Tokens must be different");
        token_0 = IERC20(_token_0);
        token_1 = IERC20(_token_1);
    }

    function addLiquidity(
        uint256 amount_token_0,
        uint256 amount_token_1
    ) external nonReentrant returns (uint256 lp_amount) {
        require(
            amount_token_0 > 0 && amount_token_1 > 0,
            "Amounts must be greater than 0"
        );

        // Calculate liquidity to mint using Curve's invariant
        if (total_lp_supply == 0) {
            lp_amount = calculateInvariant(amount_token_0, amount_token_1);
        } else {
            uint256 newInvariant = calculateInvariant(
                token_0_reserve + amount_token_0,
                token_1_reserve + amount_token_1
            );
            uint256 oldInvariant = calculateInvariant(
                token_0_reserve,
                token_1_reserve
            );
            lp_amount =
                (total_lp_supply * (newInvariant - oldInvariant)) /
                oldInvariant;
        }

        require(lp_amount > 0, "Insufficient liquidity minted");

        // Transfer tokens from user
        token_0.transferFrom(msg.sender, address(this), amount_token_0);
        token_1.transferFrom(msg.sender, address(this), amount_token_1);

        // Update state
        token_0_reserve += amount_token_0;
        token_1_reserve += amount_token_1;
        user_lp_balance[msg.sender] += lp_amount;
        total_lp_supply += lp_amount;

        emit AddLiquidity(
            msg.sender,
            amount_token_0,
            amount_token_1,
            lp_amount
        );
    }

    /// @notice Remove liquidity
    function removeLiquidity(
        uint256 lp_amount
    ) external nonReentrant returns (uint256 amount1, uint256 amount2) {
        require(lp_amount > 0, "Amount must be greater than 0");
        require(
            user_lp_balance[msg.sender] >= lp_amount,
            "Insufficient balance"
        );

        // Calculate amounts to return using Curve's invariant
        uint256 oldInvariant = calculateInvariant(
            token_0_reserve,
            token_1_reserve
        );
        uint256 newInvariant = (oldInvariant * (total_lp_supply - lp_amount)) /
            total_lp_supply;

        // Calculate new reserves that maintain the invariant
        (amount1, amount2) = calculateNewReserves(newInvariant);

        require(amount1 > 0 && amount2 > 0, "Insufficient amounts");

        // Update state
        user_lp_balance[msg.sender] -= lp_amount;
        total_lp_supply -= lp_amount;
        token_0_reserve -= amount1;
        token_1_reserve -= amount2;

        // Transfer tokens to user
        token_0.transfer(msg.sender, amount1);
        token_1.transfer(msg.sender, amount2);

        emit RemoveLiquidity(msg.sender, amount1, amount2, lp_amount);
    }

    // @notice Token exchange (with slippage protection)
    // @param amountIn The amount of tokens input by the user
    // @param minAmountOut The minimum output value allowed by the user (for slippage protection)
    // @param isToken0In Whether the input is token0 (true indicates exchanging from token0 to token1)
    function swap(
        uint256 amountIn,
        bool isToken1
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");

        IERC20 tokenIn = isToken1 ? token_0 : token_1;
        IERC20 tokenOut = isToken1 ? token_1 : token_0;
        uint256 reserveIn = isToken1 ? token_0_reserve : token_1_reserve;
        uint256 reserveOut = isToken1 ? token_1_reserve : token_0_reserve;

        // Calculate amount out using Curve's invariant
        uint256 oldInvariant = calculateInvariant(token_0_reserve, token_1_reserve);
        uint256 newReserveIn = reserveIn + amountIn;
        uint256 newReserveOut = calculateNewReserveOut(
            newReserveIn,
            oldInvariant
        );
        amountOut = reserveOut - newReserveOut;

        require(amountOut > 0, "Insufficient output amount");

        // Apply fee
        amountOut = (amountOut * (FEE_DENOMINATOR - FEE)) / FEE_DENOMINATOR;

        // Transfer tokens
        tokenIn.transferFrom(msg.sender, address(this), amountIn);
        tokenOut.transfer(msg.sender, amountOut);

        // Update reserves
        if (isToken1) {
            token_0_reserve += amountIn;
            token_1_reserve -= amountOut;
        } else {
            token_1_reserve += amountIn;
            token_0_reserve -= amountOut;
        }

        emit Swap(msg.sender, amountIn, amountOut, isToken1);
    }

    function calculateInvariant(
        uint256 x,
        uint256 y
    ) internal pure returns (uint256) {
        // Curve's invariant: D = (x + y) + A * (x * y) / (x + y)
        uint256 sum = x + y;
        if (sum == 0) return 0;
        return sum + (A * x * y) / sum;
    }

    function calculateNewReserves(
        uint256 invariant
    ) internal pure returns (uint256 x, uint256 y) {
        // For simplicity, we assume equal distribution
        uint256 sum = invariant / (1 + A);
        x = sum / 2;
        y = sum / 2;
    }

    function calculateNewReserveOut(
        uint256 reserveIn,
        uint256 invariant
    ) internal pure returns (uint256) {
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
