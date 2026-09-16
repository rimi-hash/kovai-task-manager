import React from 'react';

/**
 * Compact task summary statistics cards.
 * Real-time counts computed from actual user tasks with interactive quick-filter.
 */
export default function TaskStats({ stats, activeFilter, onFilterChange }) {
  const cards = [
    {
      id: 'All',
      label: 'Total Tasks',
      count: stats.total,
      badgeClass: 'stat-total',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="13" y2="17"></line>
        </svg>
      ),
    },
    {
      id: 'Planned',
      label: 'Planned',
      count: stats.planned,
      badgeClass: 'stat-planned',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
    {
      id: 'In Progress',
      label: 'In Progress',
      count: stats.inProgress,
      badgeClass: 'stat-progress',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
      ),
    },
    {
      id: 'Complete',
      label: 'Complete',
      count: stats.complete,
      badgeClass: 'stat-complete',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
  ];

  return (
    <div className="stats-grid" role="region" aria-label="Task metrics summary">
      {cards.map((c) => {
        const isSelected = activeFilter === c.id;
        return (
          <button
            key={c.id}
            type="button"
            className={`stat-card ${c.badgeClass} ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onFilterChange(c.id)}
            aria-pressed={isSelected}
            aria-label={`Filter by ${c.label}, currently ${c.count} tasks`}
          >
            <div className="stat-header">
              <span className="stat-label">{c.label}</span>
              <span className="stat-icon" aria-hidden="true">
                {c.icon}
              </span>
            </div>
            <div className="stat-value">{c.count}</div>
          </button>
        );
      })}
    </div>
  );
}
