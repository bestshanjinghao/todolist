import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    
    if (data.startTime) {
      data.startTime = new Date(data.startTime);
    }
    if (data.endTime) {
      data.endTime = new Date(data.endTime);
    }

    const activity = await prisma.activity.update({
      where: {
        id: parseInt(params.id),
      },
      data,
      include: {
        bank: true,
        reminders: true,
      }
    });

    const formattedActivity = {
      ...activity,
      startTime: activity.startTime.toISOString(),
      endTime: activity.endTime.toISOString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
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