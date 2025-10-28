import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'deejay-001',
    name: 'deejay-001',
    comboparts: 'エアスラッシャー',
    videoUrl: 'https://www.streetfighter.com/6/character/deejay/frame/special#AirSlasher',
    order: 10,
  },
  {
    id: 'deejay-002',
    name: 'deejay-002',
    comboparts: 'ジャックナイフマキシマム',
    videoUrl: 'https://www.streetfighter.com/6/character/deejay/frame/special#JackknifeMaximum',
    order: 20,
  },
];