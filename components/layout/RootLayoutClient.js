'use client';

import { ConfigProvider, Layout as AntLayout } from 'antd';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import NavMenu from '@/components/layout/NavMenu';
import zhCN from 'antd/locale/zh_CN';

const RootLayoutClient = ({ children }) => {
  return (
    <StyledComponentsRegistry>
      <ConfigProvider locale={zhCN}>
        <AntLayout style={{ minHeight: '100vh' }}>
          <AntLayout.Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo" style={{ color: 'white', fontSize: '18px', marginRight: '30px' }}>
              信用卡活动管理
            </div>
            <NavMenu />
          </AntLayout.Header>
          <AntLayout.Content>
            {children}
          </AntLayout.Content>
        </AntLayout>
      </ConfigProvider>
    </StyledComponentsRegistry>
  );
};

export default RootLayoutClient; 