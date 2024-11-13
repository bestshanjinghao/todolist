import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

// Server酱推送函数
async function sendServerChan(activity) {
  const sendKey = SCT63161TBG7hA8d810SA9MG7sJe4izBP;
  const url = `https://sctapi.ftqq.com/${sendKey}.send`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `活动提醒：${activity.title}`,
        desp: `### 活动详情\n\n` +
              `**活动名称**：${activity.title}\n\n` +
              `**活动描述**：${activity.description}\n\n` +
              `**开始时间**：${dayjs(activity.startTime).format('YYYY-MM-DD HH:mm')}\n\n` +
              `**结束时间**：${dayjs(activity.endTime).format('YYYY-MM-DD HH:mm')}`
      })
    });

    if (!response.ok) {
      throw new Error(`Server酱推送失败: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Server酱推送成功:', result);
  } catch (error) {
    console.error('Server酱推送出错:', error);
    throw error;
  }
}

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
      // 使用 Server 酱发送提醒
      await sendServerChan(activity);
    }
  }
} 