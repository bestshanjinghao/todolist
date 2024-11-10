import { CronJob } from 'cron';
import { updateActivityStatus } from './jobs/updateActivityStatus';
import { checkAndSendReminders } from './jobs/activityReminder';

// 每分钟检查一次活动状态
const statusUpdateJob = new CronJob('* * * * *', async () => {
  console.log('Running status update job...');
  try {
    await updateActivityStatus();
  } catch (error) {
    console.error('Status update job failed:', error);
  }
});

// 每分钟检查一次提醒
const reminderJob = new CronJob('* * * * *', async () => {
  console.log('Running reminder check job...');
  try {
    await checkAndSendReminders();
  } catch (error) {
    console.error('Reminder check job failed:', error);
  }
});

export function startScheduler() {
  statusUpdateJob.start();
  reminderJob.start();
  console.log('Scheduler started');
}

export function stopScheduler() {
  statusUpdateJob.stop();
  reminderJob.stop();
  console.log('Scheduler stopped');
} 