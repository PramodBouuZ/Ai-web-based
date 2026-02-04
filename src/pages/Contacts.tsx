import { useState } from 'react';
import { cn, formatNumber, getInitials } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Users,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Upload,
  Download,
  Tag,
  MessageSquare,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import type { Contact, ContactGroup } from '@/types';

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    phoneNumber: '+1 (555) 123-4567',
    email: 'john@example.com',
    tags: ['Customer', 'VIP'],
    customFields: { company: 'Acme Inc', city: 'New York' },
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    userId: '1',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phoneNumber: '+1 (555) 987-6543',
    email: 'sarah@example.com',
    tags: ['Lead', 'Hot'],
    customFields: { company: 'Tech Corp', city: 'San Francisco' },
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    userId: '1',
  },
  {
    id: '3',
    name: 'Michael Brown',
    phoneNumber: '+1 (555) 456-7890',
    email: 'michael@example.com',
    tags: ['Customer'],
    customFields: { company: 'Global Ltd', city: 'Chicago' },
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    userId: '1',
  },
  {
    id: '4',
    name: 'Emily Davis',
    phoneNumber: '+1 (555) 234-5678',
    email: 'emily@example.com',
    tags: ['Lead', 'New'],
    customFields: { company: 'Startup Co', city: 'Austin' },
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    userId: '1',
  },
  {
    id: '5',
    name: 'David Wilson',
    phoneNumber: '+1 (555) 876-5432',
    email: 'david@example.com',
    tags: ['Customer', 'Inactive'],
    customFields: { company: 'Enterprise LLC', city: 'Boston' },
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    userId: '1',
  },
];

const mockGroups: ContactGroup[] = [
  { id: '1', name: 'All Contacts', description: 'All contacts in the system', contactCount: 45678, contacts: [], createdAt: '' },
  { id: '2', name: 'Customers', description: 'Active customers', contactCount: 23456, contacts: [], createdAt: '' },
  { id: '3', name: 'Leads', description: 'Potential customers', contactCount: 12345, contacts: [], createdAt: '' },
  { id: '4', name: 'VIP', description: 'High-value customers', contactCount: 5678, contacts: [], createdAt: '' },
];

const allTags = ['Customer', 'Lead', 'VIP', 'Hot', 'New', 'Inactive', 'Prospect'];

export function Contacts() {
  const [contacts, setContacts] = useState(mockContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // New contact form
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => contact.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleAddContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phoneNumber: newContactPhone,
      email: newContactEmail,
      tags: [],
      customFields: {},
      createdAt: new Date().toISOString(),
      userId: '1',
    };
    setContacts([...contacts, newContact]);
    setIsAddDialogOpen(false);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
  };

  const handleDelete = () => {
    if (selectedContact) {
      setContacts(contacts.filter((c) => c.id !== selectedContact.id));
      setIsDeleteDialogOpen(false);
      setSelectedContact(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Contacts</p>
                <p className="text-3xl font-bold">{formatNumber(45678)}</p>
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
                <p className="text-sm text-gray-500">New This Week</p>
                <p className="text-3xl font-bold">{formatNumber(234)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Today</p>
                <p className="text-3xl font-bold">{formatNumber(1892)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Groups</p>
                <p className="text-3xl font-bold">{mockGroups.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Tag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockGroups.map((group) => (
          <Card key={group.id} className="card-hover cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{group.name}</h4>
                <Badge variant="secondary">{formatNumber(group.contactCount)}</Badge>
              </div>
              <p className="text-sm text-gray-500">{group.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>Add a new contact to your database.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Full Name</Label>
                  <Input
                    id="contact-name"
                    placeholder="John Doe"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    placeholder="+1 (555) 000-0000"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email (optional)</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="gradient-primary"
                  onClick={handleAddContact}
                  disabled={!newContactName || !newContactPhone}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              if (selectedTags.includes(tag)) {
                setSelectedTags(selectedTags.filter((t) => t !== tag));
              } else {
                setSelectedTags([...selectedTags, tag]);
              }
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedTags.includes(tag)
                ? 'bg-[#25D366] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            )}
          >
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Last Interaction</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {contact.lastInteractionAt
                      ? new Date(contact.lastInteractionAt).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Message ${contact.name}`}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${contact.name}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedContact(contact);
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedContact?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedContact(null)}>Cancel</AlertDialogCancel>
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
