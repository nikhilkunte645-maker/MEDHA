import { GoogleGenerativeAI } from '@google/generative-ai';
import { MisconceptionAnalysis, GeneratedQuestion, QuestionType } from '@/types/mastery';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export function hasGeminiApiKey(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0);
}

/**
 * Section 9 exact System Prompt for Misconception Detection
 */
const MISCONCEPTION_SYSTEM_PROMPT = `You are an expert Class 10 Physics educational diagnostic engine.

Your job is to identify the conceptual understanding and misconceptions revealed by a student's reasoning.

Do not merely compare the final answer against the expected answer.

Analyze the student's explanation step by step.

Distinguish between:
1. Conceptual misunderstanding.
2. Incorrect formula selection.
3. Mathematical calculation error.
4. Unit conversion error.
5. Misinterpretation of the question.
6. Incomplete reasoning.
7. Correct reasoning with an accidental final-answer error.
8. Insufficient evidence to classify.

Only identify a misconception when the student's reasoning provides supporting evidence.

Never invent reasoning that the student did not provide.

Return valid structured JSON only.

EXPECTED JSON SCHEMA:
{
  "is_correct": boolean,
  "reasoning_quality": "poor" | "fair" | "good" | "exceptional" | "insufficient_evidence",
  "misconception_detected": boolean,
  "misconception_code": "STRING_IDENTIFIER" | null,
  "misconception_title": "String title" | null,
  "evidence": ["Specific statement from the student's reasoning"],
  "explanation": "Why this reasoning indicates the misconception or correctness",
  "recommended_concept_ids": ["C01", "C02"],
  "confidence": 0.0 to 1.0,
  "next_learning_action": "Clear actionable learning recommendation"
}`;

/**
 * Section 10 exact System Prompt for Adaptive Question Generation
 */
const QUESTION_GEN_SYSTEM_PROMPT = `You are an expert Class 10 Physics assessment designer.

Generate an educational question that tests the specified concept.

Use the student's current mastery, previous mistakes and requested difficulty.

Avoid repeating existing questions.

The question must test conceptual understanding, not merely memorization.

Use realistic numerical values and mathematically consistent answers.

Provide an answer key and a concise explanation.

Never generate ambiguous questions.

Return valid JSON only.

EXPECTED JSON STRUCTURE:
{
  "question_id": "generated_unique_id",
  "concept_id": "C04",
  "question": "Question text",
  "question_type": "multiple_choice",
  "difficulty": 2,
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correct_answer": "Option B",
  "explanation": "Explanation",
  "reasoning_required": true,
  "learning_objective": "Apply Ohm's law"
}`;

/**
 * Validates and sanitizes the LLM misconception response
 */
export function validateMisconceptionResponse(data: unknown): MisconceptionAnalysis {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI response: Expected JSON object');
  }

  const d = data as Record<string, unknown>;

  const validQualities = ['poor', 'fair', 'good', 'exceptional', 'insufficient_evidence'];
  const reasoningQuality = validQualities.includes(String(d.reasoning_quality))
    ? (String(d.reasoning_quality) as MisconceptionAnalysis['reasoning_quality'])
    : 'insufficient_evidence';

  const evidence = Array.isArray(d.evidence)
    ? d.evidence.map(String).filter((s) => s.length > 0)
    : [];

  const recommendedConceptIds = Array.isArray(d.recommended_concept_ids)
    ? d.recommended_concept_ids.map(String).filter((s) => s.startsWith('C'))
    : ['C01'];

  const confidence = typeof d.confidence === 'number'
    ? Math.max(0, Math.min(1, d.confidence))
    : 0.85;

  return {
    is_correct: Boolean(d.is_correct),
    reasoning_quality: reasoningQuality,
    misconception_detected: Boolean(d.misconception_detected),
    misconception_code: d.misconception_code ? String(d.misconception_code) : undefined,
    misconception_title: d.misconception_title ? String(d.misconception_title) : undefined,
    evidence: evidence.length > 0 ? evidence : ['Direct analysis of submitted student statement'],
    explanation: String(d.explanation || 'Step-by-step diagnostic evaluation of reasoning.'),
    recommended_concept_ids: recommendedConceptIds.length > 0 ? recommendedConceptIds : ['C01'],
    confidence,
    next_learning_action: String(d.next_learning_action || 'Review foundational principles of this concept.')
  };
}

