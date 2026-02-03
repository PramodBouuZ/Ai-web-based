// ============================================
// REAL-TIME CHAT SYSTEM TYPES
// Multi-Tenant WhatsApp Chat Management & AI Chatbot
// ============================================

// ============================================
// CORE CONVERSATION TYPES
// ============================================

export interface Conversation {
  id: string;
  tenantId: string;
  phoneNumberId: string;
  waId: string; // WhatsApp ID (customer phone)
  customerName: string | null;
  customerProfile: CustomerProfile | null;
  status: ConversationStatus;
  priority: PriorityLevel;
  source: 'whatsapp' | 'instagram' | 'facebook' | 'other';
  assignedAgentId: string | null;
  assignedQueueId: string | null;
  departmentId: string | null;
  botActive: boolean;
  botSessionId: string | null;
  lastMessageAt: string;
  lastAgentMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  tags: string[];
  notes: ConversationNote[];
  slaDeadline: string | null;
  firstResponseTime: number | null; // seconds
  resolutionTime: number | null; // seconds
}

export type ConversationStatus = 
  | 'pending'      // New, not yet routed
  | 'bot_handling' // AI chatbot is responding
  | 'queued'       // In agent queue waiting
  | 'assigned'     // Assigned to agent
  | 'active'       // Agent actively chatting
  | 'waiting'      // Waiting for customer reply
  | 'resolved'     // Issue resolved
  | 'closed'       // Closed/archived
  | 'escalated';   // Escalated to supervisor

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface CustomerProfile {
  name: string | null;
  phone: string;
  email: string | null;
  language: string;
  country: string | null;
  timezone: string | null;
  customFields: Record<string, any>;
  tags: string[];
  previousConversations: number;
  isVip: boolean;
  lastContactAt: string | null;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface ChatMessage {
  id: string;
  conversationId: string;
  tenantId: string;
  type: MessageType;
  direction: 'inbound' | 'outbound';
  from: string; // waId or agentId or 'bot'
  to: string;
  content: MessageContent;
  status: MessageStatus;
  metadata: MessageMetadata;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  replyTo: string | null; // message ID being replied to
}

export type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'location'
  | 'contacts'
  | 'template'
  | 'interactive'
  | 'button'
  | 'system';

export interface MessageContent {
  text?: string;
  caption?: string;
  mediaUrl?: string;
  mediaId?: string;
  mimeType?: string;
  filename?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  template?: {
    name: string;
    language: string;
    components?: any[];
  };
  interactive?: any;
  buttons?: any[];
}

export type MessageStatus = 
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'deleted';

export interface MessageMetadata {
  waMessageId?: string;
  botGenerated?: boolean;
  aiConfidence?: number;
  intentDetected?: string;
  keywordsMatched?: string[];
  routingRuleId?: string;
  queueId?: string;
  agentId?: string;
  readAt?: string;
  deliveredAt?: string;
  failedReason?: string;
}

// ============================================
// AGENT TYPES
// ============================================

export interface Agent {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: AgentRole;
  departments: string[];
  skills: AgentSkill[];
  status: AgentStatus;
  maxConcurrentChats: number;
  currentChatCount: number;
  languages: string[];
  timezone: string;
  workingHours: WorkingHours | null;
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  performance: AgentPerformance | null;
}

export type AgentRole = 
  | 'supervisor'   // Can manage agents, see all chats
  | 'team_lead'    // Can manage team, transfer chats
  | 'agent'        // Standard agent
  | 'trainee';     // Limited access, needs approval

export interface AgentSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export type AgentStatus = 
  | 'online'      // Available for new chats
  | 'busy'        // At max capacity
  | 'away'        // Temporarily away
  | 'offline'     // Not logged in
  | 'break'       // On break
  | 'training';   // In training mode

export interface WorkingHours {
  timezone: string;
  schedule: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    start: string; // HH:mm
    end: string;
    isWorking: boolean;
  }[];
}

