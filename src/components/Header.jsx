import React from 'react';

/**
 * Navigation header with user info and logout button.
 */
export default function Header({ user, onLogout, isLoggingOut }) {
  const userMetadata = user?.user_metadata || {};
  const displayName = userMetadata.full_name || userMetadata.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture;
  const email = user?.email || '';

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-icon" aria-hidden="true">
            ✓
          </div>
          <span className="brand-title">TaskFlow</span>
          <span className="brand-badge">Workspace</span>
        </div>

        {user && (
          <div className="user-profile">
            <div className="user-details">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="user-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="user-avatar-placeholder" aria-hidden="true">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="user-text">
                <span className="user-name">{displayName}</span>
                <span className="user-email">{email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="btn btn-outline"
              aria-label="Log out of your account"
            >
              {isLoggingOut ? (
                <>
                  <span className="spinner spinner-sm" aria-hidden="true"></span>
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Log out</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
