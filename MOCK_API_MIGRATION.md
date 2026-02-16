# Mock API Migration - Summary

## Overview
Successfully migrated both **Question Order** and **Section Order** pages from IndexedDB to a Mock API service. This prepares the application for seamless integration with real backend APIs.

---

## What Changed

### 1. New Mock API Service
**File:** `/src/services/mockApi.ts`

- **In-memory data storage** (replaces IndexedDB)
- **13 sections** with 5-10 random questions each
- **Question ID format:** QID0001, QID0002, etc.
- **Section ID format:** "1", "2", "3", etc.
- **Random data generation** for realistic testing

**Key Features:**
- ✅ All CRUD operations (Get, Save, Filter, Order)
- ✅ Simulated network delay (100-300ms)
- ✅ Same data structure as backend will use
- ✅ Easy to replace with real fetch() calls

---

##  2. Updated Question Order Page
**File:** `/src/pages/QuestionOrder.tsx`

**Changes:**
- ❌ Removed: `DexieQuestionOrderRepository`, `appDb` imports
- ✅ Added: `mockApi` service import
- ✅ All data fetching now uses `mockApi.get*()` methods
- ✅ Order saving uses `mockApi.saveSectionOrder()`
- ✅ Reset uses `mockApi.resetData()`
- ✅ Export uses `mockApi.exportData()`

**UI Changes:**
- Description updated: "Data fetched from Mock API"
- All functionality remains identical to user

---

## 3. Updated Section Order Page
**File:** `/src/pages/SectionOrder.tsx`

**Same changes as Question Order:**
- Replaced IndexedDB calls with mockApi calls
- Updated to use mock API save endpoint

**Save to API:**
- Calls `mockApi.saveOrderToApi(data)`
- Logs formatted POST data to console
- Ready to replace with real `fetch('/api/section-order', {...})`

---

## Mock API Functions

### Data Retrieval
```typescript
mockApi.getSections()                                    // Get all 13 sections
mockApi.getQuestions()                                   // Get all questions
mockApi.getQuestionsBySection(sectionId)                 // Get questions for section
mockApi.getSectionOrder(sectionId)                       // Get order array
mockApi.getFilteredQuestions(sectionId, filters)         // Apply filters
mockApi.getFilteredQuestionIds(sectionId, filters)       // Get filtered IDs only
```

### Data Modification
```typescript
mockApi.saveSectionOrder(sectionId, questionIds)         // Save new order
mockApi.resetData()                                      // Reset to fresh random data
mockApi.saveOrderToApi(formattedData)                    // Simulate POST to backend
```

### Export
```typescript
mockApi.exportData()                                     // Export all data as JSON
```

---

## Data Structure

### Section
```typescript
{
  id: string         // "1", "2", "3"...
  title: string      // "Customer Onboarding", etc.
}
```

### Question
```typescript
{
  id: string                    // "QID0001", "QID0002"...
  sectionId: string            // "1", "2", "3"...
  text: string                 // Question text
  reviewType: ReviewType       // "Due Diligence" | "Periodic Review"
  participantType: ParticipantType  // "XY" | "PQR"
  country: CountryType         // "USA" | "UK" | "India" | "Canada"
  status: QuestionStatus       // "APPROVED" | "REVIEW" | "CANCELLED"
  createdBy?: string
  createdAt?: string
}
```

### Order Data
```typescript
{
  sectionId: string
  questionId: string
  orderIndex: number    // 1-based
}
```

---

## API Output Format

When you click **"Save to API"**, the formatted data looks like:

```json
{
  "sections": [
    {
      "sectionID": "1",
      "questions": [
        { "questionID": "QID0001", "QuestionOrder": 1 },
        { "questionID": "QID0005", "QuestionOrder": 2 }
      ]
    },
    {
      "sectionID": "2",
      "questions": [
        { "questionID": "QID0008", "QuestionOrder": 3 },
        { "questionID": "QID0012", "QuestionOrder": 4 }
      ]
    }
  ]
}
```

