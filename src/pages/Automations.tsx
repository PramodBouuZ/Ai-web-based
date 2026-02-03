import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Workflow,
  Plus,
  MoreVertical,
  Play,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  Zap,
  Tag,
  UserPlus,
  Webhook,
  ArrowRight,
  Search,
  Copy,
  Bell,
} from 'lucide-react';
import type { Automation } from '@/types';

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Welcome New Contacts',
    description: 'Send a welcome message when a new contact is added',
    status: 'active',
    trigger: { type: 'contact_added', config: {} },
    conditions: [],
    actions: [{ type: 'send_message', config: { template: 'welcome' } }],
    executionCount: 1234,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    userId: '1',
  },
  {
    id: '2',
    name: 'Follow-up After 24h',
    description: 'Send follow-up message if no response after 24 hours',
    status: 'active',
    trigger: { type: 'message_received', config: { delay: 24 } },
    conditions: [{ field: 'response', operator: 'exists', value: 'false' }],
    actions: [{ type: 'send_message', config: { template: 'followup' } }],
    executionCount: 567,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    userId: '1',
  },
  {
    id: '3',
    name: 'Tag VIP Customers',
    description: 'Automatically tag customers who spend over $1000',
    status: 'inactive',
    trigger: { type: 'webhook', config: { event: 'purchase' } },
    conditions: [{ field: 'order_total', operator: 'greater_than', value: '1000' }],
    actions: [{ type: 'add_tag', config: { tag: 'VIP' } }],
    executionCount: 89,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    userId: '1',
  },
  {
    id: '4',
    name: 'Birthday Wishes',
    description: 'Send birthday messages to contacts',
    status: 'active',
    trigger: { type: 'scheduled', config: { cron: '0 9 * * *' } },
    conditions: [],
    actions: [{ type: 'send_message', config: { template: 'birthday' } }],
    executionCount: 456,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    userId: '1',
  },
];

const triggerTypes = [
  { value: 'message_received', label: 'Message Received', icon: MessageSquare },
  { value: 'contact_added', label: 'Contact Added', icon: UserPlus },
  { value: 'tag_applied', label: 'Tag Applied', icon: Tag },
  { value: 'scheduled', label: 'Scheduled', icon: Clock },
  { value: 'webhook', label: 'Webhook', icon: Webhook },
];

const actionTypes = [
  { value: 'send_message', label: 'Send Message', icon: MessageSquare },
  { value: 'add_tag', label: 'Add Tag', icon: Tag },
  { value: 'remove_tag', label: 'Remove Tag', icon: Tag },
  { value: 'update_contact', label: 'Update Contact', icon: UserPlus },
  { value: 'notify_user', label: 'Notify User', icon: Bell },
  { value: 'webhook', label: 'Webhook Call', icon: Webhook },
];

export function Automations() {
  const [automations, setAutomations] = useState(mockAutomations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // New automation form
  const [newAutomationName, setNewAutomationName] = useState('');
  const [newAutomationTrigger, setNewAutomationTrigger] = useState('');
  const [newAutomationAction, setNewAutomationAction] = useState('');

  const filteredAutomations = automations.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
      )
    );
  };

  const handleCreate = () => {
    const newAutomation: Automation = {
      id: Date.now().toString(),
      name: newAutomationName,
      description: '',
      status: 'inactive',
      trigger: { type: newAutomationTrigger as any, config: {} },
      conditions: [],
      actions: [{ type: newAutomationAction as any, config: {} }],
      executionCount: 0,
      createdAt: new Date().toISOString(),
      userId: '1',
    };
    setAutomations([...automations, newAutomation]);
    setIsCreateDialogOpen(false);
    setNewAutomationName('');
    setNewAutomationTrigger('');
    setNewAutomationAction('');
  };

  // Status badge component (used inline)
  // const StatusBadge = ({ status }: { status: string }) => (
  //   status === 'active' ? (
  //     <Badge variant="default" className="flex items-center gap-1">
  //       <CheckCircle2 className="w-3 h-3" />
  //       Active
  //     </Badge>
  //   ) : (
  //     <Badge variant="secondary" className="flex items-center gap-1">
  //       <XCircle className="w-3 h-3" />
  //       Inactive
  //     </Badge>
  //   )
  // );

  const getTriggerIcon = (type: string) => {
    const trigger = triggerTypes.find((t) => t.value === type);
    return trigger?.icon || Zap;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Automations</p>
                <p className="text-3xl font-bold">{automations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Workflow className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-3xl font-bold">
                  {automations.filter((a) => a.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Executions</p>
                <p className="text-3xl font-bold">
                  {automations.reduce((acc, a) => acc + a.executionCount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-3xl font-bold">2,847</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search automations..."
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
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
              <DialogDescription>Set up an automated workflow.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="auto-name">Automation Name</Label>
                <Input
                  id="auto-name"
                  placeholder="e.g., Welcome Message"
                  value={newAutomationName}
                  onChange={(e) => setNewAutomationName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select value={newAutomationTrigger} onValueChange={setNewAutomationTrigger}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="flex items-center gap-2">
                          <trigger.icon className="w-4 h-4" />
                          {trigger.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={newAutomationAction} onValueChange={setNewAutomationAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleCreate}
                disabled={!newAutomationName || !newAutomationTrigger || !newAutomationAction}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAutomations.map((automation) => {
          const TriggerIcon = getTriggerIcon(automation.trigger.type);
          return (
            <Card key={automation.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        automation.status === 'active'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      <TriggerIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{automation.name}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {automation.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.status === 'active'}
                      onCheckedChange={() => handleToggle(automation.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Flow Preview */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                    <TriggerIcon className="w-4 h-4" />
                    <span className="capitalize">{automation.trigger.type.replace('_', ' ')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                    <Zap className="w-4 h-4" />
                    <span className="capitalize">{automation.actions[0]?.type.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {automation.executionCount.toLocaleString()}
                    </span>{' '}
                    executions
                  </span>
                  <span className="text-gray-500">
                    Last run:{' '}
                    {automation.lastExecutedAt
                      ? new Date(automation.lastExecutedAt).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAutomations.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Workflow className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Create your first automation to streamline your workflow and save time.
            </p>
            <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
