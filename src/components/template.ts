import { ethers } from "ethers";

export interface Token {
    name: string;
    addr: string;
}

export interface Pool {
    tokenA: string; // Address of the first token in the pool
    tokenB: string; // Address of the second token in the pool
    poolAddress: string; // Address of the pool contract
    owner: string;
}

export interface PoolInfo {
    poolAddr: string;
    nameA: string;
    nameB: string;
    addrA: string;
    addrB: string;
    reserveA: bigint;
    reserveB: bigint;
}

export interface Trade {
    poolOwner: string;
    pooladdress: string;
    user: string;
    action: string;
    tokenA: string;
    tokenB: string;
    amountA: ethers.BigNumberish;
    amountB: ethers.BigNumberish;
    share: ethers.BigNumberish;
    datetime: string;
}