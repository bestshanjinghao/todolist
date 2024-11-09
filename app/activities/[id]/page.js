'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layout, Card, Descriptions, Button, Space, Modal, 
  message, Timeline, Divider, Spin 
} from 'antd';
import { 
  ClockCircleOutlined, EditOutlined, 
  DeleteOutlined, BellOutlined, ArrowLeftOutlined 
} from '@ant-design/icons';
import ActivityForm from '@/components/activity/ActivityForm';
import ReminderForm from '@/components/activity/ReminderForm';

const { Content } = Layout;

export default function ActivityDetail({ params }) {
  const router = useRouter();
  const { id } = params;
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      const res = await fetch(`/api/activities/${id}`);
      if (!res.ok) {
        throw new Error('活动不存在');
      }
      const data = await res.json();
      setActivity(data);
    } catch (error) {
      message.error('获取活动详情失败');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (res.ok) {
        message.success('活动更新成功');
        setIsEditModalVisible(false);
        fetchActivityDetail();
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      message.error('活动更新失败');
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个活动吗？此操作不可恢复。',
      onOk: async () => {
        try {
          const res = await fetch(`/api/activities/${id}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            message.success('活动删除成功');
            router.push('/');
          } else {
            throw new Error('删除失败');
          }
        } catch (error) {
          message.error('活动删除失败');
        }
      },
    });
  };

  const handleAddReminder = async (values) => {
    try {
      const res = await fetch(`/api/activities/${id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (res.ok) {
        message.success('提醒设置成功');
        setIsReminderModalVisible(false);
        fetchActivityDetail();
      } else {
        throw new Error('设置失败');
      }
    } catch (error) {
      message.error('提醒设置失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return <div>活动不存在</div>;
  }

  return (
    <Content style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => router.push('/')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card
        title={activity.title}
        extra={
          <Space>
            <Button 
              icon={<BellOutlined />} 
              onClick={() => setIsReminderModalVisible(true)}
            >
              设置提醒
            </Button>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => setIsEditModalVisible(true)}
            >
              编辑
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        }
      >
        <Descriptions column={2}>
          <Descriptions.Item label="银行">
            {activity.bank.name}
          </Descriptions.Item>
          <Descriptions.Item label="奖励">
            {activity.reward}
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {new Date(activity.startTime).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {new Date(activity.endTime).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {['未开始', '进行中', '已完成', '已过期'][activity.status]}
          </Descriptions.Item>
        </Descriptions>

        {activity.description && (
          <>
            <Divider orientation="left">活动描述</Divider>
            <p>{activity.description}</p>
          </>
        )}

        <Divider orientation="left">提醒时间</Divider>
        <Timeline>
          {activity.reminders.map(reminder => (
            <Timeline.Item 
              key={reminder.id}
              dot={<ClockCircleOutlined />}
              color={reminder.status === 0 ? "blue" : "green"}
            >
              {new Date(reminder.remindTime).toLocaleString()}
              {reminder.status === 1 && " (已提醒)"}
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      <Modal
        title="编辑活动"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <ActivityForm 
          onSubmit={handleEdit}
          initialValues={activity}
        />
      </Modal>

      <Modal
        title="设置提醒"
        open={isReminderModalVisible}
        onCancel={() => setIsReminderModalVisible(false)}
        footer={null}
      >
        <ReminderForm onSubmit={handleAddReminder} />
      </Modal>
    </Content>
  );
} 