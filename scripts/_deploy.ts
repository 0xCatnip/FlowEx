const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);

  // 部署 FlowExContract
  const FlowEx = await ethers.getContractFactory("FlowExContract");
  const flowEx = await FlowEx.deploy();
  await flowEx.waitForDeployment();
  console.log("FlowExContract 部署成功:", flowEx.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
