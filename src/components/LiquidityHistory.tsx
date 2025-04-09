import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, Typography, Table, Tag, Empty } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { CurveAMM } from '../contracts/CurveAMM';

const { Title } = Typography;

interface LiquidityEvent {
  txHash: string;
  eventType: 'Add' | 'Remove';
  token1Amount: string;
  token2Amount: string;
  lpAmount: string;
  timestamp: number;
  token1Symbol: string;
  token2Symbol: string;
}

interface LiquidityHistoryProps {
  curveAMM: CurveAMM;
  account: string | null;
  token1Symbol: string;
  token2Symbol: string;
}

const LiquidityHistory: React.FC<LiquidityHistoryProps> = ({ 
  curveAMM, 
  account,
  token1Symbol,
  token2Symbol
}) => {
  const [events, setEvents] = useState<LiquidityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!account || !window.ethereum) return;
      
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        
        // Assuming curveAMM contract has AddLiquidity and RemoveLiquidity events
        const addFilter = curveAMM.filters.AddLiquidity(account);
        const removeFilter = curveAMM.filters.RemoveLiquidity(account);
        
        // Get the last 100 blocks for simplicity (adjust as needed)
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000);
        
        // Fetch events
        const [addEvents, removeEvents] = await Promise.all([
          curveAMM.queryFilter(addFilter, fromBlock),
          curveAMM.queryFilter(removeFilter, fromBlock)
        ]);
        
        // Process events
        const processedEvents = await Promise.all([
          ...addEvents.map(async (event) => {
            const block = await event.getBlock();
            return {
              txHash: event.transactionHash,
              eventType: 'Add' as const,
              token1Amount: ethers.utils.formatEther(event.args?.token1Amount || 0),
              token2Amount: ethers.utils.formatEther(event.args?.token2Amount || 0),
              lpAmount: ethers.utils.formatEther(event.args?.lpAmount || 0),
              timestamp: block.timestamp,
              token1Symbol,
              token2Symbol
            };
          }),
          ...removeEvents.map(async (event) => {
            const block = await event.getBlock();
            return {
              txHash: event.transactionHash,
              eventType: 'Remove' as const,
              token1Amount: ethers.utils.formatEther(event.args?.token1Amount || 0),
              token2Amount: ethers.utils.formatEther(event.args?.token2Amount || 0),
              lpAmount: ethers.utils.formatEther(event.args?.lpAmount || 0),
              timestamp: block.timestamp,
              token1Symbol,
              token2Symbol
            };
          })
        ]);
        
        // Sort by timestamp (newest first)
        processedEvents.sort((a, b) => b.timestamp - a.timestamp);
        
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error fetching liquidity events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [account, curveAMM, token1Symbol, token2Symbol]);
  
  const columns = [
    {
      title: 'Transaction',
      dataIndex: 'txHash',
      key: 'txHash',
      render: (txHash: string) => (
        <a 
          href={`https://etherscan.io/tx/${txHash}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {`${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`}
        </a>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type: string) => (
        <Tag color={type === 'Add' ? 'green' : 'red'}>
          {type === 'Add' ? 'Add Liquidity' : 'Remove Liquidity'}
        </Tag>
      ),
    },
    {
      title: `${token1Symbol} Amount`,
      dataIndex: 'token1Amount',
      key: 'token1Amount',
      render: (amount: string) => `${parseFloat(amount).toFixed(4)} ${token1Symbol}`,
    },
    {
      title: `${token2Symbol} Amount`,
      dataIndex: 'token2Amount',
      key: 'token2Amount',
      render: (amount: string) => `${parseFloat(amount).toFixed(4)} ${token2Symbol}`,
    },
    {
      title: 'LP Amount',
      dataIndex: 'lpAmount',
      key: 'lpAmount',
      render: (amount: string) => `${parseFloat(amount).toFixed(4)} LP`,
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString(),
    },
  ];

  return (
    <Card 
      title={<Title level={4}><HistoryOutlined /> Liquidity History</Title>}
      style={{ marginTop: '24px' }}
    >
      {events.length > 0 ? (
        <Table 
          dataSource={events} 
          columns={columns} 
          rowKey="txHash"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty 
          description={loading ? "Loading history..." : "No liquidity operations found"}
        />
      )}
    </Card>
  );
};

export default LiquidityHistory; 