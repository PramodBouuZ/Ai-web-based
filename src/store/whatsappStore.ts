import { create } from 'zustand';
import type { WhatsAppAccount, MessageTemplate, Campaign } from '@/types';

interface WhatsAppState {
  accounts: WhatsAppAccount[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  isLoading: boolean;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Partial<WhatsAppAccount>) => Promise<void>;
  updateAccount: (id: string, data: Partial<WhatsAppAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  connectAccount: (id: string) => Promise<void>;
  disconnectAccount: (id: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Partial<MessageTemplate>) => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (campaign: Partial<Campaign>) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
}

const mockAccounts: WhatsAppAccount[] = [
  {
    id: 'wa_1',
    name: 'Main Business Account',
    phoneNumber: '+1 (555) 123-4567',
    status: 'connected',
    messageLimit: 100000,
    messagesSent: 45678,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    userId: '1',
  },
  {
    id: 'wa_2',
    name: 'Support Line',
    phoneNumber: '+1 (555) 987-6543',
    status: 'connected',
    messageLimit: 50000,
    messagesSent: 23456,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    userId: '1',
  },
  {
    id: 'wa_3',
    name: 'Marketing Channel',
    phoneNumber: '+1 (555) 456-7890',
    status: 'disconnected',
    messageLimit: 75000,
    messagesSent: 0,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    userId: '1',
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: 'temp_1',
    name: 'Welcome Message',
    category: 'transactional',
    language: 'en',
    header: { type: 'text', content: 'Welcome to {{business_name}}!' },
    body: 'Hi {{customer_name}}, welcome to our family! Were excited to have you on board. If you have any questions, feel free to reach out.',
    footer: 'Reply STOP to unsubscribe',
    variables: ['business_name', 'customer_name'],
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'temp_2',
    name: 'Order Confirmation',
    category: 'transactional',
    language: 'en',
    header: { type: 'text', content: 'Order #{{order_id}} Confirmed' },
    body: 'Hi {{customer_name}}, your order has been confirmed. Total: {{order_total}}. Expected delivery: {{delivery_date}}.',
    buttons: [
      { type: 'url', text: 'Track Order', value: '{{tracking_url}}' },
    ],
    variables: ['order_id', 'customer_name', 'order_total', 'delivery_date', 'tracking_url'],
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'temp_3',
    name: 'Summer Sale 2024',
    category: 'marketing',
    language: 'en',
    header: { type: 'image', content: 'https://example.com/sale-banner.jpg' },
    body: '🎉 Summer Sale is here! Get up to {{discount}}% off on all products. Use code: {{promo_code}}. Valid till {{end_date}}.',
    buttons: [
      { type: 'url', text: 'Shop Now', value: 'https://example.com/sale' },
      { type: 'quick_reply', text: 'More Info' },
    ],
    variables: ['discount', 'promo_code', 'end_date'],
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Summer Sale Announcement',
    templateId: 'temp_3',
    recipients: [],
    groups: ['group_1', 'group_2'],
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    stats: {
      total: 5000,
      sent: 5000,
      delivered: 4750,
      read: 3200,
      failed: 250,
      replied: 180,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    userId: '1',
  },
  {
    id: 'camp_2',
    name: 'New Product Launch',
    templateId: 'temp_1',
    recipients: [],
    groups: ['group_1'],
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    stats: {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      replied: 0,
    },
    createdAt: new Date().toISOString(),
    userId: '1',
  },
  {
    id: 'camp_3',
    name: 'Weekly Newsletter',
    templateId: 'temp_2',
    recipients: [],
    groups: ['group_3'],
    status: 'draft',
    stats: {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      replied: 0,
    },
    createdAt: new Date().toISOString(),
    userId: '1',
  },
];

export const useWhatsAppStore = create<WhatsAppState>((set) => ({
  accounts: mockAccounts,
  templates: mockTemplates,
  campaigns: mockCampaigns,
  isLoading: false,

  fetchAccounts: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  addAccount: async (account) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newAccount: WhatsAppAccount = {
      id: `wa_${Date.now()}`,
      name: account.name || 'New Account',
      phoneNumber: account.phoneNumber || '',
      status: 'pending',
      messageLimit: 10000,
      messagesSent: 0,
      createdAt: new Date().toISOString(),
      userId: '1',
    };
    set((state) => ({
      accounts: [...state.accounts, newAccount],
      isLoading: false,
    }));
  },

  updateAccount: async (id, data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      accounts: state.accounts.map(a =>
        a.id === id ? { ...a, ...data } : a
      ),
      isLoading: false,
    }));
  },

  deleteAccount: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      accounts: state.accounts.filter(a => a.id !== id),
      isLoading: false,
    }));
  },

  connectAccount: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
    set((state) => ({
      accounts: state.accounts.map(a =>
        a.id === id ? { ...a, status: 'connected', lastActiveAt: new Date().toISOString() } : a
      ),
      isLoading: false,
    }));
  },

  disconnectAccount: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      accounts: state.accounts.map(a =>
        a.id === id ? { ...a, status: 'disconnected' } : a
      ),
      isLoading: false,
    }));
  },

  fetchTemplates: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  createTemplate: async (template) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTemplate: MessageTemplate = {
      id: `temp_${Date.now()}`,
      name: template.name || 'New Template',
      category: template.category || 'custom',
      language: template.language || 'en',
      body: template.body || '',
      variables: template.variables || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      templates: [...state.templates, newTemplate],
      isLoading: false,
    }));
  },

  fetchCampaigns: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  createCampaign: async (campaign) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: campaign.name || 'New Campaign',
      templateId: campaign.templateId || '',
      recipients: campaign.recipients || [],
      groups: campaign.groups || [],
      status: 'draft',
      stats: {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        replied: 0,
      },
      createdAt: new Date().toISOString(),
      userId: '1',
    };
    set((state) => ({
      campaigns: [...state.campaigns, newCampaign],
      isLoading: false,
    }));
  },

  sendCampaign: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
    set((state) => ({
      campaigns: state.campaigns.map(c =>
        c.id === id
          ? {
              ...c,
              status: 'sent',
              sentAt: new Date().toISOString(),
              stats: {
                total: 5000,
                sent: 5000,
                delivered: 4750,
                read: 0,
                failed: 250,
                replied: 0,
              },
            }
          : c
      ),
      isLoading: false,
    }));
  },
}));
