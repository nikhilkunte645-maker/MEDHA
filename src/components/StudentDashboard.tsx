'use client';

import React from 'react';
import { CONCEPTS } from '@/data/concepts';
import { LearnerProfile } from '@/types/mastery';
import {
  Brain,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { isReviewOverdue, formatReviewDueRelative } from '@/lib/spacedRepetition';

interface StudentDashboardProps {
  profile: LearnerProfile;
  onNavigate: (tab: string, conceptId?: string) => void;
  onRunDemo: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  onNavigate,
  onRunDemo
}) => {
  const scores = CONCEPTS.map((c) => profile.masteryMap[c.id]?.score || 0);
  const averageMastery = Math.round(scores.reduce((a, b) => a + b, 0) / CONCEPTS.length);

  const weakConcepts = CONCEPTS.filter((c) => (profile.masteryMap[c.id]?.score || 0) < 40 && profile.masteryMap[c.id]?.evidenceCount > 0);
  const developingConcepts = CONCEPTS.filter((c) => {
    const s = profile.masteryMap[c.id]?.score || 0;
    return s >= 40 && s < 70;
  });
  const proficientConcepts = CONCEPTS.filter((c) => (profile.masteryMap[c.id]?.score || 0) >= 70);
  const unassessedCount = CONCEPTS.filter((c) => !profile.masteryMap[c.id] || profile.masteryMap[c.id].evidenceCount === 0).length;

  // Overdue concepts
  const overdueConcepts = CONCEPTS.filter((c) => {
    const m = profile.masteryMap[c.id];
    return m ? isReviewOverdue(m.nextReviewAt) : false;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Top Welcome / Diagnostic Status Card */}
      <div className="bg-gradient-to-r from-surface to-surface-elevated rounded-2xl border border-surface-border p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-brand-violet/20 border border-brand-violet/40 text-brand-violet">
                STUDENT INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400">Class 10 Physics • Electricity</span>
            </div>

            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-white">
              Welcome back, {profile.name}
            </h2>

            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              {profile.diagnosticCompleted
                ? `Diagnostic calibrated across 8 concepts. Your mastery engine has evaluated ${profile.attempts.length} attempts.`
                : 'You have not yet completed the baseline diagnostic. Start the diagnostic to build your personalized concept knowledge graph.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!profile.diagnosticCompleted ? (
                <button
                  onClick={() => onNavigate('diagnostic')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold shadow-lg shadow-brand-violet/25 hover:opacity-90 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Baseline Diagnostic Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('workspace', weakConcepts[0]?.id || 'C01')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
                  >
                    <Target className="w-4 h-4" />
                    <span>Target Weakest Concept ({weakConcepts[0]?.code || 'C01'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('graph')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-elevated text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    <Layers className="w-4 h-4 text-brand-cyan" />
                    <span>View Concept Graph</span>
                  </button>
                </>
              )}

              <button
                onClick={onRunDemo}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border hover:border-brand-violet text-brand-cyan text-xs font-semibold transition-all"
              >
                <span>Run Hackathon Demo Walkthrough</span>
              </button>
            </div>
          </div>

          {/* Quick Circular Mastery Gauge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background/80 border border-surface-border shrink-0 text-center min-w-[180px]">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Overall Mastery
            </span>
            <div className="font-heading text-4xl font-extrabold text-white">
              {averageMastery}%
            </div>
            <span
              className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full mt-2 ${
                averageMastery < 40
                  ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                  : averageMastery < 70
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {averageMastery < 40 ? 'Needs Attention' : averageMastery < 70 ? 'Developing' : 'Proficient'}
            </span>
            <span className="text-[10px] text-slate-500 mt-2 font-mono">
              {profile.attempts.length} attempts evaluated
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Needs Attention */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold block">
            Needs Attention (&lt;40%)
          </span>
          <div className="text-2xl font-bold text-white">
            {weakConcepts.length} Concept{weakConcepts.length !== 1 ? 's' : ''}
          </div>
          <p className="text-xs text-slate-400 truncate">
            {weakConcepts.length > 0
              ? weakConcepts.map((c) => c.code).join(', ')
              : 'No critical gaps currently'}
          </p>
        </div>

        {/* Developing */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
            Developing (40-69%)
          </span>
          <div className="text-2xl font-bold text-white">
            {developingConcepts.length} Concept{developingConcepts.length !== 1 ? 's' : ''}
          </div>
          <p className="text-xs text-slate-400 truncate">
            {developingConcepts.map((c) => c.code).join(', ') || 'None'}
          </p>
        </div>

        {/* Proficient */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
            Proficient (70%+)
          </span>
          <div className="text-2xl font-bold text-white">
            {proficientConcepts.length} Concept{proficientConcepts.length !== 1 ? 's' : ''}
          </div>
          <p className="text-xs text-slate-400 truncate">
            {proficientConcepts.map((c) => c.code).join(', ') || 'None'}
          </p>
        </div>

        {/* Spaced Revision Due */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan font-bold block">
            Overdue Revisions
          </span>
          <div className="text-2xl font-bold text-white">
            {overdueConcepts.length} Due
          </div>
          <p className="text-xs text-slate-400 truncate">
            {overdueConcepts.length > 0
              ? `${overdueConcepts.map((c) => c.code).join(', ')} ready for review`
              : 'All revisions up to date'}
          </p>
        </div>
      </div>

      {/* Grid: 8 Concepts Quick Matrix & Recent Cognitive Diagnoses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Concepts Quick Matrix */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-violet" />
              <h3 className="font-heading font-bold text-base text-white">
                Concept-Level Mastery Breakdown
              </h3>
            </div>
            <button
              onClick={() => onNavigate('graph')}
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
            >
              Open Interactive Graph <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONCEPTS.map((c) => {
              const m = profile.masteryMap[c.id];
              const score = m?.score || 0;
              const isUnassessed = !m || m.evidenceCount === 0;

              return (
                <div
                  key={c.id}
                  onClick={() => onNavigate('workspace', c.id)}
                  className="p-3.5 rounded-xl bg-background border border-surface-border hover:border-brand-violet/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-brand-violet">{c.code}</span>
                    <span
                      className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                        isUnassessed
                          ? 'bg-slate-800 text-slate-400'
                          : score < 40
                          ? 'bg-red-950/60 text-red-400'
                          : score < 70
                          ? 'bg-amber-950/60 text-amber-400'
                          : 'bg-emerald-950/60 text-emerald-400'
                      }`}
                    >
                      {isUnassessed ? 'Unassessed' : `${score}%`}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">
                    {c.name}
                  </h4>

                  <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isUnassessed
                          ? 'bg-slate-700'
                          : score < 40
                          ? 'bg-red-500'
                          : score < 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${isUnassessed ? 0 : score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent AI Evaluated Attempts */}
        <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-cyan" />
              <h3 className="font-heading font-bold text-base text-white">
                Cognitive History
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Latest 5</span>
          </div>

          {profile.attempts.length > 0 ? (
            <div className="space-y-3">
              {profile.attempts
                .slice(-5)
                .reverse()
                .map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-background border border-surface-border space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-brand-violet">
                        {att.targetConceptIds.join(', ')}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded ${
                          att.isCorrect
                            ? 'bg-emerald-950/60 text-emerald-400'
                            : 'bg-red-950/60 text-red-400'
                        }`}
                      >
                        {att.isCorrect ? 'Correct' : 'Misconception'}
                      </span>
                    </div>

                    <p className="text-slate-300 line-clamp-1 font-medium">
                      {att.misconceptionTitle || (att.isCorrect ? 'Sound scientific reasoning' : 'Incorrect attempt')}
                    </p>

                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      &ldquo;{att.writtenReasoning}&rdquo;
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No attempts evaluated yet. Complete the diagnostic test to start your history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
