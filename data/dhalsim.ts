import type { ComboPart } from '../types';

export const dhalsimComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'dhalsim-001',
    name: 'dhalsim-001',
    comboparts: 'ヨガファイア',
    videoUrl: 'https://www.streetfighter.com/6/character/dhalsim/frame/special#YogaFire',
    order: 10,
  },
  {
    id: 'dhalsim-002',
    name: 'dhalsim-002',
    comboparts: 'ヨガテレポート',
    videoUrl: 'https://www.streetfighter.com/6/character/dhalsim/frame/special#YogaTeleport',
    order: 20,
  },
];
