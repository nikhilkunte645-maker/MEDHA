import { GoogleGenerativeAI } from '@google/generative-ai';
import { MisconceptionAnalysis, GeneratedQuestion } from '@/types/mastery';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export function hasGeminiApiKey(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0);
}

/**
 * Expert Physics Misconception Diagnostic System Prompt
 */
const MISCONCEPTION_SYSTEM_PROMPT = `You are an expert Class 10 Physics educational diagnostic engine for the MEDHA platform.

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
  "misconception_status": "detected" | "suspected" | "unverified",
  "misconception_code": "STRING_IDENTIFIER" | null,
  "misconception_title": "String title" | null,
  "evidence": ["Specific statement from the student's reasoning"],
  "explanation": "Why this reasoning indicates the misconception or correctness",
  "correct_principle": "The fundamental physics principle that clarifies this topic",
  "recommended_concept_ids": ["C01", "C02"],
  "confidence": 0.0 to 1.0,
  "next_learning_action": "Clear actionable learning recommendation"
}`;

/**
 * Adaptive Question Generation System Prompt
 */
const QUESTION_GEN_SYSTEM_PROMPT = `You are an expert Class 10 Physics assessment designer for the MEDHA platform.

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
  "learning_objective": "Apply Ohm's law",
  "hint": "Optional helpful physics hint",
  "selection_reason": "Why this question was selected for the student"
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

  let status: 'detected' | 'suspected' | 'unverified' = 'unverified';
  if (d.misconception_detected) {
    status = confidence >= 0.85 ? 'detected' : confidence >= 0.65 ? 'suspected' : 'unverified';
  }

  return {
    is_correct: Boolean(d.is_correct),
    reasoning_quality: reasoningQuality,
    misconception_detected: Boolean(d.misconception_detected),
    misconception_status: status,
    misconception_code: d.misconception_code ? String(d.misconception_code) : undefined,
    misconception_title: d.misconception_title ? String(d.misconception_title) : undefined,
    evidence: evidence.length > 0 ? evidence : ['Direct analysis of submitted student statement'],
    explanation: String(d.explanation || 'Step-by-step diagnostic evaluation of reasoning.'),
    correct_principle: d.correct_principle ? String(d.correct_principle) : undefined,
    recommended_concept_ids: recommendedConceptIds.length > 0 ? recommendedConceptIds : ['C01'],
    confidence,
    next_learning_action: String(d.next_learning_action || 'Review foundational principles of this concept.'),
    is_offline_fallback: false
  };
}

/**
 * Offline Rule-Based Fallback Engine for Misconception Detection
 */
export function runOfflineMisconceptionAnalysis(params: {
  questionPrompt: string;
  expectedAnswer: string;
  studentAnswer: string;
  studentReasoning: string;
  targetConceptIds: string[];
}): MisconceptionAnalysis {
  const { expectedAnswer, studentAnswer, studentReasoning, targetConceptIds } = params;
  const reasoningLower = (studentReasoning || '').toLowerCase().trim();
  const isSelectedCorrect = studentAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();

  // If reasoning is empty
  if (!reasoningLower || reasoningLower.length < 5) {
    return {
      is_correct: isSelectedCorrect,
      reasoning_quality: 'insufficient_evidence',
      misconception_detected: false,
      misconception_status: 'unverified',
      evidence: ['No detailed reasoning provided.'],
      explanation: 'The student provided insufficient written reasoning to reliably evaluate conceptual understanding.',
      recommended_concept_ids: targetConceptIds,
      confidence: 0.5,
      next_learning_action: 'Please write out your chain of reasoning step-by-step to enable accurate diagnosis.',
      is_offline_fallback: true
    };
  }

  // 1. Current vs Voltage Confusion / Current Consumption
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
      misconception_status: 'detected',
      misconception_code: 'CURRENT_VOLTAGE_CONFUSION',
      misconception_title: 'Confusing current with voltage and violating charge conservation',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student confuses electric current (the rate of flow of charge) with electric potential difference (the energy push per unit charge), and incorrectly assumes that charges are consumed inside circuit loads.',
      correct_principle: 'Electric charge is strictly conserved. Voltage provides the work done per unit charge; electrons carry energy without being consumed.',
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
      misconception_status: 'detected',
      misconception_code: 'RESISTIVITY_DIMENSIONAL_DEPENDENCE',
      misconception_title: 'Believing resistivity changes when wire dimensions change',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student confuses extrinsic resistance (R = ρL/A) with intrinsic resistivity (ρ). Resistivity depends solely on material and temperature.',
      correct_principle: 'Resistivity is an intensive material property independent of object length or cross-sectional area.',
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
      misconception_status: 'detected',
      misconception_code: 'STRETCHED_WIRE_AREA_NEGLECT',
      misconception_title: 'Neglecting cross-sectional area reduction when a wire is stretched',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student recognized that length doubled (2L), but neglected that volume is conserved, which forces the cross-sectional area to halve (A/2), resulting in 4R.',
      correct_principle: 'Volume V = A · L remains invariant during wire elongation.',
      recommended_concept_ids: ['C05'],
      confidence: 0.89,
      next_learning_action: 'Remember volume conservation: V = A × L is constant during stretching.',
      is_offline_fallback: true
    };
  }

  // 4. Series Current Decay
  if (
    reasoningLower.includes('series') &&
    (reasoningLower.includes('uses up') || reasoningLower.includes('first resistor gets more') || reasoningLower.includes('less current'))
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'poor',
      misconception_detected: true,
      misconception_status: 'detected',
      misconception_code: 'SERIES_CURRENT_DECAY',
      misconception_title: 'Believing current decreases progressively across series resistors',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student assumes resistors in series consume electric charge rather than energy, creating a supposed current gradient.',
      correct_principle: 'In a single series loop, charge cannot accumulate or vanish; current is identical at all points.',
      recommended_concept_ids: ['C06'],
      confidence: 0.91,
      next_learning_action: 'Review C06: In series circuits, current is strictly invariant.',
      is_offline_fallback: true
    };
  }

  // 5. Parallel Resistance Fallacy
  if (
    reasoningLower.includes('parallel') &&
    (reasoningLower.includes('increase') || reasoningLower.includes('adds up') || reasoningLower.includes('11') || reasoningLower.includes('greater'))
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'poor',
      misconception_detected: true,
      misconception_status: 'detected',
      misconception_code: 'PARALLEL_RESISTANCE_GREATER_FALLACY',
      misconception_title: 'Believing adding resistors in parallel increases total resistance',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student applied series summation intuition to parallel resistors. In parallel, additional branches offer more paths for current, lowering total resistance.',
      correct_principle: 'Adding parallel branches provides alternative current paths, decreasing overall equivalent resistance.',
      recommended_concept_ids: ['C07'],
      confidence: 0.91,
      next_learning_action: 'Review parallel equivalent resistance formula: 1/Rp = 1/R1 + 1/R2 + 1/R3.',
      is_offline_fallback: true
    };
  }

  // Sound Reasoning
  if (isSelectedCorrect) {
    return {
      is_correct: true,
      reasoning_quality: 'good',
      misconception_detected: false,
      misconception_status: 'unverified',
      evidence: [studentReasoning.slice(0, 150)],
      explanation: 'The student correctly identified the physical relationship and justified the solution logically without conceptual misconceptions.',
      correct_principle: 'Correctly applied governing physics principle.',
      recommended_concept_ids: targetConceptIds,
      confidence: 0.92,
      next_learning_action: 'Advance to higher-difficulty application problems for this concept.',
      is_offline_fallback: true
    };
  }

  return {
    is_correct: false,
    reasoning_quality: 'fair',
    misconception_detected: false,
    misconception_status: 'suspected',
    evidence: [studentReasoning.slice(0, 150)],
    explanation: 'The student selected an incorrect option. The written reasoning showed partial understanding with an error in mathematical execution or application of the rule.',
    correct_principle: 'Check algebraic steps and SI unit substitutions.',
    recommended_concept_ids: targetConceptIds,
    confidence: 0.72,
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

    const userPrompt = `MEDHA Class 10 Physics Assessment Diagnostic:
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
    console.warn('Gemini API call failed, falling back to deterministic heuristic:', err);
    const fallback = runOfflineMisconceptionAnalysis(params);
    fallback.is_offline_fallback = true;
    return fallback;
  }
}

