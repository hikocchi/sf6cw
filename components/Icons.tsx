import React from 'react';

export const PlayIcon = () => (
  <svg className="control-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
  </svg>
);

export const PauseIcon = () => (
  <svg className="control-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

export const RewindIcon = () => (
    <svg className="control-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
    </svg>
);

export const StopIcon = () => (
  <svg className="control-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 6h12v12H6V6z"/>
  </svg>
);

export const StarIcon = () => (
  <svg className="control-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
  </svg>
);

export const ShareIcon = () => (
    <svg className="control-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
);

export const ControllerIcon = () => (
  <svg className="control-icon" style={{marginRight: '0.5rem'}} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M318-208q-25 0-42.5-17.5T258-268q0-25 17.5-42.5T318-328q25 0 42.5 17.5T378-268q0 25-17.5 42.5T318-208Zm-80-160v-80h80v-80h-80v-80h-80v80h-80v80h80v80h80Zm442 80q-25 0-42.5-17.5T620-268q0-25 17.5-42.5T680-328q25 0 42.5 17.5T740-268q0 25-17.5 42.5T680-208Zm-80-240q-25 0-42.5-17.5T540-508q0-25 17.5-42.5T600-568q25 0 42.5 17.5T660-508q0 25-17.5 42.5T600-448Zm160 80q-25 0-42.5-17.5T700-428q0-25 17.5-42.5T760-488q25 0 42.5 17.5T820-428q0 25-17.5 42.5T760-368ZM120-120q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120H120Z"/></svg>
);

// D-Pad Icons
export const ArrowUpLeft = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.59L16.59 18 8 9.41V13H6V6h7v2H9.41z"/></svg>;
export const ArrowUp = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>;
export const ArrowUpRight = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 16.59L7.41 18 16 9.41V13h2V6H11v2h3.59z"/></svg>;
export const ArrowLeft = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>;
export const ArrowRight = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>;
export const ArrowDownLeft = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 14.59V11H6v7h7v-2H9.41L18 7.41 16.59 6z"/></svg>;
export const ArrowDown = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>;
export const ArrowDownRight = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 14.59V11h2v7h-7v-2h2.59L6 7.41 7.41 6z"/></svg>;
