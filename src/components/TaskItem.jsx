import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import StatusBadge from './StatusBadge';
import Alert from './Alert';

const ALLOWED_STATUSES = ['Planned', 'In Progress', 'Complete'];

/**
 * Single task card item with status dropdown changer.
 */
export default function TaskItem({ task, onStatusUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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

  return (
    <div className={`task-item ${isUpdating ? 'is-updating' : ''}`}>
      {updateError && (
        <Alert
          type="error"
          message={updateError}
          onClose={() => setUpdateError(null)}
        />
      )}

      <div className="task-item-main">
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

        <StatusBadge status={task.status} />
      </div>

      <div className="task-item-footer">
        <div className="task-meta">
          <span>Created: {formatDate(task.created_at)}</span>
        </div>

        <div className="task-control-wrapper">
          <label
            htmlFor={`status-select-${task.id}`}
            className="status-select-label"
          >
            Update Status:
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
    </div>
  );
}
