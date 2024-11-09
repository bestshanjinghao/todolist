import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const bankId = searchParams.get('bankId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {};
    
    if (keyword) {
      where.title = { contains: keyword };
    }
    
    if (bankId) {
      where.bankId = parseInt(bankId, 10);
    }
    
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        bank: true,
        reminders: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error('Fetch activities error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // 处理图片数据
    const contentImages = data.content?.map(file => ({
      url: file.response?.url || file.url
    }));

    const activity = await prisma.activity.create({
      data: {
        bankId: data.bankId,
        title: data.title,
        description: data.description,
        reward: data.reward,
        startTime: data.startTime,
        endTime: data.endTime,
        activityType: data.activityType,
        targetAmount: data.targetAmount,
        targetTimes: data.targetTimes,
        minAmount: data.minAmount,
        reminderType: data.reminderType,
        reminderDay: data.reminderDay,
        reminderDate: data.reminderDate,
        reminderTime: data.reminderTime,
        participationLimit: data.participationLimit,
        contentImages: {
          create: contentImages
        }
      },
      include: {
        contentImages: true
      }
    });

    // 如果设置了提醒，创建提醒任务
    if (data.reminderType !== 'NONE') {
      await createReminderTask(activity);
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
} 