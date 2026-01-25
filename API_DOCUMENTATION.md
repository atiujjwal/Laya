# Laya - Complete API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Core Concepts](#core-concepts)
3. [API Endpoints](#api-endpoints)
4. [Data Schemas](#data-schemas)
5. [Error Handling](#error-handling)
6. [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Authentication

All API endpoints (except `/api/auth/otp` and `/api/auth/[...nextauth]`) are **protected** and require authentication via NextAuth.js.

### Authentication Methods

#### 1. **Google OAuth** (Recommended)
- Provides automatic access to Google Sheets for syncing
- Stores `access_token` and `refresh_token` for Sheets API integration

#### 2. **Email/Mobile OTP** (Custom Credentials Provider)
- Mobile-first authentication
- Multi-step process: Generate OTP → Verify → Authenticate

### Authentication Flow

```
Frontend → POST /api/auth/otp → Backend (Generate & Send OTP)
         ↓
Frontend (Receive Code) → Credentials Provider (Verify OTP)
         ↓
Backend → NextAuth JWT Session
         ↓
Frontend (Auto redirect on success)
```

### Session Object (Available in Frontend)

```typescript
interface Session {
  user: {
    id: string;           // User ID from database
    email: string;        // User email
    name?: string;        // User name
    image?: string;       // Profile picture
  };
  expires: string;        // ISO timestamp
}
```

**Access Session in React Component:**
```typescript
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not logged in</div>;
  
  console.log(session?.user?.id);  // Access user ID
}
```

---

## Core Concepts

### 1. **Data Ownership & Security**
- All resources are **scoped to the authenticated user** via `userId`
- Backend validates `userId` on every request to prevent unauthorized access
- Soft deletes used for historical data preservation (habits use `archived` flag)

### 2. **Date Handling**
- All dates are stored as **UTC Midnight** (`YYYY-MM-DDTHH:mm:ss.000Z`)
- Frontend should normalize dates: `new Date(dateString).setUTCHours(0, 0, 0, 0)`
- Query parameters: Pass ISO format (`YYYY-MM-DDTHH:mm:ss.000Z`)

### 3. **Pagination**
- Supported on `/api/habits` (GET)
- Query params: `page` (default: 1), `limit` (default: 50)

### 4. **Timezone Awareness**
- User timezone stored in database (`User.timezone`)
- Frontend should convert all dates to user's timezone before display
- Example: `new Date(utcDate).toLocaleString('en-US', { timeZone: userTimezone })`

### 5. **Frequency Types**
```typescript
enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  INTERVAL = "INTERVAL"  // Every N days/weeks/months
}
```

### 6. **Log Status**
```typescript
enum LogStatus {
  COMPLETED = "COMPLETED",  // Successfully completed
  SKIPPED = "SKIPPED",      // Intentionally skipped
  FAILED = "FAILED"         // Attempted but failed
}
```

---

## API Endpoints

---

## AUTHENTICATION APIs

### `POST /api/auth/otp`
**Purpose:** Generate and send OTP to user's email or phone

**Access:** Public (no authentication required)

**Request Body:**
```json
{
  "identifier": "user@example.com",  // Email or phone number
  "type": "email"                    // "email" | "mobile"
}
```

**Validation:**
- `identifier`: min 3 characters (required)
- `type`: must be "email" or "mobile"

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP Sent"
}
```

**Error Responses:**
- `400`: Missing or invalid identifier/type
- `500`: Rate limited or service error (dev mode logs to console)

**Frontend Implementation:**
```typescript
async function sendOTP(email: string) {
  const res = await fetch('/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: email,
      type: 'email'
    })
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return await res.json();
}
```

**Data Flow:**
```
User enters email
     ↓
Frontend calls POST /api/auth/otp
     ↓
Backend generates 6-digit OTP, stores in VerificationToken table with expiry
     ↓
Backend sends via email/SMS (dev mode: logs to console)
     ↓
Frontend prompts user to enter OTP code
     ↓
User submits code → NextAuth validates via Credentials Provider
```

---

## HABITS APIs

### `GET /api/habits`
**Purpose:** Fetch all habits for the current user with optional filtering

**Access:** Protected (requires authentication)

**Query Parameters:**
```
page=1           // Default: 1 (pagination)
limit=50         // Default: 50 (items per page)
archived=false   // Default: false (show active habits only)
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "cuid_string",
      "userId": "user_id",
      "title": "Morning Jog",
      "description": "30 minute run",
      "color": "#FF6B6B",
      "icon": "🏃",
      "frequency": "DAILY",
      "weekDays": [1, 3, 5],              // 0=Sun, 1=Mon, etc.
      "rrule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",  // Optional: advanced recurrence
      "targetValue": 1,                    // How much to track
      "unit": null,                        // "pages", "minutes", "km", etc.
      "currentStreak": 7,                  // Days completed consecutively
      "longestStreak": 21,                 // All-time longest
      "archived": false,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-22T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 50
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
import { useQuery } from '@tanstack/react-query';

function useHabits(page = 1, limit = 50, archived = false) {
  return useQuery({
    queryKey: ['habits', { page, limit, archived }],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit),
        archived: String(archived)
      });
      
      const res = await fetch(`/api/habits?${params}`);
      if (!res.ok) throw new Error('Failed to fetch habits');
      return res.json();
    }
  });
}

