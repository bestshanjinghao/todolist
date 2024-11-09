/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'antd',
    'rc-util',
    'rc-pagination',
    'rc-picker'
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 