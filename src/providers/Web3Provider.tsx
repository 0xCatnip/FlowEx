import React, { ReactNode } from 'react';

interface Web3ProviderWrapperProps {
  children: ReactNode;
}

const Web3ProviderWrapper: React.FC<Web3ProviderWrapperProps> = ({ children }) => {
  return (
    <>{children}</>
  );
};

export default Web3ProviderWrapper; 