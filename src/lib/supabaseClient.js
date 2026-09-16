import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validates if the Supabase environment variables are properly defined.
 * Helps prevent silent runtime crashes and guides the reviewer/developer.
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project-ref') &&
      !supabaseAnonKey.includes('your-supabase-publishable')
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase Configuration] Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) are missing or set to placeholder values. Please check your .env file.'
  );
}

// Fallback dummy values to avoid createClient throwing during build or initial setup
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
