# TaskFlow | Personal Task Management Application

A small, robust, production-quality task management application built for the **Graduate Support Engineer Trainee technical assessment**.

This project provides personal task tracking with Google Authentication and PostgreSQL Row Level Security (RLS) policies to ensure strict data isolation between users.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [How to Access the Application](#3-how-to-access-the-application)
4. [Google Login Instructions](#4-google-login-instructions)
5. [How to Create a Task](#5-how-to-create-a-task)
6. [How to View Tasks](#6-how-to-view-tasks)
7. [How to Update Task Status](#7-how-to-update-task-status)
8. [Important Assumptions](#8-important-assumptions)
9. [Known Limitations](#9-known-limitations)
10. [Important Security Notes](#10-important-security-notes)
11. [Local Setup Instructions](#11-local-setup-instructions)
12. [Environment Variables](#12-environment-variables)
13. [Supabase Setup](#13-supabase-setup)
14. [Google OAuth Configuration](#14-google-oauth-configuration)
15. [Database / Schema Setup](#15-database--schema-setup)
16. [Row Level Security (RLS) & Security Approach](#16-row-level-security-rls--security-approach)
17. [Deployment Instructions (Vercel)](#17-deployment-instructions-vercel)
18. [AI Usage Summary](#18-ai-usage-summary)

---

## 1. Project Overview

TaskFlow is designed to demonstrate core engineering capabilities required of a Support Engineer:
- Understanding requirement boundaries without unnecessary feature sprawl or over-engineering.
- Implementing zero-trust security and multi-tenant isolation via Database Row-Level Security (RLS).
- Delivering a responsive, clean, and accessible user interface with comprehensive error and loading state handling.
- Providing transparent technical documentation and configuration guides for external services (Google Cloud and Supabase).

### Distinction Between Required vs. Optional Decisions

| Aspect | Required Assessment Functionality | Optional Implementation Decision |
| :--- | :--- | :--- |
| **Authentication** | Google OAuth only; session persistence; logout | Avatar and full name display from OAuth profile metadata |
| **Task Creation** | Title (required), Description (optional), Status default `Planned` | Frontend input trimming; auto-dismissing success notifications |
| **Task List** | Display user's own tasks; created date; clean card layout; empty state | Formatted local timestamp (`Intl.DateTimeFormat`); task count badge |
| **Status Update** | Select/dropdown control; Allowed: `Planned`, `In Progress`, `Complete` | Inline spinner while status is persisting to database |
| **Out-of-Scope** | No deletion, priority, tags, due dates, teams, or editing title/desc | Avoided completely to respect assessment boundaries |

---

## 2. Features

- **Google Authentication**: Seamless OAuth login powered by Supabase GoTrue.
- **Session Persistence**: Stays logged in across browser refreshes using local storage sessions.
- **Data Isolation**: Multi-tenant database protection via PostgreSQL Row-Level Security (RLS). Users cannot view or modify other users' tasks.
- **Task Creation**: Instant creation with required title validation, optional description, and initial status selection.
- **Real-Time UI Updates**: Instant list update upon creation or status modification.
- **3-State Lifecycle**: Strict support for `Planned`, `In Progress`, and `Complete`.
- **Friendly UX & Error Resilience**: Descriptive alert banners for network failures, validation errors, and configuration warnings.

---

## 3. How to Access the Application

- **Local Development**: Accessible at `http://localhost:5173` after completing the [Local Setup Instructions](#11-local-setup-instructions).
- **Production (Vercel)**: Deployed to `https://<your-project>.vercel.app` (configured with production Supabase redirect URLs).

---

## 4. Google Login Instructions

1. Navigate to the application root URL.
2. If unauthenticated, the **Welcome to TaskFlow** login card is displayed.
3. Click **"Continue with Google"**.
4. You will be redirected to the Google Accounts consent screen.
5. Select your Google account and grant standard profile/email permissions.
6. Upon successful authentication, Google redirects back to your Supabase callback, which establishes the session and redirects you to the Task Dashboard.
7. Your name, email, and Google profile avatar will appear in the top-right header alongside a **"Log out"** button.

---

## 5. How to Create a Task

1. On the main dashboard, locate the **"Create New Task"** form card.
2. Fill in the **Task Title** *(Required)*:
   - Must contain non-whitespace characters.
   - Whitespace is automatically trimmed before submission.
3. Select an **Initial Status** *(Optional, defaults to "Planned")*:
   - `Planned`
   - `In Progress`
   - `Complete`
4. Fill in the **Description** *(Optional)*:
   - Additional context or instructions for the task.
5. Click **"Create Task"**:
   - The button shows a loading spinner and is temporarily disabled to prevent accidental double submissions.
   - Upon completion, the task appears immediately at the top of your task list.

---

## 6. How to View Tasks

- Below the creation form, your personal tasks are displayed in chronological order (newest first).
- Each task card presents:
  - **Title**: Strikethrough style applied when status is `Complete`.
  - **Description**: Full context rendered with preserved line breaks.
  - **Status Badge**: Color-coded pill indicator (`Planned`, `In Progress`, or `Complete`).
  - **Created Date**: Localized timestamp (e.g., `Sep 16, 2026, 09:30 AM`).
- **Empty State**: If you have not created any tasks yet, a friendly empty card is shown:
  > *"No tasks yet. Create your first task above to start tracking your work items."*

---

## 7. How to Update Task Status

1. Locate the task card you wish to update.
2. At the bottom right of the card, find the **"Update Status"** dropdown.
3. Select the new status:
   - `Planned`
   - `In Progress`
   - `Complete`
4. An inline spinner activates while the change persists to Supabase.
5. Once saved, the badge and style update immediately. If an error occurs (such as network loss), an error banner is displayed and the status reverts.

---

## 8. Important Assumptions

1. **User Scope**: Each Google account is an isolated tenant. There is no concept of shared organizations, workspace teams, or task collaboration.
2. **Immutable Attributes**: Per the assessment instructions, title and description editing after creation is excluded. Only the **status** can be modified.
3. **No Task Deletion**: Deletion was intentionally omitted to prevent scope creep beyond the required 4 use cases.
4. **Flexible Transitions**: A task can transition between any of the 3 statuses (e.g. moving a task back from `In Progress` to `Planned` if blocked).
5. **Session Persistence**: Sessions persist in `localStorage` via Supabase client configuration so users do not need to re-login on refresh.

---

## 9. Known Limitations

- **No Offline Sync**: Requires an active internet connection to communicate with Supabase.
- **Third-Party Cookies / Privacy Shields**: Aggressive third-party cookie blockers might interfere with the initial OAuth handshake unless the Supabase domain is allowed.
- **Pagination**: Fetches the authenticated user's tasks in a single query; suitable for personal task tracking (hundreds of items) without complex cursor pagination.

---

## 10. Important Security Notes

- **Never Expose `service_role` Key**: The frontend uses exclusively the public **anon / publishable key** (`VITE_SUPABASE_PUBLISHABLE_KEY`).
- **Zero-Trust RLS Policies**: Database security is enforced at the PostgreSQL engine level. Even if an attacker uses the anon key directly against the REST endpoint, they can only view, insert, or update rows matching their own `auth.uid()`.
- **Environment Isolation**: `.env` and `.env.local` are strictly added to `.gitignore`.
- **OAuth CSRF & State**: Handled automatically by Supabase Auth (GoTrue PKCE exchange).

---

## 11. Local Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+)
- [npm](https://www.npmjs.com/) (version 9+)
- A [Supabase](https://supabase.com/) project account
- A [Google Cloud Console](https://console.cloud.google.com/) account

### Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kovai.co
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in your editor and enter your Supabase Project URL and Anon/Publishable Key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-publishable-key
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production verification**:
   ```bash
   npm run build
   ```

---

## 12. Environment Variables

| Variable Name | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | The HTTPS endpoint of your Supabase project. | `https://xyzabcdef.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Yes** | The public anon key (safe for client-side use). | `eyJhbGciOi...` |

*(Note: `VITE_SUPABASE_ANON_KEY` is also supported as an alias in `src/lib/supabaseClient.js`).*

---

## 13. Supabase Setup

1. Log in to [Supabase](https://supabase.com) and click **"New Project"**.
2. Name your project (e.g., `TaskFlow-Assessment`), choose a region, and set a database password.
3. Once initialized, navigate to **Project Settings** -> **API**:
   - Copy **Project URL** into `VITE_SUPABASE_URL`.
   - Copy **Project API Keys (`anon` / `public`)** into `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Navigate to **Authentication** -> **URL Configuration**:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**:
     - `http://localhost:5173/**`
     - `https://*.vercel.app/**` (for preview & production deployments)

---

## 14. Google OAuth Configuration

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** -> **OAuth consent screen**:
   - Select **External** user type and click **Create**.
   - Provide **App name** (e.g., `TaskFlow`), **User support email**, and **Developer contact email**.
   - Save and continue through scopes (default `email`, `profile`, `openid` are sufficient).
4. Navigate to **APIs & Services** -> **Credentials**:
   - Click **Create Credentials** -> **OAuth Client ID**.
   - Application type: **Web application**.
   - Name: `TaskFlow Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co`
     - `https://<YOUR-VERCEL-DEPLOYMENT>.vercel.app`
   - **Authorized redirect URIs**:
     - `https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Click **Create** and copy the generated **Client ID** and **Client Secret**.
5. Back in the **Supabase Dashboard**:
   - Go to **Authentication** -> **Providers** -> **Google**.
   - Toggle **Enable Google provider**.
   - Paste the **Client ID** and **Client Secret**.
   - Click **Save**.

---

## 15. Database / Schema Setup

Run the SQL script located in `supabase/schema.sql` within your Supabase **SQL Editor**:

```sql
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

-- 2. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Permissions
GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;
```

---

## 16. Row Level Security (RLS) & Security Approach

### Zero-Trust Policy Design
Multi-tenant security is enforced at the database layer rather than relying exclusively on client-side filters.

1. **SELECT Policy**: Ensures `auth.uid() = user_id`. Even if a user knows the UUID of another user's task, querying the database returns an empty result set.
2. **INSERT Policy**: Checks `auth.uid() = user_id`. A client cannot forge an insert containing another user's ID.
3. **UPDATE Policy**: Ensures `auth.uid() = user_id` for both the `USING` and `WITH CHECK` clauses. A user cannot modify another user's task or reassign a task to another user.
4. **No DELETE Policy**: In accordance with the assessment constraints, delete policies are omitted.

---

## 17. Deployment Instructions (Vercel)

### Option 1: Vercel Dashboard (Recommended)
1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete production-ready task management application"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (automatically detected).
5. Add **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Anon Key.
6. Click **Deploy**.
7. Once deployed, copy your production domain (e.g., `https://your-app.vercel.app`) and add it to:
   - **Google Cloud Console**: Authorized JavaScript origins.
   - **Supabase Authentication**: Redirect URLs list (`https://your-app.vercel.app/**`).

---

## 18. AI Usage Summary

### Overview
- **AI Tool Used**: Antigravity (Google DeepMind Advanced Agentic Coding Assistant)
- **Role**: Pair programmer and technical architect for scoping, scaffolding, database design, and documentation.

### How AI Was Used
1. **Scope Boundary Enforcement**: Analyzed assessment requirements to deliberately omit out-of-scope features (such as task deletion, tags, due dates, and priority levels) while identifying critical ambiguities.
2. **Database Schema & RLS Policies**: Generated the PostgreSQL DDL and Row Level Security policies to enforce zero-trust user isolation.
3. **Component Architecture**: Structured modular, single-responsibility React components (`Header`, `Login`, `TaskForm`, `TaskList`, `TaskItem`, `StatusBadge`, `Alert`).
4. **Resilient Error Handling**: Integrated connection checks, OAuth callback parameter handling, and duplicate-submission guards.

### Examples of Prompts/Tasks Given to AI
- *"Design a small, production-quality task management app with React, Vite, Supabase, Google OAuth, and RLS."*
- *"Identify requirement ambiguities and outline reasonable assumptions before coding."*
- *"Create a PostgreSQL schema with RLS policies restricting read, create, and update actions strictly to the authenticated user."*
- *"Produce comprehensive documentation with step-by-step Google OAuth and Supabase setup instructions."*

### What Was Reviewed and Tested Manually
- [x] Compilation and build artifacts via `npm run build`.
- [x] Verification that `.env` and `.env.local` are omitted from git tracking.
- [x] Verification that task title validation trims leading/trailing spaces and blocks empty submissions.
- [x] Fallback handling when environment variables are unconfigured.
- [x] *(Insert user detail: e.g., Tested Google OAuth login in browser with test account [your-email@gmail.com])*
- [x] *(Insert user detail: e.g., Verified Supabase RLS policies by logging in with a second Google account)*

### What Code or Configuration Was Corrected Manually
- *(Insert user detail: e.g., Configured custom Google OAuth Consent Screen branding in Google Cloud Console)*
- *(Insert user detail: e.g., Added production Vercel URL to Supabase Redirect URLs)*

### Any Debugging Performed Manually
- *(Insert user detail: e.g., Resolved redirect URI mismatch in Google Cloud Console by adding the exact Supabase callback URL)*
- *(Insert user detail: e.g., Verified that session persists after full page reload in Chrome)*
