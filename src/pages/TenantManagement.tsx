import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Building2,
  Settings2,
  Users,
  BarChart3,
  ExternalLink,
  Shield,
  Palette,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import { useTenantStore } from '../store/tenantStore';

export function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isBrandingDialogOpen, setIsBrandingDialogOpen] = useState(false);
  const { updateUser } = useAuthStore();
  const { tenants, addTenant, deleteTenant } = useTenantStore();

  const [formData, setFormData] = useState({ name: '', slug: '' });

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTenant = () => {
    if (formData.name && formData.slug) {
      addTenant({
        name: formData.name,
        slug: formData.slug,
        plan: 'Free',
        userCount: 1,
        whatsappAccounts: 0,
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', slug: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-3xl font-bold">18</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold">$12,450</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tenant
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>WA Accounts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className={tenant.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{tenant.plan}</TableCell>
                  <TableCell>{tenant.userCount}</TableCell>
                  <TableCell>{tenant.whatsappAccounts}</TableCell>
                  <TableCell>{tenant.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          updateUser({ tenantId: tenant.id });
                          alert(`Logged in as tenant: ${tenant.name}`);
                        }}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Login as Tenant
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedTenant(tenant)}>
                          <Settings2 className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedTenant(tenant);
                          setIsBrandingDialogOpen(true);
                        }}>
                          <Palette className="w-4 h-4 mr-2" />
                          Branding
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedTenant(tenant)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Plan Limits
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteTenant(tenant.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Tenant
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="w-4 h-4 mr-2" />
                          Disable Tenant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>Add a new organization and set up the initial administrator.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Organization Name</Label>
                <Input
                  id="tenant-name"
                  placeholder="Acme Inc"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-slug">Slug (URL)</Label>
                <Input
                  id="tenant-slug"
                  placeholder="acme-inc"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2 text-primary">
                <Users className="w-4 h-4" />
                Initial Administrator
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Admin Name</Label>
                  <Input id="admin-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" type="email" placeholder="admin@acme.com" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2 text-primary">
                <Shield className="w-4 h-4" />
                Initial Permissions
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  'Manage WhatsApp Accounts',
                  'Create Messaging Campaigns',
                  'Build AI Chatbots',
                  'Manage Contacts',
                  'View Advanced Analytics',
                  'Manage Team Members',
                  'Configure System Settings',
                  'Handle Billing & Subscription'
                ].map((perm) => (
                  <div key={perm} className="flex items-center space-x-2">
                    <input type="checkbox" id={perm} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" defaultChecked />
                    <Label htmlFor={perm} className="text-sm font-normal cursor-pointer">{perm}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleCreateTenant}>Create Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branding Dialog */}
      <Dialog open={isBrandingDialogOpen} onOpenChange={setIsBrandingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tenant Branding: {selectedTenant?.name}</DialogTitle>
            <DialogDescription>Customize the look and feel for this tenant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-10 p-1" defaultValue="#0B5ED7" />
                <Input placeholder="#0B5ED7" defaultValue="#0B5ED7" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input placeholder="https://example.com/logo.png" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBrandingDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary">Save Branding</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
