import { ethers } from 'ethers';
import { Contract } from 'ethers';

export interface CurveAMM extends Contract {
  token1(): Promise<string>;
  token2(): Promise<string>;
  reserve1(): Promise<ethers.BigNumber>;
  reserve2(): Promise<ethers.BigNumber>;
  totalSupply(): Promise<ethers.BigNumber>;
  balanceOf(address: string): Promise<ethers.BigNumber>;
  
  addLiquidity(
    amount1: ethers.BigNumber,
    amount2: ethers.BigNumber
  ): Promise<ethers.ContractTransaction>;
  
  removeLiquidity(
    liquidity: ethers.BigNumber
  ): Promise<ethers.ContractTransaction>;
  
  swap(
    amountIn: ethers.BigNumber,
    isToken1: boolean
  ): Promise<ethers.ContractTransaction>;
} 