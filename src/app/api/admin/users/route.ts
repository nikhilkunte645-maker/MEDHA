import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, hashPassword } from '@/lib/server/auth';
import { getAllUsers, createUser, addAuditLog } from '@/lib/server/db';
import { User, UserRole } from '@/types/mastery';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const users = getAllUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await req.json();
    const { name, email, password, role, classId, assignedClassIds } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validRoles: UserRole[] = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${role}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      role,
      classId: role === 'student' ? classId : undefined,
      assignedClassIds: role === 'teacher' ? (Array.isArray(assignedClassIds) ? assignedClassIds : []) : undefined,
      createdAt: new Date().toISOString()
    };

    createUser(newUser);

    addAuditLog({
      event: 'ADMIN_CREATED_USER',
      userId: auth.user.id,
      role: auth.user.role,
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      details: { createdUserId: userId, createdRole: role, createdEmail: email }
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
