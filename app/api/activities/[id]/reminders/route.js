import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        activityId: parseInt(params.id),
      },
      orderBy: {
        remindTime: 'asc',
      },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json(
      { error: '获取提醒列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const data = await request.json();
    const reminder = await prisma.reminder.create({
      data: {
        activityId: parseInt(params.id),
        remindTime: new Date(data.remindTime),
        status: 0,
      },
    });
    return NextResponse.json(reminder);
  } catch (error) {
    return NextResponse.json(
      { error: '创建提醒失败' },
      { status: 500 }
    );
  }
} 