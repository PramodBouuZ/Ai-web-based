// Meta Cloud API Service for WhatsApp Business
// Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api

export interface MetaCredentials {
  accessToken: string;
  businessAccountId: string;
  phoneNumberId: string;
  appId: string;
}

export interface WABAPhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'NA';
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'DELETED';
  is_official_business_account: boolean;
}

export interface WABAMessageTemplate {
  id: string;
  name: string;
  language: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: any[];
}

export interface WABABusinessAccount {
  id: string;
  name: string;
  timezone_id: string;
  message_template_namespace: string;
}

export interface SendMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'interactive';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link?: string;
    caption?: string;
  };
  document?: {
    link?: string;
    caption?: string;
    filename?: string;
  };
}

export interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; mime_type: string; sha256: string; filename: string };
  audio?: { id: string; mime_type: string; sha256: string; voice: boolean };
  video?: { id: string; mime_type: string; sha256: string };
  location?: { latitude: string; longitude: string; name?: string; address?: string };
  contacts?: any[];
  interactive?: any;
  button?: { payload: string; text: string };
  context?: { forwarded: boolean; frequently_forwarded: boolean; from?: string; id?: string };
}

export interface WebhookEntry {
  id: string;
  changes: {
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: { profile: { name: string }; wa_id: string }[];
      messages?: WebhookMessage[];
      statuses?: any[];
      errors?: any[];
    };
    field: string;
  }[];
}

// Meta Cloud API Client
export class MetaCloudAPI {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string, version: string = 'v18.0') {
    this.accessToken = accessToken;
    this.baseUrl = `https://graph.facebook.com/${version}`;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Get Business Account Details
  async getBusinessAccount(businessAccountId: string): Promise<WABABusinessAccount> {
    return this.request(`/${businessAccountId}`);
  }

  // Get Phone Numbers
  async getPhoneNumbers(businessAccountId: string): Promise<WABAPhoneNumber[]> {
    const response = await this.request(`/${businessAccountId}/phone_numbers`);
    return response.data || [];
  }

  // Get Message Templates
  async getMessageTemplates(businessAccountId: string): Promise<WABAMessageTemplate[]> {
    const response = await this.request(`/${businessAccountId}/message_templates`);
    return response.data || [];
  }

  // Create Message Template
  async createMessageTemplate(
    businessAccountId: string,
    template: Partial<WABAMessageTemplate>
  ): Promise<WABAMessageTemplate> {
    return this.request(`/${businessAccountId}/message_templates`, {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  // Delete Message Template
  async deleteMessageTemplate(businessAccountId: string, templateName: string): Promise<void> {
    await this.request(`/${businessAccountId}/message_templates`, {
      method: 'DELETE',
      body: JSON.stringify({ name: templateName }),
    });
  }

  // Send Message
  async sendMessage(phoneNumberId: string, message: SendMessagePayload): Promise<any> {
    return this.request(`/${phoneNumberId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Send Text Message
  async sendTextMessage(phoneNumberId: string, to: string, text: string, previewUrl: boolean = false): Promise<any> {
    return this.sendMessage(phoneNumberId, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text, preview_url: previewUrl },
    });
  }

  // Send Template Message
  async sendTemplateMessage(
    phoneNumberId: string,
    to: string,
    templateName: string,
    languageCode: string = 'en',
    components?: any[]
  ): Promise<any> {
    return this.sendMessage(phoneNumberId, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  // Get Message Status
  async getMessageStatus(phoneNumberId: string, messageId: string): Promise<any> {
    return this.request(`/${phoneNumberId}/messages/${messageId}`);
  }

  // Mark Message as Read
  async markMessageAsRead(phoneNumberId: string, messageId: string): Promise<any> {
    return this.request(`/${phoneNumberId}/messages/${messageId}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'read' }),
    });
  }

  // Get Media URL
  async getMediaUrl(mediaId: string): Promise<{ url: string; mime_type: string }> {
    return this.request(`/${mediaId}`);
  }

