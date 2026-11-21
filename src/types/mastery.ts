export type MasteryStatus = 'mastered' | 'learning' | 'atRisk' | 'unassessed';

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

export type CognitiveErrorCategory =
  | 'conceptual_misunderstanding'
  | 'calculation_error'
  | 'formula_recall_failure'
  | 'unit_conversion_error'
  | 'careless_mistake'
  | 'sound_understanding'
  | 'insufficient_evidence';

export type DiagnosticConfidenceLevel = 'high' | 'moderate' | 'low' | 'insufficient_evidence';

export interface PrerequisiteGapInfo {
  conceptId: string;
  conceptName: string;
  relationship: string;
  rootGap: boolean;
}

export interface ReasoningChainStep {
  step: number;
  stage: string;
  label: string;
  content: string;
  status: 'passed' | 'warning' | 'flagged' | 'neutral';
}

export interface MisconceptionAnalysis {
  is_correct: boolean;
  reasoning_quality: ReasoningQuality;
  misconception_detected: boolean;
  misconception_code?: string;
  misconception_title?: string;
  misconception_status?: 'detected' | 'suspected' | 'unverified';
  error_category?: CognitiveErrorCategory;
  confidence_level?: DiagnosticConfidenceLevel;
  prerequisite_gap?: PrerequisiteGapInfo | null;
  reasoning_chain?: ReasoningChainStep[];
  evidence: string[];
  explanation: string;
  correct_principle?: string;
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
  misconceptionStatus?: 'detected' | 'suspected' | 'unverified';
  errorCategory?: CognitiveErrorCategory;
  confidenceLevel?: DiagnosticConfidenceLevel;
  prerequisiteGap?: PrerequisiteGapInfo | null;
  reasoningChain?: ReasoningChainStep[];
  evidence: string[];
  explanation: string;
  correctPrinciple?: string;
  recommendedConceptIds: string[];
  confidence: number;
  nextLearningAction: string;
  isOfflineFallback?: boolean;
}

export interface ConceptMastery {
  conceptId: string;
  score: number | null; // null if unassessed, 0-100 if assessed
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
  masteryMap: Record<string, number | null>; // conceptId -> score 0-100 or null
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
  hint?: string;
  selection_reason?: string;
  is_offline_fallback?: boolean;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  classId?: string; // for students: e.g. 'CLASS-10A'
  assignedClassIds?: string[]; // for teachers: e.g. ['CLASS-10A']
  createdAt: string;
  isDeactivated?: boolean;
}

export interface UserSession {
  token: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentIds: string[];
  teacherIds: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: string;
  userId: string;
  role: string;
  ip?: string;
  details?: Record<string, unknown>;
}
