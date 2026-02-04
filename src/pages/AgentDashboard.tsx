// ============================================
// AGENT DASHBOARD
// Real-time chat inbox and queue management for agents
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Inbox, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Mail,
  Tag,
  User,
  Bot,
  ArrowRight,
  ChevronDown,
  Star,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Headphones,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store';
import { useChatStore } from '@/store/chatStore';
import type { Conversation, ChatMessage, AgentStatus, PriorityLevel, ConversationStatus } from '@/types/chat';
import { cn, formatDate } from '@/lib/utils';

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig: Record<ConversationStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  bot_handling: { label: 'Bot', color: 'bg-purple-500', icon: Bot },
  queued: { label: 'Queued', color: 'bg-orange-500', icon: Users },
  assigned: { label: 'Assigned', color: 'bg-blue-500', icon: User },
  active: { label: 'Active', color: 'bg-green-500', icon: MessageSquare },
  waiting: { label: 'Waiting', color: 'bg-gray-500', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-600', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-400', icon: CheckCircle },
  escalated: { label: 'Escalated', color: 'bg-red-500', icon: AlertCircle },
};

const priorityConfig: Record<PriorityLevel, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-400' },
  high: { label: 'High', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-600' },
};

const agentStatusConfig: Record<AgentStatus, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-green-500' },
  busy: { label: 'Busy', color: 'bg-yellow-500' },
  away: { label: 'Away', color: 'bg-orange-500' },
  offline: { label: 'Offline', color: 'bg-gray-400' },
  break: { label: 'Break', color: 'bg-purple-500' },
  training: { label: 'Training', color: 'bg-blue-500' },
};

// ============================================
// QUICK REPLIES
// ============================================

const defaultQuickReplies = [
  { id: '1', shortcut: '/hello', message: 'Hello! How can I help you today?' },
  { id: '2', shortcut: '/thanks', message: 'Thank you for contacting us!' },
  { id: '3', shortcut: '/hold', message: 'Please hold on while I check that for you.' },
  { id: '4', shortcut: '/transfer', message: 'I\'m going to transfer you to a specialist who can better assist you.' },
  { id: '5', shortcut: '/closing', message: 'Is there anything else I can help you with today?' },
  { id: '6', shortcut: '/goodbye', message: 'Thank you for chatting with us. Have a great day!' },
];

