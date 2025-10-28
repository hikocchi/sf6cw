import type { ComboPart } from '../types';

export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'jp-001',
    name: 'jp-001',
    comboparts: 'トリグラフ',
    videoUrl: 'https://www.streetfighter.com/6/character/jp/frame/special#Triglav',
    order: 10,
  },
  {
    id: 'jp-002',
    name: 'jp-002',
    comboparts: 'アブニマーチ',
    videoUrl: 'https://www.streetfighter.com/6/character/jp/frame/special#Amnesia',
    order: 20,
  },
];