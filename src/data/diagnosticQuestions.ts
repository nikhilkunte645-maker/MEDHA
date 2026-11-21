import { Question } from '@/types/mastery';

export const DIAGNOSTIC_QUESTIONS: Question[] = [
  {
    id: 'DQ01',
    conceptIds: ['C01'],
    prompt: 'A steady electric current of 0.5 A flows through a filament of an electric bulb for 10 minutes. Calculate the total electric charge that passes through the circuit.',
    options: [
      '5 Coulombs',
      '30 Coulombs',
      '300 Coulombs',
      '600 Coulombs'
    ],
    correctAnswer: '300 Coulombs',
    explanation: 'Using Q = I × t. Time must be converted to SI units (seconds): t = 10 min × 60 s = 600 s. Q = 0.5 A × 600 s = 300 C.',
    difficulty: 1,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: 'Apply Q = I × t with SI unit conversions.',
    hint: 'Remember that the SI unit of time in I = Q/t is seconds, not minutes.',
    isDiagnostic: true
  },
  {
    id: 'DQ02',
    conceptIds: ['C01', 'C02'],
    prompt: 'Two copper wires connect a 6V battery to an electric lamp. A student claims: "Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return to the battery." How do you evaluate this statement?',
    options: [
      'The statement is correct; energy is lost so current decreases.',
      'The statement is false; voltage is the push and electric charge is strictly conserved.',
      'The statement is false; voltage increases across the lamp to keep current constant.',
      'The statement is correct; electrons are converted into light energy.'
    ],
    correctAnswer: 'The statement is false; voltage is the push and electric charge is strictly conserved.',
    explanation: 'Potential difference (voltage) provides the electrical energy/push per unit charge, while current is the rate of flow of charge. Charges are conserved and never "used up" — the energy carried by charges is transferred to thermal and light energy.',
    difficulty: 2,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: 'Differentiate between electric current and potential difference and apply charge conservation.',
    hint: 'Distinguish between the carrier of energy (electrons) and the energy they transfer.',
    isDiagnostic: true
  },
  {
    id: 'DQ03',
    conceptIds: ['C02'],
    prompt: 'How much work is done in moving a charge of 4 Coulombs across two points having an electric potential difference of 12 Volts?',
    options: [
      '3 Joules',
      '16 Joules',
      '48 Joules',
      '96 Joules'
    ],
    correctAnswer: '48 Joules',
    explanation: 'By definition of potential difference, V = W / Q. Therefore Work W = V × Q = 12 V × 4 C = 48 Joules.',
    difficulty: 1,
    type: 'multiple_choice',
    reasoningRequired: false,
    learningObjective: 'Calculate work done using V = W / Q.',
    isDiagnostic: true
  },
  {
    id: 'DQ04',
    conceptIds: ['C03'],
    prompt: 'Which diagram configuration correctly measures the current through resistor R and the potential difference across resistor R?',
    options: [
      'Ammeter in series with R; Voltmeter in parallel across R',
      'Ammeter in parallel across R; Voltmeter in series with R',
      'Both Ammeter and Voltmeter in series with R',
      'Both Ammeter and Voltmeter in parallel across R'
    ],
    correctAnswer: 'Ammeter in series with R; Voltmeter in parallel across R',
    explanation: 'An ammeter has very low resistance and must be connected in series so all current flows through it. A voltmeter has very high resistance and must be connected in parallel across the two points to measure potential difference without drawing significant current.',
    difficulty: 1,
    type: 'multiple_choice',
    reasoningRequired: false,
    learningObjective: 'Identify proper circuit connections for measuring instruments.',
    isDiagnostic: true
  },
  {
    id: 'DQ05',
    conceptIds: ['C04'],
    prompt: "According to Ohm's Law, under what strict physical condition is the current flowing through a metallic conductor directly proportional to the potential difference applied across its ends?",
    options: [
      'As long as the circuit is closed',
      'Provided temperature and other physical conditions remain constant',
      'Provided an AC source is connected',
      'Only when current exceeds 10 Amperes'
    ],
    correctAnswer: 'Provided temperature and other physical conditions remain constant',
    explanation: "Ohm's Law states V ∝ I only when physical conditions, particularly temperature, remain constant. If temperature rises, metallic resistance increases and the linear V-I relationship breaks down.",
    difficulty: 2,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: "State and justify the physical constraints of Ohm's Law.",
    hint: 'What happens to the internal atomic vibrations of a metal conductor when it gets hot?',
    isDiagnostic: true
  },
  {
    id: 'DQ06',
    conceptIds: ['C05'],
    prompt: 'A cylindrical copper wire of length L and cross-sectional area A has resistance R. If it is stretched uniformly so that its length becomes 2L, what will be its new electrical resistance?',
    options: [
      '2R',
      '4R',
      'R / 2',
      '8R'
    ],
    correctAnswer: '4R',
    explanation: 'When a wire is stretched without adding material, its total volume V = A × L is conserved. If length doubles to 2L, the area must halve to A/2. New resistance R′ = ρ(2L / (A/2)) = 4 · ρ(L/A) = 4R.',
    difficulty: 3,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: 'Calculate resistance changes under volume conservation constraints.',
    hint: 'Consider what must happen to the wire thickness (cross-sectional area) when its length is doubled.',
    isDiagnostic: true
  },
  {
    id: 'DQ07',
    conceptIds: ['C05'],
    prompt: 'A thick copper wire and a thin copper wire of the same length are maintained at the same room temperature. Which wire has higher electrical resistivity?',
    options: [
      'The thin wire, because it has higher resistance.',
      'The thick wire, because it carries more current.',
      'Both wires have identical resistivity because they are made of the same material at the same temperature.',
      'Neither, resistivity depends strictly on applied voltage.'
    ],
    correctAnswer: 'Both wires have identical resistivity because they are made of the same material at the same temperature.',
    explanation: 'Resistivity (ρ) is an intrinsic property of the material and does not depend on length, cross-sectional area, or applied voltage. While the thin wire has higher resistance (R), its resistivity is identical to that of the thick wire.',
    difficulty: 2,
    type: 'multiple_choice',
    reasoningRequired: false,
    learningObjective: 'Differentiate between extrinsic resistance and intrinsic resistivity.',
    isDiagnostic: true
  },
  {
    id: 'DQ08',
    conceptIds: ['C06'],
    prompt: 'Two resistors of 4 Ω and 6 Ω are connected in series with a 12V battery. How does the electric current flowing through the 4 Ω resistor compare to the current flowing through the 6 Ω resistor?',
    options: [
      'Current is higher in the 4 Ω resistor because it has lower opposition.',
      'Current is higher in the 6 Ω resistor because it requires more energy.',
      'Current is strictly identical in both resistors because in a series circuit there is only one conductive path.',
      'Current is zero in the 6 Ω resistor because the 4 Ω resistor uses it all up.'
    ],
    correctAnswer: 'Current is strictly identical in both resistors because in a series circuit there is only one conductive path.',
    explanation: 'In a series circuit, there are no branching points. Conservation of charge dictates that the rate of charge flow (current) must be identical through every series component.',
    difficulty: 2,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: 'Apply charge conservation to series resistor combinations.',
    hint: 'Remember there is only a single unbroken pathway in series.',
    isDiagnostic: true
  },
  {
    id: 'DQ09',
    conceptIds: ['C07'],
    prompt: 'Three resistors of 2 Ω, 3 Ω, and 6 Ω are connected in parallel across a 6V supply. What is the equivalent resistance of this parallel combination?',
    options: [
      '11 Ω',
      '1 Ω',
      '0.5 Ω',
      '2 Ω'
    ],
    correctAnswer: '1 Ω',
    explanation: '1/Rp = 1/2 + 1/3 + 1/6 = (3 + 2 + 1) / 6 = 6/6 = 1. Therefore Rp = 1 Ω. Equivalent resistance in parallel is always strictly less than the smallest individual resistor (1 Ω < 2 Ω).',
    difficulty: 2,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: 'Calculate equivalent resistance for parallel combinations.',
    hint: 'Use the reciprocal formula 1/Rp = 1/R1 + 1/R2 + 1/R3.',
    isDiagnostic: true
  },
  {
    id: 'DQ10',
    conceptIds: ['C08'],
    prompt: "If the electric current flowing through a fixed heating resistor is doubled while keeping its resistance and time constant, by what factor does the heat generated change according to Joule's law of heating?",
    options: [
      'Heat produced doubles (2×)',
      'Heat produced quadruples (4×)',
      'Heat produced remains the same',
      'Heat produced increases eightfold (8×)'
    ],
    correctAnswer: 'Heat produced quadruples (4×)',
    explanation: "Joule's law states H = I²Rt. Since H is directly proportional to the square of current (I²), doubling current (2I)² produces 4I²Rt, meaning the heat generated increases fourfold.",
    difficulty: 2,
    type: 'multiple_choice',
    reasoningRequired: false,
    learningObjective: "Apply Joule's law of heating H = I²Rt.",
    isDiagnostic: true
  },
  {
    id: 'DQ11',
    conceptIds: ['C09'],
    prompt: 'An electric refrigerator rated 400 W operates 8 hours per day. What is the total cost of electrical energy to operate it for 30 days at ₹ 5.00 per kilowatt-hour (kWh)?',
    options: [
      '₹ 480',
      '₹ 240',
      '₹ 96',
      '₹ 600'
    ],
    correctAnswer: '₹ 480',
    explanation: 'Total energy in kWh = Power (kW) × Time (hours) = (400 W / 1000) kW × (8 hours/day × 30 days) = 0.4 kW × 240 h = 96 kWh. Cost = 96 kWh × ₹ 5 = ₹ 480.',
    difficulty: 3,
    type: 'reasoning',
    reasoningRequired: true,
    learningObjective: 'Calculate commercial electrical energy consumption and billing in kWh.',
    hint: 'Convert watts to kilowatts first before calculating total kilowatt-hours.',
    isDiagnostic: true
  }
];
