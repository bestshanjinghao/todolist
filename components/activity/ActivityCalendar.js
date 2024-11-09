import { Calendar, Badge, Tooltip } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/locale/zh_CN'; // 导入 antd 的中文语言包
import { ConfigProvider } from 'antd';   // 导入 ConfigProvider

// 设置 moment 为中文
moment.locale('zh-cn');

export default function ActivityCalendar({ activities }) {
  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const dayActivities = activities.filter(activity => {
      const startDate = moment(activity.startTime).format('YYYY-MM-DD');
      const endDate = moment(activity.endTime).format('YYYY-MM-DD');
      return moment(date).isBetween(startDate, endDate, 'day', '[]');
    });

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayActivities.map(activity => (
          <li key={activity.id} style={{ marginBottom: 3 }}>
            <Tooltip 
              title={
                <div>
                  <p><strong>{activity.title}</strong></p>
                  <p>所属银行：{activity.bank.name}</p>
                  <p>活动时间：{moment(activity.startTime).format('HH:mm')} - {moment(activity.endTime).format('HH:mm')}</p>
                  {activity.reminderType !== 'NONE' && (
                    <p>提醒设置：{getReminderText(activity)}</p>
                  )}
                </div>
              }
            >
              <Badge 
                status={getBadgeStatus(activity)} 
                text={activity.title} 
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}
              />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  const monthCellRender = (value) => {
    const month = value.format('YYYY-MM');
    const monthActivities = activities.filter(activity => 
      moment(activity.startTime).format('YYYY-MM') === month
    );

    if (monthActivities.length === 0) return null;

    return (
      <div style={{ padding: '8px 0' }}>
        <Badge 
          count={`${monthActivities.length}个活动`}
          style={{ backgroundColor: '#52c41a' }}
          showZero={false}
        />
      </div>
    );
  };

  return (
    <ConfigProvider locale={locale}>
      <Calendar 
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
        mode="month"
      />
    </ConfigProvider>
  );
}

function getBadgeStatus(activity) {
  const now = moment();
  const start = moment(activity.startTime);
  const end = moment(activity.endTime);

  if (now.isBefore(start)) return 'warning'; // 未开始的活动
  if (now.isAfter(end)) return 'default';    // 已结束的活动
  return 'processing';                        // 进行中的活动
}

function getReminderText(activity) {
  const types = {
    DAILY: '每日',
    WEEKLY: `每周${getWeekDayText(activity.reminderDay)}`,
    MONTHLY: `每月${activity.reminderDate}号`,
  };
  return `${types[activity.reminderType]} ${activity.reminderTime}`;
}

function getWeekDayText(day) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `周${days[day]}`;
} 