# Redux Question Order Slice - Documentation

## Overview

The `questionOrderSlice` provides centralized state management for the Question Order and Section Order pages using Redux Toolkit. It connects to the Mock API and manages data fetching, filtering, and order updates.

---

## Architecture

### Files Created

1. **`/src/store/questionOrderSlice.ts`** - Redux slice with state and actions
2. **`/src/store/questionOrderHooks.ts`** - Custom React hook for easy component integration
3. **Updated `/src/store/store.ts`** - Added questionOrder reducer
4. **Updated `/src/services/mockApi.ts`** - Added `getQuestionOrderData()` endpoint

---

## API Response Format

### Without Filters

```json
{
  "status": "SUCCESS",
  "filteredSections": [],
  "sections": [
    {
      "sectionSeqNo": 1,
      "sectionID": 1,
      "sectionName": "Customer Onboarding",
      "questions": [
        {
          "questionSeqNo": 1,
          "questionID": "QID0001",
          "questionText": "What is the current status of Customer Onboarding?",
          "reviewType": "Due Diligence",
          "participantType": "XY",
          "country": "USA",
          "status": "APPROVED"
        }
      ]
    }
  ]
}
```

### With Filters

```json
{
  "status": "SUCCESS",
  "filteredSections": [
    {
      "sectionSeqNo": 1,
      "sectionID": 1,
      "sectionName": "Customer Onboarding",
      "questions": [
        {
          "questionSeqNo": 1,
          "questionID": "QID0001",
          "questionText": "What is the current status of Customer Onboarding?",
          "reviewType": "Due Diligence",
          "participantType": "XY",
          "country": "USA",
          "status": "APPROVED"
        }
      ]
    }
  ],
  "sections": [
    {
      "sectionSeqNo": 1,
      "sectionID": 1,
      "sectionName": "Customer Onboarding",
      "questions": [
        {
          "questionSeqNo": 1,
          "questionID": "QID0001",
          "questionText": "What is the current status of Customer Onboarding?"
        },
        {
          "questionSeqNo": 2,
          "questionID": "QID0005",
          "questionText": "How often is Customer Onboarding monitored?"
        }
      ]
    }
  ]
}
```

**Key Points:**
- `filteredSections` is only populated when filters are applied
- `sections` always contains ALL sections with ALL questions
- When user reorders in filtered view, update `filteredSections`
- Backend uses `sections` to see the final order after applying filtered changes

---

## Using in Components

### Basic Setup

