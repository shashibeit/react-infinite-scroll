# Redux Integration for SectionOrderV2

## Overview
SectionOrderV2 has been fully integrated with Redux for centralized state management. This allows for easier API call replacement and better state management.

## Architecture

### Redux Slice: `sectionOrderV2Slice.ts`
Located at: `/src/store/sectionOrderV2Slice.ts`

#### State Structure
```typescript
SectionOrderV2State {
  sections: FilteredSection[]              // Currently displayed sections (filtered or all)
  fullOrderSections: FilteredSection[]      // All sections (used for drag-drop reference)
  filters: {
    reviewTypes: string[]
    participantTypes: string[]
    countries: string[]
  }
  loading: boolean                          // Loading state for fetch operations
  submitLoading: boolean                    // Loading state for submit operations
  error: string | null                      // Error messages from async operations
}
```

#### Async Thunks

**1. fetchSectionOrderData(filters: FilterRequest)**
- **Purpose**: Fetch filtered section order data from API
- **Input**: FilterRequest with reviewTypes, participantTypes, countries
- **Output**: ApiResponse with sections and filteredSections
- **Currently**: Uses mock API `buildApiResponse()` 
- **Implementation**: Redux slice at lines 40-60
- **To Replace with Real API**: Update the commented fetch call in the thunk

**2. submitSectionOrderData(request: UpdateSectionOrderRequest)**
- **Purpose**: Submit reordered section data to API
- **Input**: UpdateSectionOrderRequest with sections array
- **Output**: UpdateSectionOrderResponse with status and message
- **Currently**: Uses mock API `updateSectionOrder()` with 3-second delay
- **Implementation**: Redux slice at lines 63-85
- **To Replace with Real API**: Update the commented fetch call in the thunk

#### Actions
- `setSections(sections)` - Update displayed sections
- `setFullOrderSections(sections)` - Update full order sections reference
- `setFilters(filters)` - Update filter state
- `clearError()` - Clear error messages

### Component: `SectionOrderV2.tsx`
Located at: `/src/pages/SectionOrderV2.tsx`

#### Redux Hooks Used
```typescript
const dispatch = useAppDispatch()
const {
  sections,
  fullOrderSections,
  loading: reduxLoading,
  submitLoading: reduxSubmitLoading,
  error: reduxError,
} = useAppSelector((state) => state.sectionOrderV2)
```

#### Local State (UI-only)
```typescript
const [reviewTypes, setReviewTypes] = useState<string[]>([])          // Filter selections
const [participantTypes, setParticipantTypes] = useState<string[]>([])
const [countries, setCountries] = useState<string[]>([])
const [draggedQuestion, setDraggedQuestion] = useState<...>          // Drag-drop state
const [dragOverQuestion, setDragOverQuestion] = useState<...>
const [submitting, setSubmitting] = useState(false)                   // Local submit flag
const [successDialogOpen, setSuccessDialogOpen] = useState(false)     // Dialog state
const [successMessage, setSuccessMessage] = useState('')
const [errorMessage, setErrorMessage] = useState('')
```

#### Key Functions

**fetchFilteredData()**
- Builds FilterRequest from selected filters
- Calls `dispatch(fetchSectionOrderData(filterRequest))`
- Updates Redux store with sections data
- Called on filter changes via useEffect

**submitSectionOrder()**
- Builds UpdateSectionOrderRequest from fullOrderSections
- Calls `dispatch(submitSectionOrderData(request))`
- Shows success dialog on success
- Shows error message on failure

**Drag-Drop Handlers**
- `handleQuestionDragStart()`
- `handleQuestionDragOver()`
- `handleQuestionDrop()` - Implements swap/shift logic, dispatches Redux actions

#### Data Flow
```
User selects filters
    ↓
handleXXXChange() updates local state
    ↓
useEffect triggers fetchFilteredData()
    ↓
dispatch(fetchSectionOrderData(filterRequest))
    ↓
Redux thunk calls buildApiResponse() (mock)
    ↓
Redux slice updates state.sectionOrderV2.sections & fullOrderSections
    ↓
Component re-renders with new data
```

## How to Replace Mock API with Real API

### Step 1: Update fetchSectionOrderData thunk
In `/src/store/sectionOrderV2Slice.ts`, lines 40-60:

**Before (mock):**
```typescript
// FOR NOW: Using mock API
const data = buildApiResponse(filters)
```

**After (real API):**
```typescript
const response = await fetch('/api/section-order/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(filters),
})

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`)
}

const data: ApiResponse = await response.json()
```

### Step 2: Update submitSectionOrderData thunk
In `/src/store/sectionOrderV2Slice.ts`, lines 63-85:

**Before (mock):**
```typescript
// FOR NOW: Using mock API
// Simulate 3 second API call
await new Promise((resolve) => setTimeout(resolve, 3000))
const data = updateSectionOrder(request)
```

**After (real API):**
```typescript
const response = await fetch('/api/section-order/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(request),
})

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`)
}

const data: UpdateSectionOrderResponse = await response.json()
```

