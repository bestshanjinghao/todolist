import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import moment from 'moment';
import { startReminderScheduler } from '@/lib/scheduler';

// 在开发环境下启动定时任务
if (process.env.NODE_ENV === 'development') {
  startReminderScheduler();
}

export async function GET(request) {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        bank: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.status,
        images: data.images,
        bank: {
          connect: {
            id: data.bankId
          }
        }
      },
      include: {
        bank: true,
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('创建活动失败:', error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
} 