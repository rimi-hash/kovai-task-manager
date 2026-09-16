import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import Login from './components/Login';
import TaskStats from './components/TaskStats';
import TaskControls from './components/TaskControls';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import Alert from './components/Alert';

export default function App() {
  // Authentication state
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Theme state (Dark / Light) - Feature 14
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('taskflow_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast notifications state (Feature 10)
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Search, Filter & Sort states (Features 1, 2, 3)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');

  // Modal states for Create & Edit (Features 6, 8)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('create');
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskModalError, setTaskModalError] = useState(null);

  // Modal state for Delete confirmation (Feature 7)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState(null);

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
      addToast('Signed out successfully.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
      setAuthError(err.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Immediate UI update after inline status change
  const handleStatusUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    addToast(`Status changed to "${updatedTask.status}"`, 'success');
  };

  // Modal open handlers
  const handleOpenCreate = () => {
    setTaskModalMode('create');
    setTaskToEdit(null);
    setTaskModalError(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskModalMode('edit');
    setTaskToEdit(task);
    setTaskModalError(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setDeleteModalError(null);
    setIsDeleteModalOpen(true);
  };

  // Save handler (Create or Edit)
  const handleSaveTask = async (payload) => {
    if (!session?.user?.id) return;

    try {
      setIsSavingTask(true);
      setTaskModalError(null);

      if (taskModalMode === 'create') {
        const insertPayload = {
          user_id: session.user.id,
          title: payload.title,
          description: payload.description,
          status: payload.status,
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert([insertPayload])
          .select()
          .single();

        if (error) throw error;

        setTasks((prev) => [data, ...prev]);
        setIsTaskModalOpen(false);
        addToast('Task created successfully!');
      } else {
        // Edit mode
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: payload.title,
            description: payload.description,
            status: payload.status,
          })
          .eq('id', payload.id)
          .select()
          .single();

        if (error) throw error;

        setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
        setIsTaskModalOpen(false);
        addToast('Task updated successfully!');
      }
    } catch (err) {
      console.error('Task save error:', err);
      setTaskModalError(err.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSavingTask(false);
    }
  };

  // Delete confirm handler (Feature 7)
  const handleConfirmDelete = async (task) => {
    try {
      setIsDeletingTask(true);
      setDeleteModalError(null);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      addToast('Task deleted successfully.', 'success');
    } catch (err) {
      console.error('Task delete error:', err);
      setDeleteModalError(
        err.message || 'Unable to delete task. Please try again.'
      );
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Compute Task Statistics (Feature 4)
  const stats = useMemo(() => {
    const total = tasks.length;
    let planned = 0;
    let inProgress = 0;
    let complete = 0;

    for (const t of tasks) {
      if (t.status === 'Planned') planned++;
      else if (t.status === 'In Progress') inProgress++;
      else if (t.status === 'Complete') complete++;
    }

    return { total, planned, inProgress, complete };
  }, [tasks]);

  // Client-side Search, Filter, and Sort (Features 1, 2, 3)
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search Filter (Title & Description)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // 2. Status Filter
    if (activeFilter !== 'All') {
      result = result.filter((t) => t.status === activeFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortOption === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [tasks, searchQuery, activeFilter, sortOption]);

  // Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split('@')[0] ||
    'there';

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

  // Authenticated: Show Polished SaaS Task Dashboard
  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Header
        user={session.user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {authError && (
          <Alert
            type="error"
            message={authError}
            onClose={() => setAuthError(null)}
          />
        )}

        {/* Welcome / Header Section */}
        <section className="welcome-hero" aria-label="Dashboard overview">
          <div>
            <h1 className="welcome-greeting">
              {greeting}, {userName}
            </h1>
            <p className="welcome-subtitle">
              Manage your tasks and keep your work organized.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreate}
            aria-label="Create a new task"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create Task</span>
          </button>
        </section>

        {/* Summary Statistics Section (Feature 4) */}
        <TaskStats
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Task Management Controls Bar: Search, Filter, Sort (Features 1, 2, 3) */}
        <TaskControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalResultsCount={processedTasks.length}
        />

        {/* Task List Section (Features 5, 9, 11) */}
        <section aria-label="Task list">
          <TaskList
            tasks={processedTasks}
            totalTasksCount={tasks.length}
            isLoading={tasksLoading}
            error={tasksError}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onResetSearch={() => setSearchQuery('')}
            onResetFilter={() => setActiveFilter('All')}
            onOpenCreate={handleOpenCreate}
            onRetry={fetchTasks}
            onStatusUpdated={handleStatusUpdated}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </section>
      </main>

      {/* Create / Edit Modal (Features 6, 8) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        mode={taskModalMode}
        initialTask={taskToEdit}
        onSave={handleSaveTask}
        onClose={() => setIsTaskModalOpen(false)}
        isSaving={isSavingTask}
        errorMessage={taskModalError}
      />

      {/* Delete Confirmation Modal (Feature 7) */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        isDeleting={isDeletingTask}
        errorMessage={deleteModalError}
      />

      {/* Toast Notifications (Feature 10) */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="app-footer">
        <p>TaskFlow &bull; Graduate Support Engineer Assessment &bull; Powered by Supabase &amp; React</p>
      </footer>
    </div>
  );
}
