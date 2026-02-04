// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  plan: string;
  userCount: number;
  whatsappAccounts: number;
  createdAt: string;
  updatedAt?: string;
}

// User Types
export interface User {
  id: string;
  tenantId?: string; // Optional for super_admins who might not be tied to a single tenant
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  permissions: Permission[];
}

export type UserRole = 'super_admin' | 'tenant_admin' | 'manager' | 'agent' | 'viewer';

export interface Permission {
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'manage')[];
}

// WhatsApp Account Types
export interface WhatsAppAccount {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  qrCode?: string;
  messageLimit: number;
  messagesSent: number;
  lastActiveAt?: string;
  createdAt: string;
  userId: string;
}

// Contact Types
export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  tags: string[];
  customFields: Record<string, string>;
  lastInteractionAt?: string;
  createdAt: string;
  userId: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  contacts: string[];
  createdAt: string;
}

// Message Types
export interface MessageTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'transactional' | 'otp' | 'custom';
  language: string;
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    content: string;
  };
  body: string;
  footer?: string;
  buttons?: TemplateButton[];
  variables: string[];
  status: 'draft' | 'approved' | 'rejected' | 'pending';
  createdAt: string;
}

export interface TemplateButton {
  type: 'quick_reply' | 'url' | 'phone';
  text: string;
  value?: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  template?: MessageTemplate;
  recipients: string[];
  groups: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  stats: CampaignStats;
  createdAt: string;
  userId: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  replied: number;
}

// Chatbot Types
export interface Chatbot {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'training';
  flow: ChatbotFlow;
  aiConfig: AIConfig;
  trainingData: TrainingData;
  stats: ChatbotStats;
  createdAt: string;
  userId: string;
}

export interface ChatbotFlow {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'condition' | 'action' | 'ai_response' | 'end';
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  fallbackResponse: string;
  confidenceThreshold: number;
}

export interface TrainingData {
  faqs: FAQ[];
  documents: Document[];
  urls: string[];
  intentExamples: IntentExample[];
}

export interface FAQ {
  question: string;
  answer: string;
  variations: string[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  uploadedAt: string;
}

export interface IntentExample {
  intent: string;
  examples: string[];
}

export interface ChatbotStats {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  satisfactionRate: number;
  handoffCount: number;
}

// CRM Integration Types
export interface CRMIntegration {
  id: string;
  provider: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  fieldMappings: FieldMapping[];
  lastSyncAt?: string;
  createdAt: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
}

export type CRMProvider = 'salesforce' | 'hubspot' | 'zoho' | 'pipedrive' | 'freshsales' | 'custom';

// Automation Types
export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  userId: string;
}

export interface AutomationTrigger {
  type: 'message_received' | 'contact_added' | 'tag_applied' | 'scheduled' | 'webhook' | 'chatbot_handoff';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'exists';
  value: string;
}

export interface AutomationAction {
  type: 'send_message' | 'add_tag' | 'remove_tag' | 'update_contact' | 'notify_user' | 'webhook' | 'assign_chat';
  config: Record<string, any>;
}

// Subscription Types
export interface Subscription {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: UsageStats;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular?: boolean;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  whatsappAccounts: number;
  messagesPerMonth: number;
  contacts: number;
  chatbots: number;
  teamMembers: number;
  automations: number;
}

export interface UsageStats {
  whatsappAccounts: number;
  messagesSent: number;
  contacts: number;
  chatbots: number;
  teamMembers: number;
  automations: number;
}

// Analytics Types
export interface AnalyticsData {
  date: string;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  conversations: number;
  contacts: number;
  chatbotInteractions: number;
}

export interface DashboardStats {
  totalMessagesSent: number;
  totalConversations: number;
  totalContacts: number;
  activeChatbots: number;
  messageDeliveryRate: number;
  avgResponseTime: number;
  trends: {
    messagesSent: number;
    conversations: number;
    contacts: number;
    deliveryRate: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Webhook Types
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  lastTriggeredAt?: string;
  createdAt: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt?: string;
  createdAt: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  createdAt: string;
}

// Re-export chat types
export * from './chat';