### Step 3: Backend API Endpoints Required

**POST /api/section-order/search**
- **Request:**
```json
{
  "reviewTypes": ["Due Diligence"],
  "participantTypes": ["Issuer"],
  "countries": ["USA"]
}
```
- **Response:**
```json
{
  "filteredSections": [
    {
      "sectionId": 1,
      "sectionSeqNo": 1,
      "sectionName": "Entity Information",
      "questions": [...]
    }
  ],
  "sections": [...]  // All sections
}
```

**POST /api/section-order/update**
- **Request:**
```json
{
  "sections": [
    {
      "sectionId": 1,
      "sectionSeqNo": 1,
      "sectionName": "Entity Information",
      "questions": [...]
    }
  ]
}
```
- **Response:**
```json
{
  "status": "SUCCESS",
  "message": "Section order updated successfully"
}
```

## Store Configuration
The Redux store is configured in `/src/store/store.ts`:

```typescript
export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    auth: authReducer,
    questionOrder: questionOrderReducer,
    sectionOrderV2: sectionOrderV2Reducer,  // ← New slice
  }
})
```

## Benefits of Redux Integration

1. **Centralized State**: All section order data is in Redux store
2. **Easy API Replacement**: Just update thunk implementations, UI stays the same
3. **Async Operations**: Redux Toolkit handles loading & error states automatically
4. **Component Simplification**: Removed direct API calls from component
5. **Reusability**: Other components can use the same Redux selectors and thunks
6. **Time-Travel Debugging**: Redux DevTools can inspect all state changes
7. **Consistency**: Matches existing Redux pattern in the app (questionsSlice, questionOrderSlice, etc.)

## Debugging

### Redux DevTools
Install Redux DevTools browser extension to:
- Inspect state changes
- Time-travel through actions
- View dispatch history

### Console Logs
The thunks include console logs with emojis:
- 🔍 Fetching data
- 📡 API responses
- ✅ Success
- ❌ Errors
- 📤 Submitting
- 📊 Data counts

## Current Features Working

✅ Filter dropdowns with key-value pairs  
✅ Question card display  
✅ Drag-and-drop reordering (swap for filtered, shift for unfiltered)  
✅ Sequence number updates  
✅ Redux-based loading state  
✅ Success/error dialogs  
✅ 3-second loading overlay  
✅ Error handling  
✅ Filter clearing  

## File Changes Summary

1. **Created**: `/src/store/sectionOrderV2Slice.ts` - Redux slice with async thunks
2. **Modified**: `/src/store/store.ts` - Added sectionOrderV2 reducer
3. **Modified**: `/src/pages/SectionOrderV2.tsx` - Integrated Redux hooks and dispatches
4. **Unchanged**: `/src/services/mockSectionOrderData.ts` - Mock API still available for testing

## Next Steps

1. Replace mock API calls with real backend endpoints
2. Add authentication headers if required
3. Implement error retry logic
4. Add loading optimizations (debounce filters)
5. Add success toast notifications instead of dialogs
6. Monitor Redux state with DevTools during testing

---

## API Integration Guide

When you're ready to integrate with real APIs, you'll only need to modify **one file**: `/src/store/sectionOrderV2Slice.ts`

### Step 1: Remove Mock API Import

**File**: `src/store/sectionOrderV2Slice.ts` (line 7-8)

**Before:**
```typescript
import {
  buildApiResponse,
  updateSectionOrder,
} from '../services/mockSectionOrderData'
```

**Action:** Delete these imports completely since you won't need mock functions.

---

### Step 2: Update `fetchSectionOrderData` Thunk

**File**: `src/store/sectionOrderV2Slice.ts` (lines 81-112)

**Before (Mock):**
```typescript
export const fetchSectionOrderData = createAsyncThunk<ApiResponse, FilterRequest>(
  'sectionOrderV2/fetchData',
  async (filters: FilterRequest, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching section order with filters:', filters)

      // FOR NOW: Using mock API
      const data = buildApiResponse(filters)
      
      console.log('✅ Section order data received:', data)
      console.log('📊 Sections count:', data.sections?.length || 0)
      console.log('🔍 Filtered sections count:', data.filteredSections?.length || 0)

      return data
    } catch (error: any) {
      console.error('❌ Failed to fetch section order:', error)
      return rejectWithValue(error.message || 'Failed to fetch section order')
    }
  }
)
```

