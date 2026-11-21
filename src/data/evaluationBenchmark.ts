/**
 * MEDHA Diagnostic Evaluation Benchmark Dataset
 * 
 * Domain: CBSE Class 10 Physics · Chapter 12: Electricity (Concepts C01 to C09)
 * Specification: Standardized benchmark cases for evaluating automated AI & heuristic reasoning diagnosis.
 * 
 * NOTE: These benchmark examples are synthetic educational calibration cases designed
 * to systematically test diagnostic accuracy across conceptual misconceptions, calculation errors,
 * formula confusion, unit conversion errors, careless slips, and insufficient evidence.
 */

export interface BenchmarkCase {
  id: string;
  conceptId: string;
  category:
    | 'conceptual_misunderstanding'
    | 'calculation_error'
    | 'formula_recall_failure'
    | 'unit_conversion_error'
    | 'careless_mistake'
    | 'sound_understanding'
    | 'insufficient_evidence';
  questionPrompt: string;
  expectedAnswer: string;
  studentAnswer: string;
  studentReasoning: string;
  expectedIsCorrect: boolean;
  expectedMisconceptionCode?: string;
  expectedMisconceptionDetected: boolean;
  notes: string;
}

export const EVALUATION_BENCHMARK_DATASET: BenchmarkCase[] = [
  // ---------------------------------------------------------------------------
  // 1. CONCEPTUAL MISUNDERSTANDINGS (Misconception Detection)
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-01',
    conceptId: 'C01',
    category: 'conceptual_misunderstanding',
    questionPrompt: 'A current of 5 A flows through a circuit with two identical bulbs in series. How does the current through the second bulb compare to the first?',
    expectedAnswer: 'Equal to the first bulb',
    studentAnswer: 'Less than the first bulb',
    studentReasoning: 'The first bulb uses up the current to produce light and heat, so fewer electrons and less current flows into the second bulb.',
    expectedIsCorrect: false,
    expectedMisconceptionCode: 'CURRENT_VOLTAGE_CONFUSION',
    expectedMisconceptionDetected: true,
    notes: 'Classic charge consumption fallacy violating charge conservation.'
  },
  {
    id: 'BENCH-02',
    conceptId: 'C02',
    category: 'conceptual_misunderstanding',
    questionPrompt: 'Explain how potential difference relates to current in a closed metallic wire.',
    expectedAnswer: 'Potential difference provides the work done per unit charge that drives current.',
    studentAnswer: 'Voltage flows through the wire',
    studentReasoning: 'Voltage flows through the wire and pushes through the resistors, getting consumed as it travels.',
    expectedIsCorrect: false,
    expectedMisconceptionCode: 'CURRENT_VOLTAGE_CONFUSION',
    expectedMisconceptionDetected: true,
    notes: 'Confusing voltage (potential across two points) with flow of charge.'
  },
  {
    id: 'BENCH-03',
    conceptId: 'C05',
    category: 'conceptual_misunderstanding',
    questionPrompt: 'A cylindrical copper wire of length L and area A has resistance R and resistivity ρ. If it is cut into two equal halves, what is the resistivity of each half?',
    expectedAnswer: 'ρ (remains unchanged)',
    studentAnswer: 'ρ/2',
    studentReasoning: 'Because the wire is cut in half, its length is halved, so its resistivity changes and becomes half of what it was before.',
    expectedIsCorrect: false,
    expectedMisconceptionCode: 'RESISTIVITY_DIMENSIONAL_DEPENDENCE',
    expectedMisconceptionDetected: true,
    notes: 'Confusing intrinsic material resistivity with extrinsic geometric resistance.'
  },
  {
    id: 'BENCH-04',
    conceptId: 'C05',
    category: 'conceptual_misunderstanding',
    questionPrompt: 'A wire of resistance R is stretched to double its original length without changing its mass. What is its new resistance?',
    expectedAnswer: '4R',
    studentAnswer: '2R',
    studentReasoning: 'Resistance is proportional to length R = ρL/A. Since length doubles to 2L, resistance simply doubles to 2R because length only increased.',
    expectedIsCorrect: false,
    expectedMisconceptionCode: 'STRETCHED_WIRE_AREA_NEGLECT',
    expectedMisconceptionDetected: true,
    notes: 'Neglecting cross-sectional area halving due to volume conservation.'
  },
  {
    id: 'BENCH-05',
    conceptId: 'C06',
    category: 'conceptual_misunderstanding',
    questionPrompt: 'Two resistors of 10 Ω and 20 Ω are connected in series across a 6 V battery. Which resistor has greater current passing through it?',
    expectedAnswer: 'Both experience identical current',
    studentAnswer: '10 Ω resistor',
    studentReasoning: 'In a series circuit the first resistor gets more current because the current gets used up by the time it reaches the 20 ohm resistor.',
    expectedIsCorrect: false,
    expectedMisconceptionCode: 'SERIES_CURRENT_DECAY',
    expectedMisconceptionDetected: true,
    notes: 'Series current attenuation intuition.'
  },
  {
    id: 'BENCH-06',
    conceptId: 'C07',
    category: 'conceptual_misunderstanding',
    questionPrompt: 'A 10 Ω resistor is connected in parallel with a 1 Ω resistor. What can be said about the equivalent resistance?',
    expectedAnswer: 'Less than 1 Ω',
    studentAnswer: 'Greater than 10 Ω',
    studentReasoning: 'Adding resistors in parallel adds up to an increase in total resistance, so 10 + 1 = 11 ohms, which is greater.',
    expectedIsCorrect: false,
    expectedMisconceptionCode: 'PARALLEL_RESISTANCE_GREATER_FALLACY',
    expectedMisconceptionDetected: true,
    notes: 'Applying series summation intuition to parallel reciprocal combinations.'
  },

  // ---------------------------------------------------------------------------
  // 2. CALCULATION ERRORS (Sound physics concept, arithmetic failure)
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-07',
    conceptId: 'C01',
    category: 'calculation_error',
    questionPrompt: 'A current of 0.5 A flows for 10 seconds. Find the total charge.',
    expectedAnswer: '5 C',
    studentAnswer: '7 C',
    studentReasoning: 'We use the formula Q = I * t. Here I = 0.5 A and t = 10 s, so Q = 0.5 * 10 = 7 C due to an arithmetic slip in multiplication.',
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Correct formula and charge concept, but mechanical calculation error.'
  },
  {
    id: 'BENCH-08',
    conceptId: 'C04',
    category: 'calculation_error',
    questionPrompt: 'A resistor has 12 V across it and draws 3 A. What is its resistance?',
    expectedAnswer: '4 Ω',
    studentAnswer: '6 Ω',
    studentReasoning: "According to Ohm's law V = IR, so R = V / I. R = 12 / 3. I did a calculation error in division and wrote 6 instead of 4.",
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Sound Ohm law comprehension; arithmetic failure.'
  },
  {
    id: 'BENCH-09',
    conceptId: 'C06',
    category: 'calculation_error',
    questionPrompt: 'Calculate the total resistance of 4 Ω, 6 Ω, and 10 Ω connected in series.',
    expectedAnswer: '20 Ω',
    studentAnswer: '19 Ω',
    studentReasoning: 'For resistors in series, Rs = R1 + R2 + R3 = 4 + 6 + 10. Due to a math mistake in mental addition I wrote 19 ohms.',
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Series formula correctly stated; arithmetic addition error.'
  },

  // ---------------------------------------------------------------------------
  // 3. UNIT CONVERSION ERRORS
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-10',
    conceptId: 'C01',
    category: 'unit_conversion_error',
    questionPrompt: 'A current of 2 A flows for 5 minutes. Calculate charge Q.',
    expectedAnswer: '600 C',
    studentAnswer: '10 C',
    studentReasoning: 'I applied Q = I * t with current 2 A and time 5 minutes, so 2 * 5 = 10 C without converting minutes to seconds.',
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Omitted 60-second time conversion.'
  },
  {
    id: 'BENCH-11',
    conceptId: 'C01',
    category: 'unit_conversion_error',
    questionPrompt: 'A current of 1 A flows through a lamp for 20 minutes. What is the charge?',
    expectedAnswer: '1200 C',
    studentAnswer: '20 C',
    studentReasoning: 'Q = I * t = 1 * 20 = 20 C because I used 20 minute directly and forgot to convert to seconds.',
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Unit conversion oversight.'
  },

  // ---------------------------------------------------------------------------
  // 4. FORMULA RECALL FAILURES
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-12',
    conceptId: 'C04',
    category: 'formula_recall_failure',
    questionPrompt: 'Find the current flowing when 24 V is applied across an 8 Ω resistor.',
    expectedAnswer: '3 A',
    studentAnswer: '192 A',
    studentReasoning: "I applied the wrong formula I = V * R, so I = 24 * 8 = 192 A.",
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Inverted algebraic formula structure.'
  },
  {
    id: 'BENCH-13',
    conceptId: 'C02',
    category: 'formula_recall_failure',
    questionPrompt: 'Calculate potential difference when 100 J of work moves 5 C of charge.',
    expectedAnswer: '20 V',
    studentAnswer: '500 V',
    studentReasoning: 'I used the wrong formula V = W * Q, giving 100 * 5 = 500 V.',
    expectedIsCorrect: false,
    expectedMisconceptionDetected: false,
    notes: 'Recalled V = WQ instead of V = W/Q.'
  },

  // ---------------------------------------------------------------------------
  // 5. SOUND CONCEPTUAL UNDERSTANDING (True Positives for Mastery)
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-14',
    conceptId: 'C01',
    category: 'sound_understanding',
    questionPrompt: 'A current of 3 A flows for 4 seconds through a conductor. Calculate the charge passing through.',
    expectedAnswer: '12 C',
    studentAnswer: '12 C',
    studentReasoning: 'Electric current is the rate of flow of charge I = Q/t. Therefore Q = I * t = 3 A * 4 s = 12 Coulombs.',
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Flawless definition, algebra, and units.'
  },
  {
    id: 'BENCH-15',
    conceptId: 'C02',
    category: 'sound_understanding',
    questionPrompt: 'How much work is done in moving a charge of 2 C across two points having a potential difference of 12 V?',
    expectedAnswer: '24 J',
    studentAnswer: '24 J',
    studentReasoning: 'Potential difference is work done per unit charge V = W/Q. Rearranging gives W = V * Q = 12 V * 2 C = 24 Joules.',
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Rigorous application of potential difference definition.'
  },
  {
    id: 'BENCH-16',
    conceptId: 'C04',
    category: 'sound_understanding',
    questionPrompt: 'A conductor obeys Ohm’s law. If the voltage across it is tripled at constant temperature, what happens to current?',
    expectedAnswer: 'Triples',
    studentAnswer: 'Triples',
    studentReasoning: "By Ohm's law V = IR at constant temperature, potential difference is directly proportional to current (V ∝ I), so tripling V triples I.",
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Accurate proportionality and condition of constant temperature.'
  },
  {
    id: 'BENCH-17',
    conceptId: 'C06',
    category: 'sound_understanding',
    questionPrompt: 'Three 2 Ω resistors are connected in series. Find the equivalent resistance.',
    expectedAnswer: '6 Ω',
    studentAnswer: '6 Ω',
    studentReasoning: 'In a series circuit the equivalent resistance is the arithmetic sum Rs = R1 + R2 + R3 = 2 + 2 + 2 = 6 ohms.',
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Sound series derivation.'
  },
  {
    id: 'BENCH-18',
    conceptId: 'C07',
    category: 'sound_understanding',
    questionPrompt: 'Two 6 Ω resistors are connected in parallel. What is the equivalent resistance?',
    expectedAnswer: '3 Ω',
    studentAnswer: '3 Ω',
    studentReasoning: 'For parallel resistors, 1/Rp = 1/6 + 1/6 = 2/6 = 1/3, which means Rp = 3 ohms. Adding parallel branches lowers overall resistance.',
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Correct reciprocal calculation and conceptual physical intuition.'
  },

  // ---------------------------------------------------------------------------
  // 6. INSUFFICIENT EVIDENCE (Sub-5 characters or blank)
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-19',
    conceptId: 'C01',
    category: 'insufficient_evidence',
    questionPrompt: 'What is the SI unit of electric current?',
    expectedAnswer: 'Ampere',
    studentAnswer: 'Ampere',
    studentReasoning: 'yes',
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Correct option selected but reasoning text is insufficient (< 5 chars).'
  },
  {
    id: 'BENCH-20',
    conceptId: 'C04',
    category: 'insufficient_evidence',
    questionPrompt: 'Calculate resistance when V = 10 V and I = 2 A.',
    expectedAnswer: '5 Ω',
    studentAnswer: '5 Ω',
    studentReasoning: '',
    expectedIsCorrect: true,
    expectedMisconceptionDetected: false,
    notes: 'Empty reasoning.'
  },

  // ---------------------------------------------------------------------------
  // 7. CARELESS MISTAKE / LUCKY GUESS (Correct option but flawed reasoning)
  // ---------------------------------------------------------------------------
  {
    id: 'BENCH-21',
    conceptId: 'C06',
    category: 'careless_mistake',
    questionPrompt: 'Two identical lamps are in series. Which bulb is brighter?',
    expectedAnswer: 'Both bulbs have identical brightness',
    studentAnswer: 'Both bulbs have identical brightness',
    studentReasoning: 'Because the battery pushes current and the current gets used up equally by both bulbs at the exact same rate.',
    expectedIsCorrect: false, // Reasoning is conceptually flawed despite lucky answer
    expectedMisconceptionCode: 'CURRENT_VOLTAGE_CONFUSION',
    expectedMisconceptionDetected: true,
    notes: 'Accidental lucky answer option, but underlying explanation reveals current consumption misconception.'
  }
];
