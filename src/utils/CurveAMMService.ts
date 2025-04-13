import { ethers } from "ethers";
import CurveAMMABI from "@/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json"; // 需替换为你的 ABI 路径

export class CurveAMMService {
  contract: ethers.Contract;
  signer: ethers.Signer;

  constructor(poolAddress: string, signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(poolAddress, CurveAMMABI.abi, signer);
  }

  // 添加流动性
  async addLiquidity(amountA: ethers.BigNumberish, amountB: ethers.BigNumberish) {
    const tx = await this.contract.addLiquidity(amountA, amountB);
    return await tx.wait();
  }

  // 移除流动性
  async removeLiquidity(lpAmount: ethers.BigNumberish) {
    const tx = await this.contract.removeLiquidity(lpAmount);
    return await tx.wait();
  }

  // 执行兑换
  async swap(inputToken: string, inputAmount: ethers.BigNumberish): Promise<ethers.BigNumberish> {
    const tx = await this.contract.swap(inputToken, inputAmount);
    const receipt = await tx.wait();
    return receipt; // 你也可以解析 event logs 来获取 outputAmount
  }

  // 预测兑换输出 & 手续费
  async previewSwap(inputToken: string, inputAmount: ethers.BigNumberish): Promise<{ outputAmount: ethers.BigNumberish, fee: ethers.BigNumberish }> {
    const [outputAmount, fee] = await this.contract.previewSwap(inputToken, inputAmount);
    return { outputAmount, fee };
  }

  // 预测兑换后的储备
  async previewReservesAfterSwap(inputToken: string, inputAmount: ethers.BigNumberish): Promise<{ newReserveA: ethers.BigNumberish, newReserveB: ethers.BigNumberish }> {
    const [newReserveA, newReserveB] = await this.contract.previewReservesAfterSwap(inputToken, inputAmount);
    return { newReserveA, newReserveB };
  }

  // 获取当前储备
  async getReserves(): Promise<{ reserveA: ethers.BigNumberish, reserveB: ethers.BigNumberish }> {
    const reserveA = await this.contract.reserveA();
    const reserveB = await this.contract.reserveB();
    return { reserveA, reserveB };
  }

  // 获取 LP 总供应
  async getTotalLPSupply(): Promise<ethers.BigNumberish> {
    return await this.contract.totalSupply();
  }

  // 获取当前 feeRate
  async getFeeRate(): Promise<ethers.BigNumberish> {
    return await this.contract.feeRate();
  }

  // 获取 token 地址
  async getTokens(): Promise<{ tokenA: string, tokenB: string }> {
    const tokenA = await this.contract.tokenA();
    const tokenB = await this.contract.tokenB();
    return { tokenA, tokenB };
  }
}
