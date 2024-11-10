import { prisma } from '@/lib/prisma';
import moment from 'moment';

export async function updateActivityStatus() {
  try {
    const now = moment();

    // 更新已过期的活动
    await prisma.activity.updateMany({
      where: {
        status: {
          in: [0, 1] // 未开始或进行中
        },
        endTime: {
          lt: now.toDate()
        }
      },
      data: {
        status: 3, // 已过期
        updatedAt: now.toDate()
      }
    });

    // 更新已开始的活动
    await prisma.activity.updateMany({
      where: {
        status: 0, // 未开始
        startTime: {
          lte: now.toDate()
        },
        endTime: {
          gt: now.toDate()
        }
      },
      data: {
        status: 1, // 进行中
        updatedAt: now.toDate()
      }
    });
  } catch (error) {
    console.error('Update activity status error:', error);
  }
} 