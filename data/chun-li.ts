import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'chun-li-001',
    name: 'chun-li-001',
    comboparts: '気功拳',
    videoUrl: 'https://www.streetfighter.com/6/character/chun-li/frame/special#Kikoken',
    order: 10,
  },
  {
    id: 'chun-li-002',
    name: 'chun-li-002',
    comboparts: '百裂脚',
    videoUrl: 'https://www.streetfighter.com/6/character/chun-li/frame/special#Hyakuretsukyaku',
    order: 20,
  },
];