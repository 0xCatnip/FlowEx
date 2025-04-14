import { ethers, AbiCoder } from 'ethers';
import FlowExABI from "@/contracts/artifacts/src/contracts/FlowEx.sol/FlowExContract.json"

const NEXT_PUBLIC_FLOWEX_ADDRESS = process.env.NEXT_PUBLIC_FLOWEX_ADDRESS!;

export class FlowExService {
    // private signer: ethers.Signer;
    private signer: ethers.Signer;
    private contract: ethers.Contract;

    constructor(signer: ethers.Signer) {
        this.signer = signer;
        this.contract = new ethers.Contract(NEXT_PUBLIC_FLOWEX_ADDRESS, FlowExABI.abi, signer);
    }

    async mintCoin(addr: string, amount: ethers.BigNumberish) {
        try {
            const tx = await this.contract.mintTokenTo(addr, this.signer.getAddress(), amount); // 给当前钱包地址铸造代币
            await tx.wait(); // 等待交易被矿工打包
            console.log(`Minted ${amount.toString()} tokens to address ${this.signer.getAddress()}`);

        } catch (error) {
            console.error("Error minting tokens:", error);
        }
    }

    async addToken(name: string) {
        try {
            const tx = await this.contract.addToken(name);
            console.log(tx);
            await tx.wait();
        } catch (error) {
            console.error("Transaction failed:", error);
        }
    }

    // Remove a token (only FlowEx owner)
    async removeToken(name: string) {
        return await this.contract.removeToken(name);
    }

    // Get all supported tokens
    async getAllTokens(): Promise<{ name: string; tokenAddress: string }[]> {
        const result = await this.contract.getAllTokens();
        return result;
    }

    // Add a new pool for two tokens
    async addPool(tokenA: string, tokenB: string) {
        try {
            // Ensure the addresses are valid Ethereum addresses
            if (!ethers.isAddress(tokenA) || !ethers.isAddress(tokenB)) {
                throw new Error("Selected tokens are not supported, please contact with admin");
            } else {
                const tx = await this.contract.addPool(tokenA, tokenB);
                await tx.wait();
                return tx;
            }
        } catch (error) {
            console.error("Error adding pool:", error);
            throw error;
        }
    }

    // Remove an existing pool (only pool owner)
    async removePool(tokenA: string, tokenB: string) {
        return await this.contract.removePool(tokenA, tokenB);
    }

    // Get all pools
    async getAllPools(): Promise<{ tokenA: string; tokenB: string; poolAddress: string; owner: string }[]> {
        const result = await this.contract.getAllPools();
        return result;
    }

    // Utility to get the contract owner
    async getFlowExOwner(): Promise<string> {
        return await this.contract.flowExOwner();
    }

    // Utility to check if a token is supported
    async isTokenSupported(token: string): Promise<boolean> {
        return await this.contract.tokenExists(token);
    }

    // Utility to get token address by name
    async getTokenByName(name: string): Promise<string> {
        return await this.contract.nameToToken(name);
    }

    // Utility to get pool address by token pair
    async getPoolAddress(tokenA: string, tokenB: string): Promise<string> {
        const abiCoder = new AbiCoder();
        const [a, b] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
        const key = ethers.keccak256(abiCoder.encode(['address', 'address'], [a, b]));
        return await this.contract.poolMap(key);
    }
}
