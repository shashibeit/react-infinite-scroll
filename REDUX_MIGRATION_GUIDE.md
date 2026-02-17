# Migration Guide: Converting to Redux Question Order

## Quick Start

Replace your existing component code with this pattern:

### Before (Direct mockApi calls)

```typescript
import { mockApi } from '../services/mockApi'

function QuestionOrder() {
  const [sections, setSections] = useState([])
  const [filters, setFilters] = useState({})
  
  useEffect(() => {
    const load = async () => {
      const data = await mockApi.getSections()
      setSections(data)
    }
    load()
  }, [])
  
  // ... more state management
}
```

### After (Redux)

```typescript
import { useQuestionOrder } from '../store/questionOrderHooks'

function QuestionOrder() {
  const {
    sections,
    filters,
    loading,
    error,
    loadData,
    updateFilters
  } = useQuestionOrder()
  
  useEffect(() => {
    loadData()
  }, [loadData])
  
  // ... use sections directly
}
```

---

## Step-by-Step Migration

### 1. Remove Old State

❌ **Remove:**
```typescript
const [sections, setSections] = useState<Section[]>([])
const [filters, setFilters] = useState<QuestionFilters>({})
const [sectionData, setSectionData] = useState<any[]>([])
const [loading, setLoading] = useState(false)
```

✅ **Replace with:**
```typescript
const {
  sections,
  allSections,
  filters,
  loading,
  error,
  isFiltered,
  hasChanges
} = useQuestionOrder()
```

### 2. Replace Data Loading

❌ **Remove:**
```typescript
useEffect(() => {
  const initialize = async () => {
    const availableSections = await mockApi.getSections()
    setSections(availableSections)
  }
  initialize()
}, [])
```

✅ **Replace with:**
```typescript
useEffect(() => {
  loadData()
}, [loadData])
```

### 3. Update Filter Handling

❌ **Remove:**
```typescript
const handleFilterChange = async (event) => {
  const newFilters = {
    ...filters,
    reviewType: event.target.value
  }
  setFilters(newFilters)
  
  // Manual refetch
  const data = await mockApi.getFilteredQuestions(sectionId, newFilters)
  setSectionData(data)
}
```

✅ **Replace with:**
```typescript
const handleFilterChange = (event) => {
  updateFilters({
    ...filters,
    reviewType: event.target.value
  })
  // Automatically refetches!
}
```

### 4. Update Save Function

❌ **Remove:**
```typescript
const handleSave = async () => {
  try {
    setSaving(true)
    await mockApi.saveOrderToApi(formattedData)
    setSnackbar({ open: true, message: 'Success!' })
  } catch (error) {
    setSnackbar({ open: true, message: 'Failed!' })
  } finally {
    setSaving(false)
  }
}
```

✅ **Replace with:**
```typescript
const handleSave = () => {
  saveOrder()
  // Success/error handling is automatic via Redux
}

// Show snackbar based on error state
{error && (
  <Snackbar open onClose={dismissError}>
    <Alert severity="error">{error}</Alert>
  </Snackbar>
)}
```

### 5. Update Reset Function

❌ **Remove:**
```typescript
const handleReset = async () => {
  await mockApi.resetData()
  const availableSections = await mockApi.getSections()
  setSections(availableSections)
  setFilters({})
}
```

✅ **Replace with:**
```typescript
const handleReset = () => {
  resetData()
  // Automatically refetches all data and clears filters
}
```

### 6. Access the New Data Structure

The Redux slice provides data in the backend format:

```typescript
sections.map(section => (
  <div key={section.sectionID}>
    <h3>{section.sectionName}</h3>
    {section.questions.map(question => (
      <div key={question.questionID}>
        {question.questionSeqNo}. {question.questionText}
      </div>
    ))}
  </div>
))
```

### 7. Handle Filtered vs All Sections

```typescript
const {
  sections,        // Auto-switches between filtered and all
  allSections,     // Always all sections (for "Final Order" display)
  filteredSections, // Only filtered sections (if filters active)
  isFiltered       // Boolean: are filters active?
} = useQuestionOrder()

// Show filtered view
{sections.map(...)}

// Show all sections (grayed out non-matching questions)
{allSections.map(section => (
  <div>
    {section.questions.map(q => {
      const isHidden = isFiltered && !filteredSections
        .find(fs => fs.sectionID === section.sectionID)
        ?.questions.some(fq => fq.questionID === q.questionID)
      
      return (
        <div style={{ opacity: isHidden ? 0.5 : 1 }}>
          {q.questionText}
        </div>
      )
    })}
  </div>
))}
```

---

## Updated Component Example

Here's a complete migrated component:

