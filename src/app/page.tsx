'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { CognitiveOverview } from '@/components/CognitiveOverview';
import { DiagnosticView } from '@/components/DiagnosticView';
import { ConceptGraph } from '@/components/ConceptGraph';
import { MisconceptionView } from '@/components/MisconceptionView';
import { LearningWorkspace } from '@/components/LearningWorkspace';
import { RevisionScheduleView } from '@/components/RevisionScheduleView';
import { TeacherAnalyticsView } from '@/components/TeacherAnalyticsView';
import { HackathonDemoRunner } from '@/components/HackathonDemoRunner';
import { loadLearnerProfile, getInitialLearnerProfile, saveLearnerProfile } from '@/lib/storage';
import { LearnerProfile } from '@/types/mastery';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
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
      alert('Learner profile reset to initial unassessed baseline.');
    }
  };

  const handleNavigate = (tab: string, conceptId?: string) => {
    if (conceptId) {
      setSelectedWorkspaceConceptId(conceptId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    setProfile(loadLearnerProfile());
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={handleTabChange}
      onRunDemo={() => setIsDemoOpen(true)}
      onResetData={handleResetData}
    >
      {/* Screen 1 — Cognitive Overview */}
      {currentTab === 'overview' && profile && (
        <CognitiveOverview
          profile={profile}
          onNavigate={handleNavigate}
          onRunDemo={() => setIsDemoOpen(true)}
        />
      )}

      {/* Screen 2 — Diagnostic Test with Reasoning Capture */}
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

      {/* Screen 3 — Concept Graph and Learner Model */}
      {currentTab === 'graph' && profile && (
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-2xl text-text-primary">
                Class 10 Physics Knowledge Topology
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Prerequisite Directed Acyclic Graph across all 9 Electricity concepts.
              </p>
            </div>
            <button
              onClick={() => handleNavigate('workspace')}
              className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-90"
            >
              Practice in Workspace
            </button>
          </div>

          <ConceptGraph
            masteryMap={profile.masteryMap}
            onSelectConcept={(cId) => handleNavigate('workspace', cId)}
          />
        </div>
      )}

      {/* Screen 4 — Misconception Insight and Remediation */}
      {currentTab === 'misconceptions' && profile && (
        <MisconceptionView
          profile={profile}
          onPracticeConcept={(cId) => handleNavigate('workspace', cId)}
        />
      )}

      {/* Screen 5 — Adaptive Practice */}
      {currentTab === 'workspace' && (
        <LearningWorkspace
          initialConceptId={selectedWorkspaceConceptId}
          onViewGraph={() => handleNavigate('graph')}
          onViewRevision={() => handleNavigate('revision')}
        />
      )}

      {/* Screen 6 — Spaced Repetition and Revision Schedule */}
      {currentTab === 'revision' && (
        <RevisionScheduleView
          onPracticeConcept={(cId) => handleNavigate('workspace', cId)}
          onViewGraph={() => handleNavigate('graph')}
        />
      )}

      {/* Screen 7 — Teacher Dashboard */}
      {currentTab === 'teacher' && <TeacherAnalyticsView />}

      {/* Interactive Demonstration Runner Modal (Section 18) */}
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
    </AppShell>
  );
}
