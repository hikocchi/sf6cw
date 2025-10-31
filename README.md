# SF6 Combo Weaver

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ストリートファイター6のコンボを視覚的に構築・確認できるWebアプリケーション**

![SF6 Combo Weaver Demo](./ogp-image.gif)

## 🚀 ライブデモ (Live Demo)

**[https://sf6cw.vercel.app/](https://sf6cw.vercel.app/)**

---

## 📖 概要 (Overview)

SF6 Combo Weaverは、ストリートファイター6のプレイヤー向けのコンボ練習・研究支援ツールです。

キャラクターごとに実用的なコンボを「始動」「起き攻め」「リーサル」などのパーツに分解しており、ユーザーはこれらのパーツを自由に組み合わせて一連の流れをシームレスな動画で確認できます。

このツールを使うことで、コンボレシピの発見、ダメージや状況の確認、実践的な練習を効率的に行うことができます。

## ✨ 主な機能 (Key Features)

*   **🧩 コンボパーツの組み合わせ:** ライブラリからコンボパーツを選び、ドラッグ＆ドロップで直感的にシーケンスを構築できます。
*   **▶️ 連続動画再生:** 構築したコンボを一つの動画として再生し、技から技への繋がりやタイミングを視覚的に確認できます。
*   **📊 自動計算:** 構築したコンボの合計ダメージ、使用ドライブゲージ量、終了時のフレーム状況を自動で計算・表示します。
*   **絞り込み機能:** 「カウンター始動」「画面端」などの状況や、有利フレームでコンボパーツを強力にフィルタリングできます。
*   **⭐ お気に入り保存:** 作成したコンボを「お気に入り」としてブラウザに保存し、いつでも呼び出すことができます。
*   **🔗 URL共有:** 作成したコンボのレシピをURLとして生成し、SNSなどで簡単に共有できます。
*   **🎮 ビジュアルコンボビルダー (VBC):** ゲームパッド風のUIで、オリジナルのコンボレシピを視覚的に作成できます。（PC版のみ）

---

## 🛠️ 使用技術 (Tech Stack)

*   **Frontend:** React, TypeScript
*   **Build Tool:** esbuild
*   **Hosting:** Vercel

---

## 👨‍💻 開発への貢献 (Contributing)

このプロジェクトはオープンソースです。コンボデータの追加や機能改善など、皆様からのコントリビューションを歓迎します！

### ローカル環境での実行

1.  このリポジトリをクローンします。
    ```bash
    git clone https://github.com/[あなたのGitHubユーザー名]/[リポジトリ名].git
    ```
2.  ディレクトリに移動し、依存関係をインストールします。
    ```bash
    cd [リポジトリ名]
    npm install
    ```
3.  プロジェクトをビルドします。
    ```bash
    npm run build
    ```
    `dist` フォルダが生成されます。ローカルサーバー（VS CodeのLive Server拡張機能など）で `dist/index.html` を開いてください。

### コンボデータの追加・編集方法

コンボデータは `data/` ディレクトリ内の各キャラクターファイル（例: `ryu.ts`）で管理されています。新しいコンボパーツやキャラクターを追加する際は、以下の手順に従ってください。

#### 1. キャラクターファイルの作成・編集

新しいキャラクターを追加する場合、`data/` 内に `[キャラクターID].ts` という名前のファイルを作成します。（例: `data/chun-li.ts`）
既存の `ryu.ts` や `ken.ts` を参考に、`moves` と `comboParts` の配列を定義してください。

`comboParts` 配列に新しいコンボパーツオブジェクトを追加します。`id` は `[キャラクターID]-[連番]` の形式で、他のパーツと重複しないようにしてください。

```typescript
// 例: data/gouki.ts
export const comboParts: Omit<ComboPart, 'character'>[] = [
  {
    id: 'gouki-028', // 新しいID
    name: '新しいコンボの名前',
    comboparts: 'コンボレシピのテキスト表記',
    videoUrl: '動画のURL',
    order: 110, // リスト内での表示順
    damage: 3000,
    endFrameAdvantage: 45,
    tagType: '始動', // 「始動」「起き攻め」「リーサル」など
    tagCondition: ['画面中央'], // 「画面端」「カウンター始動」など
    tagDriveGauge: '3', // 消費ドライブゲージ量
    tagSaGauge: '1', // 消費SAゲージ量
  },
  // ...他のコンボパーツ
];
```

#### 2. 新キャラクターの登録

新しいキャラクターを追加した場合、`data/index.ts` ファイルを開き、システムにキャラクターを登録する必要があります。

- `AVAILABLE_CHARACTERS` 配列にキャラクター名を追加
- `CHARACTER_ID_MAP` オブジェクトに名前とIDのマッピングを追加
- `fetchCharacterData` 関数の `switch` 文に、新しいキャラクターの `case` を追加

```typescript
// data/index.ts の編集例
// ...
export const AVAILABLE_CHARACTERS = [
  'リュウ',
  'ケン',
  'ラシード',
  '豪鬼',
  '春麗', // 追記
];

export const CHARACTER_ID_MAP: { [key: string]: string } = {
  // ...
  '豪鬼': 'gouki',
  '春麗': 'chun-li', // 追記
};

// ...
export const fetchCharacterData = async (character: string): Promise<...> => {
  // ...
  switch (id) {
    // ...
    case 'gouki':
      data = await import('./gouki.ts');
      break;
    case 'chun-li': // 追記
      data = await import('./chun-li.ts'); // 追記
      break; // 追記
    default:
      throw new Error(...);
  }
  // ...
};
```
---

## 📜 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 謝辞 (Acknowledgements)

- このツールは非公式のファン制作物であり、株式会社カプコンとは一切関係ありません。
- 『ストリートファイター6』に関する全ての著作権は、株式会社カプコンに帰属します。
- ご意見・ご要望・不具合の報告は、作者Xアカウントまでお願いします: [@takanan0325](https://x.com/takanan0325)
