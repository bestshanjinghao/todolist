import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/zh_CN';
import 'moment/locale/zh-cn';
import moment from 'moment';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');
// 设置默认时区为北京时间
dayjs.tz.setDefault('Asia/Shanghai');

moment.locale('zh-cn');

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '活动管理系统',
  description: '银行活动管理平台',
};

export default function RootLayout({ children }) {

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
