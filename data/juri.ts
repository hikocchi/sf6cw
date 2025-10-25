import type { ComboPart } from '../types';

export const juriComboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'juri-001',
    name: 'juri-001',
    comboparts: '歳破衝',
    videoUrl: 'https://www.streetfighter.com/6/character/juri/frame/special#Saihasho',
    order: 10,
  },
  {
    id: 'juri-002',
    name: 'juri-002',
    comboparts: '風破刃',
    videoUrl: 'https://www.streetfighter.com/6/character/juri/frame/special#Fuhajin',
    order: 20,
  },
];
