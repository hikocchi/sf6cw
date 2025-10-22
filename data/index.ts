import type { ComboPart, SpecialMove } from '../types';

// このツールで利用可能なキャラクターのリスト
export const AVAILABLE_CHARACTERS = [
  'リュウ','ラシード'
];

// URL短縮用のキャラクターIDマッピング
export const CHARACTER_ID_MAP: { [key: string]: string } = {
  'リュウ': 'ryu',
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
      const { ryuComboParts, ryuSampleCombos, ryuSpecialMoves } = await import('./ryu.ts');
      return { comboParts: ryuComboParts, sampleCombos: ryuSampleCombos, specialMoves: ryuSpecialMoves };
    }
    case 'ケン': {
      const { kenComboParts } = await import('./ken.ts');
      return { comboParts: kenComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ルーク': {
      const { lukeComboParts } = await import('./luke.ts');
      return { comboParts: lukeComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ジェイミー': {
      const { jamieComboParts } = await import('./jamie.ts');
      return { comboParts: jamieComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'マノン': {
      const { manonComboParts } = await import('./manon.ts');
      return { comboParts: manonComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'キンバリー': {
      const { kimberlyComboParts } = await import('./kimberly.ts');
      return { comboParts: kimberlyComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'マリーザ': {
      const { marisaComboParts } = await import('./marisa.ts');
      return { comboParts: marisaComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'リリー': {
      const { lilyComboParts } = await import('./lily.ts');
      return { comboParts: lilyComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'JP': {
      const { jpComboParts } = await import('./jp.ts');
      return { comboParts: jpComboParts, sampleCombos: [], specialMoves: [] };
    }
    case '春麗': {
      const { chunliComboParts } = await import('./chun-li.ts');
      return { comboParts: chunliComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ガイル': {
      const { guileComboParts } = await import('./guile.ts');
      return { comboParts: guileComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ブランカ': {
      const { blankaComboParts } = await import('./blanka.ts');
      return { comboParts: blankaComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ダルシム': {
      const { dhalsimComboParts } = await import('./dhalsim.ts');
      return { comboParts: dhalsimComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'エドモンド本田': {
      const { ehondaComboParts } = await import('./e-honda.ts');
      return { comboParts: ehondaComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ジュリ': {
      const { juriComboParts } = await import('./juri.ts');
      return { comboParts: juriComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ディージェイ': {
      const { deejayComboParts } = await import('./dee-jay.ts');
      return { comboParts: deejayComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'キャミィ': {
      const { cammyComboParts } = await import('./cammy.ts');
      return { comboParts: cammyComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ザンギエフ': {
      const { zangiefComboParts } = await import('./zangief.ts');
      return { comboParts: zangiefComboParts, sampleCombos: [], specialMoves: [] };
    }
    case 'ラシード': {
      const { rashidComboParts } = await import('./rashid.ts');
      return { comboParts: rashidComboParts, sampleCombos: [], specialMoves: [] };
    }
    default:
      // 未知のキャラクターが要求された場合は空を返す
      return { comboParts: [] as ComboPart[], sampleCombos: [], specialMoves: [] as SpecialMove[] };
  }
};
