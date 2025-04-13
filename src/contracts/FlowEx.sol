// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import the PoolContract to interact with it
import "./CurveAMM.sol";
import "./MockERC20.sol";

// Define the FlowExContract
contract FlowExContract {
    // Variable to store the address of the FlowEx contract owner
    address public flowExOwner;

    // Struct to hold information about a token
    struct TokenInfo {
        string name; // Name of the token
        address tokenAddress; // Address of the token contract
    }

    // Struct to hold information about a pool
    struct PoolInfo {
        address tokenA; // Address of the first token in the pool
        address tokenB; // Address of the second token in the pool
        address poolAddress; // Address of the pool contract
        address owner; // Address of the pool owner
    }

    // Array to store all supported tokens
    TokenInfo[] public supportedTokens;
    // Mapping to map token names to their addresses
    mapping(string => address) public nameToToken;
    // Mapping to check if a token exists
    mapping(address => bool) public tokenExists;

    // Array to store all pools
    PoolInfo[] public pools;
    // Mapping to map pool keys to their addresses
    mapping(bytes32 => address) public poolMap;

    // Modifier to check if the caller is the FlowEx contract owner
    modifier onlyFlowExOwner() {
        require(msg.sender == flowExOwner, "Not FlowEx owner");
        _;
    }

    // Modifier to check if the caller is the owner of a specific pool
    modifier onlyPoolOwner(bytes32 key) {
        require(poolMap[key] != address(0), "Pool not exists");
        uint index = _getPoolIndex(poolMap[key]);
        require(msg.sender == pools[index].owner, "Not pool owner");
        _;
    }

    // Constructor to initialize the contract
    constructor() {
        flowExOwner = msg.sender; // Set the contract owner to the deployer
    }

    // Events emitted by the contract
    // Event emitted when a token is called
    event TokenCalled(string name, address tokenAddress);
    // Event emitted when a token is added
    event TokenAdded(string name, address tokenAddress);
    // Event emitted when a token is removed
    event TokenRemoved(string name, address tokenAddress);
    // Event emitted when a pool is created
    event PoolCreated(
        address indexed tokenA,
        address indexed tokenB,
        address pool,
        address owner
    );
    // Event emitted when a pool is removed
    event PoolRemoved(
        address indexed tokenA,
        address indexed tokenB,
        address pool
    );

    // Function to add a token to the supported tokens list
    function addToken(string memory name) external returns (address) {
        // 检查该 token 名称是否已经存在
        address existingToken = nameToToken[name];
        if (existingToken != address(0)) {
            // 如果已经存在，直接返回该 token 的地址
            emit TokenCalled(name, existingToken);
            return existingToken;
        } else {
            // 如果不存在，则创建一个新的 MockERC20 合约
            MockERC20 newToken = new MockERC20(name, name);
            address newTokenAddress = address(newToken);

            // 将新的 token 记录到 supportedTokens 和 nameToToken 中
            supportedTokens.push(
                TokenInfo({name: name, tokenAddress: newTokenAddress})
            );
            nameToToken[name] = newTokenAddress;
            tokenExists[newTokenAddress] = true;

            emit TokenAdded(name, newTokenAddress);
            return newTokenAddress;
        }
    }

    // Function to remove a token from the supported tokens list
    function removeToken(string memory name) external {
        address tokenAddr = nameToToken[name];
        require(tokenAddr != address(0), "Token not found");

        delete nameToToken[name];
        tokenExists[tokenAddr] = false;

        emit TokenRemoved(name, tokenAddr);
    }

    // Function to get all supported tokens
    function getAllTokens() external view returns (TokenInfo[] memory) {
        return supportedTokens;
    }

    // Function to add a pool to the pools list
    function addPool(address tokenA, address tokenB) external {
        require(tokenA != tokenB, "Same token");
        require(
            tokenExists[tokenA] && tokenExists[tokenB],
            "Unsupported tokens"
        );

        bytes32 key = _getPairHash(tokenA, tokenB);
        require(poolMap[key] == address(0), "Pool already exists");

        CurveAMM pool = new CurveAMM(tokenA, tokenB);
        poolMap[key] = address(pool);

        pools.push(
            PoolInfo({
                tokenA: tokenA,
                tokenB: tokenB,
                poolAddress: address(pool),
                owner: msg.sender
            })
        );

        emit PoolCreated(tokenA, tokenB, address(pool), msg.sender);
    }

    // Function to remove a pool from the pools list
    function removePool(address tokenA, address tokenB) external {
        bytes32 key = _getPairHash(tokenA, tokenB);
        require(poolMap[key] != address(0), "Pool not exists");

        uint index = _getPoolIndex(poolMap[key]);
        require(pools[index].owner == msg.sender, "Not pool owner");

        address poolAddr = poolMap[key];
        delete poolMap[key];

        pools[index] = pools[pools.length - 1];
        pools.pop();

        emit PoolRemoved(tokenA, tokenB, poolAddr);
    }

    // Function to get all pools
    function getAllPools() external view returns (PoolInfo[] memory) {
        return pools;
    }

    // Function to calculate the hash of a token pair
    function _getPairHash(
        address tokenA,
        address tokenB
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    tokenA < tokenB ? tokenA : tokenB,
                    tokenA < tokenB ? tokenB : tokenA
                )
            );
    }

    // Function to get the index of a pool by its address
    function _getPoolIndex(address poolAddress) internal view returns (uint) {
        for (uint i = 0; i < pools.length; i++) {
            if (pools[i].poolAddress == poolAddress) return i;
        }
        revert("Pool not found");
    }
}
