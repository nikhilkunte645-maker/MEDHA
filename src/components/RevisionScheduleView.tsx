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
  TrendingUp,
  RotateCw,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';

interface RevisionScheduleViewProps {
  profile?: LearnerProfile;
  onPracticeConcept: (conceptId: string) => void;
  onViewGraph?: () => void;
}

export const RevisionScheduleView: React.FC<RevisionScheduleViewProps> = ({
  profile: propProfile,
  onPracticeConcept,
  onViewGraph
}) => {
  const [profile, setProfile] = useState<LearnerProfile>(propProfile || loadLearnerProfile);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
    } else {
      setProfile(loadLearnerProfile());
    }
  }, [propProfile]);

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
      lastAssessed: mastery?.lastAssessed,
      nextReviewAt: mastery?.nextReviewAt
    };
  });

  const filteredItems = revisionItems.filter((item) => {
    if (filter === 'overdue') return item.isOverdue;
    if (filter === 'upcoming') return !item.isOverdue && item.mastery?.nextReviewAt;
    return true;
  });

  const overdueCount = revisionItems.filter((i) => i.isOverdue).length;
  const scheduledCount = revisionItems.filter((i) => i.mastery?.nextReviewAt).length;
  const totalReviewsCompleted = revisionItems.reduce((acc, i) => acc + i.reviewCount, 0);

  return (
    <div className="space-y-8">
      {/* Studio Header Banner */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-accent-primaryLight text-accent-primary text-xs font-mono font-bold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Evidence-Based Memory Consolidation</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Spaced Revision Planner
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
              Calibrated review intervals (1, 3, and 7 days) timed to counteract the Ebbinghaus forgetting curve based on concept mastery stability.
            </p>
          </div>

          {/* Overdue alert indicator */}
          {overdueCount > 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-mastery-atRiskLight border border-mastery-atRisk/30 text-mastery-atRisk text-xs font-mono font-bold self-start sm:self-auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{overdueCount} Concept{overdueCount > 1 ? 's' : ''} Overdue for Revision</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-mastery-masteredLight border border-mastery-mastered/30 text-mastery-mastered text-xs font-mono font-bold self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All Concept Reviews Up to Date</span>
            </div>
          )}
        </div>

        {/* Algorithm Heuristics Protocol Banner */}
        <div className="p-4 rounded-2xl bg-canvas border border-outline-variant flex items-start gap-3 text-xs text-text-secondary">
          <Info className="w-4 h-4 text-accent-secondary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-text-primary">Spaced Retention Protocol: </strong>
            Concepts requiring attention (&lt;40%) schedule at +1 day; Developing concepts (40–79%) schedule at +3 days; Mastered concepts (≥80%) schedule at +7 days. Completing a review only updates mastery when fresh reasoning evidence is demonstrated.
          </p>
        </div>
      </div>

      {/* Revision Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Active Retention Queue</span>
          <span className="font-heading font-extrabold text-3xl text-text-primary block">
            {scheduledCount}
          </span>
          <span className="text-[11px] text-text-muted">of 9 curriculum concepts</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Total Review Cycles</span>
          <span className="font-heading font-extrabold text-3xl text-accent-primary block">
            {totalReviewsCompleted}
          </span>
          <span className="text-[11px] text-text-muted">Reinforcement sessions completed</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <span className="text-xs font-medium text-text-secondary block">Pending Immediate Review</span>
          <span className={`font-heading font-extrabold text-3xl block ${overdueCount > 0 ? 'text-mastery-atRisk' : 'text-mastery-mastered'}`}>
            {overdueCount}
          </span>
          <span className="text-[11px] text-text-muted">Requires retrieval activation</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {(['all', 'overdue', 'upcoming'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === mode
                  ? 'bg-accent-primary text-white font-semibold shadow-sm'
                  : 'bg-surface hover:bg-surface-secondary text-text-secondary border border-outline-variant'
              }`}
            >
              {mode === 'all'
                ? 'All Concepts (9)'
                : mode === 'overdue'
                ? `Overdue (${overdueCount})`
                : 'Upcoming Reviews'}
            </button>
          ))}
        </div>

        {onViewGraph && (
          <button
            onClick={onViewGraph}
            className="inline-flex items-center gap-1.5 text-xs text-accent-primary hover:underline font-medium"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Prerequisite Topology</span>
          </button>
        )}
      </div>

      {/* Concept Timeline Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isAssessed = item.mastery && item.mastery.evidenceCount > 0 && item.score !== null;

          return (
            <div
              key={item.concept.id}
              className={`p-5 rounded-2xl bg-surface border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-card ${
                item.isOverdue
                  ? 'border-mastery-atRisk/40 ring-1 ring-mastery-atRisk/20'
                  : 'border-outline-variant'
              }`}
            >
              {/* Concept ID & Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                    {item.concept.id}
                  </span>
                  <h4 className="font-heading font-bold text-base text-text-primary">
                    {item.concept.name}
                  </h4>
                  {item.isOverdue && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-mastery-atRiskLight text-mastery-atRisk border border-mastery-atRisk/30">
                      Overdue
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary">
                  {item.concept.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-1">
                  <span>
                    Mastery: <strong className="text-text-primary">{isAssessed ? `${item.score}%` : 'Unassessed'}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Reviews: <strong className="text-text-primary">{item.reviewCount}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent-primary" />
                    <span>{item.dueRelative}</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onPracticeConcept(item.concept.id)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  item.isOverdue
                    ? 'bg-mastery-atRisk text-white shadow-sm hover:opacity-90'
                    : 'bg-accent-primary text-white shadow-cobalt hover:bg-accent-primaryHover'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{item.isOverdue ? 'Resolve Overdue Review' : 'Start Review'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};