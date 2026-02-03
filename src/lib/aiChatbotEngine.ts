// ============================================
// AI CHATBOT ENGINE
// LLM-powered chatbot with context memory and intent detection
// ============================================

import type {
  ChatbotConfig,
  ChatbotSettings,
  FAQ,
  BotSession,
  BotContext,
} from '@/types/chat';

// ============================================
// AI RESPONSE TYPES
// ============================================

export interface AIResponse {
  text: string;
  confidence: number;
  intent: string;
  suggestedActions: SuggestedAction[];
  shouldHandoff: boolean;
  handoffReason: string | null;
  metadata: {
    processingTime: number;
    modelUsed: string;
    tokensUsed: number;
    faqMatched?: string;
    contextUsed: boolean;
  };
}

export interface SuggestedAction {
  type: 'quick_reply' | 'button' | 'link' | 'handoff';
  label: string;
  value: string;
  icon?: string;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  alternatives: { intent: string; confidence: number }[];
}

// ============================================
// CONTEXT MEMORY MANAGER
// ============================================

export class ContextMemoryManager {
  private sessions: Map<string, BotSession> = new Map();
  private maxHistoryLength: number = 20;
  private maxContextAge: number = 30 * 60 * 1000; // 30 minutes

  /**
   * Create or get existing session
   */
  createSession(conversationId: string, tenantId: string): BotSession {
    const existing = this.sessions.get(conversationId);
    if (existing) {
      return existing;
    }

    const session: BotSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      tenantId,
      context: {
        currentTopic: null,
        collectedData: {},
        conversationHistory: [],
        entities: {},
        intentStack: [],
      },
      messageCount: 0,
      lastIntent: null,
      lastConfidence: null,
      suggestedResponses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(conversationId, session);
    return session;
  }

  /**
   * Get session by conversation ID
   */
  getSession(conversationId: string): BotSession | null {
    const session = this.sessions.get(conversationId);
    if (!session) return null;

    // Check if session is expired
    const age = Date.now() - new Date(session.updatedAt).getTime();
    if (age > this.maxContextAge) {
      this.sessions.delete(conversationId);
      return null;
    }

    return session;
  }

