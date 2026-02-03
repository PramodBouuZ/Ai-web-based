import { NextResponse } from 'next/server';
import { bantAI } from '@/lib/ai';
export async function POST(req){ const body = await req.json(); const q = body.question || ''; const answer = await bantAI(q); return NextResponse.json({ answer }); }
