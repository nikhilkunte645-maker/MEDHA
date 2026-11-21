import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import {
  User,
  UserSession,
  LearnerProfile,
  SchoolClass,
  AuditLogEntry,
  ConceptMastery
} from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
import { createInitialMastery } from '@/lib/masteryEngine';

interface ServerDatabase {
  users: User[];
  sessions: UserSession[];
  learnerProfiles: Record<string, LearnerProfile>;
  classes: SchoolClass[];
  auditLogs: AuditLogEntry[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'medha_server_db.json');

// In-memory cache synced with disk
let dbCache: ServerDatabase | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function createDefaultMasteryMap(): Record<string, ConceptMastery> {
  const map: Record<string, ConceptMastery> = {};
  CONCEPTS.forEach((c) => {
    map[c.id] = createInitialMastery(c.id);
  });
  return map;
}

function initializeSeedDatabase(): ServerDatabase {
  // Shared secure test password for seed accounts
  const defaultPassword = 'Medha@2026!';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(defaultPassword, salt);
  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: 'usr_student_priya',
      email: 'priya@student.medha.edu',
      passwordHash,
      name: 'Priya Sharma',
      role: 'student',
      classId: 'CLASS-10A',
      createdAt: now
    },
    {
      id: 'usr_student_aarav',
      email: 'aarav@student.medha.edu',
      passwordHash,
      name: 'Aarav Patel',
      role: 'student',
      classId: 'CLASS-10A',
      createdAt: now
    },
    {
      id: 'usr_student_rohit',
      email: 'rohit@student.medha.edu',
      passwordHash,
      name: 'Rohit Kumar',
      role: 'student',
      classId: 'CLASS-10B',
      createdAt: now
    },
    {
      id: 'usr_teacher_sharma',
      email: 'sharma@teacher.medha.edu',
      passwordHash,
      name: 'Dr. Alok Sharma',
      role: 'teacher',
      assignedClassIds: ['CLASS-10A'],
      createdAt: now
    },
    {
      id: 'usr_teacher_verma',
      email: 'verma@teacher.medha.edu',
      passwordHash,
      name: 'Prof. Sunita Verma',
      role: 'teacher',
      assignedClassIds: ['CLASS-10B'],
      createdAt: now
    },
    {
      id: 'usr_admin_master',
      email: 'admin@medha.edu',
      passwordHash,
      name: 'MEDHA System Administrator',
      role: 'admin',
      createdAt: now
    }
  ];

  const classes: SchoolClass[] = [
    {
      id: 'CLASS-10A',
      name: 'Class 10 - Section A (Physics)',
      grade: 'Class 10',
      section: 'A',
      studentIds: ['usr_student_priya', 'usr_student_aarav'],
      teacherIds: ['usr_teacher_sharma']
    },
    {
      id: 'CLASS-10B',
      name: 'Class 10 - Section B (Physics)',
      grade: 'Class 10',
      section: 'B',
      studentIds: ['usr_student_rohit'],
      teacherIds: ['usr_teacher_verma']
    }
  ];

  const learnerProfiles: Record<string, LearnerProfile> = {
    usr_student_priya: {
      id: 'usr_student_priya',
      name: 'Priya Sharma',
      masteryMap: createDefaultMasteryMap(),
      attempts: [],
      diagnosticCompleted: false,
      createdAt: now,
      lastActive: now
    },
    usr_student_aarav: {
      id: 'usr_student_aarav',
      name: 'Aarav Patel',
      masteryMap: createDefaultMasteryMap(),
      attempts: [],
      diagnosticCompleted: false,
      createdAt: now,
      lastActive: now
    },
    usr_student_rohit: {
      id: 'usr_student_rohit',
      name: 'Rohit Kumar',
      masteryMap: createDefaultMasteryMap(),
      attempts: [],
      diagnosticCompleted: false,
      createdAt: now,
      lastActive: now
    }
  };

  // Seed sample calibrated mastery data for Priya so telemetry displays rich baseline analytics
  const priyaMastery = learnerProfiles['usr_student_priya'].masteryMap;
  priyaMastery['C01'].score = 36;
  priyaMastery['C01'].status = 'atRisk';
  priyaMastery['C01'].evidenceCount = 2;
  priyaMastery['C01'].nextReviewAt = new Date(Date.now() - 3600000).toISOString(); // overdue

  priyaMastery['C02'].score = 34;
  priyaMastery['C02'].status = 'atRisk';
  priyaMastery['C02'].evidenceCount = 2;
  priyaMastery['C02'].nextReviewAt = new Date().toISOString();

  priyaMastery['C03'].score = 72;
  priyaMastery['C03'].status = 'learning';
  priyaMastery['C03'].evidenceCount = 2;

  priyaMastery['C04'].score = 55;
  priyaMastery['C04'].status = 'learning';
  priyaMastery['C04'].evidenceCount = 2;

  priyaMastery['C05'].score = 48;
  priyaMastery['C05'].status = 'atRisk';
  priyaMastery['C05'].evidenceCount = 2;

  priyaMastery['C06'].score = 65;
  priyaMastery['C06'].status = 'learning';
  priyaMastery['C06'].evidenceCount = 2;

  priyaMastery['C07'].score = 38;
  priyaMastery['C07'].status = 'atRisk';
  priyaMastery['C07'].evidenceCount = 2;

  priyaMastery['C08'].score = 68;
  priyaMastery['C08'].status = 'learning';
  priyaMastery['C08'].evidenceCount = 2;

  priyaMastery['C09'].score = 52;
  priyaMastery['C09'].status = 'learning';
  priyaMastery['C09'].evidenceCount = 2;

  learnerProfiles['usr_student_priya'].diagnosticCompleted = true;
  learnerProfiles['usr_student_priya'].attempts.push({
    id: 'att_seed_01',
    learnerId: 'usr_student_priya',
    questionId: 'DQ02',
    selectedAnswer: 'The statement is correct; energy is lost so current decreases.',
    writtenReasoning: 'Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return.',
    isCorrect: false,
    targetConceptIds: ['C01', 'C02'],
    difficulty: 2,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reasoningQuality: 'poor',
    misconceptionDetected: true,
    misconceptionCode: 'CURRENT_VOLTAGE_CONFUSION',
    misconceptionTitle: 'Confusing current with voltage and violating charge conservation',
    misconceptionStatus: 'detected',
    evidence: ['Current is the electrical push from the battery that gets used up'],
    explanation: 'The student treats current as the push and presumes current is consumed by bulbs.',
    correctPrinciple: 'Potential difference (voltage) provides the electrical pressure; electric charge is strictly conserved.',
    recommendedConceptIds: ['C01', 'C02'],
    confidence: 0.94,
    nextLearningAction: 'Practice distinguishing charge rate (current) from energy push (potential difference).',
    isOfflineFallback: true
  });

  const auditLogs: AuditLogEntry[] = [
    {
      id: `audit_init_${Date.now()}`,
      timestamp: now,
      event: 'SYSTEM_DATABASE_INITIALIZED',
      userId: 'system',
      role: 'system',
      details: { message: 'Database initialized with verified seed accounts and assigned classes.' }
    }
  ];

  return {
    users,
    sessions: [],
    learnerProfiles,
    classes,
    auditLogs
  };
}

