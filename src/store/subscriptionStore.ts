import { create } from 'zustand';
import type { Subscription, SubscriptionPlan } from '@/types';

interface SubscriptionState {
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  fetchSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  subscribe: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updatePaymentMethod: (paymentMethod: any) => Promise<void>;
}

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started with WhatsApp marketing',
    price: 29,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { name: 'WhatsApp Accounts', included: true, limit: 2 },
      { name: 'Messages per Month', included: true, limit: 10000 },
      { name: 'Contacts', included: true, limit: 5000 },
      { name: 'Chatbots', included: true, limit: 2 },
      { name: 'Team Members', included: true, limit: 3 },
      { name: 'Automations', included: true, limit: 5 },
      { name: 'AI Chatbot', included: false },
      { name: 'CRM Integration', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Branding', included: false },
    ],
    limits: {
      whatsappAccounts: 2,
      messagesPerMonth: 10000,
      contacts: 5000,
      chatbots: 2,
      teamMembers: 3,
      automations: 5,
    },
  },
  {
    id: 'plan_growth',
    name: 'Growth',
    description: 'Ideal for growing businesses with advanced messaging needs',
    price: 79,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { name: 'WhatsApp Accounts', included: true, limit: 5 },
      { name: 'Messages per Month', included: true, limit: 50000 },
      { name: 'Contacts', included: true, limit: 25000 },
      { name: 'Chatbots', included: true, limit: 10 },
      { name: 'Team Members', included: true, limit: 10 },
      { name: 'Automations', included: true, limit: 25 },
      { name: 'AI Chatbot', included: true },
      { name: 'CRM Integration', included: true },
      { name: 'Priority Support', included: false },
      { name: 'Custom Branding', included: false },
    ],
    limits: {
      whatsappAccounts: 5,
      messagesPerMonth: 50000,
      contacts: 25000,
      chatbots: 10,
      teamMembers: 10,
      automations: 25,
    },
    isPopular: true,
  },
  {
    id: 'plan_business',
    name: 'Business',
    description: 'For established businesses requiring enterprise features',
    price: 199,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { name: 'WhatsApp Accounts', included: true, limit: 15 },
      { name: 'Messages per Month', included: true, limit: 200000 },
      { name: 'Contacts', included: true, limit: 100000 },
      { name: 'Chatbots', included: true, limit: 50 },
      { name: 'Team Members', included: true, limit: 25 },
      { name: 'Automations', included: true, limit: 100 },
      { name: 'AI Chatbot', included: true },
      { name: 'CRM Integration', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Custom Branding', included: true },
    ],
    limits: {
      whatsappAccounts: 15,
      messagesPerMonth: 200000,
      contacts: 100000,
      chatbots: 50,
      teamMembers: 25,
      automations: 100,
    },
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { name: 'WhatsApp Accounts', included: true, limit: Infinity },
      { name: 'Messages per Month', included: true, limit: Infinity },
      { name: 'Contacts', included: true, limit: Infinity },
      { name: 'Chatbots', included: true, limit: Infinity },
      { name: 'Team Members', included: true, limit: Infinity },
      { name: 'Automations', included: true, limit: Infinity },
      { name: 'AI Chatbot', included: true },
      { name: 'CRM Integration', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Custom Branding', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'SLA Guarantee', included: true },
      { name: 'Custom Development', included: true },
    ],
    limits: {
      whatsappAccounts: Infinity,
      messagesPerMonth: Infinity,
      contacts: Infinity,
      chatbots: Infinity,
      teamMembers: Infinity,
      automations: Infinity,
    },
  },
];

const mockSubscription: Subscription = {
  id: 'sub_1',
  planId: 'plan_growth',
  plan: mockPlans[1],
  status: 'active',
  currentPeriodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
  cancelAtPeriodEnd: false,
  usage: {
    whatsappAccounts: 3,
    messagesSent: 32456,
    contacts: 18765,
    chatbots: 5,
    teamMembers: 7,
    automations: 18,
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: mockSubscription,
  plans: mockPlans,
  isLoading: false,

  fetchSubscription: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  fetchPlans: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  subscribe: async (planId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1500));
    const plan = mockPlans.find(p => p.id === planId);
    if (plan) {
      set({
        subscription: {
          id: `sub_${Date.now()}`,
          planId,
          plan,
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          cancelAtPeriodEnd: false,
          usage: {
            whatsappAccounts: 0,
            messagesSent: 0,
            contacts: 0,
            chatbots: 0,
            teamMembers: 0,
            automations: 0,
          },
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
      });
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    set((state) => ({
      subscription: state.subscription
        ? { ...state.subscription, cancelAtPeriodEnd: true }
        : null,
      isLoading: false,
    }));
  },

  updatePaymentMethod: async (_paymentMethod) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ isLoading: false });
  },
}));
