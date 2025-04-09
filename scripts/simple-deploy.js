// 简单部署脚本
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  try {
    console.log("开始部署合约...");

    // 连接到本地节点
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    
    // 读取合约ABI和字节码
    const MockERC20Artifact = JSON.parse(fs.readFileSync("./src/contracts/artifacts/src/contracts/MockERC20.sol/MockERC20.json"));
    const CurveAMMArtifact = JSON.parse(fs.readFileSync("./src/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json"));
    
    // 部署Token1
    const token1Factory = new ethers.ContractFactory(
      MockERC20Artifact.abi,
      MockERC20Artifact.bytecode,
      wallet
    );
    const token1 = await token1Factory.deploy("Token One", "TKN1");
    await token1.deployed();
    console.log(`Token1部署成功，地址：${token1.address}`);
    
    // 部署Token2
    const token2Factory = new ethers.ContractFactory(
      MockERC20Artifact.abi,
      MockERC20Artifact.bytecode,
      wallet
    );
    const token2 = await token2Factory.deploy("Token Two", "TKN2");
    await token2.deployed();
    console.log(`Token2部署成功，地址：${token2.address}`);
    
    // 部署CurveAMM
    const curveAMMFactory = new ethers.ContractFactory(
      CurveAMMArtifact.abi,
      CurveAMMArtifact.bytecode,
      wallet
    );
    const curveAMM = await curveAMMFactory.deploy(token1.address, token2.address);
    await curveAMM.deployed();
    console.log(`CurveAMM部署成功，地址：${curveAMM.address}`);
    
    // 为测试铸造代币
    const mintAmount = ethers.utils.parseEther("10000");
    await token1.mint(wallet.address, mintAmount);
    await token2.mint(wallet.address, mintAmount);
    
    console.log("代币铸造成功，数量：10000");
    
    // 更新App.tsx文件
    const appPath = "./src/App.tsx";
    let appContent = fs.readFileSync(appPath, "utf8");
    
    // 替换合约地址
    appContent = appContent.replace(/const curveAMMAddress = 'YOUR_CURVE_AMM_ADDRESS'/, `const curveAMMAddress = '${curveAMM.address}'`);
    appContent = appContent.replace(/const token1Address = 'YOUR_TOKEN1_ADDRESS'/, `const token1Address = '${token1.address}'`);
    appContent = appContent.replace(/const token2Address = 'YOUR_TOKEN2_ADDRESS'/, `const token2Address = '${token2.address}'`);
    
    fs.writeFileSync(appPath, appContent);
    console.log("已更新App.tsx中的合约地址");

    // 生成ABI文件
    const abiDir = "./src/contracts";
    
    if (!fs.existsSync(`${abiDir}/CurveAMM.json`)) {
      fs.writeFileSync(`${abiDir}/CurveAMM.json`, JSON.stringify({ abi: CurveAMMArtifact.abi }, null, 2));
      console.log("已生成CurveAMM.json");
    }
    
    if (!fs.existsSync(`${abiDir}/Token.json`)) {
      fs.writeFileSync(`${abiDir}/Token.json`, JSON.stringify({ abi: MockERC20Artifact.abi }, null, 2));
      console.log("已生成Token.json");
    }
    
    console.log("部署完成！可以启动前端应用了");
    console.log("");
    console.log("合约地址:");
    console.log("-------------------");
    console.log(`CurveAMM: ${curveAMM.address}`);
    console.log(`Token1: ${token1.address}`);
    console.log(`Token2: ${token2.address}`);
  } catch (error) {
    console.error("部署过程中出错:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 