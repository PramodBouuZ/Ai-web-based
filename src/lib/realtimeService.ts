// ============================================
// REAL-TIME SERVICE
// WebSocket-based real-time communication for chat
// ============================================

import type {
  RealtimeEvent,
  RealtimeEventType,
  ChatMessage,
  Conversation,
  Agent,
  AgentStatus,
  TypingIndicator,
} from '@/types/chat';

// ============================================
// EVENT CALLBACKS
// ============================================

type EventCallback<T = any> = (payload: T) => void;

interface EventCallbacks {
  message_received: EventCallback<ChatMessage>[];
  message_sent: EventCallback<ChatMessage>[];
  message_status_update: EventCallback<{ messageId: string; status: string }>[];
  conversation_created: EventCallback<Conversation>[];
  conversation_assigned: EventCallback<{ conversationId: string; agentId: string }>[];
  conversation_updated: EventCallback<Conversation>[];
  agent_status_changed: EventCallback<{ agentId: string; status: AgentStatus }>[];
  agent_typing: EventCallback<TypingIndicator>[];
  bot_response: EventCallback<{ conversationId: string; response: string }>[];
  queue_updated: EventCallback<{ queueId: string; count: number }>[];
  sla_warning: EventCallback<{ conversationId: string; minutesRemaining: number }>[];
  escalation_triggered: EventCallback<{ conversationId: string; reason: string }>[];
  customer_typing: EventCallback<TypingIndicator>[];
  notification: EventCallback<{ type: string; message: string; data?: any }>[];
}

// ============================================
// REAL-TIME SERVICE
// ============================================

