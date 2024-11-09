import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import moment from 'moment';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        bank: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('活动列表');

    worksheet.columns = [
      { header: '活动名称', key: 'title', width: 30 },
      { header: '银行', key: 'bank', width: 20 },
      { header: '活动类型', key: 'type', width: 15 },
      { header: '目标要求', key: 'target', width: 20 },
      { header: '活动奖励', key: 'reward', width: 30 },
      { header: '开始时间', key: 'startTime', width: 20 },
      { header: '结束时间', key: 'endTime', width: 20 },
      { header: '提醒设置', key: 'reminder', width: 20 },
      { header: '参与限制', key: 'limit', width: 15 },
    ];

    activities.forEach(activity => {
      worksheet.addRow({
        title: activity.title,
        bank: activity.bank.name,
        type: activity.activityType === 'AMOUNT' ? '消费金额' : '刷卡次数',
        target: activity.activityType === 'AMOUNT' 
          ? `满${activity.targetAmount}元`
          : `${activity.targetTimes}次（最低${activity.minAmount}元）`,
        reward: activity.reward,
        startTime: moment(activity.startTime).format('YYYY-MM-DD HH:mm'),
        endTime: moment(activity.endTime).format('YYYY-MM-DD HH:mm'),
        reminder: getReminderText(activity),
        limit: getLimitText(activity.participationLimit),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=activities_${moment().format('YYYY-MM-DD')}.xlsx`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}

function getReminderText(activity) {
  const types = {
    NONE: '无提醒',
    DAILY: '每天',
    WEEKLY: `每周${activity.reminderDay}`,
    MONTHLY: `每月${activity.reminderDate}号`,
  };
  return activity.reminderType === 'NONE' 
    ? types[activity.reminderType]
    : `${types[activity.reminderType]} ${activity.reminderTime}`;
}

function getLimitText(limit) {
  const limits = {
    UNLIMITED: '不限制',
    ONCE_PER_DAY: '每天一次',
    ONCE_PER_WEEK: '每周一次',
    ONCE_PER_MONTH: '每月一次',
  };
  return limits[limit];
} 