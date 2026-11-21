'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  Activity,
  GitBranch,
  Layers,
  Calendar,
  Users,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Play
} from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onRunDemo?: () => void;
  onResetData?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onRunDemo,
  onResetData
}) => {
  const [apiStatus, setApiStatus] = useState<{
    hasApiKey: boolean;
    mode: string;
    model: string;
  }>({
    hasApiKey: false,
    mode: 'checking',
    model: 'checking'
  });

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus({
          hasApiKey: data.hasApiKey,
          mode: data.mode,
          model: data.model
        });
      })
      .catch(() => {
        setApiStatus({
          hasApiKey: false,
          mode: 'offline_demonstration',
          model: 'deterministic_curated_heuristic'
        });
      });
  }, []);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Brain },
    { id: 'dashboard', label: 'Student Dashboard', icon: Activity },
    { id: 'diagnostic', label: 'Diagnostic Test', icon: HelpCircle },
    { id: 'workspace', label: 'Adaptive Practice', icon: Sparkles },
    { id: 'graph', label: 'Concept Graph', icon: Layers },
    { id: 'revision', label: 'Revision Schedule', icon: Calendar },
    { id: 'teacher', label: 'Teacher Analytics', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onTabChange('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-violet/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl tracking-wider text-white">
                  MASTERY
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-violet border border-brand-violet/30 font-semibold">
                  PS-2 Hackathon
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Know what you know. Discover what you don&apos;t.
              </p>
            </div>
          </div>

          {/* Central Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/80 p-1 rounded-xl border border-surface-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/20 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* AI Engine Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                apiStatus.hasApiKey
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
              title={
                apiStatus.hasApiKey
                  ? 'Connected to Gemini API (Server-side)'
                  : 'Demo Mode: Rule-based verified heuristic. Set GEMINI_API_KEY for live LLM.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="hidden lg:inline text-[11px]">
                {apiStatus.hasApiKey ? 'Gemini 2.5 Flash' : 'Offline Engine'}
              </span>
            </div>

            {/* Run Live Demo Walkthrough CTA */}
            {onRunDemo && (
              <button
                onClick={onRunDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Demo Walkthrough</span>
              </button>
            )}

            {/* Reset Data Button */}
            {onResetData && (
              <button
                onClick={onResetData}
                title="Reset learner storage to baseline"
                className="p-2 text-slate-400 hover:text-white hover:bg-surface rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 gap-1 border-t border-surface-border/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-violet text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
