import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import Login from './components/Login';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Alert from './components/Alert';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Parse URL hash/params for OAuth callback errors (e.g. access_denied)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const errorDescription =
      hashParams.get('error_description') ||
      queryParams.get('error_description') ||
      hashParams.get('error') ||
      queryParams.get('error');

    if (errorDescription) {
      setAuthError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
      // Clean up URL parameters without full reload
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Check initial session & subscribe to auth state changes
  useEffect(() => {
    let mounted = true;

    // Safety fallback: ensure UI renders even if network handshake is delayed
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setAuthLoading(false);
      }
    }, 3000);

    async function initSession() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(initialSession);
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
        if (mounted) {
          setAuthError(err.message || 'Unable to retrieve your authentication session.');
        }
      } finally {
        if (mounted) {
          clearTimeout(safetyTimer);
          setAuthLoading(false);
        }
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch tasks for the authenticated user
  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) {
      setTasks([]);
      return;
    }

    try {
      setTasksLoading(true);
      setTasksError(null);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTasks(data || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setTasksError(
        err.message || 'Failed to load your tasks. Please check your connection and retry.'
      );
    } finally {
      setTasksLoading(false);
    }
  }, [session?.user?.id]);

  // Load tasks whenever the active session user changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [session?.user?.id, fetchTasks]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setTasks([]);
    } catch (err) {
      console.error('Logout error:', err);
      setAuthError(err.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Immediate UI update after task creation
  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  // Immediate UI update after task status change
  const handleStatusUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }} role="status">
        <div className="spinner" aria-hidden="true"></div>
        <p>Checking authentication session...</p>
      </div>
    );
  }

  // Unauthenticated: Show Login screen
  if (!session) {
    return <Login authError={authError} />;
  }

  // Authenticated: Show Task Dashboard
  return (
    <div className="app-container">
      <Header
        user={session.user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="main-content">
        {authError && (
          <Alert
            type="error"
            message={authError}
            onClose={() => setAuthError(null)}
          />
        )}

        {/* Task Creation Section */}
        <section aria-labelledby="create-task-heading">
          <TaskForm
            user={session.user}
            onTaskCreated={handleTaskCreated}
          />
        </section>

        {/* Task List Section */}
        <section aria-labelledby="task-list-heading">
          <TaskList
            tasks={tasks}
            isLoading={tasksLoading}
            error={tasksError}
            onRetry={fetchTasks}
            onStatusUpdated={handleStatusUpdated}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>TaskFlow &bull; Graduate Support Engineer Assessment &bull; Powered by Supabase &amp; React</p>
      </footer>
    </div>
  );
}
