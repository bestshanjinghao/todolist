import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

// Server酱推送函数
async function sendServerChan(activity) {
  const sendKey = 'SCT63161TBG7hA8d810SA9MG7sJe4izBP';
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



export async function checkReminders(isTest = false) {
  const now = dayjs();
  debugger;
  // 测试模式：打印当前检查的时间
  if (isTest) {
    console.log('当前检查时间:', {
      currentWeekDay: now.day(),
      currentTime: now.format('HH:mm')
    });
  }

  const activities = await prisma.activity.findMany({
    where: {
      status: 1,
      NOT: {
        reminderDays: null,
        reminderTime: null
      }
    }
  });

  // 测试模式：打印找到的活动
  if (isTest) {
    console.log('找到的活动:', activities.map(a => ({
      id: a.id,
      title: a.title,
      reminderDays: a.reminderDays,
      reminderTime: a.reminderTime
    })));
  }

  for (const activity of activities) {
    const reminderDays = activity.reminderDays.split(',');
    if (
      reminderDays.includes(now.day().toString()) && 
      activity.reminderTime === now.format('HH:mm')
    ) {
      // 使用 Server 酱发送提醒
      console.log('准备推送');
      
      await sendServerChan(activity);
    }
  }
} 