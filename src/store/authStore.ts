import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hasPermission: (module: string, action: string) => boolean;
}

const mockUsers: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    tenantId: 'tenant_1',
    email: 'admin@example.com',
    name: 'Super Admin',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    permissions: [
      { module: '*', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    ],
  },
  'tenant@example.com': {
    id: '2',
    tenantId: 'tenant_1',
    email: 'tenant@example.com',
    name: 'Tenant Admin',
    role: 'tenant_admin',
    status: 'active',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    permissions: [
      { module: '*', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    ],
  },
  'manager@example.com': {
    id: '3',
    tenantId: 'tenant_1',
    email: 'manager@example.com',
    name: 'John Manager',
    role: 'manager',
    status: 'active',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    permissions: [
      { module: 'whatsapp', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'messaging', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'chatbots', actions: ['view', 'create', 'edit'] },
      { module: 'contacts', actions: ['view', 'create', 'edit', 'manage'] },
      { module: 'analytics', actions: ['view'] },
    ],
  },
  'agent@example.com': {
    id: '4',
    tenantId: 'tenant_1',
    email: 'agent@example.com',
    name: 'Sarah Agent',
    role: 'agent',
    status: 'active',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    permissions: [
      { module: 'whatsapp', actions: ['view'] },
      { module: 'messaging', actions: ['view', 'create'] },
      { module: 'contacts', actions: ['view', 'create', 'edit'] },
      { module: 'chat', actions: ['view', 'create', 'edit'] },
    ],
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = mockUsers[email.toLowerCase()];
        
        if (mockUser && password === 'password') {
          set({
            user: { ...mockUser, lastLoginAt: new Date().toISOString() },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid email or password');
        }
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newUser: User = {
          id: Date.now().toString(),
          tenantId: 'tenant_new',
          email,
          name,
          role: 'tenant_admin',
          status: 'active',
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          permissions: [
            { module: 'whatsapp', actions: ['view', 'create', 'edit', 'manage'] },
            { module: 'messaging', actions: ['view', 'create', 'edit', 'manage'] },
            { module: 'chatbots', actions: ['view', 'create', 'edit', 'manage'] },
            { module: 'contacts', actions: ['view', 'create', 'edit', 'manage'] },
            { module: 'analytics', actions: ['view'] },
            { module: 'settings', actions: ['view', 'edit'] },
            { module: 'chat', actions: ['view', 'create', 'edit', 'manage'] },
          ],
        };
        
        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      hasPermission: (module: string, action: string) => {
        const { user } = get();
        if (!user) return false;
        
        // Super admin has all permissions
        if (user.role === 'super_admin') return true;
        
        return user.permissions.some(
          perm =>
            (perm.module === module || perm.module === '*') &&
            (perm.actions.includes(action as any) || perm.actions.includes('manage'))
        );
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
