import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
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

    // 设置表头
    worksheet.columns = [
      { header: '活动名称', key: 'title', width: 30 },
      { header: '所属银行', key: 'bankName', width: 20 },
      { header: '开始时间', key: 'startTime', width: 20 },
      { header: '结束时间', key: 'endTime', width: 20 },
      { header: '状态', key: 'status', width: 15 },
      { header: '描述', key: 'description', width: 50 },
    ];

    // 添加数据
    activities.forEach(activity => {
      worksheet.addRow({
        title: activity.title,
        bankName: activity.bank.name,
        startTime: moment(activity.startTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(activity.endTime).format('YYYY-MM-DD HH:mm:ss'),
        status: getStatusText(activity.status),
        description: activity.description,
      });
    });

    // 生成 Excel 文件
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=activities.xlsx',
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function getStatusText(status) {
  const statusMap = {
    0: '未开始',
    1: '进行中',
    2: '已结束',
  };
  return statusMap[status] || '未知';
} 