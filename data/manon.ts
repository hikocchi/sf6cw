import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'manon-001',
    name: 'manon-001',
    comboparts: 'マネージュ・ドレ',
    videoUrl: 'https://www.streetfighter.com/6/character/manon/frame/special#ManegeDore',
    order: 10,
  },
  {
    id: 'manon-002',
    name: 'manon-002',
    comboparts: 'ランヴェルセ',
    videoUrl: 'https://www.streetfighter.com/6/character/manon/frame/special#Renverse',
    order: 20,
  },
];