import React, { useState } from 'react';

interface SaveFavoriteModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export const SaveFavoriteModal: React.FC<SaveFavoriteModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-favorite-modal" onClick={(e) => e.stopPropagation()}>
        <h2>お気に入りに保存</h2>
        <p>このコンボの名前を入力してください。</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例：画面端 最大ダメージ"
          autoFocus
        />
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">キャンセル</button>
          <button onClick={handleSave} className="save-button" disabled={!name.trim()}>保存</button>
        </div>
      </div>
    </div>
  );
};
