'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CONCEPTS } from '@/data/concepts';
import { SchoolClass, User, LearnerProfile } from '@/types/mastery';
import {
  Users,
  BarChart3,
  Flame,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Download,
  Info,
  Calendar,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
  LogOut,
  Brain,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  masteryMap: Record<string, number | null>;
  recentMisconception?: {
    code: string;
    title: string;
    conceptId: string;
    timestamp: string;
  };
  diagnosticCompleted: boolean;
  attemptCount: number;
  lastActive: string;
}

export default function TeacherPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<{ student: any; profile: LearnerProfile } | null>(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkSessionAndFetchClasses();
  }, []);

  const checkSessionAndFetchClasses = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        router.push('/login?redirect=/teacher');
        return;
      }

      const sessionData = await sessionRes.json();
      if (!sessionData.authenticated || sessionData.user.role !== 'teacher') {
        if (sessionData.user?.role === 'student') {
          router.push('/student');
          return;
        }
        if (sessionData.user?.role === 'admin') {
          router.push('/admin');
          return;
        }
        router.push('/login');
        return;
      }

      setCurrentUser(sessionData.user);

      // Fetch ONLY classes assigned to this teacher
      const classesRes = await fetch('/api/teacher/classes');
      if (classesRes.ok) {
        const data = await classesRes.json();
        setAssignedClasses(data.classes || []);
        if (data.classes && data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id);
          fetchClassAnalytics(data.classes[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching teacher classes:', err);
      router.push('/login');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchClassAnalytics = async (classId: string) => {
    setIsLoadingAnalytics(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/teacher/analytics?classId=${encodeURIComponent(classId)}`);
      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to load class analytics');
        setAnalyticsData(null);
        return;
      }
      const data = await res.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setErrorMessage('Network error fetching class telemetry.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
    setStudentDetail(null);
    fetchClassAnalytics(classId);
  };

  const handleSelectStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    try {
      const res = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        setStudentDetail(data);
      } else {
        alert('Unauthorized to inspect this student record.');
        setSelectedStudentId(null);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!selectedClassId) return;
    window.open(`/api/teacher/export?classId=${encodeURIComponent(selectedClassId)}&format=${format}`, '_blank');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  if (isLoadingClasses) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-secondaryContainer border-t-white rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-text-secondary">Authenticating Teacher Portal...</span>
        </div>
      </div>
    );
  }

  const selectedClass = assignedClasses.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-surface-deep text-text-primary flex flex-col antialiased selection:bg-accent-secondaryContainer selection:text-white">
      {/* Top Professional Teacher Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-secondaryContainer to-accent-primaryContainer flex items-center justify-center text-white shadow-neonSecondary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-wider text-text-primary">
                MEDHA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent-secondary/15 border border-accent-secondary/30 text-accent-secondary font-bold">
                Teacher Intelligence
              </span>
            </div>
            <p className="text-xs text-text-secondary font-mono">
              Role-Authorized Pedagogical Analytics & Intervention Portal
            </p>
          </div>
        </div>

        {/* Teacher Identity & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-text-primary">{currentUser?.name || 'Teacher'}</span>
            <span className="text-[10px] font-mono text-accent-secondary">{currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of teacher portal"
            aria-label="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-higher border border-outline-variant/30 text-xs font-mono text-text-secondary hover:text-mastery-atRisk transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Class Selector Bar */}
        <div className="bg-surface rounded-3xl border border-outline-variant/40 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
              Authorized Assigned Classes:
            </span>
            {assignedClasses.length > 0 ? (
              assignedClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassChange(cls.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    selectedClassId === cls.id
                      ? 'bg-accent-secondaryContainer text-white shadow-neonSecondary'
                      : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-outline-variant/30'
                  }`}
                >
                  {cls.name} ({cls.id})
                </button>
              ))
            ) : (
              <span className="text-xs text-mastery-atRisk font-mono">No assigned classes found</span>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={!selectedClassId || isLoadingAnalytics}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-higher border border-outline-variant/40 text-text-primary text-xs font-mono font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-accent-secondary" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={!selectedClassId || isLoadingAnalytics}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-higher border border-outline-variant/40 text-text-primary text-xs font-mono font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-accent-primary" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="p-4 rounded-2xl bg-mastery-atRisk/15 border border-mastery-atRisk/40 text-mastery-atRisk text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Analytics Overview Cards */}
        {analyticsData && (
          <div className="space-y-8">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-3xl bg-surface border border-outline-variant/40 space-y-2 shadow-xl">
                <span className="text-[11px] font-mono uppercase text-text-secondary block">
                  Enrolled Students in {selectedClass?.section ? `Section ${selectedClass.section}` : 'Class'}
                </span>
                <div className="text-3xl font-extrabold font-heading text-text-primary">
                  {analyticsData.studentCount} Students
                </div>
                <span className="text-xs text-accent-secondary font-mono">
                  Strictly isolated to your assigned roster
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-mastery-atRisk/40 space-y-2 shadow-xl">
                <span className="text-[11px] font-mono uppercase text-mastery-atRisk font-bold block">
                  Critical Conceptual Bottleneck
                </span>
                <div className="text-xl font-bold font-heading text-text-primary truncate">
                  C01 Electric Charge & Current
                </div>
                <span className="text-xs text-mastery-atRisk font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Highest error rate in reasoning diagnostic
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-mastery-mastered/40 space-y-2 shadow-xl">
                <span className="text-[11px] font-mono uppercase text-mastery-mastered font-bold block">
                  Recommended Intervention
                </span>
                <div className="text-sm font-semibold text-text-primary">
                  Physical 2-Ammeter Conservation Lab
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Demonstrate charge invariance before and after lamp load to dismantle current consumption fallacy.
                </p>
              </div>
            </div>

            {/* Concept Mastery Benchmark Chart */}
            <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-secondary" />
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Class Mastery Benchmark Across All 9 Concepts
                  </h3>
                </div>
                <span className="text-xs font-mono text-text-secondary">
                  Target: ≥80% (Mastered)
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {analyticsData.conceptAverages.map((item: any) => {
                  const { concept, avgScore, atRiskCount } = item;
                  const isAssessed = avgScore !== null;
                  const score = avgScore ?? 0;

                  return (
                    <div key={concept.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-text-primary font-semibold flex items-center gap-2">
                          <span className="text-accent-secondary">{concept.code}</span>
                          <span>{concept.name}</span>
                        </span>
                        <span className="font-mono text-text-secondary">
                          {isAssessed ? `${score}% average (${atRiskCount} at-risk)` : 'Unassessed'}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-surface-deep overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            !isAssessed
                              ? 'bg-mastery-unassessed'
                              : score >= 80
                              ? 'bg-mastery-mastered shadow-neonMastered'
                              : score >= 50
                              ? 'bg-mastery-learning'
                              : 'bg-mastery-atRisk shadow-neonAtRisk'
                          }`}
                          style={{ width: `${Math.max(6, score)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student × Concept Heatmap Matrix */}
            <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-primary" />
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Student × Concept Heatmap Matrix ({selectedClass?.name})
                  </h3>
                </div>
                <span className="text-xs font-mono text-text-secondary">
                  Click student row to inspect authorized learning details
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-text-secondary font-mono">
                      <th className="py-3 px-3">Student</th>
                      {CONCEPTS.map((c) => (
                        <th key={c.id} className="py-3 px-2 text-center" title={c.name}>
                          {c.code}
                        </th>
                      ))}
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {analyticsData.students.map((student: StudentSummary) => (
                      <tr
                        key={student.id}
                        onClick={() => handleSelectStudent(student.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedStudentId === student.id
                            ? 'bg-accent-secondaryContainer/20'
                            : 'hover:bg-surface-elevated'
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-text-primary flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary text-[10px] font-bold flex items-center justify-center font-mono">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block truncate max-w-[140px]">{student.name}</span>
                            <span className="block text-[10px] font-mono text-text-secondary">{student.email}</span>
                          </div>
                        </td>

                        {CONCEPTS.map((c) => {
                          const score = student.masteryMap[c.id];
                          let bg = 'bg-surface-deep text-text-secondary';
                          if (score !== null && score !== undefined) {
                            if (score >= 80) bg = 'bg-mastery-mastered/20 text-mastery-mastered border border-mastery-mastered/40';
                            else if (score >= 50) bg = 'bg-mastery-learning/20 text-mastery-learning border border-mastery-learning/40';
                            else bg = 'bg-mastery-atRisk/20 text-mastery-atRisk border border-mastery-atRisk/40';
                          }

                          return (
                            <td key={c.id} className="py-3 px-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${bg}`}>
                                {score !== null && score !== undefined ? `${score}%` : '---'}
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-right">
                          <button className="text-accent-secondary hover:text-white font-mono text-xs flex items-center gap-1 ml-auto">
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cognitive Misconception Distribution */}
            <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <ShieldAlert className="w-5 h-5 text-mastery-atRisk" />
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Identified Misconception Frequency in {selectedClass?.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analyticsData.misconceptionDistribution).map(([code, m]: [string, any]) => (
                  <div key={code} className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-accent-secondary font-bold">{m.conceptId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-mastery-atRisk/15 text-mastery-atRisk font-bold">
                        {m.count} Student{m.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-text-primary">{m.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Student Drill-Down Drawer */}
      {selectedStudentId && studentDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border-l border-outline-variant h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  {studentDetail.student.name}
                </h3>
                <p className="text-xs font-mono text-accent-secondary">
                  Class: {studentDetail.student.classId} • {studentDetail.student.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-text-secondary">
                Concept-by-Concept Verified Telemetry:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {CONCEPTS.map((c) => {
                  const m = studentDetail.profile.masteryMap[c.id];
                  const score = m?.score;
                  const status = m?.status || 'unassessed';

                  return (
                    <div key={c.id} className="p-3 rounded-xl bg-surface-deep border border-outline-variant/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-accent-primary mr-2">{c.code}</span>
                        <span className="text-text-primary">{c.name}</span>
                      </div>
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          status === 'mastered'
                            ? 'bg-mastery-mastered/20 text-mastery-mastered'
                            : status === 'learning'
                            ? 'bg-mastery-learning/20 text-mastery-learning'
                            : status === 'atRisk'
                            ? 'bg-mastery-atRisk/20 text-mastery-atRisk'
                            : 'bg-surface text-text-secondary'
                        }`}
                      >
                        {score !== null && score !== undefined ? `${score}%` : 'Unassessed'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {studentDetail.profile.attempts.length > 0 && (
                <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-text-secondary">
                    Recent Submitted Reasoning Attempts ({studentDetail.profile.attempts.length}):
                  </h4>
                  <div className="space-y-2">
                    {studentDetail.profile.attempts.slice(-3).reverse().map((att: any) => (
                      <div key={att.id} className="p-3 rounded-xl bg-surface-deep border border-outline-variant/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-accent-secondary">{att.targetConceptIds.join(', ')}</span>
                          <span className={`font-mono text-[10px] uppercase ${att.isCorrect ? 'text-mastery-mastered' : 'text-mastery-atRisk'}`}>
                            {att.isCorrect ? 'Correct Reasoning' : 'Misconception Detected'}
                          </span>
                        </div>
                        <p className="italic text-text-secondary bg-surface p-2 rounded">
                          &ldquo;{att.writtenReasoning}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
