# Postman Collection Setup Guide

## Overview
This Postman collection provides a complete API testing suite for the Laya Habit Tracker application. It includes all endpoints organized by functional modules with automatic environment variable management for IDs and tokens.

## Collection Structure

### 🔐 Authentication Module
- **Send OTP**: Generate and send OTP to email/mobile
- **NextAuth Handler**: Standard authentication endpoint

### 👤 User Profile Module
- **Get User Profile**: Retrieve current user information
- **Update User Profile**: Update timezone, name, and onboarding status
  - Automatically stores `user_id`, `user_name`, `user_timezone` in environment

### 📋 Goals Management Module
- **List All Goals**: Fetch goals with optional filtering
- **Create New Goal**: Add new goals with steps
  - **Post-Response Script**: Stores `goal_id` and `goal_title` in environment
- **Update Goal**: Modify goal progress and steps
  - **Post-Response Script**: Updates `goal_progress` in environment

### 🎯 Habits Management Module
- **List All Habits**: Retrieve paginated habits list
- **Create New Habit**: Add new daily/weekly habits with frequency settings
  - **Post-Response Script**: Stores `habit_id` and `habit_title` in environment
- **Get Habit Details**: Fetch specific habit information
- **Update Habit**: Modify habit configuration
  - **Post-Response Script**: Updates `habit_title` in environment
- **Delete Habit**: Archive habit (soft delete)

### 📊 Habit Logging Module
- **Log Habit Entry**: Record habit completion with mood/notes metadata
  - **Post-Response Script**: Stores `log_id` in environment
- **Get Habit Logs**: Fetch logs for a date range

### 📅 Daily Planner Module
- **Get Day Plan**: Retrieve existing AI-generated plan
- **Generate AI Daily Plan**: Create new daily schedule
  - **Post-Response Script**: Stores `plan_id` and `day_score` in environment

### 📤 Data Export Module
- **Export Habit Data to CSV**: Download all habit logs as CSV

## Environment Variables

### Pre-configured Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `base_url` | API base URL | http://localhost:3000 |
| `auth_token` | JWT authentication token | (empty - set manually) |

### Auto-populated Variables (via Post-Response Scripts)
| Variable | Set By | Value |
|----------|--------|-------|
| `goal_id` | Create Goal | Goal CUID |
| `goal_title` | Create Goal / Update Goal | Goal title |
| `goal_progress` | Update Goal | Progress percentage |
| `habit_id` | Create Habit | Habit CUID |
| `habit_title` | Create Habit / Update Habit | Habit title |
| `log_id` | Log Habit Entry | Log CUID |
| `plan_id` | Generate Plan | Plan CUID |
| `day_score` | Generate Plan | Daily score (0-100) |
| `user_id` | Update Profile | User CUID |
| `user_name` | Update Profile | User name |
| `user_timezone` | Update Profile | Timezone string |

## Setup Instructions

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json` from the Laya project root
4. Collection will be imported with all endpoints and environment variables

### Step 2: Configure Environment
1. Click the environment dropdown (top-right)
2. Select the collection or create a new environment
3. Set `base_url` to your API server:
   - **Development**: `http://localhost:3000`
   - **Staging**: `https://staging-api.laya.com`
   - **Production**: `https://api.laya.com`

### Step 3: Authentication
1. First, use **Send OTP** endpoint to get an OTP token
2. Set the OTP token as `auth_token` in environment variables
3. All subsequent requests will use this token

## Usage Examples

### Basic Flow Example

```
1. Update User Profile
   ↓ (Auto-stores user_id in environment)
2. Create New Habit
   ↓ (Auto-stores habit_id in environment)
3. Log Habit Entry
   ↓ (Uses habit_id from environment)
4. Create New Goal
   ↓ (Auto-stores goal_id in environment)
5. Update Goal
   ↓ (Uses goal_id from environment)
6. Generate AI Daily Plan
   ↓ (Auto-stores plan_id in environment)
7. Export Data
```

