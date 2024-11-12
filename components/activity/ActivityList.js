import { List, Card, Tag, Space, Button, Checkbox, Popconfirm, Tooltip } from 'antd';
import { 
  CheckOutlined, 
  ClockCircleOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

export default function ActivityList({ 
  activities, 
  loading, 
  onStatusChange,
  onEdit,
  onDelete,
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

  const formatDate = (dateString) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  const getActionButtons = (activity) => {
    const actions = [
      <Tooltip title="编辑活动" key="edit">
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => onEdit(activity)}
        >
          编辑
        </Button>
      </Tooltip>,
      <Popconfirm
        key="delete"
        title="确定要删除这个活动吗？"
        description="删除后不可恢复，请谨慎操作。"
        onConfirm={() => onDelete(activity.id)}
        okText="确定"
        cancelText="取消"
      >
        <Tooltip title="删除活动">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Tooltip>
      </Popconfirm>
    ];

    if (activity.status !== 2) {
      actions.unshift(
        <Tooltip title="标记为已完成" key="complete">
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => onStatusChange(activity.id, 2)}
          >
            标记完成
          </Button>
        </Tooltip>
      );
    } else {
      actions.unshift(
        <Tooltip title="标记为进行中" key="uncomplete">
          <Button 
            type="default" 
            icon={<ClockCircleOutlined />}
            onClick={() => onStatusChange(activity.id, 1)}
          >
            标记未完成
          </Button>
        </Tooltip>
      );
    }

    return actions;
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '所属银行',
      dataIndex: ['bank', 'name'],
      key: 'bankName',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          0: { text: '未开始', color: 'default' },
          1: { text: '进行中', color: 'processing' },
          2: { text: '已结束', color: 'success' },
        };
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
      },
    },
  ];

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
            actions={getActionButtons(activity)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <img 
                  src={activity.bank.logo} 
                  alt={activity.bank.name}
                  style={{ width: 24, marginRight: 8 }}
                />
                {activity.bank.name}
              </div>
              {activity.reward && (
                <div>奖励：{activity.reward}</div>
              )}
              <div>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                开始：{formatDate(activity.startTime)}
              </div>
              <div>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                截止：{formatDate(activity.endTime)}
              </div>
              {activity.description && (
                <div style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {activity.description}
                </div>
              )}
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
} 