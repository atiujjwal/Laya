# Laya - Habit Tracker | Comprehensive Project State Documentation

**Project Date:** January 21, 2026  
**Framework:** Next.js 16.1.4 | **Runtime:** React 19.2.3 | **Database:** PostgreSQL  
**Status:** Core MVP Implementation with Auth, APIs, and UI Components Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Backend APIs](#backend-apis)
7. [Frontend Components](#frontend-components)
8. [State Management](#state-management)
9. [AI Integration](#ai-integration)
10. [File Structure](#file-structure)
11. [Current Issues & Known Limitations](#current-issues--known-limitations)
12. [Development Environment](#development-environment)

---

## Project Overview

**Laya** is an AI-powered habit tracking and daily planning application built with modern web technologies. It combines Excel-like grid visualization with AI-powered scheduling and goal management.

### Core Features Implemented:
- ✅ **Multi-Auth System**: NextAuth with OTP (Email/Mobile) + Google OAuth
- ✅ **Habit Tracking**: Create, log, and track habits with streak counters
- ✅ **Goal Management**: Multi-step goal tracking with progress percentages
- ✅ **Habit Logging**: Record completions with metadata (mood, notes, weather)
- ✅ **Daily Planning**: AI-powered schedule generation using Gemini API
- ✅ **Data Export**: CSV export of all habit logs
- ✅ **Virtual Grid Display**: Performance-optimized Excel-like habit grid
- ✅ **Analytics Dashboard**: Trend charts and category distribution
- ✅ **User Profiles**: Profile management with timezone support

### Partially Implemented:
- ⏳ **Dashboard UI**: Core layout complete, some components commented out
- ⏳ **Error Boundary**: `/src/app/error.tsx` exists but missing UI component imports
- ⏳ **Frontend Pages**: Dashboard pages created but need component linking

### Not Yet Implemented:
- ❌ **Google Sheets Sync**: Metadata in schema, no sync logic
- ❌ **Advanced Recurrence Rules**: Schema supports RRules, not yet used
- ❌ **Mobile App**: Web-only
- ❌ **Notifications**: Push/Email notifications
- ❌ **Social Features**: Sharing, challenges, community

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React 19)                   │
│  Landing → Login → Dashboard → Planner/Goals/Settings       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Next.js API Routes (v16)                       │
│  /api/auth/* | /api/habits/* | /api/goals/* | /api/planner/*
└──────────────────────┬──────────────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  Users | Habits | Goals | Logs | Sessions | Tokens          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  AI Services                                 │
│  Gemini 1.5 Flash → Daily Plan Generation & Trend Analysis  │
│  Google Auth → OAuth token management                       │
└─────────────────────────────────────────────────────────────┘
```

### Request-Response Flow

```
User Action
    ↓
React Component (uses React Query)
    ↓
useQuery/useMutation hooks (with optimistic updates)
    ↓
API Route Handler (/api/*)
    ↓
secureRoute middleware (authentication check)
    ↓
Prisma ORM Query
    ↓
PostgreSQL
    ↓
Response + Post-Response Scripts (store IDs in env)
    ↓
UI Update + React Query Cache Invalidation
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.4 (App Router)
- **UI Library**: React 19.2.3
- **UI Components**: 
  - Radix UI (headless components: dialog, dropdown, label, popover, scroll-area, select, slot)
  - Custom atomic/molecular/organism component library
- **State Management**: 
  - Zustand (app-wide state: currentDate, sidebar toggle)
  - React Query (server state: habits, goals, logs, plans)
  - Next-Auth SessionProvider (auth state)
- **Styling**: Tailwind CSS v4 + PostCSS
- **Charts**: Recharts (line charts, pie charts)
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: lucide-react (580+ SVG icons)
- **Notifications**: Sonner (toast notifications)
- **Virtualization**: @tanstack/react-virtual (efficient rendering of large lists)
- **Utilities**: 
  - date-fns (date manipulation)
  - clsx + tailwind-merge (className utilities)
  - PapaParse (CSV parsing/generation)

### Backend
- **Runtime**: Node.js (via Next.js)
- **API Framework**: Next.js API Routes
- **Database**: PostgreSQL 15 (via Docker)
- **ORM**: Prisma v7.2.0
- **Authentication**: NextAuth v5.0.0-beta.30
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **AI**: Google Generative AI (Gemini 1.5 Flash)

### DevOps & Tools
- **Container**: Docker + Docker Compose (PostgreSQL)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **TypeScript**: v5
- **Build Optimization**: React Compiler enabled

---

## Database Schema

### Overview (Prisma Schema)
Located: `/prisma/schema.prisma`

### Core Models

#### 1. **User** Model
```typescript
User {
  id: String (CUID) @id
  name: String?
  email: String @unique
  emailVerified: DateTime?
  image: String?
  password: String? // Optional for OAuth support
  
  // App Settings
  timezone: String (default: "UTC")
  onboarding: Boolean (default: false)
  
  // Google Sheets Sync
  googleSheetId: String?
  lastSyncTime: DateTime?
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  accounts: Account[]
  sessions: Session[]
  habits: Habit[]
  goals: Goal[]
  dayPlans: DayPlan[]
  
  @@index([email])
}
```

#### 2. **Account** Model (NextAuth Standard)
```typescript
Account {
  id: String (CUID) @id
  userId: String
  type: String // "oauth", "credentials"
  provider: String // "google", "credentials"
  providerAccountId: String
  refresh_token: String? @db.Text
  access_token: String? @db.Text
  expires_at: Int?
  token_type: String?
  scope: String?
  id_token: String? @db.Text
  session_state: String?
  
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}
```

#### 3. **VerificationToken** Model (OTP Storage)
```typescript
VerificationToken {
  identifier: String // Email or Phone
  token: String @unique
  expires: DateTime
  
  @@unique([identifier, token])
}
```

#### 4. **Session** Model (NextAuth JWT Sessions)
```typescript
Session {
  id: String (CUID) @id
  sessionToken: String @unique
  userId: String
  expires: DateTime
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 5. **Habit** Model
```typescript
Habit {
  id: String (CUID) @id
  userId: String
  
  // Display
  title: String
  description: String?
  color: String (hex, default: "#000000")
  icon: String? // Emoji or icon name
  
  // Recurrence
  frequency: Frequency enum (DAILY, WEEKLY, MONTHLY, INTERVAL)
  weekDays: Int[] // [0=Sun, 1=Mon, ..., 6=Sat]
  rrule: String? // RFC 5545 for complex patterns
  
  // Tracking Config
  targetValue: Int (default: 1)
  unit: String? // "pages", "minutes", "liters"
  
  // Gamification
  currentStreak: Int (default: 0)
  longestStreak: Int (default: 0)
  
  // Lifecycle
  archived: Boolean (default: false)
  createdAt: DateTime
  updatedAt: DateTime
  
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs: HabitLog[]
  
  @@index([userId, archived])
}
```

**Habit Frequency Enum:**
```typescript
enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
  INTERVAL
}
```

#### 6. **HabitLog** Model
```typescript
HabitLog {
  id: String (CUID) @id
  habitId: String
  date: DateTime // Stored as UTC Midnight
  
  // Value Tracking
  value: Int // Actual logged value (e.g., 5 pages)
  completed: Boolean (default: false)
  status: LogStatus (COMPLETED, SKIPPED, FAILED)
  
  // Meta Data (JSON)
  meta: Json? // {"mood": "Happy", "weather": "Rainy", "notes": "..."}
  
  createdAt: DateTime
  updatedAt: DateTime
  
  habit: Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@unique([habitId, date])
  @@index([date])
}
```

**LogStatus Enum:**
```typescript
enum LogStatus {
  COMPLETED
  SKIPPED
  FAILED
}
```

#### 7. **Goal** Model
```typescript
Goal {
  id: String (CUID) @id
  userId: String
  
  title: String
  category: String (default: "General")
  targetDate: DateTime?
  
  // Steps as JSON Array
  steps: Json[] // [{"step": "Buy shoes", "done": true}, ...]
  
  progress: Int (default: 0) // 0-100 percentage
  completed: Boolean (default: false)
  
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 8. **DayPlan** Model
```typescript
DayPlan {
  id: String (CUID) @id
  userId: String
  date: DateTime // Date for which plan is created
  
  // AI-Generated Schedule
  schedule: Json // [{"time": "08:00", "task": "Gym", "reason": "..."}, ...]
  
  dayScore: Int? // 0-100
  summary: String? // AI-written summary
  
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
}
```

### Database Indexes
- `User`: email (unique)
- `Habit`: (userId, archived) - fast lookup of active habits
- `HabitLog`: habitId + date (unique), date (range queries)
- `DayPlan`: userId + date (unique)

### Relationships
```
User ──┬─── Habits ──── HabitLogs
       ├─── Goals
       ├─── DayPlans
       ├─── Accounts (OAuth)
       └─── Sessions (JWT)

VerificationToken (no relation - standalone for OTP)
```

---

## Authentication System

### File: `/auth.ts`

#### Providers

**1. Google OAuth**
- **Purpose**: Sign in + Google Drive access for Sheets sync (Phase 2)
- **Scopes**: 
  - `openid` - OpenID Connect
  - `email` - Email address
  - `profile` - Profile info
  - `https://www.googleapis.com/auth/drive.file` - Drive file access
- **Access Type**: `offline` (gets refresh token for server-side sync)
- **Prompt**: `consent` (forces refresh token regeneration)

**2. Credentials Provider (Custom OTP)**
- **Identifier**: Email or Phone number
- **Flow**:
  1. Frontend calls `/api/auth/otp` with identifier
  2. Backend generates 6-digit OTP (crypto.randomInt)
  3. OTP stored in `VerificationToken` table (10-min expiry)
  4. Frontend receives OTP (logged to console in dev mode)
  5. User enters OTP + identifier in login form
  6. Credentials provider validates OTP against DB
  7. User created/updated via upsert (seamless sign up/login)
  8. Session created

#### Session Management

**Strategy**: JWT (required for Edge Runtime compatibility)

```typescript
jwt callback:
  - Intercepts OAuth account data
  - Stores Google access_token & refresh_token in JWT
  - Later available for Sheets sync API calls

session callback:
  - Extends session object with user.id from JWT sub
  - Makes user ID accessible to client-side code via useSession()
```

#### Callbacks

```typescript
callbacks: {
  async jwt({ token, account }) {
    if (account) {
      token.accessToken = account.access_token
      token.refreshToken = account.refresh_token
    }
    return token
  },
  
  async session({ session, token }) {
    if (token.sub && session.user) {
      session.user.id = token.sub
    }
    return session
  }
}
```

#### Custom Pages
- **Sign In**: `/login` (custom login page, not yet fully built)
- **Error**: `/error` (error boundary page)

#### Security Features
- ✅ OTP expiry (10 minutes)
- ✅ Single-use OTP tokens (deleted after validation)
- ✅ JWT encryption
- ✅ CSRF protection (via NextAuth)
- ✅ Password hashing: bcryptjs v3.0.3

#### Known Issues
- ⚠️ JWT Session Error: "no matching decryption secret" (auth encryption key issue)
- ⚠️ Credentials callback expects specific format

---

## Backend APIs

All APIs are secured via `secureRoute()` middleware which:
1. Calls `auth()` to validate JWT
2. Returns 401 if not authenticated
3. Passes session object to handler

### API Base Paths: `/api`

---

### **1. Authentication APIs**

#### POST `/api/auth/otp`
**Purpose**: Generate and send OTP

**Request Body**:
```json
{
  "identifier": "user@example.com",
  "type": "email" | "mobile"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "OTP Sent"
}
```

**Dev Mode**: OTP printed to console (SMS/Email not configured)

**Location**: `src/app/api/auth/otp/route.ts`

---

#### [...nextauth]
**Purpose**: Standard NextAuth handler

**Location**: `src/app/api/auth/[...nextauth]/route.ts`

---

### **2. User Profile APIs**

#### GET `/api/user/profile`
**Purpose**: Fetch current user details

**Auth**: Required (Bearer token)

**Response** (200):
```json
{
  "id": "clm...",
  "name": "John Doe",
  "email": "john@example.com",
  "image": null,
  "timezone": "America/New_York",
  "onboarding": true,
  "createdAt": "2026-01-21T00:00:00Z"
}
```

**Location**: `src/app/api/user/profile/route.ts`

---

#### PATCH `/api/user/profile`
**Purpose**: Update user settings

**Auth**: Required

**Request Body** (all optional):
```json
{
  "name": "Jane Doe",
  "timezone": "America/New_York",
  "onboarding": false
}
```

**Validation** (Zod):
- `name`: 1-100 chars (optional)
- `timezone`: string (optional)
- `onboarding`: boolean (optional)

**Response** (200): Updated user object

**Location**: `src/app/api/user/profile/route.ts`

---

### **3. Goals Management APIs**

#### GET `/api/goals`
**Purpose**: List all goals with optional filtering

**Auth**: Required

**Query Parameters**:
- `completed`: "true"|"false" - filter by completion status
- `category`: string - filter by category (e.g., "Health", "Career")

**Response** (200):
```json
[
  {
    "id": "clm...",
    "userId": "clm...",
    "title": "Complete AWS Certification",
    "category": "Career",
    "targetDate": "2026-06-30T23:59:59Z",
    "steps": [
      { "step": "Buy shoes", "done": true },
      { "step": "Run 5k", "done": false }
    ],
    "progress": 50,
    "completed": false
  }
]
```

**Location**: `src/app/api/goals/route.ts`

---

#### POST `/api/goals`
**Purpose**: Create new goal

**Auth**: Required

**Request Body**:
```json
{
  "title": "Complete AWS Certification",
  "category": "Career",
  "targetDate": "2026-06-30T23:59:59Z",
  "steps": [
    { "step": "Module 1", "done": false },
    { "step": "Module 2", "done": false }
  ]
}
```

**Validation** (Zod):
- `title`: min 3 chars
- `category`: string (default: "General")
- `targetDate`: ISO datetime (optional)
- `steps`: array of {step: string, done: boolean} (optional)

**Response** (201): Created goal object

**Post-Response Script**: Stores `goal_id`, `goal_title` in environment variables

**Location**: `src/app/api/goals/route.ts`

---

#### PATCH `/api/goals/{id}`
**Purpose**: Update goal

**Auth**: Required

**Request Body** (all optional):
```json
{
  "title": "New Title",
  "progress": 75,
  "completed": false,
  "steps": [
    { "step": "Module 1", "done": true },
    { "step": "Module 2", "done": false }
  ]
}
```

**Response** (200): Updated goal object

**Post-Response Script**: Updates `goal_progress` in environment

**Location**: `src/app/api/goals/[id]/route.ts`

---

### **4. Habits Management APIs**

#### GET `/api/habits`
**Purpose**: List habits with pagination & filtering

**Auth**: Required

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 50)
- `archived`: "true"|"false" (default: false)

**Response** (200):
```json
{
  "data": [
    {
      "id": "clm...",
      "userId": "clm...",
      "title": "Morning Meditation",
      "description": "10 min daily meditation",
      "color": "#8B5CF6",
      "icon": "🧘",
      "frequency": "DAILY",
      "weekDays": [0, 1, 2, 3, 4, 5, 6],
      "targetValue": 1,
      "unit": "session",
      "currentStreak": 5,
      "longestStreak": 12,
      "archived": false,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-21T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 50
}
```

**Location**: `src/app/api/habits/route.ts`

---

#### POST `/api/habits`
**Purpose**: Create new habit

**Auth**: Required

**Request Body**:
```json
{
  "title": "Morning Meditation",
  "description": "10 minutes of daily meditation",
  "color": "#8B5CF6",
  "icon": "🧘",
  "frequency": "DAILY",
  "weekDays": [0, 1, 2, 3, 4, 5, 6],
  "targetValue": 1,
  "unit": "session"
}
```

**Validation** (Zod):
- `title`: required, 1-100 chars
- `description`: optional string
- `color`: regex /^#/ (hex color), default "#000000"
- `icon`: optional string (emoji/icon name)
- `frequency`: enum (DAILY, WEEKLY, MONTHLY, INTERVAL), default DAILY
- `weekDays`: array of 0-6, optional
- `targetValue`: integer >= 1, default 1
- `unit`: optional string

**Response** (201): Created habit object

**Post-Response Script**: Stores `habit_id`, `habit_title` in environment

**Location**: `src/app/api/habits/route.ts`

---

#### GET `/api/habits/{id}`
**Purpose**: Fetch single habit details

**Auth**: Required

**Response** (200): Single habit object

**Location**: `src/app/api/habits/[id]/route.ts`

---

#### PATCH `/api/habits/{id}`
**Purpose**: Update habit configuration

**Auth**: Required

**Request Body** (all optional):
```json
{
  "title": "Morning Meditation - Extended",
  "description": "15 min meditation",
  "targetValue": 15,
  "unit": "minutes",
  "frequency": "DAILY",
  "weekDays": [0, 1, 2, 3, 4, 5, 6]
}
```

**Response** (200): Updated habit object

**Post-Response Script**: Updates `habit_title` in environment

**Location**: `src/app/api/habits/[id]/route.ts`

---

#### DELETE `/api/habits/{id}`
**Purpose**: Archive habit (soft delete)

**Auth**: Required

**Response** (200): Success message

**Implementation**: Sets `archived: true` on habit to preserve logs

**Location**: `src/app/api/habits/[id]/route.ts`

---

### **5. Habit Logging APIs**

#### POST `/api/habits/log`
**Purpose**: Log habit completion/failure for a date

**Auth**: Required

**Request Body**:
```json
{
  "habitId": "clm...",
  "date": "2026-01-21T00:00:00Z",
  "value": 15,
  "completed": true,
  "meta": {
    "mood": "Happy",
    "weather": "Sunny",
    "notes": "Felt energized and focused"
  }
}
```

**Validation** (Zod):
- `habitId`: CUID string
- `date`: ISO datetime string
- `value`: integer >= 0
- `completed`: boolean
- `meta`: object (optional)

**Response** (200):
```json
{
  "id": "clm...",
  "habitId": "clm...",
  "date": "2026-01-21T00:00:00Z",
  "value": 15,
  "completed": true,
  "status": "COMPLETED",
  "meta": { "mood": "Happy", ... },
  "createdAt": "2026-01-21T12:00:00Z",
  "updatedAt": "2026-01-21T12:00:00Z"
}
```

**Implementation**:
- Uses Prisma `upsert` - creates new log or updates existing
- Ensures only one log per habit per day
- Automatic status calculation (COMPLETED|SKIPPED|FAILED)

**TODO**: Trigger async job to update streaks

**Post-Response Script**: Stores `log_id` in environment

**Location**: `src/app/api/habits/log/route.ts`

---

#### GET `/api/habits/logs`
**Purpose**: Fetch habit logs for date range

**Auth**: Required

**Query Parameters** (required):
- `startDate`: ISO datetime (e.g., "2026-01-01T00:00:00Z")
- `endDate`: ISO datetime (e.g., "2026-01-31T23:59:59Z")

**Response** (200):
```json
[
  {
    "habitId": "clm...",
    "date": "2026-01-21T00:00:00Z",
    "completed": true,
    "value": 15,
    "status": "COMPLETED"
  }
]
```

**Optimization**: Only fetches necessary fields (habitId, date, completed, value, status)

**Location**: `src/app/api/habits/logs/route.ts`

---

### **6. Daily Planner APIs**

#### GET `/api/planner`
**Purpose**: Fetch existing day plan

**Auth**: Required

**Query Parameters**:
- `date`: string in "YYYY-MM-DD" format (required)

**Response** (200):
```json
{
  "id": "clm...",
  "userId": "clm...",
  "date": "2026-01-21T00:00:00Z",
  "schedule": [
    {
      "time": "08:00",
      "task": "Morning Meditation",
      "type": "habit",
      "duration": 10,
      "reason": "Consistent morning habit"
    },
    {
      "time": "09:00",
      "task": "Deep Work",
      "type": "work",
      "duration": 120,
      "reason": "Best energy block"
    }
  ],
  "summary": "I've prioritized deep work...",
  "dayScore": 85,
  "createdAt": "2026-01-21T00:00:00Z",
  "updatedAt": "2026-01-21T00:00:00Z"
}
```

**Response if no plan exists** (200):
```json
{
  "schedule": [],
  "summary": null
}
```

**Location**: `src/app/api/planner/route.ts`

---

#### POST `/api/planner/generate`
**Purpose**: Generate AI-powered daily plan

**Auth**: Required

**Request Body**:
```json
{
  "date": "2026-01-22T00:00:00Z",
  "focus": "Complete project deadlines and maintain meditation routine"
}
```

**Validation** (Zod):
- `date`: ISO datetime (required)
- `focus`: string (optional)

**Response** (200): Created/updated DayPlan object

**Implementation**:
1. Validates input
2. Normalizes date to UTC midnight
3. Calls `LayaContextService.getUserSnapshot()` to gather context
4. Sends context + focus to Gemini API
5. Parses JSON response from Gemini
6. Upserts DayPlan (updates if exists for date)
7. Returns saved plan

**AI Prompt** (simplified):
```
ROLE: You are "Laya", an expert productivity coach.

CONTEXT:
- Date: [targetDate]
- Focus: [userFocus or "General Productivity"]
- Habits: [list of active habits with streaks]
- Recent Logs: [logs from last 7 days]
- Goals: [incomplete goals with progress]

TASK:
1. Analyze logs to find trends
2. Generate schedule for the day
3. Assign dayScore (0-100) based on realism
4. Write summary with coaching tip

OUTPUT JSON ONLY:
{
  "schedule": [{"time": "HH:MM", "task": "...", "type": "...", "duration": mins, "reason": "..."}],
  "summary": "...",
  "dayScore": 85
}
```

**Post-Response Script**: Stores `plan_id`, `day_score` in environment

**Location**: `src/app/api/planner/generate/route.ts`

---

### **7. Data Export APIs**

#### GET `/api/export`
**Purpose**: Export all habit logs as CSV

**Auth**: Required

**Response** (200): CSV file download

**CSV Format**:
```
Date,Habit,Category,Value,Completed,Status
2026-01-21,Morning Meditation,Health,1,Yes,COMPLETED
2026-01-20,Morning Meditation,Health,1,No,SKIPPED
```

**Implementation**:
1. Fetches all HabitLogs for user with habit relationship
2. Flattens data structure
3. Uses PapaParse to convert to CSV
4. Returns with Content-Disposition header for download

**Location**: `src/app/api/export/route.ts`

---

## Frontend Components

### Component Hierarchy

```
components/
├── atoms/ (Primitive UI elements)
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── GridCell.tsx
│   ├── IconButton.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── ProgressBar.tsx
│   ├── scroll-area.tsx
│   ├── Select.tsx
│   ├── Skeleton.tsx
│   ├── StatusCheckbox.tsx
│   └── textarea.tsx
│
├── molecules/ (Composable combinations of atoms)
│   ├── AIPlanCard.tsx
│   ├── DateColumnHeader.tsx
│   ├── GoalStepItem.tsx
│   ├── HabitRowHeader.tsx
│   ├── MonthNavigator.tsx
│   ├── NotificationPopover.tsx
│   ├── StatCard.tsx
│   ├── StreakIndicator.tsx
│   └── ThemeToggle.tsx
│
└── organisms/ (Complex features)
    ├── AnalyticsSection.tsx
    ├── GoalDashboard.tsx
    ├── PlannerTimeline.tsx
    └── VirtualHabitGrid.tsx
```

---

### **Atoms** (Primitive Components)

#### StatusCheckbox.tsx
**Purpose**: Display and toggle habit log status

**Props**:
- `status`: LogStatus | null (COMPLETED|SKIPPED|FAILED|null)
- `onClick`: () => void
- `className?`: string
- `disabled?`: boolean

**Styling**:
- Null state: empty with hover effect
- COMPLETED: green background, checkmark icon
- SKIPPED: gray background, minus icon
- FAILED: red background, X icon

**Cycle Logic**: Handled by parent component

---

#### ProgressBar.tsx
**Purpose**: Visual progress indicator

**Props**:
- `value`: number (0-100)
- `label?`: string
- `color?`: string

---

#### Avatar.tsx
**Purpose**: User profile picture with fallback

**Props**:
- `src?`: string (image URL)
- `fallback`: string (initials)
- `size?`: "sm" | "md" | "lg"
- `className?`: string

---

#### Badge.tsx
**Purpose**: Label/tag display

**Props**:
- `variant?`: "default" | "secondary" | "destructive" | "outline"
- `children`: ReactNode

---

#### Skeleton.tsx
**Purpose**: Loading placeholder

**Props**:
- `className?`: string

---

#### GridCell.tsx
**Purpose**: Single cell in habit grid (shows status or value)

---

#### Button, Input, Dialog, Dropdown, etc.
**Purpose**: Radix UI wrapper components with Tailwind styling

---

### **Molecules** (Composite Components)

#### StatusCheckbox.tsx
See Atoms section (also used as molecule)

---

#### HabitRowHeader.tsx
**Purpose**: Left column of habit grid showing habit details

**Props**:
```typescript
{
  title: string
  description?: string
  icon?: string
  frequency: string (DAILY|WEEKLY|MONTHLY|INTERVAL)
  streak: number
  color: string (hex)
}
```

**Features**:
- Colored left border indicator
- Habit title + icon
- Streak badge ("🔥 5 day streak")
- Dropdown menu for Edit/Archive actions
- Truncates long titles with tooltip

---

#### StreakIndicator.tsx
**Purpose**: Visual flame indicator for streaks

**Props**:
```typescript
{
  streak: number
}
```

**Features**:
- Hidden if streak === 0
- Orange color if streak > 7
- Pulsing animation if streak > 30
- Flame icon with count

---

#### DateColumnHeader.tsx
**Purpose**: Column header in habit grid showing date

**Props**:
- `date`: Date
- `isToday?`: boolean
- `isWeekend?`: boolean

**Features**:
- Formats as "Mon, Jan 21"
- Highlights current day
- Different styling for weekends

---

#### MonthNavigator.tsx
**Purpose**: Month/year selector above habit grid

**Props**:
- `date`: Date
- `onPrevious`: () => void
- `onNext`: () => void
- `onToday`: () => void

---

#### AIPlanCard.tsx
**Purpose**: Display AI-generated daily plan item

**Props**:
```typescript
{
  time: string
  task: string
  type: "habit" | "work" | "break" | "custom"
  duration: number (minutes)
  reason?: string
}
```

---

#### StatCard.tsx
**Purpose**: Metric display card

**Props**:
```typescript
{
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: "up" | "down"
  color?: string
}
```

**Features**:
- Icon + value + label layout
- Optional trend indicator
- Custom color support

---

#### NotificationPopover.tsx
**Purpose**: Notifications dropdown

**Props**:
- `unreadCount`: number
- `notifications`: Notification[]

---

#### ThemeToggle.tsx
**Purpose**: Dark/Light mode toggle

**Features**:
- Uses next-themes
- Moon/Sun icons
- Persists preference

---

### **Organisms** (Complex Features)

#### VirtualHabitGrid.tsx
**Purpose**: Virtualized Excel-like habit grid

**Props**:
```typescript
{
  habits: HabitWithLogs[]
  currentDate: Date
}
```

**Features**:
- Uses @tanstack/react-virtual for performance
- Shows habits as rows, days as columns
- Each cell is StatusCheckbox
- Optimistic mutations with React Query
- Mutation on checkbox toggle:
  - POST to `/api/habits/log`
  - Optimistic UI update
  - Rollback on error

**Structure**:
```
┌─────────────────┬─────────────────────────────────────┐
│ Habit Header    │ Date Columns (Jan 1-31)             │
├─────────────────┼─────────────────────────────────────┤
│ Morning Med     │ ✓  ✓  ✗  ✓  -  ✓  ✓ ... (cells)   │
├─────────────────┼─────────────────────────────────────┤
│ Exercise        │ ✓  -  ✓  ✓  ✓  -  ✓ ...             │
├─────────────────┼─────────────────────────────────────┤
│ Reading         │ ✓  ✓  ✓  ✓  ✓  ✓  ✓ ...             │
└─────────────────┴─────────────────────────────────────┘
```

---

#### AnalyticsSection.tsx
**Purpose**: Charts and statistics dashboard

**Props**:
```typescript
{
  trendData: Array<{ date: string; completionRate: number }>
  distributionData: Array<{ name: string; value: number; color: string }>
}
```

**Charts**:
1. **LineChart** - Weekly completion rate trend
2. **PieChart** - Category distribution

**Libraries**: Recharts (charting library)

---

#### GoalDashboard.tsx
**Purpose**: Goal management and tracking

**Features**:
- List of all goals with progress bars
- Add new goal modal
- Edit/delete goals
- Step-by-step progress tracking

---

#### PlannerTimeline.tsx
**Purpose**: Display daily plan as timeline

**Props**:
```typescript
{
  plan: DayPlan
  dayScore: number
}
```

**Features**:
- Timeline view of scheduled tasks
- Color-coded by type (habit/work/break)
- Duration indicators
- Reasoning/notes for each task

---

### **Pages**

#### Landing Page (`src/app/page.tsx`)
**Status**: ✅ Complete

**Features**:
- Navbar with Login/Get Started buttons
- Hero section with value proposition
- Feature cards grid (Excel-like, AI Coach, Goal Tracker)
- Gradient text effects
- Responsive design

---

#### Login Page (`src/app/auth/login/page.tsx`)
**Status**: ⏳ Missing/Not found in file listing

**Expected Features** (not yet implemented):
- OTP email/phone input
- OTP code input field
- Sign in with Google button
- "Resend OTP" link
- Loading states

---

#### Dashboard Page (`src/app/dashboard/page.tsx`)
**Status**: ⏳ Partially complete (mostly commented out)

**File**: 451 lines, heavily commented

**Implemented**:
- Header with user avatar
- Stat cards grid
- Loading skeleton states
- Analytics section integration
- Mock analytics data

**Commented Out**:
- Main Dashboard component structure
- VirtualHabitGrid integration
- AnalyticsSection
- Various child components

**Issue**: Missing UI component imports (`@/components/ui/button`)

---

#### Goals Page (`src/app/dashboard/goals/page.tsx`)
**Status**: ⏳ Placeholder

---

#### Planner Page (`src/app/dashboard/planner/page.tsx`)
**Status**: ⏳ Placeholder

---

#### Settings Page (`src/app/dashboard/settings/page.tsx`)
**Status**: ⏳ Placeholder

---

## State Management

### **Zustand Store** (`src/lib/store.ts`)

```typescript
interface LayaStore {
  // Grid State
  currentDate: Date
  setCurrentDate: (date: Date) => void
  
  // UI State
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useLayaStore = create<LayaStore>(...)
```

**Usage**:
```tsx
const { currentDate, setCurrentDate } = useLayaStore()
```

**Purpose**: App-wide UI state that doesn't change frequently

---

### **React Query** (`@tanstack/react-query`)

**Configured in** `src/app/providers.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})
```

**Hooks** in `src/lib/hooks/use-api.ts`:

1. **useHabits(date)**
   - Fetches habit logs for a date
   - Query key: ["habits", month, year]

2. **useToggleHabit()**
   - Mutation for POST `/api/habits/log`
   - Optimistic update implementation
   - Invalidates habits query on settled

3. **useGoals()**
   - Fetches all goals
   - Query key: ["goals"]

4. **useDayPlan(date)**
   - Fetches plan for specific date
   - Query key: ["plan", "YYYY-MM-DD"]

**Patterns**:
- Optimistic updates for better UX
- Automatic cache invalidation
- Error rollback to previous state

---

### **NextAuth Session** (`next-auth/react`)

**Provider**: SessionProvider in `src/app/providers.tsx`

**Usage**:
```tsx
const { data: session } = useSession()
// session.user = { id, name, email, image }
```

**Storage**: JWT stored in secure HttpOnly cookie

---

## AI Integration

### **Gemini API** (`src/lib/ai/gemini.ts`)

**Model**: Gemini 1.5 Flash (cost-optimized)

**Configuration**:
```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
})
```

#### Methods

**1. generateDayPlan(context, userFocus?)**
- **Purpose**: Create AI schedule for the day
- **Input**: User context (habits, logs, goals) + optional focus
- **Output**: JSON with schedule[], summary, dayScore (0-100)
- **Used by**: POST `/api/planner/generate`

**2. analyzeTrends(context)**
- **Purpose**: Identify patterns in habit completion
- **Output**: JSON with insights[] and suggestion
- **Status**: Defined but not yet used

---

### **Context Service** (`src/lib/ai/context.ts`)

**Class**: LayaContextService

**Method**: `getUserSnapshot(userId, targetDate)`

**Purpose**: Aggregate user data in token-optimized format (TOON principle)

**Data Fetched**:
1. Active habits (id, title, frequency, targetValue, unit, currentStreak)
2. Recent logs (last 7 days)
3. Incomplete goals
4. Target date

**Output Format** (for AI prompt):
```
habits: "[ID:clm...] Morning Meditation (DAILY, Streak:5)\n[ID:clm...] Exercise (WEEKLY, Streak:2)"
logs: "[2026-01-21] Habit:clm... Val:15 Stat:COMPLETED\n[2026-01-20] Habit:clm... Val:0 Stat:SKIPPED"
goals: "Goal: AWS Cert (50%)\nGoal: Learn Python (30%)"
targetDate: "2026-01-22"
```

---

## File Structure

### Root Level
```
/Laya
├── auth.ts                        # NextAuth configuration
├── docker-compose.yml             # PostgreSQL container
├── eslint.config.mjs              # ESLint rules
├── next-env.d.ts                  # Next.js type definitions
├── next.config.ts                 # Next.js configuration (React Compiler enabled)
├── package.json                   # Dependencies (622 packages)
├── postcss.config.mjs             # PostCSS for Tailwind
├── prisma.config.ts               # Unused? Should be prisma/schema.prisma
├── README.md                       # Basic setup instructions
├── tsconfig.json                  # TypeScript configuration
├── POSTMAN_SETUP_GUIDE.md         # API testing guide (newly added)
├── postman_collection.json        # Postman collection (newly added)
├── PROJECT_STATE_DOCUMENTATION.md # This file (newly added)
│
├── public/                         # Static assets
│
├── prisma/
│   ├── schema.prisma              # Database schema (8 models, 3 enums)
│   ├── seed.ts                    # Database seeding (not shown)
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   ├── 20260120192652_init_production_schema/
│   │   │   └── migration.sql
│   │   └── 20260120210929_add_verification_token/
│   │       └── migration.sql
│   └── .env.local                 # Database URL (local)
│
└── src/
    ├── app/
    │   ├── layout.tsx             # Root layout with Providers + Toaster
    │   ├── page.tsx               # Landing page ✅
    │   ├── providers.tsx          # SessionProvider + QueryClientProvider
    │   ├── error.tsx              # Error boundary (has import errors)
    │   ├── globals.css            # Global Tailwind styles
    │   │
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── otp/route.ts   # OTP generation
    │   │   │   └── [...nextauth]/route.ts
    │   │   ├── goals/
    │   │   │   ├── route.ts       # GET/POST goals
    │   │   │   └── [id]/route.ts  # PATCH goals
    │   │   ├── habits/
    │   │   │   ├── route.ts       # GET/POST habits
    │   │   │   ├── [id]/route.ts  # GET/PATCH/DELETE habit
    │   │   │   ├── log/route.ts   # POST log
    │   │   │   └── logs/route.ts  # GET logs (date range)
    │   │   ├── planner/
    │   │   │   ├── route.ts       # GET plan
    │   │   │   └── generate/route.ts # POST AI plan generation
    │   │   ├── user/
    │   │   │   └── profile/route.ts # GET/PATCH user profile
    │   │   └── export/
    │   │       └── route.ts       # GET CSV export
    │   │
    │   ├── auth/
    │   │   └── login/
    │   │       └── page.tsx       # Login page (missing)
    │   │
    │   └── dashboard/
    │       ├── page.tsx           # Main dashboard ⏳
    │       ├── goals/page.tsx     # Goals page ⏳
    │       ├── planner/page.tsx   # Planner page ⏳
    │       └── settings/page.tsx  # Settings page ⏳
    │
    ├── components/
    │   ├── atoms/
    │   │   ├── Avatar.tsx
    │   │   ├── Badge.tsx
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── GridCell.tsx
    │   │   ├── IconButton.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── popover.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── Select.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── StatusCheckbox.tsx ✅
    │   │   └── textarea.tsx
    │   │
    │   ├── molecules/
    │   │   ├── AIPlanCard.tsx
    │   │   ├── DateColumnHeader.tsx
    │   │   ├── GoalStepItem.tsx
    │   │   ├── HabitRowHeader.tsx ✅
    │   │   ├── MonthNavigator.tsx
    │   │   ├── NotificationPopover.tsx
    │   │   ├── StatCard.tsx
    │   │   ├── StreakIndicator.tsx ✅
    │   │   └── ThemeToggle.tsx
    │   │
    │   ├── organisms/
    │   │   ├── AnalyticsSection.tsx ✅
    │   │   ├── GoalDashboard.tsx
    │   │   ├── PlannerTimeline.tsx
    │   │   ├── VirtualHabitGrid.tsx ✅
    │   │   └── templates/
    │   │       └── DashboardLayout.tsx
    │   │
    │   └── templates/
    │       └── DashboardLayout.tsx
    │
    └── lib/
        ├── ai/
        │   ├── context.ts         # Context aggregation service ✅
        │   └── gemini.ts          # Gemini API integration ✅
        ├── hooks/
        │   └── use-api.ts         # React Query hooks ✅
        ├── prisma.ts              # Prisma client singleton
        ├── proxy.ts               # secureRoute middleware ✅
        ├── store.ts               # Zustand store ✅
        ├── tokens.ts              # OTP generation/validation ✅
        ├── utils.ts               # Utility functions (cn, formatDate, etc.)
        └── validations.ts         # Zod schemas for all endpoints ✅
```

---

## Current Issues & Known Limitations

### **Critical Issues**

1. **Missing UI Component Imports** ❌
   - **File**: `src/app/error.tsx`
   - **Error**: Module not found: `@/components/ui/button`
   - **Cause**: Button component doesn't exist at that path; should use `@/components/atoms/button`
   - **Impact**: Error boundary page not rendering
   - **Fix**: Update import path in error.tsx

2. **Authentication Session Errors** ⚠️
   - **Terminal Output**: `[auth][error] JWTSessionError: Read more at https://errors.authjs.dev#jwtsessionerror`
   - **Cause**: "no matching decryption secret" - NEXTAUTH_SECRET environment variable issue
   - **Impact**: Session not properly established after login
   - **Fix**: Set `NEXTAUTH_SECRET` in `.env.local` (or generate with `openssl rand -base64 32`)

3. **Dashboard Page Commented Out** ⏳
   - **File**: `src/app/dashboard/page.tsx` (451 lines, ~90% commented)
   - **Issue**: Main dashboard content disabled
   - **Impact**: Dashboard page doesn't display expected content
   - **Fix**: Uncomment and fix missing component imports

4. **Login Page Missing** ❌
   - **File**: `src/app/auth/login/page.tsx`
   - **Issue**: File referenced but not found in workspace
   - **Impact**: Users can't log in; login route broken
   - **Fix**: Create login page with OTP + Google OAuth UI

---

### **Minor Issues**

5. **Unused Configuration** 📋
   - **File**: `prisma.config.ts` in root
   - **Issue**: Prisma config should be in `prisma/schema.prisma`
   - **Impact**: Minimal; doesn't break functionality
   - **Fix**: Remove or clarify purpose

6. **Streak Update Not Implemented** ⏳
   - **Location**: `src/app/api/habits/log/route.ts` line 51 (TODO comment)
   - **Issue**: "TODO: Trigger Async Job here to update 'Streaks'"
   - **Impact**: Current streak counters not automatically updated
   - **Fix**: Implement async job runner or webhook trigger

7. **SMS/Email Not Configured** 📧
   - **Location**: `src/app/api/auth/otp/route.ts`
   - **Status**: Dev mode logs OTP to console
   - **Issue**: No Twilio/SNS or Resend/Nodemailer integration
   - **Impact**: OTPs only visible in server logs
   - **Fix**: Implement sendSMS() and sendEmail() functions

8. **Google Sheets Sync Not Implemented** 📊
   - **Schema**: googleSheetId, lastSyncTime fields exist
   - **Location**: No sync logic in codebase
   - **Impact**: Data can't be synced to Google Sheets
   - **Fix**: Implement Phase 2 feature

9. **Advanced Recurrence Rules Not Used** 📅
   - **Schema**: rrule field supports RFC 5545 patterns
   - **Usage**: Not implemented in frontend/backend
   - **Impact**: Complex patterns (e.g., "2nd Tuesday every month") not supported
   - **Fix**: Integrate rrule library and UI

10. **Virtual Habit Grid Column Virtualization Missing** 🚀
    - **Current**: Row virtualization only
    - **Limitation**: Can render hundreds of habits, but not thousands of columns
    - **Fix**: Add column virtualization for multi-year views

11. **NEXT_PUBLIC_GEMINI_API_KEY Not Set** 🔑
    - **Impact**: AI features fail if not configured
    - **Fix**: Add Gemini API key to `.env.local`

12. **Error Handling Incomplete** ⚠️
    - **Issue**: Some API errors don't return proper error messages
    - **Fix**: Add try-catch wrappers and detailed error responses

---

## Development Environment

### **Required Environment Variables** (.env.local)

```bash
# Database
DATABASE_URL="postgresql://laya_user:securepass@localhost:5435/laya_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Google OAuth
GOOGLE_CLIENT_ID="<from Google Cloud Console>"
GOOGLE_CLIENT_SECRET="<from Google Cloud Console>"

# Gemini AI
GEMINI_API_KEY="<from Google Cloud Console>"
```

### **Running the Project**

**1. Start PostgreSQL**
```bash
docker-compose up -d
```

**2. Setup Database**
```bash
npx prisma db push
# or: npx prisma migrate dev --name init
```

**3. Seed Database** (optional)
```bash
npx prisma db seed
```

**4. Start Dev Server**
```bash
npm run dev
```

**5. Visit**
```
http://localhost:3000
```

### **Dependencies Summary**

**Frontend**: 25+ packages
- React 19, Next.js 16, TailwindCSS 4, Radix UI, React Query, Zustand, Recharts

**Backend**: 10+ packages
- NextAuth 5, Prisma 7, PostgreSQL driver, Zod, bcryptjs, Google AI SDK

**DevTools**: ESLint, Prettier, TypeScript, Husky, tsx

**Total**: 622 audited packages, 3 high vulnerabilities (run `npm audit fix`)

### **Scripts**

```json
"dev": "next dev",          // Start dev server
"build": "next build",      // Production build
"start": "next start",      // Start production server
"lint": "eslint",           // Run linter
"test": "echo \"No tests yet\"",
"prepare": "husky"          // Git hooks
```

---

## Summary Table

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **Auth System** | ✅ | `/auth.ts` | NextAuth + OTP, JWT session errors |
| **Landing Page** | ✅ | `src/app/page.tsx` | Complete, responsive |
| **Login Page** | ❌ | Missing | Critical - needed for auth flow |
| **Dashboard Page** | ⏳ | `src/app/dashboard/page.tsx` | 90% commented out |
| **Goals Pages** | ⏳ | `src/app/dashboard/goals/` | Placeholder |
| **Planner Page** | ⏳ | `src/app/dashboard/planner/` | Placeholder |
| **Settings Page** | ⏳ | `src/app/dashboard/settings/` | Placeholder |
| **API Routes** | ✅ | `src/app/api/` | 7 modules, 16 endpoints complete |
| **Database Schema** | ✅ | `prisma/schema.prisma` | 8 models, 3 enums, proper indexes |
| **UI Components** | ✅ | `src/components/` | Atoms (14), Molecules (9), Organisms (4) |
| **State Management** | ✅ | `src/lib/store.ts` | Zustand + React Query |
| **AI Integration** | ✅ | `src/lib/ai/` | Gemini API integration |
| **Postman Collection** | ✅ | `/postman_collection.json` | Complete with post-response scripts |

---

## Next Steps Recommendations

### **Immediate (Blocking)**
1. Create `/src/app/auth/login/page.tsx` with OTP + Google sign-in UI
2. Fix error.tsx import paths
3. Set NEXTAUTH_SECRET in .env.local
4. Uncomment dashboard page and fix component imports

### **Short-term (Phase 1 MVP)**
1. Complete dashboard page with VirtualHabitGrid integration
2. Implement login flow end-to-end (test OTP, Google OAuth)
3. Build goal/planner/settings pages
4. Add error handling and loading states
5. Test all API endpoints with Postman collection

### **Medium-term (Phase 2)**
1. Implement SMS/Email OTP delivery
2. Implement streak calculation and caching
3. Add Google Sheets sync feature
4. Implement advanced recurrence rules (rrule)
5. Add habit analytics and insights

### **Long-term (Phase 3+)**
1. Mobile app (React Native)
2. Social features (sharing, challenges)
3. Advanced AI features (habit recommendations)
4. Notification system
5. Performance optimization (CDN, caching strategies)

---

**Document Generated**: January 21, 2026  
**Project Status**: MVP Core Complete, UI Integration In Progress  
**Last Updated**: This session
