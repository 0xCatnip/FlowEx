import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Input, Card, Typography, Space, message, Row, Col, Statistic, Divider, Progress, Alert } from 'antd';
import { PlusOutlined, MinusOutlined, SwapOutlined } from '@ant-design/icons';
import { CurveAMM } from '../contracts/CurveAMM';
import { Token } from '../contracts/Token';
import PoolVisualization from './PoolVisualization';
import LiquidityHistory from './LiquidityHistory';

const { Title, Text } = Typography;

interface LiquidityManagerProps {
  curveAMM: CurveAMM;
  token1: Token;
  token2: Token;
}

const LiquidityManager: React.FC<LiquidityManagerProps> = ({ curveAMM, token1, token2 }) => {
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [userLiquidity, setUserLiquidity] = useState('0');
  const [reserves, setReserves] = useState({ reserve1: '0', reserve2: '0' });
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [token1Symbol, setToken1Symbol] = useState('');
  const [token2Symbol, setToken2Symbol] = useState('');
  const [token1Balance, setToken1Balance] = useState('0');
  const [token2Balance, setToken2Balance] = useState('0');
  const [totalLiquidity, setTotalLiquidity] = useState('0');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          loadData(accounts[0]);
        }
      }
      // Load token symbols
      const [symbol1, symbol2, totalSupply] = await Promise.all([
        token1.symbol(), 
        token2.symbol(),
        curveAMM.totalSupply()
      ]);
      setToken1Symbol(symbol1);
      setToken2Symbol(symbol2);
      setTotalLiquidity(ethers.utils.formatEther(totalSupply));
    };
    init();
  }, [token1, token2, curveAMM]);

  const loadData = async (userAccount: string) => {
    try {
      const [userLiquidity, reserve1, reserve2, balance1, balance2] = await Promise.all([
        curveAMM.balanceOf(userAccount),
        curveAMM.reserve1(),
        curveAMM.reserve2(),
        token1.balanceOf(userAccount),
        token2.balanceOf(userAccount),
      ]);
      
      setUserLiquidity(ethers.utils.formatEther(userLiquidity));
      setReserves({
        reserve1: ethers.utils.formatEther(reserve1),
        reserve2: ethers.utils.formatEther(reserve2),
      });
      setToken1Balance(ethers.utils.formatEther(balance1));
      setToken2Balance(ethers.utils.formatEther(balance2));
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load liquidity data');
    }
  };

  const handleAddLiquidity = async () => {
    if (!token1Amount || !token2Amount) {
      message.error('Please enter amounts for both tokens');
      return;
    }

    try {
      setLoading(true);
      const amount1 = ethers.utils.parseEther(token1Amount);
      const amount2 = ethers.utils.parseEther(token2Amount);

      // Approve tokens first
      const approveTx1 = await token1.approve(curveAMM.address, amount1);
      await approveTx1.wait();
      
      const approveTx2 = await token2.approve(curveAMM.address, amount2);
      await approveTx2.wait();

      // Add liquidity
      const tx = await curveAMM.addLiquidity(amount1, amount2);
      await tx.wait();

      message.success('Liquidity added successfully');
      if (account) loadData(account);
      
      // Update total liquidity
      const totalSupply = await curveAMM.totalSupply();
      setTotalLiquidity(ethers.utils.formatEther(totalSupply));
      
      setToken1Amount('');
      setToken2Amount('');
    } catch (error) {
      console.error('Error adding liquidity:', error);
      message.error('Failed to add liquidity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!liquidityAmount) {
      message.error('Please enter liquidity amount');
      return;
    }

    try {
      setLoading(true);
      const amount = ethers.utils.parseEther(liquidityAmount);
      
      const tx = await curveAMM.removeLiquidity(amount);
      await tx.wait();

      message.success('Liquidity removed successfully');
      if (account) loadData(account);
      
      // Update total liquidity
      const totalSupply = await curveAMM.totalSupply();
      setTotalLiquidity(ethers.utils.formatEther(totalSupply));
      
      setLiquidityAmount('');
    } catch (error) {
      console.error('Error removing liquidity:', error);
      message.error('Failed to remove liquidity');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pool share
  const calculatePoolShare = () => {
    const totalLiquidityValue = parseFloat(totalLiquidity);
    const userLiquidityValue = parseFloat(userLiquidity);
    
    if (userLiquidityValue === 0 || totalLiquidityValue === 0) {
      return '0';
    }
    
    return ((userLiquidityValue / totalLiquidityValue) * 100).toFixed(2);
  };

  const poolShare = calculatePoolShare();

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <PoolVisualization 
          token1Symbol={token1Symbol}
          token2Symbol={token2Symbol}
          reserve1={reserves.reserve1}
          reserve2={reserves.reserve2}
          userLiquidity={userLiquidity}
          totalLiquidity={totalLiquidity}
        />
      </Col>
      
      <Col xs={24} lg={12}>
        <Card title={<Title level={4}>Pool Information</Title>} className="pool-info-card">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title={`${token1Symbol} Reserve`}
                value={reserves.reserve1}
                precision={4}
                suffix={token1Symbol}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={`${token2Symbol} Reserve`}
                value={reserves.reserve2}
                precision={4}
                suffix={token2Symbol}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Your Liquidity"
                value={userLiquidity}
                precision={4}
                suffix="LP"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Pool Share"
                value={poolShare}
                precision={2}
                suffix="%"
              />
              <Progress percent={parseFloat(poolShare)} showInfo={false} />
            </Col>
          </Row>

          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title={`Your ${token1Symbol} Balance`}
                value={token1Balance}
                precision={4}
                suffix={token1Symbol}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={`Your ${token2Symbol} Balance`}
                value={token2Balance}
                precision={4}
                suffix={token2Symbol}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title={<Title level={4}>Manage Liquidity</Title>} className="liquidity-action-card">
          <Alert
            message="Provide Liquidity"
            description={`Add both ${token1Symbol} and ${token2Symbol} tokens to the liquidity pool to earn LP tokens, which represent your share of the pool.`}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
          
          <Title level={5}>
            <PlusOutlined /> Add Liquidity
          </Title>
          <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }}>
            <Input
              addonBefore={token1Symbol}
              placeholder={`Enter ${token1Symbol} amount`}
              value={token1Amount}
              onChange={(e) => setToken1Amount(e.target.value)}
            />
            <Input
              addonBefore={token2Symbol}
              placeholder={`Enter ${token2Symbol} amount`}
              value={token2Amount}
              onChange={(e) => setToken2Amount(e.target.value)}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddLiquidity} 
              loading={loading}
              block
            >
              Add Liquidity
            </Button>
          </Space>

          <Divider />

          <Title level={5}>
            <MinusOutlined /> Remove Liquidity
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              addonBefore="LP"
              placeholder="Enter LP token amount"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
            />
            <Button 
              type="primary" 
              danger
              icon={<MinusOutlined />}
              onClick={handleRemoveLiquidity} 
              loading={loading}
              block
            >
              Remove Liquidity
            </Button>
          </Space>
        </Card>
      </Col>
      
      <Col xs={24}>
        <LiquidityHistory 
          curveAMM={curveAMM}
          account={account}
          token1Symbol={token1Symbol}
          token2Symbol={token2Symbol}
        />
      </Col>
    </Row>
  );
};

export default LiquidityManager; 