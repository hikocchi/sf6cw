import React, { useState } from 'react';
import type { ComboPart, SampleCombo, FavoriteCombo, SequencePart, TagCategoryKey } from '../types';
import { TAG_CATEGORIES, INITIAL_PARTS_LIMIT } from '../constants';
import { PartCard } from './PartCard';

interface SidebarProps {
  character: string;
  availableCharacters: string[];
  isMobileView: boolean;
  handleCharacterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isLoading: boolean;
  comboParts: ComboPart[];
  sampleCombos: SampleCombo[];
  tags: { [K in TagCategoryKey]: Set<string> };
  handleTagClick: (category: TagCategoryKey, tag: string) => void;
  availableTags: { [K in TagCategoryKey]: string[] };
  filteredParts: ComboPart[];
  displayedParts: ComboPart[];
  onPartAdd: (part: ComboPart, event: React.MouseEvent<HTMLDivElement>) => void;
  handleLoadSample: (sample: SampleCombo) => void;
  handleLoadFavorite: (favorite: FavoriteCombo) => void;
  handleDeleteFavorite: (id: string) => void;
  handleShowMoreClick: () => void;
  showAllParts: boolean;
  characterFavorites: FavoriteCombo[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  character,
  availableCharacters,
  isMobileView,
  handleCharacterChange,
  isLoading,
  comboParts,
  sampleCombos,
  tags,
  handleTagClick,
  availableTags,
  filteredParts,
  displayedParts,
  onPartAdd,
  handleLoadSample,
  handleLoadFavorite,
  handleDeleteFavorite,
  handleShowMoreClick,
  showAllParts,
  characterFavorites
}) => {
  const [isCharSelectExpanded, setIsCharSelectExpanded] = useState(true);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'samples' | 'favorites'>('library');

  // Reset tab on character change
  React.useEffect(() => {
    setActiveTab('library');
  }, [character]);

  React.useEffect(() => {
    if (!isMobileView) {
        setIsCharSelectExpanded(true);
        setIsLibraryExpanded(true);
    }
  }, [isMobileView]);

  return (
    <div className="sidebar">
      <section className={`character-select collapsible-section ${isCharSelectExpanded ? 'expanded' : ''}`}>
        <h2 onClick={isMobileView ? () => setIsCharSelectExpanded(p => !p) : undefined} role={isMobileView ? "button" : "heading"} aria-level={2}>
          <span>Character Select</span>
          <span className={`expand-icon ${isCharSelectExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
        </h2>
        <div className="collapsible-content">
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="character-filter">Character</label>
              <select id="character-filter" name="character" value={character} onChange={handleCharacterChange}>
                {availableCharacters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <aside className={`library collapsible-section ${isLibraryExpanded ? 'expanded' : ''}`}>
        <h2 onClick={isMobileView ? () => setIsLibraryExpanded(p => !p) : undefined} role={isMobileView ? "button" : "heading"} aria-level={2}>
          <span>Library</span>
          <span className={`expand-icon ${isLibraryExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
        </h2>
        <div className="collapsible-content">
           <div className="library-tabs">
            <button
              className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              パーツ検索
            </button>
            <button
              className={`tab-button ${activeTab === 'samples' ? 'active' : ''}`}
              onClick={() => setActiveTab('samples')}
              disabled={sampleCombos.length === 0}
            >
              サンプル
            </button>
             <button
              className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              お気に入り
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'library' && (
              <>
                <div className="tag-filter-container">
                  {Object.entries(TAG_CATEGORIES).map(([key, name]) => {
                    const categoryKey = key as TagCategoryKey;
                    const tagsForCategory = availableTags[categoryKey];
                    if (!tagsForCategory || tagsForCategory.length === 0) return null;
                    return (
                      <div key={key} className="tag-category">
                        <h4>{name}</h4>
                        <div className="tag-buttons">
                          {tagsForCategory.map(tag => (
                            <button key={tag} className={`tag-filter-button ${tags[categoryKey].has(tag) ? 'active' : ''}`} onClick={() => handleTagClick(categoryKey, tag)}>{tag}</button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="parts-list">
                  {isLoading ? <div className="loading-spinner"></div> : 
                    displayedParts.length > 0 ? displayedParts.map(part => <PartCard key={part.id} part={part} onPartClick={onPartAdd} />) : 
                    <p className="no-parts-found">No matching parts found.</p>}
                </div>
                {!isLoading && filteredParts.length > INITIAL_PARTS_LIMIT && (
                  <div className="show-more-container">
                    <button onClick={handleShowMoreClick} className="show-more-button">
                      {isMobileView || !showAllParts ? `もっと見る (${filteredParts.length - (isMobileView ? 0 : INITIAL_PARTS_LIMIT)}件)` : '表示を減らす'}
                    </button>
                  </div>
                )}
              </>
            )}
             {activeTab === 'samples' && (
              <div className="sample-combos-list">
                {isLoading ? <div className="loading-spinner"></div> :
                  sampleCombos.length > 0 ? sampleCombos.map(sample => (
                    <div key={sample.name} className="sample-combo-card">
                      <h3>{sample.name}</h3>
                      <div className="sample-combo-parts">
                        {sample.parts.map(partId => {
                          const part = comboParts.find(p => p.id === partId);
                          return part ? <span key={`${sample.name}-${partId}`} className="tag">{part.name}</span> : null;
                        })}
                      </div>
                      <div className="card-actions">
                        <button className="load-sample-button" onClick={() => handleLoadSample(sample)}>
                          このコンボをロード
                        </button>
                      </div>
                    </div>
                  )) : <p className="no-parts-found">サンプルコンボがありません。</p>
                }
              </div>
            )}
             {activeTab === 'favorites' && (
              <div className="favorites-list">
                {isLoading ? <div className="loading-spinner"></div> :
                  characterFavorites.length > 0 ? characterFavorites.map(fav => (
                    <div key={fav.id} className="favorite-combo-card">
                      <h3>{fav.name}</h3>
                      <div className="favorite-combo-parts">
                        {fav.partIds.map(partId => {
                          const part = comboParts.find(p => p.id === partId);
                          return part ? <span key={`${fav.id}-${partId}`} className="tag">{part.name}</span> : null;
                        })}
                      </div>
                      <div className="card-actions">
                         <button className="delete-favorite-button" onClick={() => handleDeleteFavorite(fav.id)}>削除</button>
                        <button className="load-favorite-button" onClick={() => handleLoadFavorite(fav)}>
                          ロード
                        </button>
                      </div>
                    </div>
                  )) : <p className="no-parts-found">{character}のお気に入りコンボはありません。</p>
                }
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
