import React from 'react';
import TaskItem from './TaskItem';
import Alert from './Alert';

/**
 * Task list container showing task items or empty / loading states.
 */
export default function TaskList({
  tasks,
  isLoading,
  error,
  onRetry,
  onStatusUpdated,
}) {
  if (isLoading) {
    return (
      <div className="loading-container" role="status">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
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

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">
          📋
        </div>
        <h3 className="empty-state-title">No tasks yet</h3>
        <p className="empty-state-desc">
          Create your first task above to start tracking your work items.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="list-section-header">
        <h2 className="list-section-title">
          <span>Your Tasks</span>
          <span className="task-count-badge" aria-label={`${tasks.length} total tasks`}>
            {tasks.length}
          </span>
        </h2>
      </div>

      <div className="task-list" role="list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onStatusUpdated={onStatusUpdated}
          />
        ))}
      </div>
    </div>
  );
}
