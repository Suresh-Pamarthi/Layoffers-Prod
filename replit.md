# LayOffers - Skill-First Hiring Platform

## Overview
LayOffers is a skill-first hiring platform that connects laid-off professionals with companies through paid micro-projects. The platform enables candidates to showcase their abilities through real work rather than traditional resumes, while companies can evaluate talent based on actual performance.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OIDC)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query v5

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # shadcn components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities (queryClient, authUtils)
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app with routing
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API endpoints
│   ├── replitAuth.ts      # Authentication setup
│   └── storage.ts         # Database operations
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle schema definitions
└── design_guidelines.md   # Design system documentation
```

## Database Schema

### Users
- `id` (varchar, primary key) - Replit user ID
- `email`, `firstName`, `lastName`, `profileImageUrl`
- `role` (candidate | company | admin)
- `bio`, `skills` (array), `experience`, `portfolioUrl`

### Companies
- `id` (varchar, UUID)
- `userId` (FK to users)
- `name`, `description`, `website`, `industry`, `size`
- `status` (pending | approved | rejected)

### Projects
- `id` (varchar, UUID)
- `companyId` (FK to companies)
- `title`, `description`, `requirements`
- `skills` (array), `payment`, `difficulty`
- `deadline`, `maxSubmissions`
- `status` (pending | active | completed | cancelled)

### Submissions
- `id` (varchar, UUID)
- `projectId`, `candidateId`
- `content`, `attachmentUrl`, `feedback`
- `status` (pending | under_review | approved | rejected)

### Ratings
- `id` (varchar, UUID)
- `submissionId`, `candidateId`, `companyId`
- `score` (1-5), `review`

### Payments
- `id` (varchar, UUID)
- `submissionId`, `candidateId`, `companyId`
- `amount`, `status` (pending | paid | failed)
- `paidAt`

## User Roles

### Candidate
- Browse and apply to projects
- Submit work for review
- Track submissions and earnings
- Build portfolio from completed projects

### Company
- Create company profile (requires admin approval)
- Post projects (requires admin approval)
- Review submissions and rate candidates
- Manage payments

### Admin
- Approve/reject company profiles
- Approve/reject project postings
- View platform analytics
- Monitor payments

## API Routes

### Authentication
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/callback` - Auth callback
- `GET /api/logout` - Logout
- `GET /api/auth/user` - Get current user

### Projects
- `GET /api/projects` - List active projects
- `GET /api/projects/featured` - Featured projects
- `GET /api/projects/:id` - Single project
- `POST /api/projects/:id/submissions` - Submit to project

### Candidate
- `GET /api/candidate/submissions` - My submissions
- `GET /api/candidate/stats` - My stats
- `PATCH /api/profile` - Update profile

### Company
- `GET /api/company/profile` - Company profile
- `POST /api/company/profile` - Create company
- `GET /api/company/projects` - Company projects
- `POST /api/company/projects` - Create project
- `POST /api/company/submissions/:id/review` - Review submission

### Admin
- `GET /api/admin/stats` - Platform stats
- `GET /api/admin/companies/pending` - Pending companies
- `POST /api/admin/companies/:id/review` - Review company
- `GET /api/admin/projects/pending` - Pending projects
- `POST /api/admin/projects/:id/review` - Review project

## Security Model

### Authorization
- **Role-based Access Control**: Admin routes use `requireRole(["admin"])` middleware
- **Resource-based Authorization**: Company routes verify ownership before allowing actions
- **User-based Authorization**: Candidate routes verify user ID matches request

### Middleware
- `isAuthenticated`: Verifies valid session from Replit Auth
- `requireRole(roles[])`: Validates user role against allowed roles

### SPA Routing
- Dashboard pages use wouter's `<Redirect>` component for unauthenticated redirects
- Loading states are handled separately from authentication checks

## Design System
- **Primary Color**: Blue (hue 217)
- **Typography**: Inter (UI), JetBrains Mono (stats/code)
- **Icons**: Lucide React
- **Components**: shadcn/ui with custom styling

## Development

### Running the App
```bash
npm run dev
```

### Database Operations
```bash
npm run db:push  # Push schema changes
```

## Recent Changes
- November 2024: Initial MVP implementation
  - Complete database schema with 7 tables
  - Multi-role authentication system
  - Landing page with hero, How It Works, testimonials
  - Dashboards for all three roles
  - Project marketplace with filtering
  - Submission and rating system
  - Payment tracking
  - Security hardening: role-based authorization middleware
  - SPA redirect patterns using wouter instead of window.location
