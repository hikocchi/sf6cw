import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Declare YT on window for TypeScript
// This ensures the YouTube IFrame API script can set its global variables.
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});