import { scheduleJob } from 'node-schedule';
import { checkReminders } from './reminderService';

/**
 * 启动提醒调度器
 * 该函数会创建一个每分钟执行一次的定时任务，用于检查提醒事项
 */
export function startReminderScheduler(isDev = false) {
  // 开发环境下每10秒检查一次
  const schedule = isDev ? '*/10 * * * * *' : '* * * * *';
  
  scheduleJob(schedule, async () => {
    try {
      await checkReminders(isDev);
    } catch (error) {
      console.error('Reminder check failed:', error);
    }
  });
}
