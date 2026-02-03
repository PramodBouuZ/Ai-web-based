import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Bell,
  Shield,
  Key,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Upload,
  Save,
  Trash2,
  AlertTriangle,
  Copy,
  RefreshCw,
} from 'lucide-react';

export function Settings() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState('');

  // Company form
  const [companyName, setCompanyName] = useState('Acme Inc');
  const [companyWebsite, setCompanyWebsite] = useState('https://acme.com');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveProfile = () => {
    updateUser({ name: profileName, email: profileEmail });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role} disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gradient-primary" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-gray-500">Select your preferred language</p>
                  </div>
                </div>
                <select className="px-3 py-2 border rounded-md">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your company details and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-2">
                    Drag and drop your logo here, or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-500">Receive product updates and offers</p>
                  </div>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password */}
              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div />
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>

              <Separator />

              {/* 2FA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>

              <Separator />

              {/* API Keys */}
              <div className="space-y-4">
                <h4 className="font-medium">API Keys</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Production API Key</p>
                      <p className="text-sm text-gray-500">Use this key for production environments</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                        wh_prod_••••••••••••
                      </code>
                      <Button variant="ghost" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-gray-500">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Please type <strong>DELETE</strong> to confirm.
              </p>
              <Input className="mt-2" placeholder="DELETE" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
