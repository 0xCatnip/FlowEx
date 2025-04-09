import { ethers } from "hardhat";

async function main() {
  // 获取签名者
  const [signer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", signer.address);
  
  // 部署 USDT 和 USDC 代币
  const MockToken = await ethers.getContractFactory("MockERC20");
  const usdt = await MockToken.deploy("USDT", "USDT", 18);
  const usdc = await MockToken.deploy("USDC", "USDC", 18);
  
  await usdt.waitForDeployment();
  await usdc.waitForDeployment();
  
  const usdtAddress = await usdt.getAddress();
  const usdcAddress = await usdc.getAddress();
  
  console.log("USDT deployed to:", usdtAddress);
  console.log("USDC deployed to:", usdcAddress);
  
  // 部署 StablecoinSwap 合约
  const StablecoinSwap = await ethers.getContractFactory("StablecoinSwap");
  const swap = await StablecoinSwap.deploy(usdtAddress, usdcAddress);
  
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("StablecoinSwap deployed to:", swapAddress);
  
  // 铸造一些代币用于测试
  const userAmount = ethers.parseEther("10000"); // 给用户1万代币
  const liquidityAmount = ethers.parseEther("1000"); // 给池子1000代币，减少数量避免余额不足
  const totalAmount = ethers.parseEther("11000"); // 总共铸造11000代币

  // 给用户铸造代币
  console.log("Minting tokens for user...");
  await usdt.mint(signer.address, totalAmount); // 确保有足够的代币添加流动性
  await usdc.mint(signer.address, totalAmount);
  
  // 批准并添加流动性
  console.log("Approving tokens for liquidity...");
  await usdt.approve(swapAddress, liquidityAmount);
  await usdc.approve(swapAddress, liquidityAmount);

  console.log("Adding initial liquidity...");
  await swap.addLiquidity(liquidityAmount, liquidityAmount);
  
  // 查看储备金
  const reserve1 = await swap.reserve1();
  const reserve2 = await swap.reserve2();
  console.log("Reserve1 (USDT):", ethers.formatEther(reserve1));
  console.log("Reserve2 (USDC):", ethers.formatEther(reserve2));

  console.log("User balances:");
  const usdtBalance = await usdt.balanceOf(signer.address);
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("USDT:", ethers.formatEther(usdtBalance));
  console.log("USDC:", ethers.formatEther(usdcBalance));
  
  console.log("Setup complete! Ready for swapping.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 