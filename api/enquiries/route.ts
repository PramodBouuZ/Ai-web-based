import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
export async function POST(req){ const body = await req.json(); const { title, description, budget, posted_by } = body; const { data, error } = await supabase.from('enquiries').insert([{ title, description, budget, posted_by }]); if(error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ success: true, enquiry: data?.[0] }); }
