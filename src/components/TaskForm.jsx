import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Alert from './Alert';

const ALLOWED_STATUSES = ['Planned', 'In Progress', 'Complete'];

/**
 * Form to create a new task.
 */
export default function TaskForm({ user, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planned');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validation: Title required & trimmed
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Task title is required and cannot be blank.');
      return;
    }

    if (!user || !user.id) {
      setFormError('You must be signed in to create a task.');
      return;
    }

    const trimmedDescription = description.trim();

    try {
      setIsSubmitting(true);

      const newTaskPayload = {
        user_id: user.id,
        title: trimmedTitle,
        description: trimmedDescription || null,
        status: status || 'Planned',
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTaskPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reset form fields
      setTitle('');
      setDescription('');
      setStatus('Planned');
      setSuccessMessage('Task created successfully!');

      // Notify parent to refresh list immediately
      if (onTaskCreated && data) {
        onTaskCreated(data);
      }

      // Clear success banner after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Task creation failed:', err);
      setFormError(
        err.message || 'An error occurred while creating the task. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create New Task</h2>
        <p className="card-subtitle">Add a task to your personal backlog.</p>
      </div>

      <form onSubmit={handleSubmit} className="task-form" noValidate>
        {formError && (
          <Alert
            type="error"
            message={formError}
            onClose={() => setFormError(null)}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="e.g. Verify OAuth callback configuration"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (formError) setFormError(null);
            }}
            disabled={isSubmitting}
            required
            maxLength={200}
          />
          <span className="form-hint">Brief summary of the work item (required).</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-status" className="form-label">
              Initial Status
            </label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isSubmitting}
            >
              {ALLOWED_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <span className="form-hint">Defaults to Planned.</span>
          </div>

          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Provide additional details or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            aria-label="Save new task"
          >
            {isSubmitting ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true"></span>
                <span>Saving Task...</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Create Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