```typescript
import { useQuestionOrder } from '../store/questionOrderHooks'

function QuestionOrderPage() {
  const {
    // State
    sections,           // Filtered sections if filters active, else all sections
    allSections,        // Always all sections
    filteredSections,   // Only filtered sections
    filters,            // Current filters
    loading,            // Loading state
    error,              // Error message
    hasChanges,         // True if order has been modified
    isFiltered,         // True if filters are active
    
    // Actions
    loadData,           // Load data with optional filters
    updateFilters,      // Update filters and refetch
    resetFilters,       // Clear filters
    saveOrder,          // Save to backend
    resetData,          // Reset mock data
    updateQuestions,    // Update questions in a section
    reorderQuestions,   // Reorder in filtered view
    dismissError        // Clear error
  } = useQuestionOrder()
  
  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      {sections.map(section => (
        <div key={section.sectionID}>
          <h3>{section.sectionName}</h3>
          {section.questions.map(q => (
            <div key={q.questionID}>{q.questionText}</div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

## Common Use Cases

### 1. Load Data on Component Mount

```typescript
useEffect(() => {
  loadData()
}, [loadData])
```

### 2. Apply Filters

```typescript
const handleFilterChange = (reviewType: string) => {
  updateFilters({
    ...filters,
    reviewType: reviewType as ReviewType
  })
}
```

### 3. Clear Filters

```typescript
const handleClearFilters = () => {
  resetFilters()
}
```

### 4. Drag and Drop Reordering

```typescript
const handleDrop = (sectionID: number, sourceQuestionID: string, targetQuestionID: string) => {
  if (isFiltered) {
    // User is reordering in filtered view
    reorderQuestions(sectionID, sourceQuestionID, targetQuestionID)
  } else {
    // Get current questions for the section
    const section = sections.find(s => s.sectionID === sectionID)
    if (section) {
      // Perform reorder logic
      const questions = [...section.questions]
      const sourceIdx = questions.findIndex(q => q.questionID === sourceQuestionID)
      const targetIdx = questions.findIndex(q => q.questionID === targetQuestionID)
      
      // Swap (or use your reorder algorithm)
      const [removed] = questions.splice(sourceIdx, 1)
      questions.splice(targetIdx, 0, removed)
      
      // Update sequence numbers
      questions.forEach((q, idx) => {
        q.questionSeqNo = idx + 1
      })
      
      // Update Redux state
      updateQuestions(sectionID, questions)
    }
  }
}
```

### 5. Save to Backend

```typescript
const handleSave = async () => {
  if (hasChanges) {
    await saveOrder()
    // Show success message
  }
}
```

### 6. Reset Data

```typescript
const handleReset = () => {
  resetData()
}
```

### 7. Show Warning When Filtering

```typescript
{isFiltered && (
  <Alert severity="warning">
    You are viewing filtered questions. Changes will affect the full order.
  </Alert>
)}
```

---

## Redux State Structure

```typescript
{
  questionOrder: {
    data: {
      status: "SUCCESS",
      filteredSections: [...],
      sections: [...]
    },
    filters: {
      reviewType?: "Due Diligence" | "Periodic Review",
      participantType?: "XY" | "PQR",
      country?: "USA" | "UK" | "India" | "Canada"
    },
    loading: false,
    error: null,
    hasChanges: false
  }
}
```

---

## Actions Available

### Async Thunks

```typescript
// Fetch data from API
dispatch(fetchQuestionOrder(filters))

// Save order to API
dispatch(saveQuestionOrder({ sections: [...] }))

// Reset and reload data
dispatch(resetQuestionOrderData())
```

### Synchronous Actions

```typescript
// Set filters (doesn't refetch - use updateFilters hook instead)
dispatch(setFilters({ reviewType: 'Due Diligence' }))

// Clear all filters
dispatch(clearFilters())

// Update questions in a section
dispatch(updateSectionQuestions({
  sectionID: 1,
  questions: [...]
}))

// Reorder questions in filtered view
dispatch(reorderFilteredQuestions({
  sectionID: 1,
  sourceQuestionID: 'QID0001',
  targetQuestionID: 'QID0005'
}))

// Mark as saved
dispatch(markAsSaved())

// Clear error
dispatch(clearError())
```

---

## Data Flow

### Initial Load
```
Component Mount
  → loadData()
  → dispatch(fetchQuestionOrder({}))
  → mockApi.getQuestionOrderData({})
  → State updated with all sections
```

### With Filters
```
User selects filter
  → updateFilters({ reviewType: 'Due Diligence' })
  → dispatch(setFilters(...))
  → dispatch(fetchQuestionOrder(filters))
  → mockApi.getQuestionOrderData(filters)
  → State updated with filteredSections populated
```

### Reordering
```
User drags question
  → handleDrop(...)
  → updateQuestions(sectionID, newQuestions)
  → dispatch(updateSectionQuestions(...))
  → State updated, hasChanges = true
```

### Saving
```
User clicks Save
  → saveOrder()
  → dispatch(saveQuestionOrder({ sections }))
  → mockApi.saveOrderToApi(data)
  → State hasChanges = false
