import { prisma } from '@/lib/prisma';

export async function updateActivityStatus() {
  const now = new Date();
  
  // 更新已过期的活动
  await prisma.activity.updateMany({
    where: {
      status: {
        in: [0, 1] // 未开始或进行中
      },
      endTime: {
        lt: now
      }
    },
    data: {
      status: 3 // 已过期
    }
  });

  // 更新已开始的活动
  await prisma.activity.updateMany({
    where: {
      status: 0, // 未开始
      startTime: {
        lte: now
      },
      endTime: {
        gt: now
      }
    },
    data: {
      status: 1 // 进行中
    }
  });
} 