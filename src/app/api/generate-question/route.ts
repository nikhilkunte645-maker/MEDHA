import { NextRequest, NextResponse } from 'next/server';
import { generateAdaptiveQuestion } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conceptId, currentMastery, requestedDifficulty, previousMistakeCodes } = body;

    if (!conceptId) {
      return NextResponse.json(
        { error: 'Missing required field: conceptId' },
        { status: 400 }
      );
    }

    const question = await generateAdaptiveQuestion({
      conceptId: String(conceptId),
      currentMastery: typeof currentMastery === 'number' ? currentMastery : 50,
      requestedDifficulty: typeof requestedDifficulty === 'number' ? requestedDifficulty : 2,
      previousMistakeCodes: Array.isArray(previousMistakeCodes) ? previousMistakeCodes : []
    });

    return NextResponse.json({ success: true, question });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