```

---

## TypeScript Types

### QuestionOrderItem
```typescript
interface QuestionOrderItem {
  questionSeqNo: number
  questionID: string
  questionText: string
  reviewType?: string
  participantType?: string
  country?: string
  status?: string
}
```

### SectionOrderItem
```typescript
interface SectionOrderItem {
  sectionSeqNo: number
  sectionID: number
  sectionName: string
  questions: QuestionOrderItem[]
}
```

### QuestionOrderResponse
```typescript
interface QuestionOrderResponse {
  status: 'SUCCESS' | 'ERROR'
  filteredSections: SectionOrderItem[]
  sections: SectionOrderItem[]
  message?: string
}
```

---

## Connecting to Real Backend

### Option 1: Update mockApi.ts

Replace the `getQuestionOrderData` function:

```typescript
async getQuestionOrderData(filters: QuestionFilters) {
  const params = new URLSearchParams()
  if (filters.reviewType) params.append('reviewType', filters.reviewType)
  if (filters.participantType) params.append('participantType', filters.participantType)
  if (filters.country) params.append('country', filters.country)
  
  const response = await fetch(`/api/question-order?${params}`)
  if (!response.ok) throw new Error('Failed to fetch')
  
  return response.json()
}
```

Update `saveOrderToApi`:

```typescript
async saveOrderToApi(data: any) {
  const response = await fetch('/api/question-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) throw new Error('Failed to save')
  
  return response.json()
}
```

### Option 2: Environment-based API

```typescript
const API_BASE = process.env.REACT_APP_API_URL || '/api'

async getQuestionOrderData(filters: QuestionFilters) {
  const response = await fetch(`${API_BASE}/question-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters })
  })
  return response.json()
}
```

---

## Error Handling

```typescript
const { error, dismissError } = useQuestionOrder()

{error && (
  <Snackbar open onClose={dismissError}>
    <Alert severity="error" onClose={dismissError}>
      {error}
    </Alert>
  </Snackbar>
)}
```

---

## Loading States

```typescript
const { loading } = useQuestionOrder()

{loading && (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
    <CircularProgress />
  </Box>
)}
```

---

## Unsaved Changes Warning

```typescript
const { hasChanges } = useQuestionOrder()

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanges) {
      e.preventDefault()
      e.returnValue = ''
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasChanges])
```

---

## Complete Example Component

```typescript
import { useEffect } from 'react'
import { useQuestionOrder } from '../store/questionOrderHooks'
import { Box, Button, CircularProgress, Alert } from '@mui/material'

function QuestionOrderExample() {
  const {
    sections,
    loading,
    error,
    hasChanges,
    isFiltered,
    loadData,
    updateFilters,
    resetFilters,
    saveOrder,
    dismissError
  } = useQuestionOrder()
  
  useEffect(() => {
    loadData()
  }, [loadData])
  
  const handleFilterChange = (reviewType: string) => {
    updateFilters({ reviewType: reviewType as any })
  }
  
  const handleSave = () => {
    saveOrder()
  }
  
  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error" onClose={dismissError}>{error}</Alert>
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button onClick={() => handleFilterChange('Due Diligence')}>
          Filter Due Diligence
        </Button>
        <Button onClick={resetFilters}>Clear Filters</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!hasChanges}
        >
          Save {hasChanges && '(*)'}
        </Button>
      </Box>
      
      {isFiltered && (
        <Alert severity="info">
          Viewing filtered questions. Changes affect full order.
        </Alert>
      )}
      
      {sections.map(section => (
        <Box key={section.sectionID} sx={{ mb: 2 }}>
          <h3>{section.sectionName}</h3>
          {section.questions.map(q => (
            <Box key={q.questionID} sx={{ p: 1, border: '1px solid #ddd' }}>
              {q.questionSeqNo}. {q.questionText}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default QuestionOrderExample
```

---

## Summary

✅ Redux slice created with full state management  
✅ Mock API updated to return backend-compatible format  
✅ Custom hook for easy component integration  
✅ Support for filtered and unfiltered views  
✅ Automatic refetch when filters change  
✅ Track unsaved changes  
✅ Error handling built-in  
✅ Loading states managed  
✅ Ready to connect to real API  

The Redux setup is production-ready and follows best practices for Redux Toolkit with TypeScript!
