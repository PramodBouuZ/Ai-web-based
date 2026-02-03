import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  return formatDate(date);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(prefix = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    pending: 'bg-yellow-500',
    error: 'bg-red-500',
    connected: 'bg-green-500',
    disconnected: 'bg-gray-400',
    sending: 'bg-blue-500',
    sent: 'bg-green-500',
    draft: 'bg-gray-400',
    scheduled: 'bg-purple-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    training: 'bg-yellow-500',
  };
  return colors[status] || 'bg-gray-400';
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    manager: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    agent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    manager: 'Manager',
    agent: 'Agent',
    viewer: 'Viewer',
  };
  return labels[role] || role;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function downloadFile(content: string, filename: string, type = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);
}

export function parseVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  return matches ? matches.map(m => m.slice(2, -2)) : [];
}

export function replaceVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterBy<T>(array: T[], key: keyof T, value: any): T[] {
  return array.filter(item => item[key] === value);
}

export function searchBy<T>(array: T[], keys: (keyof T)[], query: string): T[] {
  const lowerQuery = query.toLowerCase();
  return array.filter(item =>
    keys.some(key =>
      String(item[key]).toLowerCase().includes(lowerQuery)
    )
  );
}

export function paginate<T>(array: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
}

export function getPageCount(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}
