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
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Award,
  ArrowUpRight
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
      <div className="min-h-screen bg-canvas flex items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-3 bg-surface p-8 rounded-2xl border border-outline-variant shadow-card">
          <div className="w-9 h-9 border-3 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-text-secondary">Authenticating Teacher Studio...</span>
        </div>
      </div>
    );
  }

  const selectedClass = assignedClasses.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col antialiased">
      {/* Top Professional Teacher Studio Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-secondary text-white flex items-center justify-center shadow-sm font-heading font-black text-lg">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary">
                MEDHA
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-accent-secondaryLight text-accent-secondary font-bold">
                Teacher Studio
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Pedagogical Analytics & Intervention Intelligence · Class 10 Physics
            </p>
          </div>
        </div>

        {/* Teacher Identity & Sign Out */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-text-primary">{currentUser?.name || 'Teacher'}</span>
            <span className="text-[11px] font-mono text-text-secondary">{currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of teacher portal"
            aria-label="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-secondary text-xs text-text-secondary hover:text-mastery-atRisk transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Class Selector & Export Bar */}
        <div className="bg-surface rounded-3xl border border-outline-variant p-6 shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Assigned Cohort:
            </span>
            <div className="flex items-center gap-2">
              {assignedClasses.map((cls) => {
                const isSelected = cls.id === selectedClassId;
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleClassChange(cls.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${isSelected
                      ? 'bg-accent-primary text-white shadow-cobalt'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-outline-variant hover:bg-outline-variant/40'
                      }`}
                  >
                    {cls.name} ({cls.grade})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Gradebook Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted mr-1 hidden sm:inline">Export:</span>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 border border-outline-variant text-xs font-mono font-medium text-text-primary transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-mastery-mastered" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 border border-outline-variant text-xs font-mono font-medium text-text-primary transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-accent-primary" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Error Banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-mastery-atRiskLight border border-mastery-atRisk/30 text-xs text-mastery-atRisk flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Analytics Data Presentation */}
        {analyticsData && (
          <div className="space-y-8">
            {/* 1. Summary Cards Matrix */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
                <span className="text-xs font-medium text-text-secondary block">Enrolled Students</span>
                <span className="font-heading font-extrabold text-3xl text-text-primary block">
                  {analyticsData.summary?.enrolledStudents ?? 0}
                </span>
                <span className="text-[11px] text-text-muted">
                  {selectedClass?.name || 'Class Cohort'}
                </span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
                <span className="text-xs font-medium text-text-secondary block">Cohort Average Mastery</span>
                <span className="font-heading font-extrabold text-3xl text-accent-primary block">
                  {analyticsData.summary?.classAverageMastery ?? 0}%
                </span>
                <span className="text-[11px] text-text-muted">Across 9 concepts</span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
                <span className="text-xs font-medium text-text-secondary block">Active Misconceptions</span>
                <span className="font-heading font-extrabold text-3xl text-accent-warm block">
                  {analyticsData.summary?.activeMisconceptionsCount ?? 0}
                </span>
                <span className="text-[11px] text-text-muted">Flagged in student reasoning</span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
                <span className="text-xs font-medium text-text-secondary block">Students Requiring Focus</span>
                <span className="font-heading font-extrabold text-3xl text-mastery-atRisk block">
                  {analyticsData.summary?.studentsNeedingAttention ?? 0}
                </span>
                <span className="text-[11px] text-text-muted">Mastery &lt; 40%</span>
              </div>
            </section>

            {/* 2. Class Concept Mastery Heatmap Matrix */}
            <section className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-xl text-text-primary tracking-tight">
                    Class Concept Mastery Matrix
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Click any student row to inspect their diagnostic reasoning and learning history.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-mastery-masteredLight border border-mastery-mastered/40"></span> ≥80%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-mastery-learningLight border border-mastery-learning/40"></span> 40–79%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-mastery-atRiskLight border border-mastery-atRisk/40"></span> &lt;40%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-surface-secondary border border-outline-variant"></span> Unassessed
                  </span>
                </div>
              </div>

              {/* Heatmap Table */}
              <div className="overflow-x-auto rounded-2xl border border-outline-variant">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-secondary text-text-secondary font-mono uppercase text-[10px] border-b border-outline-variant">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Student</th>
                      {CONCEPTS.map((c) => (
                        <th key={c.id} className="py-3 px-2 text-center font-bold" title={c.name}>
                          {c.id}
                        </th>
                      ))}
                      <th className="py-3 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {analyticsData.students?.map((s: StudentSummary) => {
                      const isSelected = selectedStudentId === s.id;
                      return (
                        <tr
                          key={s.id}
                          onClick={() => handleSelectStudent(s.id)}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-accent-primaryLight/50' : 'hover:bg-surface-secondary/50'
                            }`}
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-text-primary block">{s.name}</span>
                            <span className="text-[10px] font-mono text-text-muted block truncate max-w-[140px]">
                              {s.email}
                            </span>
                          </td>

                          {CONCEPTS.map((c) => {
                            const score = s.masteryMap[c.id];
                            const cellStyle =
                              score === null || score === undefined
                                ? 'bg-surface-secondary text-text-muted border-outline-variant'
                                : score >= 80
                                  ? 'bg-mastery-masteredLight text-mastery-mastered border-mastery-mastered/30 font-bold'
                                  : score >= 40
                                    ? 'bg-mastery-learningLight text-mastery-learning border-mastery-learning/30 font-bold'
                                    : 'bg-mastery-atRiskLight text-mastery-atRisk border-mastery-atRisk/30 font-bold';

                            return (
                              <td key={c.id} className="py-3.5 px-1.5 text-center">
                                <span
                                  className={`inline-block w-8 py-1 rounded text-[11px] font-mono border ${cellStyle}`}
                                >
                                  {score !== null && score !== undefined ? `${score}%` : '—'}
                                </span>
                              </td>
                            );
                          })}

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStudent(s.id);
                              }}
                              className="text-xs text-accent-primary font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Misconception Frequency Breakdown */}
            <section className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-4">
              <h3 className="font-heading font-bold text-xl text-text-primary tracking-tight">
                Cohort Misconception Frequency
              </h3>
              <p className="text-xs text-text-secondary">
                Curriculum misconceptions observed across students in {selectedClass?.name || 'Class 10'}.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.misconceptionFrequencies?.map((mf: any) => (
                  <div
                    key={mf.code}
                    className="p-5 rounded-2xl bg-canvas border border-outline-variant space-y-2 hover:border-accent-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                        {mf.conceptId} · {mf.code}
                      </span>
                      <span className="text-xs font-mono font-bold text-mastery-atRisk bg-mastery-atRiskLight px-2.5 py-0.5 rounded border border-mastery-atRisk/20">
                        {mf.count} Student{mf.count === 1 ? '' : 's'} Affected
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-text-primary">
                      {mf.title}
                    </h4>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {mf.description}
                    </p>

                    <div className="pt-1 text-[11px] text-mastery-mastered font-medium">
                      <strong>Intervention Truth:</strong> {mf.correction}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Student Drill-Down Inspection Modal/Drawer */}
        {selectedStudentId && studentDetail && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 max-w-2xl w-full shadow-float max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-outline-variant pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                      {studentDetail.student.id}
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {studentDetail.student.email}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
                    {studentDetail.student.name}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDetail(null);
                  }}
                  className="p-1.5 rounded-xl text-text-secondary hover:bg-surface-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Mastery Breakdown Across All 9 Concepts */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-text-muted block">
                  Concept Mastery Breakdown
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONCEPTS.map((c) => {
                    const m = studentDetail.profile.masteryMap[c.id];
                    const score = m?.score;
                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-canvas border border-outline-variant text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-text-primary">{c.id}</span>
                          <span
                            className={`font-mono text-[11px] font-bold ${score === null || score === undefined
                              ? 'text-text-muted'
                              : score >= 80
                                ? 'text-mastery-mastered'
                                : score >= 40
                                  ? 'text-mastery-learning'
                                  : 'text-mastery-atRisk'
                              }`}
                          >
                            {score !== null && score !== undefined ? `${score}%` : '—'}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate">{c.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reasoning Attempts */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-text-muted block">
                  Evaluated Reasoning Attempts ({studentDetail.profile.attempts.length})
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {studentDetail.profile.attempts
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((att, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-canvas border border-outline-variant text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-accent-primary">
                            {att.targetConceptIds.join(', ')}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${att.isCorrect
                              ? 'bg-mastery-masteredLight text-mastery-mastered'
                              : 'bg-mastery-atRiskLight text-mastery-atRisk'
                              }`}
                          >
                            {att.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="italic text-text-primary text-[11px]">
                          &ldquo;{att.writtenReasoning}&rdquo;
                        </p>
                        {att.misconceptionTitle && (
                          <p className="text-[11px] text-mastery-atRisk font-medium">
                            ⚠️ {att.misconceptionTitle}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 text-text-primary text-xs font-semibold border border-outline-variant transition-colors"
              >
                Close Student Inspector
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}