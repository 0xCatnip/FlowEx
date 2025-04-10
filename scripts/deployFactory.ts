// scripts/deployFactory.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Factory = await ethers.getContractFactory("CurveAMMFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("CurveAMMFactory deployed at:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
