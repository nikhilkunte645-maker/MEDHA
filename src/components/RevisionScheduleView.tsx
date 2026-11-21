'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { LearnerProfile } from '@/types/mastery';
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
  Flame,
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
  const [profile, setProfile] = useState<LearnerProfile>(loadLearnerProfile);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');

  useEffect(() => {
    setProfile(loadLearnerProfile());
  }, []);

  const revisionItems = CONCEPTS.map((concept) => {
    const mastery = profile.masteryMap[concept.id];
    const isOverdue = mastery ? isReviewOverdue(mastery.nextReviewAt) : false;
    const dueRelative = mastery ? formatReviewDueRelative(mastery.nextReviewAt) : 'Unscheduled';

    return {
      concept,
      mastery,
      isOverdue,
      dueRelative,
      score: mastery?.score,
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
  const totalReviewsCompleted = revisionItems.reduce((acc, i) => acc + i.reviewCount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-primary" />
              <h2 className="font-heading font-bold text-xl lg:text-2xl text-text-primary">
                Spaced Repetition & Revision Intelligence
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Evidence-based retention intervals (1 / 3 / 7 days) calibrated to concept mastery stability.
            </p>
          </div>

          {/* Overdue alert indicator */}
          {overdueCount > 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-mastery-atRisk/15 border border-mastery-atRisk/30 text-mastery-atRisk text-xs font-mono font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>{overdueCount} Concept{overdueCount > 1 ? 's' : ''} Overdue for Revision</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-mastery-mastered/15 border border-mastery-mastered/30 text-mastery-mastered text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>All Concept Reviews Up to Date</span>
            </div>
          )}
        </div>

        {/* Algorithm Heuristics Disclaimer banner */}
        <div className="p-3.5 rounded-2xl bg-surface-deep border border-outline-variant/30 flex items-start gap-2.5 text-xs text-text-secondary">
          <Info className="w-4 h-4 text-accent-secondary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Spaced Retention Protocol:</strong> At Risk (&lt;50%) schedules at +1 day; Learning (50–79%) schedules at +3 days; Mastered (≥80%) schedules at +7 days. Completing a review does <em>not</em> mark a concept mastered without fresh demonstrated accuracy.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-elevated border border-outline-variant/20">
            <span className="text-[10px] font-mono uppercase text-text-secondary block">Total Reviews</span>
            <span className="text-lg font-bold text-text-primary">{totalReviewsCompleted}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-outline-variant/20">
            <span className="text-[10px] font-mono uppercase text-text-secondary block">Review Streak</span>
            <span className="text-lg font-bold text-text-primary flex items-center gap-1">
              <Flame className="w-4 h-4 text-mastery-learning" />
              {totalReviewsCompleted > 0 ? `${totalReviewsCompleted} reviews` : 'No streak yet'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-outline-variant/20 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase text-text-secondary block">Pending Due</span>
            <span className="text-lg font-bold text-mastery-atRisk">{overdueCount}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
          <span className="text-xs text-text-secondary font-mono mr-1">Filter Queue:</span>
          {(['all', 'overdue', 'upcoming'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === mode
                  ? 'bg-accent-primaryContainer text-white font-bold shadow-neonPrimary'
                  : 'bg-surface-elevated hover:bg-surface-higher text-text-secondary border border-outline-variant/30'
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
                  ? 'bg-mastery-atRisk/10 border-mastery-atRisk/40 hover:border-mastery-atRisk/60'
                  : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-accent-primary/15 border border-accent-primary/30 text-accent-primary">
                    {concept.code}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    {concept.name}
                  </h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                      status === 'atRisk'
                        ? 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40'
                        : status === 'learning'
                        ? 'bg-mastery-learning/20 text-mastery-learning border-mastery-learning/40'
                        : status === 'mastered'
                        ? 'bg-mastery-mastered/20 text-mastery-mastered border-mastery-mastered/40'
                        : 'bg-mastery-unassessed/20 text-mastery-unassessed border-mastery-unassessed/40'
                    }`}
                  >
                    {score !== null ? `${score}% • ` : ''}{status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-1">
                  {concept.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-text-secondary font-mono pt-1">
                  <span>Reviews completed: {reviewCount}</span>
                  <span>
                    Last assessed: {lastAssessed ? new Date(lastAssessed).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-text-secondary block">
                    Review Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isOverdue ? 'text-mastery-atRisk' : 'text-text-secondary'
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-bold ${
                        isOverdue ? 'text-mastery-atRisk' : 'text-text-primary'
                      }`}
                    >
                      {dueRelative}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onPracticeConcept(concept.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isOverdue
                      ? 'bg-mastery-atRisk text-white hover:opacity-90 shadow-neonAtRisk'
                      : 'bg-accent-primaryContainer text-white hover:opacity-90 shadow-neonPrimary'
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
