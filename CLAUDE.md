# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code linting

### Database Operations
- `npm run seed` - Seed database using `prisma/seed.ts`
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma database browser

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.5.3 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT and database sessions
- **Styling**: Tailwind CSS 4.1.13
- **UI Components**: Radix UI primitives with custom components
- **File Uploads**: Formidable for handling multipart forms
- **Drag & Drop**: @dnd-kit for sortable interfaces

### Key Application Features
This is a law firm website with educational platform features:

1. **User Management System**
   - Role-based access control (USER, ADMIN, OWNER)
   - User authentication with NextAuth.js
   - User promotion system (OWNER can promote users to ADMIN)

2. **Notes Management System**
   - PDF notes with categorization and tagging
   - Slug-based routing for SEO-friendly URLs
   - User viewing history and favorites tracking
   - File upload system for PDF documents

3. **Testing/Quiz System**
   - Interactive tests with multiple choice questions
   - Test attempts tracking with scoring
   - Difficulty levels (EASY, MEDIUM, HARD)
   - Category-based organization

4. **Maintenance Mode System**
   - Environment-controlled maintenance checking
   - Dashboard controls for OWNER role
   - Real-time maintenance status updates
   - Controlled via `DISABLE_MAINTENANCE_CHECKING` environment variable

### Directory Structure

#### App Router Structure (`src/app/`)
- `/admin` - Admin dashboard and file management
- `/owner` - Owner-only features (user management, system stats)
- `/notes` - Public notes browsing and individual note pages
- `/tests` - Quiz/testing system
- `/api` - All API routes organized by feature
- `/login`, `/signup`, `/forgot-password` - Authentication pages
- `/maintenance` - Maintenance mode page

#### API Routes Organization (`src/app/api/`)
- `/auth/` - Authentication endpoints (NextAuth.js)
- `/admin/` - Admin-specific operations
- `/owner/` - Owner-only endpoints (stats, user management)
- `/notes/` - Notes CRUD operations
- `/maintenance/` - Maintenance system controls

#### Components (`src/components/`)
- `Navbar.tsx` - Main navigation with role-based visibility
- `Footer.tsx` - Site footer
- `ProtectedRoute.tsx` - Route protection wrapper
- `MaintenanceListener.tsx` - Real-time maintenance mode detection
- `ui/` - Reusable UI components built on Radix UI

### Database Schema Architecture

The Prisma schema includes:
- **User system** with NextAuth.js integration (Account, Session, User models)
- **Content models** (Note, ViewedNote, UserFavoriteNote)
- **Testing system** (Test, Question, TestAttempt)
- **Maintenance system** (MaintenanceSettings, MaintenanceMode)

Key relationships:
- Users have many notes, test attempts, and view history
- Notes belong to users and track viewing/favorites
- Tests contain questions and track user attempts with scoring

### Authentication & Authorization

- Uses NextAuth.js with database sessions
- Role hierarchy: USER < ADMIN < OWNER
- Session management via `SessionProviderWrapper.tsx`
- Protected routes use `ProtectedRoute.tsx` component
- API routes check user roles for authorization

### Configuration Notes

- **Base URL**: Uses `"baseUrl": "src"` in tsconfig.json with `@/*` path mapping
- **Environment**: Uses `.env.local` for local overrides
- **Maintenance**: Controlled via `DISABLE_MAINTENANCE_CHECKING` environment variable
- **Firm branding**: Configured via `FIRM_NAME` constant in `/config`

### File Upload System
- PDF files handled via Formidable
- Protected PDF serving via API routes
- File storage organized by user and category

### Development Notes
- Uses TypeScript with strict configuration
- ESLint configured for Next.js and TypeScript
- Tailwind CSS with custom configuration
- Database seeding available via `prisma/seed.ts`
- Maintenance mode can be controlled during development via environment variables