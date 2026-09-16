import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import StatusBadge from './StatusBadge';
import Alert from './Alert';

const ALLOWED_STATUSES = ['Planned', 'In Progress', 'Complete'];

/**
 * Enhanced task card item with status dropdown, edit, and delete actions.
 */
export default function TaskItem({
  task,
  onStatusUpdated,
  onEdit,
  onDelete,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoDate));
    } catch {
      return new Date(isoDate).toLocaleDateString();
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === task.status) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);

      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (onStatusUpdated && data) {
        onStatusUpdated(data);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setUpdateError(
        err.message || 'Failed to update status. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const isEdited =
    task.updated_at &&
    task.created_at &&
    new Date(task.updated_at).getTime() - new Date(task.created_at).getTime() > 2000;

  return (
    <article className={`task-item ${isUpdating ? 'is-updating' : ''}`}>
      {updateError && (
        <Alert
          type="error"
          message={updateError}
          onClose={() => setUpdateError(null)}
        />
      )}

      {/* Top row: Status Badge & Quick Actions */}
      <div className="task-item-top">
        <StatusBadge status={task.status} />

        <div className="task-actions-group">
          {onEdit && (
            <button
              type="button"
              className="action-icon-btn action-edit"
              onClick={() => onEdit(task)}
              aria-label={`Edit task: ${task.title}`}
              title="Edit task"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="action-icon-btn action-delete"
              onClick={() => onDelete(task)}
              aria-label={`Delete task: ${task.title}`}
              title="Delete task"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content: Title & Description */}
      <div className="task-item-content">
        <h3
          className={`task-title ${
            task.status === 'Complete' ? 'task-title-complete' : ''
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      {/* Bottom row: Timestamps & Preserved Status Dropdown */}
      <div className="task-item-footer">
        <div className="task-meta">
          <span title={`Created at ${task.created_at}`}>
            Created: {formatDate(task.created_at)}
          </span>
          {isEdited && (
            <span className="meta-updated" title={`Updated at ${task.updated_at}`}>
              • Updated: {formatDate(task.updated_at)}
            </span>
          )}
        </div>

        <div className="task-control-wrapper">
          <label
            htmlFor={`status-select-${task.id}`}
            className="status-select-label"
          >
            Status:
          </label>
          <select
            id={`status-select-${task.id}`}
            value={task.status}
            onChange={handleStatusChange}
            disabled={isUpdating}
            className="status-dropdown"
            aria-label={`Update status for ${task.title}`}
          >
            {ALLOWED_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {isUpdating && (
            <span className="spinner spinner-sm" aria-label="Saving status"></span>
          )}
        </div>
      </div>
    </article>
  );
}
