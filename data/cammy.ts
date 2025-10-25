import type { ComboPart } from '../types';

export const cammyComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'cammy-001',
    name: 'cammy-001',
    comboparts: 'スパイラルアロー',
    videoUrl: 'https://www.streetfighter.com/6/character/cammy/frame/special#SpiralArrow',
    order: 10,
  },
  {
    id: 'cammy-002',
    name: 'cammy-002',
    comboparts: 'キャノンスパイク',
    videoUrl: 'https://www.streetfighter.com/6/character/cammy/frame/special#CannonSpike',
    order: 20,
  },
];
