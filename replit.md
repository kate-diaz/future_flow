# Future Flow: Academic Alignment System

## Overview

Future Flow is an academic alignment system designed specifically for Computer Engineering students. The platform helps students align their academic progress with professional development goals by providing tools for profile management, goal tracking, career exploration, opportunity discovery, resource access, and progress monitoring. The system features both student and admin roles, with admins managing content like careers, opportunities, resources, and training programs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- Built with React + TypeScript using Vite as the build tool
- Uses Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod for form validation and type-safe schemas

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for variant-based component styling

**Design System**
- Custom color palette: Warm browns (#B78656), oranges (#FF9C42, #FFA135), and yellow (#FFD34E) for primary actions
- Typography: Poppins for headings/UI, Inter for body text
- Persistent left sidebar navigation with contextual right panels
- Card-based layout with generous spacing (24px standard padding)

**State Management**
- Auth context for user session management
- Theme context for light/dark mode toggling
- Query client for server data caching and synchronization

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for the REST API
- TypeScript throughout for type safety
- ESM modules (type: "module" in package.json)

**API Design**
- RESTful endpoints under `/api/*`
- Session-based authentication using express-session
- Role-based access control (student/admin roles)
- Route middleware for authentication and authorization checks

**Data Layer**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database
- Schema defined in `shared/schema.ts` for both client and server
- Database migrations managed via drizzle-kit

**Authentication & Security**
- Bcrypt for password hashing (12 salt rounds)
- Session storage using connect-pg-simple for PostgreSQL-backed sessions
- Secure session cookies with HttpOnly flags
- Password verification on login

**Build & Deployment**
- Custom build script using esbuild for server bundling
- Vite for client-side bundling
- Development mode with HMR via Vite middleware
- Production serves static files from dist/public

### Database Schema

**Core Tables**
- `users`: User accounts with email, hashed password, name, role (admin/student), year level, course
- `profiles`: Extended student profiles with GPA, skills arrays, interests, career preferences, certifications, subjects taken
- `goals`: SMART framework goals with progress tracking, status, and target dates
- `careers`: Career paths with required skills, descriptions, and industry information
- `opportunities`: Internships and job opportunities with types, locations, and requirements
- `saved_opportunities`: Many-to-many relationship for students saving opportunities
- `resources`: Learning materials (PDFs, videos, articles) categorized by topic
- `progress_records`: Time-series tracking of student academic progress
- `academic_modules`: Course/module definitions with credits and prerequisites
- `training_programs`: Structured training programs with duration and skill outcomes

**Relationships**
- Users have one profile (one-to-one)
- Users have many goals, opportunities saved, and progress records (one-to-many)
- Drizzle relations defined for easy query traversal

### Development Workflow

**Local Development**
- `npm run dev`: Starts development server with Vite HMR integration
- Vite dev server runs in middleware mode within Express
- Auto-reloading for both client and server code changes

**Type Safety**
- Shared schema between client and server via `shared/schema.ts`
- Zod schemas for runtime validation
- drizzle-zod for automatic schema-to-Zod conversion
- TypeScript path aliases (@, @shared, @assets)

**Code Organization**
- `/client`: React application and UI components
- `/server`: Express API, routes, and database logic
- `/shared`: Shared types, schemas, and validation
- `/migrations`: Drizzle database migrations

## External Dependencies

**UI & Component Libraries**
- Radix UI: Accessible component primitives (dialog, dropdown, popover, select, etc.)
- Recharts: Chart and data visualization library for progress/analytics dashboards
- Lucide React: Icon library
- date-fns: Date manipulation and formatting

**Database & ORM**
- PostgreSQL: Primary relational database (connection via DATABASE_URL env var)
- Drizzle ORM: Type-safe SQL query builder and schema manager
- pg: Node.js PostgreSQL client
- connect-pg-simple: PostgreSQL session store for express-session

**Authentication & Security**
- bcrypt: Password hashing
- express-session: Session management
- Middleware-based role checking for admin routes

**Development Tools**
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- tsx: TypeScript execution for development
- esbuild: Fast JavaScript bundling for production

**Forms & Validation**
- React Hook Form: Form state management
- Zod: Schema validation
- @hookform/resolvers: Integration between React Hook Form and Zod