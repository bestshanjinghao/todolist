import { Calendar, Badge, Modal } from 'antd';
import { useState } from 'react';
import moment from 'moment';

export default function ActivityCalendar({ activities }) {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    return activities.filter(activity => {
      const startDate = moment(activity.startTime).format('YYYY-MM-DD');
      const endDate = moment(activity.endTime).format('YYYY-MM-DD');
      return moment(dateStr).isBetween(startDate, endDate, 'day', '[]');
    });
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map(item => (
          <li key={item.id} onClick={() => setSelectedActivity(item)}>
            <Badge
              status={
                item.status === 0 ? 'processing' :
                item.status === 1 ? 'success' :
                item.status === 2 ? 'default' : 'error'
              }
              text={item.title}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Calendar dateCellRender={dateCellRender} />
      
      <Modal
        title="活动详情"
        open={!!selectedActivity}
        onCancel={() => setSelectedActivity(null)}
        footer={null}
      >
        {selectedActivity && (
          <div>
            <h3>{selectedActivity.title}</h3>
            <p>银行：{selectedActivity.bank.name}</p>
            <p>奖励：{selectedActivity.reward}</p>
            <p>开始时间：{moment(selectedActivity.startTime).format('YYYY-MM-DD HH:mm')}</p>
            <p>结束时间：{moment(selectedActivity.endTime).format('YYYY-MM-DD HH:mm')}</p>
            <p>状态：{['未开始', '进行中', '已完成', '已过期'][selectedActivity.status]}</p>
            {selectedActivity.description && (
              <p>描述：{selectedActivity.description}</p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
} 