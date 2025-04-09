import { ethers } from 'ethers';
import { Contract } from 'ethers';

export interface Token extends Contract {
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  balanceOf(address: string): Promise<ethers.BigNumber>;
  approve(spender: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction>;
  transfer(to: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction>;
  transferFrom(from: string, to: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction>;
} 