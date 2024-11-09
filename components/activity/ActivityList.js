import { Table, Tag, Space, Button, message, Spin } from 'antd';
import moment from 'moment';

const ActivityList = ({ activities, onEdit, onDelete, loading }) => {
  const columns = [
    {
      title: '银行',
      dataIndex: ['bank', 'name'],
      key: 'bankName',
    },
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '活动时间',
      key: 'time',
      render: (_, record) => (
        <>
          {moment(record.startTime).format('YYYY-MM-DD HH:mm')}
          <br />
          至
          <br />
          {moment(record.endTime).format('YYYY-MM-DD HH:mm')}
        </>
      ),
    },
    {
      title: '提醒设置',
      key: 'reminder',
      render: (_, record) => {
        const reminderTypes = {
          NONE: '无提醒',
          DAILY: '每天',
          WEEKLY: `每周${record.reminderDay ? `周${record.reminderDay}` : ''}`,
          MONTHLY: `每月${record.reminderDate ? `${record.reminderDate}号` : ''}`
        };
        return record.reminderType !== 'NONE' ? (
          <Tag color="blue">
            {`${reminderTypes[record.reminderType]} ${record.reminderTime}`}
          </Tag>
        ) : '无提醒';
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      <Spin spinning={loading} tip="加载中...">
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          locale={{
            emptyText: '暂无数据'
          }}
        />
      </Spin>
    </div>
  );
};

export default ActivityList; 