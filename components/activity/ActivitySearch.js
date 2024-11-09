import { Form, Input, Select, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

export default function ActivitySearch({ onSearch, banks }) {
  const [form] = Form.useForm();

  const handleSearch = (values) => {
    const filters = {
      ...values,
      dateRange: values.dateRange ? {
        start: values.dateRange[0].toISOString(),
        end: values.dateRange[1].toISOString(),
      } : undefined,
    };
    onSearch(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleSearch}
      style={{ marginBottom: 24 }}
    >
      <Form.Item name="keyword">
        <Input
          placeholder="搜索活动名称"
          allowClear
          style={{ width: 200 }}
        />
      </Form.Item>

      <Form.Item name="bankId">
        <Select
          placeholder="选择银行"
          allowClear
          style={{ width: 150 }}
        >
          {banks.map(bank => (
            <Select.Option key={bank.id} value={bank.id}>
              {bank.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="dateRange">
        <RangePicker
          placeholder={['开始日期', '结束日期']}
          style={{ width: 300 }}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            htmlType="submit"
          >
            搜索
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleReset}
          >
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
} 