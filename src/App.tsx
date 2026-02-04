import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Login } from '@/pages/Login';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { WhatsAppAccounts } from '@/pages/WhatsAppAccounts';
import { MetaAccounts } from '@/pages/MetaAccounts';
import { BulkMessaging } from '@/pages/BulkMessaging';
import { ChatbotBuilder } from '@/pages/ChatbotBuilder';
import { Contacts } from '@/pages/Contacts';
import { Automations } from '@/pages/Automations';
import { CRMIntegration } from '@/pages/CRMIntegration';
import { Analytics } from '@/pages/Analytics';
import { UserManagement } from '@/pages/UserManagement';
import { Subscription } from '@/pages/Subscription';
import { Settings } from '@/pages/Settings';
import AgentDashboard from '@/pages/AgentDashboard';
import RoutingRules from '@/pages/RoutingRules';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="whatsapp" element={<WhatsAppAccounts />} />
          <Route path="meta-accounts" element={<MetaAccounts />} />
          <Route path="messaging" element={<BulkMessaging />} />
          <Route path="chatbots" element={<ChatbotBuilder />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="automations" element={<Automations />} />
          <Route path="crm" element={<CRMIntegration />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route
          path="/agent-dashboard"
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/routing-rules"
          element={
            <ProtectedRoute>
              <RoutingRules />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
