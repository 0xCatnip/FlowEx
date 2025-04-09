import React from 'react';
import { CurveAMM } from '../contracts/CurveAMM';
import { Token } from '../contracts/Token';
import LiquidityManager from '../components/LiquidityManager';

interface LiquidityPageProps {
  curveAMM: CurveAMM;
  token1: Token;
  token2: Token;
}

const LiquidityPage: React.FC<LiquidityPageProps> = ({ curveAMM, token1, token2 }) => {
  return (
    <div>
      <LiquidityManager 
        curveAMM={curveAMM}
        token1={token1}
        token2={token2}
      />
    </div>
  );
};

export default LiquidityPage; 