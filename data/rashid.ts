import type { ComboPart } from '../index.tsx';

export const rashidComboParts: ComboPart[] = [
  {
    id: 'rashid-001',
    character: 'ラシード',
    name: 'rashid-001',
    comboparts: '弱 竜巻',
    videoUrl: 'https://www.streetfighter.com/6/character/rashid/frame/special#WhirlwindShot',
    tags: ['starter', 'projectile'],
    order: 10,
  },
  {
    id: 'rashid-002',
    character: 'ラシード',
    name: 'rashid-002',
    comboparts: 'イーグル・スパイク',
    videoUrl: 'https://www.streetfighter.com/6/character/rashid/frame/special#EagleSpike',
    tags: ['ender', 'combo-filler'],
    order: 20,
  },
  {
    id: 'rashid-003',
    character: 'ラシード',
    name: 'rashid-003',
    comboparts: 'ミキサー',
    videoUrl: 'https://www.streetfighter.com/6/character/rashid/frame/special#Mixer',
    tags: ['ender', 'anti-air'],
    order: 30,
  },
];