export interface AgentPerformance {
  totalConversations: number;
  avgResponseTime: number; // seconds
  avgResolutionTime: number; // seconds
  customerRating: number; // 1-5
  satisfactionScore: number; // percentage
  firstResponseTime: number; // seconds
  resolutionRate: number; // percentage
}

// ============================================
// QUEUE & ROUTING TYPES
// ============================================

export interface AgentQueue {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  routingStrategy: RoutingStrategy;
  agents: string[]; // agent IDs
  maxWaitTime: number; // seconds
  slaTarget: number; // seconds for first response
  autoAssign: boolean;
  priority: number; // Higher = more priority
  businessHours: WorkingHours | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoutingStrategy = 
  | 'round_robin'      // Distribute evenly
  | 'least_busy'       // Assign to agent with fewest chats
  | 'skill_based'      // Match skills to conversation
  | 'priority'         // Priority-based assignment
  | 'random'           // Random assignment
  | 'longest_idle'     // Agent idle longest
  | 'manual';          // Admin assigns manually

export interface RoutingRule {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  priority: number; // 1-100, higher = evaluated first
  conditions: RoutingCondition[];
  action: RoutingAction;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingCondition {
  type: ConditionType;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'greater_than' | 'less_than' | 'in';
  value: string | string[] | number;
  caseSensitive?: boolean;
}

export type ConditionType = 
  | 'message_text'
  | 'keyword'
  | 'intent'
  | 'customer_tag'
  | 'customer_language'
  | 'customer_country'
  | 'time_of_day'
  | 'day_of_week'
  | 'queue_length'
  | 'agent_available'
  | 'conversation_priority'
  | 'previous_interactions'
  | 'customer_vip';

export interface RoutingAction {
  type: 'assign_queue' | 'assign_agent' | 'assign_department' | 'trigger_bot' | 'escalate' | 'tag';
  targetId: string | null;
  metadata?: Record<string, any>;
}

export interface KeywordMapping {
  id: string;
  tenantId: string;
  keyword: string;
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
  priority: number;
  action: RoutingAction;
  translations: Record<string, string>; // language -> translated keyword
  isActive: boolean;
  createdAt: string;
}

// ============================================
// AI CHATBOT TYPES
// ============================================

export interface ChatbotConfig {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  settings: ChatbotSettings;
  knowledgeBase: KnowledgeBase;
  flows: ChatbotFlow[];
  faqs: FAQ[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotSettings {
  model: string; // 'gpt-4', 'gpt-3.5-turbo', etc.
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  welcomeMessage: string | null;
  fallbackMessage: string;
  escalationMessage: string;
  handoffKeywords: string[];
  autoEscalateAfter: number; // seconds of inactivity
  confidenceThreshold: number; // 0-1
  tone: 'professional' | 'friendly' | 'formal' | 'casual';
  languages: string[];
  maxConsecutiveBotReplies: number;
  enableSuggestions: boolean;
  enableQuickReplies: boolean;
}

export interface KnowledgeBase {
  documents: KnowledgeDocument[];
  urls: string[];
  customData: Record<string, any>;
  lastTrainedAt: string | null;
  trainingStatus: 'idle' | 'training' | 'completed' | 'failed';
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'doc' | 'url';
  content: string;
  embeddings: number[] | null;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  variations: string[];
  category: string | null;
  tags: string[];
  confidence: number;
  usageCount: number;
  isActive: boolean;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  trigger: FlowTrigger;
  nodes: FlowNode[];
  connections: FlowConnection[];
  isActive: boolean;
}

export interface FlowTrigger {
  type: 'intent' | 'keyword' | 'event' | 'always';
  value: string;
  confidence?: number;
}

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'condition' | 'action' | 'input' | 'api' | 'end';
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface BotSession {
  id: string;
  conversationId: string;
  tenantId: string;
  context: BotContext;
  messageCount: number;
  lastIntent: string | null;
  lastConfidence: number | null;
  suggestedResponses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BotContext {
  currentTopic: string | null;
  collectedData: Record<string, any>;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  entities: Record<string, any>;
  intentStack: string[];
}

// ============================================
// REAL-TIME TYPES
// ============================================

export interface RealtimeEvent {
  type: RealtimeEventType;
  tenantId: string;
  timestamp: string;
  payload: any;
}

export type RealtimeEventType = 
  | 'message_received'
  | 'message_sent'
  | 'message_status_update'
  | 'conversation_created'
  | 'conversation_assigned'
  | 'conversation_updated'
  | 'agent_status_changed'
  | 'agent_typing'
  | 'bot_response'
  | 'queue_updated'
  | 'sla_warning'
  | 'escalation_triggered'
  | 'customer_typing'
  | 'notification';

export interface TypingIndicator {
  conversationId: string;
  agentId: string | null;
  customerWaId: string | null;
  isTyping: boolean;
  timestamp: string;
}

export interface AgentPresence {
  agentId: string;
  tenantId: string;
  status: AgentStatus;
  currentConversations: string[];
  lastSeenAt: string;
}

// ============================================
// ADMIN & ANALYTICS TYPES
// ============================================

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  email: string | null;
  queueId: string | null;
  agents: string[];
  businessHours: WorkingHours | null;
  isActive: boolean;
}

export interface ConversationNote {
  id: string;
  conversationId: string;
  agentId: string;
  content: string;
  createdAt: string;
}

export interface ChatTag {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  description: string | null;
  isActive: boolean;
}

export interface QuickReply {
  id: string;
  tenantId: string;
  shortcut: string;
  message: string;
  departmentId: string | null;
  isActive: boolean;
}

export interface SLAPolicy {
  id: string;
  tenantId: string;
  name: string;
  priority: PriorityLevel;
  firstResponseTime: number; // seconds
  resolutionTime: number; // seconds
  businessHoursOnly: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  id: string;
  slaPolicyId: string;
  trigger: 'first_response_breach' | 'resolution_breach' | 'customer_request';
  action: 'notify_manager' | 'reassign' | 'escalate_queue';
  targetId: string;
  notifyChannels: ('email' | 'push' | 'sms')[];
}

export interface ChatAnalytics {
  tenantId: string;
  period: { start: string; end: string };
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  botHandledRate: number;
  agentHandledRate: number;
  escalationRate: number;
  satisfactionScore: number;
  queueStats: QueueStat[];
  agentStats: AgentStat[];
  hourlyDistribution: HourlyStat[];
}

export interface QueueStat {
  queueId: string;
  queueName: string;
  totalChats: number;
  avgWaitTime: number;
  maxWaitTime: number;
  slaCompliance: number;
}

export interface AgentStat {
  agentId: string;
  agentName: string;
  totalChats: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  customerRating: number;
  onlineTime: number;
}

export interface HourlyStat {
  hour: number;
  incoming: number;
  resolved: number;
  botHandled: number;
  agentHandled: number;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WebhookPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: 'whatsapp';
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: WebhookContact[];
    messages?: WebhookMessage[];
    statuses?: WebhookStatus[];
    errors?: WebhookError[];
  };
  field: 'messages';
}

export interface WebhookContact {
  profile: { name: string };
  wa_id: string;
}

export interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string };
  video?: { id: string; mime_type: string; sha256: string };
  audio?: { id: string; mime_type: string; sha256: string; voice: boolean };
  document?: { id: string; mime_type: string; sha256: string; filename: string };
  location?: { latitude: string; longitude: string; name?: string; address?: string };
  contacts?: any[];
  interactive?: any;
  button?: { payload: string; text: string };
  context?: { forwarded: boolean; frequently_forwarded: boolean; from?: string; id?: string };
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: { type: string };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: any[];
}

export interface WebhookError {
  code: number;
  title: string;
  message: string;
  error_data?: any;
}
