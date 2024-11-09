import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        bank: true
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('活动列表');
    
    // 设置表头
    worksheet.columns = [
      { header: '活动名称', key: 'title', width: 30 },
      { header: '银行', key: 'bank', width: 20 },
      { header: '奖励', key: 'reward', width: 20 },
      { header: '开始时间', key: 'startTime', width: 20 },
      { header: '结束时间', key: 'endTime', width: 20 },
      { header: '状态', key: 'status', width: 15 }
    ];

    // 添加数据
    activities.forEach(activity => {
      worksheet.addRow({
        title: activity.title,
        bank: activity.bank.name,
        reward: activity.reward,
        startTime: formatDate(activity.startTime),
        endTime: formatDate(activity.endTime),
        status: getStatusText(activity.status)
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=activities.xlsx'
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