// Usage in component
export function HabitsList() {
  const { data, isLoading, error } = useHabits(1, 20, false);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.data.map(habit => (
        <div key={habit.id}>
          <h3>{habit.title}</h3>
          <p>Streak: {habit.currentStreak} days</p>
        </div>
      ))}
    </div>
  );
}
```

---

### `POST /api/habits`
**Purpose:** Create a new habit

**Access:** Protected

**Request Body:**
```json
{
  "title": "Morning Meditation",
  "description": "10 minute meditation",
  "color": "#4ECDC4",
  "icon": "🧘",
  "frequency": "DAILY",
  "weekDays": [0, 1, 2, 3, 4, 5, 6],     // Optional
  "targetValue": 10,                      // Optional: default 1
  "unit": "minutes"                       // Optional
}
```

**Validation (Zod Schema):**
```typescript
{
  title: string (min 1, max 100) - REQUIRED
  description: string - OPTIONAL
  color: string (hex format, e.g., #RRGGBB) - default: #000000
  icon: string - OPTIONAL
  frequency: enum (DAILY, WEEKLY, MONTHLY, INTERVAL) - default: DAILY
  weekDays: number[] (0-6) - OPTIONAL
  targetValue: int (min 1) - default: 1
  unit: string - OPTIONAL
}
```

**Success Response (201):**
```json
{
  "id": "clx123...",
  "userId": "user_id",
  "title": "Morning Meditation",
  "description": "10 minute meditation",
  "color": "#4ECDC4",
  "icon": "🧘",
  "frequency": "DAILY",
  "weekDays": [0, 1, 2, 3, 4, 5, 6],
  "targetValue": 10,
  "unit": "minutes",
  "currentStreak": 0,
  "longestStreak": 0,
  "archived": false,
  "createdAt": "2026-01-22T14:30:00Z",
  "updatedAt": "2026-01-22T14:30:00Z"
}
```

**Error Responses:**
- `400`: Validation failed (missing required field, invalid format, etc.)
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitData) => {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });
}

// Usage in component
export function CreateHabitForm() {
  const { mutate, isPending, error } = useCreateHabit();
  
  const handleSubmit = (formData) => {
    mutate({
      title: formData.title,
      frequency: 'DAILY',
      color: '#FF6B6B'
    });
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(Object.fromEntries(new FormData(e.currentTarget)));
    }}>
      <input name="title" placeholder="Habit name" required />
      <button disabled={isPending} type="submit">Create</button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

**Data Flow:**
```
User fills form → Submit button → Mutation validates data
        ↓
Sends POST /api/habits with validated JSON
        ↓
Backend validates with Zod schema
        ↓
Checks authentication (secureRoute middleware)
        ↓
Creates record in Habit table with userId
        ↓
Returns 201 with full habit object
        ↓
React Query invalidates 'habits' cache
        ↓
UI re-fetches and displays new habit in list
```

---

### `GET /api/habits/[id]`
**Purpose:** Fetch a single habit by ID

**Access:** Protected

**Path Parameters:**
```
id: string (CUID format) - Required
```

**Success Response (200):**
```json
{
  "id": "clx123...",
  "userId": "user_id",
  "title": "Morning Jog",
  ... (same schema as POST response)
}
```

**Error Responses:**
- `401`: Not authenticated
- `404`: Habit not found or doesn't belong to user
- `500`: Server error

**Frontend Implementation:**
```typescript
function useHabitDetail(habitId: string) {
  return useQuery({
    queryKey: ['habit', habitId],
    queryFn: async () => {
      const res = await fetch(`/api/habits/${habitId}`);
      if (!res.ok) throw new Error('Failed to fetch habit');
      return res.json();
    },
    enabled: !!habitId  // Only fetch if habitId is available
  });
}

// Usage
export function HabitDetailPage({ habitId }) {
  const { data: habit, isLoading } = useHabitDetail(habitId);
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{habit?.title}</div>;
}
```

---

### `PATCH /api/habits/[id]`
**Purpose:** Update a habit's properties

**Access:** Protected

**Path Parameters:**
```
id: string (CUID) - Required
```

**Request Body:** (All fields optional)
```json
{
  "title": "Evening Yoga",
  "color": "#6C63FF",
  "frequency": "WEEKLY",
  "weekDays": [2, 4, 6],
  "targetValue": 30,
  "unit": "minutes"
}
```

**Validation:** Same as POST, all fields optional (partial schema)

**Success Response (200):**
```json
{
  "id": "clx123...",
  "userId": "user_id",
  "title": "Evening Yoga",
  "color": "#6C63FF",
  ... (updated fields reflected)
}
```

**Error Responses:**
- `400`: Validation failed or update failed
- `401`: Not authenticated
- `404`: Habit not found or doesn't belong to user
- `500`: Server error

**Frontend Implementation:**
```typescript
function useUpdateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: (updatedHabit) => {
      queryClient.setQueryData(['habit', updatedHabit.id], updatedHabit);
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });
}

