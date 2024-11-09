'use client';

import { Spin } from 'antd';

export default function LoadingSpinner() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '50px' 
    }}>
      <Spin size="large" tip="加载中..." />
    </div>
  );
} 