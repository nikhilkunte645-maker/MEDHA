'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuditLogEntry, SchoolClass } from '@/types/mastery';
import {
  ShieldAlert,
  Users,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Lock,
  Layers,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  Sparkles
} from 'lucide-react';

export default function AdminPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'logs'>('users');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Medha@2026!');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher'>('student');
  const [newUserClassId, setNewUserClassId] = useState('CLASS-10A');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/login?redirect=/admin');
        return;
      }
      const data = await res.json();
      if (!data.authenticated || data.user.role !== 'admin') {
        router.push('/login?error=admin_required');
        return;
      }
      setCurrentUser(data.user);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [uRes, cRes, lRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/classes'),
        fetch('/api/admin/audit-logs?limit=50')
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUsers(u.users || []);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setClasses(c.classes || []);
      }
      if (lRes.ok) {
        const l = await lRes.json();
        setAuditLogs(l.logs || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          classId: newUserRole === 'student' ? newUserClassId : undefined,
          assignedClassIds: newUserRole === 'teacher' ? [newUserClassId] : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to create user');
        return;
      }

      setActionSuccess(`Account for ${data.user.name} (${data.user.role}) created successfully.`);
      setNewUserName('');
      setNewUserEmail('');
      fetchAdminData();
    } catch (err) {
      setActionError('Network error creating user');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-3 bg-surface p-8 rounded-2xl border border-outline-variant shadow-card">
          <div className="w-9 h-9 border-3 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-text-secondary">Authenticating Governance Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col antialiased">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center shadow-cobalt font-heading font-black text-lg">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary">
                MEDHA
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-accent-primaryLight text-accent-primary font-bold">
                Governance Console
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Role Assignments · Cohort Mappings · System Security Audit Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-text-primary">{currentUser?.name}</span>
            <span className="text-[11px] font-mono text-text-secondary">{currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-secondary text-xs text-text-secondary hover:text-mastery-atRisk transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Tabs */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-variant pb-4">
          {[
            { id: 'users', label: 'User Accounts', icon: Users },
            { id: 'classes', label: 'Class Mappings', icon: Layers },
            { id: 'logs', label: 'Security Audit Trail', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-cobalt'
                    : 'bg-surface hover:bg-surface-secondary text-text-secondary border border-outline-variant'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Notifications */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-mastery-masteredLight border border-mastery-mastered/30 text-xs text-mastery-mastered flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-2xl bg-mastery-atRiskLight border border-mastery-atRisk/30 text-xs text-mastery-atRisk flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Create New User Form (4 cols) */}
            <div className="lg:col-span-4 bg-surface rounded-3xl border border-outline-variant p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-accent-primary" />
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Provision Account
                </h3>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-text-primary block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Suman Rao"
                    required
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-text-primary block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@student.medha.edu"
                    required
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-medium text-text-primary block mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-text-primary block mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface outline-none capitalize"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-text-primary block mb-1">Class</label>
                    <select
                      value={newUserClassId}
                      onChange={(e) => setNewUserClassId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface outline-none"
                    >
                      <option value="CLASS-10A">Class 10-A</option>
                      <option value="CLASS-10B">Class 10-B</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-accent-primary text-white font-semibold text-xs shadow-cobalt hover:bg-accent-primaryHover transition-all mt-2"
                >
                  Create Authenticated User
                </button>
              </form>
            </div>

            {/* Users Roster Table (8 cols) */}
            <div className="lg:col-span-8 bg-surface rounded-3xl border border-outline-variant p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    Managed User Directory
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Real bcrypt password hashes protected. Passwords omitted in responses.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-secondary text-text-primary border border-outline-variant">
                  {users.length} Accounts
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-outline-variant">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-secondary text-text-secondary font-mono uppercase text-[10px] border-b border-outline-variant">
                    <tr>
                      <th className="py-2.5 px-4">User</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Scope / Cohort</th>
                      <th className="py-2.5 px-3 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-secondary/40">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-text-primary block">{u.name}</span>
                          <span className="text-[10px] font-mono text-text-muted">{u.email}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              u.role === 'admin'
                                ? 'bg-accent-warmLight text-accent-warm'
                                : u.role === 'teacher'
                                ? 'bg-accent-secondaryLight text-accent-secondary'
                                : 'bg-accent-primaryLight text-accent-primary'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
                          {u.classId || (u.assignedClassIds && u.assignedClassIds.join(', ')) || 'Global'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[10px] text-text-muted">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Classes */}
        {activeTab === 'classes' && (
          <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-text-primary">
                Active Cohorts & Teacher Scopes
              </h3>
              <p className="text-xs text-text-secondary">
                Enforces strict class isolation so teachers only access students in their assigned sections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl bg-canvas border border-outline-variant space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                      {cls.id}
                    </span>
                    <span className="text-xs font-mono text-text-muted">Section {cls.section}</span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg text-text-primary">
                      {cls.name}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Grade {cls.grade} · Enrolled: {cls.studentIds.length} Students
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant text-xs text-text-secondary space-y-1">
                    <span className="font-mono text-[10px] text-text-muted uppercase block">
                      Assigned Teachers:
                    </span>
                    <p className="font-medium text-text-primary">
                      {cls.teacherIds.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Logs */}
        {activeTab === 'logs' && (
          <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-text-primary">
                  Immutable Security Audit Trail
                </h3>
                <p className="text-xs text-text-secondary">
                  Captures authentications, diagnostic attempts, telemetry exports, and administrative state changes.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-secondary text-text-primary border border-outline-variant">
                {auditLogs.length} Events
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-outline-variant">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-secondary text-text-secondary font-mono uppercase text-[10px] border-b border-outline-variant">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">User & Role</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-secondary/40">
                      <td className="py-2.5 px-4 text-text-muted whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-surface-secondary text-text-primary font-bold">
                          {log.event}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-accent-primary font-semibold">
                        {log.userId} ({log.role})
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary">
                        {log.ip || '127.0.0.1'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-text-muted truncate max-w-[200px]">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}