**Note:** QuestionOrder is global across all sections (continuous numbering).

---

## How to Connect to Real API

### Option 1: Update Mock API to Use Fetch

In `/src/services/mockApi.ts`, replace functions with real fetch calls:

```typescript
export const mockApi = {
  async getSections(): Promise<Section[]> {
    const response = await fetch('/api/sections')
    return response.json()
  },
  
  async saveSectionOrder(sectionId: string, questionIds: string[]): Promise<void> {
    await fetch(`/api/sections/${sectionId}/order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds })
    })
  },
  
  // ... update other functions similarly
}
```

### Option 2: Create Separate API Service

Keep mockApi.ts as-is and create `/src/services/api.ts`:

```typescript
export const api = {
  async getSections() {
    const response = await fetch('/api/sections')
    if (!response.ok) throw new Error('Failed to fetch sections')
    return response.json()
  },
  // ... etc
}
```

Then update imports in both pages:
```typescript
// Change:
import { mockApi } from '../services/mockApi'

// To:
import { api as mockApi } from '../services/api'  // Keeps rest of code unchanged
```

---

## Benefits of This Approach

✅ **No IndexedDB dependency** - Pure JavaScript objects in memory  
✅ **Easy testing** - Predictable, resettable data  
✅ **Backend-ready** - Same interfaces real API will use  
✅ **Fast development** - No database setup needed  
✅ **Seamless migration** - Just swap mockApi for real API  
✅ **Console logging** - See all API calls in browser console  

---

## Testing the Migration

1. **Load the application** - Data loads from mock API
2. **Apply filters** - Test filtering by country, review type, participant type
3. **Drag and drop** - Reorder questions within sections
4. **Click "Save to API"** - See formatted data in console
5. **Click "Reset Mock Data"** - See new random data generated
6. **Click "Export JSON"** - Download all data

---

## Next Steps

### To Replace with Real Backend:

1. **Create backend endpoints** matching the mock API structure
2. **Update mockApi.ts** OR create new `api.ts` with fetch() calls
3. **Add authentication** headers if needed
4. **Handle loading states** (already in place with `saving` state)
5. **Add error boundaries** for network failures
6. **Test with real data** from your database

### Endpoints You Need:

```
GET    /api/sections              → List all sections
GET    /api/questions             → List all questions
GET    /api/sections/:id/questions → Get questions for section
GET    /api/sections/:id/order    → Get question order
PUT    /api/sections/:id/order    → Update question order
POST   /api/section-order         → Save complete order (Section Order page)
```

---

## File Summary

| File | Status | Purpose |
|------|--------|---------|
| `/src/services/mockApi.ts` | ✅ NEW | Mock API service with in-memory data |
| `/src/pages/QuestionOrder.tsx` | ✅ UPDATED | Now uses mockApi instead of IndexedDB |
| `/src/pages/SectionOrder.tsx` | ✅ UPDATED | Now uses mockApi instead of IndexedDB |
| `/src/db/appDb.ts` | ⚠️ NOT USED | IndexedDB schema (keep for reference) |
| `/src/repositories/*` | ⚠️ NOT USED | Repository pattern (can remove or keep) |

---

## Troubleshooting

### Data not loading?
- Check browser console for errors
- Verify mockApi.ts is being imported correctly

### Drag and drop not working?
- Feature unchanged - should work exactly as before
- Check console for any JavaScript errors

### Save to API not working?
- Currently just logs to console (by design)
- Update `mockApi.saveOrderToApi()` to call real endpoint

### Reset not generating new data?
- Click "Reset Mock Data" button
- New random data should appear immediately

---

## Migration Complete! 🎉

Both pages now use the mock API service. You can:
- ✅ Test with realistic random data
- ✅ See API call structure in console logs
- ✅ Easily swap to real backend when ready
- ✅ No database setup or IndexedDB complexity

The application works identically from a user perspective, but is now ready for real API integration!
