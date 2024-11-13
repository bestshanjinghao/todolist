import { scheduleJob } from 'node-schedule';
import { checkReminders } from './reminderService';

/**
 * 启动提醒调度器
 * 该函数会创建一个每分钟执行一次的定时任务，用于检查提醒事项
 */
export function startReminderScheduler() {
  // 每分钟检查一次
  scheduleJob('* * * * *', async () => {
    try {
      // 调用 checkReminders 函数检查提醒事项
      await checkReminders();
    } catch (error) {
      // 如果检查提醒事项失败，记录错误信息
      console.error('Reminder check failed:', error);
    }
  });
}
