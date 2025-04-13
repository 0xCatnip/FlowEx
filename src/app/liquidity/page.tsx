"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CurveAMMService } from "@/utils/CurveAMMService";
import { FlowExService } from "@/utils/FlowExService";

// 添加你的合约地址
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;

export default function App() {
  const [pools, setPools] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [flowExService, setFlowExService] = useState<FlowExService>();
  const [account, setAccount] = useState<string>("");
  const [newPoolTokenA, setNewPoolTokenA] = useState<string>("");
  const [newPoolTokenB, setNewPoolTokenB] = useState<string>("");

  // 检查连接
  useEffect(() => {
    // 确保在客户端环境下才进行 wallet 连接
    const checkConnection = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const flowExService = new FlowExService(signer);
      const userAddress = await signer.getAddress();
      setFlowExService(flowExService);
      setAccount(userAddress);
      setIsConnected(true);
    };
    checkConnection();
  }, []);

  // 获取所有 Pools
  const getPools = async () => {
    if (!flowExService) return;
    const pools = await flowExService.getAllPools();
    setPools(pools);
  };

  // 创建新池
  const createNewPool = async () => {
    if (!newPoolTokenA || !newPoolTokenB) {
      alert("Please enter both token addresses");
      return;
    }
    try {
      // 调用添加池方法
      if (!flowExService) return;
      await flowExService.addPool(newPoolTokenA, newPoolTokenB);
      alert("Pool created successfully");
      getPools(); // 重新获取 pools
    } catch (err) {
      console.error("Error creating pool:", err);
      alert(err);
    }
  };

  return (
    <div>
      <h1>FlowEx Pool Manager</h1>

      {/* {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected as: {selectedAccount}</p>
          <button onClick={getPools}>Get Pools</button>
        </div>
      )} */}

      <div>
        <h2>Existing Pools</h2>
        <ul>
          {pools.length > 0 ? (
            pools.map((pool, index) => (
              <li key={index}>
                Pool {index + 1}: {pool.tokenA} / {pool.tokenB} - Address:{" "}
                {pool.poolAddress}
              </li>
            ))
          ) : (
            <li>No pools available</li>
          )}
        </ul>
      </div>

      <div>
        <h2>Create New Pool</h2>
        <input
          type="text"
          placeholder="Token A Address"
          value={newPoolTokenA}
          onChange={(e) => setNewPoolTokenA(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token B Address"
          value={newPoolTokenB}
          onChange={(e) => setNewPoolTokenB(e.target.value)}
        />
        <button onClick={createNewPool}>Create Pool</button>
      </div>
    </div>
  );
}