// ============================================
// FORMAT TIME HELPER
// ============================================

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // Chat store
  const {
    conversations,
    currentConversationId,
    messages,
    agents,
    agentStatus,
    searchQuery,
    isSending,
    setCurrentConversation,
    setSearchQuery,
    sendMessage,
    assignConversation,
    closeConversation,
    transferConversation,
    getFilteredConversations,
    getMyConversations,
    getConversationMessages,
    getCurrentConversation,
    initializeChat,
    updateAgentStatus,
  } = useChatStore();

  // Local state
  const [messageInput, setMessageInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [activeTab, setActiveTab] = useState('my-chats');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load sample data for demo (Defined before useEffect to avoid hoist issues)
  const loadSampleData = () => {
    // Add sample conversations
    const sampleConversations: Conversation[] = [
      {
        id: 'conv_1',
        tenantId: 'tenant_1',
        phoneNumberId: 'phone_1',
        waId: '1234567890',
        customerName: 'John Smith',
        customerProfile: {
          name: 'John Smith',
          phone: '1234567890',
          email: 'john@example.com',
          language: 'en',
          country: 'US',
          timezone: 'America/New_York',
          customFields: {},
          tags: ['vip'],
          previousConversations: 3,
          isVip: true,
          lastContactAt: new Date().toISOString(),
        },
        status: 'active',
        priority: 'high',
        source: 'whatsapp',
        assignedAgentId: user?.id || null,
        assignedQueueId: null,
        departmentId: null,
        botActive: false,
        botSessionId: null,
        lastMessageAt: new Date().toISOString(),
        lastAgentMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
        tags: ['support'],
        notes: [],
        slaDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        firstResponseTime: null,
        resolutionTime: null,
      },
      {
        id: 'conv_2',
        tenantId: 'tenant_1',
        phoneNumberId: 'phone_1',
        waId: '9876543210',
        customerName: 'Sarah Johnson',
        customerProfile: {
          name: 'Sarah Johnson',
          phone: '9876543210',
          email: 'sarah@example.com',
          language: 'en',
          country: 'US',
          timezone: 'America/New_York',
          customFields: {},
          tags: [],
          previousConversations: 1,
          isVip: false,
          lastContactAt: new Date().toISOString(),
        },
        status: 'bot_handling',
        priority: 'medium',
        source: 'whatsapp',
        assignedAgentId: null,
        assignedQueueId: 'queue_1',
        departmentId: null,
        botActive: true,
        botSessionId: 'session_1',
        lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        lastAgentMessageAt: null,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: {},
        tags: [],
        notes: [],
        slaDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        firstResponseTime: null,
        resolutionTime: null,
      },
      {
        id: 'conv_3',
        tenantId: 'tenant_1',
        phoneNumberId: 'phone_1',
        waId: '5555555555',
        customerName: null,
        customerProfile: null,
        status: 'pending',
        priority: 'low',
        source: 'whatsapp',
        assignedAgentId: null,
        assignedQueueId: null,
        departmentId: null,
        botActive: true,
        botSessionId: null,
        lastMessageAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        lastAgentMessageAt: null,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metadata: {},
        tags: [],
        notes: [],
        slaDeadline: null,
        firstResponseTime: null,
        resolutionTime: null,
      },
    ];

    useChatStore.setState({ conversations: sampleConversations });

    // Add sample messages
    const sampleMessages: Record<string, ChatMessage[]> = {
      conv_1: [
        {
          id: 'msg_1',
          conversationId: 'conv_1',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'inbound',
          from: '1234567890',
          to: 'bot',
          content: { text: 'Hi, I need help with my order' },
          status: 'read',
          metadata: {},
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_2',
          conversationId: 'conv_1',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'outbound',
          from: 'bot',
          to: '1234567890',
          content: { text: 'Hello! I\'d be happy to help with your order. Could you please provide your order number?' },
          status: 'read',
          metadata: { botGenerated: true },
          createdAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_3',
          conversationId: 'conv_1',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'inbound',
          from: '1234567890',
          to: 'bot',
          content: { text: 'It\'s #ORD-12345' },
          status: 'read',
          metadata: {},
          createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_4',
          conversationId: 'conv_1',
          tenantId: 'tenant_1',
          type: 'system',
          direction: 'outbound',
          from: 'system',
          to: '1234567890',
          content: { text: 'Conversation assigned to Agent' },
          status: 'delivered',
          metadata: {},
          createdAt: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_5',
          conversationId: 'conv_1',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'outbound',
          from: user?.id || 'agent',
          to: '1234567890',
          content: { text: 'Hi John! I can see your order #ORD-12345. It\'s currently being processed and will ship within 2 business days.' },
          status: 'read',
          metadata: { agentId: user?.id },
          createdAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_6',
          conversationId: 'conv_1',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'inbound',
          from: '1234567890',
          to: user?.id || 'agent',
          content: { text: 'Great, thank you! Can I change the shipping address?' },
          status: 'delivered',
          metadata: {},
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
      ],
      conv_2: [
        {
          id: 'msg_7',
          conversationId: 'conv_2',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'inbound',
          from: '9876543210',
          to: 'bot',
          content: { text: 'What are your business hours?' },
          status: 'read',
          metadata: {},
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_8',
          conversationId: 'conv_2',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'outbound',
          from: 'bot',
          to: '9876543210',
          content: { text: 'Our business hours are Monday to Friday, 9 AM to 6 PM. We\'re closed on weekends and public holidays.' },
          status: 'read',
          metadata: { botGenerated: true },
          createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
        {
          id: 'msg_9',
          conversationId: 'conv_2',
          tenantId: 'tenant_1',
          type: 'text',
          direction: 'inbound',
          from: '9876543210',
          to: 'bot',
          content: { text: 'Thanks! And where are you located?' },
          status: 'read',
          metadata: {},
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          editedAt: null,
          deletedAt: null,
          replyTo: null,
        },
      ],
    };

    useChatStore.setState({ messages: sampleMessages });
  };

  // Initialize chat
  useEffect(() => {
    if (user) {
      initializeChat('tenant_1', user.id);

      // Load sample data
      loadSampleData();
    }
  }, [user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentConversationId]);

  // Handle status change
  const handleStatusChange = (status: AgentStatus) => {
    updateAgentStatus(user?.id || '', status);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversationId) return;

    await sendMessage(currentConversationId, { type: 'text', text: messageInput.trim() });
    setMessageInput('');
    setShowQuickReplies(false);
  };

  // Handle quick reply
  const handleQuickReply = (message: string) => {
    setMessageInput(message);
    setShowQuickReplies(false);
    messageInputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle transfer
  const handleTransfer = () => {
    if (!currentConversationId || !selectedAgentId) return;
    
    transferConversation(currentConversationId, selectedAgentId, transferReason);
    setShowTransferDialog(false);
    setSelectedAgentId('');
    setTransferReason('');
  };

  // Handle close conversation
  const handleCloseConversation = () => {
    if (!currentConversationId) return;
    
    closeConversation(currentConversationId, 'Resolved');
    setCurrentConversation(null);
  };

  // Filter conversations based on active tab
  const getConversationsForTab = () => {
    switch (activeTab) {
      case 'my-chats':
        return getMyConversations();
      case 'queue':
        return conversations.filter(c => c.status === 'queued' || (c.status === 'bot_handling' && !c.assignedAgentId));
      case 'pending':
        return conversations.filter(c => c.status === 'pending');
      case 'all':
        return getFilteredConversations();
      default:
        return getMyConversations();
    }
  };

  const currentConversation = getCurrentConversation();
  const currentMessages = currentConversationId ? getConversationMessages(currentConversationId) : [];
  const displayedConversations = getConversationsForTab();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the agent dashboard.</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-16 bg-card border-r flex flex-col items-center py-4 gap-2">
        <div className="p-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        
        <Separator className="w-8" />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={cn("rounded-xl", activeTab === 'my-chats' && "bg-accent")}
                onClick={() => setActiveTab('my-chats')}
              >
                <Inbox className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>My Chats</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={cn("rounded-xl", activeTab === 'queue' && "bg-accent")}
                onClick={() => setActiveTab('queue')}
              >
                <Users className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Queue</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={cn("rounded-xl", activeTab === 'pending' && "bg-accent")}
                onClick={() => setActiveTab('pending')}
              >
                <Clock className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Pending</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl"
                onClick={() => navigate('/dashboard/routing-rules')}
              >
                <Route className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Routing Rules</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl"
                onClick={() => navigate('/dashboard/analytics')}
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Analytics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Conversation List */}
      <div className="w-80 bg-card border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              {activeTab === 'my-chats' && 'My Chats'}
              {activeTab === 'queue' && 'Queue'}
              {activeTab === 'pending' && 'Pending'}
              {activeTab === 'all' && 'All Conversations'}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className={cn("w-2 h-2 rounded-full", agentStatusConfig[agentStatus].color)} />
                  {agentStatusConfig[agentStatus].label}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(agentStatusConfig) as AgentStatus[]).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                    <div className={cn("w-2 h-2 rounded-full mr-2", agentStatusConfig[status].color)} />
                    {agentStatusConfig[status].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>{getMyConversations().length} active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{conversations.filter(c => c.status === 'queued').length} queued</span>
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {displayedConversations.map((conversation) => {
              const StatusIcon = statusConfig[conversation.status].icon;
              const isActive = currentConversationId === conversation.id;
              const lastMessage = messages[conversation.id]?.slice(-1)[0];

              return (
                <button
                  key={conversation.id}
                  onClick={() => setCurrentConversation(conversation.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.customerName?.charAt(0) || '#'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {conversation.customerName || conversation.waId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content.text || 'No messages'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", priorityConfig[conversation.priority].color, "text-white")}
                        >
                          {priorityConfig[conversation.priority].label}
                        </Badge>
                        <StatusIcon className="w-3 h-3 text-muted-foreground" />
                        {conversation.customerProfile?.isVip && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {displayedConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {currentConversation.customerName?.charAt(0) || '#'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {currentConversation.customerName || currentConversation.waId}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{currentConversation.waId}</span>
                    {currentConversation.customerProfile?.email && (
                      <>
                        <span>•</span>
                        <Mail className="w-3 h-3" />
                        <span>{currentConversation.customerProfile.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentConversation.status !== 'closed' && (
                  <>
                    <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transfer Conversation</DialogTitle>
                          <DialogDescription>
                            Select an agent to transfer this conversation to.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Agent</label>
                            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an agent..." />
                              </SelectTrigger>
                              <SelectContent>
                                {agents
                                  .filter(a => a.id !== user?.id && a.status === 'online')
                                  .map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Reason (optional)</label>
                            <Textarea
                              value={transferReason}
                              onChange={(e) => setTransferReason(e.target.value)}
                              placeholder="Why are you transferring this conversation?"
                            />
                          </div>
                          <Button 
                            onClick={handleTransfer} 
                            disabled={!selectedAgentId}
                            className="w-full"
                          >
                            Transfer Conversation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={() => setShowTransferDialog(true)}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleCloseConversation}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Customer Profile</DropdownMenuItem>
                    <DropdownMenuItem>View Order History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((message, index) => {
                  const isFirstInGroup = index === 0 || currentMessages[index - 1].from !== message.from;
                  const isLastInGroup = index === currentMessages.length - 1 || currentMessages[index + 1].from !== message.from;

                  if (message.type === 'system') {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <Badge variant="secondary" className="text-xs">
                          {message.content.text}
                        </Badge>
                      </div>
                    );
                  }

                  const isOutbound = message.direction === 'outbound';

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOutbound ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          isOutbound
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md",
                          !isFirstInGroup && (isOutbound ? "rounded-tr-md" : "rounded-tl-md"),
                          !isLastInGroup && (isOutbound ? "rounded-br-md" : "rounded-bl-md")
                        )}
                      >
                        {message.content.text && (
                          <p className="text-sm">{message.content.text}</p>
                        )}
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1",
                            isOutbound ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className="text-xs opacity-70">
                            {formatTime(message.createdAt)}
                          </span>
                          {isOutbound && (
                            <>
                              {message.status === 'sent' && <CheckCircle className="w-3 h-3 opacity-70" />}
                              {message.status === 'delivered' && <CheckCircle className="w-3 h-3 opacity-70" />}
                              {message.status === 'read' && <CheckCircle className="w-3 h-3 opacity-70" />}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              {showQuickReplies && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {defaultQuickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply.message)}
                      className="text-xs bg-accent hover:bg-accent/80 px-2 py-1 rounded"
                    >
                      {reply.shortcut}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={cn(showQuickReplies && "bg-accent")}
                >
                  <Zap className="w-5 h-5" />
                </Button>

                <div className="flex-1 relative">
                  <Textarea
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[44px] max-h-32 resize-none pr-12"
                    rows={1}
                  />
                  {messageInput.startsWith('/') && (
                    <div className="absolute bottom-full left-0 mb-1 w-full bg-popover border rounded-md shadow-lg p-2">
                      {defaultQuickReplies
                        .filter(r => r.shortcut.startsWith(messageInput.split(' ')[0]))
                        .map(reply => (
                          <button
                            key={reply.id}
                            onClick={() => handleQuickReply(reply.message)}
                            className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                          >
                            <span className="font-medium">{reply.shortcut}</span>
                            <span className="text-muted-foreground ml-2">{reply.message}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Customer Info */}
      {currentConversation && (
        <div className="w-72 bg-card border-l p-4">
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {currentConversation.customerName?.charAt(0) || '#'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium">
                  {currentConversation.customerName || 'Unknown'}
                </h3>
                <p className="text-sm text-muted-foreground">{currentConversation.waId}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const StatusIcon = statusConfig[currentConversation.status].icon;
                      return <StatusIcon className="w-4 h-4" />;
                    })()}
                    <span className="text-sm">{statusConfig[currentConversation.status].label}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Priority</label>
                  <Badge 
                    className={cn("mt-1", priorityConfig[currentConversation.priority].color, "text-white")}
                  >
                    {priorityConfig[currentConversation.priority].label}
                  </Badge>
                </div>

                {currentConversation.customerProfile?.email && (
                  <div>
                    <label className="text-xs text-muted-foreground">Email</label>
                    <p className="text-sm">{currentConversation.customerProfile.email}</p>
                  </div>
                )}

                {currentConversation.customerProfile?.country && (
                  <div>
                    <label className="text-xs text-muted-foreground">Country</label>
                    <p className="text-sm">{currentConversation.customerProfile.country}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(currentConversation.createdAt)}</p>
                </div>

                {currentConversation.slaDeadline && (
                  <div>
                    <label className="text-xs text-muted-foreground">SLA Deadline</label>
                    <p className={cn(
                      "text-sm",
                      new Date(currentConversation.slaDeadline) < new Date() && "text-destructive"
                    )}>
                      {formatTime(currentConversation.slaDeadline)}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {currentConversation.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Tag className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-3">
                {currentConversation.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notes yet
                  </p>
                ) : (
                  currentConversation.notes.map((note) => (
                    <div key={note.id} className="bg-accent p-3 rounded-lg">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(note.createdAt)}
                      </p>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full" size="sm">
                  Add Note
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Previous conversations: {currentConversation.customerProfile?.previousConversations || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Last contact: {currentConversation.customerProfile?.lastContactAt ? formatDate(currentConversation.customerProfile.lastContactAt) : 'Never'}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
