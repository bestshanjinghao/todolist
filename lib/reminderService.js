import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

export async function checkReminders() {
  const now = dayjs();
  const currentWeekDay = now.day().toString();
  const currentTime = now.format('HH:mm');

  const activities = await prisma.activity.findMany({
    where: {
      status: 1, // 进行中的活动
      NOT: {
        reminderDays: null,
        reminderTime: null
      }
    }
  });

  for (const activity of activities) {
    const reminderDays = activity.reminderDays.split(',');
    if (
      reminderDays.includes(currentWeekDay) && 
      activity.reminderTime === currentTime
    ) {
      // 发送提醒
      await sendReminder(activity);
    }
  }
}

async function sendReminder(activity) {
  // 实现提醒发送逻辑
  console.log(`发送提醒：${activity.title}`);
} 