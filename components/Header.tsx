import React from 'react';

interface HeaderProps {
  onHowToClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHowToClick }) => {
  return (
    <header>
      <h1>SF6 Combo Weaver</h1>
      <button className="how-to-button" onClick={onHowToClick}>
        使い方
      </button>
    </header>
  );
};
