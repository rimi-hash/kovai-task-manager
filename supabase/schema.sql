-- ========================================================================
-- Task Management Application - Database Schema & Row Level Security (RLS)
-- Assessment: Graduate Support Engineer Trainee
-- ========================================================================

-- 1. Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Complete')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Add indexes for performance optimization
-- Fast lookup by authenticated user
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
-- Fast ordering by creation timestamp
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 3. Enable Row Level Security (Mandatory for multi-tenant data isolation)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Ensure users can ONLY access and modify their own records

-- Policy 1: Authenticated users can only read/select their own tasks
CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can only insert tasks where user_id matches their own UID
CREATE POLICY "Users can insert their own tasks"
    ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can only update their own tasks
CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can only delete their own tasks
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Trigger to automatically update updated_at timestamp on record modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Grant appropriate permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;

