import type { ComboPart } from '../types';

export const lukeComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'luke-001',
    name: 'luke-001',
    comboparts: 'サンドブラスト',
    videoUrl: 'https://www.streetfighter.com/6/character/luke/frame/special#SandBlast',
    order: 10,
  },
  {
    id: 'luke-002',
    name: 'luke-002',
    comboparts: 'ODフラッシュナックル',
    videoUrl: 'https://www.streetfighter.com/6/character/luke/frame/special#ODFlashKnuckle',
    order: 20,
  },
];
