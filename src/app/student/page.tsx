'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CognitiveOverview } from '@/components/CognitiveOverview';
import { DiagnosticView } from '@/components/DiagnosticView';
import { ConceptGraph } from '@/components/ConceptGraph';
import { MisconceptionView } from '@/components/MisconceptionView';
import { LearningWorkspace } from '@/components/LearningWorkspace';
import { RevisionScheduleView } from '@/components/RevisionScheduleView';
import { HackathonDemoRunner } from '@/components/HackathonDemoRunner';
import { LearnerProfile, User } from '@/types/mastery';
import { getInitialLearnerProfile } from '@/lib/storage';
import {
  Compass,
  Layers,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Calendar,
  LogOut,
  Play,
  GraduationCap,
  Menu,
  X,
  BookOpen,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';

export default function StudentPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [profile, setProfile] = useState<LearnerProfile>(getInitialLearnerProfile);
  const [selectedWorkspaceConceptId, setSelectedWorkspaceConceptId] = useState<string>('C01');
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSessionAndProfile();
  }, []);

  const fetchSessionAndProfile = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        router.push('/login?redirect=/student');
        return;
      }

      const sessionData = await sessionRes.json();
      if (!sessionData.authenticated || sessionData.user.role !== 'student') {
        if (sessionData.user?.role === 'teacher') {
          router.push('/teacher');
          return;
        }
        if (sessionData.user?.role === 'admin') {
          router.push('/admin');
          return;
        }
        router.push('/login');
        return;
      }

      setCurrentUser(sessionData.user);

      // Fetch student's own isolated profile from server
      const profileRes = await fetch('/api/student/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
      }
    } catch (err) {
      console.error('Session check error:', err);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  const handleNavigate = (tab: string, conceptId?: string) => {
    if (conceptId) {
      setSelectedWorkspaceConceptId(conceptId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-3 bg-surface p-8 rounded-2xl border border-outline-variant shadow-card">
          <div className="w-9 h-9 border-3 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-text-secondary tracking-wide">
            Authenticating Learning Studio...
          </span>
        </div>
      </div>
    );
  }

  const studentNavItems = [
    { id: 'overview', label: 'Cognitive Overview', icon: Compass, badge: null },
    { id: 'diagnostic', label: 'Diagnostic Assessment', icon: HelpCircle, badge: 'Baseline' },
    { id: 'graph', label: 'Concept Topology', icon: Layers, badge: '9 Nodes' },
    { id: 'misconceptions', label: 'Misconception Studio', icon: ShieldAlert, badge: 'AI Root-Cause' },
    { id: 'workspace', label: 'Adaptive Practice', icon: Sparkles, badge: 'Targeted' },
    { id: 'revision', label: 'Spaced Revision', icon: Calendar, badge: '1/3/7d' }
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('overview')}>
          <div className="w-8 h-8 rounded-lg bg-accent-primary text-white flex items-center justify-center shadow-sm font-heading font-black text-sm">
            M
          </div>
          <div>
            <span className="font-heading font-bold text-base tracking-tight text-text-primary">MEDHA</span>
            <span className="block text-[10px] font-mono text-accent-primary font-medium">Student Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDemoOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold"
          >
            Demo
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-surface border-r border-outline-variant shrink-0 sticky top-0 h-screen select-none z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center shadow-cobalt font-heading font-black text-lg transition-transform group-hover:scale-105">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary">MEDHA</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase bg-accent-primary/10 text-accent-primary font-bold">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-medium tracking-tight mt-0.5">
                Adaptive Learning Intelligence
              </p>
            </div>
          </div>

          {/* Academic Scope & Cohort Badge */}
          <div className="mt-4 px-3 py-2 rounded-xl bg-surface-secondary border border-outline-variant/60 flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent-secondary" />
              Class 10 Physics
            </span>
            <span className="text-accent-primary font-mono text-[11px] font-bold">
              {currentUser?.classId || 'Class 10-A'}
            </span>
          </div>
        </div>

        {/* Navigation Items (STRICTLY STUDENT ONLY) */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary font-bold border border-accent-primary/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-text-secondary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isActive
                        ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'
                        : 'bg-surface text-text-muted border-outline-variant'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Student Session & Actions Footer */}
        <div className="p-4 border-t border-outline-variant space-y-3 bg-surface-secondary/40">
          {/* 60s Demo Walkthrough CTA */}
          <button
            onClick={() => setIsDemoOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>60s Walkthrough</span>
          </button>

          {/* Student Profile & Sign Out */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold flex items-center justify-center font-heading">
                {currentUser?.name?.charAt(0) || 'S'}
              </div>
              <div className="truncate max-w-[120px]">
                <span className="text-text-primary text-[12px] font-semibold block truncate">
                  {currentUser?.name || 'Student'}
                </span>
                <span className="text-text-secondary text-[10px] font-mono block truncate">
                  {currentUser?.email || ''}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-text-secondary hover:text-mastery-atRisk hover:bg-mastery-atRiskLight transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface border-t border-outline-variant p-6 space-y-4 rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary">MEDHA Student Studio</h3>
                <p className="text-xs text-text-secondary font-mono">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-text-secondary hover:bg-surface-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-accent-primary/10 text-accent-primary font-bold border border-accent-primary/20'
                        : 'text-text-secondary hover:bg-surface-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-accent-primary" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-mastery-atRiskLight text-mastery-atRisk text-xs font-bold border border-mastery-atRisk/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Student Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Screen 1 — Cognitive Overview */}
          {currentTab === 'overview' && (
            <CognitiveOverview
              profile={profile}
              onNavigate={handleNavigate}
              onRunDemo={() => setIsDemoOpen(true)}
            />
          )}

          {/* Screen 2 — Diagnostic Test */}
          {currentTab === 'diagnostic' && (
            <DiagnosticView
              onCompleteDiagnostic={() => {
                fetchSessionAndProfile();
                handleNavigate('workspace');
              }}
              onViewGraph={() => {
                fetchSessionAndProfile();
                handleNavigate('graph');
              }}
            />
          )}

          {/* Screen 3 — Concept Graph */}
          {currentTab === 'graph' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent-secondaryLight text-accent-secondary text-xs font-mono font-semibold mb-2">
                    <span>9 Interconnected Physics Concepts</span>
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
                    Concept Prerequisite Topology
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Direct Acyclic Graph (DAG) visualizing foundational dependencies and real-time conceptual mastery.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('workspace')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Practice in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ConceptGraph
                masteryMap={profile.masteryMap}
                onSelectConcept={(cId) => handleNavigate('workspace', cId)}
              />
            </div>
          )}

          {/* Screen 4 — Misconception Insight */}
          {currentTab === 'misconceptions' && (
            <MisconceptionView
              profile={profile}
              onPracticeConcept={(cId) => handleNavigate('workspace', cId)}
            />
          )}

          {/* Screen 5 — Adaptive Practice */}
          {currentTab === 'workspace' && (
            <LearningWorkspace
              initialConceptId={selectedWorkspaceConceptId}
              profile={profile}
              onProfileUpdate={(updatedProfile) => {
                setProfile(updatedProfile);
                fetch('/api/student/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ profile: updatedProfile })
                }).catch((err) => console.error('Failed to sync profile:', err));
              }}
            />
          )}

          {/* Screen 6 — Revision Schedule */}
          {currentTab === 'revision' && (
            <RevisionScheduleView
              profile={profile}
              onPracticeConcept={(cId) => handleNavigate('workspace', cId)}
            />
          )}
        </main>
      </div>

      {/* 60s Demo Runner Modal */}
      <HackathonDemoRunner
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onComplete={() => {
          fetchSessionAndProfile();
          setIsDemoOpen(false);
          handleNavigate('overview');
        }}
      />
    </div>
  );
}