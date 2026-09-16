import React from 'react';

const FILTER_OPTIONS = [
  { id: 'All', label: 'All Tasks' },
  { id: 'Planned', label: 'Planned' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Complete', label: 'Complete' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'title-asc', label: 'Title: A → Z' },
  { id: 'title-desc', label: 'Title: Z → A' },
];

/**
 * Task management controls: Search bar, status filter tabs, and sort selector.
 */
export default function TaskControls({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  totalResultsCount,
}) {
  return (
    <div className="controls-card" role="search" aria-label="Task filters and search">
      <div className="controls-top">
        {/* Search Input */}
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search text"
            >
              &times;
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="sort-wrapper">
          <label htmlFor="task-sort-select" className="sort-label">
            Sort:
          </label>
          <select
            id="task-sort-select"
            className="sort-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort tasks order"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Filter tasks by status">
        {FILTER_OPTIONS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              className={`filter-tab ${isActive ? 'is-active' : ''}`}
              aria-selected={isActive}
              onClick={() => onFilterChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