  /**
   * Add message to conversation history
   */
  addMessage(conversationId: string, role: 'user' | 'assistant', content: string): void {
    const session = this.sessions.get(conversationId);
    if (!session) return;

    session.context.conversationHistory.push({ role, content });
    session.messageCount++;
    session.updatedAt = new Date().toISOString();

    // Trim history if too long
    if (session.context.conversationHistory.length > this.maxHistoryLength) {
      session.context.conversationHistory = session.context.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Update session context
   */
  updateContext(conversationId: string, updates: Partial<BotContext>): void {
    const session = this.sessions.get(conversationId);
    if (!session) return;

    session.context = { ...session.context, ...updates };
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Store collected data
   */
  storeData(conversationId: string, key: string, value: any): void {
    const session = this.sessions.get(conversationId);
    if (!session) return;

    session.context.collectedData[key] = value;
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Get collected data
   */
  getData(conversationId: string, key: string): any {
    const session = this.sessions.get(conversationId);
    return session?.context.collectedData[key];
  }

  /**
   * Push intent to stack
   */
  pushIntent(conversationId: string, intent: string): void {
    const session = this.sessions.get(conversationId);
    if (!session) return;

    session.context.intentStack.push(intent);
    session.lastIntent = intent;
    session.updatedAt = new Date().toISOString();

    // Keep only last 10 intents
    if (session.context.intentStack.length > 10) {
      session.context.intentStack = session.context.intentStack.slice(-10);
    }
  }

  /**
   * Get conversation history for LLM context
   */
  getHistoryForLLM(conversationId: string, maxMessages: number = 10): { role: string; content: string }[] {
    const session = this.sessions.get(conversationId);
    if (!session) return [];

    return session.context.conversationHistory.slice(-maxMessages).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Clear session
   */
  clearSession(conversationId: string): void {
    this.sessions.delete(conversationId);
  }

  /**
   * Get all active sessions for a tenant
   */
  getTenantSessions(tenantId: string): BotSession[] {
    return Array.from(this.sessions.values()).filter(s => s.tenantId === tenantId);
  }

  /**
   * Clean up expired sessions
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, session] of this.sessions) {
      const age = now - new Date(session.updatedAt).getTime();
      if (age > this.maxContextAge) {
        this.sessions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ============================================
// FAQ ENGINE
// ============================================

export class FAQEngine {
  private faqs: Map<string, FAQ[]> = new Map(); // tenantId -> FAQs

  /**
   * Load FAQs for a tenant
   */
  loadFAQs(tenantId: string, faqs: FAQ[]): void {
    this.faqs.set(tenantId, faqs.filter(f => f.isActive));
  }

  /**
   * Find best matching FAQ
   */
  findBestMatch(query: string, tenantId: string): { faq: FAQ; score: number } | null {
    const faqs = this.faqs.get(tenantId) || [];
    if (faqs.length === 0) return null;

    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch: { faq: FAQ; score: number } | null = null;

    for (const faq of faqs) {
      const score = this.calculateSimilarity(normalizedQuery, faq);
      if (score > (bestMatch?.score || 0) && score >= faq.confidence) {
        bestMatch = { faq, score };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate similarity between query and FAQ
   */
  private calculateSimilarity(query: string, faq: FAQ): number {
    const questions = [faq.question, ...faq.variations];
    let maxScore = 0;

    for (const question of questions) {
      const score = this.stringSimilarity(query, question.toLowerCase());
      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  /**
   * Calculate string similarity using Jaccard index + common subsequence
   */
  private stringSimilarity(str1: string, str2: string): number {
    // Token-based similarity (Jaccard)
    const tokens1 = new Set(str1.split(/\s+/));
    const tokens2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    const jaccard = intersection.size / union.size;

    // Character-based similarity (for typos)
    const charSimilarity = this.levenshteinSimilarity(str1, str2);

    // Combine scores
    return jaccard * 0.6 + charSimilarity * 0.4;
  }

  /**
   * Calculate Levenshtein similarity
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  }

  /**
   * Add FAQ
   */
  addFAQ(tenantId: string, faq: FAQ): void {
    const faqs = this.faqs.get(tenantId) || [];
    faqs.push(faq);
    this.faqs.set(tenantId, faqs);
  }

  /**
   * Update FAQ usage count
   */
  trackUsage(tenantId: string, faqId: string): void {
    const faqs = this.faqs.get(tenantId) || [];
    const faq = faqs.find(f => f.id === faqId);
    if (faq) {
      faq.usageCount++;
    }
  }

  /**
   * Get popular FAQs
   */
  getPopularFAQs(tenantId: string, limit: number = 5): FAQ[] {
    const faqs = this.faqs.get(tenantId) || [];
    return faqs
      .filter(f => f.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
}

// ============================================
// INTENT CLASSIFIER
// ============================================

export class IntentClassifier {
  private intentPatterns: Map<string, Map<string, RegExp[]>> = new Map(); // tenantId -> intent -> patterns

  // Default intents
  private defaultIntents: Map<string, string[]> = new Map([
    ['greeting', ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy']],
    ['goodbye', ['bye', 'goodbye', 'see you', 'talk later', 'thanks bye']],
    ['help', ['help', 'support', 'assist', 'need help', 'can you help', 'i need assistance']],
    ['thanks', ['thanks', 'thank you', 'appreciate', 'grateful']],
    ['pricing', ['price', 'pricing', 'cost', 'how much', 'quote', 'estimate', 'fee']],
    ['complaint', ['complaint', 'problem', 'issue', 'not working', 'bad', 'terrible', 'unhappy']],
    ['billing', ['bill', 'invoice', 'payment', 'charge', 'refund', 'subscription', 'pay']],
    ['sales', ['buy', 'purchase', 'order', 'interested', 'product', 'service', 'get']],
    ['technical', ['bug', 'error', 'crash', 'technical', 'not loading', 'broken', 'fix']],
    ['human', ['agent', 'human', 'representative', 'speak to someone', 'talk to person', 'operator']],
    ['hours', ['hours', 'open', 'close', 'business hours', 'when are you open']],
    ['location', ['location', 'address', 'where are you', 'find you']],
    ['status', ['status', 'track', 'where is my', 'order status', 'delivery']],
  ]);

  constructor() {
    this.compileDefaultPatterns();
  }

  private compileDefaultPatterns(): void {
    const patterns = new Map<string, RegExp[]>();
    
    for (const [intent, phrases] of this.defaultIntents) {
      const regexes: RegExp[] = [];
      for (const phrase of phrases) {
        // Create variations: exact, word boundary, contains
        regexes.push(new RegExp(`^${phrase}$`, 'i'));
        regexes.push(new RegExp(`\\b${phrase}\\b`, 'i'));
      }
      patterns.set(intent, regexes);
    }

    this.intentPatterns.set('default', patterns);
  }

  /**
   * Load custom intents for tenant
   */
  loadIntents(tenantId: string, intents: Record<string, string[]>): void {
    const patterns = new Map<string, RegExp[]>();
    
    for (const [intent, phrases] of Object.entries(intents)) {
      const regexes: RegExp[] = [];
      for (const phrase of phrases) {
        regexes.push(new RegExp(`^${phrase}$`, 'i'));
        regexes.push(new RegExp(`\\b${phrase}\\b`, 'i'));
      }
      patterns.set(intent, regexes);
    }

    this.intentPatterns.set(tenantId, patterns);
  }

  /**
   * Classify intent from message
   */
  classify(text: string, tenantId: string): IntentClassification {
    const normalizedText = text.toLowerCase().trim();
    const scores: Map<string, number> = new Map();

    // Check tenant-specific intents first
    const tenantPatterns = this.intentPatterns.get(tenantId);
    if (tenantPatterns) {
      this.scoreIntents(normalizedText, tenantPatterns, scores, 1.2);
    }

    // Check default intents
    const defaultPatterns = this.intentPatterns.get('default')!;
    this.scoreIntents(normalizedText, defaultPatterns, scores, 1.0);

    // Find best intent
    let bestIntent = 'unknown';
    let bestScore = 0;
    const alternatives: { intent: string; confidence: number }[] = [];

    for (const [intent, score] of scores) {
      if (score > bestScore) {
        if (bestScore > 0) {
          alternatives.push({ intent: bestIntent, confidence: bestScore });
        }
        bestIntent = intent;
        bestScore = score;
      } else if (score > 0.3) {
        alternatives.push({ intent, confidence: score });
      }
    }

    // Sort alternatives by confidence
    alternatives.sort((a, b) => b.confidence - a.confidence);

    // Extract entities
    const entities = this.extractEntities(normalizedText);

    return {
      intent: bestIntent,
      confidence: bestScore,
      entities,
      alternatives: alternatives.slice(0, 3),
    };
  }

  private scoreIntents(
    text: string,
    patterns: Map<string, RegExp[]>,
    scores: Map<string, number>,
    multiplier: number
  ): void {
    for (const [intent, regexes] of patterns) {
      let score = 0;
      for (const regex of regexes) {
        if (regex.test(text)) {
          score += 0.5 * multiplier;
        }
      }
      
      // Word overlap bonus
      const intentWords = intent.split('_');
      const textWords = text.split(/\s+/);
      const overlap = intentWords.filter(w => textWords.includes(w)).length;
      score += (overlap / intentWords.length) * 0.3 * multiplier;

      if (score > 0) {
        scores.set(intent, Math.min(score, 1));
      }
    }
  }

  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) entities.email = emailMatch[0];

    // Extract phone
    const phoneMatch = text.match(/\b\+?[\d\s-]{10,}\b/);
    if (phoneMatch) entities.phone = phoneMatch[0];

    // Extract order/tracking numbers
    const orderMatch = text.match(/\b(?:order|tracking|#)?\s*[#:]?\s*([A-Z0-9]{6,})\b/i);
    if (orderMatch) entities.orderNumber = orderMatch[1];

    // Extract product mentions
    const productMatch = text.match(/\b(product|item)\s+(?:called|named)?\s+["']?([^"']+)["']?/i);
    if (productMatch) entities.product = productMatch[2];

    // Extract urgency
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'urgently'];
    if (urgentWords.some(w => text.includes(w))) {
      entities.urgency = 'high';
    }

    return entities;
  }
}

// ============================================
// LLM SERVICE (Simulated - replace with actual API)
// ============================================

export class LLMService {
  private apiKey: string | null = null;
  private _model: string = 'gpt-3.5-turbo';
  private _maxTokens: number = 500;
  private _temperature: number = 0.7;

  constructor(config?: { apiKey?: string; model?: string; maxTokens?: number; temperature?: number }) {
    if (config?.apiKey) this.apiKey = config.apiKey;
    if (config?.model) this._model = config.model;
    if (config?.maxTokens) this._maxTokens = config.maxTokens;
    if (config?.temperature) this._temperature = config.temperature;
  }

  /**
   * Generate response using LLM
   */
  async generateResponse(
    message: string,
    _context: { role: string; content: string }[],
    _systemPrompt: string
  ): Promise<{ text: string; tokensUsed: number; processingTime: number }> {
    const startTime = Date.now();

    // In production, this would call OpenAI, Claude, or other LLM APIs
    // For demo, we simulate responses
    const simulatedResponse = this.simulateResponse(message);

    return {
      text: simulatedResponse,
      tokensUsed: Math.floor(simulatedResponse.length / 4),
      processingTime: Date.now() - startTime,
    };
  }

  private simulateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Simple response patterns for demo
    if (lowerMessage.match(/\b(hello|hi|hey)\b/)) {
      return 'Hello! Welcome to our support. How can I assist you today?';
    }
    if (lowerMessage.match(/\b(price|pricing|cost|how much)\b/)) {
      return 'I\'d be happy to help with pricing information. Could you please let me know which product or service you\'re interested in?';
    }
    if (lowerMessage.match(/\b(hours|open|close)\b/)) {
      return 'Our business hours are Monday to Friday, 9 AM to 6 PM. We\'re closed on weekends and public holidays.';
    }
    if (lowerMessage.match(/\b(location|address|where)\b/)) {
      return 'You can find us at our main office. Would you like me to provide the full address or directions?';
    }
    if (lowerMessage.match(/\b(agent|human|person|representative)\b/)) {
      return 'I understand you\'d like to speak with a human agent. Let me connect you with someone who can help. Please hold on...';
    }
    if (lowerMessage.match(/\b(bye|goodbye|see you)\b/)) {
      return 'Thank you for chatting with us! Have a great day. Feel free to reach out anytime you need assistance.';
    }
    if (lowerMessage.match(/\b(thanks|thank you)\b/)) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }
    if (lowerMessage.match(/\b(help|support|assist)\b/)) {
      return 'I\'m here to help! Please tell me more about what you need assistance with, and I\'ll do my best to support you.';
    }
    if (lowerMessage.match(/\b(order|status|track|tracking)\b/)) {
      return 'I can help you check your order status. Could you please provide your order number?';
    }
    if (lowerMessage.match(/\b(bill|invoice|payment|charge|refund)\b/)) {
      return 'I can assist with billing inquiries. Please provide more details about your billing question or concern.';
    }

    // Default response
    return 'Thank you for your message. I want to make sure I understand correctly. Could you provide a bit more detail about what you\'re looking for?';
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Update configuration
   */
  updateConfig(config: { apiKey?: string; model?: string; maxTokens?: number; temperature?: number }): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.model) this._model = config.model;
    if (config.maxTokens) this._maxTokens = config.maxTokens;
    if (config.temperature) this._temperature = config.temperature;
  }
}

// ============================================
// MAIN AI CHATBOT ENGINE
// ============================================

export class AIChatbotEngine {
  private config: ChatbotConfig | null = null;
  private contextManager: ContextMemoryManager;
  private faqEngine: FAQEngine;
  private intentClassifier: IntentClassifier;
  private llmService: LLMService;
  private handoffKeywords: string[] = ['agent', 'human', 'representative', 'supervisor', 'manager', 'speak to someone'];

  constructor(config?: ChatbotConfig) {
    this.contextManager = new ContextMemoryManager();
    this.faqEngine = new FAQEngine();
    this.intentClassifier = new IntentClassifier();
    this.llmService = new LLMService();

    if (config) {
      this.initialize(config);
    }
  }

  /**
   * Initialize chatbot with configuration
   */
  initialize(config: ChatbotConfig): void {
    this.config = config;
    
    // Load FAQs
    if (config.faqs) {
      this.faqEngine.loadFAQs(config.tenantId, config.faqs);
    }

    // Load settings
    if (config.settings) {
      this.handoffKeywords = config.settings.handoffKeywords || this.handoffKeywords;
      this.llmService.updateConfig({
        model: config.settings.model,
        maxTokens: config.settings.maxTokens,
        temperature: config.settings.temperature,
      });
    }
  }

  /**
   * Process incoming message and generate response
   */
  async processMessage(
    conversationId: string,
    message: string,
    tenantId: string
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Get or create session
    const session = this.contextManager.createSession(conversationId, tenantId);

    // Add user message to history
    this.contextManager.addMessage(conversationId, 'user', message);

    // Check for handoff triggers
    const handoffCheck = this.checkHandoffTriggers(message, session);
    if (handoffCheck.shouldHandoff && handoffCheck.reason) {
      return this.createHandoffResponse(handoffCheck.reason, startTime);
    }

    // Classify intent
    const intentResult = this.intentClassifier.classify(message, tenantId);
    this.contextManager.pushIntent(conversationId, intentResult.intent);

    // Try FAQ matching first
    const faqMatch = this.faqEngine.findBestMatch(message, tenantId);
    if (faqMatch && faqMatch.score > 0.7 && faqMatch.faq) {
      this.faqEngine.trackUsage(tenantId, faqMatch.faq.id);
      return this.createFAQResponse(faqMatch.faq, faqMatch.score, startTime);
    }

    // Generate AI response
    const aiResponse = await this.generateAIResponse(message, conversationId, intentResult);

    // Add assistant response to history
    this.contextManager.addMessage(conversationId, 'assistant', aiResponse.text);

    // Update session
    session.lastConfidence = aiResponse.confidence;
    session.suggestedResponses = aiResponse.suggestedActions.map(a => a.label);

    return aiResponse;
  }

  /**
   * Check if message triggers handoff to human
   */
  private checkHandoffTriggers(message: string, session: BotSession): { shouldHandoff: boolean; reason: string | null } {
    const lowerMessage = message.toLowerCase();

    // Check handoff keywords
    for (const keyword of this.handoffKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return { shouldHandoff: true, reason: 'User requested human agent' };
      }
    }

    // Check if max bot replies exceeded
    const maxReplies = this.config?.settings.maxConsecutiveBotReplies || 5;
    if (session.messageCount >= maxReplies * 2) {
      return { shouldHandoff: true, reason: 'Maximum bot interactions reached' };
    }

    // Check for frustration indicators
    const frustrationWords = ['frustrated', 'annoying', 'useless', 'stupid', 'worst', 'terrible'];
    if (frustrationWords.some(w => lowerMessage.includes(w))) {
      return { shouldHandoff: true, reason: 'Customer frustration detected' };
    }

    return { shouldHandoff: false, reason: null };
  }

  /**
   * Generate AI response using LLM
   */
  private async generateAIResponse(
    message: string,
    conversationId: string,
    intentResult: IntentClassification
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const settings = this.config?.settings;

    // Get conversation history
    const history = this.contextManager.getHistoryForLLM(conversationId, 10);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(settings);

    // Generate response
    const llmResult = await this.llmService.generateResponse(message, history, systemPrompt);

    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(intentResult.intent, intentResult.entities);

    return {
      text: llmResult.text,
      confidence: intentResult.confidence,
      intent: intentResult.intent,
      suggestedActions,
      shouldHandoff: false,
      handoffReason: null,
      metadata: {
        processingTime: Date.now() - startTime + llmResult.processingTime,
        modelUsed: settings?.model || 'gpt-3.5-turbo',
        tokensUsed: llmResult.tokensUsed,
        contextUsed: history.length > 0,
      },
    };
  }

  /**
   * Build system prompt for LLM
   */
  private buildSystemPrompt(settings?: ChatbotSettings): string {
    const tone = settings?.tone || 'professional';
    const languages = settings?.languages || ['en'];

    const toneInstructions: Record<string, string> = {
      professional: 'You are a professional customer support assistant. Be polite, concise, and helpful.',
      friendly: 'You are a friendly and approachable customer support assistant. Be warm and conversational.',
      formal: 'You are a formal customer support assistant. Use proper etiquette and formal language.',
      casual: 'You are a casual customer support assistant. Be relaxed and use everyday language.',
    };

    let prompt = toneInstructions[tone] || toneInstructions.professional;

    if (settings?.systemPrompt) {
      prompt += `\n\n${settings.systemPrompt}`;
    }

    prompt += `\n\nGuidelines:
- Keep responses concise and clear
- If you don't know something, offer to connect with a human agent
- Always be helpful and solution-oriented
- Use the customer's language if possible (${languages.join(', ')})
- Ask clarifying questions when needed`;

    return prompt;
  }

  /**
   * Create FAQ response
   */
  private createFAQResponse(faq: FAQ, score: number, startTime: number): AIResponse {
    return {
      text: faq.answer,
      confidence: score,
      intent: 'faq_match',
      suggestedActions: [
        { type: 'quick_reply', label: 'That helped!', value: 'helpful' },
        { type: 'quick_reply', label: 'I need more help', value: 'more_help' },
      ],
      shouldHandoff: false,
      handoffReason: null,
      metadata: {
        processingTime: Date.now() - startTime,
        modelUsed: 'faq-engine',
        tokensUsed: 0,
        faqMatched: faq.id,
        contextUsed: false,
      },
    };
  }

  /**
   * Create handoff response
   */
  private createHandoffResponse(reason: string, startTime: number): AIResponse {
    const escalationMessage = this.config?.settings.escalationMessage || 
      'I understand. Let me connect you with a human agent who can better assist you.';

    return {
      text: escalationMessage,
      confidence: 1,
      intent: 'handoff',
      suggestedActions: [
        { type: 'handoff', label: 'Connect to Agent', value: 'handoff', icon: 'User' },
      ],
      shouldHandoff: true,
      handoffReason: reason,
      metadata: {
        processingTime: Date.now() - startTime,
        modelUsed: 'routing-engine',
        tokensUsed: 0,
        contextUsed: false,
      },
    };
  }

  /**
   * Generate suggested actions based on intent
   */
  private generateSuggestedActions(intent: string, entities: Record<string, any>): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    switch (intent) {
      case 'pricing':
        actions.push(
          { type: 'button', label: 'View Pricing', value: 'view_pricing' },
          { type: 'button', label: 'Get Quote', value: 'get_quote' }
        );
        break;
      case 'sales':
        actions.push(
          { type: 'button', label: 'Browse Products', value: 'browse_products' },
          { type: 'button', label: 'Talk to Sales', value: 'talk_sales' }
        );
        break;
      case 'support':
      case 'technical':
        actions.push(
          { type: 'button', label: 'Submit Ticket', value: 'submit_ticket' },
          { type: 'button', label: 'View FAQs', value: 'view_faqs' }
        );
        break;
      case 'billing':
        actions.push(
          { type: 'button', label: 'View Invoice', value: 'view_invoice' },
          { type: 'button', label: 'Payment Methods', value: 'payment_methods' }
        );
        break;
      case 'status':
        if (entities.orderNumber) {
          actions.push(
            { type: 'button', label: 'Track Order', value: `track_${entities.orderNumber}` }
          );
        }
        break;
    }

    // Always add handoff option for complex intents
    if (['complaint', 'technical', 'billing'].includes(intent)) {
      actions.push({ type: 'handoff', label: 'Talk to Agent', value: 'handoff', icon: 'User' });
    }

    return actions;
  }

  /**
   * Get welcome message
   */
  getWelcomeMessage(): string {
    return this.config?.settings.welcomeMessage || 
      'Hello! Welcome to our support. How can I help you today?';
  }

  /**
   * Get fallback message
   */
  getFallbackMessage(): string {
    return this.config?.settings.fallbackMessage ||
      'I\'m not sure I understand. Could you rephrase that or let me connect you with a human agent?';
  }

  /**
   * Clear conversation context
   */
  clearContext(conversationId: string): void {
    this.contextManager.clearSession(conversationId);
  }

  /**
   * Get session info
   */
  getSessionInfo(conversationId: string): BotSession | null {
    return this.contextManager.getSession(conversationId);
  }

  /**
   * Update chatbot configuration
   */
  updateConfig(config: ChatbotConfig): void {
    this.initialize(config);
  }

  /**
   * Add FAQ dynamically
   */
  addFAQ(tenantId: string, faq: FAQ): void {
    this.faqEngine.addFAQ(tenantId, faq);
  }

  /**
   * Get popular FAQs
   */
  getPopularFAQs(tenantId: string, limit?: number): FAQ[] {
    return this.faqEngine.getPopularFAQs(tenantId, limit);
  }

  /**
   * Clean up expired sessions
   */
  cleanup(): number {
    return this.contextManager.cleanup();
  }
}

// ============================================
// HANDOFF MANAGER
// ============================================

export interface HandoffRequest {
  conversationId: string;
  tenantId: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerContext: {
    messageCount: number;
    lastIntent: string | null;
    collectedData: Record<string, any>;
    conversationSummary: string;
  };
  requestedAt: string;
}

export class HandoffManager {
  private pendingHandoffs: Map<string, HandoffRequest> = new Map();
  private assignedHandoffs: Map<string, { agentId: string; assignedAt: string }> = new Map();

  /**
   * Request handoff to human agent
   */
  requestHandoff(request: HandoffRequest): void {
    this.pendingHandoffs.set(request.conversationId, request);
  }

  /**
   * Assign handoff to agent
   */
  assignHandoff(conversationId: string, agentId: string): boolean {
    const request = this.pendingHandoffs.get(conversationId);
    if (!request) return false;

    this.pendingHandoffs.delete(conversationId);
    this.assignedHandoffs.set(conversationId, { agentId, assignedAt: new Date().toISOString() });

    return true;
  }

  /**
   * Get pending handoffs for tenant
   */
  getPendingHandoffs(tenantId: string): HandoffRequest[] {
    return Array.from(this.pendingHandoffs.values())
      .filter(h => h.tenantId === tenantId)
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  /**
   * Get handoff request
   */
  getHandoff(conversationId: string): HandoffRequest | undefined {
    return this.pendingHandoffs.get(conversationId);
  }

  /**
   * Cancel handoff request
   */
  cancelHandoff(conversationId: string): boolean {
    return this.pendingHandoffs.delete(conversationId);
  }

  /**
   * Complete handoff (conversation resolved)
   */
  completeHandoff(conversationId: string): void {
    this.pendingHandoffs.delete(conversationId);
    this.assignedHandoffs.delete(conversationId);
  }

  /**
   * Get assigned agent for conversation
   */
  getAssignedAgent(conversationId: string): string | null {
    return this.assignedHandoffs.get(conversationId)?.agentId || null;
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

let chatbotEngineInstance: AIChatbotEngine | null = null;
let handoffManagerInstance: HandoffManager | null = null;

export function initializeChatbotEngine(config?: ChatbotConfig): AIChatbotEngine {
  chatbotEngineInstance = new AIChatbotEngine(config);
  return chatbotEngineInstance;
}

export function getChatbotEngine(): AIChatbotEngine | null {
  return chatbotEngineInstance;
}

export function getHandoffManager(): HandoffManager {
  if (!handoffManagerInstance) {
    handoffManagerInstance = new HandoffManager();
  }
  return handoffManagerInstance;
}

export default AIChatbotEngine;
