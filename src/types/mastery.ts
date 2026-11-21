export type MasteryStatus = 'unassessed' | 'needs_attention' | 'developing' | 'proficient' | 'strong';

export interface Concept {
  id: string;
  code: string;
  name: string;
  description: string;
  learningObjectives: string[];
  prerequisiteIds: string[];
  difficulty: 1 | 2 | 3;
  formulas: {
    latex: string;
    description: string;
  }[];
  commonMisconceptions: {
    code: string;
    title: string;
    description: string;
    correction: string;
  }[];
}

export type QuestionType = 'multiple_choice' | 'reasoning';

export interface Question {
  id: string;
  conceptIds: string[];
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  type: QuestionType;
  reasoningRequired: boolean;
  learningObjective: string;
  hint?: string;
  isDiagnostic?: boolean;
}

export type ReasoningQuality = 'poor' | 'fair' | 'good' | 'exceptional' | 'insufficient_evidence';

export interface MisconceptionAnalysis {
  is_correct: boolean;
  reasoning_quality: ReasoningQuality;
  misconception_detected: boolean;
  misconception_code?: string;
  misconception_title?: string;
  evidence: string[];
  explanation: string;
  recommended_concept_ids: string[];
  confidence: number;
  next_learning_action: string;
  is_offline_fallback?: boolean;
}

export interface Attempt {
  id: string;
  learnerId: string;
  questionId: string;
  selectedAnswer: string;
  writtenReasoning: string;
  isCorrect: boolean;
  targetConceptIds: string[];
  difficulty: number;
  timestamp: string;
  reasoningQuality: ReasoningQuality;
  misconceptionDetected: boolean;
  misconceptionCode?: string;
  misconceptionTitle?: string;
  evidence: string[];
  explanation: string;
  recommendedConceptIds: string[];
  confidence: number;
  nextLearningAction: string;
  isOfflineFallback?: boolean;
}

export interface ConceptMastery {
  conceptId: string;
  score: number; // 0 - 100
  status: MasteryStatus;
  evidenceCount: number;
  lastAssessed: string | null;
  nextReviewAt: string | null;
  reviewCount: number;
  history: {
    timestamp: string;
    score: number;
    attemptId: string;
    change: number;
  }[];
}

export interface LearnerProfile {
  id: string;
  name: string;
  masteryMap: Record<string, ConceptMastery>;
  attempts: Attempt[];
  diagnosticCompleted: boolean;
  createdAt: string;
  lastActive: string;
}

export interface CohortStudent {
  id: string;
  name: string;
  avatarSeed: string;
  masteryMap: Record<string, number>; // conceptId -> score 0-100
  recentMisconception?: {
    code: string;
    title: string;
    conceptId: string;
    timestamp: string;
  };
  lastActive: string;
}

export interface GeneratedQuestion {
  question_id: string;
  concept_id: string;
  question: string;
  question_type: QuestionType;
  difficulty: number;
  options: string[];
  correct_answer: string;
  explanation: string;
  reasoning_required: boolean;
  learning_objective: string;
  is_offline_fallback?: boolean;
}
