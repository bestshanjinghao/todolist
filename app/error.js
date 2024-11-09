'use client';

import { Button, Result } from 'antd';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <Result
      status="error"
      title="出错了"
      subTitle={error?.message || '抱歉，操作过程中出现了错误'}
      extra={[
        <Button type="primary" key="retry" onClick={reset}>
          重试
        </Button>,
        <Button key="back" onClick={() => window.location.href = '/'}>
          返回首页
        </Button>,
      ]}
    />
  );
} 