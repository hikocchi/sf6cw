import type { ComboPart } from '../index.tsx';

// このツールで利用可能なキャラクターのリスト
export const AVAILABLE_CHARACTERS = [
  'リュウ','ラシード'
];

/**
 * 要求されたキャラクターのコンボデータを動的にロードします。
 * @param character キャラクター名
 * @returns コンボパーツとサンプルコンボを含むオブジェクト
 */
export const fetchCharacterData = async (character: string) => {
  switch (character) {
    case 'リュウ': {
      const { ryuComboParts, ryuSampleCombos } = await import('./ryu.ts');
      return { comboParts: ryuComboParts, sampleCombos: ryuSampleCombos };
    }
    case 'ケン': {
      const { kenComboParts } = await import('./ken.ts');
      return { comboParts: kenComboParts, sampleCombos: [] };
    }
    case 'ルーク': {
      const { lukeComboParts } = await import('./luke.ts');
      return { comboParts: lukeComboParts, sampleCombos: [] };
    }
    case 'ジェイミー': {
      const { jamieComboParts } = await import('./jamie.ts');
      return { comboParts: jamieComboParts, sampleCombos: [] };
    }
    case 'マノン': {
      const { manonComboParts } = await import('./manon.ts');
      return { comboParts: manonComboParts, sampleCombos: [] };
    }
    case 'キンバリー': {
      const { kimberlyComboParts } = await import('./kimberly.ts');
      return { comboParts: kimberlyComboParts, sampleCombos: [] };
    }
    case 'マリーザ': {
      const { marisaComboParts } = await import('./marisa.ts');
      return { comboParts: marisaComboParts, sampleCombos: [] };
    }
    case 'リリー': {
      const { lilyComboParts } = await import('./lily.ts');
      return { comboParts: lilyComboParts, sampleCombos: [] };
    }
    case 'JP': {
      const { jpComboParts } = await import('./jp.ts');
      return { comboParts: jpComboParts, sampleCombos: [] };
    }
    case '春麗': {
      const { chunliComboParts } = await import('./chun-li.ts');
      return { comboParts: chunliComboParts, sampleCombos: [] };
    }
    case 'ガイル': {
      const { guileComboParts } = await import('./guile.ts');
      return { comboParts: guileComboParts, sampleCombos: [] };
    }
    case 'ブランカ': {
      const { blankaComboParts } = await import('./blanka.ts');
      return { comboParts: blankaComboParts, sampleCombos: [] };
    }
    case 'ダルシム': {
      const { dhalsimComboParts } = await import('./dhalsim.ts');
      return { comboParts: dhalsimComboParts, sampleCombos: [] };
    }
    case 'エドモンド本田': {
      const { ehondaComboParts } = await import('./e-honda.ts');
      return { comboParts: ehondaComboParts, sampleCombos: [] };
    }
    case 'ジュリ': {
      const { juriComboParts } = await import('./juri.ts');
      return { comboParts: juriComboParts, sampleCombos: [] };
    }
    case 'ディージェイ': {
      const { deejayComboParts } = await import('./dee-jay.ts');
      return { comboParts: deejayComboParts, sampleCombos: [] };
    }
    case 'キャミィ': {
      const { cammyComboParts } = await import('./cammy.ts');
      return { comboParts: cammyComboParts, sampleCombos: [] };
    }
    case 'ザンギエフ': {
      const { zangiefComboParts } = await import('./zangief.ts');
      return { comboParts: zangiefComboParts, sampleCombos: [] };
    }
    case 'ラシード': {
      const { rashidComboParts } = await import('./rashid.ts');
      return { comboParts: rashidComboParts, sampleCombos: [] };
    }
    default:
      // 未知のキャラクターが要求された場合は空を返す
      return { comboParts: [] as ComboPart[], sampleCombos: [] };
  }
};