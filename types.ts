// --- 型定義 ---
export interface ComboPart {
  id: string;
  character: string;
  name: string;
  comboparts: string;
  videoUrl: string;
  order: number;
  damage?: number;
  startFrameAdvantage?: number; // このパーツの「開始条件」となる有利フレーム
  endFrameAdvantage?: number;   // このパーツを使った後の「終了状況」となる有利フレーム
  videoTime?: number[];
  tagType?: string;
  tagCondition?: string[];
  tagDriveGauge?: string;
  tagSaGauge?: string;
}

export interface SequencePart extends ComboPart {
  sequenceId: string;
}

/**
 * 技のバリエーションの詳細を定義します。UI上のボタンに対応します。
 */
export interface MoveVariant {
  label: string;
  notation: string;
  driveCost?: number;
  saCost?: number;
}

/**
 * 技バリエーションのサブグループを定義します。(例: 奮迅脚の「本体」「派生」)
 */
export interface MoveVariantGroup {
  groupName: string;
  variants: MoveVariant[];
}

/**
 * 技の基本情報を定義します。UI上の大きな括り（例: 「波動拳」）になります。
 * special/sa技の場合は `variants` を、unique技の場合は `variantGroups` を使用します。
 */
export interface Move {
  id: string;
  name: string;
  type: 'special' | 'unique' | 'sa';
  variants?: MoveVariant[];
  variantGroups?: MoveVariantGroup[];
}

export interface SampleCombo {
  name: string;
  parts: string[];
}

export interface FavoriteCombo {
  id: string;
  name: string;
  character: string;
  partIds: string[];
}

export type TagCategoryKey = keyof typeof import('./constants').TAG_CATEGORIES;

export type TagState = 'include';
export type FilterState = {
  [K in TagCategoryKey]: { [tag: string]: TagState };
};
