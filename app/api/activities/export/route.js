import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import moment from 'moment';

export async function GET(request) {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        bank: true,
        reminders: true
      },
      orderBy: [
        { status: 'asc' },
        { endTime: 'asc' }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('活动列表');
    
    // 设置表头
    worksheet.columns = [
      { header: '活动名称', key: 'title', width: 30 },
      { header: '银行', key: 'bank', width: 20 },
      { header: '状态', key: 'status', width: 15 },
      { header: '开始时间', key: 'startTime', width: 20 },
      { header: '结束时间', key: 'endTime', width: 20 },
      { header: '提醒类型', key: 'reminderType', width: 15 },
      { header: '提醒时间', key: 'reminderTime', width: 15 },
      { header: '描述', key: 'description', width: 50 }
    ];

    // 添加数据
    activities.forEach(activity => {
      worksheet.addRow({
        title: activity.title,
        bank: activity.bank.name,
        status: ['未开始', '进行中', '已完成', '已过期'][activity.status],
        startTime: moment(activity.startTime).format('YYYY-MM-DD HH:mm'),
        endTime: moment(activity.endTime).format('YYYY-MM-DD HH:mm'),
        reminderType: {
          'NONE': '不提醒',
          'DAILY': '每日提醒',
          'WEEKLY': '每周提醒',
          'MONTHLY': '每月提醒'
        }[activity.reminderType],
        reminderTime: activity.reminderTime || '-',
        description: activity.description || '-'
      });
    });

    // 设置样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 生成 Excel 文件
    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=activities-${moment().format('YYYY-MM-DD')}.xlsx`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '导出失败' 
    }, { status: 500 });
  }
} 