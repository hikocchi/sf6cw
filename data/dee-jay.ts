import type { ComboPart } from '../index.tsx';

export const deejayComboParts: ComboPart[] = [
  {
    id: 'deejay-001',
    character: 'ディージェイ',
    name: 'deejay-001',
    comboparts: 'エアスラッシャー',
    videoUrl: 'https://www.streetfighter.com/6/character/deejay/frame/special#AirSlasher',
    tags: ['starter', 'projectile'],
    order: 10,
  },
  {
    id: 'deejay-002',
    character: 'ディージェイ',
    name: 'deejay-002',
    comboparts: 'ジャックナイフマキシマム',
    videoUrl: 'https://www.streetfighter.com/6/character/deejay/frame/special#JackknifeMaximum',
    tags: ['ender', 'combo-filler'],
    order: 20,
  },
];