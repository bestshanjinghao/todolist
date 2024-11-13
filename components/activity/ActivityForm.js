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
  Image,
  Checkbox
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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewGroup, setPreviewGroup] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);


  // 只在挂载时执行一次
useEffect(() => {
  fetchBanks();
}, []); // 空依赖数组

  // useEffect是不是只有在组件挂载的时候执行一次？
  useEffect(() => {
    
    if (initialValues) {
      
      console.log('初始值:', initialValues);
      const formData = {
        ...initialValues,
        startTime: dayjs(initialValues.startTime),
        endTime: dayjs(initialValues.endTime),
        reminderTime: initialValues.reminderTime 
          ? dayjs(initialValues.reminderTime, 'HH:mm') 
          : null,
        reminderDays: initialValues.reminderDays?.split(','),
        images: initialValues.images
          ? initialValues.images.split(',').map(url => ({
              uid: url,
              name: url.split('/').pop(),
              status: 'done',
              url: url,
            }))
          : [],
      };
      console.log('转换后的表单数据:', formData);
      form.setFieldsValue(formData);
    }else{
      form.resetFields();
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
      console.log('提交的原始值:', values);
      const imageUrls = values.images
        .map(image => {
          if (image.url) return image.url;
          return image.response?.data?.url;
        })
        .filter(Boolean);
      
      const imagesString = imageUrls.join(',');

      const data = {
        ...values,
        startTime: dayjs(values.startTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(values.endTime).format('YYYY-MM-DD HH:mm:ss'),
        reminderDays: values.reminderDays?.join(',') || null,
        reminderTime: values.reminderTime 
          ? dayjs(values.reminderTime).format('HH:mm') 
          : null,
        images: imagesString,
        contentImages: []
      };

      console.log('提交的处理后数据:', data);
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

  const weekDays = [
    { label: '周一', value: '1' },
    { label: '周二', value: '2' },
    { label: '周三', value: '3' },
    { label: '周四', value: '4' },
    { label: '周五', value: '5' },
    { label: '周六', value: '6' },
    { label: '周日', value: '0' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        startTime: dayjs(),
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
                onChange={(date, dateString) => {
                  console.log('moment/dayjs对象:', date);
                  console.log('字符串格式:', dateString);
                  console.log('时间戳:', date?.valueOf());
                  console.log('ISO格式:', date?.toISOString());
                  
                  // 如果使用 dayjs
                  console.log('dayjs格式化:', date?.format('YYYY-MM-DD HH:mm:ss'));
                  
                  // 如果使用 moment
                  console.log('moment格式化:', date?.format('YYYY-MM-DD HH:mm:ss'));
                }}
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
                { required: true, message: '选择结束时间' },
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

      <Card title="提醒设置" style={{ marginBottom: 24 }}>
        <Form.Item
          name="reminderDays"
          label="提醒日期"
          tooltip="选择每周需要提醒的日期"
        >
          <Checkbox.Group options={weekDays} />
        </Form.Item>

        <Form.Item
          name="reminderTime"
          label="提醒时间"
          tooltip="设置提醒时间"
        >
          <TimePicker
            format="HH:mm"
            style={{ width: '100%' }}
            placeholder="请选择提醒时间"
            onChange={(time, timeString) => {
              console.log('选择的时间:', time, timeString);
              form.setFieldsValue({ 
                reminderTime: time 
              });
            }}
          />
        </Form.Item>
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存活动
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