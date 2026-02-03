import { useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import { useWhatsAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Send,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Copy,
} from 'lucide-react';

export function BulkMessaging() {
  const { campaigns, templates, createCampaign, sendCampaign, isLoading } = useWhatsAppStore();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // New campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCampaign = async () => {
    await createCampaign({
      name: campaignName,
      templateId: selectedTemplate,
      groups: selectedGroups,
    });
    setIsCreateDialogOpen(false);
    setCampaignName('');
    setSelectedTemplate('');
    setSelectedGroups([]);
  };

  const handleSendCampaign = async (campaignId: string) => {
    await sendCampaign(campaignId);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      draft: { label: 'Draft', variant: 'secondary', icon: FileText },
      scheduled: { label: 'Scheduled', variant: 'outline', icon: Calendar },
      sending: { label: 'Sending', variant: 'default', icon: Send },
      sent: { label: 'Sent', variant: 'default', icon: CheckCircle2 },
      paused: { label: 'Paused', variant: 'outline', icon: Pause },
      failed: { label: 'Failed', variant: 'destructive', icon: AlertCircle },
    };
    const config = configs[status] || { label: status, variant: 'secondary', icon: FileText };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
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
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Create a new messaging campaign to reach your audience.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Campaign Name */}
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="e.g., Summer Sale 2024"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="template">Message Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Preview */}
                  {selectedTemplateData && (
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Template Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
                          {selectedTemplateData.header && (
                            <p className="font-semibold">{selectedTemplateData.header.content}</p>
                          )}
                          <p className="text-gray-700 dark:text-gray-300">
                            {selectedTemplateData.body}
                          </p>
                          {selectedTemplateData.footer && (
                            <p className="text-xs text-gray-500">{selectedTemplateData.footer}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recipient Groups */}
                  <div className="space-y-2">
                    <Label>Recipient Groups</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['All Contacts', 'Customers', 'Leads', 'VIP'].map((group) => (
                        <label
                          key={group}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            selectedGroups.includes(group)
                              ? 'border-[#25D366] bg-[#25D366]/5'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroups([...selectedGroups, group]);
                              } else {
                                setSelectedGroups(selectedGroups.filter((g) => g !== group));
                              }
                            }}
                            className="sr-only"
                          />
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="flex-1">{group}</span>
                          {selectedGroups.includes(group) && (
                            <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="schedule"
                          value="now"
                          checked={scheduleType === 'now'}
                          onChange={() => setScheduleType('now')}
                          className="text-[#25D366]"
                        />
                        <span>Send Now</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="schedule"
                          value="later"
                          checked={scheduleType === 'later'}
                          onChange={() => setScheduleType('later')}
                          className="text-[#25D366]"
                        />
                        <span>Schedule for Later</span>
                      </label>
                    </div>
                    {scheduleType === 'later' && (
                      <Input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="gradient-primary"
                    onClick={handleCreateCampaign}
                    disabled={!campaignName || !selectedTemplate || isLoading}
                  >
                    {isLoading ? (
                      <Send className="w-4 h-4 animate-pulse" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {templates.find((t) => t.id === campaign.templateId)?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {formatNumber(campaign.stats.total)} recipients
                        </span>
                        {campaign.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(campaign.scheduledAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      {campaign.status !== 'draft' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Delivery Progress</span>
                            <span className="font-medium">
                              {campaign.stats.sent}/{campaign.stats.total}
                            </span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div
                              className="bg-green-500 rounded-l-full"
                              style={{
                                width: `${(campaign.stats.delivered / campaign.stats.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-blue-500"
                              style={{
                                width: `${(campaign.stats.read / campaign.stats.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-red-500 rounded-r-full"
                              style={{
                                width: `${(campaign.stats.failed / campaign.stats.total) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Delivered: {formatNumber(campaign.stats.delivered)}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              Read: {formatNumber(campaign.stats.read)}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Failed: {formatNumber(campaign.stats.failed)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {campaign.status === 'draft' && (
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {campaign.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => handleSendCampaign(campaign.id)}
                            className="text-green-600"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredCampaigns.length === 0 && (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Create your first campaign to start reaching your audience on WhatsApp.
                </p>
                <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search templates..." className="pl-10" />
            </div>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="capitalize">{template.category}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        template.status === 'approved'
                          ? 'default'
                          : template.status === 'rejected'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {template.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    {template.header && (
                      <p className="font-semibold text-sm mb-2">{template.header.content}</p>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {template.body}
                    </p>
                    {template.footer && (
                      <p className="text-xs text-gray-500 mt-2">{template.footer}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {template.variables.length} variables
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
