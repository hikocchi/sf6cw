import React, { useState, useRef, useCallback } from 'react';
import type { SequencePart } from '../types';

export const useSequenceReorder = (
  sequence: SequencePart[],
  setSequence: React.Dispatch<React.SetStateAction<SequencePart[]>>
) => {
  const [draggingPartId, setDraggingPartId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const longPressTimeoutRef = useRef<number | null>(null);

  const reorderSequence = useCallback((draggedId: string, dropIndex: number) => {
    setSequence(currentSequence => {
      const draggedIndex = currentSequence.findIndex(p => p.sequenceId === draggedId);
      if (draggedIndex === -1 || draggedIndex === dropIndex) return currentSequence;

      const newSequence = [...currentSequence];
      const [draggedItem] = newSequence.splice(draggedIndex, 1);
      
      // Since the item is removed, the target index might shift.
      const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;

      newSequence.splice(adjustedDropIndex, 0, draggedItem);
      return newSequence;
    });
  }, [setSequence]);

  const cleanup = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setDraggingPartId(null);
    setDragOverIndex(null);
    document.body.classList.remove('no-scroll', 'user-select-none');
  }, []);

  // --- Desktop: HTML5 D&D ---
  const handleDragStart = (e: React.DragEvent, partId: string) => {
    e.dataTransfer.setData('text/plain', partId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => setDraggingPartId(partId), 0);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggingPartId) return;
    
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    const newDragOverIndex = e.clientY < midY ? index : index + 1;
    if (newDragOverIndex !== dragOverIndex) {
      setDragOverIndex(newDragOverIndex);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && dragOverIndex !== null) {
        reorderSequence(draggedId, dragOverIndex);
    }
    cleanup();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const listContainer = e.currentTarget;
    if (e.relatedTarget && listContainer.contains(e.relatedTarget as Node)) return;
    setDragOverIndex(null);
  };
  
  // --- Mobile: Touch Events ---
  const handleTouchStart = (partId: string) => {
    longPressTimeoutRef.current = window.setTimeout(() => {
      setDraggingPartId(partId);
      document.body.classList.add('no-scroll', 'user-select-none');
    }, 300); // 300ms long press
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    if (!draggingPartId) return;

    const touchY = e.touches[0].clientY;
    const listContainer = e.currentTarget as HTMLElement;
    const itemElements = Array.from(listContainer.querySelectorAll('.sequence-item'));
    
    let newIndex = sequence.length;
    for (let i = 0; i < itemElements.length; i++) {
        const el = itemElements[i] as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (touchY < rect.top + rect.height / 2) {
            newIndex = i;
            break;
        }
    }
    if (newIndex !== dragOverIndex) {
      setDragOverIndex(newIndex);
    }
  }, [draggingPartId, dragOverIndex, sequence.length]);
  
  const handleTouchEnd = () => {
    if (draggingPartId && dragOverIndex !== null) {
      reorderSequence(draggingPartId, dragOverIndex);
    }
    cleanup();
  };
  
  return {
    draggingPartId,
    dragOverIndex,
    desktopActions: { handleDragStart, handleDragOver, handleDrop, handleDragLeave, handleDragEnd: cleanup },
    mobileActions: { handleTouchStart, handleTouchMove, handleTouchEnd },
  };
};