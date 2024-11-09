import { prisma } from './prisma';
import { scheduleJob } from 'node-schedule';

export async function createReminderTask(activity) {
  const {
    id,
    reminderType,
    reminderDay,
    reminderDate,
    reminderTime
  } = activity;

  let cronExpression;
  const [hour, minute] = reminderTime.split(':');

  switch (reminderType) {
    case 'DAILY':
      cronExpression = `${minute} ${hour} * * *`;
      break;
    case 'WEEKLY':
      cronExpression = `${minute} ${hour} * * ${reminderDay}`;
      break;
    case 'MONTHLY':
      cronExpression = `${minute} ${hour} ${reminderDate} * *`;
      break;
    default:
      return;
  }

  // 创建定时任务
  scheduleJob(cronExpression, async () => {
    // 这里实现提醒逻辑，例如发送通知
    console.log(`Reminder for activity ${id}`);
    // TODO: 实现实际的提醒逻辑（短信、邮件等）
  });
} 