'use client';

import { Menu } from 'antd';
import { HomeOutlined, BankOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavMenu() {
  const pathname = usePathname();
  
  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">活动管理</Link>,
    },
    {
      key: '/banks',
      icon: <BankOutlined />,
      label: <Link href="/banks">银行管理</Link>,
    },
  ];

  const selectedKey = items.find(item => pathname.startsWith(item.key))?.key || '/';

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[selectedKey]}
      items={items}
    />
  );
} 