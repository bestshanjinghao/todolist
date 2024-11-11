import { Card, Row, Col, Statistic } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CalendarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import moment from 'moment';

export default function ActivityStats({ activities }) {
  const stats = {
    total: activities.length,
    ongoing: activities.filter(a => a.status === 1).length,
    upcoming: activities.filter(a => a.status === 0).length,
    completed: activities.filter(a => a.status === 2).length,
  };

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Statistic 
          title="总活动数" 
          value={stats.total} 
          prefix={<AppstoreOutlined />} 
        />
      </Col>
      <Col span={6}>
        <Statistic 
          title="进行中" 
          value={stats.ongoing} 
          prefix={<ClockCircleOutlined />}
          valueStyle={{ color: '#1890ff' }}
        />
      </Col>
      <Col span={6}>
        <Statistic 
          title="未开始" 
          value={stats.upcoming} 
          prefix={<CalendarOutlined />}
          valueStyle={{ color: '#52c41a' }}
        />
      </Col>
      <Col span={6}>
        <Statistic 
          title="已完成" 
          value={stats.completed} 
          prefix={<CheckCircleOutlined />}
          valueStyle={{ color: '#faad14' }}
        />
      </Col>
    </Row>
  );
} 