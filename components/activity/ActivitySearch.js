import { Form, Input, Select, DatePicker, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

export default function ActivitySearch({ onSearch, banks }) {
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;

  const handleSearch = (values) => {
    const filters = {
      keyword: values.keyword?.trim(),
      bankId: values.bankId,
      status: values.status,
      dateRange: values.dateRange ? {
        start: moment(values.dateRange[0]).format('YYYY-MM-DD'),
        end: moment(values.dateRange[1]).format('YYYY-MM-DD')
      } : undefined,
      reward: values.reward
    };
    onSearch(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({}); // 重置后刷新列表
  };

  return (
    <Form form={form} onFinish={handleSearch}>
      <Space wrap>
        <Form.Item name="keyword">
          <Input 
            placeholder="搜索活动名称" 
            allowClear
            prefix={<SearchOutlined />}
          />
        </Form.Item>
        
        <Form.Item name="bankId">
          <Select
            placeholder="选择银行"
            allowClear
            style={{ width: 120 }}
          >
            {banks.map(bank => (
              <Select.Option key={bank.id} value={bank.id}>
                {bank.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="status">
          <Select
            placeholder="活动状态"
            allowClear
            style={{ width: 120 }}
          >
            <Select.Option value={0}>未开始</Select.Option>
            <Select.Option value={1}>进行中</Select.Option>
            <Select.Option value={2}>已完成</Select.Option>
            <Select.Option value={3}>已过期</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="dateRange">
          <RangePicker 
            format="YYYY-MM-DD"
            allowClear
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Space>
    </Form>
  );
} 