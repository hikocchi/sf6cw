import type { ComboPart, Move } from '../types';

export const moves: Move[] = [
  // Specials
  {
    id: '001',
    name: '波動拳',
    type: 'special',
    variants: [
      { label: '弱', notation: '弱波動', driveCost: 0, saCost: 0 },
      { label: '中', notation: '中波動', driveCost: 0, saCost: 0 },
      { label: '強', notation: '強波動', driveCost: 0, saCost: 0 },
      { label: 'OD', notation: 'OD波動', driveCost: 2, saCost: 0 },
    ],
  },
  {
    id: '002',
    name: '昇竜拳',
    type: 'special',
    variants: [
      { label: '弱', notation: '弱昇竜', driveCost: 0, saCost: 0 },
      { label: '中', notation: '中昇竜', driveCost: 0, saCost: 0 },
      { label: '強', notation: '強昇竜', driveCost: 0, saCost: 0 },
      { label: 'OD', notation: 'OD昇竜', driveCost: 2, saCost: 0 },
    ],
  },
  {
    id: '003',
    name: '竜巻旋風脚',
    type: 'special',
    variants: [
      { label: '弱', notation: '弱竜巻', driveCost: 0, saCost: 0 },
      { label: '中', notation: '中竜巻', driveCost: 0, saCost: 0 },
      { label: '強', notation: '強竜巻', driveCost: 0, saCost: 0 },
      { label: 'OD', notation: 'OD竜巻', driveCost: 2, saCost: 0 },
    ],
  },
  {
    id: '004',
    name: '龍尾脚',
    type: 'special',
    variants: [
      { label: '弱', notation: '弱龍尾', driveCost: 0, saCost: 0 },
      { label: '中', notation: '中龍尾', driveCost: 0, saCost: 0 },
      { label: '強', notation: '強龍尾', driveCost: 0, saCost: 0 },
    ],
  },
  {
    id: '005',
    name: '迅雷脚',
    type: 'unique',
    variantGroups: [
      {
        groupName: '迅雷脚',
        variants: [
          { label: '弱', notation: '弱迅雷', driveCost: 0, saCost: 0 },
          { label: '中', notation: '中迅雷', driveCost: 0, saCost: 0 },
          { label: '強', notation: '強迅雷', driveCost: 0, saCost: 0 },
          { label: 'OD', notation: 'OD迅雷', driveCost: 2, saCost: 0 },
        ],
      },
      {
        groupName: '派生(壱)',
        variants: [
          { label: '弱', notation: '弱迅雷派生', driveCost: 0, saCost: 0 },
          { label: '中', notation: '中迅雷派生', driveCost: 0, saCost: 0 },
          { label: '強', notation: '強迅雷派生', driveCost: 0, saCost: 0 },
        ],
      },
      {
        groupName: '派生(弐)',
        variants: [{ label: 'OD派生', notation: 'OD迅雷派生', driveCost: 0, saCost: 0 }],
      },
    ],
  },
  // Uniques
  {
    id: '006',
    name: '奮迅脚',
    type: 'unique',
    variantGroups: [
      {
        groupName: '奮迅脚',
        variants: [{ label: '奮迅脚', notation: '奮迅脚' }],
      },
      {
        groupName: '派生',
        variants: [
          { label: '急停止', notation: '奮迅急停止' },
          { label: 'カカト', notation: '奮迅カカト' },
          { label: '前蹴り', notation: '奮迅前蹴り' },
        ],
      },
      {
        groupName: '連携',
        variants: [
          { label: '竜巻', notation: '奮迅竜巻' },
          { label: '昇竜', notation: '奮迅昇竜' },
          { label: '龍尾', notation: '奮迅龍尾' },
        ],
      },
    ],
  },
  // Super Arts
  {
    id: '007',
    name: 'スーパーアーツ',
    type: 'sa',
    variants: [
      { label: 'SA1', notation: 'SA1', driveCost: 0, saCost: 1 },
      { label: 'SA2', notation: 'SA2', driveCost: 0, saCost: 2 },
      { label: 'SA3', notation: 'SA3', driveCost: 0, saCost: 3 },
      { label: 'CA', notation: 'CA', driveCost: 0, saCost: 3 },
    ],
  },
];

