import { create } from 'zustand';
import type { DashboardStats, AnalyticsData, Notification, ActivityLog } from '@/types';

interface DashboardState {
  stats: DashboardStats;
  analytics: AnalyticsData[];
  notifications: Notification[];
  activities: ActivityLog[];
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  fetchAnalytics: (days?: number) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  fetchActivities: () => Promise<void>;
}

const generateMockAnalytics = (days: number): AnalyticsData[] => {
  const data: AnalyticsData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      messagesSent: Math.floor(Math.random() * 5000) + 1000,
      messagesDelivered: Math.floor(Math.random() * 4500) + 900,
      messagesRead: Math.floor(Math.random() * 4000) + 800,
      conversations: Math.floor(Math.random() * 500) + 100,
      contacts: Math.floor(Math.random() * 200) + 50,
      chatbotInteractions: Math.floor(Math.random() * 1000) + 200,
    });
  }
  
  return data;
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Campaign Sent Successfully',
    message: 'Your campaign "Summer Sale" has been sent to 5,000 recipients.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'info',
    title: 'New Contact Added',
    message: '15 new contacts were imported from your CSV file.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'warning',
    title: 'Message Quota Alert',
    message: 'You have used 80% of your monthly message quota.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    type: 'error',
    title: 'WhatsApp Account Disconnected',
    message: 'Your WhatsApp account +1234567890 has been disconnected. Please reconnect.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: '5',
    type: 'success',
    title: 'Chatbot Training Complete',
    message: 'Your chatbot "Customer Support" has been trained successfully.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const mockActivities: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Super Admin',
    action: 'created',
    entityType: 'campaign',
    entityId: 'camp_123',
    details: { name: 'Summer Sale 2024' },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    userId: '2',
    userName: 'John Manager',
    action: 'updated',
    entityType: 'chatbot',
    entityId: 'bot_456',
    details: { name: 'Customer Support' },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    userId: '3',
    userName: 'Sarah Agent',
    action: 'imported',
    entityType: 'contacts',
    details: { count: 150 },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '4',
    userId: '1',
    userName: 'Super Admin',
    action: 'connected',
    entityType: 'whatsapp',
    entityId: 'wa_789',
    details: { phoneNumber: '+1234567890' },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '5',
    userId: '2',
    userName: 'John Manager',
    action: 'created',
    entityType: 'automation',
    entityId: 'auto_012',
    details: { name: 'Welcome Message' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    totalMessagesSent: 125847,
    totalConversations: 8934,
    totalContacts: 45678,
    activeChatbots: 12,
    messageDeliveryRate: 94.5,
    avgResponseTime: 2.3,
    trends: {
      messagesSent: 15.3,
      conversations: 8.7,
      contacts: 23.1,
      deliveryRate: 2.1,
    },
  },
  analytics: [],
  notifications: mockNotifications,
  activities: mockActivities,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    // Stats are already set in initial state
    set({ isLoading: false });
  },

  fetchAnalytics: async (days = 30) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({
      analytics: generateMockAnalytics(days),
      isLoading: false,
    });
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  fetchActivities: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },
}));
