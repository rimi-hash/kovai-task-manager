import React from 'react';

/**
 * Visual status badge displaying one of the 3 allowed statuses:
 * - Planned
 * - In Progress
 * - Complete
 */
export default function StatusBadge({ status }) {
  const getBadgeClass = () => {
    switch (status) {
      case 'Planned':
        return 'status-badge-planned';
      case 'In Progress':
        return 'status-badge-in-progress';
      case 'Complete':
        return 'status-badge-complete';
      default:
        return 'status-badge-planned';
    }
  };

  return (
    <span className={`status-badge ${getBadgeClass()}`}>
      <span className="status-badge-dot" aria-hidden="true"></span>
      {status || 'Planned'}
    </span>
  );
}
