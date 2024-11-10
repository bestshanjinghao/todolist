import { Card, Row, Col } from 'antd';
import { Pie, Line } from '@ant-design/plots';
import moment from 'moment';

export default function ActivityCharts({ activities }) {
  // 状态分布数据
  const statusData = [
    { type: '未开始', value: activities.filter(a => a.status === 0).length },
    { type: '进行中', value: activities.filter(a => a.status === 1).length },
    { type: '已完成', value: activities.filter(a => a.status === 2).length },
    { type: '已过期', value: activities.filter(a => a.status === 3).length },
  ].filter(item => item.value > 0);

  // 按银行分组数据
  const bankData = activities.reduce((acc, curr) => {
    const bank = curr.bank.name;
    acc[bank] = (acc[bank] || 0) + 1;
    return acc;
  }, {});

  const bankChartData = Object.entries(bankData).map(([name, value]) => ({
    type: name,
    value
  }));

  // 活动趋势数据（最近12个月）
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const month = moment().subtract(i, 'months');
    return {
      month: month.format('YYYY-MM'),
      count: activities.filter(a => 
        moment(a.startTime).format('YYYY-MM') === month.format('YYYY-MM')
      ).length
    };
  }).reverse();

  const pieConfig = {
    data: statusData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      content: '{name}\n{percentage}',
    },
    legend: {
      position: 'bottom'
    }
  };

  const bankPieConfig = {
    data: bankChartData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      content: '{name}\n{percentage}',
    },
    legend: {
      position: 'bottom'
    }
  };

  const lineConfig = {
    data: trendData,
    xField: 'month',
    yField: 'count',
    smooth: true,
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    xAxis: {
      label: {
        formatter: (v) => moment(v).format('MM月')
      }
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="活动状态分布">
            <Pie {...pieConfig} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="银行活动分布">
            <Pie {...bankPieConfig} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="活动数量趋势">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
} 