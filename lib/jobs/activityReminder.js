import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function checkAndSendReminders() {
  const now = new Date();
  const activities = await prisma.activity.findMany({
    where: {
      status: {
        in: [0, 1] // 未开始或进行中
      },
      reminderType: {
        not: 'NONE'
      }
    },
    include: {
      bank: true,
      reminders: true
    }
  });

  for (const activity of activities) {
    // 根据提醒类型处理
    if (shouldSendReminder(activity, now)) {
      await sendActivityReminder(activity);
    }
  }
} 