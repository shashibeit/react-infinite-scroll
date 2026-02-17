# Mirage JS Integration

## Overview
The project has been updated to use **Mirage JS** for API mocking instead of direct mock function calls. This simulates a real backend API environment with network requests and responses.

## What Changed

### 1. **Mirage Server Setup** (`src/server.ts`)
Added Mirage models, factories, and routes to the existing server:

**Models:**
- `question` - Stores question data with filters (reviewType, participantType, country)
- `section` - Stores section information

**API Endpoints:**

#### GET `/api/question-order`
Fetches question order data with optional filters.

**Query Parameters:**
- `reviewType` - Filter by review type (optional)
- `participantType` - Filter by participant type (optional)
- `country` - Filter by country (optional)

**Response:**
```json
{
  "status": "SUCCESS",
  "filteredSections": [...],  // Only when filters are active
  "sections": [...]            // Always contains all sections
}
```

#### POST `/api/question-order`
Saves the updated question order.

**Request Body:**
```json
{
  "sections": [
    {
      "sectionID": 1,
      "questions": [
        { "questionID": "QID0001", "QuestionOrder": 1 },
        { "questionID": "QID0002", "QuestionOrder": 2 }
      ]
    }
  ]
}
```

#### POST `/api/question-order/reset`
Resets all data to initial state (re-seeds the database).

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Data reset successfully"
}
```

### 2. **Redux Slice Updates** (`src/store/questionOrderSlice.ts`)
Updated all async thunks to use `fetch` API instead of direct `mockApi` calls:

**Before:**
```typescript
const response = await mockApi.getQuestionOrderData(filters)
```

**After:**
```typescript
const response = await fetch(`/api/question-order?${params.toString()}`)
const data = await response.json()
```

### 3. **Data Flow**

```
React Component
    ↓
Redux Thunk (makes HTTP request)
    ↓
fetch('/api/question-order')  ← Intercepted by Mirage JS
    ↓
Mirage Server (processes request, queries in-memory database)
    ↓
Returns JSON Response
    ↓
Redux Store Updated
    ↓
Component Re-renders with New Data
```

## Benefits

1. **Realistic Environment** - Simulates actual API calls with network delays (500ms)
2. **Network Inspection** - Can view requests/responses in browser DevTools Network tab
3. **Easy Backend Integration** - When real API is ready, just remove Mirage and update endpoint URLs
4. **Persistent State** - Data persists in Mirage's in-memory database during session
5. **Testing Ready** - Can easily test loading states, error handling, and network failures

## Server Startup

The Mirage server automatically starts in development mode via `src/main.tsx`:

```typescript
if (import.meta.env.DEV) {
  makeServer()
}
```

## Data Seeding

On startup, Mirage automatically creates:
- 13 sections named "Section 1" through "Section 13"
- Random 5-10 questions per section
- Each question has random:
  - Review Type (Due Diligence or Periodic Review)
  - Participant Type (XY or PQR)
  - Country (USA, UK, India, or Canada)

## Network Simulation

All API requests have a **500ms delay** to simulate real network latency. This helps test loading states and user experience.

## Migration from Mock API

### Old Approach (Direct Mock Calls)
```typescript
// Direct function call - no network simulation
const data = mockApi.getQuestionOrderData(filters)
```

### New Approach (HTTP with Mirage)
```typescript
// HTTP request - intercepted by Mirage
const response = await fetch('/api/question-order?filters...')
const data = await response.json()
```

## Switching to Real Backend

When ready to connect to a real backend API:

1. **Remove Mirage** from `src/main.tsx`:
   ```typescript
   // Remove this block
   if (import.meta.env.DEV) {
     makeServer()
   }
   ```

2. **Update API Base URL** in Redux thunks:
   ```typescript
   // Change from:
   const response = await fetch('/api/question-order')
   
   // To:
   const response = await fetch('https://your-api.com/api/question-order')
   ```

3. **Add Authentication** if needed:
   ```typescript
   const response = await fetch('/api/question-order', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   })
   ```

## Testing in Browser

Open DevTools → Network tab to see:
- Request URL: `/api/question-order`
- Request Method: GET/POST
- Status: 200 OK
- Response Time: ~500ms
- Response Data: JSON payload

## Troubleshooting

**Problem:** Requests not being intercepted
- **Solution:** Ensure Mirage server is started before app renders

**Problem:** 404 errors for API routes
- **Solution:** Check namespace is set to 'api' and routes are defined correctly

**Problem:** Data not persisting between page refreshes
- **Solution:** Mirage uses in-memory storage - data resets on page refresh (this is expected)

## Next Steps

The application now uses Mirage JS for all question ordering operations. The pages **QuestionOrder.tsx** and **SectionOrder.tsx** work seamlessly with this new setup through Redux without any changes needed to their code.
