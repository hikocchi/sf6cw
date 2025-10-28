import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'jamie-001',
    name: 'jamie-001',
    comboparts: '無影蹴',
    videoUrl: 'https://www.streetfighter.com/6/character/jamie/frame/special#Mueikyaku',
    order: 10,
  },
  {
    id: 'jamie-002',
    name: 'jamie-002',
    comboparts: '爆廻',
    videoUrl: 'https://www.streetfighter.com/6/character/jamie/frame/special#Bakkai',
    order: 20,
  },
];