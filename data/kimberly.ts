import type { ComboPart } from '../types';

export const kimberlyComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'kimberly-001',
    name: 'kimberly-001',
    comboparts: '疾駆け',
    videoUrl: 'https://www.streetfighter.com/6/character/kimberly/frame/special#Hayagake',
    order: 10,
  },
  {
    id: 'kimberly-002',
    name: 'kimberly-002',
    comboparts: '武神イズナ落とし',
    videoUrl: 'https://www.streetfighter.com/6/character/kimberly/frame/special#BushinIzunaOtoshi',
    order: 20,
  },
];
