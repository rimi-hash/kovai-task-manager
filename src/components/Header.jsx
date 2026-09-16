import React from 'react';

/**
 * Enhanced Navigation Header with theme switcher, user profile, and sign out control.
 */
export default function Header({
  user,
  onLogout,
  isLoggingOut,
  theme = 'light',
  onToggleTheme,
}) {
  const userMetadata = user?.user_metadata || {};
  const displayName =
    userMetadata.full_name ||
    userMetadata.name ||
    user?.email?.split('@')[0] ||
    'User';
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture;
  const email = user?.email || '';

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon" aria-hidden="true">
            ✓
          </div>
          <div className="brand-text-block">
            <span className="brand-title">TaskFlow</span>
            <span className="brand-badge">Workspace</span>
          </div>
        </div>

        {/* User Controls & Theme Toggle */}
        <div className="header-actions">
          {/* Dark / Light Mode Toggle (Feature 14) */}
          {onToggleTheme && (
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                // Sun Icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                // Moon Icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          )}

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
                className="btn btn-outline btn-sm"
                aria-label="Log out of your account"
              >
                {isLoggingOut ? (
                  <>
                    <span className="spinner spinner-sm" aria-hidden="true"></span>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      </div>
    </header>
  );
}
