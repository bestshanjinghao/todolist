import { Spin } from 'antd';

export default function Loading() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Spin size="large" tip="加载中..." />
    </div>
  );
} 