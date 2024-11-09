import { Form, DatePicker, Button } from 'antd';

export default function ReminderForm({ onSubmit }) {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await onSubmit({
        remindTime: values.remindTime.toISOString(),
      });
      form.resetFields();
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="remindTime"
        label="提醒时间"
        rules={[{ required: true, message: '请选择提醒时间' }]}
      >
        <DatePicker
          showTime
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          添加提醒
        </Button>
      </Form.Item>
    </Form>
  );
} 