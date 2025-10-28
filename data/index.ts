import type { ComboPart, SpecialMove, UniqueMove } from '../types';

// このツールで利用可能なキャラクターのリスト
export const AVAILABLE_CHARACTERS = [
  'リュウ',
  'ケン',
  'ラシード',
];

// URL短縮用のキャラクターIDマッピング
export const CHARACTER_ID_MAP: { [key: string]: string } = {
  'リュウ': 'ryu',
  'ケン': 'ken',
  'ラシード': 'rashid',
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
  specialMoves: SpecialMove[],
  uniqueMoves: UniqueMove[]
}> => {
  const id = CHARACTER_ID_MAP[character];
  if (!id) {
    // 未知のキャラクターが要求された場合は空を返す
    console.warn(`Unknown character requested: ${character}`);
    return { comboParts: [], sampleCombos: [], specialMoves: [], uniqueMoves: [] };
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
      default:
        throw new Error(`Data file not configured for character id: ${id}`);
    }

    return {
      comboParts: data.comboParts || [],
      sampleCombos: data.sampleCombos || [],
      specialMoves: data.specialMoves || [],
      uniqueMoves: data.uniqueMoves || [],
    };
  } catch (error) {
    console.error(`Failed to load data for ${character} (${id}.ts)`, error);
    // エラーが発生した場合も空を返す
    return { comboParts: [], sampleCombos: [], specialMoves: [], uniqueMoves: [] };
  }
};