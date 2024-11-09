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
      return NextResponse.json(activity);
    } else {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const data = await request.json();
    const activity = await prisma.activity.update({
      where: {
        id: parseInt(params.id),
      },
      data,
    });
    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update activity' },
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