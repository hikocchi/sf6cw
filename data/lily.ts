import type { ComboPart } from '../types';

export const lilyComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'lily-001',
    name: 'lily-001',
    comboparts: 'コンドルウィンド',
    videoUrl: 'https://www.streetfighter.com/6/character/lily/frame/special#CondorWind',
    order: 10,
  },
  {
    id: 'lily-002',
    name: 'lily-002',
    comboparts: 'コンドルスパイア',
    videoUrl: 'https://www.streetfighter.com/6/character/lily/frame/special#CondorSpire',
    order: 20,
  },
];
