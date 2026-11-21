import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getLearnerProfile, saveLearnerProfile } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['student']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  // Derive identity strictly from server session
  const profile = getLearnerProfile(auth.user.id);
  return NextResponse.json({ success: true, profile });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req, ['student']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await req.json();
    const existing = getLearnerProfile(auth.user.id);
    const profileData = (body.profile && typeof body.profile === 'object') ? body.profile : body;

    // Update caller's own profile only
    const updated = {
      ...existing,
      ...profileData,
      id: auth.user.id, // Immutable ID lock
      name: auth.user.name
    };

    saveLearnerProfile(updated);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
