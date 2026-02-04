import { useState } from 'react';
import { getRoleColor, getRoleLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  UserPlus,
  Key,
  Ban,
  User,
} from 'lucide-react';
import type { User as UserType, UserRole } from '@/types';

const mockUsers: UserType[] = [
  {
    id: '1',
    tenantId: 'tenant_1',
    email: 'admin@example.com',
    name: 'Super Admin',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    permissions: [{ module: '*', actions: ['view', 'create', 'edit', 'delete', 'manage'] }],
  },
  {
    id: '2',
    tenantId: 'tenant_1',
    email: 'john@example.com',
    name: 'John Manager',
    role: 'manager',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    permissions: [
      { module: 'whatsapp', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'messaging', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'chatbots', actions: ['view', 'create', 'edit'] },
      { module: 'contacts', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'analytics', actions: ['view'] },
    ],
  },
  {
    id: '3',
    tenantId: 'tenant_1',
    email: 'sarah@example.com',
    name: 'Sarah Agent',
    role: 'agent',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    permissions: [
      { module: 'whatsapp', actions: ['view'] },
      { module: 'messaging', actions: ['view', 'create'] },
      { module: 'contacts', actions: ['view', 'create', 'edit'] },
    ],
  },
  {
    id: '4',
    tenantId: 'tenant_1',
    email: 'mike@example.com',
    name: 'Mike Viewer',
    role: 'viewer',
    status: 'inactive',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    permissions: [
      { module: 'whatsapp', actions: ['view'] },
      { module: 'analytics', actions: ['view'] },
    ],
  },
  {
    id: '5',
    tenantId: 'tenant_1',
    email: 'emma@example.com',
    name: 'Emma Admin',
    role: 'tenant_admin',
    status: 'active',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    permissions: [
      { module: 'whatsapp', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'messaging', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'chatbots', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'contacts', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'users', actions: ['view', 'create', 'edit'] },
      { module: 'analytics', actions: ['view'] },
    ],
  },
];

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['Full Access'],
  tenant_admin: ['Manage WhatsApp', 'Manage Messaging', 'Manage Chatbots', 'Manage Contacts', 'View Users', 'View Analytics'],
  manager: ['Manage WhatsApp', 'Manage Messaging', 'Edit Chatbots', 'Manage Contacts', 'View Analytics'],
  agent: ['View WhatsApp', 'Send Messages', 'Manage Contacts'],
  viewer: ['View Only'],
};

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('agent');
  const [inviteName, setInviteName] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    const newUser: UserType = {
      id: Date.now().toString(),
      email: inviteEmail,
      name: inviteName,
      role: inviteRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      permissions: [],
    };
    setUsers([...users, newUser]);
    setIsInviteDialogOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('agent');
  };

  const handleDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-3xl font-bold">{users.filter((u) => u.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-3xl font-bold">
                  {users.filter((u) => u.role === 'tenant_admin' || u.role === 'super_admin').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Agents</p>
                <p className="text-3xl font-bold">{users.filter((u) => u.role === 'agent').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <User className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your workspace.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Full Name</Label>
                <Input
                  id="invite-name"
                  placeholder="John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="john@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="tenant_admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="agent">Agent</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Role Permissions:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  {rolePermissions[inviteRole].map((perm) => (
                    <li key={perm} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleInvite}
                disabled={!inviteEmail || !inviteName}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLoginAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(user.lastLoginAt).toLocaleString()}
                      </span>
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell>
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
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                          {user.status === 'active' ? (
                            <>
                              <Ban className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedUser?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
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