```typescript
import { useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import { useQuestionOrder } from '../store/questionOrderHooks'

function QuestionOrderPage() {
  const {
    // State
    sections,
    allSections,
    filters,
    loading,
    error,
    hasChanges,
    isFiltered,
    
    // Actions
    loadData,
    updateFilters,
    resetFilters,
    saveOrder,
    resetData,
    updateQuestions,
    dismissError
  } = useQuestionOrder()
  
  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])
  
  // Handle filter changes
  const handleReviewTypeChange = (event: any) => {
    updateFilters({
      ...filters,
      reviewType: event.target.value || undefined
    })
  }
  
  const handleParticipantTypeChange = (event: any) => {
    updateFilters({
      ...filters,
      participantType: event.target.value || undefined
    })
  }
  
  const handleCountryChange = (event: any) => {
    updateFilters({
      ...filters,
      country: event.target.value || undefined
    })
  }
  
  // Handle drag and drop
  const handleDrop = (sectionID: number, sourceQuestionID: string, targetQuestionID: string) => {
    const section = sections.find(s => s.sectionID === sectionID)
    if (!section) return
    
    const questions = [...section.questions]
    const sourceIdx = questions.findIndex(q => q.questionID === sourceQuestionID)
    const targetIdx = questions.findIndex(q => q.questionID === targetQuestionID)
    
    // Swap
    const [removed] = questions.splice(sourceIdx, 1)
    questions.splice(targetIdx, 0, removed)
    
    // Update sequence numbers
    questions.forEach((q, idx) => {
      q.questionSeqNo = idx + 1
    })
    
    // Update Redux state
    updateQuestions(sectionID, questions)
  }
  
  if (loading && !sections.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <h1>Question Order Manager</h1>
      
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Review Type</InputLabel>
          <Select
            value={filters.reviewType || ''}
            onChange={handleReviewTypeChange}
            label="Review Type"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Due Diligence">Due Diligence</MenuItem>
            <MenuItem value="Periodic Review">Periodic Review</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Participant Type</InputLabel>
          <Select
            value={filters.participantType || ''}
            onChange={handleParticipantTypeChange}
            label="Participant Type"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="XY">XY</MenuItem>
            <MenuItem value="PQR">PQR</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={filters.country || ''}
            onChange={handleCountryChange}
            label="Country"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="USA">USA</MenuItem>
            <MenuItem value="UK">UK</MenuItem>
            <MenuItem value="India">India</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
          </Select>
        </FormControl>
        
        <Button onClick={resetFilters}>Clear Filters</Button>
      </Box>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={saveOrder}
          disabled={!hasChanges || loading}
        >
          Save {hasChanges && '(*)'}
        </Button>
        <Button variant="outlined" onClick={resetData}>
          Reset Data
        </Button>
      </Box>
      
      {/* Warning for filtered view */}
      {isFiltered && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are viewing filtered questions. Changes will affect the full order.
        </Alert>
      )}
      
      {/* Sections */}
      {sections.map(section => (
        <Box key={section.sectionID} sx={{ mb: 3, p: 2, border: '1px solid #ddd' }}>
          <h3>{section.sectionName}</h3>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {section.questions.map(question => (
              <Box
                key={question.questionID}
                sx={{ p: 1.5, bgcolor: '#f5f5f5', cursor: 'move' }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('questionID', question.questionID)
                  e.dataTransfer.setData('sectionID', String(section.sectionID))
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const sourceQuestionID = e.dataTransfer.getData('questionID')
                  const sourceSectionID = parseInt(e.dataTransfer.getData('sectionID'))
                  
                  if (sourceSectionID === section.sectionID) {
                    handleDrop(section.sectionID, sourceQuestionID, question.questionID)
                  }
                }}
              >
                {question.questionSeqNo}. {question.questionText}
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                  {question.reviewType} • {question.participantType} • {question.country}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
      
      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={dismissError}>
        <Alert severity="error" onClose={dismissError}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default QuestionOrderPage
```

---

## Key Benefits

✅ **Less boilerplate** - No manual state management  
✅ **Automatic refetch** - Filters automatically trigger data reload  
✅ **Centralized state** - Share data across components  
✅ **Error handling** - Built-in error state  
✅ **Loading states** - Automatic loading management  
✅ **Unsaved changes tracking** - Know when data is modified  
✅ **Type safety** - Full TypeScript support  
✅ **Backend-ready** - Data format matches API response  

---

## Testing the Migration

1. Load page → Should fetch data automatically
2. Apply filter → Should refetch with filtered data
3. Drag question → Should update local state, set hasChanges=true
4. Click Save → Should call API (check console logs)
5. Click Reset → Should regenerate data and clear filters
6. Check error handling → Try offline mode

---

## Checklist

- [ ] Import `useQuestionOrder` hook
- [ ] Remove all `useState` for sections/filters/loading
- [ ] Replace `mockApi` calls with hook actions
- [ ] Update filter handlers to use `updateFilters`
- [ ] Replace save logic with `saveOrder()`
- [ ] Update component to use `sections` from hook
- [ ] Add error display using `error` state
- [ ] Add loading indicator using `loading` state
- [ ] Test all functionality
- [ ] Remove unused imports

---

You're now using centralized Redux state management! 🎉
