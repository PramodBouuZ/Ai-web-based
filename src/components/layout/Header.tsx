import { useNavigate } from 'react-router-dom';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuthStore, useDashboardStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Search,
  Plus,
  Mail,
  CheckCheck,
  Settings,
  User,
  LogOut,
  Sparkles,
  MessageSquare,
  Send,
  Bot,
  Users,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDashboardStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const quickActions = [
    { label: 'New Campaign', icon: Send, path: '/messaging', color: 'bg-blue-500' },
    { label: 'New Chatbot', icon: Bot, path: '/chatbots', color: 'bg-purple-500' },
    { label: 'Add Contact', icon: Users, path: '/contacts', color: 'bg-green-500' },
    { label: 'New Message', icon: MessageSquare, path: '/messaging', color: 'bg-orange-500' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <Button
          variant="outline"
          className="hidden md:flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
            ⌘K
          </kbd>
        </Button>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative focus-visible:ring-2 focus-visible:ring-[#25D366]"
              aria-label="Quick actions"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', action.color)}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative focus-visible:ring-2 focus-visible:ring-[#25D366]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <DropdownMenuLabel className="m-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllNotificationsRead}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <Mail className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'flex flex-col items-start gap-1 p-3 cursor-pointer',
                      !notification.read && 'bg-gray-50 dark:bg-gray-800/50'
                    )}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          notification.type === 'success' && 'bg-green-500',
                          notification.type === 'error' && 'bg-red-500',
                          notification.type === 'warning' && 'bg-yellow-500',
                          notification.type === 'info' && 'bg-blue-500'
                        )}
                      />
                      <span className="font-medium text-sm flex-1">{notification.title}</span>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 pl-4">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 pl-4">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/subscription')} className="cursor-pointer">
              <Sparkles className="w-4 h-4 mr-2" />
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
