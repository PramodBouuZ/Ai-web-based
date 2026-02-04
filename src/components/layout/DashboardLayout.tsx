import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/store';
import { Navigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0B5ED7] border-t-transparent rounded-full animate-spin" />
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
      '/': { title: 'Dashboard', subtitle: 'Overview of your WhatsApp business' },
      '/whatsapp': { title: 'WhatsApp Accounts', subtitle: 'Manage your connected accounts' },
      '/meta-accounts': { title: 'Meta Accounts', subtitle: 'Manage Meta Cloud API connections' },
      '/messaging': { title: 'Bulk Messaging', subtitle: 'Create and manage campaigns' },
      '/chatbots': { title: 'Chatbot Builder', subtitle: 'Build AI-powered chatbots' },
      '/contacts': { title: 'Contacts', subtitle: 'Manage your audience' },
      '/automations': { title: 'Automations', subtitle: 'Create automated workflows' },
      '/crm': { title: 'CRM Integration', subtitle: 'Connect with your CRM' },
      '/analytics': { title: 'Analytics', subtitle: 'Track your performance' },
      '/users': { title: 'User Management', subtitle: 'Manage team members' },
      '/subscription': { title: 'Subscription', subtitle: 'Manage your plan' },
      '/settings': { title: 'Settings', subtitle: 'Configure your account' },
      '/tenants': { title: 'Tenant Management', subtitle: 'Manage multi-tenant accounts' },
      '/agent-dashboard': { title: 'Agent Dashboard', subtitle: 'Real-time chat management' },
      '/routing-rules': { title: 'Routing Rules', subtitle: 'Manage conversation routing' },
    };
    return titles[path] || { title: 'Dashboard' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-72 transition-all duration-300">
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
