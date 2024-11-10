import { Form, Radio, Select, TimePicker, Card } from 'antd';
import moment from 'moment';

export default function ReminderForm({ form, initialValues }) {
  const [reminderType, setReminderType] = useState(initialValues?.reminderType || 'NONE');

  const handleReminderTypeChange = (e) => {
    setReminderType(e.target.value);
    form.resetFields(['reminderDay', 'reminderDate', 'reminderTime']);
  };

  return (
    <Card title="提醒设置">
      <Form.Item
        name="reminderType"
        label="提醒类型"
        initialValue={initialValues?.reminderType || 'NONE'}
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
          initialValue={initialValues?.reminderDay}
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
          initialValue={initialValues?.reminderDate}
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
          initialValue={initialValues?.reminderTime ? moment(initialValues.reminderTime, 'HH:mm') : null}
        >
          <TimePicker 
            format="HH:mm"
            style={{ width: '100%' }}
            placeholder="请选择提醒时间"
          />
        </Form.Item>
      )}
    </Card>
  );
} 