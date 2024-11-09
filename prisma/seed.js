const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 创建银行数据
  const banks = [
    { name: '中国银行' },
    { name: '华夏银行' },
    { name: '交通银行' },
    { name: '建设银行' },
    { name: '广发银行' },
    { name: '中信银行' },
    { name: '招商银行' },
    { name: '工商银行' },
    { name: '浦发银行' },
  ];

  for (const bank of banks) {
    await prisma.bank.create({
      data: {
        name: bank.name,
        status: 1,
      },
    });
  }

  // 创建示例活动数据
  const activities = [
    {
      bankId: 6, // 中信银行
      title: '双12购物狂欢节',
      description: '12月12日当天网购满减优惠',
      reward: '满3000减300',
      startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15天后
      endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45天后
      status: 0,
      reminders: {
        create: [
          {
            remindTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 提前1天提醒
            status: 0,
          },
        ],
      },
    },
    {
      bankId: 3, // 交通银行
      title: '生日月双倍积分',
      description: '生日当月刷卡享双倍积分',
      reward: '积分翻倍',
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
      status: 2,
    },
    {
      bankId: 7, // 招商银行
      title: '周五五折美食节',
      description: '每周五餐饮类商户满200元享5折优惠',
      reward: '最高优惠100元',
      startTime: new Date(), // 今天
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      status: 1,
      reminders: {
        create: [
          {
            remindTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后提醒
            status: 0,
          },
        ],
      },
    },
  ];

  for (const activity of activities) {
    await prisma.activity.create({
      data: activity,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });