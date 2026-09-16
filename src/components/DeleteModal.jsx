import React, { useEffect } from 'react';

/**
 * Accessible confirmation dialog preventing accidental task deletion.
 */
export default function DeleteModal({
  isOpen,
  task,
  onConfirm,
  onCancel,
  isDeleting,
  errorMessage,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !task) return null;

  return (
    <div className="modal-backdrop" onClick={!isDeleting ? onCancel : undefined} role="presentation">
      <div
        className="modal-card modal-delete"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-delete-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        <h3 id="delete-dialog-title" className="modal-title">Delete this task?</h3>
        <p id="delete-dialog-desc" className="modal-desc">
          Are you sure you want to delete <strong>&ldquo;{task.title}&rdquo;</strong>? This action will permanently remove it from your workspace and cannot be undone.
        </p>

        {errorMessage && (
          <div className="modal-inline-error" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(task)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true"></span>
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
