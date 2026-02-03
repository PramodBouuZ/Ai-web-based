import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Database,
  Cloud,
  FileSpreadsheet,
  Link as LinkIcon,
  Unlink,
  Calendar,
  Plus,
} from 'lucide-react';

interface CRMProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

const crmProviders: CRMProvider[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect with Salesforce CRM to sync contacts and leads',
    icon: Cloud,
    color: 'bg-blue-500',
    status: 'connected',
    lastSync: '2024-01-15T10:30:00Z',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Integrate with HubSpot for marketing automation',
    icon: Database,
    color: 'bg-orange-500',
    status: 'disconnected',
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    description: 'Sync data with Zoho CRM platform',
    icon: FileSpreadsheet,
    color: 'bg-red-500',
    status: 'disconnected',
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Connect your sales pipeline with WhatsApp',
    icon: Database,
    color: 'bg-green-500',
    status: 'disconnected',
  },
  {
    id: 'freshsales',
    name: 'Freshsales',
    description: 'Integrate with Freshworks CRM',
    icon: Cloud,
    color: 'bg-purple-500',
    status: 'disconnected',
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Connect with your own CRM using webhooks',
    icon: Plug,
    color: 'bg-gray-500',
    status: 'disconnected',
  },
];

const syncLogs = [
  { id: '1', action: 'Contact Sync', provider: 'Salesforce', status: 'success', timestamp: '2024-01-15T10:30:00Z', details: '245 contacts synced' },
  { id: '2', action: 'Lead Import', provider: 'Salesforce', status: 'success', timestamp: '2024-01-15T09:15:00Z', details: '12 leads imported' },
  { id: '3', action: 'Contact Update', provider: 'Salesforce', status: 'error', timestamp: '2024-01-14T16:45:00Z', details: 'Failed to update 3 contacts' },
  { id: '4', action: 'Field Mapping', provider: 'Salesforce', status: 'success', timestamp: '2024-01-14T14:20:00Z', details: 'Mapping updated' },
  { id: '5', action: 'Contact Sync', provider: 'Salesforce', status: 'success', timestamp: '2024-01-13T11:00:00Z', details: '189 contacts synced' },
];

const fieldMappings = [
  { source: 'WhatsApp Phone', target: 'Phone', provider: 'Salesforce' },
  { source: 'Contact Name', target: 'Full Name', provider: 'Salesforce' },
  { source: 'WhatsApp ID', target: 'WhatsApp_ID__c', provider: 'Salesforce' },
  { source: 'Last Message', target: 'Last_WhatsApp_Message__c', provider: 'Salesforce' },
  { source: 'Chatbot Interactions', target: 'Chatbot_Interactions__c', provider: 'Salesforce' },
];

export function CRMIntegration() {
  const [providers, setProviders] = useState(crmProviders);
  const [selectedProvider, setSelectedProvider] = useState<CRMProvider | null>(null);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'mappings' | 'logs'>('providers');

  const handleConnect = (provider: CRMProvider) => {
    setSelectedProvider(provider);
    setIsConnectDialogOpen(true);
  };

  const handleToggleConnection = (providerId: string) => {
    setProviders(providers.map(p => 
      p.id === providerId 
        ? { ...p, status: p.status === 'connected' ? 'disconnected' : 'connected', lastSync: p.status === 'disconnected' ? new Date().toISOString() : undefined }
        : p
    ));
  };

  const connectedCount = providers.filter(p => p.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Connected CRMs</p>
                <p className="text-3xl font-bold">{connectedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Plug className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Synced Contacts</p>
                <p className="text-3xl font-bold">12,847</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Sync</p>
                <p className="text-lg font-semibold">2 hours ago</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setActiveTab('providers')}
          className={cn(
            'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'providers'
              ? 'border-[#25D366] text-[#25D366]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          CRM Providers
        </button>
        <button
          onClick={() => setActiveTab('mappings')}
          className={cn(
            'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'mappings'
              ? 'border-[#25D366] text-[#25D366]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Field Mappings
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={cn(
            'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'logs'
              ? 'border-[#25D366] text-[#25D366]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Sync Logs
        </button>
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', provider.color)}>
                      <provider.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <Badge
                        variant={provider.status === 'connected' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {provider.status === 'connected' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Disconnected
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={provider.status === 'connected'}
                    onCheckedChange={() => handleToggleConnection(provider.id)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">{provider.description}</p>
                
                {provider.status === 'connected' && provider.lastSync && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="w-4 h-4" />
                    Last synced: {new Date(provider.lastSync).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2">
                  {provider.status === 'connected' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleConnection(provider.id)}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gradient-primary"
                      onClick={() => handleConnect(provider)}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Field Mappings Tab */}
      {activeTab === 'mappings' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Field Mappings</CardTitle>
              <CardDescription>Configure how data syncs between systems</CardDescription>
            </div>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Mapping
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WhatsApp Field</TableHead>
                  <TableHead>CRM Field</TableHead>
                  <TableHead>CRM Provider</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldMappings.map((mapping, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{mapping.source}</TableCell>
                    <TableCell>{mapping.target}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{mapping.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sync Logs Tab */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Logs</CardTitle>
            <CardDescription>History of synchronization activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.provider}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === 'success' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{log.details}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your {selectedProvider?.name} credentials to establish the connection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter your API key" />
            </div>
            <div className="space-y-2">
              <Label>Instance URL (optional)</Label>
              <Input placeholder="https://your-instance.salesforce.com" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="auto-sync" />
              <Label htmlFor="auto-sync">Enable automatic sync</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={() => {
                if (selectedProvider) {
                  handleToggleConnection(selectedProvider.id);
                }
                setIsConnectDialogOpen(false);
              }}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
