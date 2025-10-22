import React, { useState } from 'react';
import type { ComboPart, AiComboRequest, AiGeneratedCombo } from '../types';
import { useGemini } from '../hooks/useGemini';
import './AiTab.css';

interface AiTabProps {
  character: string;
  comboParts: ComboPart[];
  onComboGenerated: (result: AiGeneratedCombo) => void;
  isLoadingCharacterData: boolean;
}

export const AiTab: React.FC<AiTabProps> = ({ character, comboParts, onComboGenerated, isLoadingCharacterData }) => {
  const { generateCombo, isLoading: isLoadingAi, error } = useGemini();
  
  const [purpose, setPurpose] = useState('最大ダメージを狙う');
  const [position, setPosition] = useState('画面中央');
  const [starter, setStarter] = useState('指定なし');
  const [driveGauge, setDriveGauge] = useState(6);
  const [saGauge, setSaGauge] = useState('指定なし');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const request: AiComboRequest = {
      character,
      parts: comboParts,
      conditions: {
        purpose,
        position,
        starter,
        driveGauge,
        saGauge,
      }
    };
    const result = await generateCombo(request);
    if (result) {
      onComboGenerated(result);
    }
  };

  if (isLoadingCharacterData) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="ai-tab-container">
      <p style={{ color: 'var(--text-secondary-color)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        AIに状況を伝えて、最適なコンボを提案してもらいましょう。
      </p>
      <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', backgroundColor: 'rgba(255, 82, 82, 0.1)', border: '1px solid var(--error-color)', padding: '0.5rem', borderRadius: '4px', margin: '0.5rem 0' }}>
        <strong>注意:</strong> AIによる提案は、ゲームのバージョンや非常に細かい状況によって、繋がらない場合があります。あくまで参考としてご活用ください。
      </p>
      <form onSubmit={handleSubmit} className="filters">
        <div className="filter-group">
          <label htmlFor="ai-purpose">目的</label>
          <select id="ai-purpose" value={purpose} onChange={e => setPurpose(e.target.value)}>
            <option>最大ダメージを狙う</option>
            <option>相手を画面端に運びたい</option>
            <option>有利な起き攻め状況を作りたい</option>
            <option>スタン値を稼ぎたい</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="ai-position">画面の位置</label>
          <select id="ai-position" value={position} onChange={e => setPosition(e.target.value)}>
            <option>画面中央</option>
            <option>画面端</option>
            <option>問わない</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="ai-starter">始動技の状況 (任意)</label>
          <select id="ai-starter" value={starter} onChange={e => setStarter(e.target.value)}>
            <option>指定なし</option>
            <option>立ち強K (パニカン)</option>
            <option>ドライブインパクト (壁ヒット)</option>
            <option>ドライブインパクト (パニカン)</option>
            <option>中足ラッシュ</option>
            <option>小技</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="ai-drive-gauge">使用ドライブゲージ (上限)</label>
          <select id="ai-drive-gauge" value={driveGauge} onChange={e => setDriveGauge(Number(e.target.value))}>
            {[0, 1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}本</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="ai-sa-gauge">使用SAゲージ</label>
          <select id="ai-sa-gauge" value={saGauge} onChange={e => setSaGauge(e.target.value)}>
            <option>指定なし</option>
            <option>SA1で〆</option>
            <option>SA2で〆</option>
            <option>SA3で〆</option>
          </select>
        </div>
        
        <button type="submit" className="ai-generate-button" disabled={isLoadingAi}>
          {isLoadingAi ? <div className="loading-spinner"></div> : '🤖 AIにコンボを生成してもらう'}
        </button>
      </form>

      {error && <p className="ai-error-message">{error}</p>}
    </div>
  );
};
