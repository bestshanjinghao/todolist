import { Card, Row, Col, Statistic } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import moment from 'moment';

export default function ActivityStats({ activities }) {
  const stats = {
    total: activities.length,
    notStarted: activities.filter(a => a.status === 0).length,
    inProgress: activities.filter(a => a.status === 1).length,
    completed: activities.filter(a => a.status === 2).length,
    expired: activities.filter(a => a.status === 3).length,
    thisMonth: activities.filter(a => 
      moment(a.startTime).isSame(moment(), 'month') || 
      moment(a.endTime).isSame(moment(), 'month')
    ).length,
    needReminder: activities.filter(a => a.reminderType !== 'NONE').length
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总活动数"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="未开始"
              value={stats.notStarted}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已过期"
              value={stats.expired}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="本月活动"
              value={stats.thisMonth}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
} 