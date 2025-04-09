import React from 'react';
import { Card, Typography, Progress, Row, Col, Statistic } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PoolVisualizationProps {
  token1Symbol: string;
  token2Symbol: string;
  reserve1: string;
  reserve2: string;
  userLiquidity: string;
  totalLiquidity?: string;
}

const PoolVisualization: React.FC<PoolVisualizationProps> = ({
  token1Symbol,
  token2Symbol,
  reserve1,
  reserve2,
  userLiquidity,
  totalLiquidity = '0',
}) => {
  // Calculate proportions for visualization
  const reserve1Value = parseFloat(reserve1);
  const reserve2Value = parseFloat(reserve2);
  const totalValue = reserve1Value + reserve2Value;
  
  const token1Percentage = totalValue === 0 ? 0 : (reserve1Value / totalValue) * 100;
  const token2Percentage = totalValue === 0 ? 0 : (reserve2Value / totalValue) * 100;
  
  // Calculate user's pool share percentage
  const userLiquidityValue = parseFloat(userLiquidity);
  const totalLiquidityValue = parseFloat(totalLiquidity);
  const userSharePercentage = totalLiquidityValue === 0 ? 0 : (userLiquidityValue / totalLiquidityValue) * 100;

  return (
    <Card title={<Title level={4}><PieChartOutlined /> Pool Visualization</Title>}>
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Title level={5}>Pool Composition</Title>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div 
              style={{ 
                width: 16, 
                height: 16, 
                backgroundColor: '#1890ff', 
                marginRight: 8, 
                borderRadius: 2 
              }} 
            />
            <Text>{token1Symbol} ({token1Percentage.toFixed(2)}%)</Text>
          </div>
          <Progress 
            percent={token1Percentage} 
            strokeColor="#1890ff" 
            showInfo={false}
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div 
              style={{ 
                width: 16, 
                height: 16, 
                backgroundColor: '#52c41a', 
                marginRight: 8, 
                borderRadius: 2 
              }} 
            />
            <Text>{token2Symbol} ({token2Percentage.toFixed(2)}%)</Text>
          </div>
          <Progress 
            percent={token2Percentage} 
            strokeColor="#52c41a" 
            showInfo={false}
          />
        </Col>
        
        <Col span={24}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title={`${token1Symbol} Amount`}
                value={reserve1}
                precision={4}
                suffix={token1Symbol}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={`${token2Symbol} Amount`}
                value={reserve2}
                precision={4}
                suffix={token2Symbol}
              />
            </Col>
          </Row>
        </Col>
        
        <Col span={24}>
          <Title level={5}>Your Contribution</Title>
          <Progress
            type="circle"
            percent={userSharePercentage}
            format={(percent) => `${(percent || 0).toFixed(2)}%`}
            width={120}
            style={{ marginBottom: 16 }}
          />
          <div style={{ textAlign: 'center' }}>
            <Text>Your share of the pool</Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PoolVisualization; 