// Usage
export function EditHabitForm({ habitId, initialData }) {
  const { mutate, isPending } = useUpdateHabit();
  
  const handleSubmit = (updates) => {
    mutate({ id: habitId, data: updates });
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(Object.fromEntries(new FormData(e.currentTarget)));
    }}>
      <input name="title" defaultValue={initialData.title} />
      <button disabled={isPending}>Update</button>
    </form>
  );
}
```

---

### `DELETE /api/habits/[id]`
**Purpose:** Archive (soft delete) a habit

**Access:** Protected

**Path Parameters:**
```
id: string (CUID) - Required
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400`: Delete operation failed
- `401`: Not authenticated
- `404`: Habit not found
- `500`: Server error

**Important Notes:**
- This is a **soft delete** (archives the habit)
- Habit history and logs are preserved
- Frontend can retrieve archived habits with `?archived=true`

**Frontend Implementation:**
```typescript
function useDeleteHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.removeQueries({ queryKey: ['habit', deletedId] });
    }
  });
}

// Usage
export function DeleteHabitButton({ habitId }) {
  const { mutate, isPending } = useDeleteHabit();
  
  const handleDelete = () => {
    if (confirm('Archive this habit?')) {
      mutate(habitId);
    }
  };
  
  return (
    <button disabled={isPending} onClick={handleDelete}>
      Delete
    </button>
  );
}
```

---

## HABIT LOGGING APIs

### `POST /api/habits/log`
**Purpose:** Create or update a habit log entry for a specific date

**Access:** Protected

**Request Body:**
```json
{
  "habitId": "clx123...",
  "date": "2026-01-22T00:00:00Z",    // UTC Midnight
  "value": 5,                        // Actual value tracked (e.g., 5 pages)
  "completed": true,                 // Boolean: was it completed?
  "meta": {                          // Optional: mood, notes, context
    "mood": "Happy",
    "notes": "Felt energetic today",
    "weather": "Sunny"
  }
}
```

**Validation (Zod Schema):**
```typescript
{
  habitId: string (CUID) - REQUIRED
  date: string (ISO datetime) - REQUIRED
  value: int (min 0) - REQUIRED
  completed: boolean - REQUIRED
  meta: Record<string, any> - OPTIONAL
}
```

**Success Response (200):**
```json
{
  "id": "clx456...",
  "habitId": "clx123...",
  "date": "2026-01-22T00:00:00Z",
  "value": 5,
  "completed": true,
  "status": "COMPLETED",              // Auto-set based on completed flag
  "meta": {
    "mood": "Happy",
    "notes": "Felt energetic today",
    "weather": "Sunny"
  },
  "createdAt": "2026-01-22T14:30:00Z",
  "updatedAt": "2026-01-22T14:30:00Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Not authenticated
- `404`: Habit not found or doesn't belong to user
- `500`: Server error

**Important Notes:**
- **Upsert behavior**: Creates new log if not exists, updates if exists
- Unique constraint: One log per habit per date (`habitId_date`)
- `status` is auto-set: `COMPLETED` if `completed=true`, else `SKIPPED`
- **TODO**: Streak calculation (Phase 6) - currently not updated automatically

**Frontend Implementation:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogStatus } from '@prisma/client';

function useLogHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logData) => {
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      
      if (!res.ok) throw new Error('Failed to log habit');
      return res.json();
    },
    onSuccess: (_, logData) => {
      const dateKey = logData.date.split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['habitLogs', dateKey] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });
}

