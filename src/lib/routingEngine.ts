// ============================================
// INTELLIGENT ROUTING ENGINE
// Multi-tenant message routing with keyword, department, skill-based routing
// ============================================

import type {
  Conversation,
  Agent,
  AgentQueue,
  RoutingRule,
  KeywordMapping,
  RoutingCondition,
  RoutingAction,
  AgentSkill,
} from '@/types/chat';

// ============================================
// ROUTING CONTEXT
// ============================================

export interface RoutingContext {
  conversation: Conversation;
  messageText: string;
  detectedIntent: string | null;
  detectedEntities: Record<string, any>;
  confidence: number;
  timestamp: Date;
  availableAgents: Agent[];
  queues: AgentQueue[];
  rules: RoutingRule[];
  keywords: KeywordMapping[];
}

export interface RoutingResult {
  success: boolean;
  action: RoutingAction;
  agentId: string | null;
  queueId: string | null;
  departmentId: string | null;
  reason: string;
  matchedRule: RoutingRule | null;
  matchedKeywords: KeywordMapping[];
  estimatedWaitTime: number | null;
}

// Partial result for internal use
interface PartialRoutingResult {
  success?: boolean;
  action: RoutingAction;
  agentId: string | null;
  queueId: string | null;
  departmentId: string | null;
  estimatedWaitTime: number | null;
}

// ============================================
// KEYWORD MATCHING ENGINE
// ============================================

export class KeywordEngine {
  private keywords: KeywordMapping[];

  constructor(keywords: KeywordMapping[]) {
    this.keywords = keywords.filter(k => k.isActive);
  }

  /**
   * Match message text against keyword patterns
   */
  match(text: string, language: string = 'en'): KeywordMapping[] {
    const normalizedText = text.toLowerCase().trim();
    const matches: KeywordMapping[] = [];

    for (const keyword of this.keywords) {
      const matchScore = this.calculateMatchScore(normalizedText, keyword, language);
      if (matchScore > 0) {
        matches.push({ ...keyword, _matchScore: matchScore } as any);
      }
    }

    // Sort by priority and match score
    return matches.sort((a, b) => {
      const scoreA = (a as any)._matchScore * a.priority;
      const scoreB = (b as any)._matchScore * b.priority;
      return scoreB - scoreA;
    });
  }

  private calculateMatchScore(text: string, keyword: KeywordMapping, language: string): number {
    // Get keyword in appropriate language
    const keywordText = keyword.translations[language] || keyword.keyword;
    const normalizedKeyword = keywordText.toLowerCase().trim();

    switch (keyword.matchType) {
      case 'exact':
        return text === normalizedKeyword ? 1 : 0;

      case 'contains':
        return text.includes(normalizedKeyword) ? normalizedKeyword.length / text.length : 0;

      case 'starts_with':
        return text.startsWith(normalizedKeyword) ? 1 : 0;

      case 'ends_with':
        return text.endsWith(normalizedKeyword) ? 1 : 0;

      case 'regex':
        try {
          const regex = new RegExp(normalizedKeyword, 'i');
          const match = text.match(regex);
          return match ? match[0].length / text.length : 0;
        } catch {
          return 0;
        }

      default:
        return 0;
    }
  }

  /**
   * Add a new keyword mapping
   */
  addKeyword(keyword: KeywordMapping): void {
    this.keywords.push(keyword);
  }

  /**
   * Remove a keyword mapping
   */
  removeKeyword(keywordId: string): void {
    this.keywords = this.keywords.filter(k => k.id !== keywordId);
  }

  /**
   * Get all keywords for a tenant
   */
  getKeywords(): KeywordMapping[] {
    return this.keywords;
  }
}

// ============================================
// INTENT DETECTION ENGINE
// ============================================

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export class IntentEngine {
  private intents: Map<string, string[]> = new Map();

  constructor() {
    // Default intents with training phrases
    this.intents.set('greeting', ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']);
    this.intents.set('goodbye', ['bye', 'goodbye', 'see you', 'thanks bye', 'talk later']);
    this.intents.set('help', ['help', 'support', 'assist', 'need help', 'can you help']);
    this.intents.set('pricing', ['price', 'pricing', 'cost', 'how much', 'quote', 'estimate']);
    this.intents.set('complaint', ['complaint', 'problem', 'issue', 'not working', 'bad', 'terrible']);
    this.intents.set('billing', ['bill', 'invoice', 'payment', 'charge', 'refund', 'subscription']);
    this.intents.set('sales', ['buy', 'purchase', 'order', 'interested', 'product', 'service']);
    this.intents.set('technical', ['bug', 'error', 'crash', 'technical', 'not loading', 'broken']);
  }

  /**
   * Detect intent from message text
   */
  detect(text: string): IntentResult {
    const normalizedText = text.toLowerCase().trim();
    let bestIntent = 'unknown';
    let bestConfidence = 0;
    const entities: Record<string, any> = {};

    for (const [intent, phrases] of this.intents) {
      const confidence = this.calculateIntentConfidence(normalizedText, phrases);
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestIntent = intent;
      }
    }

    // Extract entities
    entities.product = this.extractProduct(normalizedText);
    entities.urgency = this.extractUrgency(normalizedText);

    return {
      intent: bestIntent,
      confidence: bestConfidence,
      entities,
    };
  }

  private calculateIntentConfidence(text: string, phrases: string[]): number {
    let maxScore = 0;

    for (const phrase of phrases) {
      const normalizedPhrase = phrase.toLowerCase();
      
      // Exact match
      if (text === normalizedPhrase) {
        return 1;
      }

      // Contains phrase
      if (text.includes(normalizedPhrase)) {
        const score = normalizedPhrase.length / text.length;
        maxScore = Math.max(maxScore, score);
      }

      // Word overlap
      const textWords = text.split(/\s+/);
      const phraseWords = normalizedPhrase.split(/\s+/);
      const commonWords = textWords.filter(w => phraseWords.includes(w));
      const overlapScore = commonWords.length / Math.max(textWords.length, phraseWords.length);
      maxScore = Math.max(maxScore, overlapScore * 0.7);
    }

    return Math.min(maxScore, 1);
  }

  private extractProduct(text: string): string | null {
    const productPatterns = [
      /\b(product|item|service)\s+(?:called|named)?\s+["']?([^"']+)["']?/i,
      /\b(buying|purchasing|ordering)\s+["']?([^"']+)["']?/i,
    ];

    for (const pattern of productPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[2]?.trim() || null;
      }
    }

    return null;
  }

  private extractUrgency(text: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    const highWords = ['soon', 'quickly', 'fast', 'today'];

    const lowerText = text.toLowerCase();

    if (urgentWords.some(w => lowerText.includes(w))) return 'urgent';
    if (highWords.some(w => lowerText.includes(w))) return 'high';
    
    return 'medium';
  }

  /**
   * Add custom intent with training phrases
   */
  addIntent(intent: string, phrases: string[]): void {
    this.intents.set(intent, phrases);
  }
}

// ============================================
// AGENT ASSIGNMENT ENGINE
// ============================================

export class AgentAssignmentEngine {
  private agents: Agent[];
  private queues: AgentQueue[];
  private roundRobinIndex: Map<string, number> = new Map();

  constructor(agents: Agent[], queues: AgentQueue[]) {
    this.agents = agents.filter(a => a.isActive);
    this.queues = queues.filter(q => q.isActive);
  }

  /**
   * Find best agent based on routing strategy
   */
  findBestAgent(
    queueId: string,
    strategy: string,
    requiredSkills: AgentSkill[] = [],
    language: string = 'en'
  ): Agent | null {
    const queue = this.queues.find(q => q.id === queueId);
    if (!queue) return null;

    const availableAgents = this.getAvailableAgents(queue.agents, requiredSkills, language);
    if (availableAgents.length === 0) return null;

    switch (strategy) {
      case 'round_robin':
        return this.roundRobinAssignment(queueId, availableAgents);

      case 'least_busy':
        return this.leastBusyAssignment(availableAgents);

      case 'skill_based':
        return this.skillBasedAssignment(availableAgents, requiredSkills);

      case 'priority':
        return this.priorityAssignment(availableAgents);

      case 'longest_idle':
        return this.longestIdleAssignment(availableAgents);

      case 'random':
        return availableAgents[Math.floor(Math.random() * availableAgents.length)];

      default:
        return this.leastBusyAssignment(availableAgents);
    }
  }

  private getAvailableAgents(
    agentIds: string[],
    requiredSkills: AgentSkill[],
    language: string
  ): Agent[] {
    return this.agents.filter(agent => {
      // Check if agent is in queue
      if (!agentIds.includes(agent.id)) return false;

      // Check status
      if (agent.status !== 'online') return false;

      // Check capacity
      if (agent.currentChatCount >= agent.maxConcurrentChats) return false;

      // Check language
      if (!agent.languages.includes(language)) return false;

      // Check skills (if required)
      if (requiredSkills.length > 0) {
        const hasAllSkills = requiredSkills.every(required => {
          const agentSkill = agent.skills.find(s => s.name === required.name);
          if (!agentSkill) return false;
          
          const levels = { beginner: 1, intermediate: 2, expert: 3 };
          return levels[agentSkill.level] >= levels[required.level];
        });
        if (!hasAllSkills) return false;
      }

      return true;
    });
  }

  private roundRobinAssignment(queueId: string, agents: Agent[]): Agent | null {
    if (agents.length === 0) return null;

    const currentIndex = this.roundRobinIndex.get(queueId) || 0;
    const agent = agents[currentIndex % agents.length];
    this.roundRobinIndex.set(queueId, (currentIndex + 1) % agents.length);

    return agent;
  }

  private leastBusyAssignment(agents: Agent[]): Agent | null {
    if (agents.length === 0) return null;

    return agents.reduce((best, current) => {
      if (current.currentChatCount < best.currentChatCount) return current;
      if (current.currentChatCount === best.currentChatCount) {
        // Tie-breaker: agent with better performance
        const currentPerf = current.performance?.satisfactionScore || 0;
        const bestPerf = best.performance?.satisfactionScore || 0;
        return currentPerf > bestPerf ? current : best;
      }
      return best;
    });
  }

  private skillBasedAssignment(agents: Agent[], requiredSkills: AgentSkill[]): Agent | null {
    if (agents.length === 0) return null;

    // Score agents based on skill match
    const scoredAgents = agents.map(agent => {
      let score = 0;
      for (const required of requiredSkills) {
        const skill = agent.skills.find(s => s.name === required.name);
        if (skill) {
          const levels = { beginner: 1, intermediate: 2, expert: 3 };
          score += levels[skill.level];
        }
      }
      return { agent, score };
    });

    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent || null;
  }

  private priorityAssignment(agents: Agent[]): Agent | null {
    if (agents.length === 0) return null;

    // Prioritize by role (supervisor > team_lead > agent > trainee)
    const rolePriority = { supervisor: 4, team_lead: 3, agent: 2, trainee: 1 };

    return agents.reduce((best, current) => {
      const currentPriority = rolePriority[current.role];
      const bestPriority = rolePriority[best.role];

      if (currentPriority > bestPriority) return current;
      if (currentPriority === bestPriority && current.currentChatCount < best.currentChatCount) {
        return current;
      }
      return best;
    });
  }

  private longestIdleAssignment(agents: Agent[]): Agent | null {
    if (agents.length === 0) return null;

    return agents.reduce((best, current) => {
      const currentIdle = current.lastActiveAt 
        ? Date.now() - new Date(current.lastActiveAt).getTime() 
        : Infinity;
      const bestIdle = best.lastActiveAt 
        ? Date.now() - new Date(best.lastActiveAt).getTime() 
        : Infinity;

      return currentIdle > bestIdle ? current : best;
    });
  }

  /**
   * Calculate estimated wait time for a queue
   */
  calculateWaitTime(queueId: string): number {
    const queue = this.queues.find(q => q.id === queueId);
    if (!queue) return 0;

    const queueAgents = this.agents.filter(a => 
      queue.agents.includes(a.id) && a.status === 'online'
    );

    if (queueAgents.length === 0) return Infinity;

    const avgHandleTime = 300; // 5 minutes default
    const availableSlots = queueAgents.reduce((sum, a) => 
      sum + (a.maxConcurrentChats - a.currentChatCount), 0
    );

    if (availableSlots > 0) return 0;

    return avgHandleTime / queueAgents.length;
  }
}

// ============================================
// MAIN ROUTING ENGINE
// ============================================

export class RoutingEngine {
  private keywordEngine: KeywordEngine;
  private intentEngine: IntentEngine;
  private agentEngine: AgentAssignmentEngine;
  private rules: RoutingRule[];

  constructor(
    keywords: KeywordMapping[],
    rules: RoutingRule[],
    agents: Agent[],
    queues: AgentQueue[]
  ) {
    this.keywordEngine = new KeywordEngine(keywords);
    this.intentEngine = new IntentEngine();
    this.agentEngine = new AgentAssignmentEngine(agents, queues);
    this.rules = rules.filter(r => r.isActive).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Route an incoming message to appropriate agent/queue
   */
  async route(context: RoutingContext): Promise<RoutingResult> {
    const { conversation, messageText, availableAgents, queues } = context;

    // Step 1: Check for existing assignment
    if (conversation.assignedAgentId) {
      const agent = availableAgents.find(a => a.id === conversation.assignedAgentId);
      if (agent && agent.status === 'online') {
        return {
          success: true,
          action: { type: 'assign_agent', targetId: agent.id },
          agentId: agent.id,
          queueId: null,
          departmentId: null,
          reason: 'Existing conversation assignment',
          matchedRule: null,
          matchedKeywords: [],
          estimatedWaitTime: 0,
        };
      }
    }

    // Step 2: Match keywords
    const matchedKeywords = this.keywordEngine.match(messageText, conversation.customerProfile?.language || 'en');
    if (matchedKeywords.length > 0) {
      const topKeyword = matchedKeywords[0];
      const result = await this.executeAction(topKeyword.action, context);
      return {
        success: result.success ?? false,
        action: result.action,
        agentId: result.agentId,
        queueId: result.queueId,
        departmentId: result.departmentId,
        reason: `Keyword matched: ${topKeyword.keyword}`,
        matchedRule: null,
        matchedKeywords: [topKeyword],
        estimatedWaitTime: result.estimatedWaitTime,
      };
    }

    // Step 3: Detect intent
    const intentResult = this.intentEngine.detect(messageText);
    context.detectedIntent = intentResult.intent;
    context.confidence = intentResult.confidence;
    context.detectedEntities = intentResult.entities;

    // Step 4: Evaluate routing rules
    for (const rule of this.rules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        const result = await this.executeAction(rule.action, context);
        return {
          success: result.success ?? false,
          action: result.action,
          agentId: result.agentId,
          queueId: result.queueId,
          departmentId: result.departmentId,
          reason: `Routing rule: ${rule.name}`,
          matchedRule: rule,
          matchedKeywords: [],
          estimatedWaitTime: result.estimatedWaitTime,
        };
      }
    }

    // Step 5: Intent-based fallback routing
    const intentRoute = this.getIntentRoute(intentResult.intent, queues);
    if (intentRoute) {
      const result = await this.executeAction(intentRoute, context);
      return {
        success: result.success ?? false,
        action: result.action,
        agentId: result.agentId,
        queueId: result.queueId,
        departmentId: result.departmentId,
        reason: `Intent-based routing: ${intentResult.intent}`,
        matchedRule: null,
        matchedKeywords: [],
        estimatedWaitTime: result.estimatedWaitTime,
      };
    }

    // Step 6: Default routing to first available queue
    const defaultQueue = queues.find(q => q.isActive);
    if (defaultQueue) {
      const result = await this.executeAction(
        { type: 'assign_queue', targetId: defaultQueue.id },
        context
      );
      return {
        success: result.success ?? false,
        action: result.action,
        agentId: result.agentId,
        queueId: result.queueId,
        departmentId: result.departmentId,
        reason: 'Default queue assignment',
        matchedRule: null,
        matchedKeywords: [],
        estimatedWaitTime: result.estimatedWaitTime,
      };
    }

    // Step 7: No routing possible
    return {
      success: false,
      action: { type: 'trigger_bot', targetId: null },
      agentId: null,
      queueId: null,
      departmentId: null,
      reason: 'No available agents or queues',
      matchedRule: null,
      matchedKeywords: [],
      estimatedWaitTime: null,
    };
  }

  private evaluateConditions(conditions: RoutingCondition[], context: RoutingContext): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  private evaluateCondition(condition: RoutingCondition, context: RoutingContext): boolean {
    const { conversation, messageText, detectedIntent, timestamp } = context;
    let value: any;

    switch (condition.type) {
      case 'message_text':
        value = messageText.toLowerCase();
        break;
      case 'keyword':
        value = messageText.toLowerCase();
        break;
      case 'intent':
        value = detectedIntent;
        break;
      case 'customer_tag':
        value = conversation.customerProfile?.tags || [];
        break;
      case 'customer_language':
        value = conversation.customerProfile?.language || 'en';
        break;
      case 'customer_country':
        value = conversation.customerProfile?.country;
        break;
      case 'time_of_day':
        value = timestamp.getHours();
        break;
      case 'day_of_week':
        value = timestamp.getDay();
        break;
      case 'conversation_priority':
        value = conversation.priority;
        break;
      case 'customer_vip':
        value = conversation.customerProfile?.isVip || false;
        break;
      default:
        return false;
    }

    return this.compareValues(value, condition.operator, condition.value, condition.caseSensitive);
  }

  private compareValues(
    actual: any,
    operator: string,
    expected: any,
    caseSensitive: boolean = false
  ): boolean {
    if (!caseSensitive && typeof actual === 'string' && typeof expected === 'string') {
      actual = actual.toLowerCase();
      expected = expected.toLowerCase();
    }

    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'contains':
        if (Array.isArray(actual)) {
          return actual.includes(expected);
        }
        return String(actual).includes(String(expected));
      case 'starts_with':
        return String(actual).startsWith(String(expected));
      case 'ends_with':
        return String(actual).endsWith(String(expected));
      case 'regex':
        try {
          const regex = new RegExp(String(expected), caseSensitive ? '' : 'i');
          return regex.test(String(actual));
        } catch {
          return false;
        }
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        if (Array.isArray(expected)) {
          return expected.includes(actual);
        }
        return false;
      default:
        return false;
    }
  }

  private async executeAction(action: RoutingAction, context: RoutingContext): Promise<PartialRoutingResult> {
    const { availableAgents, queues } = context;

    switch (action.type) {
      case 'assign_agent': {
        const agent = availableAgents.find(a => a.id === action.targetId);
        return {
          success: !!agent,
          action,
          agentId: agent?.id || null,
          queueId: null,
          departmentId: null,
          estimatedWaitTime: agent ? 0 : null,
        };
      }

      case 'assign_queue': {
        const queue = queues.find(q => q.id === action.targetId);
        const bestAgent = queue 
          ? this.agentEngine.findBestAgent(queue.id, queue.routingStrategy)
          : null;
        
        return {
          success: !!queue,
          action,
          agentId: bestAgent?.id || null,
          queueId: queue?.id || null,
          departmentId: queue?.departmentId || null,
          estimatedWaitTime: queue ? this.agentEngine.calculateWaitTime(queue.id) : null,
        };
      }

      case 'assign_department': {
        const deptQueue = queues.find(q => q.departmentId === action.targetId);
        return {
          success: !!deptQueue,
          action,
          agentId: null,
          queueId: deptQueue?.id || null,
          departmentId: action.targetId,
          estimatedWaitTime: deptQueue ? this.agentEngine.calculateWaitTime(deptQueue.id) : null,
        };
      }

      case 'trigger_bot':
        return {
          success: true,
          action,
          agentId: null,
          queueId: null,
          departmentId: null,
          estimatedWaitTime: null,
        };

      case 'escalate':
        return {
          success: true,
          action,
          agentId: null,
          queueId: null,
          departmentId: null,
          estimatedWaitTime: null,
        };

      default:
        return {
          success: false,
          action,
          agentId: null,
          queueId: null,
          departmentId: null,
          estimatedWaitTime: null,
        };
    }
  }

  private getIntentRoute(intent: string, queues: AgentQueue[]): RoutingAction | null {
    const intentQueueMap: Record<string, string> = {
      'sales': 'sales_queue',
      'support': 'support_queue',
      'billing': 'billing_queue',
      'technical': 'technical_queue',
    };

    const queueName = intentQueueMap[intent];
    if (!queueName) return null;

    const queue = queues.find(q => q.name.toLowerCase().includes(queueName.split('_')[0]));
    if (queue) {
      return { type: 'assign_queue', targetId: queue.id };
    }

    return null;
  }

  /**
   * Update routing configuration
   */
  updateConfig(
    keywords?: KeywordMapping[],
    rules?: RoutingRule[],
    agents?: Agent[],
    queues?: AgentQueue[]
  ): void {
    if (keywords) {
      this.keywordEngine = new KeywordEngine(keywords);
    }
    if (rules) {
      this.rules = rules.filter(r => r.isActive).sort((a, b) => b.priority - a.priority);
    }
    if (agents && queues) {
      this.agentEngine = new AgentAssignmentEngine(agents, queues);
    }
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

let routingEngineInstance: RoutingEngine | null = null;

export function initializeRoutingEngine(
  keywords: KeywordMapping[],
  rules: RoutingRule[],
  agents: Agent[],
  queues: AgentQueue[]
): RoutingEngine {
  routingEngineInstance = new RoutingEngine(keywords, rules, agents, queues);
  return routingEngineInstance;
}

export function getRoutingEngine(): RoutingEngine | null {
  return routingEngineInstance;
}

export default RoutingEngine;
