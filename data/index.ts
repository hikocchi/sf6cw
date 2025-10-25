import type { ComboPart, SpecialMove, UniqueMove } from '../types';

// このツールで利用可能なキャラクターのリスト
export const AVAILABLE_CHARACTERS = [
  'リュウ','ケン','ラシード'
];

// URL短縮用のキャラクターIDマッピング
export const CHARACTER_ID_MAP: { [key: string]: string } = {
  'リュウ': 'ryu',
  'ケン': 'ken',
  'ラシード': 'rashid',
  // 他のキャラクターもここに追加
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
export const fetchCharacterData = async (character: string) => {
  switch (character) {
    case 'リュウ': {
      const { ryuComboParts, ryuSampleCombos, ryuSpecialMoves, ryuUniqueMoves } = await import('./ryu.ts');
      return { comboParts: ryuComboParts, sampleCombos: ryuSampleCombos, specialMoves: ryuSpecialMoves, uniqueMoves: ryuUniqueMoves };
    }
    case 'ケン': {
      const { kenComboParts, kenSampleCombos, kenSpecialMoves, kenUniqueMoves } = await import('./ken.ts');
      return { comboParts: kenComboParts, sampleCombos: kenSampleCombos, specialMoves: kenSpecialMoves, uniqueMoves: kenUniqueMoves };
    }
    case 'ルーク': {
      const { lukeComboParts } = await import('./luke.ts');
      return { comboParts: lukeComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ジェイミー': {
      const { jamieComboParts } = await import('./jamie.ts');
      return { comboParts: jamieComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'マノン': {
      const { manonComboParts } = await import('./manon.ts');
      return { comboParts: manonComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'キンバリー': {
      const { kimberlyComboParts } = await import('./kimberly.ts');
      return { comboParts: kimberlyComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'マリーザ': {
      const { marisaComboParts } = await import('./marisa.ts');
      return { comboParts: marisaComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'リリー': {
      const { lilyComboParts } = await import('./lily.ts');
      return { comboParts: lilyComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'JP': {
      const { jpComboParts } = await import('./jp.ts');
      return { comboParts: jpComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case '春麗': {
      const { chunliComboParts } = await import('./chun-li.ts');
      return { comboParts: chunliComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ガイル': {
      const { guileComboParts } = await import('./guile.ts');
      return { comboParts: guileComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ブランカ': {
      const { blankaComboParts } = await import('./blanka.ts');
      return { comboParts: blankaComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ダルシム': {
      const { dhalsimComboParts } = await import('./dhalsim.ts');
      return { comboParts: dhalsimComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'エドモンド本田': {
      const { ehondaComboParts } = await import('./e-honda.ts');
      return { comboParts: ehondaComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ジュリ': {
      const { juriComboParts } = await import('./juri.ts');
      return { comboParts: juriComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ディージェイ': {
      const { deejayComboParts } = await import('./dee-jay.ts');
      return { comboParts: deejayComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'キャミィ': {
      const { cammyComboParts } = await import('./cammy.ts');
      return { comboParts: cammyComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ザンギエフ': {
      const { zangiefComboParts } = await import('./zangief.ts');
      return { comboParts: zangiefComboParts, sampleCombos: [], specialMoves: [], uniqueMoves: [] };
    }
    case 'ラシード': {
      const { rashidComboParts, rashidSampleCombos, rashidSpecialMoves, rashidUniqueMoves } = await import('./rashid.ts');
      return { comboParts: rashidComboParts, sampleCombos: rashidSampleCombos, specialMoves: rashidSpecialMoves, uniqueMoves: rashidUniqueMoves };
    }
    default:
      // 未知のキャラクターが要求された場合は空を返す
      return { comboParts: [] as Omit<ComboPart, 'character'>[], sampleCombos: [], specialMoves: [] as SpecialMove[], uniqueMoves: [] as UniqueMove[] };
  }
};
