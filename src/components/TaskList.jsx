import React from 'react';
import TaskItem from './TaskItem';
import Alert from './Alert';

/**
 * Task list container with skeleton loaders, contextual empty states, and error handling.
 */
export default function TaskList({
  tasks,
  totalTasksCount,
  isLoading,
  error,
  searchQuery,
  activeFilter,
  onResetSearch,
  onResetFilter,
  onOpenCreate,
  onRetry,
  onStatusUpdated,
  onEdit,
  onDelete,
}) {
  // Skeleton Loading State (Feature 11)
  if (isLoading) {
    return (
      <div className="task-list skeleton-list" role="status" aria-label="Loading tasks">
        {[1, 2, 3].map((n) => (
          <div key={n} className="task-item skeleton-card">
            <div className="skeleton-badge skeleton-pulse"></div>
            <div className="skeleton-title skeleton-pulse"></div>
            <div className="skeleton-desc skeleton-pulse"></div>
            <div className="skeleton-footer skeleton-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="list-error-state">
        <Alert type="error" message={`Failed to load tasks: ${error}`} />
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-outline"
            style={{ marginTop: '0.5rem' }}
          >
            Retry Loading Tasks
          </button>
        )}
      </div>
    );
  }

  // Contextual Empty States (Feature 9)

  // 1. Completely new user (zero tasks in workspace)
  if (totalTasksCount === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 className="empty-state-title">No tasks yet</h3>
        <p className="empty-state-desc">
          Create your first task and start organizing your work efficiently.
        </p>
        {onOpenCreate && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreate}
            style={{ marginTop: '0.75rem' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create First Task</span>
          </button>
        )}
      </div>
    );
  }

  // 2. Search query yielded 0 results
  if (searchQuery && tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">
          🔍
        </div>
        <h3 className="empty-state-title">No tasks match your search</h3>
        <p className="empty-state-desc">
          No items contain &ldquo;{searchQuery}&rdquo;. Try a different keyword or clear your search query.
        </p>
        {onResetSearch && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onResetSearch}
            style={{ marginTop: '0.75rem' }}
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  // 3. Status filter yielded 0 results
  if (activeFilter !== 'All' && tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">
          🏷️
        </div>
        <h3 className="empty-state-title">No tasks in this status</h3>
        <p className="empty-state-desc">
          There are currently no tasks marked as &ldquo;{activeFilter}&rdquo;.
        </p>
        {onResetFilter && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onResetFilter}
            style={{ marginTop: '0.75rem' }}
          >
            Show All Tasks
          </button>
        )}
      </div>
    );
  }

  // 4. Normal populated list
  return (
    <div className="task-list" role="list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusUpdated={onStatusUpdated}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
