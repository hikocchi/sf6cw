import type { ComboPart, Move } from '../types';

// このツールで利用可能なキャラクターのリスト
export const AVAILABLE_CHARACTERS = [
  'リュウ',
  'ケン',
  'ラシード',
  '豪鬼',
];

// URL短縮用のキャラクターIDマッピング
export const CHARACTER_ID_MAP: { [key: string]: string } = {
  'リュウ': 'ryu',
  'ケン': 'ken',
  'ラシード': 'rashid',
  '豪鬼': 'gouki',
};

// 短縮IDからキャラクター名を取得するための逆引きマップ
export const CHARACTER_NAME_MAP: { [key: string]: string } = Object.fromEntries(
  Object.entries(CHARACTER_ID_MAP).map(([name, id]) => [id, name])
);

/**
 * 要求されたキャラクターのコンボデータを動的にロードします。
 * @param character キャラクター名
 * @returns コンボパーツとサンプルコンボを含むオブジェクト
 */
export const fetchCharacterData = async (character: string): Promise<{
  comboParts: Omit<ComboPart, 'character'>[],
  sampleCombos: any[],
  moves: Move[],
}> => {
  const id = CHARACTER_ID_MAP[character];
  if (!id) {
    console.warn(`Unknown character requested: ${character}`);
    return { comboParts: [], sampleCombos: [], moves: [] };
  }

  try {
    let data: any;
    switch (id) {
      case 'ryu':
        data = await import('./ryu.ts');
        break;
      case 'ken':
        data = await import('./ken.ts');
        break;
      case 'rashid':
        data = await import('./rashid.ts');
        break;
      case 'gouki':
        data = await import('./gouki.ts');
        break;
      default:
        throw new Error(`Data file not configured for character id: ${id}`);
    }
    
    return {
      comboParts: data.comboParts || [],
      sampleCombos: data.sampleCombos || [],
      moves: data.moves || [],
    };
  } catch (error) {
    console.error(`Failed to load data for ${character} (${id}.ts)`, error);
    return { comboParts: [], sampleCombos: [], moves: [] };
  }
};
