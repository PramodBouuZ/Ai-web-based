// ============================================
// CHAT STORE
// Multi-tenant chat state management with Zustand
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Conversation,
  ChatMessage,
  Agent,
  AgentQueue,
  AgentStatus,
  RoutingRule,
  KeywordMapping,
  ChatbotConfig,
  BotSession,
  Department,
  QuickReply,
  ChatTag,
  ConversationStatus,
  PriorityLevel,
} from '@/types/chat';
import { RoutingEngine, initializeRoutingEngine } from '@/lib/routingEngine';
import { AIChatbotEngine, initializeChatbotEngine, getHandoffManager } from '@/lib/aiChatbotEngine';
import { getSimulatedService } from '@/lib/realtimeService';

// ============================================
// STORE STATE
// ============================================

interface ChatState {
  // Current user context
  currentTenantId: string | null;
  currentAgentId: string | null;
  
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Messages (keyed by conversationId)
  messages: Record<string, ChatMessage[]>;
  
  // Agents
  agents: Agent[];
  
  // Queues
  queues: AgentQueue[];
  
  // Departments
  departments: Department[];
  
  // Routing
  routingRules: RoutingRule[];
  keywordMappings: KeywordMapping[];
  
  // Chatbot
  chatbotConfigs: ChatbotConfig[];
  botSessions: Record<string, BotSession>;
  
  // UI State
  isAgentOnline: boolean;
  agentStatus: AgentStatus;
  unreadCount: number;
  activeFilters: {
    status: ConversationStatus[];
    priority: PriorityLevel[];
    assignedToMe: boolean;
    department: string | null;
  };
  searchQuery: string;
  
  // Quick replies and tags
  quickReplies: QuickReply[];
  tags: ChatTag[];
  
  // Typing indicators
  typingConversations: Set<string>;
  
  // Loading states
  isLoading: boolean;
  isSending: boolean;
}

// ============================================
// STORE ACTIONS
// ============================================

interface ChatActions {
  // Tenant & Agent
  setCurrentTenant: (tenantId: string) => void;
  setCurrentAgent: (agentId: string) => void;
  
  // Conversations
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  assignConversation: (conversationId: string, agentId: string) => void;
  closeConversation: (conversationId: string, resolution?: string) => void;
  
