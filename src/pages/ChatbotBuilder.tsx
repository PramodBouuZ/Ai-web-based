import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn, formatNumber } from '@/lib/utils';
import { useChatbotStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Bot,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Users,
  Brain,
  Settings,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import type { Chatbot } from '@/types';

export function ChatbotBuilder() {
  const { chatbots, isLoading, createChatbot, deleteChatbot, toggleChatbot, trainChatbot } = useChatbotStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);

  // New chatbot form
  const [newBotName, setNewBotName] = useState('');
  const [newBotDescription, setNewBotDescription] = useState('');

  const filteredChatbots = chatbots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChatbot = async () => {
    await createChatbot({
      name: newBotName,
      description: newBotDescription,
    });
    setIsCreateDialogOpen(false);
    setNewBotName('');
    setNewBotDescription('');
  };

  const handleDelete = async () => {
    if (selectedChatbot) {
      await deleteChatbot(selectedChatbot.id);
      setIsDeleteDialogOpen(false);
      setSelectedChatbot(null);
    }
  };

  const handleToggle = async (bot: Chatbot) => {
    await toggleChatbot(bot.id);
  };

  const handleTrain = async (botId: string) => {
    await trainChatbot(botId);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      active: { label: 'Active', variant: 'default', icon: CheckCircle2 },
      inactive: { label: 'Inactive', variant: 'secondary', icon: XCircle },
      training: { label: 'Training', variant: 'outline', icon: RefreshCw },
    };
    const config = configs[status] || { label: status, variant: 'secondary', icon: XCircle };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={cn('w-3 h-3', status === 'training' && 'animate-spin')} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search chatbots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chatbot</DialogTitle>
              <DialogDescription>
                Build an AI-powered chatbot to automate customer conversations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Chatbot Name</Label>
                <Input
                  id="bot-name"
                  placeholder="e.g., Customer Support Bot"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-description">Description</Label>
                <Textarea
                  id="bot-description"
                  placeholder="What will this chatbot help with?"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleCreateChatbot}
                disabled={!newBotName || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Chatbot
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chatbots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChatbots.map((chatbot) => (
          <Card key={chatbot.id} className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      chatbot.status === 'active'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {chatbot.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/chatbots/${chatbot.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Flow
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/chatbots/${chatbot.id}/training`}>
                        <Brain className="w-4 h-4 mr-2" />
                        Training Data
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/chatbots/${chatbot.id}/settings`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleToggle(chatbot)}>
                      {chatbot.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedChatbot(chatbot);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                {getStatusBadge(chatbot.status)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Conversations</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatNumber(chatbot.stats.totalConversations)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {chatbot.stats.satisfactionRate.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Avg Response
                  </span>
                  <span className="font-medium">{chatbot.stats.avgResponseTime}s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Handoffs
                  </span>
                  <span className="font-medium">
                    {formatNumber(chatbot.stats.handoffCount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant={chatbot.status === 'active' ? 'outline' : 'default'}
                  size="sm"
                  className={cn('flex-1', chatbot.status !== 'active' && 'gradient-primary')}
                  onClick={() => handleToggle(chatbot)}
                >
                  {chatbot.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTrain(chatbot.id)}
                  disabled={chatbot.status === 'training'}
                >
                  <RefreshCw
                    className={cn('w-4 h-4', chatbot.status === 'training' && 'animate-spin')}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredChatbots.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No chatbots yet</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Create your first AI-powered chatbot to automate customer support and engagement.
            </p>
            <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Chatbot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Features Section */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>AI-Powered Features</CardTitle>
              <CardDescription>Enhance your chatbots with advanced AI capabilities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold">Natural Language Understanding</h4>
              <p className="text-sm text-gray-500">
                Train your chatbot to understand customer intent and respond naturally using GPT-4.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold">Knowledge Base</h4>
              <p className="text-sm text-gray-500">
                Upload documents, FAQs, and website content to train your chatbot on your business.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold">Continuous Learning</h4>
              <p className="text-sm text-gray-500">
                Your chatbot improves over time based on customer interactions and feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedChatbot?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedChatbot(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
