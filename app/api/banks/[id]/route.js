import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const bank = await prisma.bank.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (bank) {
      return NextResponse.json(bank);
    } else {
      return NextResponse.json(
        { error: 'Bank not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bank' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const data = await request.json();
    const bank = await prisma.bank.update({
      where: {
        id: parseInt(params.id),
      },
      data,
    });
    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update bank' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // 首先删除该银行的所有活动的提醒
    await prisma.reminder.deleteMany({
      where: {
        activity: {
          bankId: parseInt(params.id),
        },
      },
    });
    
    // 然后删除该银行的所有活动
    await prisma.activity.deleteMany({
      where: {
        bankId: parseInt(params.id),
      },
    });
    
    // 最后删除银行
    await prisma.bank.delete({
      where: {
        id: parseInt(params.id),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete bank' },
      { status: 500 }
    );
  }
} 