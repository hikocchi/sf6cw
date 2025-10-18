import type { ComboPart } from '../index.tsx';

export const blankaComboParts: ComboPart[] = [
  {
    id: 'blanka-001',
    character: 'ブランカ',
    name: 'blanka-001',
    comboparts: 'ローリングアタック',
    videoUrl: 'https://www.streetfighter.com/6/character/blanka/frame/special#RollingAttack',
    tags: ['starter', 'combo-filler'],
    order: 10,
  },
  {
    id: 'blanka-002',
    character: 'ブランカ',
    name: 'blanka-002',
    comboparts: 'エレクトリックサンダー',
    videoUrl: 'https://www.streetfighter.com/6/character/blanka/frame/special#ElectricThunder',
    tags: ['ender', 'special'],
    order: 20,
  },
];