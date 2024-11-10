import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';
import { startScheduler } from '@/lib/scheduler';

moment.locale('zh-cn');

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '活动管理系统',
  description: '银行活动管理平台',
};

export default function RootLayout({ children }) {
  // 在服务器端启动定时任务
  if (typeof window === 'undefined') {
    startScheduler();
  }

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ConfigProvider locale={locale}>
            {children}
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
