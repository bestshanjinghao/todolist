import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const banks = await prisma.bank.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(banks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch banks' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const bank = await prisma.bank.create({
      data: {
        name: data.name,
        logo: data.logo,
        status: 1,
      },
    });
    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create bank' },
      { status: 500 }
    );
  }
} 