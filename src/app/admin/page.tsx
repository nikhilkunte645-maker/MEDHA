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
  Trash2
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
      <div className="min-h-screen bg-surface-deep flex items-center justify-center text-text-primary">
        <div className="w-10 h-10 border-4 border-accent-tertiaryContainer border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep text-text-primary flex flex-col antialiased selection:bg-accent-tertiaryContainer selection:text-white">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-tertiaryContainer to-accent-primaryContainer flex items-center justify-center text-white shadow-neonPrimary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-wider text-text-primary">
                MEDHA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent-tertiary/15 border border-accent-tertiary/30 text-accent-tertiary font-bold">
                Root Admin Command Center
              </span>
            </div>
            <p className="text-xs text-text-secondary font-mono">
              Role Assignments • Class Mapping • Audit Security Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-text-primary">{currentUser?.name}</span>
            <span className="text-[10px] font-mono text-accent-tertiary">{currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-higher border border-outline-variant/30 text-xs font-mono text-text-secondary hover:text-mastery-atRisk transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Tabs */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isActive
                    ? 'bg-accent-tertiaryContainer text-white shadow-neonPrimary'
                    : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-outline-variant/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Account Card */}
            <div className="lg:col-span-5 bg-surface rounded-3xl border border-outline-variant/40 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <UserPlus className="w-5 h-5 text-accent-primary" />
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Provision New Account
                </h3>
              </div>

              {actionSuccess && (
                <div className="p-3 rounded-xl bg-mastery-mastered/15 border border-mastery-mastered/40 text-mastery-mastered text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3 rounded-xl bg-mastery-atRisk/15 border border-mastery-atRisk/40 text-mastery-atRisk text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-mono text-text-secondary mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Meera Nambiar"
                    className="w-full px-3 py-2 rounded-xl bg-surface-deep border border-outline-variant/40 text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block font-mono text-text-secondary mb-1">Academic Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. meera@student.medha.edu"
                    className="w-full px-3 py-2 rounded-xl bg-surface-deep border border-outline-variant/40 text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block font-mono text-text-secondary mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-deep border border-outline-variant/40 text-text-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-text-secondary mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-deep border border-outline-variant/40 text-text-primary focus:outline-none focus:border-accent-primary font-mono"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-text-secondary mb-1">Class</label>
                    <select
                      value={newUserClassId}
                      onChange={(e) => setNewUserClassId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-deep border border-outline-variant/40 text-text-primary focus:outline-none focus:border-accent-primary font-mono"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-accent-primaryContainer hover:opacity-90 text-white font-bold font-mono text-xs shadow-neonPrimary transition-all mt-2"
                >
                  Create & Hash Password (Bcrypt)
                </button>
              </form>
            </div>

            {/* Existing Accounts Table */}
            <div className="lg:col-span-7 bg-surface rounded-3xl border border-outline-variant/40 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Registered Accounts ({users.length})
                </h3>
                <span className="text-xs font-mono text-text-secondary">Server Database</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-text-secondary font-mono">
                      <th className="py-2.5 px-2">Name</th>
                      <th className="py-2.5 px-2">Role</th>
                      <th className="py-2.5 px-2">Assigned Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-mono">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-elevated">
                        <td className="py-3 px-2">
                          <span className="font-semibold text-text-primary block font-sans">{u.name}</span>
                          <span className="text-[10px] text-text-secondary">{u.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-accent-tertiary/20 text-accent-tertiary'
                                : u.role === 'teacher'
                                ? 'bg-accent-secondary/20 text-accent-secondary'
                                : 'bg-accent-primary/20 text-accent-primary'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-text-secondary text-[11px]">
                          {u.classId || (u.assignedClassIds ? u.assignedClassIds.join(', ') : 'Global')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Class Assignments */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-surface rounded-3xl border border-outline-variant/40 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                    <h3 className="font-heading font-bold text-base text-text-primary">
                      {cls.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-accent-secondary/15 text-accent-secondary font-mono text-[10px] font-bold">
                      {cls.id}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-mono text-text-secondary block">
                      Assigned Teachers ({cls.teacherIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cls.teacherIds.map((tId) => {
                        const tUser = users.find((u) => u.id === tId);
                        return (
                          <span key={tId} className="px-2.5 py-1 rounded-lg bg-surface-deep border border-outline-variant/30 text-text-primary font-mono text-[11px]">
                            {tUser?.name || tId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <span className="font-mono text-text-secondary block">
                      Enrolled Students ({cls.studentIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cls.studentIds.map((sId) => {
                        const sUser = users.find((u) => u.id === sId);
                        return (
                          <span key={sId} className="px-2.5 py-1 rounded-lg bg-surface-deep border border-outline-variant/30 text-accent-primary font-mono text-[11px]">
                            {sUser?.name || sId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Trail */}
        {activeTab === 'logs' && (
          <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mastery-mastered" />
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Security Event Audit Log Trail
                </h3>
              </div>
              <span className="text-xs font-mono text-text-secondary">
                Immutable Server-Side Logs ({auditLogs.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-text-secondary">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-elevated">
                      <td className="py-2.5 px-3 text-text-secondary text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.event.includes('UNAUTHORIZED') || log.event.includes('FAILED')
                              ? 'bg-mastery-atRisk/20 text-mastery-atRisk'
                              : 'bg-mastery-mastered/20 text-mastery-mastered'
                          }`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-primary truncate max-w-[150px]">
                        {log.userId}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary">
                        {log.role}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary text-[11px]">
                        {log.ip || '127.0.0.1'}
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
