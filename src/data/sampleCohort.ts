import { CohortStudent } from '@/types/mastery';

export const SAMPLE_COHORT: CohortStudent[] = [
  {
    id: 'STD-101',
    name: 'Aarav Sharma',
    avatarSeed: 'aarav',
    masteryMap: {
      C01: 42,
      C02: 38,
      C03: 65,
      C04: 45,
      C05: 50,
      C06: 30,
      C07: 55,
      C08: 40
    },
    recentMisconception: {
      code: 'CURRENT_VOLTAGE_CONFUSION',
      title: 'Confusing current with voltage',
      conceptId: 'C01',
      timestamp: '2026-11-20T10:15:00Z'
    },
    lastActive: '2 hours ago'
  },
  {
    id: 'STD-102',
    name: 'Diya Patel',
    avatarSeed: 'diya',
    masteryMap: {
      C01: 88,
      C02: 84,
      C03: 92,
      C04: 86,
      C05: 78,
      C06: 82,
      C07: 90,
      C08: 75
    },
    lastActive: '30 mins ago'
  },
  {
    id: 'STD-103',
    name: 'Rohan Verma',
    avatarSeed: 'rohan',
    masteryMap: {
      C01: 72,
      C02: 68,
      C03: 75,
      C04: 64,
      C05: 35,
      C06: 40,
      C07: 62,
      C08: 58
    },
    recentMisconception: {
      code: 'RESISTIVITY_DIMENSIONAL_DEPENDENCE',
      title: 'Resistivity changes when wire is cut',
      conceptId: 'C05',
      timestamp: '2026-11-21T09:00:00Z'
    },
    lastActive: '1 hour ago'
  },
  {
    id: 'STD-104',
    name: 'Ananya Iyer',
    avatarSeed: 'ananya',
    masteryMap: {
      C01: 94,
      C02: 90,
      C03: 95,
      C04: 92,
      C05: 88,
      C06: 91,
      C07: 85,
      C08: 89
    },
    lastActive: '5 mins ago'
  },
  {
    id: 'STD-105',
    name: 'Kabir Das',
    avatarSeed: 'kabir',
    masteryMap: {
      C01: 58,
      C02: 52,
      C03: 60,
      C04: 48,
      C05: 44,
      C06: 28,
      C07: 50,
      C08: 35
    },
    recentMisconception: {
      code: 'PARALLEL_RESISTANCE_GREATER_FALLACY',
      title: 'Parallel combination increases total resistance',
      conceptId: 'C06',
      timestamp: '2026-11-20T16:45:00Z'
    },
    lastActive: 'Yesterday'
  },
  {
    id: 'STD-106',
    name: 'Meera Nair',
    avatarSeed: 'meera',
    masteryMap: {
      C01: 76,
      C02: 70,
      C03: 82,
      C04: 78,
      C05: 72,
      C06: 65,
      C07: 80,
      C08: 71
    },
    lastActive: '4 hours ago'
  },
  {
    id: 'STD-107',
    name: 'Aditya Rao',
    avatarSeed: 'aditya',
    masteryMap: {
      C01: 34,
      C02: 30,
      C03: 45,
      C04: 38,
      C05: 32,
      C06: 22,
      C07: 40,
      C08: 25
    },
    recentMisconception: {
      code: 'CURRENT_CONSUMPTION',
      title: 'Current is consumed across resistors',
      conceptId: 'C01',
      timestamp: '2026-11-21T11:20:00Z'
    },
    lastActive: '15 mins ago'
  },
  {
    id: 'STD-108',
    name: 'Pooja Reddy',
    avatarSeed: 'pooja',
    masteryMap: {
      C01: 82,
      C02: 76,
      C03: 88,
      C04: 80,
      C05: 68,
      C06: 74,
      C07: 72,
      C08: 66
    },
    lastActive: '3 hours ago'
  }
];
