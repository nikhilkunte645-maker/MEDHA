'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { LandingHero } from '@/components/LandingHero';
import { StudentDashboard } from '@/components/StudentDashboard';
import { DiagnosticView } from '@/components/DiagnosticView';
import { LearningWorkspace } from '@/components/LearningWorkspace';
import { ConceptGraph } from '@/components/ConceptGraph';
import { RevisionScheduleView } from '@/components/RevisionScheduleView';
import { TeacherAnalyticsView } from '@/components/TeacherAnalyticsView';
import { HackathonDemoRunner } from '@/components/HackathonDemoRunner';
import { loadLearnerProfile, getInitialLearnerProfile, saveLearnerProfile } from '@/lib/storage';
import { LearnerProfile } from '@/types/mastery';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [selectedWorkspaceConceptId, setSelectedWorkspaceConceptId] = useState<string>('C01');
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);

  useEffect(() => {
    setProfile(loadLearnerProfile());
  }, []);

  const handleResetData = () => {
    if (confirm('Reset learner profile and mastery data to initial unassessed baseline?')) {
      const fresh = getInitialLearnerProfile();
      saveLearnerProfile(fresh);
      setProfile(fresh);
      alert('Learner profile reset to initial unassessed state.');
    }
  };

  const handleNavigate = (tab: string, conceptId?: string) => {
    if (conceptId) {
      setSelectedWorkspaceConceptId(conceptId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Re-read profile when tab changes
  const handleTabChange = (tab: string) => {
    setProfile(loadLearnerProfile());
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100">
      {/* Top Global Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onRunDemo={() => setIsDemoOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'landing' && (
          <div className="space-y-12">
            <LandingHero
              onStartDiagnostic={() => handleNavigate('diagnostic')}
              onExploreGraph={() => handleNavigate('graph')}
              onRunDemo={() => setIsDemoOpen(true)}
            />

            {/* Live Interactive Concept Graph on Landing Page */}
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="text-center">
                <span className="text-xs font-mono font-bold text-brand-violet uppercase tracking-wider">
                  LIVE TELEMETRY PREVIEW
                </span>
                <h3 className="font-heading text-xl lg:text-2xl font-bold text-white mt-1">
                  Interactive Prerequisite Concept Graph
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Derives real-time state from your session. Click any node to open pedagogical details.
                </p>
              </div>

              {profile && (
                <ConceptGraph
                  masteryMap={profile.masteryMap}
                  onSelectConcept={(cId) => handleNavigate('workspace', cId)}
                />
              )}
            </div>
          </div>
        )}

        {currentTab === 'dashboard' && profile && (
          <StudentDashboard
            profile={profile}
            onNavigate={handleNavigate}
            onRunDemo={() => setIsDemoOpen(true)}
          />
        )}

        {currentTab === 'diagnostic' && (
          <DiagnosticView
            onCompleteDiagnostic={() => {
              setProfile(loadLearnerProfile());
              handleNavigate('workspace');
            }}
            onViewGraph={() => {
              setProfile(loadLearnerProfile());
              handleNavigate('graph');
            }}
          />
        )}

        {currentTab === 'workspace' && (
          <LearningWorkspace
            initialConceptId={selectedWorkspaceConceptId}
            onViewGraph={() => handleNavigate('graph')}
            onViewRevision={() => handleNavigate('revision')}
          />
        )}

        {currentTab === 'graph' && profile && (
          <div className="max-w-5xl mx-auto space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-2xl text-white">
                  Concept Mastery Knowledge Graph
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Prerequisite Directed Acyclic Graph (DAG) for Class 10 Physics: Electricity.
                </p>
              </div>
              <button
                onClick={() => handleNavigate('workspace')}
                className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold hover:bg-brand-violet/90 transition-all shadow-md shadow-brand-violet/20"
              >
                Go to Adaptive Workspace
              </button>
            </div>

            <ConceptGraph
              masteryMap={profile.masteryMap}
              onSelectConcept={(cId) => handleNavigate('workspace', cId)}
            />
          </div>
        )}

        {currentTab === 'revision' && (
          <RevisionScheduleView
            onPracticeConcept={(cId) => handleNavigate('workspace', cId)}
            onViewGraph={() => handleNavigate('graph')}
          />
        )}

        {currentTab === 'teacher' && <TeacherAnalyticsView />}
      </main>

      {/* Global Interactive Demo Runner Modal */}
      <HackathonDemoRunner
        isOpen={isDemoOpen}
        onClose={() => {
          setIsDemoOpen(false);
          setProfile(loadLearnerProfile());
        }}
        onNavigateToTab={(tab, conceptId) => {
          setIsDemoOpen(false);
          handleNavigate(tab, conceptId);
        }}
      />

      {/* Footer */}
      <footer className="w-full border-t border-surface-border bg-surface/50 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            MASTERY © 2026 • Product Space Agentic AI Hackathon (PS-2)
          </span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Class 10 Physics • Electricity</span>
            <span>Deterministic Mastery & Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
