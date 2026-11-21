'use client';

import React from 'react';
import { CONCEPTS } from '@/data/concepts';
import { LearnerProfile, ConceptMastery } from '@/types/mastery';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Layers,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Activity,
  Target,
  Zap,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
  Clock,
  Award
} from 'lucide-react';

interface CognitiveOverviewProps {
  profile: LearnerProfile;
  onNavigate: (tab: string, conceptId?: string) => void;
  onRunDemo: () => void;
}

export const CognitiveOverview: React.FC<CognitiveOverviewProps> = ({
  profile,
  onNavigate,
  onRunDemo
}) => {
  // Mastery status items
  const masteryItems = CONCEPTS.map((c) => ({
    concept: c,
    mastery: profile.masteryMap[c.id]
  }));

  const assessedItems = masteryItems.filter(
    (i) => i.mastery && i.mastery.evidenceCount > 0 && i.mastery.score !== null
  );
  const masteredCount = masteryItems.filter((i) => i.mastery?.status === 'mastered').length;
  const learningCount = masteryItems.filter((i) => i.mastery?.status === 'learning').length;
  const atRiskCount = masteryItems.filter((i) => i.mastery?.status === 'atRisk').length;
  const unassessedCount = CONCEPTS.length - assessedItems.length;

  const totalAssessedScores = assessedItems.map((i) => i.mastery!.score as number);
  const averageMastery = assessedItems.length > 0
    ? Math.round(totalAssessedScores.reduce((a, b) => a + b, 0) / assessedItems.length)
    : null;

  // Derive dynamic lowest concept for Next Best Action
  const lowestConceptItem = assessedItems.length > 0
    ? [...assessedItems].sort((a, b) => (a.mastery!.score ?? 0) - (b.mastery!.score ?? 0))[0]
    : null;

  // Recent detected misconception for preview
  const recentMisconceptionAttempt = profile.attempts
    .slice()
    .reverse()
    .find((a) => a.misconceptionDetected);

  // Dynamic editorial headline based on state
  const getEditorialNarrative = () => {
    if (!profile.diagnosticCompleted && assessedItems.length === 0) {
      return {
        title: "Your cognitive journey begins here.",
        subtitle: "Take the 11-question diagnostic assessment to establish your conceptual baseline across Class 10 Electricity.",
        recommendation: "Establish Your Conceptual Baseline",
        targetConcept: "Diagnostic Assessment",
        rationale: "Unlocks personalized learning paths and identifies latent intuition gaps across all 9 concepts.",
        action: () => onNavigate('diagnostic'),
        buttonText: "Begin Diagnostic Assessment"
      };
    }
    if (atRiskCount > 0 && lowestConceptItem) {
      return {
        title: `Strengthening ${lowestConceptItem.concept.name}`,
        subtitle: `You have ${masteredCount} concept${masteredCount === 1 ? '' : 's'} mastered. Let's resolve the conceptual friction detected in ${lowestConceptItem.concept.name}.`,
        recommendation: `Understand ${lowestConceptItem.concept.name}`,
        targetConcept: `${lowestConceptItem.concept.id} · ${lowestConceptItem.concept.name}`,
        rationale: `Evidence indicates latent misconception risk (Score: ${lowestConceptItem.mastery?.score}%). Targeted practice will reinforce this prerequisite before advancing.`,
        action: () => onNavigate('workspace', lowestConceptItem.concept.id),
        buttonText: `Target ${lowestConceptItem.concept.id}`
      };
    }
    if (learningCount > 0 && lowestConceptItem) {
      return {
        title: "Your conceptual understanding is expanding.",
        subtitle: `You are actively developing mastery across ${learningCount} concept${learningCount === 1 ? '' : 's'}. Continued practice builds long-term retention.`,
        recommendation: `Elevate ${lowestConceptItem.concept.name} to Mastery`,
        targetConcept: `${lowestConceptItem.concept.id} · ${lowestConceptItem.concept.name}`,
        rationale: `Current mastery is at ${lowestConceptItem.mastery?.score}%. 2 more solid reasoning attempts will promote this concept to Mastered.`,
        action: () => onNavigate('workspace', lowestConceptItem.concept.id),
        buttonText: `Practice ${lowestConceptItem.concept.id}`
      };
    }
    return {
      title: "Comprehensive mastery achieved.",
      subtitle: "All assessed concepts meet high-confidence mastery thresholds. Scheduled spaced reviews will maintain peak retrieval strength.",
      recommendation: "Maintain Peak Retrieval Strength",
      targetConcept: "Spaced Revision Protocol",
      rationale: "Regular spaced repetition at 1, 3, and 7-day intervals permanently consolidates physical concepts.",
      action: () => onNavigate('revision'),
      buttonText: "Review Spaced Schedule"
    };
  };

  const narrative = getEditorialNarrative();

  return (
    <div className="space-y-8">
      {/* 1. Editorial Learning Studio Hero */}
      <section className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-10 shadow-card relative overflow-hidden">
        {/* Subtle decorative architectural grid accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primaryLight text-accent-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Class 10 Physics · Learning Intelligence</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
            {narrative.title}
          </h1>

          <p className="text-base text-text-secondary leading-relaxed font-normal">
            {narrative.subtitle}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={narrative.action}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
            >
              <span>{narrative.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('graph')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 text-text-primary text-xs font-semibold border border-outline-variant transition-colors"
            >
              <Layers className="w-4 h-4 text-accent-secondary" />
              <span>Explore Topology Graph</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Cognitive Metrics Matrix */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Mastery */}
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Average Mastery</span>
            <Award className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-heading font-extrabold text-3xl text-text-primary">
              {averageMastery !== null ? `${averageMastery}%` : '—'}
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              {assessedItems.length}/9 concepts
            </span>
          </div>
          <p className="text-[11px] text-text-secondary pt-1">
            {averageMastery !== null
              ? averageMastery >= 70 ? 'Strong conceptual baseline' : 'Developing understanding'
              : 'Take diagnostic to calculate'}
          </p>
        </div>

        {/* Metric 2: Mastered Concepts */}
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-mastery-mastered" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-heading font-extrabold text-3xl text-mastery-mastered">
              {masteredCount}
            </span>
            <span className="text-[11px] font-mono text-text-muted">of 9</span>
          </div>
          <p className="text-[11px] text-text-secondary pt-1">
            Score $\ge 80\%$ with verified evidence
          </p>
        </div>

        {/* Metric 3: In Progress (Learning) */}
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Developing</span>
            <TrendingUp className="w-4 h-4 text-mastery-learning" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-heading font-extrabold text-3xl text-mastery-learning">
              {learningCount}
            </span>
            <span className="text-[11px] font-mono text-text-muted">in flight</span>
          </div>
          <p className="text-[11px] text-text-secondary pt-1">
            Actively building mental models
          </p>
        </div>

        {/* Metric 4: Concepts Requiring Attention */}
        <div className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-card space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Requires Attention</span>
            <AlertTriangle className="w-4 h-4 text-mastery-atRisk" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-heading font-extrabold text-3xl text-mastery-atRisk">
              {atRiskCount}
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              {atRiskCount > 0 ? 'at risk' : 'clear'}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary pt-1">
            {atRiskCount > 0 ? 'Root-cause misconception detected' : 'No acute misconceptions'}
          </p>
        </div>
      </section>

      {/* 3. Next Best Action & Misconception Alert Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Best Action Card (7 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline-variant p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-accent-primary uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Recommended Next Challenge</span>
            </div>
            <span className="text-[11px] font-mono text-text-muted">Personalized Model</span>
          </div>

          <div>
            <h3 className="font-heading font-bold text-xl text-text-primary">
              {narrative.recommendation}
            </h3>
            <p className="text-xs font-mono text-accent-secondary mt-0.5">
              Target: {narrative.targetConcept}
            </p>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed bg-surface-secondary p-3.5 rounded-xl border border-outline-variant/60">
            {narrative.rationale}
          </p>

          <button
            onClick={narrative.action}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
          >
            <span>{narrative.buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Misconception Intelligence Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-2xl border border-outline-variant p-6 shadow-card flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-mastery-atRisk uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Misconception Radar</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-mastery-atRiskLight text-mastery-atRisk border border-mastery-atRisk/20 font-bold">
                {profile.attempts.filter((a) => a.misconceptionDetected).length} Active
              </span>
            </div>

            {recentMisconceptionAttempt ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-primary">
                  {recentMisconceptionAttempt.misconceptionTitle || recentMisconceptionAttempt.misconceptionCode || 'Series Current Attenuation Slip'}
                </p>
                <div className="p-3 bg-mastery-atRiskLight/60 rounded-xl border border-mastery-atRisk/20 text-xs text-text-secondary space-y-1">
                  <span className="text-[10px] font-mono text-mastery-atRisk block font-bold">
                    Captured from reasoning:
                  </span>
                  <p className="italic text-text-primary text-[11px]">
                    &ldquo;{recentMisconceptionAttempt.writtenReasoning}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-secondary rounded-xl text-center space-y-1">
                <p className="text-xs font-semibold text-text-primary">Zero Active Misconceptions</p>
                <p className="text-[11px] text-text-secondary">
                  No conceptual fallacies currently detected in your reasoning.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('misconceptions')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 text-text-primary text-xs font-semibold border border-outline-variant transition-colors"
          >
            <span>Inspect Misconception Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent-primary" />
          </button>
        </div>
      </section>

      {/* 4. Complete 9-Concept Mastery Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-heading font-bold text-xl text-text-primary tracking-tight">
              Class 10 Physics Mastery Topology
            </h2>
            <p className="text-xs text-text-secondary">
              Real-time evidence tracking across all 9 Electricity curriculum concepts.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mastery-mastered"></span> Mastered
            </span>
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 rounded-full bg-mastery-learning"></span> Developing
            </span>
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 rounded-full bg-mastery-atRisk"></span> At Risk
            </span>
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 rounded-full bg-mastery-unassessed"></span> Unassessed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONCEPTS.map((concept) => {
            const mastery = profile.masteryMap[concept.id];
            const isAssessed = mastery && mastery.evidenceCount > 0 && mastery.score !== null;
            const status = mastery?.status || 'unassessed';

            const statusColors = {
              mastered: {
                badge: 'bg-mastery-masteredLight text-mastery-mastered border-mastery-mastered/20',
                bar: 'bg-mastery-mastered',
                label: 'Mastered'
              },
              learning: {
                badge: 'bg-mastery-learningLight text-mastery-learning border-mastery-learning/20',
                bar: 'bg-mastery-learning',
                label: 'Developing'
              },
              atRisk: {
                badge: 'bg-mastery-atRiskLight text-mastery-atRisk border-mastery-atRisk/20',
                bar: 'bg-mastery-atRisk',
                label: 'At Risk'
              },
              unassessed: {
                badge: 'bg-surface-secondary text-text-muted border-outline-variant',
                bar: 'bg-mastery-unassessed',
                label: 'Unassessed'
              }
            }[status];

            return (
              <div
                key={concept.id}
                onClick={() => onNavigate('workspace', concept.id)}
                className="bg-surface p-5 rounded-2xl border border-outline-variant hover:border-accent-primary/40 hover:shadow-elevated cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                    {concept.id}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusColors.badge}`}>
                    {statusColors.label}
                  </span>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                    {concept.name}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {concept.description}
                  </p>
                </div>

                {/* Mathematical Formula Preview */}
                <div className="p-2 rounded-lg bg-surface-secondary/70 border border-outline-variant/60 flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span>Formula:</span>
                  <span className="font-bold text-text-primary">{concept.formulas.join(', ')}</span>
                </div>

                {/* Mastery Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
                    <span>Evidence Score</span>
                    <span className="font-bold text-text-primary">
                      {isAssessed ? `${mastery.score}%` : 'Not assessed'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors.bar} transition-all duration-500`}
                      style={{ width: isAssessed ? `${mastery.score}%` : '0%' }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-text-secondary border-t border-outline-variant/40">
                  <span className="font-mono">
                    {mastery?.evidenceCount || 0} attempt{(mastery?.evidenceCount || 0) === 1 ? '' : 's'}
                  </span>
                  <span className="text-accent-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Practice <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};