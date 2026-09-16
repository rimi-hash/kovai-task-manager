# TaskFlow | Production-Ready SaaS Task Management Application

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://kovai-task-manager.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/rimi-hash/kovai-task-manager)
[![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_Vite_|_Supabase_|_PostgreSQL-blue?style=for-the-badge)](https://github.com/rimi-hash/kovai-task-manager)

> Built for the **Graduate Support Engineer Trainee Technical Assessment**.  
> Demonstrates production engineering discipline, zero-trust security via Row-Level Security (RLS), intuitive SaaS UI/UX design, and AI-assisted development.

---

## Live Links & Quick Access

- **Production URL**: [https://kovai-task-manager.vercel.app/](https://kovai-task-manager.vercel.app/)
- **GitHub Repository**: [https://github.com/rimi-hash/kovai-task-manager](https://github.com/rimi-hash/kovai-task-manager)
- **Local Development**: `http://localhost:5173/`

---

## Table of Contents

1. [Project Overview & Engineering Rationale](#1-project-overview--engineering-rationale)
2. [Feature Walkthrough](#2-feature-walkthrough)
   - [Core Assessment Requirements](#core-assessment-requirements)
   - [SaaS Usability Enhancements](#saas-usability-enhancements)
3. [User Experience & Usage Guide](#3-user-experience--usage-guide)
   - [Google Sign-In Flow](#google-sign-in-flow)
   - [Creating a Task](#creating-a-task)
   - [Managing Statuses & Editing](#managing-statuses--editing)
   - [Deleting Tasks Securely](#deleting-tasks-securely)
   - [Search, Filters & Sorting](#search-filters--sorting)
4. [Architecture & System Design](#4-architecture--system-design)
5. [Database Schema & Row Level Security (RLS)](#5-database-schema--row-level-security-rls)
6. [Security & Zero-Trust Posture](#6-security--zero-trust-posture)
7. [Requirement Ambiguities & Engineering Assumptions](#7-requirement-ambiguities--engineering-assumptions)
8. [Known Limitations](#8-known-limitations)
9. [Local Setup & Developer Instructions](#9-local-setup--developer-instructions)
10. [Environment Variables](#10-environment-variables)
11. [Supabase & Google Cloud Configuration Guide](#11-supabase--google-cloud-configuration-guide)
12. [Vercel Deployment Guide](#12-vercel-deployment-guide)
13. [AI Usage Summary](#13-ai-usage-summary)

---

## 1. Project Overview & Engineering Rationale

TaskFlow addresses the need for a focused, multi-tenant personal task manager. Rather than relying on heavyweight server infrastructure or insecure client-side access control, the architecture delegates identity and data persistence directly to **Supabase (PostgreSQL + GoTrue)** with **PostgreSQL Row Level Security (RLS)** enforcing tenant isolation at the database engine level.

### Distinction: Required Assessment Features vs. Polished SaaS Decisions

| Aspect | Required Assessment Baseline | Enhanced SaaS Decisions |
| :--- | :--- | :--- |
| **Authentication** | Google OAuth, session persistence, logout | Google profile avatar, greeting based on time of day, session auto-recovery |
| **Task Creation** | Title (required), Description (optional), Status default `Planned` | Dedicated modal with character counter (200 / 1000 chars), double-submission locks |
| **Task List** | Display user's own tasks; created date; clean layout; empty state | Strikethrough for complete tasks, relative/formatted timestamps, skeleton pulse loaders |
| **Status Update** | Select dropdown; Allowed: `Planned`, `In Progress`, `Complete` | Instant persistence, inline spinner, auto-dismissing feedback toasts |
| **Task Operations** | View & Status change only | In-place Task Editing + Safe Deletion with confirmation modal |
| **Search & Organization** | Not specified in baseline | Client-side real-time search, status filter tabs, 4-way sorting |
| **Workspace Analytics** | Not specified in baseline | Real-time computed metric cards (`Total`, `Planned`, `In Progress`, `Complete`) |
| **Accessibility / Theme** | Clean readable interface | Accessible Dark/Light mode theme toggle persisted in `localStorage` |

---

## 2. Feature Walkthrough

### Core Assessment Requirements
- **Google Authentication**: One-click sign in using Google OAuth via Supabase GoTrue PKCE exchange.
- **Session Persistence**: Stays logged in across browser reloads using encrypted local tokens.
- **Task Creation**: Validate title presence (trimmed, non-empty) with default `Planned` status.
- **Task List**: Chronological card feed isolated to the authenticated user.
- **3-State Lifecycle**: Strict enforcement of the exact assessment statuses:
  - `Planned`
  - `In Progress`
  - `Complete`

### SaaS Usability Enhancements
- **Task Search**: Instant real-time search across task title and description with an inline clear button.
- **Status Filtering**: Quick-filter tabs (`All`, `Planned`, `In Progress`, `Complete`).
- **Sorting**: Client-side ordering (`Newest first`, `Oldest first`, `Title: A → Z`, `Title: Z → A`).
- **Live Statistics**: Metric tiles showing active task counts with click-to-filter capability.
- **Edit Task**: Pre-filled modal allowing modification of title, description, and status.
- **Delete Task**: Protected deletion requiring confirmation dialog, guarded by database RLS.
- **Toast Notifications**: Non-blocking alerts for task actions (create, edit, delete, status change).
- **Skeleton Loaders**: Polished shimmering placeholders during database queries.
- **Dark/Light Theme**: Accessible system tokens persisted locally with zero flash of unstyled content.

---

## 3. User Experience & Usage Guide

### Google Sign-In Flow
1. Navigate to [https://kovai-task-manager.vercel.app/](https://kovai-task-manager.vercel.app/).
2. Unauthenticated visitors are greeted by the clean **Welcome to TaskFlow** card.
3. Click **"Continue with Google"**.
4. Authorize via your Google Account.
5. Google returns you directly to your authenticated TaskFlow dashboard.

### Creating a Task
1. Click the **"+ Create Task"** button in the top header hero banner.
2. Enter a **Task Title** *(Required, up to 200 characters)*. Whitespace is automatically trimmed.
3. Select an **Initial Status** (`Planned`, `In Progress`, or `Complete`).
4. Enter an optional **Description** *(Up to 1000 characters)*.
5. Click **"Create Task"**. The UI prepends the task immediately and fires a confirmation toast.

### Managing Statuses & Editing
- **Changing Status**: Use the inline dropdown on any task card. The status badge and card style update in real time with an inline spinner.
- **Editing Details**: Click the pencil icon on the task card to open the Edit Modal. Modify the title or description and click **"Save Changes"**.

### Deleting Tasks Securely
1. Click the trash icon on the task card.
2. A confirmation modal appears: *"Delete this task? Are you sure you want to delete [Title]?"*
3. Click **"Delete Task"** to confirm or **"Cancel"** to abort.
4. The task is removed from the database and UI, and the task metrics update automatically.

### Search, Filters & Sorting
- Type in the search input to filter tasks instantly by keywords in either title or description.
- Click any status tab (`Planned`, `In Progress`, `Complete`) or click a statistic tile above to filter.
- Use the sort dropdown to order items alphabetically or chronologically.

---

## 4. Architecture & System Design

TaskFlow utilizes a modern serverless Single Page Application (SPA) architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client (React 19 + Vite)                      │
│                                                                        │
│   ┌───────────────────────┐            ┌───────────────────────────┐   │
│   │       Login.jsx       │            │        Dashboard          │   │
│   │ (Google OAuth Button) │            │  - Welcome Hero Banner    │   │
│   └───────────┬───────────┘            │  - TaskStats.jsx (Metrics)│   │
│               │                        │  - TaskControls (Search)  │   │
│               │                        │  - TaskList / TaskItem    │   │
│               │                        │  - TaskModal & DeleteModal│   │
│               │                        │  - Toast Notifications    │   │
│               │                        └─────────────┬─────────────┘   │
│               └────────────────┬─────────────────────┘                 │
│                                ▼                                       │
│                      lib/supabaseClient.js                             │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │ HTTPS / WSS
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Supabase Cloud Platform                         │
│                                                                        │
│   ┌────────────────────────────────┐  ┌────────────────────────────┐   │
│   │      Supabase Auth (GoTrue)    │  │     PostgreSQL Database    │   │
│   │  - Google OAuth Handshake      │  │  - Table: public.tasks     │   │
│   │  - PKCE Token Verification     │  │  - Row Level Security (RLS)│   │
│   │  - Session JWT Management      │  │  - Auto-update triggers    │   │
│   └────────────────────────────────┘  └────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema & Row Level Security (RLS)

The database schema is defined in [`supabase/schema.sql`](file:///c:/Users/user/Desktop/kovai.co/supabase/schema.sql):

```sql
-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Complete')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Absolute tenant data isolation
-- SELECT: Users can only read their own tasks
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Users can only insert tasks where user_id matches their own UID
CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own tasks
CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own tasks
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 5. Auto-update trigger for updated_at
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
```

---

## 6. Security & Zero-Trust Posture

1. **No Service-Role Secrets in Client Code**:
   The frontend only bundles the publishable anon key (`VITE_SUPABASE_PUBLISHABLE_KEY`). The service role key is **never** committed or exposed.
2. **Database Engine Enforcement**:
   Even if a malicious user uses the public key to craft manual curl requests against the Supabase REST API, PostgreSQL rejects reads, writes, and deletes on rows where `auth.uid() != user_id`.
3. **Strict Check Constraints**:
   Status values are strictly checked at the database level (`CHECK (status IN ('Planned', 'In Progress', 'Complete'))`), preventing invalid state injections.
4. **Environment Protection**:
   `.env` and `.env.local` are strictly ignored by `.gitignore`.

---

## 7. Requirement Ambiguities & Engineering Assumptions

| Ambiguity Identified | Engineering Decision / Assumption |
| :--- | :--- |
| **OAuth Redirect Across Environments** | Dynamic `window.location.origin` redirect passed to Supabase ensures seamless compatibility on localhost, preview URLs, and Vercel production without hardcoded domains. |
| **Status Progression** | Rather than forcing unidirectional progress (`Planned` → `In Progress` → `Complete`), users can transition freely in case a task is blocked or re-opened. |
| **Task Deletion** | Added with a mandatory confirmation modal and guarded by explicit DELETE RLS policy to ensure security. |
| **Out-of-Scope Restraint** | Intentionally refrained from implementing enterprise scope bloat (teams, organizations, subtasks, file attachments, billing) to keep the project concise and robust for the assessment. |

---

## 8. Known Limitations

- **Internet Dependency**: Does not implement offline-first IndexedDB background syncing; requires an active internet connection to communicate with Supabase.
- **Single-Tenant Workspace**: Does not provide cross-user collaboration or task assignment (by design).
- **Pagination**: Fetches the authenticated user's tasks in a single query; optimal for personal task management (hundreds of items) without complex pagination cursors.

---

## 9. Local Setup & Developer Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v20+)
- [npm](https://www.npmjs.com/) (v9+)
- A Supabase project and Google Cloud OAuth credentials

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rimi-hash/kovai-task-manager.git
   cd kovai-task-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-publishable-key>
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

5. **Build for production verification**:
   ```bash
   npm run build
   ```

---

## 10. Environment Variables

| Variable Name | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | HTTPS endpoint of the Supabase project | `https://gtdwdgkpubwnqnamfkji.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Yes** | Public/Anon API key (safe for client use) | `sb_publishable_1-4Dzv5pnj...` |

*(Note: `VITE_SUPABASE_ANON_KEY` is also supported as an alias).*

---

## 11. Supabase & Google Cloud Configuration Guide

### A. Google Cloud Console Setup
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth Client ID** of type **Web application**.
3. Set **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://kovai-task-manager.vercel.app`
   - `https://<YOUR-PROJECT-REF>.supabase.co`
4. Set **Authorized redirect URIs**:
   - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
5. Copy the generated **Client ID** and **Client Secret**.

### B. Supabase Dashboard Setup
1. Go to **Authentication** → **Providers** → **Google**:
   - Toggle **Enable Sign in with Google** to **ON**.
   - Paste **Client ID** and **Client Secret**, then click **Save**.
2. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `https://kovai-task-manager.vercel.app`
   - **Redirect URLs**:
     - `https://kovai-task-manager.vercel.app/**`
     - `http://localhost:5173/**`
3. Go to **SQL Editor** and execute `supabase/schema.sql`.

---

## 12. Vercel Deployment Guide

1. Push your latest code to GitHub:
   ```bash
   git push origin main
   ```
2. In [Vercel Dashboard](https://vercel.com/new), click **"Add New Project"** and import `rimi-hash/kovai-task-manager`.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**.
5. SPA client-side routing is handled cleanly by [`vercel.json`](file:///c:/Users/user/Desktop/kovai.co/vercel.json).

---

## 13. AI Usage Summary

### Overview
- **AI Tool Used**: Antigravity (Google DeepMind Advanced Agentic Coding Assistant)
- **Role**: AI Pair Programmer & Technical Architect for scoping, code generation, debugging, security auditing, and documentation.

### How AI Was Used
1. **Requirements & Ambiguity Analysis**: Analyzed assessment boundaries, identified OAuth redirect handling nuances, and established strict status mappings.
2. **Database & Security Design**: Authored the PostgreSQL schema, indexes, updated_at triggers, and verified RLS tenant isolation.
3. **Full-Stack Implementation**: Generated modular React 19 components (`Header`, `TaskStats`, `TaskControls`, `TaskList`, `TaskItem`, `TaskModal`, `DeleteModal`, `Toast`, `StatusBadge`).
4. **Issue Diagnosis & Debugging**: Diagnosed port collision issues (PID 17388 running previous `task-frontend`) and identified Supabase OAuth redirect fallback mechanisms.
5. **Production Hardening**: Verified `npm run build`, tested zero-leakage git ignore policies, and ensured full mobile/desktop responsiveness.

### What Was Reviewed and Tested Manually
- [x] End-to-end Google OAuth login handshake redirecting to Google Accounts and returning to app.
- [x] Verification of multi-tenant RLS by attempting unauthenticated insertions (blocked with `42501`).
- [x] Live testing of task creation, status updates, title/desc editing, and deletion confirmation.
- [x] Responsive layout verification on mobile (Chrome mobile) and desktop browsers.
- [x] Theme switcher toggle (dark mode vs light mode) with local persistence.
