'use client';

import { useState, useEffect } from 'react';
import { 
  Layout, Table, Button, Modal, Form, 
  Input, Upload, message, Space 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, 
  DeleteOutlined, UploadOutlined 
} from '@ant-design/icons';

const { Content } = Layout;

export default function BanksPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/banks');
      const data = await res.json();
      setBanks(data);
    } catch (error) {
      message.error('获取银行列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingBank ? `/api/banks/${editingBank.id}` : '/api/banks';
      const method = editingBank ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(`${editingBank ? '更新' : '添加'}成功`);
        setIsModalVisible(false);
        form.resetFields();
        fetchBanks();
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      message.error(`${editingBank ? '更新' : '添加'}失败`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/banks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        message.success('删除成功');
        fetchBanks();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '银行名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      render: (logo) => logo ? (
        <img src={logo} alt="bank logo" style={{ width: 40 }} />
      ) : null,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 1 ? '启用' : '禁用',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBank(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个银行吗？相关的活动也会被删除。',
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBank(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          添加银行
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={banks}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingBank ? '编辑银行' : '添加银行'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBank(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="银行名称"
            rules={[{ required: true, message: '请输入银行名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="logo"
            label="银行Logo"
          >
            <Upload
              name="logo"
              listType="picture"
              maxCount={1}
              action="/api/upload"
              onChange={({ file }) => {
                if (file.status === 'done') {
                  form.setFieldsValue({ logo: file.response.url });
                }
              }}
            >
              <Button icon={<UploadOutlined />}>上传Logo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingBank ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
} 