// Usage in component
export function HabitLogButton({ habitId, date }) {
  const { mutate, isPending } = useLogHabit();
  
  const handleToggle = async (isCompleted: boolean) => {
    mutate({
      habitId,
      date: new Date(date).toISOString().split('T')[0] + 'T00:00:00Z',
      value: 1,
      completed: isCompleted,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  };
  
  return (
    <div>
      <button 
        disabled={isPending}
        onClick={() => handleToggle(true)}
      >
        ✓ Done
      </button>
      <button 
        disabled={isPending}
        onClick={() => handleToggle(false)}
      >
        Skip
      </button>
    </div>
  );
}
```

**Data Flow for Habit Logging:**
```
User clicks "Done" button on habit
      ↓
Frontend prepares log data:
  - habitId
  - date (normalized to midnight UTC)
  - value (1 for boolean habits, actual count for numeric)
  - completed (true/false)
  - meta (optional context)
      ↓
POST /api/habits/log
      ↓
Backend verifies:
  1. User is authenticated
  2. Habit belongs to user
      ↓
Upsert into HabitLog:
  - If log exists: UPDATE value, completed, status, meta
  - If log new: CREATE with all fields
      ↓
Return updated log object (201 or 200)
      ↓
Frontend updates React Query cache
      ↓
UI reflects changes: streak updates, grid cell changes color
```

---

### `GET /api/habits/logs`
**Purpose:** Fetch all habit logs within a date range (for charts, history, etc.)

**Access:** Protected

**Query Parameters:**
```
startDate=2026-01-01T00:00:00Z  // ISO datetime - Required
endDate=2026-01-31T23:59:59Z    // ISO datetime - Required
```

**Success Response (200):**
```json
[
  {
    "habitId": "clx123...",
    "date": "2026-01-15T00:00:00Z",
    "completed": true,
    "value": 10,
    "status": "COMPLETED"
  },
  {
    "habitId": "clx123...",
    "date": "2026-01-16T00:00:00Z",
    "completed": false,
    "value": 0,
    "status": "SKIPPED"
  }
]
```

**Error Responses:**
- `400`: Missing or invalid date range
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
function useHabitLogs(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['habitLogs', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const res = await fetch(`/api/habits/logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    }
  });
}

