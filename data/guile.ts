import type { ComboPart } from '../types';

export const guileComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'guile-001',
    name: 'guile-001',
    comboparts: 'ソニックブーム',
    videoUrl: 'https://www.streetfighter.com/6/character/guile/frame/special#SonicBoom',
    order: 10,
  },
  {
    id: 'guile-002',
    name: 'guile-002',
    comboparts: 'サマーソルトキック',
    videoUrl: 'https://www.streetfighter.com/6/character/guile/frame/special#SomersaultKick',
    order: 20,
  },
];
