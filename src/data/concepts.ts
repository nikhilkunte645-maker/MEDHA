import { Concept } from '@/types/mastery';

export const CONCEPTS: Concept[] = [
  {
    id: 'C01',
    code: 'C01',
    name: 'Electric Charge & Electric Current',
    description: 'Fundamentals of quantization of charge, drift of electrons, rate of flow of charge (I = Q/t), and measurement using ammeters.',
    learningObjectives: [
      'Define electric charge (Q) and its SI unit (Coulomb).',
      'Define electric current as rate of flow of charge: I = Q/t.',
      'Differentiate between conventional current direction and electronic flow direction.',
      'Understand how ammeters measure current in series.'
    ],
    prerequisiteIds: [],
    difficulty: 1,
    formulas: [
      { latex: 'I = \\frac{Q}{t}', description: 'Current equals electric charge divided by time' },
      { latex: 'Q = n \\cdot e', description: 'Quantization of charge (e = 1.6 × 10⁻¹⁹ C)' }
    ],
    commonMisconceptions: [
      {
        code: 'CURRENT_CONSUMPTION',
        title: 'Current is consumed or used up by circuit loads',
        description: 'Believing that current leaves the source at high magnitude and gets diminished as it passes through light bulbs.',
        correction: 'Charge is conserved. The rate of charge flowing into a component equals the rate flowing out. Energy is delivered, not the physical electrons.'
      },
      {
        code: 'CURRENT_VOLTAGE_CONFUSION',
        title: 'Confusing current with voltage',
        description: 'Treating current as the push or pressure, or claiming current causes itself without a potential difference.',
        correction: 'Potential difference (voltage) is the electrical pressure or energy per charge; electric current is the resulting rate of charge flow.'
      }
    ]
  },
  {
    id: 'C02',
    code: 'C02',
    name: 'Electric Potential Difference',
    description: 'Work done per unit charge moving between two points (V = W/Q), role of electrochemical cells, and voltmeter connection in parallel.',
    learningObjectives: [
      'Define potential difference (V) as work done per unit charge: V = W/Q.',
      'Define 1 Volt (1 Joule per 1 Coulomb).',
      'Explain why a continuous closed circuit requires an external energy source to sustain potential difference.',
      'State why a voltmeter has high resistance and connects in parallel across components.'
    ],
    prerequisiteIds: ['C01'],
    difficulty: 2,
    formulas: [
      { latex: 'V = \\frac{W}{Q}', description: 'Potential difference = Work done / Charge' },
      { latex: '1\\text{ V} = 1\\text{ J}/1\\text{ C}', description: 'Definition of 1 Volt' }
    ],
    commonMisconceptions: [
      {
        code: 'VOLTAGE_FLOWS',
        title: 'Believing voltage flows through a wire',
        description: 'Describing voltage as something that travels through a conductor, similar to current.',
        correction: 'Voltage does not flow; voltage exists across two distinct points as a difference in electrical potential. Current flows through.'
      },
      {
        code: 'VOLTMETER_SERIES_PLACEMENT',
        title: 'Placing voltmeter in series',
        description: 'Attempting to measure potential difference by inserting a high-resistance voltmeter in series with the load.',
        correction: 'Voltmeter must be connected in parallel across the two points between which potential difference is to be determined.'
      }
    ]
  },
  {
    id: 'C03',
    code: 'C03',
    name: 'Electric Circuits & Circuit Symbols',
    description: 'Continuous and closed conductive paths, schematic representations of cells, batteries, switches, resistors, rheostats, and meters.',
    learningObjectives: [
      'Identify and draw standardized schematic symbols for electrical components.',
      'Distinguish between open, closed, and short circuits.',
      'Identify proper meter connections: ammeter in series, voltmeter in parallel.'
    ],
    prerequisiteIds: ['C01', 'C02'],
    difficulty: 1,
    formulas: [],
    commonMisconceptions: [
      {
        code: 'CIRCUIT_CONTINUITY_MISUNDERSTANDING',
        title: 'Open switch retains partial current flow',
        description: 'Believing that electricity travels halfway through a wire even when a key/switch is open.',
        correction: 'In steady state, electric current requires a continuous complete closed loop. An open switch drops current to zero throughout.'
      }
    ]
  },
  {
    id: 'C04',
    code: 'C04',
    name: "Ohm's Law",
    description: 'Linear relationship between current and potential difference across a metallic conductor at constant temperature: V ∝ I (V = IR).',
    learningObjectives: [
      'State Ohm’s law and specify the mandatory condition (constant temperature).',
      'Express Ohm’s law mathematically: V = IR.',
      'Interpret V-I characteristics graphs and calculate resistance from gradient.'
    ],
    prerequisiteIds: ['C01', 'C02', 'C03'],
    difficulty: 2,
    formulas: [
      { latex: 'V = I \\cdot R', description: "Ohm's Law relationship" },
      { latex: 'R = \\frac{V}{I}', description: 'Resistance as ratio of V to I' }
    ],
    commonMisconceptions: [
      {
        code: 'TEMPERATURE_INDEPENDENCE_FALLACY',
        title: "Applying Ohm's law without temperature constancy",
        description: 'Assuming V/I remains strictly constant even when conductor heats up significantly.',
        correction: "Ohm's law holds true only if physical conditions such as temperature remain constant. Filament lamps deviate because resistance rises with heat."
      },
      {
        code: 'V_I_GRAPH_AXIS_CONFUSION',
        title: 'Inverting slope on I-V vs V-I graphs',
        description: 'Taking the slope of an I vs V graph directly as R instead of 1/R.',
        correction: 'For a V (y-axis) vs I (x-axis) graph, slope is R. For an I (y-axis) vs V (x-axis) graph, slope is 1/R (conductance).'
      }
    ]
  },
  {
    id: 'C05',
    code: 'C05',
    name: 'Resistance & Factors Affecting Resistance',
    description: 'Opposition to charge flow. Dependence on conductor length, cross-sectional area, material resistivity (ρ), and temperature.',
    learningObjectives: [
      'State the factors affecting conductor resistance: R ∝ L and R ∝ 1/A.',
      'Apply the formula R = ρ(L/A) to calculate resistance and resistivity.',
      'Understand resistivity (ρ) as an intrinsic material property independent of dimensions.',
      'Analyze wire stretching/compressing problems preserving volume.'
    ],
    prerequisiteIds: ['C04'],
    difficulty: 2,
    formulas: [
      { latex: 'R = \\rho \\frac{L}{A}', description: 'Resistance in terms of resistivity, length, and area' },
      { latex: 'A = \\pi r^2 = \\frac{\\pi d^2}{4}', description: 'Cross-sectional area for circular wires' }
    ],
    commonMisconceptions: [
      {
        code: 'RESISTIVITY_DIMENSIONAL_DEPENDENCE',
        title: 'Believing resistivity changes when wire is cut or stretched',
        description: 'Confusing resistance (extrinsic) with resistivity (intrinsic material property).',
        correction: 'Resistivity (ρ) depends solely on material and temperature. Cutting or stretching changes dimensions (R changes), but ρ remains identical.'
      },
      {
        code: 'STRETCHED_WIRE_AREA_NEGLECT',
        title: 'Neglecting area reduction when wire is elongated',
        description: 'Assuming only length doubles when a wire is stretched, neglecting that area halves because volume remains constant.',
        correction: 'When length doubles under stretching, volume V = A·L is conserved, so area halves. Hence resistance quadruples (2L / (A/2) = 4R).'
      }
    ]
  },
  {
    id: 'C06',
    code: 'C06',
    name: 'Series & Parallel Combinations of Resistors',
    description: 'Equivalent resistance, branch currents, voltage division in series, current division in parallel, and domestic wiring advantages.',
    learningObjectives: [
      'Derive and calculate equivalent resistance for series: Rs = R1 + R2 + ...',
      'Derive and calculate equivalent resistance for parallel: 1/Rp = 1/R1 + 1/R2 + ...',
      'Recognize that current is constant across series components and voltage is split.',
      'Recognize that voltage is constant across parallel branches and current is split.',
      'Explain advantages of parallel connection in household electrical circuits.'
    ],
    prerequisiteIds: ['C04', 'C05'],
    difficulty: 3,
    formulas: [
      { latex: 'R_s = R_1 + R_2 + R_3', description: 'Equivalent resistance in series' },
      { latex: '\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}', description: 'Equivalent resistance in parallel' },
      { latex: 'R_p = \\frac{R_1 R_2}{R_1 + R_2}', description: 'Parallel equivalent for two resistors' }
    ],
    commonMisconceptions: [
      {
        code: 'PARALLEL_RESISTANCE_GREATER_FALLACY',
        title: 'Believing adding resistors in parallel increases total resistance',
        description: 'Assuming adding any resistor must add to the total opposition.',
        correction: 'Adding resistors in parallel adds new conductive pathways, reducing the overall equivalent resistance below the smallest individual resistor.'
      },
      {
        code: 'SERIES_CURRENT_DECAY',
        title: 'Current decreases progressively across successive series resistors',
        description: 'Thinking the first resistor in series receives more current than the second resistor.',
        correction: 'There is only a single loop in series. Current is strictly identical at every point in a series circuit.'
      }
    ]
  },
  {
    id: 'C07',
    code: 'C07',
    name: 'Heating Effect of Electric Current',
    description: "Joule's law of heating (H = I²Rt), conversion of electrical energy into thermal energy, electrical fuses, and heating appliances.",
    learningObjectives: [
      "State Joule's law of heating: H = I²Rt.",
      'Relate heat generated to potential difference and current: H = VIt = (V²/R)t.',
      'Explain practical applications (electric iron, toaster, electric kettle).',
      'Explain the working principle and safety specifications of an electric fuse.'
    ],
    prerequisiteIds: ['C04', 'C06'],
    difficulty: 2,
    formulas: [
      { latex: 'H = I^2 R t', description: "Joule's Law of heating" },
      { latex: 'H = V I t = \\frac{V^2}{R} t', description: 'Alternative heat formulations using Ohm’s Law' }
    ],
    commonMisconceptions: [
      {
        code: 'HEATING_CURRENT_LINEARITY_FALLACY',
        title: 'Assuming heat produced is directly proportional to current',
        description: 'Forgetting that heat depends on current squared (I²), so doubling current quadruples heat.',
        correction: 'By Joule’s law H = I²Rt, doubling current while keeping resistance and time constant multiplies heat produced by a factor of 4.'
      },
      {
        code: 'FUSE_HIGH_MELTING_POINT_MYTH',
        title: 'Believing fuse wire should have a high melting point',
        description: 'Thinking safety wires must be durable enough to withstand excessive heat without melting.',
        correction: 'A fuse must have an appropriately low melting point so it breaks the circuit before excess current damages home appliances.'
      }
    ]
  },
  {
    id: 'C08',
    code: 'C08',
    name: 'Electric Power & Electrical Energy',
    description: 'Rate of electrical energy consumption (P = VI = I²R = V²/R), commercial unit kilowatt-hour (kWh), and calculating household electricity bills.',
    learningObjectives: [
      'Define electric power and its SI unit (Watt).',
      'Apply power expressions: P = VI, P = I²R, and P = V²/R depending on context.',
      'Distinguish between SI unit (Joule) and commercial unit (kilowatt-hour, kWh).',
      'Convert 1 kWh into Joules: 1 kWh = 3.6 × 10⁶ J.',
      'Calculate electrical energy consumption and electricity costs.'
    ],
    prerequisiteIds: ['C04', 'C06', 'C07'],
    difficulty: 3,
    formulas: [
      { latex: 'P = V \\cdot I = I^2 R = \\frac{V^2}{R}', description: 'Electric power expressions' },
      { latex: 'E = P \\cdot t', description: 'Electrical energy consumed' },
      { latex: '1\\text{ kWh} = 3.6 \\times 10^6\\text{ J}', description: 'Commercial unit of electrical energy' }
    ],
    commonMisconceptions: [
      {
        code: 'POWER_FORMULA_MISAPPLICATION',
        title: 'Using P = I²R for parallel devices across constant voltage',
        description: 'Concluding higher resistance consumes more power in parallel household circuits.',
        correction: 'Household appliances operate at constant voltage (220V in India). Therefore P = V²/R applies; lower resistance draws higher power.'
      },
      {
        code: 'KILOWATT_HOUR_POWER_CONFUSION',
        title: 'Treating kWh as a unit of power rather than energy',
        description: 'Confusing kilowatt (power) with kilowatt-hour (energy).',
        correction: 'Kilowatt (kW) is power (rate of energy); kilowatt-hour (kWh = power × time) is a unit of total energy consumed.'
      }
    ]
  }
];

export const CONCEPT_MAP = new Map<string, Concept>(
  CONCEPTS.map((concept) => [concept.id, concept])
);
