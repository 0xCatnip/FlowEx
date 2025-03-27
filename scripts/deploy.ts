import { ethers } from "hardhat";

async function main() {
  // Deploy mock ERC20 tokens for testing
  const MockToken = await ethers.getContractFactory("MockERC20");
  const token1 = await MockToken.deploy("Token 1", "TK1");
  const token2 = await MockToken.deploy("Token 2", "TK2");

  await token1.waitForDeployment();
  await token2.waitForDeployment();

  console.log("Mock tokens deployed to:", {
    token1: await token1.getAddress(),
    token2: await token2.getAddress(),
  });

  // Deploy CurveAMM contract
  const CurveAMM = await ethers.getContractFactory("CurveAMM");
  const amm = await CurveAMM.deploy(
    await token1.getAddress(),
    await token2.getAddress()
  );

  await amm.waitForDeployment();

  console.log("CurveAMM deployed to:", await amm.getAddress());

  // Mint some tokens for testing
  const [signer] = await ethers.getSigners();
  const amount = ethers.parseEther("1000");

  await token1.mint(signer.address, amount);
  await token2.mint(signer.address, amount);

  console.log("Minted test tokens to:", signer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 