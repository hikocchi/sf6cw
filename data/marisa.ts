import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'marisa-001',
    name: 'marisa-001',
    comboparts: 'グラディウス',
    videoUrl: 'https://www.streetfighter.com/6/character/marisa/frame/special#Gladius',
    order: 10,
  },
  {
    id: 'marisa-002',
    name: 'marisa-002',
    comboparts: 'ファランクス',
    videoUrl: 'https://www.streetfighter.com/6/character/marisa/frame/special#Phalanx',
    order: 20,
  },
];