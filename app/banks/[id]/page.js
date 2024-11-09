'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layout, Card, Descriptions, Button, Space, 
  Table, Statistic, Row, Col, message, Spin 
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const { Content } = Layout;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function BankDetail({ params }) {
  const router = useRouter();
  const { id } = params;
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankDetail();
  }, [id]);

  const fetchBankDetail = async () => {
    try {
      const res = await fetch(`/api/banks/${id}`);
      if (!res.ok) {
        throw new Error('银行不存在');
      }
      const data = await res.json();
      setBank(data);
    } catch (error) {
      message.error('获取银行详情失败');
      router.push('/banks');
    } finally {
      setLoading(false);
    }
  };

  const getActivityStats = () => {
    if (!bank?.activities) return [];
    
    const stats = [
      { name: '未开始', value: 0 },
      { name: '进行中', value: 0 },
      { name: '已完成', value: 0 },
      { name: '已过期', value: 0 },
    ];

    bank.activities.forEach(activity => {
      stats[activity.status].value += 1;
    });

    return stats;
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '奖励',
      dataIndex: 'reward',
      key: 'reward',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => ['未开始', '进行中', '已完成', '已过期'][status],
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!bank) {
    return <div>银行不存在</div>;
  }

  return (
    <Content style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => router.push('/banks')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card>
        <Descriptions title="银行信息" column={2}>
          <Descriptions.Item label="银行名称">
            {bank.name}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {bank.status === 1 ? '启用' : '禁用'}
          </Descriptions.Item>
          {bank.logo && (
            <Descriptions.Item label="Logo">
              <img src={bank.logo} alt="bank logo" style={{ width: 100 }} />
            </Descriptions.Item>
          )}
        </Descriptions>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="活动统计">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="总活动数" 
                    value={bank.activities.length} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="进行中活动" 
                    value={bank.activities.filter(a => a.status === 1).length}
                  />
                </Col>
              </Row>
              <div style={{ height: 300, marginTop: 24 }}>
                <PieChart width={400} height={300}>
                  <Pie
                    data={getActivityStats()}
                    cx={200}
                    cy={150}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {getActivityStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="最近活动">
              <Table
                columns={columns}
                dataSource={bank.activities}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </Content>
  );
} 