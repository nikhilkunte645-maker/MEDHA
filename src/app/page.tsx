'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CognitiveOverview } from '@/components/CognitiveOverview';
import { HackathonDemoRunner } from '@/components/HackathonDemoRunner';
import { loadLearnerProfile, getInitialLearnerProfile } from '@/lib/storage';
import { LearnerProfile } from '@/types/mastery';
import {
  Compass,
  GraduationCap,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Play,
  Layers,
  BookOpen,
  ArrowUpRight
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
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col antialiased">
      {/* Top Studio Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center shadow-cobalt font-heading font-black text-lg">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary">
                  MEDHA
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-accent-primaryLight text-accent-primary font-bold">
                  Learning Studio
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Know what you know. Fix what you don&apos;t.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-secondary border border-outline-variant text-text-primary text-xs font-semibold shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-accent-primary fill-current" />
              <span>60s Walkthrough</span>
            </button>

            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-primaryHover text-white font-semibold text-xs shadow-cobalt transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Role Portal Selection Cards */}
      <section className="bg-surface border-b border-outline-variant py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent-primary">
                Role-Separated Portals
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
                Choose Your Workspace
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted hidden sm:inline">
              Class 10 Physics · Electricity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student Portal Card */}
            <div
              onClick={() => router.push('/login')}
              className="p-6 rounded-2xl bg-canvas border border-outline-variant hover:border-accent-primary/60 hover:shadow-card cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-accent-primaryLight text-accent-primary flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-accent-primaryLight text-accent-primary font-bold px-2 py-0.5 rounded">
                  Student
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-primary transition-colors flex items-center justify-between">
                <span>Student Learning Studio</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Diagnostic baseline, 9-concept topology DAG, adaptive practice, and root-cause misconception diagnosis.
              </p>
            </div>

            {/* Teacher Portal Card */}
            <div
              onClick={() => router.push('/login')}
              className="p-6 rounded-2xl bg-canvas border border-outline-variant hover:border-accent-secondary/60 hover:shadow-card cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-accent-secondaryLight text-accent-secondary flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-accent-secondaryLight text-accent-secondary font-bold px-2 py-0.5 rounded">
                  Teacher
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-secondary transition-colors flex items-center justify-between">
                <span>Teacher Analytics Studio</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Assigned class heatmaps, common misconception frequencies, individual student drill-down, and CSV/JSON gradebook exports.
              </p>
            </div>

            {/* Admin Console Card */}
            <div
              onClick={() => router.push('/login')}
              className="p-6 rounded-2xl bg-canvas border border-outline-variant hover:border-outline-variant/90 hover:shadow-card cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-surface-secondary text-text-primary flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-mastery-mastered" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-surface-secondary text-text-secondary font-bold px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-primary transition-colors flex items-center justify-between">
                <span>Governance Console</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                User provisioning, cohort-to-teacher mappings, session revocation control, and immutable security audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Student Experience Preview */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <CognitiveOverview
          profile={profile}
          onNavigate={() => router.push('/login')}
          onRunDemo={() => setIsDemoOpen(true)}
        />
      </main>

      {/* 60s Demo Runner Modal */}
      <HackathonDemoRunner
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onComplete={() => {
          setIsDemoOpen(false);
          router.push('/login');
        }}
      />
    </div>
  );
}