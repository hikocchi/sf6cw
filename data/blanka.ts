import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'blanka-001',
    name: 'blanka-001',
    comboparts: 'ローリングアタック',
    videoUrl: 'https://www.streetfighter.com/6/character/blanka/frame/special#RollingAttack',
    order: 10,
  },
  {
    id: 'blanka-002',
    name: 'blanka-002',
    comboparts: 'エレクトリックサンダー',
    videoUrl: 'https://www.streetfighter.com/6/character/blanka/frame/special#ElectricThunder',
    order: 20,
  },
];