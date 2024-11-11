'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Modal, Button, message, Space } from 'antd';
import { PlusOutlined, DownloadOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import ActivityList from './ActivityList';
import ActivityStats from './ActivityStats';
import ActivityForm from './ActivityForm';
import ActivitySearch from './ActivitySearch';
import ActivityCharts from './ActivityCharts';
import ActivityCalendar from './ActivityCalendar';
import moment from 'moment';
import dayjs from 'dayjs';


const { TabPane } = Tabs;

export default function ActivityDashboard() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [banks, setBanks] = useState([]);
  const [filters, setFilters] = useState({});
  const [showCharts, setShowCharts] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    fetchActivities();
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/banks');
      const data = await res.json();
      setBanks(data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    fetchActivities(searchFilters);
  };

  const fetchActivities = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.bankId) queryParams.append('bankId', filters.bankId);
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start);
        queryParams.append('endDate', filters.dateRange.end);
      }

      const res = await fetch(`/api/activities?${queryParams.toString()}`);
      const response = await res.json();
      
      if (response.success && Array.isArray(response.data)) {
        setActivities(response.data);
      } else {
        throw new Error('数据格式不正确');
      }
    } catch (err) {
      setError(err.message);
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleStatusChange = async (activityId, newStatus) => {
    try {
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        message.success('状态更新成功');
        fetchActivities();
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      message.error('状态更新失败');
    }
  };

  const handleAddActivity = async (values) => {
    try {
      const imageUrls = values.images?.fileList
        ? values.images.fileList
            .filter(file => file.status === 'done')
            .map(file => file.response?.data?.url || file.url)
            .filter(Boolean)
        : [];

      const formData = {
        ...values,
        startTime: values.startTime ? new Date(values.startTime).toISOString() : null,
        endTime: values.endTime ? new Date(values.endTime).toISOString() : null,
        reminderTime: values.reminderTime ? moment(values.reminderTime).format('HH:mm') : null,
        bankId: parseInt(values.bankId),
        status: values.status || 0,
        images: imageUrls.join(',')
      };

      console.log('Submitting form data:', formData);

      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await res.json();

      if (result.success) {
        message.success('活动添加成功');
        setIsModalVisible(false);
        fetchActivities();
      } else {
        throw new Error(result.error || '添加失败');
      }
    } catch (error) {
      console.error('Failed to add activity:', error);
      message.error(error.message || '活动添加失败');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/activities/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activities.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('导出成功');
      } else {
        throw new Error('导出失败');
      }
    } catch (error) {
      console.error('Export failed:', error);
      message.error('导出失败');
    }
  };

  const handleSelectChange = (id, checked) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const handleBatchComplete = async () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要操作的活动');
      return;
    }

    Modal.confirm({
      title: '批量完成',
      content: `确定要将选中的 ${selectedIds.length} 个活动标记为已完成吗？`,
      onOk: async () => {
        try {
          await Promise.all(
            selectedIds.map(id =>
              fetch(`/api/activities/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 2 }),
              })
            )
          );
          message.success('批量操作成功');
          setSelectedIds([]);
          fetchActivities();
        } catch (error) {
          message.error('批量操作失败');
        }
      },
    });
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要操作的活动');
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedIds.length} 个活动吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await Promise.all(
            selectedIds.map(id =>
              fetch(`/api/activities/${id}`, {
                method: 'DELETE',
              })
            )
          );
          message.success('批量删除成功');
          setSelectedIds([]);
          fetchActivities();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const handleEditClick = (activity) => {
    setEditingActivity(activity);
    setIsModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      if (!editingActivity?.id) {
        throw new Error('没有选中要编辑的活动');
      }
      const imageUrls = values.images

      debugger
      const formData = {
        ...values,
        startTime: moment(values.startTime).format(),
        endTime: moment(values.endTime).format(),
        reminderTime: values.reminderType !== 'NONE' && values.reminderTime 
          ? dayjs(values.reminderTime).format('HH:mm')
          : null,
        bankId: parseInt(values.bankId),
        images: imageUrls
      };

      console.log('Submitting edit form data:', formData);

      const res = await fetch(`/api/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await res.json();

      if (result.success) {
        message.success('活动编辑成功');
        setIsModalVisible(false);
        setEditingActivity(null);
        fetchActivities();
      } else {
        throw new Error(result.error || '编辑失败');
      }
    } catch (error) {
      console.error('Failed to edit activity:', error);
      message.error(error.message || '活动编辑失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });
      
      const result = await res.json();
      
      if (result.success) {
        message.success('删除成功');
        fetchActivities();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      message.error(error.message || '删除失败');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <ActivitySearch onSearch={handleSearch} banks={banks} />
        <Space>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setViewMode(prev => prev === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? '日历视图' : '列表视图'}
          </Button>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? '隐藏图表' : '显示图表'}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            添加活动
          </Button>
        </Space>
      </div>

      <ActivityStats activities={activities} />
      
      {showCharts && <ActivityCharts activities={activities} />}

      {selectedIds.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button onClick={handleBatchComplete}>
              批量完成
            </Button>
            <Button danger onClick={handleBatchDelete}>
              批量删除
            </Button>
          </Space>
        </div>
      )}

      {viewMode === 'list' ? (
        <Tabs defaultActiveKey="1">
          <TabPane tab="进行中" key="1">
            <ActivityList 
              activities={(activities || []).filter(a => a.status === 1)}
              loading={loading}
              onStatusChange={handleStatusChange}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </TabPane>
          <TabPane tab="未开始" key="2">
            <ActivityList 
              activities={(activities || []).filter(a => a.status === 0)}
              loading={loading}
              onStatusChange={handleStatusChange}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </TabPane>
          <TabPane tab="已完成" key="3">
            <ActivityList 
              activities={(activities || []).filter(a => a.status === 2)}
              loading={loading}
              onStatusChange={handleStatusChange}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </TabPane>
        </Tabs>
      ) : (
        <ActivityCalendar activities={activities} />
      )}

      <Modal
        title={editingActivity ? "编辑活动" : "添加新活动"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingActivity(null);
        }}
        footer={null}
        width={800}
      >
        <ActivityForm 
          onSubmit={editingActivity ? handleEdit : handleAddActivity}
          initialValues={editingActivity}
        />
      </Modal>
    </div>
  );
} 