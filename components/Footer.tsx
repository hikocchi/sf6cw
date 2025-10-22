import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-content">
        <section className="update-history">
          <h3>更新履歴</h3>
          <ul>
            <li>2025.10.22 - コミュニティ機能の第一歩として、コンボ共有リンク機能を実装。</li>
            <li>2025.10.21 - UI/UXを向上。お気に入り登録機能、セッション復元機能、パーツ追加アニメーションを実装。</li>
            <li>2025.10.20 - ラシードデータを公開開始。リュウのデータを精査し、修正。モバイル版の表示関連不具合を修正。</li>
            <li>2025.10.18 - 初版公開開始。リュウのデータのみ。控えデータ：ケン、ラシード。</li>
          </ul>
        </section>

        <section className="roadmap">
          <h3>今後のアップデート予定</h3>
          <ul>
            <li>全キャラクターのコンボデータを順次追加</li>
            <li>AIによるコンボ提案機能（β版）の実装</li>
            <li>ユーザーがコンボを投稿・評価できるコミュニティ機能</li>
            <li>より詳細な状況（相手キャラクター、カウンターヒットの種類など）での検索機能</li>
          </ul>
        </section>

        <section className="legal-info">
          <h3>免責事項・プライバシーポリシー</h3>
          <p>
            This is an unofficial fan-made tool and is not affiliated with Capcom.
            <br />
            このツールは非公式のファン制作物であり、株式会社カプコンとは一切関係ありません。
          </p>
          <p>
            All Street Fighter 6 characters, images, and related content are trademarks and copyrights of ©CAPCOM.
            <br />
            『ストリートファイター6』に関する全てのキャラクター、画像、その他関連コンテンツの商標権および著作権は、株式会社カプコンに帰属します。
          </p>
          <p>
            The creator assumes no responsibility for any damages caused by the use of this tool. Please use it at your own risk.
            <br />
            当ツールの利用によって生じたいかなる損害についても、制作者は一切の責任を負いません。
          </p>
          <p>
            This site does not collect or use any user cookies or personally identifiable information. Session data is stored only in your browser's local storage.
            <br />
            当サイトは、利用者のCookie情報や個人を特定する情報を収集・利用することはありません。セッションデータは、お使いのブラウザのローカルストレージにのみ保存されます。
          </p>
        </section>
        <section className="contact-info">
          <h3>連絡先</h3>
          <p>
            ご意見・ご要望・不具合の報告は作者Xアカウントまで: <a href="https://x.com/takanan0325" target="_blank" rel="noopener noreferrer">@takanan0325</a>
          </p>
        </section>
      </div>
    </footer>
  );
};
