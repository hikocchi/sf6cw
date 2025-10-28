import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'e-honda-001',
    name: 'e-honda-001',
    comboparts: '百裂張り手',
    videoUrl: 'https://www.streetfighter.com/6/character/e.honda/frame/special#HyakuretsuHarite',
    order: 10,
  },
  {
    id: 'e-honda-002',
    name: 'e-honda-002',
    comboparts: 'スーパー頭突き',
    videoUrl: 'https://www.streetfighter.com/6/character/e.honda/frame/special#SuperZutsuki',
    order: 20,
  },
];