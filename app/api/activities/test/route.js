import { NextResponse } from 'next/server';
import { checkReminders, testReminder } from '@/lib/reminderService';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

export async function GET(request) {
  try {
    // 测试模式运行检查
    console.log('开始检查');
    await checkReminders(true);
    console.log('检查完成');
    
    return NextResponse.json({
      success: true,
      message: '检查完成，请查看控制台输出11'
    });
  } catch (error) {
    console.error('测试失败:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(request) {
  try {
    const testActivity = await prisma.activity.create({
      data: {
        title: "测试提醒功能",
        description: "这是一个测试活动",
        startTime: new Date(),
        endTime: new Date(),
        status: 1,
        bankId: 1,  // 确保这是存在的银行ID
        // 设置提醒时间为当前时间后1分钟
        reminderTime: dayjs().add(1, 'minute').format('HH:mm'),
        // 设置提醒日期包含今天
        reminderDays: dayjs().day().toString()
      }
    });

    return NextResponse.json({
      success: true,
      data: testActivity
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
} 