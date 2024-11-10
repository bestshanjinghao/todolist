import { prisma } from '@/lib/prisma';
import moment from 'moment';

export async function checkAndSendReminders() {
  try {
    const now = moment();
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
      const shouldRemind = await shouldSendReminder(activity, now);
      if (shouldRemind) {
        await createReminder(activity);
      }
    }
  } catch (error) {
    console.error('Check reminders error:', error);
  }
}

async function shouldSendReminder(activity, now) {
  const { reminderType, reminderDay, reminderDate, reminderTime } = activity;
  
  // 检查是否已经发送过今天的提醒
  const todayReminder = activity.reminders.find(r => 
    moment(r.remindTime).format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
  );
  
  if (todayReminder) return false;

  const timeMatch = reminderTime && now.format('HH:mm') === reminderTime;
  
  switch (reminderType) {
    case 'DAILY':
      return timeMatch;
      
    case 'WEEKLY':
      return timeMatch && now.day() === reminderDay;
      
    case 'MONTHLY':
      return timeMatch && now.date() === reminderDate;
      
    default:
      return false;
  }
}

async function createReminder(activity) {
  try {
    await prisma.reminder.create({
      data: {
        activityId: activity.id,
        remindTime: new Date(),
        status: 0
      }
    });
    
    // 这里可以添加发送提醒的具体实现
    // 例如：发送邮件、推送通知等
    
  } catch (error) {
    console.error('Create reminder error:', error);
  }
} 