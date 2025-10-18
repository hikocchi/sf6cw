import type { ComboPart } from '../index.tsx';

export const cammyComboParts: ComboPart[] = [
  {
    id: 'cammy-001',
    character: 'キャミィ',
    name: 'cammy-001',
    comboparts: 'スパイラルアロー',
    videoUrl: 'https://www.streetfighter.com/6/character/cammy/frame/special#SpiralArrow',
    tags: ['starter', 'combo-filler'],
    order: 10,
  },
  {
    id: 'cammy-002',
    character: 'キャミィ',
    name: 'cammy-002',
    comboparts: 'キャノンスパイク',
    videoUrl: 'https://www.streetfighter.com/6/character/cammy/frame/special#CannonSpike',
    tags: ['ender', 'anti-air'],
    order: 20,
  },
];