export class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isConnecting: boolean = false;
  
  private callbacks: EventCallbacks = {
    message_received: [],
    message_sent: [],
    message_status_update: [],
    conversation_created: [],
    conversation_assigned: [],
    conversation_updated: [],
    agent_status_changed: [],
    agent_typing: [],
    bot_response: [],
    queue_updated: [],
    sla_warning: [],
    escalation_triggered: [],
    customer_typing: [],
    notification: [],
  };

  private tenantId: string | null = null;
  private agentId: string | null = null;
  private presenceInterval: ReturnType<typeof setInterval> | null = null;

  // Simulated mode for demo (no actual WebSocket server)
  private simulatedMode: boolean = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private simulatedCallbacks: Map<string, Set<any>> = new Map();

  constructor(simulated: boolean = true) {
    this.simulatedMode = simulated;
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  /**
   * Connect to WebSocket server
   */
  connect(tenantId: string, agentId?: string): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.tenantId = tenantId;
    this.agentId = agentId || null;
    this.isConnecting = true;

    if (this.simulatedMode) {
      this.handleSimulatedConnect();
      return;
    }

    try {
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'wss://api.example.com/ws'}?tenantId=${tenantId}&agentId=${agentId || ''}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.startPresenceUpdates();
        this.emit('notification', { type: 'connected', message: 'Connected to chat server' });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.stopHeartbeat();
        this.stopPresenceUpdates();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('notification', { type: 'error', message: 'Connection error' });
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.stopPresenceUpdates();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    if (this.simulatedMode) {
      return !!this.tenantId;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ============================================
  // SIMULATED MODE
  // ============================================

  private handleSimulatedConnect(): void {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Start presence updates in simulated mode
    this.startPresenceUpdates();
    
    this.emit('notification', { 
      type: 'connected', 
      message: 'Connected to chat server (simulated mode)' 
    });

    // Simulate initial data load
    setTimeout(() => {
      this.emit('queue_updated', { queueId: 'default', count: 0 });
    }, 500);
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  private handleMessage(data: string): void {
    try {
      const event: RealtimeEvent = JSON.parse(data);
      this.emit(event.type, event.payload);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private send(message: any): void {
    if (this.simulatedMode) {
      // In simulated mode, just log the message
      console.log('[Simulated WS] Sending:', message);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // ============================================
  // EVENT SUBSCRIPTION
  // ============================================

  /**
   * Subscribe to event
   */
  on<T>(eventType: RealtimeEventType, callback: EventCallback<T>): () => void {
    const callbacks = this.callbacks[eventType] as EventCallback<T>[];
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to event once
   */
  once<T>(eventType: RealtimeEventType, callback: EventCallback<T>): void {
    const unsubscribe = this.on<T>(eventType, (payload) => {
      unsubscribe();
      callback(payload);
    });
  }

  /**
   * Emit event to subscribers
   */
  private emit<T>(eventType: RealtimeEventType, payload: T): void {
    const callbacks = this.callbacks[eventType] as EventCallback<T>[];
    callbacks.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }

  // ============================================
  // HEARTBEAT & RECONNECTION
  // ============================================

  private startHeartbeat(): void {
    if (this.simulatedMode) return;
    
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('notification', { 
        type: 'error', 
        message: 'Failed to reconnect. Please refresh the page.' 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      if (this.tenantId) {
        this.connect(this.tenantId, this.agentId || undefined);
      }
    }, delay);

    this.emit('notification', { 
      type: 'reconnecting', 
      message: `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})` 
    });
  }

  // ============================================
  // PRESENCE MANAGEMENT
  // ============================================

  private startPresenceUpdates(): void {
    // Send presence update every 30 seconds
    this.presenceInterval = setInterval(() => {
      if (this.agentId) {
        this.updatePresence(this.agentId, 'online');
      }
    }, 30000);
  }

  private stopPresenceUpdates(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
  }

  /**
   * Update agent presence
   */
  updatePresence(agentId: string, status: AgentStatus): void {
    this.send({
      type: 'presence_update',
      agentId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set typing indicator
   */
  setTyping(conversationId: string, isTyping: boolean): void {
    this.send({
      type: 'typing',
      conversationId,
      agentId: this.agentId,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================

  /**
   * Send chat message
   */
  sendMessage(conversationId: string, content: any): void {
    this.send({
      type: 'send_message',
      conversationId,
      content,
      agentId: this.agentId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(conversationId: string, messageId: string): void {
    this.send({
      type: 'mark_read',
      conversationId,
      messageId,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // CONVERSATION OPERATIONS
  // ============================================

  /**
   * Join conversation
   */
  joinConversation(conversationId: string): void {
    this.send({
      type: 'join_conversation',
      conversationId,
      agentId: this.agentId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Leave conversation
   */
  leaveConversation(conversationId: string): void {
    this.send({
      type: 'leave_conversation',
      conversationId,
      agentId: this.agentId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Assign conversation to agent
   */
  assignConversation(conversationId: string, agentId: string): void {
    this.send({
      type: 'assign_conversation',
      conversationId,
      agentId,
      assignedBy: this.agentId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Transfer conversation to another agent
   */
  transferConversation(conversationId: string, toAgentId: string, reason?: string): void {
    this.send({
      type: 'transfer_conversation',
      conversationId,
      fromAgentId: this.agentId,
      toAgentId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Close conversation
   */
  closeConversation(conversationId: string, resolution?: string): void {
    this.send({
      type: 'close_conversation',
      conversationId,
      agentId: this.agentId,
      resolution,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Escalate conversation
   */
  escalateConversation(conversationId: string, reason: string): void {
    this.send({
      type: 'escalate_conversation',
      conversationId,
      agentId: this.agentId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // AGENT OPERATIONS
  // ============================================

  /**
   * Update agent status
   */
  updateAgentStatus(status: AgentStatus): void {
    if (this.agentId) {
      this.send({
        type: 'agent_status',
        agentId: this.agentId,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Request queue update
   */
  requestQueueUpdate(queueId: string): void {
    this.send({
      type: 'queue_update_request',
      queueId,
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================
// SIMULATED REALTIME SERVICE (for demo/testing)
// ============================================

export class SimulatedRealtimeService {
  private eventBus: Map<RealtimeEventType, Set<EventCallback>> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private agents: Map<string, Agent> = new Map();
  private typingTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor() {
    // Initialize event bus
    const eventTypes: RealtimeEventType[] = [
      'message_received', 'message_sent', 'message_status_update',
      'conversation_created', 'conversation_assigned', 'conversation_updated',
      'agent_status_changed', 'agent_typing', 'bot_response',
      'queue_updated', 'sla_warning', 'escalation_triggered',
      'customer_typing', 'notification',
    ];
    eventTypes.forEach(type => this.eventBus.set(type, new Set()));
  }

  /**
   * Subscribe to event
   */
  on<T>(eventType: RealtimeEventType, callback: EventCallback<T>): () => void {
    const callbacks = this.eventBus.get(eventType)!;
    callbacks.add(callback);

    return () => callbacks.delete(callback);
  }

  /**
   * Emit event
   */
  emit<T>(eventType: RealtimeEventType, payload: T): void {
    const callbacks = this.eventBus.get(eventType);
    callbacks?.forEach(cb => {
      try {
        cb(payload);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }

  /**
   * Simulate incoming message
   */
  simulateIncomingMessage(conversationId: string, message: Partial<ChatMessage>): void {
    const fullMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      tenantId: 'tenant_1',
      type: 'text',
      direction: 'inbound',
      from: message.from || 'customer',
      to: message.to || 'bot',
      content: message.content || { text: 'Hello' },
      status: 'delivered',
      metadata: {},
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      replyTo: null,
      ...message,
    } as ChatMessage;

    // Store message
    const messages = this.messages.get(conversationId) || [];
    messages.push(fullMessage);
    this.messages.set(conversationId, messages);

    // Emit event
    this.emit('message_received', fullMessage);

    // Simulate bot response after delay
    setTimeout(() => {
      this.simulateBotResponse(conversationId, fullMessage);
    }, 1500);
  }

  /**
   * Simulate bot response
   */
  simulateBotResponse(conversationId: string, incomingMessage: ChatMessage): void {
    const responses: Record<string, string> = {
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hi there! What can I do for you?',
      'help': 'I\'m here to help! Please tell me what you need assistance with.',
      'pricing': 'I can help you with pricing information. What product or service are you interested in?',
      'support': 'I\'ll connect you with our support team. Please describe your issue.',
      'agent': 'I understand you\'d like to speak with a human agent. Let me transfer you...',
    };

    const text = incomingMessage.content.text?.toLowerCase() || '';
    let responseText = 'Thank you for your message. How can I assist you further?';

    for (const [keyword, response] of Object.entries(responses)) {
      if (text.includes(keyword)) {
        responseText = response;
        break;
      }
    }

    const botMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      tenantId: 'tenant_1',
      type: 'text',
      direction: 'outbound',
      from: 'bot',
      to: incomingMessage.from,
      content: { text: responseText },
      status: 'sent',
      metadata: { botGenerated: true },
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      replyTo: null,
    };

    const messages = this.messages.get(conversationId) || [];
    messages.push(botMessage);
    this.messages.set(conversationId, messages);

    this.emit('bot_response', { conversationId, response: responseText });
    this.emit('message_sent', botMessage);
  }

  /**
   * Simulate agent message
   */
  simulateAgentMessage(conversationId: string, agentId: string, text: string): void {
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      tenantId: 'tenant_1',
      type: 'text',
      direction: 'outbound',
      from: agentId,
      to: 'customer',
      content: { text },
      status: 'sent',
      metadata: { agentId },
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      replyTo: null,
    };

    const messages = this.messages.get(conversationId) || [];
    messages.push(message);
    this.messages.set(conversationId, messages);

    this.emit('message_sent', message);
  }

  /**
   * Simulate typing indicator
   */
  simulateTyping(conversationId: string, agentId: string | null, duration: number = 2000): void {
    const key = `${conversationId}_${agentId || 'customer'}`;
    
    // Clear existing timer
    if (this.typingTimers.has(key)) {
      clearTimeout(this.typingTimers.get(key)!);
    }

    // Emit typing start
    this.emit(agentId ? 'agent_typing' : 'customer_typing', {
      conversationId,
      agentId,
      customerWaId: agentId ? null : 'customer',
      isTyping: true,
      timestamp: new Date().toISOString(),
    });

    // Emit typing stop after duration
    const timer = setTimeout(() => {
      this.emit(agentId ? 'agent_typing' : 'customer_typing', {
        conversationId,
        agentId,
        customerWaId: agentId ? null : 'customer',
        isTyping: false,
        timestamp: new Date().toISOString(),
      });
      this.typingTimers.delete(key);
    }, duration);

    this.typingTimers.set(key, timer);
  }

  /**
   * Get messages for conversation
   */
  getMessages(conversationId: string): ChatMessage[] {
    return this.messages.get(conversationId) || [];
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.conversations.clear();
    this.messages.clear();
    this.agents.clear();
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

let realtimeServiceInstance: RealtimeService | null = null;
let simulatedServiceInstance: SimulatedRealtimeService | null = null;

export function initializeRealtimeService(simulated: boolean = true): RealtimeService {
  realtimeServiceInstance = new RealtimeService(simulated);
  return realtimeServiceInstance;
}

export function getRealtimeService(): RealtimeService | null {
  return realtimeServiceInstance;
}

export function getSimulatedService(): SimulatedRealtimeService {
  if (!simulatedServiceInstance) {
    simulatedServiceInstance = new SimulatedRealtimeService();
  }
  return simulatedServiceInstance;
}

export default RealtimeService;
