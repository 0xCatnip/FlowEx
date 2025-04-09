import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Button } from 'antd';
import { ethers } from 'ethers';
import { CurveAMM } from '../contracts/CurveAMM';
import { Token } from '../contracts/Token';

const { Title, Text } = Typography;

interface DebugInfoProps {
  curveAMM: CurveAMM | null;
  token1: Token | null;
  token2: Token | null;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ curveAMM, token1, token2 }) => {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [token1Info, setToken1Info] = useState<any>(null);
  const [token2Info, setToken2Info] = useState<any>(null);
  const [ammInfo, setAmmInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugInfo = async () => {
    if (!window.ethereum) return;
    
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      
      // 网络信息
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      setNetworkInfo({
        chainId: network.chainId,
        name: network.name,
        blockNumber
      });
      
      // Token1信息
      if (token1) {
        try {
          const symbol = await token1.symbol();
          const name = await token1.name();
          setToken1Info({
            symbol,
            name,
            address: token1.address
          });
        } catch (error) {
          console.error('Token1信息获取失败:', error);
          setToken1Info({ error: '获取失败' });
        }
      }
      
      // Token2信息
      if (token2) {
        try {
          const symbol = await token2.symbol();
          const name = await token2.name();
          setToken2Info({
            symbol,
            name,
            address: token2.address
          });
        } catch (error) {
          console.error('Token2信息获取失败:', error);
          setToken2Info({ error: '获取失败' });
        }
      }
      
      // AMM信息
      if (curveAMM) {
        try {
          const reserve1 = await curveAMM.reserve1();
          const reserve2 = await curveAMM.reserve2();
          setAmmInfo({
            address: curveAMM.address,
            reserve1: ethers.utils.formatEther(reserve1),
            reserve2: ethers.utils.formatEther(reserve2)
          });
        } catch (error) {
          console.error('AMM信息获取失败:', error);
          setAmmInfo({ error: '获取失败' });
        }
      }
    } catch (error) {
      console.error('Debug信息获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="调试信息" extra={<Button onClick={fetchDebugInfo} loading={loading}>刷新</Button>}>
      <Descriptions title="网络信息" bordered>
        {networkInfo ? (
          <>
            <Descriptions.Item label="链ID">{networkInfo.chainId}</Descriptions.Item>
            <Descriptions.Item label="网络名称">{networkInfo.name}</Descriptions.Item>
            <Descriptions.Item label="当前区块">{networkInfo.blockNumber}</Descriptions.Item>
          </>
        ) : (
          <Descriptions.Item label="状态">未连接</Descriptions.Item>
        )}
      </Descriptions>
      
      <Title level={5} style={{ marginTop: 16 }}>合约状态</Title>
      
      <Text strong>Token1:</Text>
      {token1Info ? (
        <p>
          {token1Info.error ? 
            `错误: ${token1Info.error}` : 
            `${token1Info.name} (${token1Info.symbol}) - ${token1Info.address}`
          }
        </p>
      ) : (
        <p>未初始化</p>
      )}
      
      <Text strong>Token2:</Text>
      {token2Info ? (
        <p>
          {token2Info.error ? 
            `错误: ${token2Info.error}` : 
            `${token2Info.name} (${token2Info.symbol}) - ${token2Info.address}`
          }
        </p>
      ) : (
        <p>未初始化</p>
      )}
      
      <Text strong>CurveAMM:</Text>
      {ammInfo ? (
        <p>
          {ammInfo.error ? 
            `错误: ${ammInfo.error}` : 
            `地址: ${ammInfo.address}, Reserve1: ${ammInfo.reserve1}, Reserve2: ${ammInfo.reserve2}`
          }
        </p>
      ) : (
        <p>未初始化</p>
      )}
    </Card>
  );
};

export default DebugInfo; 