  // Download Media
  async downloadMedia(mediaUrl: string): Promise<Blob> {
    const response = await fetch(mediaUrl, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });
    return response.blob();
  }

  // Upload Media
  async uploadMedia(phoneNumberId: string, file: File, type: 'image' | 'document' | 'audio' | 'video' | 'sticker'): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('messaging_product', 'whatsapp');

    const response = await fetch(`${this.baseUrl}/${phoneNumberId}/media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Media upload failed');
    }

    return response.json();
  }

  // Get Analytics
  async getAnalytics(
    businessAccountId: string,
    startDate: string,
    endDate: string,
    granularity: 'DAILY' | 'MONTHLY' = 'DAILY'
  ): Promise<any> {
    return this.request(`/${businessAccountId}?fields=analytics.start(${startDate}).end(${endDate}).granularity(${granularity})`);
  }

  // Get Conversation Analytics
  async getConversationAnalytics(
    businessAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.request(`/${businessAccountId}?fields=conversation_analytics.start(${startDate}).end(${endDate})`);
  }

  // Register Phone Number
  async registerPhoneNumber(phoneNumberId: string, pin?: string): Promise<any> {
    return this.request(`/${phoneNumberId}/register`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  // Deregister Phone Number
  async deregisterPhoneNumber(phoneNumberId: string): Promise<any> {
    return this.request(`/${phoneNumberId}/deregister`, {
      method: 'POST',
    });
  }

  // Request Verification Code
  async requestVerificationCode(phoneNumberId: string, method: 'SMS' | 'VOICE' = 'SMS'): Promise<any> {
    return this.request(`/${phoneNumberId}/request_code`, {
      method: 'POST',
      body: JSON.stringify({ code_method: method }),
    });
  }

  // Verify Phone Number
  async verifyPhoneNumber(phoneNumberId: string, code: string): Promise<any> {
    return this.request(`/${phoneNumberId}/verify_code`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Set Two-Step Verification
  async setTwoStepVerification(phoneNumberId: string, pin: string): Promise<any> {
    return this.request(`/${phoneNumberId}`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  // Get Business Profile
  async getBusinessProfile(phoneNumberId: string): Promise<any> {
    return this.request(`/${phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`);
  }

  // Update Business Profile
  async updateBusinessProfile(phoneNumberId: string, profile: any): Promise<any> {
    return this.request(`/${phoneNumberId}/whatsapp_business_profile`, {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }
}

// Webhook Handler
export class WebhookHandler {
  private _appSecret: string;

  constructor(appSecret: string) {
    this._appSecret = appSecret;
  }

  // Get app secret (used for signature verification)
  getAppSecret(): string {
    return this._appSecret;
  }

  // Verify webhook signature
  verifySignature(_payload: string, _signature: string): boolean {
    // In production, use crypto to verify HMAC signature
    // const crypto = require('crypto');
    // const expectedSignature = crypto.createHmac('sha256', this.appSecret).update(payload).digest('hex');
    // return signature === expectedSignature;
    return true; // Simplified for demo
  }

  // Parse webhook payload
  parsePayload(body: any): WebhookEntry[] {
    return body.entry || [];
  }

  // Extract messages from webhook
  extractMessages(entry: WebhookEntry): { message: WebhookMessage; contact: any; metadata: any }[] {
    const messages: { message: WebhookMessage; contact: any; metadata: any }[] = [];
    
    for (const change of entry.changes) {
      const value = change.value;
      if (value.messages) {
        for (const message of value.messages) {
          const contact = value.contacts?.find(c => c.wa_id === message.from);
          messages.push({ message, contact, metadata: value.metadata });
        }
      }
    }
    
    return messages;
  }

  // Extract statuses from webhook
  extractStatuses(entry: WebhookEntry): any[] {
    const statuses: any[] = [];
    
    for (const change of entry.changes) {
      const value = change.value;
      if (value.statuses) {
        statuses.push(...value.statuses);
      }
    }
    
    return statuses;
  }
}

// Multi-tenant Account Manager
export class MultiTenantManager {
  private accounts: Map<string, MetaCloudAPI> = new Map();

  // Add tenant account
  addTenant(tenantId: string, credentials: MetaCredentials): MetaCloudAPI {
    const api = new MetaCloudAPI(credentials.accessToken);
    this.accounts.set(tenantId, api);
    return api;
  }

  // Remove tenant account
  removeTenant(tenantId: string): void {
    this.accounts.delete(tenantId);
  }

  // Get tenant API client
  getTenant(tenantId: string): MetaCloudAPI | undefined {
    return this.accounts.get(tenantId);
  }

  // Check if tenant exists
  hasTenant(tenantId: string): boolean {
    return this.accounts.has(tenantId);
  }

  // Get all tenant IDs
  getAllTenants(): string[] {
    return Array.from(this.accounts.keys());
  }

  // Update tenant credentials
  updateTenant(tenantId: string, credentials: MetaCredentials): MetaCloudAPI {
    return this.addTenant(tenantId, credentials);
  }
}

// OAuth Helper for Meta
export class MetaOAuth {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor(appId: string, appSecret: string, redirectUri: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = redirectUri;
  }

  // Generate OAuth URL
  getAuthUrl(scopes: string[] = ['whatsapp_business_management', 'whatsapp_business_messaging'], state?: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(','),
      response_type: 'code',
      ...(state && { state }),
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  // Exchange code for access token
  async exchangeCodeForToken(code: string): Promise<{ access_token: string; expires_in: number }> {
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Token exchange failed');
    }

    return response.json();
  }

  // Get long-lived token
  async getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Token extension failed');
    }

    return response.json();
  }

  // Debug token
  async debugToken(accessToken: string): Promise<any> {
    const params = new URLSearchParams({
      input_token: accessToken,
      access_token: `${this.appId}|${this.appSecret}`,
    });

    const response = await fetch(`https://graph.facebook.com/debug_token?${params.toString()}`);
    return response.json();
  }
}

// Export singleton instances
export const metaOAuth = new MetaOAuth(
  import.meta.env.VITE_META_APP_ID || '',
  import.meta.env.VITE_META_APP_SECRET || '',
  import.meta.env.VITE_META_REDIRECT_URI || 'http://localhost:5173/meta-callback'
);

export const multiTenantManager = new MultiTenantManager();

export default MetaCloudAPI;
