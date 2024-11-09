import { 
  Form, 
  Input, 
  DatePicker, 
  TimePicker,
  Select, 
  Button, 
  Upload, 
  Card,
  Row,
  Col,
  Space,
  Radio
} from 'antd';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';

export default function ActivityForm({ onSubmit, initialValues }) {
  const [banks, setBanks] = useState([]);
  const [form] = Form.useForm();
  const [reminderType, setReminderType] = useState('NONE');

  useEffect(() => {
    fetchBanks();
    if (initialValues) {
      const formData = {
        ...initialValues,
        startTime: moment(initialValues.startTime),
        endTime: moment(initialValues.endTime),
        reminderTime: initialValues.reminderTime ? moment(initialValues.reminderTime, 'HH:mm') : null,
        images: initialValues.images
          ? initialValues.images.split(',').map(url => ({
              uid: url,
              name: url.split('/').pop(),
              status: 'done',
              url: url,
            }))
          : [],
      };
      form.setFieldsValue(formData);
    }
  }, [initialValues, form]);

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/banks');
      const data = await res.json();
      setBanks(data);
    } catch (error) {
      console.error('获取银行列表失败:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const imageUrls = values.images
        ? values.images.map(file => file.response?.url || file.url).filter(Boolean)
        : [];

      const data = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        reminderTime: values.reminderTime?.format('HH:mm'),
        images: imageUrls.join(','),
      };

      await onSubmit(data);
      if (!initialValues) {
        form.resetFields();
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  const handleReminderTypeChange = (e) => {
    setReminderType(e.target.value);
    form.resetFields(['reminderDay', 'reminderDate', 'reminderTime']);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        startTime: moment(),
        reminderType: 'NONE',
        images: [],
      }}
    >
      <Card title="基础信息" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankId"
              label="所属银行"
              rules={[{ required: true, message: '请选择银行' }]}
            >
              <Select placeholder="请选择银行">
                {banks.map(bank => (
                  <Select.Option key={bank.id} value={bank.id}>
                    {bank.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="title"
              label="活动名称"
              rules={[{ required: true, message: '请输入活动名称' }]}
            >
              <Input placeholder="请输入活动名称" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
                placeholder="请选择开始时间"
                disabledDate={(current) => current && current < moment().startOf('day')}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
                placeholder="请选择结束时间"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="活动内容" style={{ marginBottom: 24 }}>
        <Form.Item
          name="description"
          label="活动说明"
          rules={[{ required: true, message: '请输入活动说明' }]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="请输入活动说明"
          />
        </Form.Item>

        <Form.Item
          name="images"
          label="活动图片"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload.Dragger 
            name="file"
            action="/api/upload"
            multiple
            listType="picture-card"
            accept="image/*"
          >
            <p className="ant-upload-drag-icon">
              <PlusOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽上传活动图片</p>
            <p className="ant-upload-hint">支持单个或批量上传图片</p>
          </Upload.Dragger>
        </Form.Item>
      </Card>

      <Card title="提醒设置">
        <Form.Item
          name="reminderType"
          label="提醒类型"
        >
          <Radio.Group onChange={handleReminderTypeChange}>
            <Radio.Button value="NONE">不提醒</Radio.Button>
            <Radio.Button value="DAILY">每日提醒</Radio.Button>
            <Radio.Button value="WEEKLY">每周提醒</Radio.Button>
            <Radio.Button value="MONTHLY">每月提醒</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {reminderType === 'WEEKLY' && (
          <Form.Item
            name="reminderDay"
            label="提醒星期"
            rules={[{ required: true, message: '请选择提醒星期' }]}
          >
            <Select placeholder="请选择提醒星期">
              {[
                { value: 1, label: '周一' },
                { value: 2, label: '周二' },
                { value: 3, label: '周三' },
                { value: 4, label: '周四' },
                { value: 5, label: '周五' },
                { value: 6, label: '周六' },
                { value: 0, label: '周日' },
              ].map(day => (
                <Select.Option key={day.value} value={day.value}>
                  {day.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {reminderType === 'MONTHLY' && (
          <Form.Item
            name="reminderDate"
            label="提醒日期"
            rules={[{ required: true, message: '请选择提醒日期' }]}
          >
            <Select placeholder="请选择提醒日期">
              {Array.from({ length: 31 }, (_, i) => (
                <Select.Option key={i + 1} value={i + 1}>
                  {i + 1}号
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {reminderType !== 'NONE' && (
          <Form.Item
            name="reminderTime"
            label="提醒时间"
            rules={[{ required: true, message: '请选择提醒时间' }]}
          >
            <TimePicker 
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder="请选择提醒时间"
            />
          </Form.Item>
        )}
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存活动
        </Button>
      </Form.Item>
    </Form>
  );
} 