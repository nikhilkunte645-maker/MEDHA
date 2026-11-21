import { NextResponse } from 'next/server';
import { hasGeminiApiKey } from '@/lib/gemini';

export async function GET() {
  const hasKey = hasGeminiApiKey();
  return NextResponse.json({
    status: 'ok',
    hasApiKey: hasKey,
    mode: hasKey ? 'online_gemini' : 'offline_demonstration',
    model: hasKey ? 'gemini-2.5-flash' : 'deterministic_curated_heuristic',
    timestamp: new Date().toISOString()
  });
}
