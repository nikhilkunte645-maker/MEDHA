'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { ConceptMastery, LearnerProfile } from '@/types/mastery';
import { loadLearnerProfile } from '@/lib/storage';
import { isReviewOverdue, formatReviewDueRelative } from '@/lib/spacedRepetition';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  RotateCw
} from 'lucide-react';

interface RevisionScheduleViewProps {
  onPracticeConcept: (conceptId: string) => void;
  onViewGraph: () => void;
}

export const RevisionScheduleView: React.FC<RevisionScheduleViewProps> = ({
  onPracticeConcept,
  onViewGraph
}) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');

  useEffect(() => {
    setProfile(loadLearnerProfile());
  }, []);

  if (!profile) return null;

  // Build revision list
  const revisionItems = CONCEPTS.map((concept) => {
    const mastery = profile.masteryMap[concept.id];
    const isOverdue = mastery ? isReviewOverdue(mastery.nextReviewAt) : false;
    const dueRelative = mastery ? formatReviewDueRelative(mastery.nextReviewAt) : 'Unscheduled';

    return {
      concept,
      mastery,
      isOverdue,
      dueRelative,
      score: mastery?.score || 0,
      status: mastery?.status || 'unassessed',
      reviewCount: mastery?.reviewCount || 0,
      lastAssessed: mastery?.lastAssessed
    };
  });

  const filteredItems = revisionItems.filter((item) => {
    if (filter === 'overdue') return item.isOverdue;
    if (filter === 'upcoming') return !item.isOverdue && item.mastery?.nextReviewAt;
    return true;
  });

  const overdueCount = revisionItems.filter((i) => i.isOverdue).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-violet" />
              <h2 className="font-heading font-bold text-xl text-white">
                Spaced Revision Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evidence-based repetition intervals (1 / 2 / 4 / 7 days) calibrated to concept mastery stability.
            </p>
          </div>

          {/* Overdue alert indicator */}
          {overdueCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{overdueCount} Concept{overdueCount > 1 ? 's' : ''} Overdue for Revision</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All Concept Reviews Up-to-Date</span>
            </div>
          )}
        </div>

        {/* Algorithm Heuristics Disclaimer banner */}
        <div className="mt-4 p-3 rounded-xl bg-background border border-surface-border flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Spaced Retention Rules:</strong> Weak concepts (&lt;40%) schedule at +1 day; Developing concepts at +2 days; Proficient concepts at +4 days; Strong mastery at +7 days. A completed review does <em>not</em> mark a concept mastered without fresh demonstrated accuracy.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-border">
          <span className="text-xs text-slate-400 font-medium">Filter Reviews:</span>
          {(['all', 'overdue', 'upcoming'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === mode
                  ? 'bg-brand-violet text-white font-bold'
                  : 'bg-background hover:bg-surface-elevated text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              {mode} {mode === 'overdue' && overdueCount > 0 ? `(${overdueCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Revision Queue List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const { concept, isOverdue, dueRelative, score, status, reviewCount, lastAssessed } = item;

          return (
            <div
              key={concept.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isOverdue
                  ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/60'
                  : 'bg-surface border-surface-border hover:border-surface-hover'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-brand-violet/20 border border-brand-violet/30 text-brand-violet">
                    {concept.code}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-white">
                    {concept.name}
                  </h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                      score < 40
                        ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                        : score < 70
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {score}% • {status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {concept.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                  <span>Reviews completed: {reviewCount}</span>
                  <span>
                    Last assessed: {lastAssessed ? new Date(lastAssessed).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Due Date & Action */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-border">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Review Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isOverdue ? 'text-red-400' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-bold ${
                        isOverdue ? 'text-red-400' : 'text-slate-300'
                      }`}
                    >
                      {dueRelative}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onPracticeConcept(concept.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isOverdue
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                      : 'bg-brand-violet hover:bg-brand-violet/90 text-white shadow-brand-violet/20'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Practice Revision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
