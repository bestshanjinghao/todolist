const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 创建测试银行
  const banks = await Promise.all([
    prisma.bank.create({
      data: {
        name: '工商银行',
        logo: '/banks/icbc.png',
        status: 1
      },
    }),
    prisma.bank.create({
      data: {
        name: '建设银行',
        logo: '/banks/ccb.png',
        status: 1
      },
    }),
    prisma.bank.create({
      data: {
        name: '农业银行',
        logo: '/banks/abc.png',
        status: 1
      },
    }),
    prisma.bank.create({
      data: {
        name: '中国银行',
        logo: '/banks/boc.png',
        status: 1
      },
    }),
  ]);

  // 获取当前时间
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 生成测试活动数据
  const activities = [
    // 进行中的活动
    {
      bankId: banks[0].id,
      title: '工行信用卡积分兑换',
      description: '工商银行信用卡积分兑换活动，每日10点开抢',
      startTime: today,
      endTime: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30天后
      status: 1,
      images: '/activities/points.jpg',
    },
    {
      bankId: banks[1].id,
      title: '龙卡星期六',
      description: '建行龙卡持卡人每周六专享优惠',
      startTime: today,
      endTime: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000), // 90天后
      status: 1,
      images: '/activities/ccb-saturday.jpg',
    },
    // 未开始的活动
    {
      bankId: banks[2].id,
      title: '农行月末理财',
      description: '每月月末理财产品优惠活动',
      startTime: new Date(today.getFullYear(), today.getMonth() + 1, 25), // 下月25号
      endTime: new Date(today.getFullYear(), today.getMonth() + 1, 31),
      status: 0,
      images: '/activities/finance.jpg',
    },
    {
      bankId: banks[3].id,
      title: '中行双节特惠',
      description: '中秋国庆双节特别优惠活动',
      startTime: new Date(2024, 8, 15), // 9月15日
      endTime: new Date(2024, 9, 7),    // 10月7日
      status: 0,
      images: '/activities/festival.jpg',
    },
    // 已结束的活动
    {
      bankId: banks[0].id,
      title: '开工季特惠',
      description: '新年开工季特别优惠活动',
      startTime: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000), // 60天前
      endTime: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),   // 30天前
      status: 2,
      images: '/activities/work.jpg',
    },
  ];

  // 创建活动
  for (const activityData of activities) {
    await prisma.activity.create({
      data: activityData,
    });
  }

  console.log('测试数据创建成功！');
}

main()
  .catch((e) => {
    console.error('测试数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });