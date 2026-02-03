// ============================================
// ROUTING RULES MANAGEMENT
// Admin interface for managing routing rules and keyword mappings
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  GripVertical,
  MessageSquare,
  Tag,
  User,
  Users,
  Bot,
  AlertTriangle,
  Clock,
  Globe,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useChatStore } from '@/store/chatStore';
import type { RoutingRule, KeywordMapping, ConditionType } from '@/types/chat';
import { cn } from '@/lib/utils';

// ============================================
// CONDITION TYPE CONFIG
// ============================================

const conditionTypeConfig: Record<ConditionType, { label: string; icon: any; operators: string[] }> = {
  message_text: { 
    label: 'Message Text', 
    icon: MessageSquare, 
    operators: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'] 
  },
  keyword: { 
    label: 'Keyword', 
    icon: Tag, 
    operators: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'] 
  },
  intent: { 
    label: 'Intent', 
    icon: Tag, 
    operators: ['equals', 'in'] 
  },
  customer_tag: { 
    label: 'Customer Tag', 
    icon: Tag, 
    operators: ['contains', 'in'] 
  },
  customer_language: { 
    label: 'Language', 
    icon: Globe, 
    operators: ['equals', 'in'] 
  },
  customer_country: { 
    label: 'Country', 
    icon: Globe, 
    operators: ['equals', 'in'] 
  },
  time_of_day: { 
    label: 'Time of Day', 
    icon: Clock, 
    operators: ['greater_than', 'less_than'] 
  },
  day_of_week: { 
    label: 'Day of Week', 
    icon: Clock, 
    operators: ['equals', 'in'] 
  },
  queue_length: { 
    label: 'Queue Length', 
    icon: Users, 
    operators: ['greater_than', 'less_than', 'equals'] 
  },
  agent_available: { 
    label: 'Agent Available', 
    icon: User, 
    operators: ['equals'] 
  },
  conversation_priority: { 
    label: 'Priority', 
    icon: Star, 
    operators: ['equals', 'greater_than'] 
  },
  previous_interactions: { 
    label: 'Previous Interactions', 
    icon: MessageSquare, 
    operators: ['greater_than', 'less_than', 'equals'] 
  },
  customer_vip: { 
    label: 'VIP Customer', 
    icon: Star, 
    operators: ['equals'] 
  },
};

const actionTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  assign_queue: { label: 'Assign to Queue', icon: Users, color: 'bg-blue-500' },
  assign_agent: { label: 'Assign to Agent', icon: User, color: 'bg-green-500' },
  assign_department: { label: 'Assign to Department', icon: Users, color: 'bg-purple-500' },
  trigger_bot: { label: 'Trigger Bot', icon: Bot, color: 'bg-orange-500' },
  escalate: { label: 'Escalate', icon: AlertTriangle, color: 'bg-red-500' },
  tag: { label: 'Add Tag', icon: Tag, color: 'bg-gray-500' },
};

// ============================================
// SAMPLE DATA
// ============================================

const sampleRules: RoutingRule[] = [
  {
    id: 'rule_1',
    tenantId: 'tenant_1',
    name: 'VIP Customers',
    description: 'Route VIP customers to priority queue',
    priority: 100,
    conditions: [
      { type: 'customer_vip', operator: 'equals', value: 'true' },
    ],
    action: { type: 'assign_queue', targetId: 'queue_priority' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_2',
    tenantId: 'tenant_1',
    name: 'Sales Inquiries',
    description: 'Route sales-related messages to sales team',
    priority: 80,
    conditions: [
      { type: 'keyword', operator: 'contains', value: 'price' },
      { type: 'keyword', operator: 'contains', value: 'buy' },
    ],
    action: { type: 'assign_queue', targetId: 'queue_sales' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_3',
    tenantId: 'tenant_1',
    name: 'Technical Support',
    description: 'Route technical issues to support team',
    priority: 70,
    conditions: [
      { type: 'keyword', operator: 'contains', value: 'bug' },
      { type: 'keyword', operator: 'contains', value: 'error' },
    ],
    action: { type: 'assign_queue', targetId: 'queue_support' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_4',
    tenantId: 'tenant_1',
    name: 'After Hours',
    description: 'Route to bot after business hours',
    priority: 50,
    conditions: [
      { type: 'time_of_day', operator: 'greater_than', value: '18' },
    ],
    action: { type: 'trigger_bot', targetId: null },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_5',
    tenantId: 'tenant_1',
    name: 'Urgent Issues',
    description: 'Escalate urgent issues immediately',
    priority: 90,
    conditions: [
      { type: 'keyword', operator: 'contains', value: 'urgent' },
      { type: 'conversation_priority', operator: 'equals', value: 'urgent' },
    ],
    action: { type: 'escalate', targetId: 'supervisor' },
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleKeywords: KeywordMapping[] = [
  {
    id: 'kw_1',
    tenantId: 'tenant_1',
    keyword: 'price',
    matchType: 'contains',
    priority: 10,
    action: { type: 'assign_queue', targetId: 'queue_sales' },
    translations: { es: 'precio', fr: 'prix' },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kw_2',
    tenantId: 'tenant_1',
    keyword: 'help',
    matchType: 'contains',
    priority: 5,
    action: { type: 'assign_queue', targetId: 'queue_support' },
    translations: { es: 'ayuda', fr: 'aide' },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kw_3',
    tenantId: 'tenant_1',
    keyword: 'agent',
    matchType: 'contains',
    priority: 20,
    action: { type: 'assign_queue', targetId: 'queue_general' },
    translations: {},
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kw_4',
    tenantId: 'tenant_1',
    keyword: 'refund',
    matchType: 'exact',
    priority: 15,
    action: { type: 'assign_queue', targetId: 'queue_billing' },
    translations: {},
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kw_5',
    tenantId: 'tenant_1',
    keyword: 'cancel',
    matchType: 'contains',
    priority: 12,
    action: { type: 'assign_queue', targetId: 'queue_retention' },
    translations: {},
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoutingRules() {
  const navigate = useNavigate();
  const { routingRules, keywordMappings, addRoutingRule, updateRoutingRule, deleteRoutingRule, addKeywordMapping, deleteKeywordMapping } = useChatStore();

  // Local state
  const [activeTab, setActiveTab] = useState('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showAddKeywordDialog, setShowAddKeywordDialog] = useState(false);

  // Form state for new rule
  const [newRule, setNewRule] = useState<Partial<RoutingRule>>({
    name: '',
    description: '',
    priority: 50,
    conditions: [],
    action: { type: 'assign_queue', targetId: '' },
    isActive: true,
  });

  // Form state for new keyword
  const [newKeyword, setNewKeyword] = useState<Partial<KeywordMapping>>({
    keyword: '',
    matchType: 'contains',
    priority: 10,
    action: { type: 'assign_queue', targetId: '' },
    isActive: true,
  });

  // Initialize with sample data if empty
  const displayRules = routingRules.length > 0 ? routingRules : sampleRules;
  const displayKeywords = keywordMappings.length > 0 ? keywordMappings : sampleKeywords;

  // Filter rules
  const filteredRules = displayRules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter keywords
  const filteredKeywords = displayKeywords.filter(kw =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort rules by priority (highest first)
  const sortedRules = [...filteredRules].sort((a, b) => b.priority - a.priority);

  // Handle add rule
  const handleAddRule = () => {
    if (!newRule.name || !newRule.action?.targetId) return;

    const rule: RoutingRule = {
      id: `rule_${Date.now()}`,
      tenantId: 'tenant_1',
      name: newRule.name,
      description: newRule.description || '',
      priority: newRule.priority || 50,
      conditions: newRule.conditions || [],
      action: newRule.action as any,
      isActive: newRule.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRoutingRule(rule);
    setShowAddRuleDialog(false);
    setNewRule({
      name: '',
      description: '',
      priority: 50,
      conditions: [],
      action: { type: 'assign_queue', targetId: '' },
      isActive: true,
    });
  };

  // Handle add keyword
  const handleAddKeyword = () => {
    if (!newKeyword.keyword || !newKeyword.action?.targetId) return;

    const keyword: KeywordMapping = {
      id: `kw_${Date.now()}`,
      tenantId: 'tenant_1',
      keyword: newKeyword.keyword,
      matchType: newKeyword.matchType as any,
      priority: newKeyword.priority || 10,
      action: newKeyword.action as any,
      translations: {},
      isActive: newKeyword.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    addKeywordMapping(keyword);
    setShowAddKeywordDialog(false);
    setNewKeyword({
      keyword: '',
      matchType: 'contains',
      priority: 10,
      action: { type: 'assign_queue', targetId: '' },
      isActive: true,
    });
  };

  // Handle toggle rule
  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    updateRoutingRule(ruleId, { isActive });
  };

  // Handle delete rule
  const handleDeleteRule = (ruleId: string) => {
    deleteRoutingRule(ruleId);
  };

  // Handle delete keyword
  const handleDeleteKeyword = (keywordId: string) => {
    deleteKeywordMapping(keywordId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Routing Rules</h1>
              <p className="text-sm text-muted-foreground">Manage conversation routing and keyword mappings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="rules">Routing Rules</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>
            <Button onClick={() => activeTab === 'rules' ? setShowAddRuleDialog(true) : setShowAddKeywordDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'rules' ? 'Rule' : 'Keyword'}
            </Button>
          </div>

          <TabsContent value="rules" className="space-y-4">
            {sortedRules.map((rule, index) => {
              const ActionIcon = actionTypeConfig[rule.action.type]?.icon || Users;
              const actionColor = actionTypeConfig[rule.action.type]?.color || 'bg-gray-500';

              return (
                <Card key={rule.id} className={cn(!rule.isActive && "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{rule.name}</h3>
                              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">Priority: {rule.priority}</Badge>
                            </div>
                            {rule.description && (
                              <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)} className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">If:</span>
                            <div className="flex flex-wrap gap-1">
                              {rule.conditions.length === 0 ? (
                                <Badge variant="secondary">Always</Badge>
                              ) : (
                                rule.conditions.map((condition, i) => {
                                  const ConditionIcon = conditionTypeConfig[condition.type]?.icon || Tag;
                                  return (
                                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                                      <ConditionIcon className="w-3 h-3" />
                                      {conditionTypeConfig[condition.type]?.label} {condition.operator} &quot;{condition.value}&quot;
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />

                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", actionColor)}>
                              <ActionIcon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm">{actionTypeConfig[rule.action.type]?.label}</span>
                            {rule.action.targetId && (
                              <Badge variant="secondary" className="text-xs">{rule.action.targetId}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {sortedRules.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No routing rules</h3>
                <p className="text-muted-foreground mb-4">Create your first routing rule to automate conversation assignment</p>
                <Button onClick={() => setShowAddRuleDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKeywords.map((keyword) => {
                const ActionIcon = actionTypeConfig[keyword.action.type]?.icon || Users;

                return (
                  <Card key={keyword.id} className={cn(!keyword.isActive && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="bg-accent px-2 py-1 rounded text-sm font-mono">
                              {keyword.keyword}
                            </code>
                            <Badge variant="outline" className="text-xs">{keyword.matchType}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={keyword.isActive ? 'default' : 'secondary'} className="text-xs">
                              {keyword.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Priority: {keyword.priority}</span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteKeyword(keyword.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="h-px bg-border my-3" />

                      <div className="flex items-center gap-2 text-sm">
                        <ActionIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{actionTypeConfig[keyword.action.type]?.label}</span>
                        {keyword.action.targetId && (
                          <Badge variant="secondary" className="text-xs">{keyword.action.targetId}</Badge>
                        )}
                      </div>

                      {Object.keys(keyword.translations).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(keyword.translations).map(([lang, translation]) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}: {translation}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredKeywords.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No keywords</h3>
                <p className="text-muted-foreground mb-4">Add keywords to automatically route conversations</p>
                <Button onClick={() => setShowAddKeywordDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keyword
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Rule Dialog */}
      <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Routing Rule</DialogTitle>
            <DialogDescription>
              Create a new rule to automatically route conversations based on conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., VIP Customer Routing"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newRule.description || ''}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="Describe what this rule does..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority (1-100)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={newRule.priority || 50}
                  onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={newRule.isActive ?? true}
                    onCheckedChange={(checked) => setNewRule({ ...newRule, isActive: checked })}
                  />
                  <span>{newRule.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Action *</Label>
              <div className="flex gap-2">
                <Select
                  value={newRule.action?.type || 'assign_queue'}
                  onValueChange={(value) => setNewRule({ 
                    ...newRule, 
                    action: { type: value as any, targetId: newRule.action?.targetId || '' } 
                  })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(actionTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Target ID (optional)"
                  value={newRule.action?.targetId || ''}
                  onChange={(e) => setNewRule({ 
                    ...newRule, 
                    action: { type: newRule.action?.type || 'assign_queue', targetId: e.target.value || null } 
                  })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRule}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Keyword Dialog */}
      <Dialog open={showAddKeywordDialog} onOpenChange={setShowAddKeywordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Keyword Mapping</DialogTitle>
            <DialogDescription>
              Add a keyword to automatically route conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Keyword *</Label>
              <Input
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                placeholder="e.g., price, help, support"
              />
            </div>

            <div className="space-y-2">
              <Label>Match Type</Label>
              <Select
                value={newKeyword.matchType}
                onValueChange={(value) => setNewKeyword({ ...newKeyword, matchType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="starts_with">Starts With</SelectItem>
                  <SelectItem value="ends_with">Ends With</SelectItem>
                  <SelectItem value="regex">Regex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority (1-100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newKeyword.priority}
                onChange={(e) => setNewKeyword({ ...newKeyword, priority: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Action *</Label>
              <div className="flex gap-2">
                <Select
                  value={newKeyword.action?.type || 'assign_queue'}
                  onValueChange={(value) => setNewKeyword({ 
                    ...newKeyword, 
                    action: { type: value as any, targetId: newKeyword.action?.targetId || '' } 
                  })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(actionTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Target ID"
                  value={newKeyword.action?.targetId || ''}
                  onChange={(e) => setNewKeyword({ 
                    ...newKeyword, 
                    action: { type: newKeyword.action?.type || 'assign_queue', targetId: e.target.value || null } 
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={newKeyword.isActive ?? true}
                onCheckedChange={(checked) => setNewKeyword({ ...newKeyword, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKeywordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddKeyword}>Add Keyword</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
