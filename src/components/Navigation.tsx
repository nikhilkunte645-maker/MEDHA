'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Activity,
  Layers,
  Calendar,
  Users,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Play,
  BookOpen
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
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'diagnostic', label: 'Diagnostic Test', icon: HelpCircle },
    { id: 'workspace', label: 'Adaptive Practice', icon: Sparkles },
    { id: 'graph', label: 'Concept Topology', icon: Layers },
    { id: 'revision', label: 'Revision Schedule', icon: Calendar },
    { id: 'teacher', label: 'Teacher Analytics', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-surface/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onTabChange('overview')}
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white shadow-cobalt font-heading font-black text-lg">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary">
                  MEDHA
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-accent-primaryLight text-accent-primary font-bold">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-medium hidden sm:block">
                Know what you know. Fix what you don&apos;t.
              </p>
            </div>
          </div>

          {/* Central Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-secondary/70 p-1 rounded-xl border border-outline-variant">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent-primary text-white shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
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
            {/* Live AI Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-secondary text-[10px] font-mono border border-outline-variant text-text-secondary">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus.hasApiKey ? 'bg-mastery-mastered animate-pulse' : 'bg-mastery-learning'
                }`}
              />
              <span>{apiStatus.hasApiKey ? 'Gemini 2.5' : 'Diagnostic Heuristic'}</span>
            </div>

            {onRunDemo && (
              <button
                onClick={onRunDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">60s Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};