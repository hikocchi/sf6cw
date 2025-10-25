import type { ComboPart } from '../types';

export const zangiefComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'zangief-001',
    name: 'zangief-001',
    comboparts: 'スクリューパイルドライバー',
    videoUrl: 'https://www.streetfighter.com/6/character/zangief/frame/special#ScrewPiledriver',
    order: 10,
  },
  {
    id: 'zangief-002',
    name: 'zangief-002',
    comboparts: 'ダブルラリアット',
    videoUrl: 'https://www.streetfighter.com/6/character/zangief/frame/special#DoubleLariat',
    order: 20,
  },
];
