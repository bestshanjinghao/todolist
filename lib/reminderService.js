import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';

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
  // 配置邮件发送器
  const transporter = nodemailer.createTransport({
    // 配置邮件服务器信息
  });

  // 发送提醒邮件
  await transporter.sendMail({
    from: 'your-email@example.com',
    to: 'recipient@example.com',
    subject: `活动提醒：${activity.title}`,
    text: `活动"${activity.title}"即将开始，请注意查看。`,
  });
} 