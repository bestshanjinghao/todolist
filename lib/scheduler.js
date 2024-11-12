import { scheduleJob } from 'node-schedule';
import { checkReminders } from './reminderService';

export function startReminderScheduler() {
  // 每分钟检查一次
  scheduleJob('* * * * *', async () => {
    try {
      await checkReminders();
    } catch (error) {
      console.error('Reminder check failed:', error);
    }
  });
} 