import { create } from 'zustand';
import type { Contact } from '@/types';

interface ContactsState {
  contacts: Contact[];
  isLoading: boolean;
  fetchContacts: () => Promise<void>;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    tenantId: 'tenant_1',
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
    tenantId: 'tenant_1',
    name: 'Sarah Johnson',
    phoneNumber: '+1 (555) 987-6543',
    email: 'sarah@example.com',
    tags: ['Lead', 'Hot'],
    customFields: { company: 'Tech Corp', city: 'San Francisco' },
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    userId: '1',
  },
];

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: mockContacts,
  isLoading: false,

  fetchContacts: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  addContact: async (contact) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newContact: Contact = {
      id: Date.now().toString(),
      tenantId: contact.tenantId || 'tenant_1',
      name: contact.name || '',
      phoneNumber: contact.phoneNumber || '',
      email: contact.email,
      tags: contact.tags || [],
      customFields: contact.customFields || {},
      createdAt: new Date().toISOString(),
      userId: '1',
    };
    set((state) => ({
      contacts: [...state.contacts, newContact],
      isLoading: false,
    }));
  },

  updateContact: async (id, data) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      contacts: state.contacts.map(c =>
        c.id === id ? { ...c, ...data } : c
      ),
      isLoading: false,
    }));
  },

  deleteContact: async (id) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      contacts: state.contacts.filter(c => c.id !== id),
      isLoading: false,
    }));
  },
}));
