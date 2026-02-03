import { NextResponse } from 'next/server';
import { sendTemplateMessage } from '@/lib/whatsapp';
export async function POST(req){ const secret = req.headers.get('x-admin-secret') || ''; if(secret !== process.env.ADMIN_API_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await req.json(); const { to, template, params } = body; const r = await sendTemplateMessage(to, template, params || []); return NextResponse.json({ success: true, r }); }
