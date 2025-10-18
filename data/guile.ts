import type { ComboPart } from '../index.tsx';

export const guileComboParts: ComboPart[] = [
  {
    id: 'guile-001',
    character: 'ガイル',
    name: 'guile-001',
    comboparts: 'ソニックブーム',
    videoUrl: 'https://www.streetfighter.com/6/character/guile/frame/special#SonicBoom',
    tags: ['starter', 'projectile'],
    order: 10,
  },
  {
    id: 'guile-002',
    character: 'ガイル',
    name: 'guile-002',
    comboparts: 'サマーソルトキック',
    videoUrl: 'https://www.streetfighter.com/6/character/guile/frame/special#SomersaultKick',
    tags: ['ender', 'anti-air'],
    order: 20,
  },
];