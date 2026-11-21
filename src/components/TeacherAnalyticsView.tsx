'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { SAMPLE_COHORT } from '@/data/sampleCohort';
import { loadLearnerProfile, getInitialLearnerProfile } from '@/lib/storage';
import { CohortStudent, LearnerProfile } from '@/types/mastery';
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
  FileSpreadsheet,
  Award
} from 'lucide-react';

export const TeacherAnalyticsView: React.FC = () => {
  const [activeCohortMode, setActiveCohortMode] = useState<'sample' | 'live'>('sample');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [selectedStudent, setSelectedStudent] = useState<CohortStudent | null>(null);
  const [activeProfile, setActiveProfile] = useState<LearnerProfile>(getInitialLearnerProfile);

  useEffect(() => {
    setActiveProfile(loadLearnerProfile());
  }, []);

  // Cohort setup
  const cohort: CohortStudent[] = activeCohortMode === 'sample'
    ? SAMPLE_COHORT
    : [
      {
        id: activeProfile.id,
        name: `${activeProfile.name} (Live Telemetry)`,
        avatarSeed: 'active',
        masteryMap: Object.fromEntries(
          CONCEPTS.map((c) => [c.id, activeProfile.masteryMap[c.id]?.score ?? null])
        ),
        recentMisconception: activeProfile.attempts.slice().reverse().find((a) => a.misconceptionDetected)
          ? {
            code: activeProfile.attempts.slice().reverse().find((a) => a.misconceptionDetected)!.misconceptionCode || 'MISC',
            title: activeProfile.attempts.slice().reverse().find((a) => a.misconceptionDetected)!.misconceptionTitle || 'Cognitive error',
            conceptId: activeProfile.attempts.slice().reverse().find((a) => a.misconceptionDetected)!.targetConceptIds[0] || 'C01',
            timestamp: activeProfile.attempts.slice().reverse().find((a) => a.misconceptionDetected)!.timestamp
          }
          : undefined,
        lastActive: 'Just now'
      }
    ];

  // Concept average across students (9 concepts)
  const conceptAverages = CONCEPTS.map((c) => {
    const validScores = cohort
      .map((s) => s.masteryMap[c.id])
      .filter((score): score is number => typeof score === 'number');

    const avg = validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    const atRiskCount = validScores.filter((s) => s < 40).length;

    return {
      concept: c,
      avgScore: avg,
      atRiskCount,
      assessedCount: validScores.length
    };
  });

  const sortedByWeakest = [...conceptAverages].sort((a, b) => a.avgScore - b.avgScore);
  const lowestConcept = sortedByWeakest[0];

  // Misconception distribution tallies
  const misconceptionCounts: Record<string, { title: string; count: number; conceptId: string }> = {
    CURRENT_VOLTAGE_CONFUSION: {
      title: 'Confusing current with voltage & charge consumption',
      count: 0,
      conceptId: 'C01'
    },
    RESISTIVITY_DIMENSIONAL_DEPENDENCE: {
      title: 'Believing resistivity changes when wire is cut',
      count: 0,
      conceptId: 'C05'
    },
    PARALLEL_RESISTANCE_GREATER_FALLACY: {
      title: 'Believing parallel combinations increase total resistance',
      count: 0,
      conceptId: 'C07'
    },
    STRETCHED_WIRE_AREA_NEGLECT: {
      title: 'Neglecting cross-sectional area reduction when stretched',
      count: 0,
      conceptId: 'C05'
    }
  };

  cohort.forEach((s) => {
    if (s.recentMisconception && misconceptionCounts[s.recentMisconception.code]) {
      misconceptionCounts[s.recentMisconception.code].count += 1;
    }
  });

  if (activeCohortMode === 'sample') {
    misconceptionCounts.CURRENT_VOLTAGE_CONFUSION.count = 4;
    misconceptionCounts.RESISTIVITY_DIMENSIONAL_DEPENDENCE.count = 2;
    misconceptionCounts.PARALLEL_RESISTANCE_GREATER_FALLACY.count = 3;
    misconceptionCounts.STRETCHED_WIRE_AREA_NEGLECT.count = 2;
  }

  // Students needing intervention (overall mean < 40)
  const studentsNeedingAttention = cohort.filter((s) => {
    const scores = Object.values(s.masteryMap).filter((v): v is number => typeof v === 'number');
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return avg < 40;
  });

  const handleExportData = () => {
    const exportData = {
      cohort: activeCohortMode,
      generatedAt: new Date().toISOString(),
      studentCount: cohort.length,
      conceptAverages: conceptAverages.map((ca) => ({
        id: ca.concept.id,
        name: ca.concept.name,
        averageMastery: ca.avgScore,
        studentsAtRisk: ca.atRiskCount
      })),
      students: cohort.map((s) => ({
        id: s.id,
        name: s.name,
        mastery: s.masteryMap,
        recentMisconception: s.recentMisconception
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medha_class_analytics_${activeCohortMode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Studio Header & Cohort Mode Toggle */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-accent-secondaryLight text-accent-secondary text-xs font-mono font-bold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Pedagogical Analytics Studio</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Class Telemetry & Learning Gaps
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Curriculum heatmap analytics across all 9 Electricity concepts. Distinguish individual slips from systemic cohort misconceptions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Cohort Toggle */}
            <div className="flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-outline-variant">
              <button
                onClick={() => setActiveCohortMode('sample')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeCohortMode === 'sample'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Sample Cohort (6)
              </button>
              <button
                onClick={() => setActiveCohortMode('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeCohortMode === 'live'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Live Learner
              </button>
            </div>

            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 border border-outline-variant text-xs font-medium text-text-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-accent-secondary" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Enrolled Students</span>
          <span className="font-heading font-extrabold text-3xl text-text-primary block">
            {cohort.length}
          </span>
          <span className="text-[11px] text-text-muted">Active section roster</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Lowest Performing Concept</span>
          <span className="font-heading font-bold text-lg text-mastery-atRisk block truncate">
            {lowestConcept?.concept.id} · {lowestConcept?.concept.name}
          </span>
          <span className="text-[11px] text-text-muted">Avg: {lowestConcept?.avgScore}% mastery</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Active Misconceptions</span>
          <span className="font-heading font-extrabold text-3xl text-accent-warm block">
            {Object.values(misconceptionCounts).reduce((a, b) => a + b.count, 0)}
          </span>
          <span className="text-[11px] text-text-muted">Total instances flagged</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Intervention Required</span>
          <span className="font-heading font-extrabold text-3xl text-mastery-atRisk block">
            {studentsNeedingAttention.length}
          </span>
          <span className="text-[11px] text-text-muted">Students with average &lt; 40%</span>
        </div>
      </div>

      {/* Concept Heatmap Matrix Table */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-xl text-text-primary tracking-tight">
              Cohort Concept Mastery Heatmap
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Click any student row to inspect individual mastery and detected misconceptions.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-mastery-masteredLight border border-mastery-mastered/40"></span> ≥80%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-mastery-learningLight border border-mastery-learning/40"></span> 50–79%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-mastery-atRiskLight border border-mastery-atRisk/40"></span> &lt;50%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-surface-secondary border border-outline-variant"></span> Unassessed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-outline-variant">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-secondary text-text-secondary font-mono uppercase text-[10px] border-b border-outline-variant">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                {CONCEPTS.map((c) => (
                  <th key={c.id} className="py-3 px-2 text-center font-bold" title={c.name}>
                    {c.id}
                  </th>
                ))}
                <th className="py-3 px-4 text-right font-semibold">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {cohort.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-accent-primaryLight/50' : 'hover:bg-surface-secondary/40'
                      }`}
                  >
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {student.name}
                    </td>

                    {CONCEPTS.map((c) => {
                      const score = student.masteryMap[c.id];
                      const cellStyle =
                        score === null || score === undefined
                          ? 'bg-surface-secondary text-text-muted border-outline-variant'
                          : score >= 80
                            ? 'bg-mastery-masteredLight text-mastery-mastered border-mastery-mastered/30 font-bold'
                            : score >= 40
                              ? 'bg-mastery-learningLight text-mastery-learning border-mastery-learning/30 font-bold'
                              : 'bg-mastery-atRiskLight text-mastery-atRisk border-mastery-atRisk/30 font-bold';

                      return (
                        <td key={c.id} className="py-3 px-1.5 text-center">
                          <span
                            className={`inline-block w-8 py-1 rounded text-[11px] font-mono border ${cellStyle}`}
                          >
                            {score !== null && score !== undefined ? `${score}%` : '—'}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-right">
                      <span className="text-xs text-accent-primary font-semibold hover:underline inline-flex items-center gap-1">
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Drill-Down Inspection Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 max-w-xl w-full shadow-float max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-outline-variant pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                  {selectedStudent.id}
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
                  {selectedStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Concept Mastery Grid */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-text-muted block">
                Concept Mastery Scores
              </span>
              <div className="grid grid-cols-3 gap-2">
                {CONCEPTS.map((c) => {
                  const score = selectedStudent.masteryMap[c.id];
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-canvas border border-outline-variant text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-text-primary">{c.id}</span>
                        <span
                          className={`font-bold ${score === null || score === undefined
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
                      <p className="text-[10px] text-text-secondary truncate">{c.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Misconception Alert */}
            {selectedStudent.recentMisconception && (
              <div className="p-4 rounded-xl bg-mastery-atRiskLight/60 border border-mastery-atRisk/30 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-mastery-atRisk block">
                  Identified Cognitive Slip:
                </span>
                <h4 className="text-xs font-bold text-text-primary">
                  {selectedStudent.recentMisconception.title}
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Target: {selectedStudent.recentMisconception.conceptId} · {selectedStudent.recentMisconception.code}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 text-text-primary text-xs font-semibold border border-outline-variant transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};