// Usage: Fetch logs for current month
export function MonthlyHabitView() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { data: logs, isLoading } = useHabitLogs(startDate, endDate);
  
  if (isLoading) return <div>Loading...</div>;
  
  const logsByHabit = logs?.reduce((acc, log) => {
    if (!acc[log.habitId]) acc[log.habitId] = [];
    acc[log.habitId].push(log);
    return acc;
  }, {});
  
  return (
    <div>
      {Object.entries(logsByHabit).map(([habitId, habitLogs]) => (
        <div key={habitId}>
          <h3>Habit: {habitId}</h3>
          <p>Completed: {habitLogs.filter(l => l.completed).length} days</p>
        </div>
      ))}
    </div>
  );
}
```

---

## GOALS APIs

### `GET /api/goals`
**Purpose:** Fetch all goals with optional filtering

**Access:** Protected

**Query Parameters:**
```
completed=false    // Optional: filter by completion status (true/false)
category=Health    // Optional: filter by category
```

**Success Response (200):**
```json
[
  {
    "id": "clx789...",
    "userId": "user_id",
    "title": "Run a 5K",
    "category": "Health",
    "targetDate": "2026-03-01T00:00:00Z",
    "steps": [
      {
        "step": "Buy running shoes",
        "done": true
      },
      {
        "step": "Train for 4 weeks",
        "done": false
      },
      {
        "step": "Complete 5K race",
        "done": false
      }
    ],
    "progress": 33,      // Percentage 0-100
    "completed": false,
    "createdAt": "2026-01-20T00:00:00Z",
    "updatedAt": "2026-01-22T00:00:00Z"
  }
]
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
function useGoals(filters?: { completed?: boolean; category?: string }) {
  return useQuery({
    queryKey: ['goals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.completed !== undefined) {
        params.append('completed', String(filters.completed));
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      
      const res = await fetch(`/api/goals?${params}`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    }
  });
}

// Usage
export function GoalsList() {
  const { data: goals, isLoading } = useGoals({ completed: false });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {goals?.map(goal => (
        <div key={goal.id}>
          <h3>{goal.title}</h3>
          <p>Progress: {goal.progress}%</p>
          <div style={{ width: '100%', height: '8px', background: '#eee' }}>
            <div 
              style={{ 
                width: `${goal.progress}%`, 
                height: '100%', 
                background: '#4ECDC4' 
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### `POST /api/goals`
**Purpose:** Create a new goal

**Access:** Protected

**Request Body:**
```json
{
  "title": "Complete Online Course",
  "category": "Learning",
  "targetDate": "2026-03-15T00:00:00Z",
  "steps": [
    {
      "step": "Enroll in course",
      "done": false
    },
    {
      "step": "Complete modules 1-5",
      "done": false
    },
    {
      "step": "Pass final exam",
      "done": false
    }
  ]
}
```

**Validation (Zod Schema):**
```typescript
{
  title: string (min 3) - REQUIRED
  category: string - default: "General"
  targetDate: string (ISO datetime) - OPTIONAL
  steps: Array<{ step: string; done: boolean }> - OPTIONAL
}
```

**Success Response (201):**
```json
{
  "id": "clx789...",
  "userId": "user_id",
  "title": "Complete Online Course",
  "category": "Learning",
  "targetDate": "2026-03-15T00:00:00Z",
  "steps": [...],
  "progress": 0,
  "completed": false,
  "createdAt": "2026-01-22T14:30:00Z",
  "updatedAt": "2026-01-22T14:30:00Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goalData) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });
      
      if (!res.ok) throw new Error('Failed to create goal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
}

// Usage
export function CreateGoalDialog() {
  const { mutate, isPending } = useCreateGoal();
  
  const handleSubmit = (formData) => {
    const steps = formData.steps
      ?.split('\n')
      .filter(s => s.trim())
      .map(step => ({ step: step.trim(), done: false }));
    
    mutate({
      title: formData.title,
      category: formData.category || 'General',
      targetDate: formData.targetDate,
      steps: steps || []
    });
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(Object.fromEntries(new FormData(e.currentTarget)));
    }}>
      <input name="title" placeholder="Goal title" required />
      <input name="category" placeholder="Category" />
      <input name="targetDate" type="date" />
      <textarea name="steps" placeholder="Steps (one per line)" />
      <button disabled={isPending}>Create Goal</button>
    </form>
  );
}
```

---

### `PATCH /api/goals/[id]`
**Purpose:** Update goal properties, progress, steps, or mark as complete

**Access:** Protected

**Path Parameters:**
```
id: string (CUID) - Required
```

**Request Body:** (All fields optional)
```json
{
  "title": "Advanced Online Course",
  "progress": 50,
  "completed": false,
  "steps": [
    {
      "step": "Enroll in course",
      "done": true
    },
    {
      "step": "Complete modules 1-5",
      "done": true
    },
    {
      "step": "Pass final exam",
      "done": false
    }
  ]
}
```

**Validation:** Same as POST, all fields optional

**Success Response (200):**
```json
{
  "id": "clx789...",
  "userId": "user_id",
  "title": "Advanced Online Course",
  "category": "Learning",
  "progress": 50,
  "completed": false,
  "steps": [...],
  "updatedAt": "2026-01-22T15:45:00Z"
}
```

**Error Responses:**
- `400`: Update failed or validation error
- `401`: Not authenticated
- `404`: Goal not found or doesn't belong to user
- `500`: Server error

**Frontend Implementation:**
```typescript
function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData(['goal', updatedGoal.id], updatedGoal);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });
}

// Usage: Update progress
export function GoalProgressBar({ goalId, currentProgress }) {
  const { mutate } = useUpdateGoal();
  
  const handleProgressChange = (newProgress: number) => {
    mutate({
      id: goalId,
      data: { progress: newProgress }
    });
  };
  
  return (
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={currentProgress}
      onChange={(e) => handleProgressChange(Number(e.target.value))}
    />
  );
}

// Usage: Toggle step completion
export function GoalStepItem({ goalId, goalSteps, stepIndex }) {
  const { mutate } = useUpdateGoal();
  
  const handleToggleStep = () => {
    const updatedSteps = goalSteps.map((step, i) => 
      i === stepIndex ? { ...step, done: !step.done } : step
    );
    
    const completedCount = updatedSteps.filter(s => s.done).length;
    const newProgress = Math.round((completedCount / updatedSteps.length) * 100);
    
    mutate({
      id: goalId,
      data: { 
        steps: updatedSteps,
        progress: newProgress
      }
    });
  };
  
  return (
    <label>
      <input 
        type="checkbox" 
        checked={goalSteps[stepIndex].done}
        onChange={handleToggleStep}
      />
      {goalSteps[stepIndex].step}
    </label>
  );
}
```

---

## PLANNER APIs

### `GET /api/planner`
**Purpose:** Fetch AI-generated day plan for a specific date

**Access:** Protected

**Query Parameters:**
```
date=2026-01-22T00:00:00Z  // ISO datetime of the day - Required
```

**Success Response (200):**
```json
{
  "id": "clx999...",
  "userId": "user_id",
  "date": "2026-01-22T00:00:00Z",
  "schedule": [
    {
      "time": "06:00",
      "task": "Morning Jog",
      "reason": "Start energy high"
    },
    {
      "time": "07:00",
      "task": "Meditation",
      "reason": "Mental clarity"
    },
    {
      "time": "08:00",
      "task": "Breakfast & News",
      "reason": "Fuel and information"
    }
  ],
  "dayScore": 78,           // 0-100 performance prediction
  "summary": "A productive day ahead...",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T14:30:00Z"
}
```

**Error Responses:**
- `400`: Missing or invalid date
- `401`: Not authenticated
- `500`: Server error

**If no plan exists:** Returns empty structure
```json
{
  "schedule": [],
  "summary": null
}
```

**Frontend Implementation:**
```typescript
function useDayPlan(date: Date) {
  return useQuery({
    queryKey: ['dayPlan', date.toISOString().split('T')[0]],
    queryFn: async () => {
      const res = await fetch(`/api/planner?date=${date.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch plan');
      return res.json();
    }
  });
}

// Usage
export function DayPlanView({ date }) {
  const { data: plan, isLoading } = useDayPlan(date);
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!plan?.schedule?.length) {
    return <div>No plan generated. Click "Generate Plan"</div>;
  }
  
  return (
    <div>
      <p>Day Score: {plan.dayScore}/100</p>
      <p>{plan.summary}</p>
      <ul>
        {plan.schedule.map((task, i) => (
          <li key={i}>
            <strong>{task.time}</strong> - {task.task}
            <p><em>{task.reason}</em></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### `POST /api/planner/generate`
**Purpose:** Generate an AI-powered day plan using Gemini AI

**Access:** Protected

**Request Body:**
```json
{
  "date": "2026-01-22T00:00:00Z",    // Target date for plan
  "focus": "Complete project work"   // Optional: user's focus intent
}
```

**Validation (Zod Schema):**
```typescript
{
  date: string (ISO datetime) - REQUIRED
  focus: string - OPTIONAL (max 200 chars)
}
```

**Success Response (200):**
```json
{
  "id": "clx999...",
  "userId": "user_id",
  "date": "2026-01-22T00:00:00Z",
  "schedule": [
    {
      "time": "06:00",
      "task": "Morning Jog",
      "reason": "Build energy for focused work"
    },
    {
      "time": "08:00",
      "task": "Project Work (3 hours)",
      "reason": "Peak productivity hours"
    },
    ...
  ],
  "dayScore": 85,
  "summary": "Based on your goals and habits, focus on deep work...",
  "createdAt": "2026-01-22T14:30:00Z",
  "updatedAt": "2026-01-22T14:30:00Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Not authenticated
- `500`: AI service error or database error

**How it works:**
1. Backend fetches user's context using `LayaContextService`:
   - Active habits for the date
   - Incomplete goals
   - User's timezone
   - Historical logs

2. Passes context to `GeminiService`:
   - AI analyzes context
   - Generates optimal schedule
   - Calculates day score
   - Writes summary

3. Upserts into database:
   - Updates if plan exists
   - Creates if new

4. Returns the plan to frontend

**Frontend Implementation:**
```typescript
function useGeneratePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date: Date) => {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString(),
          focus: 'Maximize productivity'
        })
      });
      
      if (!res.ok) throw new Error('Generation failed');
      return res.json();
    },
    onSuccess: (_, date) => {
      const dateKey = date.toISOString().split('T')[0];
      queryClient.invalidateQueries({ 
        queryKey: ['dayPlan', dateKey] 
      });
    }
  });
}

