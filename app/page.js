'use client';

import ActivityDashboard from '@/components/activity/ActivityDashboard';

const TestButton = () => {
  const handleTest = async () => {
    try {
      const response = await fetch('/api/activities/test', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('测试活动创建成功！');
        console.log('测试活动数据：', data.data);
      } else {
        alert('创建失败：' + data.error);
      }
    } catch (error) {
      alert('请求出错：' + error.message);
    }
  };

  return (
    <button 
      onClick={handleTest}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      创建测试提醒
    </button>
  );
};

export default function Home() {
  return (
    <div>
      <ActivityDashboard />
      <TestButton />
    </div>
  );
}
