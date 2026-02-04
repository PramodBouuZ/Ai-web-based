import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import {
  LayoutDashboard,
  MessageSquare,
  Send,
  Bot,
  Users,
  Workflow,
  Plug,
  BarChart3,
  UserCog,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageCircle,
  Facebook,
  Headphones,
  Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  requiredPermission?: { module: string; action: string };
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'WhatsApp Accounts', icon: MessageSquare, path: '/whatsapp', requiredPermission: { module: 'whatsapp', action: 'view' } },
  { label: 'Meta Cloud API', icon: Facebook, path: '/meta-accounts', requiredPermission: { module: 'whatsapp', action: 'view' } },
  { label: 'Bulk Messaging', icon: Send, path: '/messaging', requiredPermission: { module: 'messaging', action: 'view' } },
  { label: 'Chatbot Builder', icon: Bot, path: '/chatbots', requiredPermission: { module: 'chatbots', action: 'view' } },
  { label: 'Contacts', icon: Users, path: '/contacts', requiredPermission: { module: 'contacts', action: 'view' } },
  { label: 'Automations', icon: Workflow, path: '/automations' },
  { label: 'CRM Integration', icon: Plug, path: '/crm' },
  { label: 'Agent Dashboard', icon: Headphones, path: '/agent-dashboard', requiredPermission: { module: 'chat', action: 'view' } },
  { label: 'Routing Rules', icon: Route, path: '/routing-rules', requiredPermission: { module: 'settings', action: 'manage' } },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', requiredPermission: { module: 'analytics', action: 'view' } },
  { label: 'User Management', icon: UserCog, path: '/users' },
  { label: 'Subscription', icon: CreditCard, path: '/subscription' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();

  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission.module, item.requiredPermission.action);
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-out flex flex-col',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">
                  WhatsApp Pro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Business Platform
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <li key={item.path}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          className={cn(
                            'flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200',
                            isActive
                              ? 'bg-[#25D366]/10 text-[#25D366]'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-[#25D366]/10 text-[#25D366] font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50',
              collapsed && 'justify-center'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500"
                onClick={logout}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-500" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
