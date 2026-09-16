import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import Alert from './Alert';

/**
 * Login screen with Google OAuth sign-in.
 */
export default function Login({ authError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(authError || null);
  const isConfigured = isSupabaseConfigured();

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      setError(
        'Supabase is not configured yet. Please provide valid VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Using window.location.origin allows dynamic redirect support on localhost, Vercel preview, and production.
      const redirectUrl = window.location.origin;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(
        err.message || 'Failed to initiate Google Sign-In. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo-container">
          <div className="brand-icon" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
            ✓
          </div>
        </div>

        <h1 className="login-title">Welcome to TaskFlow</h1>
        <p className="login-subtitle">
          Manage and track your personal tasks securely in one place.
        </p>

        {!isConfigured && (
          <Alert
            type="warning"
            message="Supabase credentials missing. Copy .env.example to .env and configure your Supabase URL & Key."
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !isConfigured}
          className="btn btn-google"
          aria-label="Sign in with your Google account"
        >
          {loading ? (
            <>
              <span className="spinner spinner-sm" aria-hidden="true"></span>
              <span>Redirecting to Google...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p className="login-notice">
          Row-Level Security (RLS) ensures that only you can access and manage your tasks.
        </p>
      </div>
    </div>
  );
}
