'use client';

import React, { useState } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { LearnerProfile, Attempt } from '@/types/mastery';
import { MathText } from '@/components/MathRenderer';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Sparkles,
  Target,
  ArrowUpRight,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';

interface MisconceptionViewProps {
  profile: LearnerProfile;
  onPracticeConcept: (conceptId: string) => void;
}

export const MisconceptionView: React.FC<MisconceptionViewProps> = ({
  profile,
  onPracticeConcept
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Filter student attempts with misconceptions
  const misconceptionAttempts = profile.attempts
    .slice()
    .reverse()
    .filter((a) => a.misconceptionDetected);

  const activeAttempt =
    misconceptionAttempts.find((a) => a.id === selectedAttemptId) || misconceptionAttempts[0];

  return (
    <div className="space-y-8">
      {/* Studio Header Banner */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-2xl space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-accent-warmLight text-accent-warm text-xs font-mono font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Diagnostic Cognitive Remediation</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Misconception Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              MEDHA isolates why misunderstandings occur by analyzing your written reasoning, distinguishing genuine cognitive fallacies from unit conversion slips or math errors.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-accent-primaryLight text-accent-primary font-bold border border-accent-primary/20">
              {misconceptionAttempts.length} Active in History
            </span>
          </div>
        </div>
      </div>

      {misconceptionAttempts.length > 0 && activeAttempt ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Attempt History List */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted block px-1">
              Detected Cognitive Slips
            </span>

            {misconceptionAttempts.map((att) => {
              const isSelected = activeAttempt.id === att.id;
              const status = att.misconceptionStatus || 'detected';

              return (
                <div
                  key={att.id}
                  onClick={() => setSelectedAttemptId(att.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-surface border-accent-primary shadow-elevated ring-1 ring-accent-primary/20'
                      : 'bg-surface border-outline-variant hover:border-outline-variant/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded text-[11px]">
                      {att.targetConceptIds.join(', ')}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                        status === 'detected'
                          ? 'bg-mastery-atRiskLight text-mastery-atRisk border-mastery-atRisk/30'
                          : 'bg-mastery-learningLight text-mastery-learning border-mastery-learning/30'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-text-primary line-clamp-1">
                    {att.misconceptionTitle || 'Conceptual confusion'}
                  </h4>

                  <p className="text-[11px] text-text-secondary line-clamp-2 italic">
                    &ldquo;{att.writtenReasoning}&rdquo;
                  </p>

                  <div className="text-[10px] text-text-muted font-mono pt-1">
                    Confidence: {Math.round(att.confidence * 100)}% • {new Date(att.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Comparative Remediation Studio */}
          <div className="lg:col-span-8 bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 space-y-6 shadow-card">
            {/* Status & Confidence Badge */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border uppercase ${
                    (activeAttempt.misconceptionStatus || 'detected') === 'detected'
                      ? 'bg-mastery-atRiskLight text-mastery-atRisk border-mastery-atRisk/30'
                      : 'bg-mastery-learningLight text-mastery-learning border-mastery-learning/30'
                  }`}
                >
                  Status: {activeAttempt.misconceptionStatus || 'detected'}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Confidence: {Math.round(activeAttempt.confidence * 100)}%
                </span>
              </div>

              <span className="text-xs font-mono text-accent-primary font-bold">
                Target: {activeAttempt.targetConceptIds.join(', ')}
              </span>
            </div>

            {/* Identified Misconception Title */}
            <div>
              <span className="text-[11px] font-mono uppercase text-accent-warm font-bold block mb-1">
                Conceptual Friction Identified
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-text-primary">
                {activeAttempt.misconceptionTitle}
              </h3>
              <p className="text-xs font-mono text-text-muted mt-0.5">
                Taxonomy Code: {activeAttempt.misconceptionCode || 'COGNITIVE_ERROR'}
              </p>
            </div>

            {/* Side-by-Side Comparative Studio: What You Thought vs What Actually Happens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: What You Thought */}
              <div className="p-5 rounded-2xl bg-canvas border border-outline-variant space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent-warm uppercase">
                  <HelpCircle className="w-4 h-4" />
                  <span>What You Thought</span>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-outline-variant text-xs text-text-primary italic leading-relaxed">
                  &ldquo;<MathText text={activeAttempt.writtenReasoning} />&rdquo;
                </div>

                {activeAttempt.evidence && activeAttempt.evidence.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-mastery-atRisk font-bold uppercase block">
                      Specific Flaw Flagged:
                    </span>
                    <div className="text-xs text-mastery-atRisk font-medium">
                      &ldquo;<MathText text={activeAttempt.evidence.join('; ')} />&rdquo;
                    </div>
                  </div>
                )}

                <div className="text-xs text-text-secondary leading-relaxed pt-1">
                  <MathText text={activeAttempt.explanation} />
                </div>
              </div>

              {/* Box 2: What Actually Happens in Physics */}
              <div className="p-5 rounded-2xl bg-mastery-masteredLight/40 border border-mastery-mastered/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-mastery-mastered uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What Actually Happens</span>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-mastery-mastered/20 text-xs font-medium text-text-primary leading-relaxed">
                  <MathText
                    text={
                      activeAttempt.correctPrinciple ||
                      'Electric charge is strictly conserved. Charges are not consumed by resistors; they deliver electrical potential energy as heat or light, while the current flow rate remains constant throughout a series path.'
                    }
                  />
                </div>

                <div className="p-3 bg-surface rounded-xl border border-mastery-mastered/20 text-xs text-text-secondary space-y-1">
                  <span className="text-[10px] font-mono text-accent-primary font-bold block uppercase">
                    Scientific Law:
                  </span>
                  <div className="text-xs text-text-primary">
                    <MathText text="Kirchhoff's Current Law / Charge Conservation: $I_1 = I_2 = I_{\text{total}}$ in series." />
                  </div>
                </div>
              </div>
            </div>

            {/* Targeted Practice CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant">
              <span className="text-xs text-text-secondary font-medium">
                Ready to replace this misconception with verified mastery?
              </span>

              <button
                onClick={() => onPracticeConcept(activeAttempt.targetConceptIds[0] || 'C01')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Practice {activeAttempt.targetConceptIds[0] || 'C01'} in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-surface rounded-3xl border border-outline-variant space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-mastery-masteredLight border border-mastery-mastered/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-mastery-mastered" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-text-primary">
            No Active Misconceptions Detected
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
            Your evaluated attempts show sound physical reasoning. If you have unassessed concepts, complete the diagnostic or adaptive practice to ensure no latent fallacies remain.
          </p>
          <button
            onClick={() => onPracticeConcept('C01')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
          >
            <span>Practice in Learning Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Curriculum Misconception Taxonomy Catalog */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <div>
          <span className="text-xs font-mono font-bold text-accent-primary uppercase tracking-wider">
            Class 10 Physics Taxonomy
          </span>
          <h3 className="font-heading font-extrabold text-xl text-text-primary mt-0.5">
            Known Conceptual Misconceptions
          </h3>
          <p className="text-xs text-text-secondary">
            Common cognitive fallacies mapped across the Class 10 Electricity syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONCEPTS.flatMap((c) =>
            c.commonMisconceptions.map((m) => (
              <div
                key={m.code}
                className="p-5 rounded-2xl bg-surface border border-outline-variant hover:border-accent-primary/40 hover:shadow-card transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold text-accent-primary px-2 py-0.5 rounded bg-accent-primaryLight">
                    {c.id} · {c.name}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {m.code}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-warm shrink-0"></span>
                  <span>{m.title}</span>
                </h4>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {m.description}
                </p>

                <div className="p-2.5 rounded-xl bg-canvas border border-outline-variant text-[11px] text-text-primary">
                  <strong className="text-mastery-mastered font-semibold">Physical Truth: </strong>
                  {m.correction}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};