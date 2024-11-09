import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const bankId = searchParams.get('bankId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const where = {};
    
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (bankId) {
      where.bankId = parseInt(bankId);
    }

    if (status !== null && status !== undefined) {
      where.status = parseInt(status);
    }

    if (startDate) {
      where.startTime = {
        ...where.startTime,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      where.endTime = {
        ...where.endTime,
        lte: new Date(endDate)
      };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        bank: true,
        reminders: true,
      },
      orderBy: [
        { status: 'asc' },
        { endTime: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // 格式化日期
    const formattedActivities = activities.map(activity => ({
      ...activity,
      startTime: activity.startTime.toISOString(),
      endTime: activity.endTime.toISOString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
      reminders: activity.reminders.map(reminder => ({
        ...reminder,
        remindTime: reminder.remindTime.toISOString(),
        createdAt: reminder.createdAt.toISOString(),
        updatedAt: reminder.updatedAt.toISOString(),
      }))
    }));

    return NextResponse.json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '获取活动列表失败'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // 添加数据验证
    if (!data.title?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: '活动标题不能为空' 
      }, { status: 400 });
    }
    
    if (!data.bankId) {
      return NextResponse.json({ 
        success: false, 
        error: '请选择银行' 
      }, { status: 400 });
    }
    
    if (!data.endTime) {
      return NextResponse.json({ 
        success: false, 
        error: '请设置截止时间' 
      }, { status: 400 });
    }

    // 验证日期逻辑
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (endTime < startTime) {
      return NextResponse.json({ 
        success: false, 
        error: '结束时间不能早于开始时间' 
      }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        bankId: parseInt(data.bankId),
        title: data.title.trim(),
        description: data.description?.trim(),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: parseInt(data.status) || 0,
        reminderType: data.reminderType || 'NONE',
        reminderDay: data.reminderDay ? parseInt(data.reminderDay) : null,
        reminderDate: data.reminderDate ? parseInt(data.reminderDate) : null,
        reminderTime: data.reminderTime || null,
        images: data.images || ''
      },
      include: {
        bank: true
      }
    });

    return NextResponse.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '创建活动失败'
    }, { status: 500 });
  }
} 