// Usage in component
export function PlannerPage({ date }) {
  const { mutate: generatePlan, isPending } = useGeneratePlan();
  const { data: plan } = useDayPlan(date);
  
  const handleGenerate = () => {
    generatePlan(date);
  };
  
  if (!plan?.schedule?.length) {
    return (
      <button 
        onClick={handleGenerate}
        disabled={isPending}
      >
        {isPending ? 'Generating...' : 'Generate Day Plan'}
      </button>
    );
  }
  
  return (
    <div>
      {/* Display plan */}
      <button 
        onClick={handleGenerate}
        disabled={isPending}
      >
        Regenerate Plan
      </button>
    </div>
  );
}
```

---

## USER PROFILE APIs

### `GET /api/user/profile`
**Purpose:** Fetch current user's profile information

**Access:** Protected

**Success Response (200):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://example.com/avatar.jpg",
  "timezone": "America/New_York",
  "onboarding": false,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });
}

// Usage
export function ProfilePage() {
  const { data: user, isLoading } = useUserProfile();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Timezone: {user?.timezone}</p>
    </div>
  );
}
```

---

### `PATCH /api/user/profile`
**Purpose:** Update user profile settings

**Access:** Protected

**Request Body:** (All fields optional)
```json
{
  "name": "Jane Doe",
  "timezone": "America/Los_Angeles",
  "onboarding": false
}
```

**Validation (Zod Schema):**
```typescript
{
  name: string (min 1, max 100) - OPTIONAL
  timezone: string - OPTIONAL (validate against IANA list)
  onboarding: boolean - OPTIONAL
}
```

**Success Response (200):**
```json
{
  "id": "user_id",
  "name": "Jane Doe",
  "email": "john@example.com",
  "timezone": "America/Los_Angeles",
  "onboarding": false,
  "updatedAt": "2026-01-22T15:45:00Z"
}
```

**Error Responses:**
- `400`: Validation failed (invalid timezone, etc.)
- `401`: Not authenticated
- `500`: Server error

