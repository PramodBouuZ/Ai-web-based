import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { multiTenantManager, type MetaCredentials } from '@/lib/metaApi';

export interface MetaAccount {
  id: string;
  tenantId: string;
  name: string;
  businessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'NA';
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'DELETED' | 'connected' | 'disconnected';
  isOfficialBusinessAccount: boolean;
  accessToken: string;
  messageTemplateNamespace: string;
  timezoneId: string;
  createdAt: string;
  updatedAt: string;
  messageLimit: number;
  messagesSent: number;
  dailyStats: {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }[];
}

export interface MetaTemplate {
  id: string;
  accountId: string;
  name: string;
  language: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: any[];
  createdAt: string;
}

interface MetaState {
  // Accounts
  accounts: MetaAccount[];
  currentAccount: MetaAccount | null;
  
  // Templates
  templates: MetaTemplate[];
  
  // Loading states
  isLoading: boolean;
  isConnecting: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  connectAccount: (credentials: MetaCredentials & { name: string }) => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  fetchAccounts: () => Promise<void>;
  setCurrentAccount: (account: MetaAccount | null) => void;
  
  // Templates
  fetchTemplates: (accountId: string) => Promise<void>;
  createTemplate: (accountId: string, template: Partial<MetaTemplate>) => Promise<void>;
  deleteTemplate: (accountId: string, templateName: string) => Promise<void>;
  
  // Messages
  sendMessage: (accountId: string, to: string, message: any) => Promise<any>;
  sendTemplateMessage: (accountId: string, to: string, templateName: string, components?: any[]) => Promise<any>;
  
  // Analytics
  fetchAnalytics: (accountId: string, startDate: string, endDate: string) => Promise<any>;
  
  // Profile
  fetchBusinessProfile: (accountId: string) => Promise<any>;
  updateBusinessProfile: (accountId: string, profile: any) => Promise<any>;
  
  // Clear error
  clearError: () => void;
}

// Mock data for demo
const mockMetaAccounts: MetaAccount[] = [
  {
    id: 'meta_1',
    tenantId: 'tenant_1',
    name: 'Acme Inc - Main',
    businessAccountId: '1234567890',
    phoneNumberId: '9876543210',
    displayPhoneNumber: '+1 (555) 123-4567',
    verifiedName: 'Acme Inc',
    qualityRating: 'GREEN',
    status: 'connected',
    isOfficialBusinessAccount: true,
    accessToken: 'mock_token_1',
    messageTemplateNamespace: 'acme_templates',
    timezoneId: 'America/New_York',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    messageLimit: 100000,
    messagesSent: 45678,
    dailyStats: [],
  },
  {
    id: 'meta_2',
    tenantId: 'tenant_2',
    name: 'TechCorp - Support',
    businessAccountId: '2345678901',
    phoneNumberId: '8765432109',
    displayPhoneNumber: '+1 (555) 987-6543',
    verifiedName: 'TechCorp Support',
    qualityRating: 'GREEN',
    status: 'connected',
    isOfficialBusinessAccount: false,
    accessToken: 'mock_token_2',
    messageTemplateNamespace: 'techcorp_templates',
    timezoneId: 'America/Los_Angeles',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    messageLimit: 50000,
    messagesSent: 23456,
    dailyStats: [],
  },
];

