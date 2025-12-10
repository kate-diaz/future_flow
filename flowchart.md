# Future Flow - System Flowcharts

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Student User Flow](#student-user-flow)
4. [Admin User Flow](#admin-user-flow)
5. [Opportunity Application Flow](#opportunity-application-flow)
6. [Goal Management Flow](#goal-management-flow)
7. [Database Schema Relationships](#database-schema-relationships)
8. [API Request Flow](#api-request-flow)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│  React + TypeScript + Vite                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Wouter     │  │ TanStack     │  │  React Hook  │      │
│  │   Routing    │  │   Query      │  │    Form      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │   shadcn/ui + Radix UI + Tailwind CSS            │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                          │
├─────────────────────────────────────────────────────────────┤
│  Express.js + TypeScript                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Session    │  │     Auth     │  │    Routes    │      │
│  │   Store      │  │  Middleware  │  │   Handler    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Drizzle ORM (storage.ts)                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  Tables: users, goals, careers, opportunities,               │
│          resources, training_programs, academic_modules,     │
│          saved_opportunities, opportunity_applications       │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
START
  │
  ├─→ User visits site
  │     │
  │     ├─→ GET /api/auth/me
  │     │     │
  │     │     ├─→ Session exists?
  │     │     │     │
  │     │     │     ├─ YES → Return user data → Redirect to /dashboard
  │     │     │     │
  │     │     │     └─ NO → Return 401 → Show /auth page
  │     │
  │     └─→ User on /auth page
  │           │
  │           ├─→ [Login Tab]
  │           │     │
  │           │     ├─→ Enter email + password
  │           │     ├─→ POST /api/auth/login
  │           │     │     │
  │           │     │     ├─→ Verify credentials
  │           │     │     │     │
  │           │     │     │     ├─ Valid → Create session → Return user
  │           │     │     │     │                             │
  │           │     │     │     │                             └─→ Redirect to /dashboard
  │           │     │     │     │
  │           │     │     │     └─ Invalid → Return 401 → Show error
  │           │
  │           └─→ [Register Tab]
  │                 │
  │                 ├─→ Enter email, password, fullName, role
  │                 ├─→ POST /api/auth/register
  │                 │     │
  │                 │     ├─→ Hash password (bcrypt)
  │                 │     ├─→ Create user in database
  │                 │     ├─→ Create session
  │                 │     └─→ Return user → Redirect to /dashboard
  │
  ├─→ Protected Route Access
  │     │
  │     ├─→ requireAuth middleware
  │     │     │
  │     │     ├─→ Session valid?
  │     │     │     │
  │     │     │     ├─ YES → Proceed to route handler
  │     │     │     │
  │     │     │     └─ NO → Return 401
  │
  └─→ Logout
        │
        ├─→ POST /api/auth/logout
        ├─→ Destroy session
        └─→ Return 200 → Redirect to /auth
```

---

## Student User Flow

```
STUDENT DASHBOARD
  │
  ├─→ [Profile Management] (/profile)
  │     │
  │     ├─→ View profile summary
  │     ├─→ Edit GPA, skills, interests
  │     ├─→ Manage courses & certifications
  │     └─→ Update resume URL
  │
  ├─→ [Goals Management] (/goals)
  │     │
  │     ├─→ View all goals (short/long-term)
  │     ├─→ Create new goal
  │     │     │
  │     │     ├─→ Fill SMART fields (title, description, deadline, metrics)
  │     │     ├─→ Select related career
  │     │     ├─→ POST /api/goals
  │     │     └─→ Goal added to list
  │     │
  │     ├─→ Update goal progress
  │     │     │
  │     │     ├─→ Adjust progress percentage
  │     │     ├─→ PUT /api/goals/:id
  │     │     └─→ If 100% → Mark completed → Update skills count
  │     │
  │     └─→ Delete goal
  │           │
  │           └─→ DELETE /api/goals/:id
  │
  ├─→ [Career Exploration] (/careers)
  │     │
  │     ├─→ Browse career cards
  │     ├─→ Filter by required skills
  │     ├─→ View career details
  │     └─→ "Set as Goal" button
  │           │
  │           ├─→ Opens goal creation form
  │           ├─→ Career pre-selected
  │           └─→ POST /api/goals with careerId
  │
  ├─→ [Opportunities] (/opportunities)
  │     │
  │     ├─→ [All Opportunities Tab]
  │     │     │
  │     │     ├─→ GET /api/opportunities
  │     │     ├─→ Browse opportunity cards
  │     │     ├─→ Save opportunity (bookmark icon)
  │     │     │     │
  │     │     │     └─→ POST /api/opportunities/:id/save
  │     │     │
  │     │     └─→ Apply Now button → Opens application modal
  │     │
  │     ├─→ [Saved Tab]
  │     │     │
  │     │     ├─→ GET /api/opportunities/saved
  │     │     ├─→ View saved opportunities
  │     │     └─→ Unsave option
  │     │           │
  │     │           └─→ DELETE /api/opportunities/:id/save
  │     │
  │     └─→ [Requests Tab]
  │           │
  │           ├─→ GET /api/opportunity-applications/mine
  │           └─→ View submitted applications with status
  │
  ├─→ [Resources] (/resources)
  │     │
  │     ├─→ View resource library
  │     ├─→ Filter by type/category
  │     └─→ Download resource
  │           │
  │           ├─→ Show "Coming Soon" modal (download gated)
  │           └─→ POST /api/resources/:id/download (track download)
  │
  ├─→ [Academic Alignment] (/academic)
  │     │
  │     ├─→ View academic modules
  │     ├─→ Browse training programs
  │     └─→ View recommended learning paths
  │
  └─→ [Progress Tracking] (/progress)
        │
        ├─→ View overall progress percentage
        ├─→ Goals completion chart
        ├─→ Skills development timeline
        └─→ Career alignment metrics
```

---

## Admin User Flow

```
ADMIN DASHBOARD
  │
  ├─→ [Dashboard Overview] (/admin)
  │     │
  │     ├─→ GET /api/admin/stats
  │     │     │
  │     │     └─→ Display metrics:
  │     │           - Total Students
  │     │           - Total Goals
  │     │           - Total Careers
  │     │           - Total Opportunities
  │     │           - Total Resources
  │     │
  │     └─→ Top Students Leaderboard
  │           │
  │           └─→ Ranked by goals completion + GPA
  │
  ├─→ [Career Management] (/careers)
  │     │
  │     ├─→ View all careers
  │     ├─→ Create new career
  │     │     │
  │     │     ├─→ POST /api/careers
  │     │     └─→ Fields: title, description, required_skills, salary_range
  │     │
  │     ├─→ Edit career
  │     │     │
  │     │     └─→ PUT /api/careers/:id
  │     │
  │     └─→ Delete career
  │           │
  │           └─→ DELETE /api/careers/:id
  │
  ├─→ [Opportunity Management] (/opportunities)
  │     │
  │     ├─→ View all opportunities
  │     ├─→ Create new opportunity
  │     │     │
  │     │     ├─→ POST /api/opportunities
  │     │     └─→ Fields: title, company, description, type, deadline
  │     │
  │     ├─→ Edit opportunity
  │     │     │
  │     │     └─→ PUT /api/opportunities/:id
  │     │
  │     └─→ Delete opportunity
  │           │
  │           └─→ DELETE /api/opportunities/:id
  │
  ├─→ [Resource Management] (/resources)
  │     │
  │     ├─→ View all resources
  │     ├─→ Create new resource
  │     │     │
  │     │     ├─→ POST /api/resources
  │     │     └─→ Fields: title, description, type, url, category
  │     │
  │     ├─→ Edit resource
  │     │     │
  │     │     └─→ PUT /api/resources/:id
  │     │
  │     └─→ Delete resource
  │           │
  │           └─→ DELETE /api/resources/:id
  │
  ├─→ [Academic Modules] (/academic)
  │     │
  │     ├─→ View all modules
  │     ├─→ Create module
  │     │     │
  │     │     └─→ POST /api/academic-modules
  │     │
  │     ├─→ Edit module
  │     │     │
  │     │     └─→ PUT /api/academic-modules/:id
  │     │
  │     └─→ Delete module
  │           │
  │           └─→ DELETE /api/academic-modules/:id
  │
  ├─→ [Training Programs] (/academic)
  │     │
  │     ├─→ View all programs
  │     ├─→ Create program
  │     │     │
  │     │     └─→ POST /api/training-programs
  │     │
  │     ├─→ Edit program
  │     │     │
  │     │     └─→ PUT /api/training-programs/:id
  │     │
  │     └─→ Delete program
  │           │
  │           └─→ DELETE /api/training-programs/:id
  │
  └─→ [Student Management] (/students)
        │
        ├─→ View all students list
        ├─→ Click student row
        │     │
        │     └─→ Navigate to /students/:id
        │           │
        │           ├─→ View student profile
        │           ├─→ View student goals
        │           ├─→ View progress metrics
        │           └─→ View career matches
```

---

## Opportunity Application Flow

```
START: Student clicks "Apply Now" on opportunity
  │
  ├─→ Application Modal Opens
  │     │
  │     ├─→ [Profile Picture Upload]
  │     │     │
  │     │     ├─→ User selects image file
  │     │     ├─→ handleImageUpload() function
  │     │     │     │
  │     │     │     ├─→ Create FileReader
  │     │     │     ├─→ Load image to Canvas
  │     │     │     ├─→ Resize to max 400x400px (maintain aspect ratio)
  │     │     │     ├─→ Compress to JPEG 70% quality
  │     │     │     ├─→ Convert to base64 string
  │     │     │     └─→ Set preview + store base64
  │     │     │
  │     │     └─→ Display preview thumbnail
  │     │
  │     ├─→ [Resume URL Input]
  │     │     │
  │     │     └─→ Enter Google Drive/Dropbox link
  │     │
  │     └─→ [Cover Letter Textarea]
  │           │
  │           └─→ Enter application message
  │
  ├─→ User clicks "Submit Application"
  │     │
  │     ├─→ Form validation
  │     │     │
  │     │     ├─→ All fields filled?
  │     │     │     │
  │     │     │     ├─ NO → Show error
  │     │     │     │
  │     │     │     └─ YES → Continue
  │     │
  │     ├─→ POST /api/opportunities/:id/apply
  │     │     │
  │     │     ├─→ Request body:
  │     │     │     {
  │     │     │       profilePictureUrl: "data:image/jpeg;base64,...",
  │     │     │       resumeUrl: "https://...",
  │     │     │       coverLetter: "..."
  │     │     │     }
  │     │     │
  │     │     ├─→ Server validates session (requireAuth)
  │     │     ├─→ Insert into opportunityApplications table:
  │     │     │     - userId (from session)
  │     │     │     - opportunityId (from URL param)
  │     │     │     - profilePictureUrl (base64)
  │     │     │     - resumeUrl
  │     │     │     - coverLetter
  │     │     │     - status: "pending"
  │     │     │     - appliedAt: current timestamp
  │     │     │
  │     │     └─→ Return 201 with application data
  │     │
  │     ├─→ On success:
  │     │     │
  │     │     ├─→ Close application modal
  │     │     ├─→ Open success modal "Request Sent!"
  │     │     ├─→ Invalidate queries:
  │     │     │     - /api/opportunity-applications/mine
  │     │     │     - /api/opportunities
  │     │     │
  │     │     └─→ User can click "View My Requests"
  │     │           │
  │     │           └─→ Navigate to Requests tab
  │     │
  │     └─→ On error:
  │           │
  │           └─→ Show error toast
  │
  └─→ [View Applications in Requests Tab]
        │
        ├─→ GET /api/opportunity-applications/mine
        │     │
        │     ├─→ Query opportunityApplications table
        │     ├─→ Filter by userId = current user
        │     ├─→ Join with opportunities table
        │     └─→ Return applications with opportunity details
        │
        └─→ Display application cards:
              - Opportunity title
              - Company name
              - Application status badge
              - Applied date
              - Profile picture preview
```

---

## Goal Management Flow

```
CREATE GOAL
  │
  ├─→ User opens Goals page (/goals)
  ├─→ Clicks "Create Goal" button
  ├─→ Goal creation modal opens
  │     │
  │     ├─→ Fill form fields:
  │     │     - Title
  │     │     - Description
  │     │     - Type (short-term / long-term)
  │     │     - Timeline category
  │     │     - Target date (deadline)
  │     │     - Measurable metrics
  │     │     - Related career (optional)
  │     │     - Progress: 0%
  │     │     - Status: "in-progress"
  │     │
  │     ├─→ Submit form
  │     │     │
  │     │     ├─→ POST /api/goals
  │     │     │     │
  │     │     │     ├─→ Validate data with Zod schema
  │     │     │     ├─→ Insert into goals table
  │     │     │     └─→ Return new goal
  │     │     │
  │     │     └─→ Invalidate queries:
  │     │           - /api/goals
  │     │           - /api/dashboard
  │     │
  │     └─→ Close modal, refresh goal list

UPDATE GOAL PROGRESS
  │
  ├─→ User views goal card
  ├─→ Adjusts progress slider (0-100%)
  ├─→ PUT /api/goals/:id
  │     │
  │     ├─→ Update progress in database
  │     │
  │     ├─→ If progress === 100:
  │     │     │
  │     │     ├─→ Set status = "completed"
  │     │     ├─→ Set completedAt = current timestamp
  │     │     │
  │     │     └─→ Update user skills count:
  │     │           - Increment completedGoalsCount
  │     │           - Recalculate overall progress
  │     │
  │     └─→ Return updated goal
  │
  ├─→ Invalidate queries
  └─→ Refresh dashboard metrics

DELETE GOAL
  │
  ├─→ User clicks delete icon on goal card
  ├─→ Confirmation dialog appears
  ├─→ User confirms deletion
  ├─→ DELETE /api/goals/:id
  │     │
  │     └─→ Remove from database
  │
  ├─→ Invalidate queries
  └─→ Refresh goal list
```

---

## Database Schema Relationships

```
users (Core table)
  │
  ├─→ Has many: goals (userId → users.id)
  ├─→ Has many: saved_opportunities (userId → users.id)
  └─→ Has many: opportunity_applications (userId → users.id)

goals
  │
  ├─→ Belongs to: users (userId → users.id)
  └─→ Belongs to: careers (careerId → careers.id) [optional]

careers
  │
  └─→ Has many: goals (careerId → careers.id)

opportunities
  │
  ├─→ Has many: saved_opportunities (opportunityId → opportunities.id)
  └─→ Has many: opportunity_applications (opportunityId → opportunities.id)

saved_opportunities (Junction table)
  │
  ├─→ Belongs to: users (userId → users.id)
  └─→ Belongs to: opportunities (opportunityId → opportunities.id)

opportunity_applications
  │
  ├─→ Belongs to: users (userId → users.id)
  └─→ Belongs to: opportunities (opportunityId → opportunities.id)

resources (Independent)
training_programs (Independent)
academic_modules (Independent)
```

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │──┐
│ email        │  │
│ password     │  │
│ fullName     │  │
│ role         │  │
│ gpa          │  │
│ skills       │  │
└──────────────┘  │
                  │
                  │ 1:N
                  │
        ┌─────────┴─────────────────────────┬─────────────────────────┐
        │                                   │                         │
        │                                   │                         │
        ▼                                   ▼                         ▼
┌──────────────┐                  ┌──────────────────┐      ┌──────────────────────┐
│    goals     │                  │saved_opportunities│      │opportunity_applications│
│──────────────│                  │──────────────────│      │──────────────────────│
│ id (PK)      │                  │ id (PK)          │      │ id (PK)              │
│ userId (FK)  │                  │ userId (FK)      │      │ userId (FK)          │
│ careerId (FK)│──┐               │ opportunityId(FK)│──┐   │ opportunityId (FK)   │──┐
│ title        │  │               └──────────────────┘  │   │ profilePictureUrl    │  │
│ description  │  │                                     │   │ resumeUrl            │  │
│ progress     │  │                                     │   │ coverLetter          │  │
│ status       │  │                                     │   │ status               │  │
└──────────────┘  │                                     │   │ appliedAt            │  │
                  │                                     │   └──────────────────────┘  │
                  │ N:1                                 │                             │
                  │                                     │ N:1                         │ N:1
                  ▼                                     │                             │
            ┌──────────────┐                            │                             │
            │   careers    │                            │                             │
            │──────────────│                            │                             │
            │ id (PK)      │                            │                             │
            │ title        │                            │                             │
            │ description  │                            │                             │
            └──────────────┘                            │                             │
                                                        │                             │
                                                        ▼                             │
                                                  ┌──────────────┐                    │
                                                  │opportunities │◄───────────────────┘
                                                  │──────────────│
                                                  │ id (PK)      │
                                                  │ title        │
                                                  │ company      │
                                                  │ type         │
                                                  │ deadline     │
                                                  └──────────────┘
```

---

## API Request Flow

```
CLIENT REQUEST
  │
  ├─→ User action triggers API call
  │     │
  │     └─→ TanStack Query (useQuery / useMutation)
  │           │
  │           └─→ Fetch API call to /api/*
  │
  ▼
MIDDLEWARE CHAIN
  │
  ├─→ [1] express.json() - Parse request body
  ├─→ [2] express-session - Load session from PostgreSQL
  ├─→ [3] requireAuth - Check if user authenticated (if protected route)
  │     │
  │     ├─→ Session exists?
  │     │     │
  │     │     ├─ YES → Attach req.user → Continue
  │     │     │
  │     │     └─ NO → Return 401 Unauthorized
  │     │
  │     └─→ requireRole - Check user role (if admin route)
  │           │
  │           ├─→ Role matches?
  │           │     │
  │           │     ├─ YES → Continue
  │           │     │
  │           │     └─ NO → Return 403 Forbidden
  │
  ▼
ROUTE HANDLER (routes.ts)
  │
  ├─→ Parse request parameters
  ├─→ Validate input (Zod schemas)
  ├─→ Call storage layer function
  │
  ▼
STORAGE LAYER (storage.ts)
  │
  ├─→ Drizzle ORM query builder
  ├─→ Execute SQL query on PostgreSQL
  ├─→ Transform result
  └─→ Return data
  │
  ▼
ROUTE HANDLER
  │
  ├─→ Format response
  ├─→ Send HTTP status + JSON data
  │
  ▼
CLIENT
  │
  ├─→ TanStack Query receives response
  ├─→ Update cache
  ├─→ Trigger component re-render
  └─→ UI updates with new data
```

### Example: Creating a Goal

```
1. USER ACTION
   └─→ Fills goal form, clicks "Create Goal"

2. CLIENT
   └─→ useMutation hook triggers:
       POST /api/goals
       Body: { title, description, type, targetDate, ... }

3. SERVER - Middleware
   ├─→ Parse JSON body
   ├─→ Load session from DB
   └─→ requireAuth: Verify user logged in

4. SERVER - Route Handler (routes.ts)
   ├─→ Extract req.user.id
   ├─→ Validate body with insertGoalSchema
   └─→ Call storage.createGoal(userId, goalData)

5. SERVER - Storage (storage.ts)
   └─→ db.insert(goals).values({ ...goalData, userId }).returning()

6. DATABASE
   └─→ INSERT INTO goals (...) RETURNING *

7. SERVER - Response
   └─→ res.status(201).json(newGoal)

8. CLIENT - TanStack Query
   ├─→ Receives 201 response
   ├─→ Invalidates: ["goals"], ["dashboard"]
   ├─→ Refetch queries
   └─→ UI shows new goal in list
```

---

## Route Organization Pattern

```
EXPRESS ROUTER (routes.ts)

⚠️ CRITICAL: Route Order Matters!

Specific routes MUST come before parameterized routes

✅ CORRECT ORDER:
  1. GET  /api/opportunities/saved        (specific path)
  2. GET  /api/opportunities/latest       (specific path)
  3. POST /api/opportunities/:id/save     (action on specific resource)
  4. POST /api/opportunities/:id/apply    (action on specific resource)
  5. GET  /api/opportunities/:id          (parameterized - matches anything)

❌ WRONG ORDER:
  1. GET  /api/opportunities/:id          (would catch "saved" as :id!)
  2. GET  /api/opportunities/saved        (unreachable!)

ENDPOINT NAMESPACING:
  - /api/opportunities/*                  (main resource)
  - /api/opportunity-applications/*       (related resource, separate namespace)
    └─→ Prevents conflicts with /api/opportunities/:id pattern
```

---

## Key Data Flow Patterns

### Save Opportunity Pattern
```
1. User clicks bookmark icon
2. POST /api/opportunities/:id/save
3. Insert into saved_opportunities (userId, opportunityId)
4. Return 201
5. Invalidate queries: ["opportunities", "saved"]
6. UI toggles bookmark icon to filled state
```

### Application Submission Pattern
```
1. User fills application form + uploads image
2. Image compressed to base64 via Canvas API
3. POST /api/opportunities/:id/apply
   Body: { profilePictureUrl: "data:image/jpeg;base64,...", resumeUrl, coverLetter }
4. Insert into opportunity_applications
5. Return 201
6. Show success modal
7. Invalidate queries: ["opportunity-applications"]
8. User clicks "View My Requests" → Navigate to Requests tab
```

### Dashboard Statistics Pattern
```
1. GET /api/dashboard (student) or GET /api/admin/stats (admin)
2. Execute parallel queries:
   - Count total goals
   - Count completed goals
   - Count skills
   - Count career matches
   - Calculate overall progress
3. Aggregate results
4. Return JSON object with all metrics
5. Display in dashboard cards
```

---

## Session Management Flow

```
SESSION LIFECYCLE

1. LOGIN
   ├─→ POST /api/auth/login
   ├─→ Verify credentials
   ├─→ Create session: req.session.userId = user.id
   ├─→ express-session saves to PostgreSQL (connect-pg-simple)
   └─→ Set-Cookie: connect.sid=...

2. SUBSEQUENT REQUESTS
   ├─→ Browser sends Cookie: connect.sid=...
   ├─→ express-session loads session from DB
   ├─→ req.session.userId available
   └─→ requireAuth middleware uses req.session.userId

3. LOGOUT
   ├─→ POST /api/auth/logout
   ├─→ req.session.destroy()
   ├─→ Delete session from DB
   └─→ Clear cookie

4. SESSION EXPIRY
   └─→ Sessions expire after inactivity period (default 14 days)
```

---

## Component Hierarchy

```
App.tsx
  │
  ├─→ ThemeProvider
  │     │
  │     └─→ Theme context (light/dark mode)
  │
  └─→ QueryClientProvider
        │
        ├─→ TanStack Query cache
        │
        └─→ Router (Wouter)
              │
              ├─→ /auth → AuthPage
              │
              ├─→ ProtectedRoute (checks auth)
              │     │
              │     └─→ Layout
              │           │
              │           ├─→ AppSidebar (navigation)
              │           │
              │           └─→ Main Content
              │                 │
              │                 ├─→ /dashboard → DashboardPage
              │                 ├─→ /profile → ProfilePage
              │                 ├─→ /goals → GoalsPage
              │                 ├─→ /careers → CareersPage
              │                 ├─→ /opportunities → OpportunitiesPage
              │                 ├─→ /resources → ResourcesPage
              │                 ├─→ /academic → AcademicPage
              │                 ├─→ /progress → ProgressPage
              │                 ├─→ /admin → AdminPage (admin only)
              │                 ├─→ /students → StudentsPage (admin only)
              │                 └─→ /students/:id → StudentDetailPage (admin only)
              │
              └─→ /* → NotFoundPage
```

---

## Technology Stack Flow

```
DEVELOPMENT
  │
  ├─→ TypeScript → Compiled to JavaScript
  ├─→ Vite → Dev server + HMR
  ├─→ Tailwind CSS → Compiled to CSS
  └─→ TSX → React components

BUILD (npm run build)
  │
  ├─→ Vite builds client
  │     └─→ Output: dist/public/
  │
  └─→ esbuild bundles server
        └─→ Output: dist/index.cjs

PRODUCTION (npm run start)
  │
  └─→ Node.js runs dist/index.cjs
        │
        ├─→ Serves static files from dist/public/
        └─→ Handles API routes /api/*
```

---

## Summary of Critical Flows

1. **Authentication**: Session-based with PostgreSQL storage
2. **Authorization**: Role-based (student/admin) with middleware guards
3. **Data Fetching**: TanStack Query with automatic caching and refetching
4. **Form Handling**: React Hook Form + Zod validation
5. **Image Upload**: Client-side compression to base64, no file server needed
6. **Route Ordering**: Specific paths before parameterized `:id` patterns
7. **Database Access**: Drizzle ORM with type-safe queries
8. **State Management**: Server state (TanStack Query) + local state (React hooks)

