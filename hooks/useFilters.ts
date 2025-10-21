import { useState, useMemo } from 'react';
import type { ComboPart, TagCategoryKey } from '../types';
import { TAG_CATEGORIES } from '../constants';

export const useFilters = (comboParts: ComboPart[]) => {
  const initialFilterState = {
    tagType: new Set<string>(),
    tagCondition: new Set<string>(),
    startCondition: new Set<string>(),
    tagDriveGauge: new Set<string>(),
    tagSaGauge: new Set<string>(),
  };
  const [tags, setTags] = useState(initialFilterState);

  const resetFilters = () => setTags(initialFilterState);

  const handleTagClick = (category: TagCategoryKey, tag: string) => {
    setTags(prev => {
      const newCategoryTags = new Set(prev[category]);
      if (newCategoryTags.has(tag)) newCategoryTags.delete(tag);
      else newCategoryTags.add(tag);
      return { ...prev, [category]: newCategoryTags };
    });
  };

  const availableTags = useMemo(() => {
    const categories: { [K in TagCategoryKey]: Set<string> } = {
        tagType: new Set(), tagCondition: new Set(), startCondition: new Set(),
        tagDriveGauge: new Set(), tagSaGauge: new Set(),
    };
    for (const part of comboParts) {
        if (part.tagType) categories.tagType.add(part.tagType);
        if (part.startCondition) categories.startCondition.add(part.startCondition);
        if (part.tagCondition) part.tagCondition.forEach(tag => categories.tagCondition.add(tag));
        if (part.tagDriveGauge) categories.tagDriveGauge.add(part.tagDriveGauge);
        if (part.tagSaGauge) categories.tagSaGauge.add(part.tagSaGauge);
    }
    const sortNumerically = (a: string, b: string) => (parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));
    return {
        tagType: [...categories.tagType].sort(),
        startCondition: [...categories.startCondition].sort(),
        tagCondition: [...categories.tagCondition].sort(),
        tagDriveGauge: [...categories.tagDriveGauge].sort(sortNumerically),
        tagSaGauge: [...categories.tagSaGauge].sort(sortNumerically),
    };
  }, [comboParts]);

  const filteredParts = useMemo(() => {
    return comboParts.filter(part => {
      for (const key of Object.keys(TAG_CATEGORIES) as TagCategoryKey[]) {
        const selectedTags = tags[key];
        if (selectedTags.size === 0) continue;
        if (key === 'tagCondition') {
          if (!part.tagCondition || !([...selectedTags].every(t => part.tagCondition!.includes(t)))) return false;
        } else {
          if (!part[key] || !selectedTags.has(part[key] as string)) return false;
        }
      }
      return true;
    });
  }, [tags, comboParts]);

  return { tags, handleTagClick, resetFilters, availableTags, filteredParts };
};