const mockMetaTemplates: MetaTemplate[] = [
  {
    id: 'template_1',
    accountId: 'meta_1',
    name: 'welcome_message',
    language: 'en_US',
    status: 'APPROVED',
    category: 'UTILITY',
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Welcome to {{business_name}}!' },
      { type: 'BODY', text: 'Hi {{customer_name}}, welcome to our family! How can we help you today?' },
      { type: 'FOOTER', text: 'Reply STOP to unsubscribe' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'template_2',
    accountId: 'meta_1',
    name: 'order_confirmation',
    language: 'en_US',
    status: 'APPROVED',
    category: 'UTILITY',
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Order #{{order_id}} Confirmed' },
      { type: 'BODY', text: 'Hi {{customer_name}}, your order has been confirmed. Total: {{order_total}}' },
      { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Track Order', url: '{{tracking_url}}' }] },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'template_3',
    accountId: 'meta_2',
    name: 'promotional_offer',
    language: 'en_US',
    status: 'PENDING',
    category: 'MARKETING',
    components: [
      { type: 'HEADER', format: 'IMAGE', image: { link: 'https://example.com/promo.jpg' } },
      { type: 'BODY', text: '🎉 Special Offer! Get {{discount}}% off on all products. Use code: {{promo_code}}' },
      { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Shop Now', url: 'https://example.com/shop' }] },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      accounts: mockMetaAccounts,
      currentAccount: mockMetaAccounts[0],
      templates: mockMetaTemplates,
      isLoading: false,
      isConnecting: false,
      error: null,

      connectAccount: async (credentials) => {
        set({ isConnecting: true, error: null });
        
        try {
          // Simulate API call to connect Meta account
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Create new Meta account
          const newAccount: MetaAccount = {
            id: `meta_${Date.now()}`,
            tenantId: `tenant_${Date.now()}`,
            name: credentials.name,
            businessAccountId: credentials.businessAccountId,
            phoneNumberId: credentials.phoneNumberId,
            displayPhoneNumber: '+1 (555) 000-0000',
            verifiedName: credentials.name,
            qualityRating: 'GREEN',
            status: 'connected',
            isOfficialBusinessAccount: false,
            accessToken: credentials.accessToken,
            messageTemplateNamespace: '',
            timezoneId: 'UTC',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageLimit: 10000,
            messagesSent: 0,
            dailyStats: [],
          };

          // Add to multi-tenant manager
          multiTenantManager.addTenant(newAccount.tenantId, credentials);

          set((state) => ({
            accounts: [...state.accounts, newAccount],
            currentAccount: newAccount,
            isConnecting: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isConnecting: false });
          throw error;
        }
      },

      disconnectAccount: async (accountId) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const account = get().accounts.find(a => a.id === accountId);
          if (account) {
            multiTenantManager.removeTenant(account.tenantId);
          }

          set((state) => ({
            accounts: state.accounts.filter(a => a.id !== accountId),
            currentAccount: state.currentAccount?.id === accountId 
              ? state.accounts.find(a => a.id !== accountId) || null 
              : state.currentAccount,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchAccounts: async () => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          // In production, fetch from your backend
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setCurrentAccount: (account) => {
        set({ currentAccount: account });
      },

      fetchTemplates: async (accountId) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Filter templates for this account - using the result
          const _accountTemplates = get().templates.filter(t => t.accountId === accountId);
          console.log(`Fetched ${_accountTemplates.length} templates for account ${accountId}`);
          
          // In production, fetch from Meta API
          // const api = multiTenantManager.getTenant(account.tenantId);
          // const templates = await api.getMessageTemplates(account.businessAccountId);
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createTemplate: async (accountId, template) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newTemplate: MetaTemplate = {
            id: `template_${Date.now()}`,
            accountId,
            name: template.name || 'new_template',
            language: template.language || 'en_US',
            status: 'PENDING',
            category: template.category || 'UTILITY',
            components: template.components || [],
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            templates: [...state.templates, newTemplate],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteTemplate: async (accountId, templateName) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => ({
            templates: state.templates.filter(t => !(t.accountId === accountId && t.name === templateName)),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      sendMessage: async (accountId, _to, _message) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) throw new Error('Account not found');

        try {
          // In production, use Meta API
          // const api = multiTenantManager.getTenant(account.tenantId);
          // return await api.sendMessage(account.phoneNumberId, message);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update message count
          set((state) => ({
            accounts: state.accounts.map(a => 
              a.id === accountId 
                ? { ...a, messagesSent: a.messagesSent + 1 }
                : a
            ),
          }));

          return { messages: [{ id: `msg_${Date.now()}` }] };
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      sendTemplateMessage: async (accountId, _to, _templateName, _components) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) throw new Error('Account not found');

        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => ({
            accounts: state.accounts.map(a => 
              a.id === accountId 
                ? { ...a, messagesSent: a.messagesSent + 1 }
                : a
            ),
          }));

          return { messages: [{ id: `msg_${Date.now()}` }] };
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      fetchAnalytics: async (_accountId, _startDate, _endDate) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock analytics data
          const analytics = {
            sent: 1234,
            delivered: 1189,
            read: 876,
            failed: 45,
            conversations: 234,
          };
          
          set({ isLoading: false });
          return analytics;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchBusinessProfile: async (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) throw new Error('Account not found');

        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return {
            about: 'We are a leading company...',
            address: '123 Business St, City, Country',
            description: 'Providing excellent services since 2020',
            email: 'contact@example.com',
            profile_picture_url: '',
            websites: ['https://example.com'],
            vertical: 'Technology',
          };
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      updateBusinessProfile: async (accountId, _profile) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) throw new Error('Account not found');

        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          return _profile;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'meta-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        currentAccount: state.currentAccount,
        templates: state.templates,
      }),
    }
  )
);

export default useMetaStore;