/**
 * Offline Rule-Based Fallback Engine for Misconception Detection
 * Guaranteed deterministic behavior when GEMINI_API_KEY is not set or network fails.
 */
export function runOfflineMisconceptionAnalysis(params: {
  questionPrompt: string;
  expectedAnswer: string;
  studentAnswer: string;
  studentReasoning: string;
  targetConceptIds: string[];
}): MisconceptionAnalysis {
  const { questionPrompt, expectedAnswer, studentAnswer, studentReasoning, targetConceptIds } = params;
  const reasoningLower = (studentReasoning || '').toLowerCase().trim();
  const isSelectedCorrect = studentAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();

  // If reasoning is completely empty or trivial
  if (!reasoningLower || reasoningLower.length < 5) {
    return {
      is_correct: isSelectedCorrect,
      reasoning_quality: 'insufficient_evidence',
      misconception_detected: false,
      evidence: ['No detailed reasoning provided.'],
      explanation: 'The student provided little or no written reasoning to evaluate conceptual understanding.',
      recommended_concept_ids: targetConceptIds,
      confidence: 0.6,
      next_learning_action: 'Please write out your chain of reasoning step-by-step.',
      is_offline_fallback: true
    };
  }

  // 1. Current vs Voltage Confusion / Current Consumption (Central Hackathon Demo Scenario)
  if (
    reasoningLower.includes('push') && (reasoningLower.includes('current') || reasoningLower.includes('used up') || reasoningLower.includes('consumed')) ||
    reasoningLower.includes('current gets used') ||
    reasoningLower.includes('fewer electrons') ||
    reasoningLower.includes('voltage flows')
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'poor',
      misconception_detected: true,
      misconception_code: 'CURRENT_VOLTAGE_CONFUSION',
      misconception_title: 'Confusing current with voltage and violating charge conservation',
      evidence: [
        studentReasoning.slice(0, 150)
      ],
      explanation: 'The student confuses electric current (the rate of flow of charge) with electric potential difference (the energy push per unit charge), and incorrectly assumes that charges are consumed or destroyed inside circuit loads.',
      recommended_concept_ids: ['C01', 'C02'],
      confidence: 0.94,
      next_learning_action: 'Review C01 (Electric Current) and C02 (Potential Difference) to understand that charge is strictly conserved and potential difference provides the energy transfer.',
      is_offline_fallback: true
    };
  }

  // 2. Resistivity vs Resistance Confusion
  if (
    (reasoningLower.includes('cut') || reasoningLower.includes('stretch') || reasoningLower.includes('thin') || reasoningLower.includes('thick')) &&
    (reasoningLower.includes('resistivity changes') || reasoningLower.includes('higher resistivity') || reasoningLower.includes('more resistivity'))
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'poor',
      misconception_detected: true,
      misconception_code: 'RESISTIVITY_DIMENSIONAL_DEPENDENCE',
      misconception_title: 'Believing resistivity changes when wire dimensions change',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student confuses extrinsic resistance (R = ρL/A) with intrinsic resistivity (ρ). Resistivity depends solely on material and temperature.',
      recommended_concept_ids: ['C05'],
      confidence: 0.92,
      next_learning_action: 'Review C05: Practice the distinction between material property (resistivity) and physical dimension opposition (resistance).',
      is_offline_fallback: true
    };
  }

  // 3. Stretched Wire Volume Conservation Neglect
  if (
    reasoningLower.includes('stretch') &&
    (reasoningLower.includes('2r') || reasoningLower.includes('doubles') || reasoningLower.includes('length only')) &&
    !reasoningLower.includes('area')
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'fair',
      misconception_detected: true,
      misconception_code: 'STRETCHED_WIRE_AREA_NEGLECT',
      misconception_title: 'Neglecting cross-sectional area reduction when a wire is stretched',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student recognized that length doubled (2L), but neglected that volume is conserved, which forces the cross-sectional area to halve (A/2), resulting in 4R.',
      recommended_concept_ids: ['C05'],
      confidence: 0.89,
      next_learning_action: 'Remember volume conservation: V = A × L is constant during stretching.',
      is_offline_fallback: true
    };
  }

  // 4. Parallel Resistance Fallacy
  if (
    reasoningLower.includes('parallel') &&
    (reasoningLower.includes('increase') || reasoningLower.includes('adds up') || reasoningLower.includes('11') || reasoningLower.includes('greater'))
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'poor',
      misconception_detected: true,
      misconception_code: 'PARALLEL_RESISTANCE_GREATER_FALLACY',
      misconception_title: 'Believing adding resistors in parallel increases total resistance',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student applied series summation intuition to parallel resistors. In parallel, additional branches offer more paths for current, lowering total resistance.',
      recommended_concept_ids: ['C06'],
      confidence: 0.91,
      next_learning_action: 'Review parallel equivalent resistance formula: 1/Rp = 1/R1 + 1/R2 + 1/R3.',
      is_offline_fallback: true
    };
  }

  // 5. Correct selection with sound reasoning
  if (isSelectedCorrect) {
    return {
      is_correct: true,
      reasoning_quality: 'good',
      misconception_detected: false,
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student correctly identified the physical relationship and justified the solution logically without conceptual misconceptions.',
      recommended_concept_ids: targetConceptIds,
      confidence: 0.92,
      next_learning_action: 'Advance to higher-difficulty multi-step application problems for this concept.',
      is_offline_fallback: true
    };
  }

  // Generic incorrect fallback
  return {
    is_correct: false,
    reasoning_quality: 'fair',
    misconception_detected: false,
    evidence: [studentReasoning.slice(0, 150)],
    explanation: 'The student selected an incorrect option. The written reasoning showed partial understanding with an error in mathematical execution or application of the rule.',
    recommended_concept_ids: targetConceptIds,
    confidence: 0.78,
    next_learning_action: 'Review the underlying formula and practice step-by-step problem solving.',
    is_offline_fallback: true
  };
}

