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
      console.error('获取活动列表失败:', err);
      setError(err.message);
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Dashboard useEffect 执行');
    fetchActivities();
    fetchBanks();
  }, [fetchActivities]);

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

  const handleAdd = async (data) => {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          status: (() => {
            const now = new Date();
            const start = new Date(data.startTime);
            const end = new Date(data.endTime);
            
            if (now < start) return 0; // 未开始
            if (now >= start && now <= end) return 1; // 进行中
            if (now > end) return 3; // 已过期
          })(),
          images: data.images,
          bankId: data.bankId,
        }),
      });

      if (!res.ok) throw new Error('添加活动失败');
      
      message.success('添加活动成功');
      setIsModalVisible(false);
      fetchActivities();
    } catch (error) {
      console.error('Failed to add activity:', error);
      message.error('添加活动失败');
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

  const handleEdit = async (data) => {
    try {
      const res = await fetch(`/api/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          status: editingActivity.status,
          images: data.images,
          bankId: data.bankId,
          reminderDays: data.reminderDays,
          reminderTime: data.reminderTime,
        }),
      });

      if (!res.ok) throw new Error('编辑活动失败');
      
      message.success('编辑活动成功11');
      setIsModalVisible(false);
      fetchActivities();
    } catch (error) {
      console.error('Failed to edit activity:', error);
      message.error('编辑活动失败');
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
            onClick={() => {
              setEditingActivity(null); // 清除编辑状态
              setIsModalVisible(true);
            }}
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
          onSubmit={editingActivity ? handleEdit : handleAdd}
          initialValues={editingActivity}
        />
      </Modal>
    </div>
  );
} 