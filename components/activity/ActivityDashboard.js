'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Modal, Input, DatePicker, Space, Select, Radio } from 'antd';
import { SearchOutlined, CalendarOutlined, BarChartOutlined, ExportOutlined, UnorderedListOutlined } from '@ant-design/icons';
import ActivityForm from './ActivityForm';
import ActivityList from './ActivityList';
import ActivityCharts from './ActivityCharts';
import ActivityCalendar from './ActivityCalendar';
import moment from 'moment';

const { RangePicker } = DatePicker;

export default function ActivityDashboard() {
  const [activities, setActivities] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    bankId: undefined,
    dateRange: null,
  });
  const [banks, setBanks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' 或 'calendar'

  useEffect(() => {
    fetchActivities();
    fetchBanks();
  }, [filters]);

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/banks');
      const data = await response.json();
      if (data.success) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error('Fetch banks error:', error);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.bankId) queryParams.append('bankId', filters.bankId);
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange[0].format('YYYY-MM-DD'));
        queryParams.append('endDate', filters.dateRange[1].format('YYYY-MM-DD'));
      }

      const response = await fetch(`/api/activities?${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      } else {
        message.error('获取活动列表失败');
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/activities/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `活动列表_${moment().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('/api/activities', {
        method: editingActivity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok) {
        message.success(`${editingActivity ? '更新' : '创建'}活动成功`);
        setIsModalVisible(false);
        setEditingActivity(null);
        fetchActivities();
      } else {
        message.error(data.error || `${editingActivity ? '更新' : '创建'}活动失败`);
      }
    } catch (error) {
      console.error('Submit activity error:', error);
      message.error(`${editingActivity ? '更新' : '创建'}活动失败`);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个活动吗？',
      onOk: async () => {
        try {
          const response = await fetch(`/api/activities/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            message.success('删除成功');
            fetchActivities();
          } else {
            message.error('删除失败');
          }
        } catch (error) {
          console.error('Delete activity error:', error);
          message.error('删除失败');
        }
      },
    });
  };

  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col flex="auto">
          <Space size="middle">
            <Input
              placeholder="搜索活动名称"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              style={{ width: 200 }}
            />
            <Select
              placeholder="选择银行"
              allowClear
              style={{ width: 200 }}
              value={filters.bankId}
              onChange={(value) => setFilters({ ...filters, bankId: value })}
            >
              {banks.map(bank => (
                <Select.Option key={bank.id} value={bank.id}>
                  {bank.name}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Radio.Group 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="list">
                <UnorderedListOutlined /> 列表视图
              </Radio.Button>
              <Radio.Button value="calendar">
                <CalendarOutlined /> 日历视图
              </Radio.Button>
            </Radio.Group>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => setIsChartVisible(true)}
            >
              数据统计
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出数据
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setEditingActivity(null);
                setIsModalVisible(true);
              }}
            >
              添加活动
            </Button>
          </Space>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        {viewMode === 'list' ? (
          <ActivityList
            activities={activities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        ) : (
          <ActivityCalendar activities={activities} />
        )}
      </div>

      <Modal
        title={editingActivity ? '编辑活动' : '添加活动'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingActivity(null);
        }}
        footer={null}
        width={800}
      >
        <ActivityForm
          onSubmit={handleSubmit}
          initialValues={editingActivity}
        />
      </Modal>

      <Modal
        title="活动数据统计"
        open={isChartVisible}
        onCancel={() => setIsChartVisible(false)}
        footer={null}
        width={1000}
      >
        <ActivityCharts activities={activities} />
      </Modal>
    </Card>
  );
} 