**After (Real API):**
```typescript
export const fetchSectionOrderData = createAsyncThunk<ApiResponse, FilterRequest>(
  'sectionOrderV2/fetchData',
  async (filters: FilterRequest, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching section order with filters:', filters)

      const response = await fetch('/api/section-order/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed:
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters),
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      
      console.log('✅ Section order data received:', data)
      console.log('📊 Sections count:', data.sections?.length || 0)
      console.log('🔍 Filtered sections count:', data.filteredSections?.length || 0)

      return data
    } catch (error: any) {
      console.error('❌ Failed to fetch section order:', error)
      return rejectWithValue(error.message || 'Failed to fetch section order')
    }
  }
)
```

---

### Step 3: Update `submitSectionOrderData` Thunk

**File**: `src/store/sectionOrderV2Slice.ts` (lines 113-137)

**Before (Mock):**
```typescript
export const submitSectionOrderData = createAsyncThunk<UpdateSectionOrderResponse, UpdateSectionOrderRequest>(
  'sectionOrderV2/submit',
  async (request: UpdateSectionOrderRequest, { rejectWithValue }) => {
    try {
      console.log('📤 Submitting section order:', request)

      // FOR NOW: Using mock API
      // Simulate 3 second API call
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const data = updateSectionOrder(request)

      console.log('✅ Section order submitted successfully:', data)

      return data
    } catch (error: any) {
      console.error('❌ Failed to submit section order:', error)
      return rejectWithValue(error.message || 'Failed to submit section order')
    }
  }
)
```

**After (Real API):**
```typescript
export const submitSectionOrderData = createAsyncThunk<UpdateSectionOrderResponse, UpdateSectionOrderRequest>(
  'sectionOrderV2/submit',
  async (request: UpdateSectionOrderRequest, { rejectWithValue }) => {
    try {
      console.log('📤 Submitting section order:', request)

      const response = await fetch('/api/section-order/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed:
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: UpdateSectionOrderResponse = await response.json()
      
      console.log('✅ Section order submitted successfully:', data)

      return data
    } catch (error: any) {
      console.error('❌ Failed to submit section order:', error)
      return rejectWithValue(error.message || 'Failed to submit section order')
    }
  }
)
```

---

## Required Backend API Endpoints

### Endpoint 1: POST /api/section-order/search
Fetches filtered section order data

**Request Body:**
```json
{
  "reviewTypes": ["Due Diligence"],
  "participantTypes": ["Issuer"],
  "countries": ["USA"]
}
```

**Response Body:**
```json
{
  "status": "SUCCESS",
  "statusCode": "200",
  "filteredSections": [
    {
      "sectionId": 1,
      "sectionSeqNo": 1,
      "sectionOrderId": "1",
      "sectionName": "Entity Information",
      "questions": [
        {
          "questionSeqNo": 1,
          "questionId": "QID0001",
          "questionOrderId": "1",
          "questionText": "What is the legal name of the entity?",
          "countries": ["USA"],
          "participantTypes": ["Issuer"],
          "reviewTypes": ["Due Diligence"]
        }
      ]
    }
  ],
  "sections": [...]  // All sections
}
```

### Endpoint 2: POST /api/section-order/update
Submits reordered section data

**Request Body:**
```json
{
  "sections": [
    {
      "sectionId": 1,
      "sectionSeqNo": 1,
      "sectionOrderId": "1",
      "sectionName": "Entity Information",
      "questions": [
        {
          "questionSeqNo": 1,
          "questionId": "QID0001",
          "questionOrderId": "1",
          "questionText": "What is the legal name of the entity?"
        }
      ]
    }
  ]
}
```

**Response Body:**
```json
{
  "status": "SUCCESS",
  "statusCode": "200",
  "message": "Section order updated successfully",
  "data": {
    "sectionsUpdated": 4,
    "questionsReordered": 40
  }
}
```

---

## Optional Enhancements

### Adding Authentication

If your API requires authentication:

```typescript
// Get token from localStorage or Redux store
const token = localStorage.getItem('authToken')

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}

const response = await fetch('/api/section-order/search', {
  method: 'POST',
  headers,
  body: JSON.stringify(filters),
})
```

### Using Environment Variables for API URLs

Create `.env` file in root:
```
VITE_API_BASE_URL=https://your-api.com
```

Update thunks:
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL
const response = await fetch(`${baseUrl}/api/section-order/search`, { ... })
```

---

## No Changes Needed In

✅ `SectionOrderV2.tsx` - component stays exactly the same  
✅ `store.ts` - Redux configuration stays the same  
✅ Drag-drop logic - reordering behavior unchanged  
✅ Redux actions and selectors - all work the same  

---

## After Integration: Clean Up

Once API integration is working and tested:

```bash
# Delete the mock API file
rm src/services/mockSectionOrderData.ts
```

That's it! The entire frontend will continue working without any other changes.
