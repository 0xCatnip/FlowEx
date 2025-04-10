import { ethers } from "hardhat";  // Changed from 'hre' import
import { parseEther } from "ethers";

async function main() {
  console.log("Deploying contracts...");

  // 1. Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 2. Deploy Tokens
  const Token = await ethers.getContractFactory("MockERC20");
  
  console.log("Deploying Token1...");
  const token1 = await Token.deploy("Token One", "TKN1");
  await token1.waitForDeployment();
  const token1Address = await token1.getAddress();
  console.log(`Token1 deployed to: ${token1Address}`);

  console.log("Deploying Token2...");
  const token2 = await Token.deploy("Token Two", "TKN2");
  await token2.waitForDeployment();
  const token2Address = await token2.getAddress();
  console.log(`Token2 deployed to: ${token2Address}`);

  // 3. Deploy the CurveMath library
  const CurveMath = await ethers.getContractFactory("CurveMath");
  const curveMath = await CurveMath.deploy();
  const curveMathAddress = await curveMath.getAddress();
  console.log(`CurveMath library deployed to: ${curveMathAddress}`);

  // 4. Link the library and deploy the CurveAMM contract
  const CurveAMMFactory = await ethers.getContractFactory("CurveAMM", {
    libraries: {
      CurveMath: curveMathAddress,
    },
  });

  const curveAMM = await CurveAMMFactory.deploy(token1Address, token2Address);
  await curveAMM.waitForDeployment();
  const ammAddress = await curveAMM.getAddress();
  console.log(`CurveAMM deployed to: ${ammAddress}`);

  // 5. Mint tokens (with transaction waits)
  const mintAmount = parseEther("10000");
  console.log(`Minting ${ethers.formatEther(mintAmount)} tokens to deployer...`);
  
  await (await token1.mint(deployer.address, mintAmount)).wait();  // Added await+parentheses
  await (await token2.mint(deployer.address, mintAmount)).wait();

  // 6. Output
  console.log("\nDeployment completed!");
  console.log("-------------------");
  console.log(`export NEXT_PUBLIC_AMM_CONTRACT_ADDRESS="${ammAddress}"`);
  console.log(`export NEXT_PUBLIC_TOKEN1_ADDRESS="${token1Address}"`);
  console.log(`export NEXT_PUBLIC_TOKEN2_ADDRESS="${token2Address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});