import { ethers } from "hardhat";
import { MockERC20 } from "../typechain-types/src/contracts/MockERC20";
import { CurveAMM } from "../typechain-types/src/contracts/CurveAMM";

async function main() {
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const amount = ethers.parseEther("1000");

  // Deploy mock tokens
  const MockToken = await ethers.getContractFactory("MockERC20");
  const token1 = await MockToken.deploy("Token 1", "TK1");
  const token2 = await MockToken.deploy("Token 2", "TK2");

  await token1.waitForDeployment();
  await token2.waitForDeployment();

  // Deploy Curve AMM
  const CurveAMMFactory = await ethers.getContractFactory("CurveAMM");
  const amm = await CurveAMMFactory.deploy(
    await token1.getAddress(),
    await token2.getAddress()
  );

  await amm.waitForDeployment();

  // Mint test tokens
  await token1.mint(signerAddress, amount);
  await token2.mint(signerAddress, amount);

  console.log("Minted test tokens to:", signerAddress);
  console.log("Token 1 address:", await token1.getAddress());
  console.log("Token 2 address:", await token2.getAddress());
  console.log("AMM address:", await amm.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 