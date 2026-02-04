import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore, useDashboardStore } from '@/store';
import { Navigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarCollapsed } = useDashboardStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, { title: string; subtitle?: string }> = {
      '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your WhatsApp business' },
      '/dashboard/whatsapp': { title: 'WhatsApp Accounts', subtitle: 'Manage your connected accounts' },
      '/dashboard/meta-accounts': { title: 'Meta Accounts', subtitle: 'Manage Meta Cloud API connections' },
      '/dashboard/messaging': { title: 'Bulk Messaging', subtitle: 'Create and manage campaigns' },
      '/dashboard/chatbots': { title: 'Chatbot Builder', subtitle: 'Build AI-powered chatbots' },
      '/dashboard/contacts': { title: 'Contacts', subtitle: 'Manage your audience' },
      '/dashboard/automations': { title: 'Automations', subtitle: 'Create automated workflows' },
      '/dashboard/crm': { title: 'CRM Integration', subtitle: 'Connect with your CRM' },
      '/dashboard/analytics': { title: 'Analytics', subtitle: 'Track your performance' },
      '/dashboard/users': { title: 'User Management', subtitle: 'Manage team members' },
      '/dashboard/subscription': { title: 'Subscription', subtitle: 'Manage your plan' },
      '/dashboard/settings': { title: 'Settings', subtitle: 'Configure your account' },
      '/dashboard/agent-dashboard': { title: 'Agent Dashboard', subtitle: 'Real-time chat management' },
      '/dashboard/routing-rules': { title: 'Routing Rules', subtitle: 'Manage conversation routing' },
    };
    return titles[path] || { title: 'Dashboard' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-72"
      )}>
        <Header title={title} subtitle={subtitle} />
        <main className="p-6">
          <div className={cn(
            "animate-fade-in",
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