/**
 * Server-side AI Misconception Diagnosis
 */
export async function diagnoseStudentReasoning(params: {
  questionPrompt: string;
  expectedAnswer: string;
  studentAnswer: string;
  studentReasoning: string;
  targetConceptIds: string[];
}): Promise<MisconceptionAnalysis> {
  if (!hasGeminiApiKey()) {
    return runOfflineMisconceptionAnalysis(params);
  }

  try {
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const userPrompt = `Class 10 Physics Assessment Diagnostic:
Question: ${params.questionPrompt}
Target Concepts: ${params.targetConceptIds.join(', ')}
Expected Correct Answer: ${params.expectedAnswer}
Student's Chosen Answer: ${params.studentAnswer}
Student's Submitted Reasoning:
"""
${params.studentReasoning}
"""

Analyze the student's reasoning step-by-step according to the system instructions. Return valid JSON only.`;

    const result = await model.generateContent([
      { text: MISCONCEPTION_SYSTEM_PROMPT },
      { text: userPrompt }
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return validateMisconceptionResponse(parsed);
  } catch (err) {
    console.warn('Gemini API call failed or encountered error, falling back to deterministic heuristic:', err);
    const fallback = runOfflineMisconceptionAnalysis(params);
    fallback.is_offline_fallback = true;
    return fallback;
  }
}

/**
 * Curated offline generated question bank by concept & difficulty
 */
const OFFLINE_GENERATED_QUESTION_BANK: Record<string, GeneratedQuestion[]> = {
  C01: [
    {
      question_id: 'GEN_C01_D1',
      concept_id: 'C01',
      question: 'A current of 0.75 A is drawn by a filament of an electric lamp for 20 minutes. Find the amount of electric charge that flows through the circuit.',
      question_type: 'multiple_choice',
      difficulty: 1,
      options: ['15 C', '900 C', '1500 C', '45 C'],
      correct_answer: '900 C',
      explanation: 'Q = I × t = 0.75 A × (20 × 60 s) = 0.75 × 1200 s = 900 C.',
      reasoning_required: true,
      learning_objective: 'Apply Q = I × t with SI unit conversions.',
      is_offline_fallback: true
    },
    {
      question_id: 'GEN_C01_D2',
      concept_id: 'C01',
      question: 'If the charge on an electron is 1.6 × 10⁻¹⁹ C, calculate the number of electrons constituting one Coulomb of charge.',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: ['6.25 × 10¹⁸ electrons', '1.6 × 10¹⁹ electrons', '6.25 × 10¹⁷ electrons', '1.0 × 10¹⁸ electrons'],
      correct_answer: '6.25 × 10¹⁸ electrons',
      explanation: 'Q = n · e => n = Q / e = 1 / (1.6 × 10⁻¹⁹) = 6.25 × 10¹⁸ electrons.',
      reasoning_required: true,
      learning_objective: 'Understand quantization of charge.',
      is_offline_fallback: true
    }
  ],
  C02: [
    {
      question_id: 'GEN_C02_D2',
      concept_id: 'C02',
      question: 'Why does an ideal voltmeter have extraordinarily high internal resistance?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: [
        'To maximize current flowing through the voltmeter',
        'To ensure it draws negligible current from the main circuit when connected in parallel',
        'To prevent the battery from discharging when open',
        'To convert electrical energy into heat quickly'
      ],
      correct_answer: 'To ensure it draws negligible current from the main circuit when connected in parallel',
      explanation: 'A voltmeter is connected across components in parallel. High resistance ensures virtually no current is diverted through the meter, leaving the main circuit operation unaffected.',
      reasoning_required: true,
      learning_objective: 'Explain the working rationale of voltmeter placement and internal resistance.',
      is_offline_fallback: true
    }
  ],
  C04: [
    {
      question_id: 'GEN_C04_D2',
      concept_id: 'C04',
      question: 'A potential difference of 20 V is maintained across a conductor of resistance 5 Ω. What current flows through it, and what happens to the current if the voltage is doubled at constant temperature?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: [
        '4 A initially; doubles to 8 A',
        '4 A initially; halves to 2 A',
        '100 A initially; remains 100 A',
        '0.25 A initially; doubles to 0.5 A'
      ],
      correct_answer: '4 A initially; doubles to 8 A',
      explanation: "By Ohm's law, I = V / R = 20 V / 5 Ω = 4 A. Since V ∝ I at constant temperature, doubling V to 40 V directly doubles current to 8 A.",
      reasoning_required: true,
      learning_objective: "Apply Ohm's law proportionally.",
      is_offline_fallback: true
    }
  ],
  C05: [
    {
      question_id: 'GEN_C05_D3',
      concept_id: 'C05',
      question: 'A uniform metal wire of resistance R is cut into three equal pieces. These three pieces are then connected in parallel. What is the equivalent resistance of the parallel combination?',
      question_type: 'multiple_choice',
      difficulty: 3,
      options: ['R / 9', 'R / 3', '3R', '9R'],
      correct_answer: 'R / 9',
      explanation: 'Each piece has length L/3, so resistance of each piece is R/3. Connecting three such resistors in parallel gives 1/Rp = 3/(R/3) = 9/R => Rp = R/9.',
      reasoning_required: true,
      learning_objective: 'Combine resistance factor laws with parallel equivalence.',
      is_offline_fallback: true
    }
  ],
  C06: [
    {
      question_id: 'GEN_C06_D2',
      concept_id: 'C06',
      question: 'Why are domestic electric appliances connected in parallel rather than in series?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: [
        'Because each appliance gets the full line voltage and can operate independently with its own switch',
        'Because parallel connection increases the total resistance and reduces power bills',
        'Because if one appliance blows a fuse, all appliances stop running for safety',
        'Because appliances require different voltages that only parallel circuits provide'
      ],
      correct_answer: 'Because each appliance gets the full line voltage and can operate independently with its own switch',
      explanation: 'In parallel circuits, every branch receives full supply voltage (220 V) and operates independently. In series, if one appliance fails or is switched off, the entire circuit breaks.',
      reasoning_required: true,
      learning_objective: 'Analyze the engineering advantages of parallel domestic circuits.',
      is_offline_fallback: true
    }
  ],
  C07: [
    {
      question_id: 'GEN_C07_D2',
      concept_id: 'C07',
      question: 'An electric heater rated 1000 W operates on 220 V. What rating fuse should be installed in the circuit for safety?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: ['2 A', '5 A', '10 A', '1 A'],
      correct_answer: '5 A',
      explanation: 'Operating current I = P / V = 1000 W / 220 V ≈ 4.55 A. The nearest standard safety fuse rating greater than 4.55 A is 5 A.',
      reasoning_required: true,
      learning_objective: 'Calculate operational current and select appropriate fuse ratings.',
      is_offline_fallback: true
    }
  ],
  C08: [
    {
      question_id: 'GEN_C08_D3',
      concept_id: 'C08',
      question: 'Two electric bulbs rated (100 W, 220 V) and (40 W, 220 V) are connected in series across a 220 V supply. Which bulb will glow brighter?',
      question_type: 'multiple_choice',
      difficulty: 3,
      options: [
        'The 40 W bulb glows brighter because its resistance is higher and it dissipates more heat in series (P = I²R)',
        'The 100 W bulb glows brighter because it has a higher wattage rating',
        'Both bulbs glow with equal brightness',
        'Neither bulb glows because series voltage is insufficient'
      ],
      correct_answer: 'The 40 W bulb glows brighter because its resistance is higher and it dissipates more heat in series (P = I²R)',
      explanation: 'From rated P = V²/R, the 40 W bulb has higher resistance (R40 = 220²/40 = 1210 Ω vs R100 = 220²/100 = 484 Ω). In series, current I is identical. Actual power dissipated is P = I²R. Higher resistance dissipates more power, so the 40 W bulb glows brighter.',
      reasoning_required: true,
      learning_objective: 'Evaluate power dissipation across differing circuit topologies.',
      is_offline_fallback: true
    }
  ]
};