**Frontend Implementation:**
```typescript
function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates) => {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile'], updatedProfile);
    }
  });
}

// Usage
export function SettingsForm() {
  const { mutate, isPending } = useUpdateProfile();
  const { data: user } = useUserProfile();
  
  const handleSubmit = (formData) => {
    mutate({
      name: formData.name,
      timezone: formData.timezone
    });
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(Object.fromEntries(new FormData(e.currentTarget)));
    }}>
      <input name="name" defaultValue={user?.name} />
      <select name="timezone" defaultValue={user?.timezone}>
        <option value="America/New_York">Eastern Time</option>
        <option value="America/Chicago">Central Time</option>
        <option value="America/Los_Angeles">Pacific Time</option>
        <option value="Europe/London">GMT</option>
        <option value="Asia/Tokyo">JST</option>
      </select>
      <button disabled={isPending}>Save Settings</button>
    </form>
  );
}
```

---

## EXPORT API

### `GET /api/export`
**Purpose:** Export all habit logs as CSV file

**Access:** Protected

**Query Parameters:** None

**Success Response (200):**
- Content-Type: `text/csv`
- File: Downloaded as `laya_export_YYYY-MM-DD.csv`

**CSV Format:**
```
Date,Habit,Category,Value,Completed,Status
2026-01-22,Morning Jog,Health,1,Yes,COMPLETED
2026-01-21,Morning Jog,Health,1,No,SKIPPED
2026-01-20,Morning Meditation,Health,10,Yes,COMPLETED
```

**Error Responses:**
- `401`: Not authenticated
- `500`: Export generation failed

**Frontend Implementation:**
```typescript
async function downloadExport() {
  const res = await fetch('/api/export');
  
  if (!res.ok) {
    throw new Error('Export failed');
  }
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laya_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Usage in component
export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport();
    } catch (error) {
      console.error(error);
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export as CSV'}
    </button>
  );
}
```

---

## Data Schemas

### User Schema
```typescript
interface User {
  id: string;                    // CUID (auto-generated)
  name?: string;
  email: string;                 // Unique
  emailVerified?: Date;
  image?: string;                // Profile picture URL
  password?: string;             // Optional (for email/pass auth)
  
  // App Settings
  timezone: string;              // Default: "UTC"
  onboarding: boolean;           // Default: false
  
  // Google Sheets Sync
  googleSheetId?: string;
  lastSyncTime?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Habit Schema
```typescript
interface Habit {
  id: string;
  userId: string;
  
  title: string;                 // Max 100 chars
  description?: string;
  color: string;                 // Hex format (#RRGGBB)
  icon?: string;                 // Emoji or icon name
  
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'INTERVAL';
  weekDays?: number[];           // [0-6]: 0=Sun, 1=Mon, etc.
  rrule?: string;                // Advanced recurrence rule
  
  targetValue: number;           // Default: 1 (count)
  unit?: string;                 // "pages", "minutes", "km", etc.
  
  currentStreak: number;
  longestStreak: number;
  
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### HabitLog Schema
```typescript
interface HabitLog {
  id: string;
  habitId: string;
  date: Date;                    // UTC Midnight
  
  value: number;                 // Amount tracked (5 pages, 30 mins, etc.)
  completed: boolean;
  status: 'COMPLETED' | 'SKIPPED' | 'FAILED';
  
  meta?: Record<string, any>;    // { mood, notes, weather, etc. }
  
  createdAt: Date;
  updatedAt: Date;
  
  // Unique constraint
  habitId + date = unique
}
```

### Goal Schema
```typescript
interface Goal {
  id: string;
  userId: string;
  
  title: string;
  category: string;              // Default: "General"
  targetDate?: Date;
  
  steps: Array<{
    step: string;
    done: boolean;
  }>;
  
  progress: number;              // 0-100 percentage
  completed: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### DayPlan Schema
```typescript
interface DayPlan {
  id: string;
  userId: string;
  date: Date;                    // UTC Midnight
  
  schedule: Array<{
    time: string;               // "HH:MM" format
    task: string;
    reason: string;
  }>;
  
  dayScore?: number;             // 0-100
  summary?: string;              // AI-written summary
  
  createdAt: Date;
  updatedAt: Date;
  
