'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Layers,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Calendar,
  Users,
  Cpu,
  RotateCcw,
  Play,
  Menu,
  X,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onRunDemo: () => void;
  onResetData: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  onRunDemo,
  onResetData,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { id: 'overview', label: 'Cognitive Overview', icon: Brain, badge: null },
    { id: 'diagnostic', label: 'Diagnostic Test', icon: HelpCircle, badge: 'Baseline' },
    { id: 'graph', label: 'Concept Graph', icon: Layers, badge: '9 Nodes' },
    { id: 'misconceptions', label: 'Misconceptions', icon: ShieldAlert, badge: 'AI Root-Cause' },
    { id: 'workspace', label: 'Adaptive Practice', icon: Sparkles, badge: 'Targeted' },
    { id: 'revision', label: 'Revision Schedule', icon: Calendar, badge: null },
    { id: 'teacher', label: 'Teacher Dashboard', icon: Users, badge: 'Cohort' }
  ];

  return (
    <div className="min-h-screen bg-surface-deep text-text-primary flex flex-col md:flex-row antialiased selection:bg-accent-primaryContainer selection:text-white">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/40 px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onTabChange('overview')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer flex items-center justify-center text-white shadow-neonPrimary">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className="font-heading font-bold text-base tracking-wider text-text-primary">
              MEDHA
            </span>
            <span className="block text-[9px] font-mono text-text-secondary">
              Know what you know. Fix what you don&apos;t.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunDemo}
            className="px-2.5 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-xs font-semibold"
          >
            Demo
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-surface border-r border-outline-variant/40 shrink-0 sticky top-0 h-screen select-none z-30">
        {/* Brand Area */}
        <div className="p-5 border-b border-outline-variant/30">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange('overview')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer flex items-center justify-center text-white shadow-neonPrimary group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-wider text-text-primary">
                  MEDHA
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-medium">
                Know what you know. Fix what you don&apos;t.
              </p>
            </div>
          </div>

          {/* Academic Scope Pill */}
          <div className="mt-3.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-text-secondary font-mono text-[11px]">Class 10 Physics</span>
            <span className="text-accent-secondary font-mono text-[11px] font-semibold">9 Concepts</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-surface-higher text-text-primary font-semibold border border-accent-primary/40 shadow-neonPrimary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-accent-primary' : 'text-text-secondary'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isActive
                        ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'
                        : 'bg-surface-deep text-text-secondary border-outline-variant/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Status & Actions Footer */}
        <div className="p-4 border-t border-outline-variant/30 space-y-3 bg-surface-deep/40">
          {/* Live AI Status */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              apiStatus.hasApiKey
                ? 'bg-surface-elevated border-mastery-mastered/40 text-mastery-mastered'
                : 'bg-surface-elevated border-accent-primary/30 text-accent-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus.hasApiKey
                    ? 'bg-mastery-mastered animate-pulse'
                    : 'bg-accent-primary'
                }`}
              ></span>
              <span className="font-mono text-[11px] font-semibold text-text-primary">
                {apiStatus.hasApiKey ? 'Gemini 2.5 Flash' : 'Offline Engine'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-secondary">
              {apiStatus.hasApiKey ? 'Live AI' : 'Deterministic'}
            </span>
          </div>

          {/* Quick Demo Walkthrough CTA */}
          <button
            onClick={onRunDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-90 transition-opacity"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>60s Demo Walkthrough</span>
          </button>

          {/* Student Profile & Reset */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-surface-higher border border-outline-variant text-text-primary text-[10px] font-bold flex items-center justify-center font-mono">
                P
              </div>
              <span className="text-text-secondary text-[11px] truncate max-w-[120px]">
                Priya (Student)
              </span>
            </div>

            <button
              onClick={onResetData}
              title="Reset state to initial unassessed baseline"
              aria-label="Reset learner profile data to initial unassessed baseline"
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col">
          <div className="p-4 bg-surface border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer flex items-center justify-center text-white">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-lg text-text-primary">
                MEDHA
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-surface-deep">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-surface-higher text-text-primary font-bold border border-accent-primary/40'
                      : 'text-text-secondary hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-accent-primary" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded bg-surface border border-outline-variant text-text-secondary">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Screen Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-outline-variant/30 bg-surface/50 py-5 text-xs text-text-secondary font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              MEDHA © 2026 • Adaptive AI Learning Intelligence Platform
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Class 10 Physics • Electricity (9 Concepts)</span>
              <span className="text-accent-secondary">Evidence-Based Mastery Engine</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
