import hre from "hardhat";
import { parseEther } from "ethers/lib/utils";

async function main() {
  console.log("Deploying contracts...");

  // Deploy Token1
  const Token = await hre.ethers.getContractFactory("MockERC20");
  const token1 = await Token.deploy("Token One", "TKN1");
  await token1.deployed();
  console.log(`Token1 deployed to: ${token1.address}`);

  // Deploy Token2
  const token2 = await Token.deploy("Token Two", "TKN2");
  await token2.deployed();
  console.log(`Token2 deployed to: ${token2.address}`);

  // Deploy CurveAMM
  const CurveAMM = await hre.ethers.getContractFactory("CurveAMM");
  const curveAMM = await CurveAMM.deploy(token1.address, token2.address);
  await curveAMM.deployed();
  console.log(`CurveAMM deployed to: ${curveAMM.address}`);

  // Mint tokens to deployer for testing
  const [deployer] = await hre.ethers.getSigners();
  const mintAmount = parseEther("10000");
  
  console.log("Minting test tokens to deployer...");
  await token1.mint(deployer.address, mintAmount);
  await token2.mint(deployer.address, mintAmount);
  
  console.log("Deployment completed!");
  console.log("");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log(`NEXT_PUBLIC_AMM_CONTRACT_ADDRESS=${curveAMM.address}`);
  console.log(`NEXT_PUBLIC_TOKEN1_ADDRESS=${token1.address}`);
  console.log(`NEXT_PUBLIC_TOKEN2_ADDRESS=${token2.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 