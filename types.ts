// --- 型定義 ---
export interface ComboPart {
  id: string;
  character: string;
  name: string;
  comboparts: string;
  videoUrl: string;
  order: number;
  damage?: number;
  endFrameAdvantage?: number;
  startTime?: number;
  endTime?: number;
  tagType?: string;
  startCondition?: string;
  tagCondition?: string[];
  tagDriveGauge?: string;
  tagSaGauge?: string;
}

export interface SequencePart extends ComboPart {
  sequenceId: string;
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

export interface SpecialMove {
  name: string; // 表示名 e.g., "OD波動拳"
  notation: string; // コンボ文字列 e.g., "OD波動拳"
  driveCost: number;
  saCost: number; // in bars
  type: 'special' | 'sa';
}

// 奮迅脚のような特殊な派生技やユニークなムーブのための型
export interface UniqueMove {
  name: string;       // ボタンの表示名 (e.g., "急停止")
  notation: string;   // コンボ表記 (e.g., "急停止")
  driveCost?: number;
  saCost?: number;
  group: string;      // UI上のグループ名 (e.g., "奮迅脚派生")
}