### Creating a Habit and Logging Progress

1. **POST: Create New Habit** (Meditation)
   - Response stores `{{habit_id}}`
   
2. **POST: Log Habit Entry**
   - Automatically uses `{{habit_id}}` from previous response
   - Stores completion data with metadata
   
3. **GET: Get Habit Logs**
   - Use date range to view all logged entries

### Goal Tracking Workflow

1. **POST: Create New Goal** (AWS Certification)
   - Response stores `{{goal_id}}`
   
2. **PATCH: Update Goal**
   - Uses `{{goal_id}}` from creation
   - Updates progress and steps completion
   - Response updates `{{goal_progress}}`

## Request Data Reference

### Habit Object Example
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

**Frequency Options**: `DAILY`, `WEEKLY`, `MONTHLY`, `INTERVAL`
**Week Days**: 0=Sunday, 1=Monday, ..., 6=Saturday

### Goal Object Example
```json
{
  "title": "Complete AWS Certification",
  "category": "Career",
  "targetDate": "2026-06-30T23:59:59Z",
  "steps": [
    {"step": "Buy shoes", "done": false},
    {"step": "Run 5k", "done": false}
  ]
}
```

### Habit Log Example
```json
{
  "habitId": "clm1234567890abcdef",
  "date": "2026-01-21T00:00:00Z",
  "value": 15,
  "completed": true,
  "meta": {
    "mood": "Happy",
    "weather": "Sunny",
    "notes": "Felt energized"
  }
}
```

### User Profile Update Example
```json
{
  "name": "John Doe",
  "timezone": "America/New_York",
  "onboarding": true
}
```

## Common Query Parameters

### Habits List
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `archived`: Filter archived habits (default: false)

### Goals List
- `completed`: Filter by completion status (true/false)
- `category`: Filter by category (e.g., "Health", "Career")

### Habit Logs
- `startDate`: Start date in ISO format (required)
- `endDate`: End date in ISO format (required)

### Daily Planner
- `date`: Date in YYYY-MM-DD format (required)

## Post-Response Scripts

All POST/PATCH endpoints include automatic scripts that:
1. Check for successful responses (status 200/201)
2. Parse JSON response
3. Extract relevant IDs
4. Store in environment variables
5. Log actions to console for debugging

### Example Post-Response Script
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("habit_id", jsonData.id);
    pm.environment.set("habit_title", jsonData.title);
    console.log('Habit created with ID: ' + jsonData.id);
}
```

## Troubleshooting

### 401 Unauthorized
- Check `auth_token` is set in environment variables
- Token may have expired - regenerate using Send OTP

### 404 Not Found
- Verify resource IDs are correctly populated in environment
- Check that the resource exists and belongs to the authenticated user

### 400 Bad Request
- Review request body format against examples
- Check required fields are included
- Validate date formats (use ISO 8601)

### CORS Errors
- Ensure backend is running on correct URL
- Check `base_url` matches your server address

## API Response Format

All successful responses follow this format:
```json
{
  "id": "cuid_string",
  "userId": "user_cuid",
  "createdAt": "2026-01-21T12:34:56Z",
  "updatedAt": "2026-01-21T12:34:56Z",
  ...other fields
}
```

Error responses:
```json
{
  "error": "Descriptive error message"
}
```

## Best Practices

1. **Always run requests in order** of the workflow to ensure IDs are populated
2. **Test in development first** before running against staging/production
3. **Save sensitive data** (auth tokens) in Postman's secured storage
4. **Export collection regularly** for version control
5. **Document custom scripts** if you add additional tests
6. **Use environment variables** instead of hardcoding values
7. **Validate responses** by checking console logs after each request

## Additional Resources

- [Postman Documentation](https://learning.postman.com/)
- [Laya API Docs](../README.md)
- [Prisma Schema Reference](./prisma/schema.prisma)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review request body and parameters
3. Check API server logs for detailed errors
4. Verify authentication token is still valid
