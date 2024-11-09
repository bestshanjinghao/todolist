import { List, Card, Tag, Space, Button, Checkbox } from 'antd';
import { CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';

export default function ActivityList({ 
  activities, 
  loading, 
  onStatusChange,
  selectedIds,
  onSelectChange 
}) {
  const getStatusTag = (status) => {
    const statusMap = {
      0: <Tag color="blue">未开始</Tag>,
      1: <Tag color="green">进行中</Tag>,
      2: <Tag color="gray">已完成</Tag>,
      3: <Tag color="red">已过期</Tag>,
    };
    return statusMap[status];
  };

  return (
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={activities}
      loading={loading}
      renderItem={activity => (
        <List.Item>
          <Card
            title={
              <Space>
                <Checkbox
                  checked={selectedIds.includes(activity.id)}
                  onChange={(e) => onSelectChange(activity.id, e.target.checked)}
                />
                {activity.title}
              </Space>
            }
            extra={getStatusTag(activity.status)}
            actions={[
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={() => onStatusChange(activity.id, 2)}
                disabled={activity.status === 2}
              >
                标记完成
              </Button>
            ]}
          >
            <Space direction="vertical">
              <div>
                <img 
                  src={activity.bank.logo} 
                  alt={activity.bank.name}
                  style={{ width: 24, marginRight: 8 }}
                />
                {activity.bank.name}
              </div>
              <div>奖励：{activity.reward}</div>
              <div>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {new Date(activity.endTime).toLocaleDateString()}截止
              </div>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
} 