  // Messages
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: ChatMessage['status']) => void;
  sendMessage: (conversationId: string, content: any) => Promise<void>;
  
  // Agents
  setAgents: (agents: Agent[]) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  
  // Queues
  setQueues: (queues: AgentQueue[]) => void;
  updateQueue: (queueId: string, updates: Partial<AgentQueue>) => void;
  
  // Routing
  setRoutingRules: (rules: RoutingRule[]) => void;
  setKeywordMappings: (keywords: KeywordMapping[]) => void;
  addRoutingRule: (rule: RoutingRule) => void;
  updateRoutingRule: (ruleId: string, updates: Partial<RoutingRule>) => void;
  deleteRoutingRule: (ruleId: string) => void;
  addKeywordMapping: (keyword: KeywordMapping) => void;
  deleteKeywordMapping: (keywordId: string) => void;
  
  // Chatbot
  setChatbotConfigs: (configs: ChatbotConfig[]) => void;
  updateChatbotConfig: (configId: string, updates: Partial<ChatbotConfig>) => void;
  
  // Filters & Search
  setFilter: (filter: Partial<ChatState['activeFilters']>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Quick Replies & Tags
  setQuickReplies: (replies: QuickReply[]) => void;
  addQuickReply: (reply: QuickReply) => void;
  deleteQuickReply: (replyId: string) => void;
  setTags: (tags: ChatTag[]) => void;
  addTagToConversation: (conversationId: string, tagId: string) => void;
  removeTagFromConversation: (conversationId: string, tagId: string) => void;
  
  // Typing
  setTyping: (conversationId: string, isTyping: boolean) => void;
  
  // Loading
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  
  // Computed
  getFilteredConversations: () => Conversation[];
  getConversationMessages: (conversationId: string) => ChatMessage[];
  getCurrentConversation: () => Conversation | null;
  getMyConversations: () => Conversation[];
  getQueueConversations: (queueId: string) => Conversation[];
  getUnreadConversations: () => Conversation[];
  
  // Actions
  initializeChat: (tenantId: string, agentId?: string) => void;
  handleIncomingMessage: (message: ChatMessage) => void;
  handleBotResponse: (conversationId: string, response: string) => void;
  requestHandoff: (conversationId: string, reason: string) => void;
  acceptHandoff: (conversationId: string) => void;
  transferConversation: (conversationId: string, toAgentId: string, reason?: string) => void;
  toggleBot: (conversationId: string, active: boolean) => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: ChatState = {
  currentTenantId: null,
  currentAgentId: null,
  conversations: [],
  currentConversationId: null,
  messages: {},
  agents: [],
  queues: [],
  departments: [],
  routingRules: [],
  keywordMappings: [],
  chatbotConfigs: [],
  botSessions: {},
  isAgentOnline: false,
  agentStatus: 'offline',
  unreadCount: 0,
  activeFilters: {
    status: [],
    priority: [],
    assignedToMe: false,
    department: null,
  },
  searchQuery: '',
  quickReplies: [],
  tags: [],
  typingConversations: new Set(),
  isLoading: false,
  isSending: false,
};

// ============================================
// STORE CREATION
// ============================================

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // TENANT & AGENT
      // ============================================

      setCurrentTenant: (tenantId) => {
        set({ currentTenantId: tenantId });
        get().initializeChat(tenantId);
      },

      setCurrentAgent: (agentId) => {
        set({ currentAgentId: agentId });
      },

      // ============================================
      // CONVERSATIONS
      // ============================================

      setConversations: (conversations) => {
        set({ conversations });
      },

      addConversation: (conversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));
      },

      updateConversation: (conversationId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...updates } : c
          ),
        }));
      },

      setCurrentConversation: (conversationId) => {
        set({ currentConversationId: conversationId });
        
        // Mark messages as read when opening conversation
        if (conversationId) {
          const messages = get().messages[conversationId] || [];
          messages.forEach((msg) => {
            if (msg.direction === 'inbound' && msg.status !== 'read') {
              get().updateMessageStatus(conversationId, msg.id, 'read');
            }
          });
        }
      },

      assignConversation: (conversationId, agentId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, assignedAgentId: agentId, status: 'assigned', updatedAt: new Date().toISOString() }
              : c
          ),
        }));

        // Notify via realtime service
        const simulatedService = getSimulatedService();
        simulatedService.emit('conversation_assigned', { conversationId, agentId });
      },

      closeConversation: (conversationId, resolution) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, status: 'closed', updatedAt: new Date().toISOString() }
              : c
          ),
        }));

        const simulatedService = getSimulatedService();
        simulatedService.emit('conversation_updated', {
          id: conversationId,
          status: 'closed',
        } as unknown as Conversation);
      },

      // ============================================
      // MESSAGES
      // ============================================

      setMessages: (conversationId, messages) => {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        }));
      },

      addMessage: (conversationId, message) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), message],
          },
        }));

        // Update conversation last message time
        get().updateConversation(conversationId, {
          lastMessageAt: message.createdAt,
        });
      },

      updateMessageStatus: (conversationId, messageId, status) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map((m) =>
              m.id === messageId ? { ...m, status } : m
            ),
          },
        }));
      },

      sendMessage: async (conversationId, content) => {
        const { currentAgentId } = get();
        if (!currentAgentId) return;

        set({ isSending: true });

        try {
          const message: ChatMessage = {
            id: `msg_${Date.now()}`,
            conversationId,
            tenantId: get().currentTenantId || '',
            type: content.type || 'text',
            direction: 'outbound',
            from: currentAgentId,
            to: 'customer',
            content,
            status: 'sending',
            metadata: { agentId: currentAgentId },
            createdAt: new Date().toISOString(),
            editedAt: null,
            deletedAt: null,
            replyTo: null,
          };

          get().addMessage(conversationId, message);

          // Simulate sending delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Update status to sent
          get().updateMessageStatus(conversationId, message.id, 'sent');

          // Update conversation status
          get().updateConversation(conversationId, {
            status: 'active',
            lastAgentMessageAt: new Date().toISOString(),
          });

          // Emit via simulated service
          const simulatedService = getSimulatedService();
          simulatedService.simulateAgentMessage(conversationId, currentAgentId, content.text);
        } finally {
          set({ isSending: false });
        }
      },

      // ============================================
      // AGENTS
      // ============================================

      setAgents: (agents) => {
        set({ agents });
      },

      updateAgentStatus: (agentId, status) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status, lastActiveAt: new Date().toISOString() } : a
          ),
        }));

        const simulatedService = getSimulatedService();
        simulatedService.emit('agent_status_changed', { agentId, status });
      },

      updateAgent: (agentId, updates) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, ...updates } : a
          ),
        }));
      },

      // ============================================
      // QUEUES
      // ============================================

      setQueues: (queues) => {
        set({ queues });
      },

      updateQueue: (queueId, updates) => {
        set((state) => ({
          queues: state.queues.map((q) =>
            q.id === queueId ? { ...q, ...updates } : q
          ),
        }));
      },

      // ============================================
      // ROUTING
      // ============================================

      setRoutingRules: (rules) => {
        set({ routingRules: rules });
      },

      setKeywordMappings: (keywords) => {
        set({ keywordMappings: keywords });
      },

      addRoutingRule: (rule) => {
        set((state) => ({
          routingRules: [...state.routingRules, rule],
        }));
      },

      updateRoutingRule: (ruleId, updates) => {
        set((state) => ({
          routingRules: state.routingRules.map((r) =>
            r.id === ruleId ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRoutingRule: (ruleId) => {
        set((state) => ({
          routingRules: state.routingRules.filter((r) => r.id !== ruleId),
        }));
      },

      addKeywordMapping: (keyword) => {
        set((state) => ({
          keywordMappings: [...state.keywordMappings, keyword],
        }));
      },

      deleteKeywordMapping: (keywordId) => {
        set((state) => ({
          keywordMappings: state.keywordMappings.filter((k) => k.id !== keywordId),
        }));
      },

      // ============================================
      // CHATBOT
      // ============================================

      setChatbotConfigs: (configs) => {
        set({ chatbotConfigs: configs });
      },

      updateChatbotConfig: (configId, updates) => {
        set((state) => ({
          chatbotConfigs: state.chatbotConfigs.map((c) =>
            c.id === configId ? { ...c, ...updates } : c
          ),
        }));
      },

      // ============================================
      // FILTERS & SEARCH
      // ============================================

      setFilter: (filter) => {
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filter },
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      clearFilters: () => {
        set({
          activeFilters: {
            status: [],
            priority: [],
            assignedToMe: false,
            department: null,
          },
          searchQuery: '',
        });
      },

      // ============================================
      // QUICK REPLIES & TAGS
      // ============================================

      setQuickReplies: (replies) => {
        set({ quickReplies: replies });
      },

      addQuickReply: (reply) => {
        set((state) => ({
          quickReplies: [...state.quickReplies, reply],
        }));
      },

      deleteQuickReply: (replyId) => {
        set((state) => ({
          quickReplies: state.quickReplies.filter((r) => r.id !== replyId),
        }));
      },

      setTags: (tags) => {
        set({ tags });
      },

      addTagToConversation: (conversationId, tagId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId && !c.tags.includes(tagId)
              ? { ...c, tags: [...c.tags, tagId] }
              : c
          ),
        }));
      },

      removeTagFromConversation: (conversationId, tagId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, tags: c.tags.filter((t) => t !== tagId) }
              : c
          ),
        }));
      },

      // ============================================
      // TYPING
      // ============================================

      setTyping: (conversationId, isTyping) => {
        set((state) => {
          const newSet = new Set(state.typingConversations);
          if (isTyping) {
            newSet.add(conversationId);
          } else {
            newSet.delete(conversationId);
          }
          return { typingConversations: newSet };
        });
      },

      // ============================================
      // LOADING
      // ============================================

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setSending: (sending) => {
        set({ isSending: sending });
      },

      // ============================================
      // COMPUTED
      // ============================================

      getFilteredConversations: () => {
        const state = get();
        let filtered = state.conversations;

        // Filter by status
        if (state.activeFilters.status.length > 0) {
          filtered = filtered.filter((c) =>
            state.activeFilters.status.includes(c.status)
          );
        }

        // Filter by priority
        if (state.activeFilters.priority.length > 0) {
          filtered = filtered.filter((c) =>
            state.activeFilters.priority.includes(c.priority)
          );
        }

        // Filter by assigned to me
        if (state.activeFilters.assignedToMe && state.currentAgentId) {
          filtered = filtered.filter(
            (c) => c.assignedAgentId === state.currentAgentId
          );
        }

        // Filter by department
        if (state.activeFilters.department) {
          filtered = filtered.filter(
            (c) => c.departmentId === state.activeFilters.department
          );
        }

        // Search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.customerName?.toLowerCase().includes(query) ||
              c.waId.includes(query) ||
              c.tags.some((t) => t.toLowerCase().includes(query))
          );
        }

        // Sort by last message time (newest first)
        return filtered.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );
      },

      getConversationMessages: (conversationId) => {
        return get().messages[conversationId] || [];
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        return (
          conversations.find((c) => c.id === currentConversationId) || null
        );
      },

      getMyConversations: () => {
        const { conversations, currentAgentId } = get();
        if (!currentAgentId) return [];
        return conversations.filter(
          (c) => c.assignedAgentId === currentAgentId && c.status !== 'closed'
        );
      },

      getQueueConversations: (queueId) => {
        return get().conversations.filter(
          (c) => c.assignedQueueId === queueId && !c.assignedAgentId
        );
      },

      getUnreadConversations: () => {
        const { conversations, currentAgentId } = get();
        return conversations.filter(
          (c) =>
            c.assignedAgentId === currentAgentId &&
            c.status !== 'closed' &&
            new Date(c.lastMessageAt) > new Date(c.updatedAt)
        );
      },

      // ============================================
      // ACTIONS
      // ============================================

      initializeChat: (tenantId, agentId) => {
        set({ currentTenantId: tenantId, currentAgentId: agentId || null });

        // Subscribe to simulated realtime events
        const simulatedService = getSimulatedService();

        simulatedService.on('message_received', (message: ChatMessage) => {
          get().handleIncomingMessage(message);
        });

        simulatedService.on('message_sent', (message: ChatMessage) => {
          get().addMessage(message.conversationId, message);
        });

        simulatedService.on('conversation_assigned', (data: { conversationId: string; agentId: string }) => {
          get().updateConversation(data.conversationId, {
            assignedAgentId: data.agentId,
            status: 'assigned',
          });
        });

        simulatedService.on('bot_response', (data: { conversationId: string; response: string }) => {
          get().handleBotResponse(data.conversationId, data.response);
        });
      },

      handleIncomingMessage: (message) => {
        const state = get();
        
        // Check if conversation exists
        let conversation = state.conversations.find(
          (c) => c.id === message.conversationId
        );

        if (!conversation) {
          // Create new conversation
          conversation = {
            id: message.conversationId,
            tenantId: message.tenantId,
            phoneNumberId: 'default',
            waId: message.from,
            customerName: null,
            customerProfile: null,
            status: 'pending',
            priority: 'medium',
            source: 'whatsapp',
            assignedAgentId: null,
            assignedQueueId: null,
            departmentId: null,
            botActive: true,
            botSessionId: null,
            lastMessageAt: message.createdAt,
            lastAgentMessageAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {},
            tags: [],
            notes: [],
            slaDeadline: null,
            firstResponseTime: null,
            resolutionTime: null,
          };

          get().addConversation(conversation);

          // Apply Keyword Routing for new conversation
          const text = message.content.text?.toLowerCase() || '';
          const matchedKeyword = state.keywordMappings.find(km =>
            km.isActive && text.includes(km.keyword.toLowerCase())
          );

          if (matchedKeyword) {
            if (matchedKeyword.action.type === 'assign_agent' && matchedKeyword.action.targetId) {
              get().assignConversation(conversation.id, matchedKeyword.action.targetId);
            } else if (matchedKeyword.action.type === 'assign_queue') {
              get().updateConversation(conversation.id, {
                assignedQueueId: matchedKeyword.action.targetId,
                status: 'queued'
              });
            }
          } else {
            // Apply Round-robin if no keyword matches and no agent assigned
            const onlineAgents = state.agents.filter(a => a.status === 'online');
            if (onlineAgents.length > 0) {
              // Simple round-robin: assign to agent with fewest active conversations
              const agentLoads = onlineAgents.map(agent => ({
                id: agent.id,
                count: state.conversations.filter(c => c.assignedAgentId === agent.id && c.status === 'active').length
              }));
              const leastBusyAgent = agentLoads.sort((a, b) => a.count - b.count)[0];
              get().assignConversation(conversation.id, leastBusyAgent.id);
            }
          }
        }

        // Add message
        get().addMessage(message.conversationId, message);

        // Update unread count
        set((state) => ({
          unreadCount: state.unreadCount + 1,
        }));
      },

      handleBotResponse: (conversationId, response) => {
        const message: ChatMessage = {
          id: `msg_${Date.now()}`,
          conversationId,
          tenantId: get().currentTenantId || '',
          type: 'text',
          direction: 'outbound',
          from: 'bot',
          to: 'customer',
          content: { text: response },
          status: 'sent',
          metadata: { botGenerated: true },
          createdAt: new Date().toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        };

        get().addMessage(conversationId, message);
      },

      requestHandoff: (conversationId, reason) => {
        const handoffManager = getHandoffManager();
        const conversation = get().conversations.find((c) => c.id === conversationId);
        
        if (conversation) {
          handoffManager.requestHandoff({
            conversationId,
            tenantId: conversation.tenantId,
            reason,
            priority: conversation.priority as any,
            customerContext: {
              messageCount: get().messages[conversationId]?.length || 0,
              lastIntent: null,
              collectedData: {},
              conversationSummary: '',
            },
            requestedAt: new Date().toISOString(),
          });

          get().updateConversation(conversationId, {
            status: 'escalated',
            botActive: false,
          });
        }
      },

      acceptHandoff: (conversationId) => {
        const { currentAgentId } = get();
        if (!currentAgentId) return;

        const handoffManager = getHandoffManager();
        handoffManager.assignHandoff(conversationId, currentAgentId);

        get().updateConversation(conversationId, {
          assignedAgentId: currentAgentId,
          status: 'assigned',
          botActive: false,
        });
      },

      transferConversation: (conversationId, toAgentId, reason) => {
        const { currentAgentId } = get();
        
        const simulatedService = getSimulatedService();
        simulatedService.emit('conversation_assigned', {
          conversationId,
          agentId: toAgentId,
        });

        get().updateConversation(conversationId, {
          assignedAgentId: toAgentId,
          status: 'assigned',
        });
      },

      toggleBot: (conversationId, active) => {
        get().updateConversation(conversationId, {
          botActive: active,
        });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        currentTenantId: state.currentTenantId,
        currentAgentId: state.currentAgentId,
        quickReplies: state.quickReplies,
        tags: state.tags,
      }),
    }
  )
);

export default useChatStore;
