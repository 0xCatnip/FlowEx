import { ethers } from "hardhat";

async function main() {
  // 获取签名者账户
  const [signer] = await ethers.getSigners();
  console.log("Minting tokens to account:", signer.address);

  // 获取合约工厂
  const MockToken = await ethers.getContractFactory("MockERC20");
  
  // 附加到已部署的合约
  const usdt = await MockToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const usdc = await MockToken.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  
  // 铸造代币
  const amount = ethers.parseEther("10000"); // 铸造 10,000 代币
  
  console.log("Minting USDT...");
  await usdt.mint(signer.address, amount);
  
  console.log("Minting USDC...");
  await usdc.mint(signer.address, amount);
  
  // 查看余额
  const usdtBalance = await usdt.balanceOf(signer.address);
  const usdcBalance = await usdc.balanceOf(signer.address);
  
  console.log("USDT balance:", ethers.formatEther(usdtBalance));
  console.log("USDC balance:", ethers.formatEther(usdcBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 