  // Unique constraint
  userId + date = unique
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success (GET, PATCH) | ✓ Data fetched/updated |
| 201 | Created (POST) | ✓ New resource created |
| 400 | Bad Request | Validation failed, missing fields |
| 401 | Unauthorized | Not authenticated, invalid session |
| 404 | Not Found | Resource doesn't exist or not owned by user |
| 500 | Server Error | Database error, AI service down |

### Error Response Format

```json
{
  "error": "Human-readable error message"
}
```

**Examples:**
```json
// Validation error
{
  "error": "Invalid Input"
}

// Not found
{
  "error": "Habit not found"
}

// Server error
{
  "error": "Failed to fetch habits"
}

// AI error
{
  "error": "AI Service Unavailable"
}
```

### Frontend Error Handling Pattern

```typescript
async function apiCall(url: string, options = {}) {
  const res = await fetch(url, options);
  
  if (!res.ok) {
    const error = await res.json();
    
    // Handle specific errors
    if (res.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (res.status === 404) {
      // Show "Not found" message
      throw new Error('Resource not found');
    } else if (res.status === 400) {
      // Show validation errors
      throw new Error(error.error || 'Invalid input');
    } else {
      // Generic error
      throw new Error(error.error || 'Something went wrong');
    }
  }
  
  return res.json();
}

// Usage
try {
  const habit = await apiCall('/api/habits/123');
} catch (error) {
  console.error(error.message);
  setErrorMessage(error.message);
}
```

---

## Frontend Implementation Guide

### Setup: React Query Configuration

```typescript
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,           // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Recommended Hook Pattern

```typescript
// hooks/useHabits.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useHabits(filters = {}) {
  return useQuery({
    queryKey: ['habits', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/habits?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['habit', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });
}
```

### Example Component: Habit Grid

```typescript
// components/HabitGrid.tsx
import React, { useState } from 'react';
import { useHabits, useLogHabit } from '@/lib/hooks';

export function HabitGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: habits, isLoading } = useHabits({ archived: false });
  const { mutate: logHabit } = useLogHabit();
  
  const handleToggle = (habitId: string, isCompleted: boolean) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    logHabit({
      habitId,
      date: `${dateStr}T00:00:00Z`,
      value: 1,
      completed: isCompleted
    });
  };
  
  if (isLoading) return <div>Loading habits...</div>;
  
  return (
    <div className="habit-grid">
      <h2>{currentDate.toLocaleDateString()}</h2>
      
      {habits?.data?.map(habit => (
        <div key={habit.id} className="habit-card">
          <div style={{ color: habit.color }}>
            <h3>{habit.icon} {habit.title}</h3>
            <p>Streak: {habit.currentStreak} days</p>
          </div>
          
          <div className="actions">
            <button onClick={() => handleToggle(habit.id, true)}>
              ✓ Done
            </button>
            <button onClick={() => handleToggle(habit.id, false)}>
              Skip
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Example Component: Goals List

```typescript
// components/GoalsList.tsx
import React from 'react';
import { useGoals, useUpdateGoal } from '@/lib/hooks';

export function GoalsList() {
  const { data: goals, isLoading } = useGoals({ completed: false });
  const { mutate: updateGoal } = useUpdateGoal();
  
  const handleToggleStep = (goalId: string, stepIndex: number) => {
    const goal = goals.find(g => g.id === goalId);
    const updatedSteps = goal.steps.map((step, i) =>
      i === stepIndex ? { ...step, done: !step.done } : step
    );
    
    const completedCount = updatedSteps.filter(s => s.done).length;
    const newProgress = Math.round((completedCount / updatedSteps.length) * 100);
    
    updateGoal({
      id: goalId,
      data: { steps: updatedSteps, progress: newProgress }
    });
  };
  
  if (isLoading) return <div>Loading goals...</div>;
  
  return (
    <div className="goals-list">
      {goals?.map(goal => (
        <div key={goal.id} className="goal-card">
          <h3>{goal.title}</h3>
          
          <div className="progress-bar">
            <div className="progress" style={{ width: `${goal.progress}%` }} />
          </div>
          <p>{goal.progress}% Complete</p>
          
          <ul className="steps">
            {goal.steps?.map((step, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() => handleToggleStep(goal.id, i)}
                />
                <span style={{ textDecoration: step.done ? 'line-through' : 'none' }}>
                  {step.step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Date Handling Best Practice

```typescript
// utils/dateUtils.ts
export function normalizeToUTCMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

export function toISOString(date: Date): string {
  const normalized = normalizeToUTCMidnight(date);
  return normalized.toISOString();
}

export function getCurrentUserDate(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const [month, day, year] = formatter.format(now).split('/');
  const userDate = new Date(Number(year), Number(month) - 1, Number(day));
  
  return userDate;
}

// Usage
const utcMidnight = normalizeToUTCMidnight(new Date());
const userDate = getCurrentUserDate('America/New_York');
```

---

## Summary

This documentation covers:

✅ **Authentication**: OTP and Google OAuth flows  
✅ **Core Concepts**: Data ownership, dates, pagination, timezone handling  
✅ **API Endpoints**: 15+ routes with full request/response examples  
✅ **Data Schemas**: TypeScript interfaces for all models  
✅ **Error Handling**: Status codes and error response patterns  
✅ **Frontend Implementation**: React Query patterns, hooks, components  

**Next Steps for Frontend Development:**
1. Set up React Query with provided configuration
2. Implement authentication (use `next-auth/react`)
3. Create custom hooks for each API endpoint
4. Build UI components using the example patterns
5. Handle errors consistently
6. Implement date normalization throughout
7. Add optimistic updates for better UX