/**
 * Curated offline generated question bank by concept (C01 to C09)
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
      hint: 'Multiply 20 minutes by 60 to convert to seconds before multiplying by current.',
      selection_reason: 'Targeted to reinforce foundational charge-current definition (Q = I·t).',
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
      hint: 'Think about what would happen to circuit current if the meter had low resistance in parallel.',
      selection_reason: 'Selected because your telemetry indicated uncertainty regarding parallel meter behavior.',
      is_offline_fallback: true
    }
  ],
  C03: [
    {
      question_id: 'GEN_C03_D1',
      concept_id: 'C03',
      question: 'In a schematic circuit diagram, what standard component is represented by a zig-zag line, and what is its primary function?',
      question_type: 'multiple_choice',
      difficulty: 1,
      options: [
        'A resistor; to oppose or regulate the flow of current',
        'A battery; to generate new electric charges',
        'A closed plug key; to break the connection',
        'An ammeter; to measure potential difference'
      ],
      correct_answer: 'A resistor; to oppose or regulate the flow of current',
      explanation: 'A zig-zag line designates a fixed resistor, which provides opposition to current flow in a circuit.',
      reasoning_required: true,
      learning_objective: 'Identify standard circuit symbols and their functions.',
      hint: 'Recall standard NCERT schematic circuit symbols.',
      selection_reason: 'Reinforces standard circuit schematic literacy.',
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
      hint: "Use I = V/R and check the direct proportionality condition.",
      selection_reason: "Strengthens proportional reasoning under Ohm's Law.",
      is_offline_fallback: true
    }
  ],
  C05: [
    {
      question_id: 'GEN_C05_D2',
      concept_id: 'C05',
      question: 'A wire of given material having length l and area of cross-section A has a resistance of 4 Ω. What would be the resistance of another wire of the same material having length l/2 and area of cross-section 2A?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: ['1 Ω', '2 Ω', '8 Ω', '16 Ω'],
      correct_answer: '1 Ω',
      explanation: 'R1 = ρ·l/A = 4 Ω. R2 = ρ·(l/2)/(2A) = (1/4)·(ρ·l/A) = (1/4) × 4 Ω = 1 Ω.',
      reasoning_required: true,
      learning_objective: 'Apply R = ρ(L/A) across dimensional variations.',
      hint: 'Divide the length by 2 and multiply the area by 2 in the denominator.',
      selection_reason: 'Selected to test dimensional dependence of electrical resistance.',
      is_offline_fallback: true
    }
  ],
  C06: [
    {
      question_id: 'GEN_C06_D2',
      concept_id: 'C06',
      question: 'Three resistors of 5 Ω, 10 Ω, and 15 Ω are connected in series across a 30V battery. What is the potential difference across the 10 Ω resistor?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: ['10 V', '5 V', '15 V', '30 V'],
      correct_answer: '10 V',
      explanation: 'Rs = 5 + 10 + 15 = 30 Ω. Total current I = V / Rs = 30 V / 30 Ω = 1 A. Potential difference across the 10 Ω resistor is V10 = I × R = 1 A × 10 Ω = 10 V.',
      reasoning_required: true,
      learning_objective: 'Calculate voltage division in series circuits.',
      hint: 'Find total series resistance first, compute total current, then apply V = I·R to the 10 Ω resistor.',
      selection_reason: 'Targeted to build confidence in series circuit voltage division.',
      is_offline_fallback: true
    }
  ],
  C07: [
    {
      question_id: 'GEN_C07_D2',
      concept_id: 'C07',
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
      hint: 'Consider what would happen if turning off one bedroom lamp shut off your refrigerator.',
      selection_reason: 'Addresses common parallel circuit misconceptions.',
      is_offline_fallback: true
    }
  ],
  C08: [
    {
      question_id: 'GEN_C08_D2',
      concept_id: 'C08',
      question: 'An electric heater rated 1000 W operates on 220 V. What rating fuse should be installed in the circuit for safety?',
      question_type: 'multiple_choice',
      difficulty: 2,
      options: ['5 A', '2 A', '10 A', '1 A'],
      correct_answer: '5 A',
      explanation: 'Operating current I = P / V = 1000 W / 220 V ≈ 4.55 A. The nearest standard safety fuse rating greater than 4.55 A is 5 A.',
      reasoning_required: true,
      learning_objective: 'Calculate operational current and select appropriate fuse ratings.',
      hint: 'Compute operational current using I = P/V, then choose the smallest fuse rating above this current.',
      selection_reason: 'Practical application of Joule heating in household safety devices.',
      is_offline_fallback: true
    }
  ],
  C09: [
    {
      question_id: 'GEN_C09_D3',
      concept_id: 'C09',
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
      hint: 'Calculate resistance from rated values, then compare series power using P = I²R.',
      selection_reason: 'Challenging Level 3 question on series power dissipation.',
      is_offline_fallback: true
    }
  ]
};

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
    learning_objective: String(d.learning_objective || 'Test conceptual mastery of this principle.'),
    hint: d.hint ? String(d.hint) : undefined,
    selection_reason: d.selection_reason ? String(d.selection_reason) : undefined,
    is_offline_fallback: false
  };
}

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
