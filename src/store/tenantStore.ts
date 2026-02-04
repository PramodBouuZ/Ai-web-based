import { create } from 'zustand';
import type { Tenant } from '../types';

interface TenantState {
  tenants: Tenant[];
  loading: boolean;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'status'>) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: [
    {
      id: '1',
      name: 'Acme Corp',
      slug: 'acme',
      status: 'active',
      plan: 'Enterprise',
      userCount: 12,
      whatsappAccounts: 5,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Global Tech',
      slug: 'global-tech',
      status: 'active',
      plan: 'Professional',
      userCount: 5,
      whatsappAccounts: 2,
      createdAt: '2024-02-01',
    },
    {
      id: '3',
      name: 'Startup Inc',
      slug: 'startup',
      status: 'inactive',
      plan: 'Free',
      userCount: 1,
      whatsappAccounts: 1,
      createdAt: '2024-03-10',
    },
  ],
  loading: false,
  addTenant: (tenantData) => set((state) => ({
    tenants: [
      {
        ...tenantData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        userCount: 1,
        whatsappAccounts: 0,
      } as Tenant,
      ...state.tenants,
    ],
  })),
  updateTenant: (id, updates) => set((state) => ({
    tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  deleteTenant: (id) => set((state) => ({
    tenants: state.tenants.filter((t) => t.id !== id),
  })),
}));