function readDatabase(): ServerDatabase {
  if (dbCache) return dbCache;

  ensureDataDir();

  if (!fs.existsSync(DB_FILE)) {
    const seed = initializeSeedDatabase();
    writeDatabase(seed);
    dbCache = seed;
    return seed;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ServerDatabase;
    dbCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading server database file, re-initializing seed:', err);
    const seed = initializeSeedDatabase();
    writeDatabase(seed);
    dbCache = seed;
    return seed;
  }
}

function writeDatabase(db: ServerDatabase): void {
  ensureDataDir();
  dbCache = db;
  const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (_err) {
    // Windows / OneDrive sync lock fallback
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
    } catch (fallbackErr) {
      console.error('Fatal database write error:', fallbackErr);
    }
  }
}

// ============================================================================
// EXPORTED REPOSITORY QUERIES & MUTATIONS
// ============================================================================

export function getUserById(id: string): User | null {
  const db = readDatabase();
  return db.users.find((u) => u.id === id && !u.isDeactivated) || null;
}

export function getUserByEmail(email: string): User | null {
  const db = readDatabase();
  const normalized = email.toLowerCase().trim();
  return db.users.find((u) => u.email.toLowerCase() === normalized && !u.isDeactivated) || null;
}

export function getAllUsers(): Omit<User, 'passwordHash'>[] {
  const db = readDatabase();
  return db.users.map(({ passwordHash, ...rest }) => rest);
}

