# Required Software
- Visual Studio Code (VSCode)  
	Download: https://code.visualstudio.com/download
- Node.js (v20+)  
	Download: https://nodejs.org/en  
	Verify: `node --version` and `npm --version`
- Git  
	Download: https://git-scm.com/downloads  
	Verify: `git --version`
- PostgreSQL (Neon.cloud recommended)  
	Sign up: https://neon.tech  
	Create a database and copy the `DATABASE_URL` connection string

## Quick setup (recommended for Windows)
- Open PowerShell in the project root (where `package.json` lives).
- Run the setup script (checks prerequisites, installs deps, can create `.env`):
	```
	.\setup.ps1
	```
- When prompted, paste your `DATABASE_URL` (Neon) and optional email SMTP credentials.
- Optionally allow the script to run the equipment seed and full seeds.
- Start the development server:
	```
	npm run dev
	```
- Open http://127.0.0.1:5000 in your browser.

# Future Flow: Academic Alignment System

Future Flow helps Computer Engineering students align academic progress with professional and career goals. It provides student and admin experiences for goals, profiles, career pathways, opportunities, resources, and analytics.

## Table of Contents
- Overview
- Architecture
- Key Features
- Data Model (high level)
- Setup (Windows PowerShell)
- Running (dev)
- Environment Variables
- Database
- Scripts
- Project Structure
- Notes

## Overview
- Students: manage profile, GPA, skills, goals (short/long-term), see dashboard stats, recommendations, opportunities, and student ranking.
- Admins: CRUD careers, opportunities, resources, training programs; view dashboard metrics and top-students ranking.

## Architecture
- Frontend: React + TypeScript (Vite), Wouter routing, TanStack Query for data fetching, Radix + shadcn/ui + Tailwind.
- Backend: Express + TypeScript, Drizzle ORM to Postgres, session-based auth, role guards.
- Shared schema: `shared/schema.ts` shared between client/server for types.

## Key Features
- Auth: session login/register, role-based routes.
- Profile: GPA, skills, interests, courses, certifications, resume URL.
- Goals: SMART fields, progress %, completion updates skills/dashboard.
- Dashboard (student): active/completed goals, skills count, career matches, overall progress, recent goals, recommended careers, latest opportunities, ranking.
- Careers/Opportunities/Resources: browse, filter; admin CRUD; students can add careers as goals; resources gated for students (coming-soon modal) when download.
- Admin dashboard: platform counts and Top Students leaderboard.

## Data Model (high level)
Tables in `shared/schema.ts`: users, profiles, goals, careers, opportunities, savedOpportunities, resources, progressRecords, academicModules, trainingPrograms. Sessions stored via Postgres (connect-pg-simple).

## Setup (Windows PowerShell)
From repo root:
1) Install deps: `npm install`
2) Create `.env` (see Environment Variables). If you have `.env.example`, copy it; otherwise create manually.
3) (Optional) Push schema: `npm run db:push`
4) (Optional) Seed data (if you want sample data): `npx tsx server/seed.ts`
5) Start dev server: `npm run dev`

> You can also run `powershell -ExecutionPolicy Bypass -File .\setup.ps1` which installs deps, offers optional seed/build, and starts dev (db:push removed by request).

## Running (dev)
- Backend + frontend served together via `npm run dev` (Node + Vite middleware). Default port: 3000.
- If port is busy, stop existing node processes first.

## Environment Variables
Create `.env` in repo root:
```
DATABASE_URL='postgresql://<user>:<password>@<host>/<db>?sslmode=require'
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key-here
```
Adjust `DATABASE_URL` to your Postgres instance.

## Database
- ORM: Drizzle.
- Apply schema: `npm run db:push`.
- Seed sample data: `npx tsx server/seed.ts` (optional).

## Scripts
- `npm run dev` — start dev server
- `npm run build` — build client/server bundle
- `npm run start` — run built server (dist)
- `npm run db:push` — apply Drizzle schema
- `npm run check` — type-check

## Project Structure (high level)
- `client/` — React app (pages, components, hooks, lib)
- `server/` — Express API, routes, storage, db, seed
- `shared/` — schema and shared types
- `script/` — build script
- `setup.ps1` — onboarding helper (no db:push)

## Notes
- Auth is session-based; ensure cookies are allowed in your browser during local dev.
- Student ranking blends skills, completed goals, progress, and GPA.
- Career matches are based on profile skills; fill your profile for better recommendations.
