import { Row, Col, Card, Statistic } from 'antd';

export default function ActivityStats({ activities }) {
  const getStats = () => {
    return {
      total: activities.length,
      inProgress: activities.filter(a => a.status === 1).length,
      completed: activities.filter(a => a.status === 2).length,
      upcoming: activities.filter(a => a.status === 0).length,
    };
  };

  const stats = getStats();

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="总活动数" value={stats.total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="进行中" value={stats.inProgress} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="已完成" value={stats.completed} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="即将开始" value={stats.upcoming} />
        </Card>
      </Col>
    </Row>
  );
} 