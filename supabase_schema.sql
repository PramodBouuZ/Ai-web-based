-- Supabase Schema for WhatsApp Pro Business Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- WhatsApp Accounts Table
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'syncing', 'error')),
    instance_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    tags TEXT[],
    whatsapp_account_id UUID REFERENCES whatsapp_accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, phone_number)
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    whatsapp_account_id UUID REFERENCES whatsapp_accounts(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed')),
    schedule_time TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    sent_messages INTEGER DEFAULT 0,
    failed_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Chatbots Table
CREATE TABLE IF NOT EXISTS chatbots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    whatsapp_account_id UUID REFERENCES whatsapp_accounts(id),
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Log Table
CREATE TABLE IF NOT EXISTS message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    whatsapp_account_id UUID REFERENCES whatsapp_accounts(id),
    contact_id UUID REFERENCES contacts(id),
    campaign_id UUID REFERENCES campaigns(id),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_user ON whatsapp_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_user ON chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_campaign ON message_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_contact ON message_logs(contact_id);
