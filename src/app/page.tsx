'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CognitiveOverview } from '@/components/CognitiveOverview';
import { HackathonDemoRunner } from '@/components/HackathonDemoRunner';
import { loadLearnerProfile, getInitialLearnerProfile } from '@/lib/storage';
import { LearnerProfile } from '@/types/mastery';
import {
  Brain,
  GraduationCap,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Play,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerProfile>(getInitialLearnerProfile);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [checkedSession, setCheckedSession] = useState<boolean>(false);

  useEffect(() => {
    // Check if user already has an active authenticated session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.role === 'student') router.push('/student');
          else if (data.user.role === 'teacher') router.push('/teacher');
          else if (data.user.role === 'admin') router.push('/admin');
        } else {
          setCheckedSession(true);
          setProfile(loadLearnerProfile());
        }
      })
      .catch(() => {
        setCheckedSession(true);
        setProfile(loadLearnerProfile());
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-deep text-text-primary selection:bg-accent-primaryContainer selection:text-white flex flex-col">
      {/* Top Portal Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer flex items-center justify-center text-white shadow-neonPrimary">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-wider text-text-primary">
                  MEDHA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-bold">
                  Role-Protected Portals
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-mono">
                Know what you know. Fix what you don&apos;t.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-higher border border-outline-variant/40 text-text-primary text-xs font-mono font-semibold"
            >
              <Play className="w-3.5 h-3.5 text-accent-secondary fill-current" />
              <span>60s Walkthrough</span>
            </button>

            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white font-mono font-bold text-xs shadow-neonPrimary hover:opacity-90 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Role Portal Entry Selection Banner */}
      <section className="bg-surface border-b border-outline-variant/40 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Student Portal Card */}
          <div
            onClick={() => router.push('/login')}
            className="p-5 rounded-2xl bg-surface-elevated border border-outline-variant/40 hover:border-accent-primary/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/20 text-accent-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase text-accent-primary font-bold">
                Role 1
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-primary transition-colors flex items-center justify-between">
              <span>Student Learning Portal</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-text-secondary">
              Diagnostic assessment, interactive 9-concept topology DAG, adaptive practice, and personalized misconception remediation.
            </p>
          </div>

          {/* Teacher Portal Card */}
          <div
            onClick={() => router.push('/login')}
            className="p-5 rounded-2xl bg-surface-elevated border border-outline-variant/40 hover:border-accent-secondary/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-accent-secondary/20 text-accent-secondary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase text-accent-secondary font-bold">
                Role 2
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-secondary transition-colors flex items-center justify-between">
              <span>Teacher Analytics Portal</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-text-secondary">
              Strictly assigned class heatmaps, learning bottleneck alerts, cognitive error distributions, and authorized report exports.
            </p>
          </div>

          {/* Admin Command Center */}
          <div
            onClick={() => router.push('/login')}
            className="p-5 rounded-2xl bg-surface-elevated border border-outline-variant/40 hover:border-accent-tertiary/50 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-accent-tertiary/20 text-accent-tertiary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase text-accent-tertiary font-bold">
                Role 3
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-tertiary transition-colors flex items-center justify-between">
              <span>Administrator Center</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-text-secondary">
              Teacher/student account provisioning, class mapping assignments, session revocation, and security audit log trail.
            </p>
          </div>
        </div>
      </section>

      {/* Main Preview Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <CognitiveOverview
          profile={profile}
          onNavigate={() => router.push('/login')}
          onRunDemo={() => setIsDemoOpen(true)}
        />
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-outline-variant/30 bg-surface/50 py-5 text-xs text-text-secondary font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>MEDHA © 2026 • Secure Role-Separated AI Intelligence Platform</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Class 10 Physics • Electricity (9 Concepts)</span>
            <span className="text-accent-secondary">Bcrypt Authentication & Strict Data Isolation</span>
          </div>
        </div>
      </footer>

      {/* Interactive Demonstration Runner Modal */}
      <HackathonDemoRunner
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onNavigateToTab={(tab) => {
          setIsDemoOpen(false);
          router.push('/login');
        }}
      />
    </div>
  );
}
