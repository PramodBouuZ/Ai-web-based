import { useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import { useMetaStore } from '@/store/metaStore';
import { MetaConnectModal } from '@/components/modals/MetaConnectModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Facebook,
  Plus,
  MoreVertical,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  BarChart3,
  MessageSquare,
  FileText,
  Globe,
  Shield,
  Star,
  Phone,
  ExternalLink,
} from 'lucide-react';

export function MetaAccounts() {
  const { accounts, currentAccount, templates, setCurrentAccount, disconnectAccount } = useMetaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('accounts');

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.displayPhoneNumber.includes(searchQuery) ||
    account.verifiedName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accountTemplates = currentAccount 
    ? templates.filter(t => t.accountId === currentAccount.id)
    : [];

  const handleDisconnect = async () => {
    if (selectedAccount) {
      await disconnectAccount(selectedAccount.id);
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  const getStatusBadge = (status: string, qualityRating: string) => {
    const qualityColors: Record<string, string> = {
      GREEN: 'bg-green-500',
      YELLOW: 'bg-yellow-500',
      RED: 'bg-red-500',
      NA: 'bg-gray-400',
    };

    if (status === 'connected' || status === 'VERIFIED') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </Badge>
          <div className={`w-2 h-2 rounded-full ${qualityColors[qualityRating] || 'bg-gray-400'}`} title={`Quality: ${qualityRating}`} />
        </div>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search Meta accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button className="gradient-primary" onClick={() => setIsConnectModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Connect Meta Account
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Connected Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold">
                  {formatNumber(accounts.reduce((acc, a) => acc + a.messagesSent, 0))}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Quality Score</p>
                <p className="text-2xl font-bold">
                  {accounts.filter(a => a.qualityRating === 'GREEN').length}/{accounts.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          {currentAccount && <TabsTrigger value="details">Account Details</TabsTrigger>}
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAccounts.map((account) => (
              <Card 
                key={account.id} 
                className={cn(
                  'card-hover cursor-pointer',
                  currentAccount?.id === account.id && 'ring-2 ring-[#25D366]'
                )}
                onClick={() => setCurrentAccount(account)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <Facebook className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {account.displayPhoneNumber}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(account.status, account.qualityRating)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setCurrentAccount(account)}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAccount(account);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Verified Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Verified Name</span>
                    <span className="font-medium flex items-center gap-1">
                      {account.verifiedName}
                      {account.isOfficialBusinessAccount && (
                        <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                      )}
                    </span>
                  </div>

                  {/* Message Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Message Usage</span>
                      <span className="text-sm font-medium">
                        {formatNumber(account.messagesSent)} / {formatNumber(account.messageLimit)}
                      </span>
                    </div>
                    <Progress
                      value={(account.messagesSent / account.messageLimit) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Business Account Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Timezone
                    </span>
                    <span>{account.timezoneId}</span>
                  </div>

                  {/* Template Namespace */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Template Namespace</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {account.messageTemplateNamespace || 'N/A'}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Facebook className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Meta accounts connected</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Connect your WhatsApp Business account via Meta Cloud API to start sending messages.
                </p>
                <Button className="gradient-primary" onClick={() => setIsConnectModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Meta Account
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {currentAccount ? `Templates for ${currentAccount.name}` : 'All Templates'}
            </h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentAccount ? accountTemplates : templates).map((template) => (
              <Card key={template.id} className="card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.language}</CardDescription>
                    </div>
                    <Badge 
                      variant={
                        template.status === 'APPROVED' ? 'default' : 
                        template.status === 'REJECTED' ? 'destructive' : 
                        'outline'
                      }
                    >
                      {template.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(currentAccount ? accountTemplates : templates).length === 0 && (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center text-center">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates</h3>
                <p className="text-gray-500">
                  Create message templates to send approved messages to your customers.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Account Details Tab */}
        {currentAccount && (
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentAccount.name}</CardTitle>
                    <CardDescription>Account details and configuration</CardDescription>
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Business Account ID</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {currentAccount.businessAccountId}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone Number ID</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {currentAccount.phoneNumberId}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Display Number</span>
                        <span>{currentAccount.displayPhoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quality Rating</span>
                        <Badge 
                          variant={
                            currentAccount.qualityRating === 'GREEN' ? 'default' :
                            currentAccount.qualityRating === 'YELLOW' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {currentAccount.qualityRating}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Usage Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Messages Sent</span>
                        <span className="font-medium">{formatNumber(currentAccount.messagesSent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Message Limit</span>
                        <span className="font-medium">{formatNumber(currentAccount.messageLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Usage %</span>
                        <span className="font-medium">
                          {((currentAccount.messagesSent / currentAccount.messageLimit) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Templates</span>
                        <span className="font-medium">{accountTemplates.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setSelectedAccount(currentAccount);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Connect Modal */}
      <MetaConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          // Show success notification
        }}
      />

      {/* Disconnect Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect "{selectedAccount?.name}"? This will remove the account from your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAccount(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
