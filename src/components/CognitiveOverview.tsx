'use client';

import React from 'react';
import { CONCEPTS } from '@/data/concepts';
import { LearnerProfile, ConceptMastery } from '@/types/mastery';
import {
  Brain,
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
  Cpu,
  Info
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
  // Mastery status counts
  const masteryItems = CONCEPTS.map((c) => ({
    concept: c,
    mastery: profile.masteryMap[c.id]
  }));

  const assessedItems = masteryItems.filter((i) => i.mastery && i.mastery.evidenceCount > 0 && i.mastery.score !== null);
  const masteredCount = masteryItems.filter((i) => i.mastery?.status === 'mastered').length;
  const learningCount = masteryItems.filter((i) => i.mastery?.status === 'learning').length;
  const atRiskCount = masteryItems.filter((i) => i.mastery?.status === 'atRisk').length;
  const unassessedCount = CONCEPTS.length - assessedItems.length;

  const totalAssessedScores = assessedItems.map((i) => i.mastery!.score as number);
  const averageMastery = assessedItems.length > 0
    ? Math.round(totalAssessedScores.reduce((a, b) => a + b, 0) / assessedItems.length)
    : null;

  const lowestConceptItem = assessedItems.length > 0
    ? [...assessedItems].sort((a, b) => (a.mastery!.score ?? 0) - (b.mastery!.score ?? 0))[0]
    : null;
  const nextReviewConceptName = lowestConceptItem
    ? `${lowestConceptItem.concept.id} ${lowestConceptItem.concept.name}`
    : 'Take Diagnostic to Target Review';

  // Recent detected misconception for preview
  const recentMisconceptionAttempt = profile.attempts
    .slice()
    .reverse()
    .find((a) => a.misconceptionDetected);

  return (
    <div className="space-y-12 py-2">
      {/* 1. High-Impact Hero Experience */}
      <section className="relative rounded-3xl bg-gradient-to-br from-surface to-surface-elevated border border-outline-variant/40 p-6 sm:p-8 lg:p-12 overflow-hidden shadow-2xl">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-accent-primaryContainer/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-accent-secondaryContainer/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-higher border border-accent-primary/40 text-accent-primary text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
              <span>Adaptive AI Learning Intelligence Platform</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
                Meet Medha.{' '}
                <span className="block mt-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
                  The tutor that knows what you don&apos;t.
                </span>
              </h1>
              <p className="font-mono text-sm sm:text-base text-accent-secondary font-medium tracking-wide">
                Know what you know. Fix what you don&apos;t.
              </p>
            </div>

            <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
              Unlike generic AI tutors that blindly output answers, MEDHA maps what you actually understand across all 9 Electricity concepts, detects root-cause misconceptions from your reasoning, and guides you to verified mastery.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {!profile.diagnosticCompleted ? (
                <button
                  onClick={() => onNavigate('diagnostic')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white font-bold text-sm shadow-neonPrimary hover:opacity-95 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Diagnostic Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('workspace')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white font-bold text-sm shadow-neonPrimary hover:opacity-95 transition-all transform hover:-translate-y-0.5"
                >
                  <Target className="w-4 h-4" />
                  <span>Resume Targeted Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onNavigate('graph')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-higher hover:bg-surface-highest text-text-primary border border-outline-variant/60 font-semibold text-sm transition-all"
              >
                <Layers className="w-4 h-4 text-accent-primary" />
                <span>Explore Concept Graph</span>
              </button>

              <button
                onClick={onRunDemo}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-deep text-accent-secondary border border-accent-secondary/30 text-xs font-mono font-bold hover:bg-surface-elevated transition-colors"
              >
                <span>Run 60s Demo Scenario</span>
              </button>
            </div>
          </div>

          {/* Right: Cognitive Node Network Interactive Visualization */}
          <div className="lg:col-span-5 bg-surface-deep/90 border border-outline-variant/40 rounded-2xl p-5 shadow-glass space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent-primary" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                  Cognitive Node Topology Preview
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-secondary">
                {assessedItems.length} of 9 Assessed
              </span>
            </div>

            {/* Interactive Topology Mini Canvas */}
            <div className="relative w-full aspect-[4/3] bg-surface/50 rounded-xl border border-outline-variant/20 p-2 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 340 220" className="w-full h-full select-none">
                <defs>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a078ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00cbe6" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Connecting Edges */}
                <line x1="50" y1="50" x2="130" y2="85" stroke="url(#edgeGrad)" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1="50" y1="150" x2="130" y2="85" stroke="url(#edgeGrad)" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1="130" y1="85" x2="210" y2="85" stroke="url(#edgeGrad)" strokeWidth="1.5" />
                <line x1="210" y1="85" x2="280" y2="50" stroke="url(#edgeGrad)" strokeWidth="1.5" />
                <line x1="210" y1="85" x2="280" y2="150" stroke="url(#edgeGrad)" strokeWidth="1.5" />

                {/* 9 Nodes Preview */}
                {[
                  { id: 'C01', x: 50, y: 50, code: 'C01' },
                  { id: 'C02', x: 50, y: 150, code: 'C02' },
                  { id: 'C03', x: 130, y: 85, code: 'C03' },
                  { id: 'C04', x: 210, y: 85, code: 'C04' },
                  { id: 'C05', x: 280, y: 50, code: 'C05' },
                  { id: 'C06', x: 280, y: 150, code: 'C06' },
                  { id: 'C07', x: 170, y: 165, code: 'C07' },
                  { id: 'C08', x: 210, y: 185, code: 'C08' },
                  { id: 'C09', x: 280, y: 185, code: 'C09' }
                ].map((node) => {
                  const m = profile.masteryMap[node.id];
                  let stroke = '#565E71';
                  let fill = '#1b1b20';
                  if (m && m.evidenceCount > 0 && m.score !== null) {
                    if (m.status === 'mastered') { stroke = '#38D99A'; fill = 'rgba(56, 217, 154, 0.15)'; }
                    else if (m.status === 'learning') { stroke = '#F3B94F'; fill = 'rgba(243, 185, 79, 0.15)'; }
                    else if (m.status === 'atRisk') { stroke = '#FF657A'; fill = 'rgba(255, 101, 122, 0.2)'; }
                  }

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onNavigate('graph')}
                    >
                      <circle cx={node.x} cy={node.y} r="16" fill={fill} stroke={stroke} strokeWidth="2" />
                      <text
                        x={node.x}
                        y={node.y}
                        dy="4"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-white pointer-events-none"
                      >
                        {node.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-text-secondary pt-1">
              <span>Class 10 Physics • Electricity</span>
              <button
                onClick={() => onNavigate('graph')}
                className="text-accent-secondary hover:underline flex items-center gap-1"
              >
                Open Full Graph <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mastery Health Summary Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mastered */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mastery-mastered/10 border border-mastery-mastered/30 text-mastery-mastered flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-text-secondary block">
              Mastered (≥80%)
            </span>
            <span className="text-xl font-heading font-bold text-text-primary">
              {masteredCount} Concept{masteredCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Learning */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mastery-learning/10 border border-mastery-learning/30 text-mastery-learning flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-text-secondary block">
              Learning (50–79%)
            </span>
            <span className="text-xl font-heading font-bold text-text-primary">
              {learningCount} Concept{learningCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* At Risk */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mastery-atRisk/10 border border-mastery-atRisk/30 text-mastery-atRisk flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-text-secondary block">
              At Risk (&lt;50%)
            </span>
            <span className="text-xl font-heading font-bold text-text-primary">
              {atRiskCount} Concept{atRiskCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Unassessed */}
        <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mastery-unassessed/20 border border-mastery-unassessed text-mastery-unassessed flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-text-secondary block">
              Unassessed
            </span>
            <span className="text-xl font-heading font-bold text-text-primary">
              {unassessedCount} Concept{unassessedCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Three Product Capability Cards: Diagnose, Understand, Master */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-accent-primary uppercase tracking-wider">
              CORE CAPABILITIES
            </span>
            <h2 className="font-heading text-xl lg:text-2xl font-bold text-text-primary mt-0.5">
              The Three Pillars of Learning Intelligence
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Diagnose */}
          <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 hover:border-accent-primary/40 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-accent-primaryContainer/15 border border-accent-primaryContainer/30 flex items-center justify-center text-accent-primary">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-primary transition-colors">
              1. Diagnose Conceptual State
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Assesses specific prerequisite relationships rather than raw percentage marks. Measures baseline understanding across all 9 Electricity concepts.
            </p>
            <button
              onClick={() => onNavigate('diagnostic')}
              className="text-xs font-mono text-accent-primary flex items-center gap-1 font-semibold pt-2"
            >
              Take Baseline Diagnostic <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Understand */}
          <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 hover:border-accent-secondary/40 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-accent-secondaryContainer/15 border border-accent-secondaryContainer/30 flex items-center justify-center text-accent-secondary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-secondary transition-colors">
              2. Understand Hidden Misconceptions
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Analyzes your written reasoning step-by-step. Detects whether errors stem from conceptual misunderstanding, formula slips, or calculation errors.
            </p>
            <button
              onClick={() => onNavigate('misconceptions')}
              className="text-xs font-mono text-accent-secondary flex items-center gap-1 font-semibold pt-2"
            >
              View Misconception Insights <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Master */}
          <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 hover:border-accent-tertiary/40 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-accent-tertiaryContainer/15 border border-accent-tertiaryContainer/30 flex items-center justify-center text-accent-tertiary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-tertiary transition-colors">
              3. Master Through Adaptive Practice
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Synthesizes targeted questions for your weakest concepts and schedules spaced repetition (1/3/7 days) to lock in long-term retention.
            </p>
            <button
              onClick={() => onNavigate('workspace')}
              className="text-xs font-mono text-accent-tertiary flex items-center gap-1 font-semibold pt-2"
            >
              Start Adaptive Practice <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Root-Cause Diagnosis Preview & Before/After Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Root-Cause Diagnosis Preview */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent-secondary" />
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Root-Cause Diagnosis Telemetry
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-accent-primary">
              AI Diagnostic Engine
            </span>
          </div>

          {recentMisconceptionAttempt ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-mastery-atRisk/15 border border-mastery-atRisk/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-mastery-atRisk">
                    ⚠️ {recentMisconceptionAttempt.misconceptionTitle || 'Cognitive Misconception'}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-deep text-mastery-atRisk">
                    {recentMisconceptionAttempt.misconceptionStatus || 'detected'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  {recentMisconceptionAttempt.explanation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated border border-outline-variant/30 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-text-secondary block">
                  Extracted Student Evidence:
                </span>
                <p className="italic text-text-primary">
                  &ldquo;{recentMisconceptionAttempt.writtenReasoning}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-text-secondary">
                  Target Concepts: {recentMisconceptionAttempt.targetConceptIds.join(', ')}
                </span>
                <button
                  onClick={() => onNavigate('workspace', recentMisconceptionAttempt.targetConceptIds[0])}
                  className="px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 text-xs font-semibold"
                >
                  Remediate in Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-2 bg-surface-deep/40 rounded-xl border border-outline-variant/20">
              <ShieldAlert className="w-8 h-8 text-text-secondary mx-auto opacity-40" />
              <p className="text-xs text-text-secondary">
                No recent misconceptions recorded. Take the diagnostic or practice in the learning workspace to evaluate your conceptual reasoning.
              </p>
              <button
                onClick={() => onNavigate('diagnostic')}
                className="mt-2 px-4 py-2 rounded-xl bg-accent-primary/20 text-accent-primary text-xs font-semibold hover:bg-accent-primary/30"
              >
                Start Diagnostic Test
              </button>
            </div>
          )}
        </div>

        {/* Before-and-After Conceptual Mastery Comparison */}
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-mastery-mastered" />
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Mastery Progression Telemetry
              </h3>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              Evidence-Based
            </span>
          </div>

          {profile.diagnosticCompleted && profile.attempts.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-elevated border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-text-secondary block">
                    Diagnostic Baseline
                  </span>
                  <div className="text-2xl font-bold font-heading text-text-primary">
                    {totalAssessedScores.length > 0 ? `${Math.round(totalAssessedScores[0])}%` : '---'}
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    Initial test baseline
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-mastery-mastered/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-mastery-mastered block">
                    Current Mastered Mean
                  </span>
                  <div className="text-2xl font-bold font-heading text-mastery-mastered">
                    {averageMastery}%
                  </div>
                  <span className="text-[11px] text-mastery-mastered flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    From {profile.attempts.length} evaluated attempts
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-deep border border-outline-variant/20 text-xs text-text-secondary flex items-center justify-between">
                <span>Next recommended review:</span>
                <span className="font-mono text-accent-secondary font-semibold">
                  {nextReviewConceptName}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-2 bg-surface-deep/40 rounded-xl border border-outline-variant/20">
              <Info className="w-8 h-8 text-text-secondary mx-auto opacity-40" />
              <p className="text-xs text-text-secondary">
                No attempt history available yet. Complete the baseline diagnostic to generate your before-and-after progression curve.
              </p>
              <button
                onClick={() => onNavigate('diagnostic')}
                className="mt-2 px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-90"
              >
                Begin Diagnostic
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Nine-Concept Coverage Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-accent-secondary uppercase tracking-wider">
              ACADEMIC SCOPE: CLASS 10 PHYSICS
            </span>
            <h2 className="font-heading text-xl lg:text-2xl font-bold text-text-primary mt-0.5">
              The 9 Electricity Concepts
            </h2>
          </div>
          <button
            onClick={() => onNavigate('graph')}
            className="text-xs font-mono text-accent-secondary hover:underline flex items-center gap-1"
          >
            Interactive Graph <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONCEPTS.map((c) => {
            const m = profile.masteryMap[c.id];
            const isUnassessed = !m || m.evidenceCount === 0 || m.score === null;
            const score = m?.score;

            let statusLabel = 'Unassessed';
            let badgeStyle = 'bg-mastery-unassessed/20 text-mastery-unassessed border-mastery-unassessed/40';
            let dotColor = 'bg-mastery-unassessed';

            if (!isUnassessed && score !== null) {
              if (m.status === 'mastered') {
                statusLabel = 'Mastered';
                badgeStyle = 'bg-mastery-mastered/20 text-mastery-mastered border-mastery-mastered/40';
                dotColor = 'bg-mastery-mastered';
              } else if (m.status === 'learning') {
                statusLabel = 'Learning';
                badgeStyle = 'bg-mastery-learning/20 text-mastery-learning border-mastery-learning/40';
                dotColor = 'bg-mastery-learning';
              } else if (m.status === 'atRisk') {
                statusLabel = 'At Risk';
                badgeStyle = 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40';
                dotColor = 'bg-mastery-atRisk';
              }
            }

            return (
              <div
                key={c.id}
                onClick={() => onNavigate('workspace', c.id)}
                className="p-4 rounded-2xl bg-surface border border-outline-variant/40 hover:border-accent-primary/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-accent-primary">{c.code}</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                    {statusLabel} {!isUnassessed && score !== null ? `(${score}%)` : ''}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">
                  {c.name}
                </h4>

                <p className="text-xs text-text-secondary line-clamp-2">
                  {c.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-text-secondary font-mono pt-2 border-t border-outline-variant/20">
                  <span>Prereqs: {c.prerequisiteIds.join(', ') || 'None'}</span>
                  <span>{c.formulas.length} Formula{c.formulas.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
