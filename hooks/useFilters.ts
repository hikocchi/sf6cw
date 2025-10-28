import { useState, useMemo } from 'react';
import type { ComboPart, TagCategoryKey, FilterState } from '../types';
import { TAG_CATEGORIES } from '../constants';

const partMatchesFilters = (part: ComboPart, filters: FilterState): boolean => {
  for (const category of Object.keys(TAG_CATEGORIES) as TagCategoryKey[]) {
    const categoryFilters = filters[category];
    const includeTags = Object.keys(categoryFilters);

    if (includeTags.length === 0) continue;

    if (category === 'tagCondition') {
      if (!part.tagCondition || !includeTags.every(incTag => part.tagCondition!.includes(incTag))) return false;
    } else if (category === 'tagDriveGauge' || category === 'tagSaGauge') {
      const partValue = part[category] || '0';
      if (!includeTags.includes(partValue)) return false;
    } else { // tagType
      const partValue = part[category];
      if (!partValue || !includeTags.includes(partValue)) return false;
    }
  }
  return true;
};

export const useFilters = (comboParts: ComboPart[]) => {
  const initialFilterState: FilterState = {
    tagType: {},
    tagCondition: {},
    tagDriveGauge: {},
    tagSaGauge: {},
  };
  const [tags, setTags] = useState<FilterState>(initialFilterState);

  const resetFilters = () => setTags(initialFilterState);

  const handleTagClick = (category: TagCategoryKey, tag: string) => {
    setTags(prev => {
      const newCategoryTags = { ...prev[category] };
      const currentState = newCategoryTags[tag];

      if (currentState === 'include') {
        delete newCategoryTags[tag];
      } else { // undefined
        newCategoryTags[tag] = 'include';
      }
      
      return { ...prev, [category]: newCategoryTags };
    });
  };

  const availableTags = useMemo(() => {
    const categories: { [K in TagCategoryKey]: Set<string> } = {
        tagType: new Set(), tagCondition: new Set(),
        tagDriveGauge: new Set(), tagSaGauge: new Set(),
    };
    
    for (const part of comboParts) {
        if (part.tagType) categories.tagType.add(part.tagType);
        if (part.tagCondition) part.tagCondition.forEach(tag => categories.tagCondition.add(tag));
        
        categories.tagDriveGauge.add(part.tagDriveGauge || '0');
        categories.tagSaGauge.add(part.tagSaGauge || '0');
    }

    const sortNumerically = (a: string, b: string) => (parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));
    return {
        tagType: [...categories.tagType].sort(),
        tagCondition: [...categories.tagCondition].sort(),
        tagDriveGauge: [...categories.tagDriveGauge].sort(sortNumerically),
        tagSaGauge: [...categories.tagSaGauge].sort(sortNumerically),
    };
  }, [comboParts]);

  const filteredParts = useMemo(() => {
    if (Object.values(tags).every(cat => Object.keys(cat).length === 0)) {
      return comboParts;
    }
    return comboParts.filter(part => partMatchesFilters(part, tags));
  }, [tags, comboParts]);

  const dynamicallyAvailableTags = useMemo(() => {
    const available: { [K in TagCategoryKey]: Set<string> } = {
        tagType: new Set(),
        tagCondition: new Set(),
        tagDriveGauge: new Set(),
        tagSaGauge: new Set(),
    };

    for (const part of filteredParts) {
        if (part.tagType) available.tagType.add(part.tagType);
        if (part.tagCondition) part.tagCondition.forEach(t => available.tagCondition.add(t));
        available.tagDriveGauge.add(part.tagDriveGauge || '0');
        available.tagSaGauge.add(part.tagSaGauge || '0');
    }
    return available;
  }, [filteredParts]);


  return { tags, handleTagClick, resetFilters, availableTags, filteredParts, dynamicallyAvailableTags };
};