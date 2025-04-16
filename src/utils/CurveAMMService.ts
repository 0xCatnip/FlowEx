import { BigNumberish, Contract, ethers } from "ethers";
import CurveAMMABI from "@/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json";
import ERC20ABI from "@/contracts/artifacts/src/contracts/MockERC20.sol/MockERC20.json"

export class CurveAMMService {
    contract: ethers.Contract;
    erc20Contract: ethers.Contract;
    signer: ethers.Signer;

    constructor(poolAddress: string, signer: ethers.Signer) {
        this.signer = signer;
        this.contract = new ethers.Contract(poolAddress, CurveAMMABI.abi, signer);
        this.erc20Contract = new ethers.Contract(poolAddress, ERC20ABI.abi, signer);
    }

    // 添加流动性
    async addLiquidity(amountA: ethers.BigNumberish, amountB: ethers.BigNumberish, addrA: string, addrB: string) {

        const tokenAContract = new ethers.Contract(addrA, ERC20ABI.abi, this.signer);
        const txA = await tokenAContract.approve(this.contract.getAddress(), amountA);
        await txA.wait();

        const tokenBContract = new ethers.Contract(addrB, ERC20ABI.abi, this.signer);
        const txB = await tokenBContract.approve(this.contract.getAddress(), amountB);
        await txB.wait();

        const tx = await this.contract.addLiquidity(amountA, amountB);
        const receipt = await tx.wait();
        return receipt;
    }

    // 移除流动性
    async removeLiquidity(lpAmount: ethers.BigNumberish) {
        const tx = await this.contract.removeLiquidity(lpAmount);
        return await tx.wait();
    }

    // 执行兑换
    // async swap(inputToken: string, inputAmount: ethers.BigNumberish): Promise<ethers.BigNumberish> {
    //     const tx = await this.contract.swap(inputToken, inputAmount);
    //     const receipt = await tx.wait();
    //     return receipt; // 你也可以解析 event logs 来获取 outputAmount
    // }

    async swap(inputToken: string, inputAmount: ethers.BigNumberish): Promise<ethers.BigNumberish> {
        if (!this.signer) throw new Error("Signer not initialized");

        const tokenContract = new Contract(inputToken, ERC20ABI.abi, this.signer);
        const userAddress = await this.signer.getAddress();

        const allowance = await tokenContract.allowance(userAddress, this.contract.target);

        // 直接用 JS 的 BigInt 比较
        if (allowance < inputAmount) {
            const approveTx = await tokenContract.approve(this.contract.target, inputAmount);
            await approveTx.wait();
        }

        // 执行 swap
        const tx = await this.contract.swap(inputToken, inputAmount);
        const receipt = await tx.wait();

        return receipt;
    }

    // 预测兑换输出 & 手续费
    async previewSwap(inputToken: string, inputAmount: ethers.BigNumberish): Promise<{
        outputAmount: ethers.BigNumberish;
        fee: ethers.BigNumberish;
        expectedOutput: ethers.BigNumberish;
    }> {
        const [outputAmount, fee] = await this.contract.previewSwap(inputToken, inputAmount);

        // 返回值都使用 BigNumber 类型
        const expectedOutput = outputAmount.add(fee);

        return {
            outputAmount,
            fee,
            expectedOutput: expectedOutput
        };
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
    async getTokensAndReserve(): Promise<{ tokenA: string, tokenB: string, reserveA: bigint, reserveB: bigint }> {
        const tokenA = await this.contract.tokenA();
        const reserveA = await this.contract.reserveA();
        const tokenB = await this.contract.tokenB();
        const reserveB = await this.contract.reserveB();
        return { tokenA, tokenB, reserveA, reserveB };
    }

    async predictWithdrawResult(lpAmount: string): Promise<{
        amountA: string;
        amountB: string;
        remainA: string;
        remainB: string;
    }> {
        const lpBig = BigInt(ethers.parseUnits(lpAmount, 18)); // 转换为 bigint
        const totalSupply = BigInt(await this.getTotalSupply());
        const reserveA = BigInt(await this.contract.reserveA());
        const reserveB = BigInt(await this.contract.reserveB());

        const amountA = (reserveA * lpBig) / totalSupply;
        const amountB = (reserveB * lpBig) / totalSupply;
        const remainA = reserveA - amountA;
        const remainB = reserveB - amountB;

        return {
            amountA: ethers.formatUnits(amountA, 18),
            amountB: ethers.formatUnits(amountB, 18),
            remainA: ethers.formatUnits(remainA, 18),
            remainB: ethers.formatUnits(remainB, 18),
        };

    };

    async getTotalSupply(): Promise<BigNumberish> {
        const totalLp = await this.erc20Contract.totalSupply();
        return totalLp;
    }

    async getAllTrades(): Promise<{
        user: string;
        action: string;
        tokenA: string;
        tokenB: string;
        amountA: ethers.BigNumberish;
        amountB: ethers.BigNumberish;
        share: number;
        timestamp: number;
    }[]> {
        const trades = await this.contract.getAllTrades();
        const totalLp = await this.erc20Contract.totalSupply();
        const totalLpNum = Number(ethers.formatUnits(totalLp, 18)); // 格式化为常规数字
        return trades.map((t: any) => {
            const shareNum = Number(ethers.formatUnits(t.share, 18));
            const sharePct = totalLpNum === 0 ? 0 : (shareNum / totalLpNum) * 100;
            return {
                user: t.user,
                action: t.action,
                tokenA: t.tokenA,
                tokenB: t.tokenB,
                amountA: t.amountA,
                amountB: t.amountB,
                // share: t.share,
                share: sharePct,
                timestamp: typeof t.timestamp.toNumber === "function"
                    ? t.timestamp.toNumber()
                    : Number(t.timestamp), // 安全 fallback
            }
        });
    }

}
