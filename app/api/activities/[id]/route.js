import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import moment from 'moment';

export async function GET(request, { params }) {
  try {
    const activity = await prisma.activity.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        bank: true,
        reminders: true,
      },
    });
    
    if (activity) {
      const formattedActivity = {
        ...activity,
        startTime: moment(activity.startTime).format(),
        endTime: moment(activity.endTime).format(),
        createdAt: moment(activity.createdAt).format(),
        updatedAt: moment(activity.updatedAt).format(),
        reminders: activity.reminders.map(reminder => ({
          ...reminder,
          remindTime: moment(reminder.remindTime).format(),
          createdAt: moment(reminder.createdAt).format(),
          updatedAt: moment(reminder.updatedAt).format(),
        }))
      };
      return NextResponse.json({
        success: true,
        data: formattedActivity
      });
    } else {
      return NextResponse.json(
        { success: false, error: '活动不存在' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { success: false, error: '获取活动失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const data = await request.json();
    
    // 处理日期字段
    const updateData = { ...data };
    if (data.startTime) {
      updateData.startTime = moment(data.startTime).toDate();
    }
    if (data.endTime) {
      updateData.endTime = moment(data.endTime).toDate();
    }

    const activity = await prisma.activity.update({
      where: {
        id: parseInt(params.id),
      },
      data: updateData,
      include: {
        bank: true,
        reminders: true,
      }
    });

    const formattedActivity = {
      ...activity,
      startTime: moment(activity.startTime).format(),
      endTime: moment(activity.endTime).format(),
      createdAt: moment(activity.createdAt).format(),
      updatedAt: moment(activity.updatedAt).format(),
    };

    return NextResponse.json({
      success: true,
      data: formattedActivity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    return NextResponse.json(
      { success: false, error: '更新活动失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // 删除相关的图片文件
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { contentImages: true }
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // 删除活动及相关数据
    await prisma.activity.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete activity error:', error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = params;

    // 数据验证
    if (!data.title?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: '活动标题不能为空' 
      }, { status: 400 });
    }

    // 处理日期
    const startTime = moment(data.startTime);
    const endTime = moment(data.endTime);
    
    if (endTime.isBefore(startTime)) {
      return NextResponse.json({ 
        success: false, 
        error: '结束时间不能早于开始时间' 
      }, { status: 400 });
    }

    // 更新活动
    const activity = await prisma.activity.update({
      where: { 
        id: parseInt(id) 
      },
      data: {
        bankId: parseInt(data.bankId),
        title: data.title.trim(),
        description: data.description?.trim(),
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
        status: parseInt(data.status),
        reminderType: data.reminderType || 'NONE',
        reminderDay: data.reminderDay ? parseInt(data.reminderDay) : null,
        reminderDate: data.reminderDate ? parseInt(data.reminderDate) : null,
        reminderTime: data.reminderTime || null,
        images: data.images || '',
        updatedAt: new Date()
      },
      include: {
        bank: true,
        reminders: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...activity,
        startTime: moment(activity.startTime).format(),
        endTime: moment(activity.endTime).format(),
        createdAt: moment(activity.createdAt).format(),
        updatedAt: moment(activity.updatedAt).format()
      }
    });
  } catch (error) {
    console.error('Update activity error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '更新活动失败'
    }, { status: 500 });
  }
} 