import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn, formatNumber, formatPercentage } from '@/lib/utils';
import { useDashboardStore, useWhatsAppStore, useChatbotStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Users,
  Bot,
  Send,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  iconColor: string;
  linkTo?: string;
}

function StatCard({ title, value, trend, trendLabel, icon: Icon, iconColor, linkTo }: StatCardProps) {
  const isPositive = (trend || 0) >= 0;

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <div
                  className={cn(
                    'flex items-center text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {formatPercentage(trend)}
                </div>
                <span className="text-sm text-gray-500">{trendLabel || 'vs last month'}</span>
              </div>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {linkTo && (
          <Link
            to={linkTo}
            className="inline-flex items-center text-sm text-[#25D366] hover:underline mt-4"
          >
            View details
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { stats, analytics, activities, fetchAnalytics } = useDashboardStore();
  const { accounts, campaigns } = useWhatsAppStore();
  const { chatbots } = useChatbotStore();

  useEffect(() => {
    fetchAnalytics(30);
  }, [fetchAnalytics]);

  const connectedAccounts = accounts.filter(a => a.status === 'connected').length;
  const activeCampaigns = campaigns.filter(c => c.status === 'sent').length;
  const activeChatbots = chatbots.filter(b => b.status === 'active').length;

  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages Sent"
          value={formatNumber(stats.totalMessagesSent)}
          trend={stats.trends.messagesSent}
          icon={Send}
          iconColor="bg-blue-500"
          linkTo="/dashboard/messaging"
        />
        <StatCard
          title="Active Conversations"
          value={formatNumber(stats.totalConversations)}
          trend={stats.trends.conversations}
          icon={MessageSquare}
          iconColor="bg-green-500"
          linkTo="/dashboard/analytics"
        />
        <StatCard
          title="Total Contacts"
          value={formatNumber(stats.totalContacts)}
          trend={stats.trends.contacts}
          icon={Users}
          iconColor="bg-purple-500"
          linkTo="/dashboard/contacts"
        />
        <StatCard
          title="Active Chatbots"
          value={activeChatbots}
          trend={8.2}
          icon={Bot}
          iconColor="bg-orange-500"
          linkTo="/dashboard/chatbots"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Analytics Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Message Analytics</CardTitle>
              <CardDescription>Message delivery and engagement over time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {stats.messageDeliveryRate}% Delivery Rate
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#9ca3af"
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messagesSent"
                    stroke="#25D366"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSent)"
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
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WhatsApp Accounts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">WhatsApp Accounts</span>
                <span className="text-sm text-gray-500">
                  {connectedAccounts}/{accounts.length} connected
                </span>
              </div>
              <Progress value={(connectedAccounts / accounts.length) * 100} className="h-2" />
            </div>

            {/* Message Quota */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Message Quota</span>
                <span className="text-sm text-gray-500">
                  {formatNumber(accounts.reduce((acc, a) => acc + a.messagesSent, 0))} /{' '}
                  {formatNumber(accounts.reduce((acc, a) => acc + a.messageLimit, 0))}
                </span>
              </div>
              <Progress
                value={
                  (accounts.reduce((acc, a) => acc + a.messagesSent, 0) /
                    accounts.reduce((acc, a) => acc + a.messageLimit, 0)) *
                  100
                }
                className="h-2"
              />
            </div>

            {/* Campaign Performance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Campaign Performance</span>
                <span className="text-sm text-gray-500">{activeCampaigns} sent</span>
              </div>
              <div className="flex gap-2">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-center"
                  >
                    <p className="text-xs text-gray-500 truncate">{campaign.name}</p>
                    <p className="text-lg font-semibold text-green-600">
                      {campaign.stats.delivered > 0
                        ? Math.round((campaign.stats.read / campaign.stats.delivered) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-gray-400">read rate</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
                <p className="text-xl font-semibold">{stats.avgResponseTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chatbot Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chatbot Performance</CardTitle>
              <CardDescription>AI assistant metrics</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild aria-label="View chatbot performance">
              <Link to="/dashboard/chatbots">
                <MoreHorizontal className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chatbots.slice(0, 3).map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      bot.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{bot.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(bot.stats.totalConversations)} conversations
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{bot.stats.satisfactionRate.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">rating</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/dashboard/chatbots">
                <Plus className="w-4 h-4 mr-2" />
                Create Chatbot
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across your account</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/analytics">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white text-sm">
                      {activity.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      <span className="text-gray-500">
                        {activity.action} {activity.entityType}
                      </span>
                      {activity.details?.name && (
                        <span className="font-medium"> "{activity.details.name}"</span>
                      )}
                      {activity.details?.count && (
                        <span className="font-medium"> {activity.details.count} items</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full mt-2',
                      activity.action === 'created'
                        ? 'bg-green-500'
                        : activity.action === 'updated'
                        ? 'bg-blue-500'
                        : activity.action === 'deleted'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Campaign', icon: Send, path: '/dashboard/messaging', color: 'bg-blue-500' },
          { label: 'Add Contact', icon: Users, path: '/dashboard/contacts', color: 'bg-green-500' },
          { label: 'Create Chatbot', icon: Bot, path: '/dashboard/chatbots', color: 'bg-purple-500' },
          { label: 'Connect WhatsApp', icon: MessageSquare, path: '/dashboard/whatsapp', color: 'bg-orange-500' },
        ].map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            asChild
          >
            <Link to={action.path}>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', action.color)}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
