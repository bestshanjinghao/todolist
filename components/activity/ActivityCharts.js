import { Card, Row, Col } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import moment from 'moment';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ActivityCharts({ activities }) {
  // 按银行统计活动数量
  const bankStats = activities.reduce((acc, activity) => {
    const bankName = activity.bank.name;
    acc[bankName] = (acc[bankName] || 0) + 1;
    return acc;
  }, {});

  const bankData = Object.entries(bankStats).map(([name, value]) => ({
    name,
    value
  }));

  // 按活动类型统计
  const typeStats = activities.reduce((acc, activity) => {
    const type = activity.activityType === 'AMOUNT' ? '消费金额' : '刷卡次数';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeStats).map(([name, value]) => ({
    name,
    value
  }));

  // 按月份统计活动数量
  const monthlyStats = activities.reduce((acc, activity) => {
    const month = moment(activity.startTime).format('YYYY-MM');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyStats)
    .sort((a, b) => moment(a[0]).diff(moment(b[0])))
    .map(([month, count]) => ({
      month,
      count
    }));

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="银行活动分布">
            <PieChart width={400} height={300}>
              <Pie
                data={bankData}
                cx={200}
                cy={150}
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {bankData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="活动类型分布">
            <PieChart width={400} height={300}>
              <Pie
                data={typeData}
                cx={200}
                cy={150}
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {typeData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Card>
        </Col>
        <Col span={24}>
          <Card title="活动数量月度趋势">
            <BarChart
              width={900}
              height={300}
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="活动数量" fill="#8884d8" />
            </BarChart>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 