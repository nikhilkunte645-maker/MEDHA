import { CohortStudent } from '@/types/mastery';

export const SAMPLE_COHORT: CohortStudent[] = [
  {
    id: 'STD-101',
    name: 'Aarav Sharma',
    avatarSeed: 'aarav',
    masteryMap: {
      C01: 36,
      C02: 34,
      C03: 65,
      C04: 45,
      C05: 50,
      C06: 58,
      C07: 30,
      C08: 55,
      C09: 40
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
      C06: 85,
      C07: 82,
      C08: 90,
      C09: 80
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
      C06: 60,
      C07: 42,
      C08: 62,
      C09: 55
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
      C06: 94,
      C07: 91,
      C08: 86,
      C09: 89
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
      C06: 52,
      C07: 28,
      C08: 50,
      C09: 35
    },
    recentMisconception: {
      code: 'PARALLEL_RESISTANCE_GREATER_FALLACY',
      title: 'Parallel combination increases total resistance',
      conceptId: 'C07',
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
      C06: 74,
      C07: 65,
      C08: 80,
      C09: 71
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
      C06: 40,
      C07: 22,
      C08: 40,
      C09: 25
    },
    recentMisconception: {
      code: 'CURRENT_CONSUMPTION',
      title: 'Current is consumed across loads',
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
      C06: 78,
      C07: 72,
      C08: 72,
      C09: 66
    },
    lastActive: '3 hours ago'
  }
];
