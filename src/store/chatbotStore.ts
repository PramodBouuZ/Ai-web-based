import { create } from 'zustand';
import type { Chatbot, FlowNode, FlowConnection } from '@/types';

interface ChatbotState {
  chatbots: Chatbot[];
  isLoading: boolean;
  selectedChatbot: Chatbot | null;
  fetchChatbots: () => Promise<void>;
  createChatbot: (data: Partial<Chatbot>) => Promise<void>;
  updateChatbot: (id: string, data: Partial<Chatbot>) => Promise<void>;
  deleteChatbot: (id: string) => Promise<void>;
  selectChatbot: (chatbot: Chatbot | null) => void;
  updateFlow: (chatbotId: string, nodes: FlowNode[], connections: FlowConnection[]) => Promise<void>;
  trainChatbot: (id: string) => Promise<void>;
  toggleChatbot: (id: string) => Promise<void>;
}

const mockChatbots: Chatbot[] = [
  {
    id: 'bot_1',
    name: 'Customer Support',
    description: 'Handles customer inquiries and support requests',
    status: 'active',
    flow: {
      nodes: [
        { id: 'node_1', type: 'start', position: { x: 100, y: 100 }, data: {} },
        { id: 'node_2', type: 'message', position: { x: 300, y: 100 }, data: { message: 'Hello! How can I help you today?' } },
        { id: 'node_3', type: 'condition', position: { x: 500, y: 100 }, data: { condition: 'intent' } },
        { id: 'node_4', type: 'ai_response', position: { x: 700, y: 50 }, data: {} },
        { id: 'node_5', type: 'message', position: { x: 700, y: 150 }, data: { message: 'Let me connect you with an agent.' } },
        { id: 'node_6', type: 'end', position: { x: 900, y: 100 }, data: {} },
      ],
      connections: [
        { id: 'conn_1', source: 'node_1', target: 'node_2' },
        { id: 'conn_2', source: 'node_2', target: 'node_3' },
        { id: 'conn_3', source: 'node_3', target: 'node_4', condition: 'faq' },
        { id: 'conn_4', source: 'node_3', target: 'node_5', condition: 'support' },
        { id: 'conn_5', source: 'node_4', target: 'node_6' },
        { id: 'conn_6', source: 'node_5', target: 'node_6' },
      ],
    },
    aiConfig: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
      systemPrompt: 'You are a helpful customer support assistant. Be polite and professional.',
      fallbackResponse: 'I apologize, but I did not understand that. Could you please rephrase?',
      confidenceThreshold: 0.7,
    },
    trainingData: {
      faqs: [
        {
          question: 'What are your business hours?',
          answer: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
          variations: ['When are you open?', 'What time do you close?', 'Business hours?'],
        },
        {
          question: 'How do I track my order?',
          answer: 'You can track your order using the tracking link sent to your email or by visiting our website.',
          variations: ['Track order', 'Where is my package?', 'Order status'],
        },
      ],
      documents: [],
      urls: ['https://help.example.com'],
      intentExamples: [
        { intent: 'greeting', examples: ['hi', 'hello', 'hey', 'good morning'] },
        { intent: 'goodbye', examples: ['bye', 'goodbye', 'see you', 'thanks bye'] },
      ],
    },
    stats: {
      totalConversations: 12543,
      totalMessages: 45678,
      avgResponseTime: 1.2,
      satisfactionRate: 4.7,
      handoffCount: 892,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    userId: '1',
  },
  {
    id: 'bot_2',
    name: 'Sales Assistant',
    description: 'Helps customers with product inquiries and sales',
    status: 'active',
    flow: {
      nodes: [
        { id: 'node_1', type: 'start', position: { x: 100, y: 100 }, data: {} },
        { id: 'node_2', type: 'message', position: { x: 300, y: 100 }, data: { message: 'Welcome! Looking for something specific?' } },
        { id: 'node_3', type: 'ai_response', position: { x: 500, y: 100 }, data: {} },
        { id: 'node_4', type: 'end', position: { x: 700, y: 100 }, data: {} },
      ],
      connections: [
        { id: 'conn_1', source: 'node_1', target: 'node_2' },
        { id: 'conn_2', source: 'node_2', target: 'node_3' },
        { id: 'conn_3', source: 'node_3', target: 'node_4' },
      ],
    },
    aiConfig: {
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 400,
      systemPrompt: 'You are a sales assistant. Help customers find products and answer questions.',
      fallbackResponse: 'Let me get a sales representative to help you with that.',
      confidenceThreshold: 0.6,
    },
    trainingData: {
      faqs: [
        {
          question: 'Do you offer discounts?',
          answer: 'Yes! We offer seasonal discounts and special promotions for newsletter subscribers.',
          variations: ['Any discounts available?', 'Promo codes?', 'Sales?'],
        },
      ],
      documents: [],
      urls: [],
      intentExamples: [],
    },
    stats: {
      totalConversations: 8934,
      totalMessages: 23456,
      avgResponseTime: 0.8,
      satisfactionRate: 4.5,
      handoffCount: 456,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    userId: '1',
  },
  {
    id: 'bot_3',
    name: 'Appointment Bot',
    description: 'Schedules appointments and manages bookings',
    status: 'inactive',
    flow: {
      nodes: [],
      connections: [],
    },
    aiConfig: {
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 300,
      systemPrompt: 'You are an appointment scheduling assistant.',
      fallbackResponse: 'I can help you schedule an appointment. What date works for you?',
      confidenceThreshold: 0.8,
    },
    trainingData: {
      faqs: [],
      documents: [],
      urls: [],
      intentExamples: [],
    },
    stats: {
      totalConversations: 0,
      totalMessages: 0,
      avgResponseTime: 0,
      satisfactionRate: 0,
      handoffCount: 0,
    },
    createdAt: new Date().toISOString(),
    userId: '1',
  },
];

export const useChatbotStore = create<ChatbotState>((set) => ({
  chatbots: mockChatbots,
  isLoading: false,
  selectedChatbot: null,

  fetchChatbots: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  createChatbot: async (data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newChatbot: Chatbot = {
      id: `bot_${Date.now()}`,
      name: data.name || 'New Chatbot',
      description: data.description || '',
      status: 'inactive',
      flow: {
        nodes: [
          { id: `node_${Date.now()}`, type: 'start', position: { x: 100, y: 100 }, data: {} },
          { id: `node_${Date.now() + 1}`, type: 'end', position: { x: 300, y: 100 }, data: {} },
        ],
        connections: [],
      },
      aiConfig: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'You are a helpful assistant.',
        fallbackResponse: 'I apologize, but I did not understand that.',
        confidenceThreshold: 0.7,
      },
      trainingData: {
        faqs: [],
        documents: [],
        urls: [],
        intentExamples: [],
      },
      stats: {
        totalConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        satisfactionRate: 0,
        handoffCount: 0,
      },
      createdAt: new Date().toISOString(),
      userId: '1',
    };
    set((state) => ({
      chatbots: [...state.chatbots, newChatbot],
      isLoading: false,
    }));
  },

  updateChatbot: async (id, data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      chatbots: state.chatbots.map(b =>
        b.id === id ? { ...b, ...data } : b
      ),
      isLoading: false,
    }));
  },

  deleteChatbot: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      chatbots: state.chatbots.filter(b => b.id !== id),
      selectedChatbot: state.selectedChatbot?.id === id ? null : state.selectedChatbot,
      isLoading: false,
    }));
  },

  selectChatbot: (chatbot) => {
    set({ selectedChatbot: chatbot });
  },

  updateFlow: async (chatbotId, nodes, connections) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      chatbots: state.chatbots.map(b =>
        b.id === chatbotId ? { ...b, flow: { nodes, connections } } : b
      ),
      selectedChatbot: state.selectedChatbot?.id === chatbotId
        ? { ...state.selectedChatbot, flow: { nodes, connections } }
        : state.selectedChatbot,
      isLoading: false,
    }));
  },

  trainChatbot: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 3000));
    set((state) => ({
      chatbots: state.chatbots.map(b =>
        b.id === id ? { ...b, status: b.status === 'training' ? 'active' : b.status } : b
      ),
      isLoading: false,
    }));
  },

  toggleChatbot: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      chatbots: state.chatbots.map(b =>
        b.id === id ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b
      ),
      isLoading: false,
    }));
  },
}));
