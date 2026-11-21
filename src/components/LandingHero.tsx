'use client';

import React from 'react';
import {
  Brain,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GitBranch,
  Layers,
  Calendar,
  CheckCircle,
  XCircle,
  Play,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { CONCEPTS } from '@/data/concepts';

interface LandingHeroProps {
  onStartDiagnostic: () => void;
  onExploreGraph: () => void;
  onRunDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartDiagnostic,
  onExploreGraph,
  onRunDemo
}) => {
  return (
    <div className="space-y-16 py-6 lg:py-12">
      {/* 1. Hero Section (First 10 Seconds) */}
      <div className="text-center max-w-4xl mx-auto space-y-6 px-4">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-violet/20 border border-brand-violet/40 text-brand-violet text-xs font-mono font-semibold shadow-lg shadow-brand-violet/10">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Product Space Agentic AI Hackathon • Problem Statement PS-2</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          Your AI tutor knows the answer.{' '}
          <span className="block mt-2 bg-gradient-to-r from-brand-violet via-purple-400 to-brand-cyan bg-clip-text text-transparent">
            Does it know what you understand?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          MASTERY tracks conceptual understanding, detects hidden cognitive misconceptions through step-by-step reasoning analysis, and dynamically calibrates a personalized physics mastery graph.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onStartDiagnostic}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-brand-violet/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Diagnostic Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onRunDemo}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-brand-cyan border border-brand-cyan/40 font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run 60-Sec Demo Walkthrough</span>
          </button>

          <button
            onClick={onExploreGraph}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-surface-border font-semibold text-sm transition-all"
          >
            <Layers className="w-4 h-4 text-brand-violet" />
            <span>Explore Concept Graph</span>
          </button>
        </div>

        {/* Key Product Differentiation Metric Pill */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            8 Concepts Modeled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
            Deterministic Mastery Engine
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
            Gemini 2.5 Flash Reasoning Diagnostic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Spaced Repetition (1/2/4/7 Days)
          </span>
        </div>
      </div>

      {/* 2. Side-by-Side Differentiator: Conventional AI Tutor vs MASTERY */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
            THE ARCHITECTURAL DIFFERENCE
          </span>
          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-white mt-1">
            Why Generic AI Tutors Fail at Actual Education
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Conventional AI Tutor */}
          <div className="rounded-2xl bg-surface border border-red-900/30 p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Conventional AI Chat Tutor
              </span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Answers questions immediately:</strong> Encourages passive dependency and prompt shortcutting without cognitive retention.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Evaluates final answer only:</strong> Marks a lucky multiple-choice guess as 100% correct without checking the underlying logic.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>No concept state memory:</strong> Forgets student knowledge state between prompts; lacks a structured prerequisite knowledge graph.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Zero teacher visibility:</strong> Operates in a silo where teachers cannot see aggregate misconceptions across the class.</span>
              </li>
            </ul>
          </div>

          {/* MASTERY Platform */}
          <div className="rounded-2xl bg-gradient-to-br from-surface to-surface-elevated border border-brand-violet/50 p-6 space-y-4 shadow-xl shadow-brand-violet/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-violet" />
                MASTERY Learning Intelligence
              </span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Investigates reasoning step-by-step:</strong> Specifically detects whether the student has a conceptual misunderstanding or calculation slip.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Prerequisite Knowledge Graph:</strong> Explicitly models prerequisite links across C01–C08 in Class 10 Physics Electricity.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Deterministic Mastery Algorithm:</strong> Evidence-based Bayesian update engine prevents lucky guesses from inflating scores.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Teacher Intelligence Dashboard:</strong> Aggregates cohort heatmap and misconception frequencies for targeted lesson plans.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. The 9 Core Capabilities Overview */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold text-brand-violet uppercase tracking-wider">
            ALL 9 HACKATHON CAPABILITIES IMPLEMENTED
          </span>
          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-white mt-1">
            Complete Adaptive Educational Intelligence Loop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              title: 'Diagnose Existing Understanding',
              desc: '10-question baseline diagnostic assessing all 8 concepts and capturing reasoning.',
              icon: Brain
            },
            {
              num: '02',
              title: 'Structured Concept Graph',
              desc: 'Prerequisite DAG linking C01 to C08 with live mastery color rendering and modals.',
              icon: Layers
            },
            {
              num: '03',
              title: 'Independent Mastery Tracking',
              desc: 'Deterministic 0–100 scale per concept with inertia and diminishing return mathematics.',
              icon: Activity
            },
            {
              num: '04',
              title: 'Analyze Student Reasoning',
              desc: 'Server-side LLM parses step-by-step rationale instead of comparing final options.',
              icon: Zap
            },
            {
              num: '05',
              title: 'Detect Specific Misconceptions',
              desc: 'Catches Current-Voltage confusion, resistivity vs resistance, and parallel circuit fallacies.',
              icon: ShieldAlert
            },
            {
              num: '06',
              title: 'Target Weak Concepts',
              desc: 'Adaptive generator synthesizes questions specifically calibrated to current knowledge gaps.',
              icon: Target
            },
            {
              num: '07',
              title: 'Calibrate Question Difficulty',
              desc: 'Multi-tiered difficulty (Level 1, 2, 3) ensuring proportional cognitive challenge.',
              icon: Sparkles
            },
            {
              num: '08',
              title: 'Schedule Spaced Revision',
              desc: 'Calculates retention intervals (1, 2, 4, 7 days) and identifies overdue reviews.',
              icon: Calendar
            },
            {
              num: '09',
              title: 'Teacher Cohort Intelligence',
              desc: 'Class-wide mastery bars, student × concept gap heatmap, and misconception tally.',
              icon: CheckCircle
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-surface-hover transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-violet">{item.num}</span>
                  <Icon className="w-4 h-4 text-brand-cyan" />
                </div>
                <h3 className="font-heading text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
