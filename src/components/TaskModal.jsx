import React, { useState, useEffect } from 'react';
import Alert from './Alert';

const ALLOWED_STATUSES = ['Planned', 'In Progress', 'Complete'];

/**
 * Polished modal for both Creating and Editing tasks.
 * Ensures consistent field validation, status options, and loading states.
 */
export default function TaskModal({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  initialTask = null,
  onSave,
  onClose,
  isSaving,
  errorMessage,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planned');
  const [validationError, setValidationError] = useState(null);

  // Initialize or reset form state whenever modal opens or mode/task changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setStatus(initialTask.status || 'Planned');
      } else {
        setTitle('');
        setDescription('');
        setStatus('Planned');
      }
      setValidationError(null);
    }
  }, [isOpen, mode, initialTask]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Task title is required and cannot be blank.');
      return;
    }

    onSave({
      id: initialTask?.id,
      title: trimmedTitle,
      description: description.trim() || null,
      status: status || 'Planned',
    });
  };

  const isEdit = mode === 'edit';
  const modalTitle = isEdit ? 'Edit Task' : 'Create New Task';
  const modalSubtitle = isEdit
    ? 'Update the details or status of your task.'
    : 'Add a new work item to your personal workspace.';
  const submitButtonText = isEdit ? 'Save Changes' : 'Create Task';

  return (
    <div className="modal-backdrop" onClick={!isSaving ? onClose : undefined} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="task-modal-title" className="modal-title">
              {modalTitle}
            </h2>
            <p className="modal-subtitle">{modalSubtitle}</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {validationError && (
            <Alert
              type="error"
              message={validationError}
              onClose={() => setValidationError(null)}
            />
          )}

          {errorMessage && (
            <Alert type="error" message={errorMessage} />
          )}

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="modal-task-title" className="form-label">
                Task Title <span className="required" aria-hidden="true">*</span>
              </label>
              <span className="char-count">{title.length} / 200</span>
            </div>
            <input
              id="modal-task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Audit API authentication headers"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isSaving}
              maxLength={200}
              autoFocus
              required
            />
            <span className="form-hint">A concise summary of what needs to be accomplished.</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="modal-task-status" className="form-label">
                Status
              </label>
              <select
                id="modal-task-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSaving}
              >
                {ALLOWED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <div className="form-label-row">
                <label htmlFor="modal-task-description" className="form-label">
                  Description <span className="optional-tag">(optional)</span>
                </label>
                <span className="char-count">{description.length} / 1000</span>
              </div>
              <textarea
                id="modal-task-description"
                className="form-textarea"
                placeholder="Add context, acceptance criteria, or relevant links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                rows={3}
                maxLength={1000}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner spinner-sm" aria-hidden="true"></span>
                  <span>Saving...</span>
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
