import { useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import { useWhatsAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  MessageSquare,
  Plus,
  MoreVertical,
  Power,
  PowerOff,
  Settings,
  Trash2,
  QrCode,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import type { WhatsAppAccount } from '@/types';

export function WhatsAppAccounts() {
  const { accounts, isLoading, addAccount, deleteAccount, connectAccount, disconnectAccount } = useWhatsAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppAccount | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountPhone, setNewAccountPhone] = useState('');

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAccount = async () => {
    await addAccount({
      name: newAccountName,
      phoneNumber: newAccountPhone,
    });
    setIsAddDialogOpen(false);
    setNewAccountName('');
    setNewAccountPhone('');
    setIsQRDialogOpen(true);
  };

  const handleConnect = async (account: WhatsAppAccount) => {
    setSelectedAccount(account);
    setIsQRDialogOpen(true);
    await connectAccount(account.id);
  };

  const handleDisconnect = async (accountId: string) => {
    await disconnectAccount(accountId);
  };

  const handleDelete = async () => {
    if (selectedAccount) {
      await deleteAccount(selectedAccount.id);
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      connected: { label: 'Connected', variant: 'default' },
      disconnected: { label: 'Disconnected', variant: 'secondary' },
      pending: { label: 'Pending', variant: 'outline' },
      error: { label: 'Error', variant: 'destructive' },
    };
    const config = configs[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
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
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('connected')}>
                Connected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('disconnected')}>
                Disconnected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add WhatsApp Account</DialogTitle>
              <DialogDescription>
                Connect a new WhatsApp Business account to your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Business Account"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={newAccountPhone}
                  onChange={(e) => setNewAccountPhone(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleAddAccount}
                disabled={!newAccountName || !newAccountPhone || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      account.status === 'connected'
                        ? 'bg-green-100 text-green-600'
                        : account.status === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription>{account.phoneNumber}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Account actions">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {account.status === 'connected' ? (
                      <DropdownMenuItem
                        onClick={() => handleDisconnect(account.id)}
                        className="text-amber-600"
                      >
                        <PowerOff className="w-4 h-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleConnect(account)}
                        className="text-green-600"
                      >
                        <Power className="w-4 h-4 mr-2" />
                        Connect
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedAccount(account);
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
                {getStatusBadge(account.status)}
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
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((account.messagesSent / account.messageLimit) * 100)}% used
                </p>
              </div>

              {/* Last Active */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last Active</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {account.lastActiveAt
                    ? new Date(account.lastActiveAt).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {account.status === 'connected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <PowerOff className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary"
                    onClick={() => handleConnect(account)}
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
                <Button variant="outline" size="sm" aria-label="Account settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAccounts.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
            <p className="text-gray-500 max-w-md mb-6">
              {searchQuery
                ? 'No accounts match your search criteria. Try adjusting your filters.'
                : 'Get started by connecting your first WhatsApp Business account.'}
            </p>
            {!searchQuery && (
              <Button className="gradient-primary" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp</DialogTitle>
            <DialogDescription>
              Scan the QR code with your WhatsApp mobile app to connect.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-64 h-64 qr-placeholder rounded-xl mb-4 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mb-4" />
                  <p className="text-sm text-gray-500">Generating QR code...</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">QR Code Placeholder</p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={() => setIsQRDialogOpen(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAccount?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAccount(null)}>Cancel</AlertDialogCancel>
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
