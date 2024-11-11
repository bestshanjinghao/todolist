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
  Radio,
  message,
  Image
} from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

const uploadProps = {
  name: 'file',
  action: '/api/upload',
  headers: {
    // 如果需要，添加认证头
  },
  onChange(info) {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  },
  beforeUpload(file) {
    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    
    // 验证文件大小（小于 2MB）
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于 2MB！');
      return false;
    }
    
    return true;
  }
};

export default function ActivityForm({ onSubmit, initialValues }) {
  const [banks, setBanks] = useState([]);
  const [form] = Form.useForm();
  const [reminderType, setReminderType] = useState('NONE');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewGroup, setPreviewGroup] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetchBanks();
    if (initialValues) {
      console.log('Initial reminderTime:', initialValues.reminderTime);
      const formData = {
        ...initialValues,
        startTime: dayjs(initialValues.startTime),
        endTime: dayjs(initialValues.endTime),
        reminderTime: initialValues.reminderTime 
          ? dayjs(initialValues.reminderTime, 'HH:mm')
          : null,
        images: initialValues.images
          ? initialValues.images.split(',').map(url => ({
              uid: url,
              name: url.split('/').pop(),
              status: 'done',
              url: url,
            }))
          : [],
      };
      console.log('Formatted reminderTime:', formData.reminderTime);
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
      console.log('Raw form values:', values);
      
      // 处理图片数据
      const imageUrls = values.images
        .map(image => {
          if (image.url) return image.url;
          return image.response?.data?.url;
        })
        .filter(Boolean);
      
      const imagesString = imageUrls.join(',');

      // 处理日期和时间数据
      const data = {
        ...values,
        startTime: dayjs(values.startTime).format(),
        endTime: dayjs(values.endTime).format(),
        reminderTime: values.reminderType !== 'NONE' && values.reminderTime 
          ? dayjs(values.reminderTime).format('HH:mm')
          : null,
        images: imagesString,
        contentImages: []
      };

      console.log('Final form data:', data);

      await onSubmit(data);
      if (!initialValues) {
        form.resetFields();
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败');
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

  const handlePreview = async (file) => {
    const currentFileList = form.getFieldValue('images');
    const previewUrls = currentFileList.map(f => ({
      src: f.url || f.response?.data?.url,
      alt: f.name
    }));
    
    const currentIndex = currentFileList.findIndex(f => f.uid === file.uid);
    setPreviewGroup(previewUrls);
    setPreviewIndex(currentIndex);
    setPreviewVisible(true);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        startTime: dayjs(),
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
              rules={[
                { required: true, message: '请输入活动名称' },
                { max: 100, message: '活动名称不能超过100个字符' }
              ]}
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
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="结束时间"
              dependencies={['startTime']}
              rules={[
                { required: true, message: '请选择结束时间' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime');
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    
                    if (value.isSameOrAfter(startTime)) {
                      return Promise.resolve();
                    }
                    
                    return Promise.reject(new Error('结束时间必须等于或晚于开始时间'));
                  },
                }),
              ]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
                placeholder="请选择结束时间"
                disabledDate={(current) => {
                  const startTime = form.getFieldValue('startTime');
                  return startTime && current && current < dayjs(startTime).startOf('day');
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="活动内容" style={{ marginBottom: 24 }}>
        <Form.Item
          name="description"
          label="活动说明"
          rules={[
            { required: true, message: '请输入活动说明' },
            { max: 500, message: '活动说明不能超过500个字符' }
          ]}
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
            onPreview={handlePreview}
            onChange={(info) => {
              console.log('Upload onChange:', info);
              if (info.file.status === 'done') {
                message.success(`${info.file.name} 上传成功`);
                const fileList = info.fileList.map(file => ({
                  uid: file.uid,
                  name: file.name,
                  status: file.status,
                  url: file.url || file.response?.data?.url,
                  response: file.response
                }));
                form.setFieldsValue({ images: fileList });
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败`);
              }
            }}
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
              onChange={(time) => {
                console.log('TimePicker onChange:', time);
                console.log('TimePicker value:', time ? time.format('HH:mm') : null);
                form.setFieldsValue({ 
                  reminderTime: time 
                });
              }}
            />
          </Form.Item>
        )}
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存活动11
        </Button>
      </Form.Item>

      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible: previewVisible,
            current: previewIndex,
            onVisibleChange: (vis) => setPreviewVisible(vis),
            countRender: (current, total) => `${current} / ${total}`,
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: { onZoomIn, onZoomOut, onRotateLeft, onRotateRight }
              }
            ) => (
              <Space size={12} className="toolbar-wrapper">
                <Button onClick={onZoomIn}>放大</Button>
                <Button onClick={onZoomOut}>缩小</Button>
                <Button onClick={onRotateLeft}>向左旋转</Button>
                <Button onClick={onRotateRight}>向右旋转</Button>
                <span>缩放比例: {Math.round(scale * 100)}%</span>
              </Space>
            )
          }}
        >
          {previewGroup.map((item, index) => (
            <Image
              key={index}
              src={item.src}
              alt={item.alt}
              style={{ display: 'none' }}
            />
          ))}
        </Image.PreviewGroup>
      </div>
    </Form>
  );
} 