export function createUser(user: User): User {
  const db = readDatabase();
  const existing = db.users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    throw new Error(`User with email "${user.email}" already exists`);
  }
  db.users.push(user);

  // If student, initialize learner profile
  if (user.role === 'student') {
    db.learnerProfiles[user.id] = {
      id: user.id,
      name: user.name,
      masteryMap: createDefaultMasteryMap(),
      attempts: [],
      diagnosticCompleted: false,
      createdAt: user.createdAt,
      lastActive: user.createdAt
    };

    if (user.classId) {
      const cls = db.classes.find((c) => c.id === user.classId);
      if (cls && !cls.studentIds.includes(user.id)) {
        cls.studentIds.push(user.id);
      }
    }
  }

  // If teacher, assign to classes
  if (user.role === 'teacher' && user.assignedClassIds) {
    user.assignedClassIds.forEach((clsId) => {
      const cls = db.classes.find((c) => c.id === clsId);
      if (cls && !cls.teacherIds.includes(user.id)) {
        cls.teacherIds.push(user.id);
      }
    });
  }

  writeDatabase(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDatabase();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...updates };
  writeDatabase(db);
  return db.users[index];
}

// Sessions
export function saveSession(session: UserSession): void {
  const db = readDatabase();
  // Remove expired sessions
  const now = new Date().toISOString();
  db.sessions = db.sessions.filter((s) => s.expiresAt > now);
  db.sessions.push(session);
  writeDatabase(db);
}

export function getSession(token: string): UserSession | null {
  const db = readDatabase();
  const now = new Date().toISOString();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (session.expiresAt <= now) {
    deleteSession(token);
    return null;
  }
  return session;
}

export function deleteSession(token: string): void {
  const db = readDatabase();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeDatabase(db);
}

export function deleteUserSessions(userId: string): void {
  const db = readDatabase();
  db.sessions = db.sessions.filter((s) => s.userId !== userId);
  writeDatabase(db);
}

// Learner Profiles
export function getLearnerProfile(userId: string): LearnerProfile {
  const db = readDatabase();
  let profile = db.learnerProfiles[userId];
  if (!profile) {
    const user = getUserById(userId);
    profile = {
      id: userId,
      name: user?.name || 'Student',
      masteryMap: createDefaultMasteryMap(),
      attempts: [],
      diagnosticCompleted: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    db.learnerProfiles[userId] = profile;
    writeDatabase(db);
  }

  // Ensure all 9 concepts exist
  CONCEPTS.forEach((c) => {
    if (!profile.masteryMap[c.id]) {
      profile.masteryMap[c.id] = createInitialMastery(c.id);
    }
  });

  return profile;
}

export function saveLearnerProfile(profile: LearnerProfile): void {
  const db = readDatabase();
  profile.lastActive = new Date().toISOString();
  db.learnerProfiles[profile.id] = profile;
  writeDatabase(db);
}

// School Classes
export function getAllClasses(): SchoolClass[] {
  const db = readDatabase();
  return db.classes;
}

export function getClassById(classId: string): SchoolClass | null {
  const db = readDatabase();
  return db.classes.find((c) => c.id === classId) || null;
}

export function getClassesForTeacher(teacherId: string): SchoolClass[] {
  const db = readDatabase();
  const teacher = db.users.find((u) => u.id === teacherId && u.role === 'teacher');
  if (!teacher || !teacher.assignedClassIds) return [];
  return db.classes.filter((c) => teacher.assignedClassIds?.includes(c.id));
}

export function assignTeacherToClass(teacherId: string, classId: string): boolean {
  const db = readDatabase();
  const teacher = db.users.find((u) => u.id === teacherId && u.role === 'teacher');
  const cls = db.classes.find((c) => c.id === classId);
  if (!teacher || !cls) return false;

  if (!teacher.assignedClassIds) teacher.assignedClassIds = [];
  if (!teacher.assignedClassIds.includes(classId)) {
    teacher.assignedClassIds.push(classId);
  }
  if (!cls.teacherIds.includes(teacherId)) {
    cls.teacherIds.push(teacherId);
  }

  writeDatabase(db);
  return true;
}

export function assignStudentToClass(studentId: string, classId: string): boolean {
  const db = readDatabase();
  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  const cls = db.classes.find((c) => c.id === classId);
  if (!student || !cls) return false;

  // Remove from old class
  if (student.classId) {
    const oldCls = db.classes.find((c) => c.id === student.classId);
    if (oldCls) {
      oldCls.studentIds = oldCls.studentIds.filter((id) => id !== studentId);
    }
  }

  student.classId = classId;
  if (!cls.studentIds.includes(studentId)) {
    cls.studentIds.push(studentId);
  }

  writeDatabase(db);
  return true;
}

// Audit Logs
export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const db = readDatabase();
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(fullEntry);
  // Keep last 1000 logs
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
  writeDatabase(db);
  return fullEntry;
}

export function getAuditLogs(limit = 100): AuditLogEntry[] {
  const db = readDatabase();
  return db.auditLogs.slice(0, limit);
}