/**
 * Validates generated question schema
 */
export function validateGeneratedQuestion(data: unknown, fallbackConceptId: string): GeneratedQuestion {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid question response format');
  }

  const d = data as Record<string, unknown>;

  const options = Array.isArray(d.options) && d.options.length >= 2
    ? d.options.map(String)
    : ['Option A', 'Option B', 'Option C', 'Option D'];

  const correctAnswer = String(d.correct_answer || options[0]);

  return {
    question_id: String(d.question_id || `gen_${Date.now()}`),
    concept_id: String(d.concept_id || fallbackConceptId),
    question: String(d.question || 'Evaluate the following physical configuration.'),
    question_type: 'multiple_choice',
    difficulty: typeof d.difficulty === 'number' ? Math.max(1, Math.min(3, d.difficulty)) : 2,
    options,
    correct_answer: correctAnswer,
    explanation: String(d.explanation || 'Detailed scientific explanation.'),
    reasoning_required: Boolean(d.reasoning_required ?? true),
    learning_objective: String(d.learning_objective || 'Test conceptual mastery of this principle.')
  };
}

/**
 * Adaptive question generation targeting weak concepts
 */
export async function generateAdaptiveQuestion(params: {
  conceptId: string;
  currentMastery: number;
  requestedDifficulty: number;
  previousMistakeCodes?: string[];
}): Promise<GeneratedQuestion> {
  const { conceptId, currentMastery, requestedDifficulty, previousMistakeCodes = [] } = params;

  if (!hasGeminiApiKey()) {
    const list = OFFLINE_GENERATED_QUESTION_BANK[conceptId] || OFFLINE_GENERATED_QUESTION_BANK['C01'];
    const chosen = list[Math.floor(Math.random() * list.length)];
    return {
      ...chosen,
      question_id: `gen_${conceptId}_${Date.now()}`,
      is_offline_fallback: true
    };
  }

  try {
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const userPrompt = `Generate a Class 10 Physics question for concept: ${conceptId}.
Student Current Mastery: ${currentMastery}/100.
Target Difficulty: ${requestedDifficulty} (1 = Easy, 2 = Medium, 3 = Challenging).
Previous Student Misconceptions/Errors to target: ${previousMistakeCodes.join(', ') || 'General conceptual reinforcement'}.

Ensure the question requires conceptual understanding, has verified numerical values, and includes 4 options with exact correct_answer. Return valid JSON only matching the schema.`;

    const result = await model.generateContent([
      { text: QUESTION_GEN_SYSTEM_PROMPT },
      { text: userPrompt }
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return validateGeneratedQuestion(parsed, conceptId);
  } catch (err) {
    console.warn('Gemini question generation error, falling back to curated bank:', err);
    const list = OFFLINE_GENERATED_QUESTION_BANK[conceptId] || OFFLINE_GENERATED_QUESTION_BANK['C01'];
    const chosen = list[0];
    return {
      ...chosen,
      question_id: `gen_${conceptId}_${Date.now()}`,
      is_offline_fallback: true
    };
  }
}