export const comboParts: Omit<ComboPart, 'character'>[] = [
  // --- 始動 (Starters) ---
  {
    // --- 基本情報 ---
    id: 'ken-009',
    order: 100,

    // --- コンボ内容 ---
    name: '強龍尾(ガードさせて有利)から投げ択',
    comboparts: '強龍尾(ガードさせて有利) ＞ 投げ択(カウンターヒット)',

    // --- コンボ詳細 ---
    damage: 1200,
    endFrameAdvantage: 20,
    tagType: '始動',
    tagCondition: ['暴れ潰し'],

    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-009.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-008',
    order: 110,

    // --- コンボ内容 ---
    name: '強龍尾(ガードさせて有利)から暴れ潰し',
    comboparts: '強龍尾(ガードさせて有利) ＞ 立弱K ＞ 強昇竜',

    // --- コンボ詳細 ---
    damage: 1480,
    endFrameAdvantage: 25,
    tagType: '始動',
    tagCondition: ['暴れ潰し'],

    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-008.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-014',
    order: 120,
    
    // --- コンボ内容 ---
    name: '奮迅中派生始動 竜巻〆',
    comboparts: '奮迅カカト ＞ 屈弱P（カウンター） ＞ 立中P ＞ 立強P ＞ 奮迅竜巻',
    
    // --- コンボ詳細 ---
    damage: 1520,
    endFrameAdvantage: 43,
    tagType: '始動',
    tagCondition: ['暴れ潰し'],

    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-014.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-015',
    order: 130,
  
    // --- コンボ内容 ---
    name: '奮迅竜巻〆後 > 前ステ重ね',
    comboparts: '奮迅カカト ＞ 屈弱P（カウンター） ＞ 立中P ＞ 立強P ＞ 奮迅竜巻 ＞ 前ステ2回',
  
    // --- コンボ詳細 ---
    damage: 1520,
    endFrameAdvantage: 5,
    tagType: '始動',
    tagCondition: ['暴れ潰し'],
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-015.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-001',
    order: 140,

    // --- コンボ内容 ---
    name: '小技始動 龍尾〆',
    comboparts: '屈弱P ＞ 立中P ＞ 立強P(TC) ＞ 奮迅脚 ＞ 奮迅龍尾 ＞ 強昇竜',

    // --- コンボ詳細 ---
    damage: 2080,
    endFrameAdvantage: 26,
    tagType: '始動',
    tagCondition: ['入れ替え'],

    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-001.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-016',
    order: 150,
  
    // --- コンボ内容 ---
    name: '強Kパニカン 奮迅昇竜〆',
    comboparts: '立強K ＞ 奮迅昇竜',
  
    // --- コンボ詳細 ---
    damage: 2150,
    endFrameAdvantage: 24,
    tagType: '始動',
    tagCondition: ['パニカン始動'],
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-016.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-003',
    order: 160,
  
    // --- コンボ内容 ---
    name: '中足ラッシュ 昇竜〆',
    comboparts: '屈中K ＞ CR ＞ 屈強P ＞ 奮迅急停止 ＞ 屈中P ＞ 弱竜巻 ＞ 中昇竜',
  
    // --- コンボ詳細 ---
    damage: 2360,
    endFrameAdvantage: 33,
    tagType: '始動',
    tagCondition: [],
    tagDriveGauge: '3',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-003.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-010',
    order: 170,
  
    // --- コンボ内容 ---
    name: '画面端 DI 昇竜〆',
    comboparts: 'DI ＞ 立強P ＞ 強迅雷 ＞ 強派生 ＞ 中昇竜',
  
    // --- コンボ詳細 ---
    damage: 2440,
    endFrameAdvantage: 33,
    tagType: '始動',
    tagCondition: ['画面端', 'ドライブインパクト始動'],
    tagDriveGauge: '1',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-010.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-012',
    order: 180,
  
    // --- コンボ内容 ---
    name: '画面端 強Kパニカンラッシュ 昇竜〆',
    comboparts: '立強K ＞ R ＞ 屈中P ＞ 強迅雷 ＞ 強K派生 ＞ 中昇竜',
  
    // --- コンボ詳細 ---
    damage: 2508,
    endFrameAdvantage: 33,
    tagType: '始動',
    tagCondition: ['画面端', 'パニカン始動'],
    tagDriveGauge: '1',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-012.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-002',
    order: 190,
  
    // --- コンボ内容 ---
    name: '小技始動 竜巻〆起き攻め',
    comboparts: '屈弱P ＞ 立中P ＞ 立強P ＞ 奮迅竜巻 ＞ 前ステ2回 ＞ 投げ重ね',
  
    // --- コンボ詳細 ---
    damage: 2660,
    endFrameAdvantage: 20,
    tagType: '始動',
    tagCondition: [],
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-002.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-013',
    order: 200,

    // --- コンボ内容 ---
    name: '奮迅中派生始動 竜巻〆起き攻め',
    comboparts: '奮迅前蹴り ＞ 屈弱P（カウンター） ＞ 立中P ＞ 立強P ＞ 奮迅竜巻 ＞ 前ステ2回 ＞ 投げ重ね',

    // --- コンボ詳細 ---
    damage: 2720,
    endFrameAdvantage: 20,
    tagType: '始動',
    tagCondition: ['暴れ潰し'],
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-013.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-005',
    order: 210,
  
    // --- コンボ内容 ---
    name: 'DIパニカン 奮迅昇竜〆',
    comboparts: 'DI ＞ J強P（低位置当て） ＞ 奮迅昇竜',
  
    // --- コンボ詳細 ---
    damage: 2790,
    endFrameAdvantage: 24,
    tagType: '始動',
    tagCondition: ['ドライブインパクト始動', 'パニカン始動'],
    tagDriveGauge: '1',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-005.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-011',
    order: 220,
  
    // --- コンボ内容 ---
    name: '画面端背負い DIパニカン 裏回り',
    comboparts: 'DI ＞ J強P（低位置当て） ＞ R ＞ 奮迅竜巻 ＞ 中昇竜',
  
    // --- コンボ詳細 ---
    damage: 2865,
    endFrameAdvantage: 33,
    tagType: '始動',
    tagCondition: ['画面端', 'ドライブインパクト始動', 'パニカン始動','運び'],
    tagDriveGauge: '2',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-011.mp4',
  },

  // --- リーサル (Lethal) ---
  {
    // --- 基本情報 ---
    id: 'ken-006',
    order: 800,
  
    // --- コンボ内容 ---
    name: '中足ラッシュ SA3〆 2',
    comboparts: '屈中K ＞ CR ＞ 屈弱P ＞ 立中P ＞ 立強P ＞ 奮迅龍尾 ＞ SA3',
  
    // --- コンボ詳細 ---
    damage: 3607,
    endFrameAdvantage: 15,
    tagType: 'リーサル',
    tagCondition: ['入れ替え'],
    tagDriveGauge: '3',
    tagSaGauge: '3',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-006.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-004',
    order: 810,
  
    // --- コンボ内容 ---
    name: '中足ラッシュ SA3〆',
    comboparts: '屈中K ＞ CR ＞ 屈強P ＞ 奮迅急停止 ＞ 屈中P ＞ CR ＞ 屈強P ＞ 奮迅急停止 ＞ 屈中P ＞ 中迅雷 ＞ 強迅雷派生 ＞ SA3',
  
    // --- コンボ詳細 ---
    damage: 4563,
    endFrameAdvantage: 15,
    tagType: 'リーサル',
    tagCondition: [],
    tagDriveGauge: '6', 
    tagSaGauge: '3',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-004.mp4',
  },
  {
    // --- 基本情報 ---
    id: 'ken-007',
    order: 820,
  
    // --- コンボ内容 ---
    name: '立ち中Pラッシュ ループ SA3〆',
    comboparts: '立中P ＞ CR ＞ 立強P ＞ 立中P ＞ CR ＞ 立強P ＞ 立中P ＞ 立強P ＞ 奮迅龍尾 ＞ SA3',
  
    // --- コンボ詳細 ---
    damage: 4878,
    endFrameAdvantage: 15,
    tagType: 'リーサル',
    tagCondition: ['入れ替え'],
    tagDriveGauge: '6',
    tagSaGauge: '3',
  
    // --- 動画情報 ---
    videoUrl: 'https://storage.googleapis.com/sf6cmbwev/ken/ken-007.mp4',
  },
];

export const sampleCombos = [
  {
    name: '画面中央 基本',
    parts: ['ken-003'],
  },
  {
    name: 'SA3〆リーサル',
    parts: ['ken-007'],
  },
];
