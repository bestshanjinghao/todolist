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
      },
    });
    
    if (activity) {
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
    } else {
      return NextResponse.json(
        { success: false, error: '活动不存在' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { success: false, error },
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
    const id = parseInt(params.id);
    
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
      { error },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const activity = await prisma.activity.update({
      where: {
        id: parseInt(id)
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.status,
        images: data.images,
        reminderDays: data.reminderDays,
        reminderTime: data.reminderTime,
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
    console.error('更新活动失败:', error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
} 