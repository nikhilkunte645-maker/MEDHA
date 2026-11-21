import { NextRequest, NextResponse } from 'next/server';
import { diagnoseStudentReasoning } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionPrompt, expectedAnswer, studentAnswer, studentReasoning, targetConceptIds } = body;

    if (!questionPrompt || !expectedAnswer || !studentAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields (questionPrompt, expectedAnswer, studentAnswer)' },
        { status: 400 }
      );
    }

    const analysis = await diagnoseStudentReasoning({
      questionPrompt,
      expectedAnswer,
      studentAnswer,
      studentReasoning: studentReasoning || '',
      targetConceptIds: Array.isArray(targetConceptIds) ? targetConceptIds : ['C01']
    });

    return NextResponse.json({ success: true, analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
