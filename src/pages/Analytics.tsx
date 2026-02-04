import { useEffect, useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import { useDashboardStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Download,
  Calendar,
  TrendingUp,
  MessageSquare,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Colors for charts
// const COLORS = ['#25D366', '#34B7F1', '#128C7E', '#075E54', '#FFC107', '#FF5252'];

const templatePerformance = [
  { name: 'Welcome Message', sent: 5000, delivered: 4750, read: 3200, replies: 450 },
  { name: 'Order Confirm', sent: 3500, delivered: 3420, read: 2800, replies: 120 },
  { name: 'Promo Alert', sent: 8000, delivered: 7200, read: 4800, replies: 890 },
  { name: 'Feedback', sent: 2000, delivered: 1900, read: 1100, replies: 650 },
];

const chatbotPerformance = [
  { name: 'Customer Support', conversations: 5432, satisfaction: 4.7, handoffs: 234 },
  { name: 'Sales Assistant', conversations: 3210, satisfaction: 4.5, handoffs: 156 },
  { name: 'Appointment Bot', conversations: 1890, satisfaction: 4.8, handoffs: 89 },
];

const hourlyActivity = [
  { hour: '00:00', messages: 120 },
  { hour: '04:00', messages: 80 },
  { hour: '08:00', messages: 450 },
  { hour: '12:00', messages: 680 },
  { hour: '16:00', messages: 720 },
  { hour: '20:00', messages: 540 },
];

export function Analytics() {
  const { analytics, stats, fetchAnalytics } = useDashboardStore();
  const [dateRange, setDateRange] = useState('30');
  const [activeMetric, setActiveMetric] = useState('messages');

  useEffect(() => {
    fetchAnalytics(parseInt(dateRange));
  }, [dateRange, fetchAnalytics]);

  const metrics = [
    {
      id: 'messages',
      label: 'Messages',
      value: stats.totalMessagesSent,
      trend: stats.trends.messagesSent,
      icon: MessageSquare,
      color: '#0B5ED7',
    },
    {
      id: 'conversations',
      label: 'Conversations',
      value: stats.totalConversations,
      trend: stats.trends.conversations,
      icon: Users,
      color: '#34B7F1',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      value: stats.totalContacts,
      trend: stats.trends.contacts,
      icon: TrendingUp,
      color: '#128C7E',
    },
    {
      id: 'delivery',
      label: 'Delivery Rate',
      value: `${stats.messageDeliveryRate}%`,
      trend: stats.trends.deliveryRate,
      icon: CheckCircle2,
      color: '#075E54',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            alert('Exporting report as PDF...');
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className={cn(
              'cursor-pointer transition-all',
              activeMetric === metric.id && 'ring-2 ring-[#0B5ED7]'
            )}
            onClick={() => setActiveMetric(metric.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}</h3>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-2 text-sm',
                      metric.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {metric.trend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(metric.trend)}%
                  </div>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Message trends over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D366" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34B7F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34B7F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="messagesSent"
                  stroke="#0B5ED7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  name="Messages Sent"
                />
                <Area
                  type="monotone"
                  dataKey="messagesDelivered"
                  stroke="#34B7F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDelivered)"
                  name="Messages Delivered"
                />
                <Area
                  type="monotone"
                  dataKey="messagesRead"
                  stroke="#128C7E"
                  strokeWidth={2}
                  fillOpacity={0}
                  name="Messages Read"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Template Performance</CardTitle>
            <CardDescription>Top performing message templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templatePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#0B5ED7" name="Sent" />
                  <Bar dataKey="delivered" fill="#34B7F1" name="Delivered" />
                  <Bar dataKey="read" fill="#128C7E" name="Read" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity</CardTitle>
            <CardDescription>Message volume by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#0B5ED7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbot Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Performance</CardTitle>
          <CardDescription>AI assistant metrics and satisfaction ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chatbotPerformance.map((bot) => (
              <div key={bot.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-4">{bot.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Conversations</span>
                    <span className="font-medium">{formatNumber(bot.conversations)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{bot.satisfaction}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Handoffs</span>
                    <span className="font-medium">{bot.handoffs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Growth</CardTitle>
          <CardDescription>New contacts added over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="contacts"
                  stroke="#0B5ED7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
