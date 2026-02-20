# Question Ordering System - Technical Design Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Design Patterns & Principles](#design-patterns--principles)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Algorithm Design](#algorithm-design)
8. [Repository Pattern](#repository-pattern)
9. [API Contracts](#api-contracts)
10. [Database Schema](#database-schema)
11. [UI/UX Design](#uiux-design)
12. [Security Considerations](#security-considerations)
13. [Performance Optimization](#performance-optimization)
14. [Error Handling & Recovery](#error-handling--recovery)
15. [Testing Strategy](#testing-strategy)
16. [Deployment Architecture](#deployment-architecture)
17. [Monitoring & Observability](#monitoring--observability)
18. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Purpose
The Question Ordering System provides a robust, user-friendly interface for managing the order of questions within sections across different review types, participant types, and countries. It supports two distinct reordering paradigms: **Swap** and **Shift/Insert**.

### Key Features
- Dual ordering algorithms (Swap vs. Shift)
- Advanced filtering with dynamic filter preservation
- Real-time visual feedback during drag-and-drop
- Optimistic UI updates with rollback capability
- Repository pattern for data abstraction
- Redux-based state management
- Mock API and IndexedDB support

### Technology Stack
- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit
- **Database**: IndexedDB (via Dexie.js)
- **API Mocking**: MirageJS
- **Build Tool**: Vite
- **Drag & Drop**: Native HTML5 Drag and Drop API

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  QuestionOrder   │         │  SectionOrder    │          │
│  │  (Swap UI)       │         │  (Shift UI)      │          │
│  └─────────┬────────┘         └─────────┬────────┘          │
└────────────┼──────────────────────────────┼──────────────────┘
             │                              │
┌────────────┼──────────────────────────────┼──────────────────┐
│            │     State Management Layer   │                  │
│  ┌─────────▼──────────────────────────────▼───────┐          │
│  │       Redux Store (questionOrderSlice)         │          │
│  │  - Sections Data                               │          │
│  │  - Filters State                               │          │
│  │  - Loading/Error States                        │          │
│  └────────────────────┬───────────────────────────┘          │
└─────────────────────────┼───────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────────┐
│                       │    Business Logic Layer               │
│  ┌────────────────────▼──────────────────────────┐            │
│  │         Custom Hooks Layer                    │            │
│  │  - useQuestionOrder()                         │            │
│  └────────┬──────────────────────────────────────┘            │
│           │                                                   │
│  ┌────────▼──────────────┐   ┌──────────────────────────┐    │
│  │ applyFilteredReorder  │   │ applyFilteredShift       │    │
│  │ (Swap Algorithm)      │   │ (Insert Algorithm)       │    │
│  └───────────────────────┘   └──────────────────────────┘    │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────────┐
│                        │     Data Access Layer                │
│  ┌─────────────────────▼──────────────────────┐               │
│  │   QuestionOrderRepository (Interface)      │               │
│  └────┬────────────────────────────────┬──────┘               │
│       │                                │                      │
│  ┌────▼────────────────┐    ┌──────────▼────────────┐         │
│  │ DexieRepository     │    │ ApiRepository         │         │
│  │ (IndexedDB)         │    │ (REST API)            │         │
│  └─────────────────────┘    └───────────────────────┘         │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                    Persistence Layer                          │
│  ┌──────────────────┐          ┌────────────────────┐         │
│  │   IndexedDB      │          │   Backend API      │         │
│  │   (Dexie.js)     │          │   (MirageJS Mock)  │         │
│  └──────────────────┘          └────────────────────┘         │
└───────────────────────────────────────────────────────────────┘
```

### Architectural Layers

#### 1. Presentation Layer
- **Responsibility**: UI rendering, user interaction, visual feedback
- **Components**: QuestionOrder.tsx, SectionOrder.tsx
- **Dependencies**: Material-UI components, Redux hooks

#### 2. State Management Layer
- **Responsibility**: Centralized application state
- **Implementation**: Redux Toolkit
- **Key Slices**: questionOrderSlice
- **State Synchronization**: Automatic via Redux subscriptions

#### 3. Business Logic Layer
- **Responsibility**: Core ordering algorithms, filter logic
- **Components**:
  - `applyFilteredReorder`: Swap algorithm
  - `applyFilteredShift`: Insert/shift algorithm
  - Custom hooks for component integration

#### 4. Data Access Layer
- **Responsibility**: Abstract data source differences
- **Pattern**: Repository Pattern
- **Implementations**:
  - DexieQuestionOrderRepository (IndexedDB)
  - ApiQuestionOrderRepository (REST API)

#### 5. Persistence Layer
- **Responsibility**: Data storage and retrieval
- **Technologies**:
  - IndexedDB for local development
  - REST API for production

---

## Design Patterns & Principles

### 1. Repository Pattern

**Purpose**: Decouple data access logic from business logic

```typescript
export interface QuestionOrderRepository {
  getFullOrder(sectionId: string): Promise<string[]>
  getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]>
  saveOrder(sectionId: string, orderedIds: string[]): Promise<void>
}
```

**Benefits**:
- ✅ Easy to switch between data sources (IndexedDB ↔ API)
- ✅ Testable business logic (mock repositories)
- ✅ Single source of truth for data operations
- ✅ Type-safe contracts

**Implementations**:

```typescript
// IndexedDB Implementation
class DexieQuestionOrderRepository implements QuestionOrderRepository {
  constructor(private db: AppDb) {}
  // Implementation using Dexie.js
}

// REST API Implementation
class ApiQuestionOrderRepository implements QuestionOrderRepository {
  constructor(private baseUrl: string) {}
  // Implementation using fetch API
}
```

### 2. Flux Architecture (Redux)

**Purpose**: Unidirectional data flow for predictable state management

```
Action → Reducer → Store → View → Action
   ↑                              ↓
   └──────────────────────────────┘
```

**Benefits**:
- ✅ Predictable state updates
- ✅ Time-travel debugging
- ✅ Easy state persistence
- ✅ Centralized business logic

### 3. Custom Hooks Pattern

**Purpose**: Encapsulate complex logic for reusability

```typescript
export function useQuestionOrder() {
  const dispatch = useAppDispatch()
  const state = useAppSelector(state => state.questionOrder)
  
  return {
    sections: state.data?.filteredSections || state.data?.sections || [],
    allSections: state.data?.sections || [],
    filters: state.filters,
    isFiltered: hasActiveFilters(state.filters),
    loadData: () => dispatch(fetchQuestionOrder(state.filters)),
    updateFilters: (filters) => dispatch(setFilters(filters)),
    updateQuestions: (sectionID, questions) => 
      dispatch(updateSectionQuestions({ sectionID, questions })),
    resetData: () => dispatch(resetQuestionOrderData()),
  }
}
```

**Benefits**:
- ✅ Simplify component logic
- ✅ Reusable across multiple components
- ✅ Testable in isolation
- ✅ Separation of concerns

### 4. Factory Pattern

**Purpose**: Create repository instances based on environment

```typescript
function createQuestionOrderRepository(): QuestionOrderRepository {
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    return new DexieQuestionOrderRepository(appDb)
  }
  return new ApiQuestionOrderRepository('/api')
}
```

### 5. Strategy Pattern

**Purpose**: Encapsulate different ordering algorithms

```typescript
type OrderingStrategy = (
  fullOrder: string[],
  filteredIds: string[],
  newFilteredOrder: string[]
) => string[]

// Strategy 1: Swap
const swapStrategy: OrderingStrategy = applyFilteredReorder

// Strategy 2: Shift/Insert
const shiftStrategy: OrderingStrategy = applyFilteredShift
```

### 6. SOLID Principles Applied

#### Single Responsibility Principle (SRP)
- Each repository handles only data access
- Each algorithm function handles only one reordering strategy
- Each slice manages only one domain

#### Open/Closed Principle (OCP)
- Repository interface allows new implementations without changing consumers
- Algorithm strategy pattern allows new ordering algorithms

#### Liskov Substitution Principle (LSP)
- Any repository implementation can replace another
- Components work with any repository that implements the interface

#### Interface Segregation Principle (ISP)
- QuestionOrderRepository interface is minimal and focused
- Filters interface only includes necessary fields

#### Dependency Inversion Principle (DIP)
- Components depend on repository interface, not concrete implementations
- High-level business logic doesn't depend on low-level data access

---

## Component Architecture

### QuestionOrder Component (Swap Behavior)

**File**: `src/pages/QuestionOrder.tsx`

**Responsibility**: Provides UI for swapping question positions

#### Component Structure

```tsx
QuestionOrder
├── Filter Controls (Review Type, Participant Type, Country)
├── Action Buttons (Reset Data, Save to API)
├── Sections List
│   └── Section Card
│       └── Questions List
│           └── Question Card (Draggable)
│               ├── Question Text
│               ├── Position Badge (Current)
│               ├── Position Badge (Original)
│               └── Metadata (Review Type, Participant, Country)
├── Filtered Order Preview
├── Final Order Preview
└── Confirmation Dialog (when filtering active)
```

#### State Management

```typescript
// Global Redux State
const { sections, allSections, filters, isFiltered } = useQuestionOrder()

// Local Component State
const [draggedQuestion, setDraggedQuestion] = useState(...)
const [dragOverQuestion, setDragOverQuestion] = useState(...)
const [reorderedQuestions, setReorderedQuestions] = useState(...)
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
const [originalOrderMap, setOriginalOrderMap] = useState(...)
```

#### Key Methods

```typescript
// Drag and Drop Handlers
handleQuestionDragStart(e, sectionId, questionId)
handleQuestionDragOver(e, sectionId, questionId)
handleQuestionDragLeave(e)
handleQuestionDrop(e, targetSectionId, targetQuestionId)

// Reordering Logic
executeReorder(sourceSectionId, sourceQuestionId, targetQuestionId)

// API Integration
handleSaveToAPI()
handleReset()
```

#### Algorithm Integration

```typescript
const executeReorder = async (sourceSectionId, sourceQuestionId, targetQuestionId) => {
  const section = allSections.find(s => s.sectionID === sourceSectionId)
  const fullOrder = section.questions.map(q => q.questionID)
  const filteredOrder = sections.find(s => s.sectionID === sourceSectionId)
    ?.questions.map(q => q.questionID) || []

  // Apply swap algorithm
  const newFullOrder = applyFilteredReorder(fullOrder, filteredOrder, nextFilteredOrder)
  
  // Update Redux state
  updateQuestions(sourceSectionId, reorderedQuestions)
}
```

### SectionOrder Component (Shift Behavior)

**File**: `src/pages/SectionOrder.tsx`

**Responsibility**: Provides UI for shifting/inserting question positions

**Structure**: Similar to QuestionOrder but uses `applyFilteredShift` algorithm

**Key Difference**: 
```typescript
// Uses shift algorithm instead of swap
const newFullOrder = applyFilteredShift(fullOrder, filteredOrder, nextFilteredOrder)
```

---

## State Management

### Redux Store Structure

```typescript
interface RootState {
  questionOrder: QuestionOrderState
  auth: AuthState
  // ... other slices
}

interface QuestionOrderState {
  data: QuestionOrderResponse | null
  filters: QuestionFilters
  loading: boolean
  error: string | null
  hasChanges: boolean
}

interface QuestionOrderResponse {
  status: 'SUCCESS' | 'ERROR'
  filteredSections: SectionOrderItem[]  // Populated when filters active
  sections: SectionOrderItem[]          // Always contains all data
  message?: string
}

interface SectionOrderItem {
  sectionOrderId: number
  sectionID: number
  sectionName: string
  questions: QuestionOrderItem[]
}

interface QuestionOrderItem {
  questionOrderId: number
  questionID: string
  questionText: string
  reviewType?: string
  participantType?: string
  country?: string
  status?: string
}

interface QuestionFilters {
  reviewType?: string
  participantType?: string
  country?: string
}
```

### Redux Slice Actions

#### Synchronous Actions

```typescript
// Set active filters
setFilters(state, action: PayloadAction<QuestionFilters>)

// Clear all filters
clearFilters(state)

// Update questions in a section (local state before save)
updateSectionQuestions(state, action: PayloadAction<{
  sectionID: number
  questions: QuestionOrderItem[]
}>)

// Mark state as having unsaved changes
markAsChanged(state)
```

#### Asynchronous Thunks

```typescript
// Fetch question order data from API
fetchQuestionOrder(filters: QuestionFilters): AsyncThunk

// Save reordered questions to API
saveQuestionOrder(data: SaveQuestionOrderRequest): AsyncThunk

// Reset data to original state
resetQuestionOrderData(): AsyncThunk
```

### State Flow Diagram

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │ dispatch(fetchQuestionOrder(filters))
       ▼
┌─────────────────┐
│  Redux Thunk    │
│  (Async Action) │
└──────┬──────────┘
       │ HTTP Request
       ▼
┌─────────────┐
│  Mock API   │
└──────┬──────┘
       │ Response
       ▼
┌─────────────────┐
│  Redux Reducer  │
│  (Update State) │
└──────┬──────────┘
       │ State Changed
       ▼
┌─────────────┐
│  Component  │
│  Re-renders │
└─────────────┘
```

### Optimistic Updates Pattern

```typescript
// 1. Save current state
const previousState = current(state.data)

// 2. Update UI optimistically
state.data.sections[sectionIndex].questions = newQuestions
state.hasChanges = true

// 3. Make API call
try {
  await api.saveOrder(...)
  // Success - keep optimistic update
} catch (error) {
  // Rollback on failure
  state.data = previousState
  state.error = error.message
}
```

---

## Data Flow

### Complete Data Flow Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
└──────────────────────┬─────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   Drag & Drop                   Filter Change
        │                             │
        ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ handleQuestionDrop│         │ handleFilterChange│
└──────┬───────────┘         └──────┬───────────┘
       │                             │
       ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ executeReorder   │         │ dispatch(        │
│ (Local Logic)    │         │  setFilters()    │
└──────┬───────────┘         │ )                │
       │                     └──────┬───────────┘
       │                            │
       ▼                            ▼
┌──────────────────────────────────────────────┐
│         Apply Algorithm                       │
│  - applyFilteredReorder (Swap)               │
│  - applyFilteredShift (Insert)               │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│      dispatch(updateSectionQuestions())      │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Redux Reducer Updates State          │
│  state.data.sections[idx].questions = new    │
│  state.hasChanges = true                     │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Component Re-renders                 │
│  - Updated positions                         │
│  - Visual indicators                         │
│  - Enable save button                        │
└──────────────────────────────────────────────┘
       │
       │ User clicks "Save to API"
       ▼
┌──────────────────────────────────────────────┐
│      dispatch(saveQuestionOrder())           │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         HTTP POST /api/question-order        │
│         Send SaveQuestionOrderRequest        │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Backend Processing                   │
│  - Validate data                             │
│  - Update database                           │
│  - Return response                           │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Success/Error Handling               │
│  - Show toast notification                   │
│  - Reset hasChanges flag                     │
│  - Refresh data (optional)                   │
└──────────────────────────────────────────────┘
```

### Filter Flow

```
User selects filter → updateFilters(newFilters)
                            ↓
                   dispatch(setFilters(newFilters))
                            ↓
                   Redux state updated
                            ↓
                   useEffect triggered
                            ↓
                   dispatch(fetchQuestionOrder(newFilters))
                            ↓
                   API call with filters
                            ↓
         Response: { filteredSections, sections }
                            ↓
                   Redux state updated
                            ↓
                   Component shows filtered view
```

### Save Flow with Validation

```
User clicks Save → Validate changes exist
                         ↓
                   hasChanges === true?
                         ↓ Yes
                   Build SaveQuestionOrderRequest
                         ↓
                   Show loading indicator
                         ↓
                   dispatch(saveQuestionOrder(data))
                         ↓
                   POST /api/question-order
                         ↓
              ┌──────────┴──────────┐
              │                     │
           Success               Failure
              │                     │
              ▼                     ▼
      hasChanges = false     Show error toast
      Show success toast     Optionally rollback
      Optional refresh       Keep hasChanges=true
```

---

## Algorithm Design

### 1. Swap Algorithm (`applyFilteredReorder`)

**Purpose**: Exchange positions of two questions

**Location**: `src/utils/applyFilteredReorder.ts`

#### Algorithm Pseudocode

```
INPUT:
  - fullOrder: Complete list of all question IDs [Q1, Q2, Q3, Q4, Q5]
  - filteredIds: Visible question IDs after filters [Q1, Q3, Q5]
  - newFilteredOrder: User's new arrangement [Q5, Q1, Q3]

PROCESS:
  1. Find draggedItem by comparing filteredIds vs newFilteredOrder
  2. Identify which item moved the most (maximum position change)
  3. Calculate oldIndex and newIndex in filtered view
  4. Determine targetItem (what was at newIndex before drag)
  5. Find positions of draggedItem and targetItem in fullOrder
  6. Swap them in fullOrder
  
OUTPUT:
  - New fullOrder with only those two items swapped
```

#### Implementation

```typescript
export const applyFilteredReorder = (
  fullOrder: string[],
  filteredIds: string[],
  newFilteredOrder: string[]
): string[] => {
  // Validation
  if (filteredIds.length !== newFilteredOrder.length || filteredIds.length === 0) {
    return fullOrder
  }

  // Step 1: Find the dragged item (item with maximum movement)
  let draggedItem: string | null = null
  let oldIndex = -1
  let newIndex = -1
  let maxMovement = 0

  for (let i = 0; i < newFilteredOrder.length; i++) {
    const item = newFilteredOrder[i]
    const oldPos = filteredIds.indexOf(item)
    const movement = Math.abs(i - oldPos)
    
    if (movement > maxMovement) {
      maxMovement = movement
      draggedItem = item
      oldIndex = oldPos
      newIndex = i
    }
  }

  // Step 2: Early exit if no movement
  if (!draggedItem || oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return fullOrder
  }

  // Step 3: Find target item (at new position in original filtered list)
  const targetItem = filteredIds[newIndex]

  // Step 4: Perform swap in full order
  const result = [...fullOrder]
  const draggedPosInFull = fullOrder.indexOf(draggedItem)
  const targetPosInFull = fullOrder.indexOf(targetItem)

  if (draggedPosInFull !== -1 && targetPosInFull !== -1) {
    result[draggedPosInFull] = targetItem
    result[targetPosInFull] = draggedItem
  }

  return result
}
```

#### Example Walkthrough

**Scenario**: Swap questions with filters active

```
Initial State:
  fullOrder     = [Q1, Q2, Q3, Q4, Q5, Q6]
  filteredIds   = [Q1, Q3, Q5]  (filter: reviewType = "Due Diligence")
  
User Action:
  Drags Q5 onto Q1
  
  newFilteredOrder = [Q5, Q1, Q3]
  
Algorithm Execution:
  1. Detect movement:
     - Q1: oldPos=0, newPos=1, movement=1
     - Q3: oldPos=2, newPos=2, movement=0
     - Q5: oldPos=2, newPos=0, movement=2 ✓ (maximum)
     
  2. draggedItem = Q5, oldIndex=2, newIndex=0
  
  3. targetItem = filteredIds[0] = Q1
  
  4. Find positions in fullOrder:
     - draggedPosInFull = 4 (Q5's position)
     - targetPosInFull = 0 (Q1's position)
     
  5. Swap in fullOrder:
     result[4] = Q1
     result[0] = Q5
     
Result:
  fullOrder = [Q5, Q2, Q3, Q4, Q1, Q6]
  
  Only Q1 and Q5 swapped.
  Q2, Q3, Q4, Q6 (including filtered-out items) stay in place.
```

### 2. Shift/Insert Algorithm (`applyFilteredShift`)

**Purpose**: Move a question to a new position, shifting others

**Location**: `src/utils/applyFilteredShift.ts`

#### Algorithm Pseudocode

```
INPUT:
  - fullOrder: Complete list [Q1, Q2, Q3, Q4, Q5, Q6]
  - filteredIds: Visible IDs [Q2, Q4, Q6]
  - newFilteredOrder: New arrangement [Q6, Q2, Q4]

PROCESS:
  1. Find draggedItem (item that moved)
  2. Find targetItem (item at new position in original filtered list)
  3. Remove draggedItem from fullOrder
  4. Find targetItem's new position (after removal)
  5. Insert draggedItem before targetItem
  
OUTPUT:
  - New fullOrder with dragged item moved and others shifted
```

#### Implementation

```typescript
export const applyFilteredShift = (
  fullOrder: string[],
  filteredIds: string[],
  newFilteredOrder: string[]
): string[] => {
  // Validation
  if (filteredIds.length !== newFilteredOrder.length || filteredIds.length === 0) {
    return fullOrder
  }

  // Step 1: Find the dragged item
  let draggedItem: string | null = null
  let oldFilteredIndex = -1
  let newFilteredIndex = -1
  let maxMovement = 0

  for (let i = 0; i < newFilteredOrder.length; i++) {
    const item = newFilteredOrder[i]
    const oldPos = filteredIds.indexOf(item)
    const movement = Math.abs(i - oldPos)
    
    if (oldPos !== i && movement > maxMovement) {
      maxMovement = movement
      draggedItem = item
      oldFilteredIndex = oldPos
      newFilteredIndex = i
    }
  }

  // Step 2: Early exit if no movement
  if (!draggedItem || oldFilteredIndex === newFilteredIndex) {
    return fullOrder
  }

  // Step 3: Get target item
  const targetItem = filteredIds[newFilteredIndex]

  // Step 4: Find positions in full order
  const draggedPosInFull = fullOrder.indexOf(draggedItem)
  const targetPosInFull = fullOrder.indexOf(targetItem)

  if (draggedPosInFull === -1 || targetPosInFull === -1) {
    return fullOrder
  }

  // Step 5: Remove dragged item
  const result = [...fullOrder]
  result.splice(draggedPosInFull, 1)
  
  // Step 6: Find new target position (after removal)
  const newTargetPos = result.indexOf(targetItem)
  
  if (newTargetPos === -1) {
    return fullOrder // Safety check
  }
  
  // Step 7: Insert draggedItem before target
  result.splice(newTargetPos, 0, draggedItem)

  return result
}
```

#### Example Walkthrough

```
Initial State:
  fullOrder     = [Q1, Q2, Q3, Q4, Q5, Q6, Q7]
  filteredIds   = [Q2, Q4, Q6]
  
User Action:
  Drags Q6 to position of Q2
  
  newFilteredOrder = [Q6, Q2, Q4]
  
Algorithm Execution:
  1. Detect movement:
     - Q2: oldPos=0, newPos=1, movement=1
     - Q4: oldPos=1, newPos=2, movement=1
     - Q6: oldPos=2, newPos=0, movement=2 ✓ (maximum)
     
  2. draggedItem = Q6, newFilteredIndex=0
  
  3. targetItem = filteredIds[0] = Q2
  
  4. Positions in fullOrder:
     - draggedPosInFull = 5 (Q6)
     - targetPosInFull = 1 (Q2)
     
  5. Remove Q6:
     result = [Q1, Q2, Q3, Q4, Q5, Q7]
     
  6. Find Q2's position after removal:
     newTargetPos = 1
     
  7. Insert Q6 before Q2:
     result.splice(1, 0, Q6)
     result = [Q1, Q6, Q2, Q3, Q4, Q5, Q7]
     
Result:
  fullOrder = [Q1, Q6, Q2, Q3, Q4, Q5, Q7]
  
  Q6 moved to before Q2.
  Q1 stayed in place.
  Q2, Q3, Q4, Q5, Q7 shifted right to accommodate Q6.
```

### Algorithm Comparison

| Aspect | Swap (applyFilteredReorder) | Shift (applyFilteredShift) |
|--------|----------------------------|----------------------------|
| **Operation** | Exchange positions of two items | Remove and insert item |
| **Items Affected** | Exactly 2 items | 1 item moves, others shift |
| **Use Case** | Direct position swap | Move to specific location |
| **Complexity** | O(n) | O(n) |
| **Filtered Items** | Stay in same position | Stay in same position |
| **Predictability** | Very predictable | More intuitive for "insert here" |

---

## Repository Pattern

### Interface Definition

**File**: `src/repositories/QuestionOrderRepository.ts`

```typescript
export interface QuestionFilters {
  reviewType?: ReviewType
  participantType?: ParticipantType
  country?: CountryType
}

export interface QuestionOrderRepository {
  /**
   * Get complete order of questions in a section
   * @param sectionId - Section identifier
   * @returns Array of question IDs in order
   */
  getFullOrder(sectionId: string): Promise<string[]>

  /**
   * Get filtered questions in order
   * @param sectionId - Section identifier
   * @param filters - Filter criteria
   * @returns Array of filtered question IDs in order
   */
  getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]>

  /**
   * Save new question order
   * @param sectionId - Section identifier
   * @param orderedIds - Question IDs in new order
   */
  saveOrder(sectionId: string, orderedIds: string[]): Promise<void>
}
```

### Dexie (IndexedDB) Implementation

**File**: `src/repositories/DexieQuestionOrderRepository.ts`

```typescript
export class DexieQuestionOrderRepository implements QuestionOrderRepository {
  constructor(private db: AppDb) {}

  async getFullOrder(sectionId: string): Promise<string[]> {
    // First, try to get saved order from sectionQuestionOrder table
    const ordered: SectionQuestionOrder[] = await this.db.sectionQuestionOrder
      .where('sectionId')
      .equals(sectionId)
      .sortBy('orderIndex')

    if (ordered.length > 0) {
      return ordered.map((entry) => entry.questionId)
    }

    // Fallback: get questions and sort by ID
    const questions: Question[] = await this.db.questions
      .where('sectionId')
      .equals(sectionId)
      .toArray()
      
    return questions
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((question) => question.id)
  }

  async getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]> {
    // Get full order first
    const fullOrder = await this.getFullOrder(sectionId)

    // No filters? Return full order
    if (!filters.reviewType && !filters.participantType && !filters.country) {
      return fullOrder
    }

    // Get all questions and apply filters
    const questions = await this.db.questions
      .where('sectionId')
      .equals(sectionId)
      .toArray()
      
    const filtered = this.applyFilters(questions, filters)
    const allowedIds = new Set(filtered.map((q) => q.id))

    // Filter fullOrder to only include allowed IDs (preserves order)
    return fullOrder.filter((questionId) => allowedIds.has(questionId))
  }

  async saveOrder(sectionId: string, orderedIds: string[]): Promise<void> {
    // Build order entries
    const updates = orderedIds.map((questionId, index) => ({
      sectionId,
      questionId,
      orderIndex: index + 1
    }))

    // Atomic update: delete old, insert new
    await this.db.transaction('rw', this.db.sectionQuestionOrder, async () => {
      await this.db.sectionQuestionOrder.where('sectionId').equals(sectionId).delete()
      if (updates.length > 0) {
        await this.db.sectionQuestionOrder.bulkAdd(updates)
      }
    })
  }

  private applyFilters(questions: Question[], filters: QuestionFilters): Question[] {
    return questions.filter((question) => {
      if (filters.reviewType && question.reviewType !== filters.reviewType) {
        return false
      }
      if (filters.participantType && question.participantType !== filters.participantType) {
        return false
      }
      if (filters.country && question.country !== filters.country) {
        return false
      }
      return true
    })
  }
}
```

**Key Features**:
- ✅ Graceful fallback if custom order doesn't exist
- ✅ Atomic transactions for data consistency
- ✅ Efficient indexed queries
- ✅ Order preservation in filtered results

### API Implementation

**File**: `src/repositories/ApiQuestionOrderRepository.ts`

```typescript
export class ApiQuestionOrderRepository implements QuestionOrderRepository {
  constructor(private baseUrl = '') {}

  async getFullOrder(sectionId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/sections/${sectionId}/order`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order (${response.status})`)
    }
    
    const data = await response.json()
    return data.questionIds
  }

  async getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]> {
    const queryParams = new URLSearchParams()
    if (filters.reviewType) queryParams.set('reviewType', filters.reviewType)
    if (filters.participantType) queryParams.set('participantType', filters.participantType)
    if (filters.country) queryParams.set('country', filters.country)
    
    const response = await fetch(
      `${this.baseUrl}/sections/${sectionId}/order?${queryParams}`
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch filtered order (${response.status})`)
    }
    
    const data = await response.json()
    return data.questionIds
  }

  async saveOrder(sectionId: string, orderedIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sections/${sectionId}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ questionIdsInOrder: orderedIds })
    })

    if (!response.ok) {
      throw new Error(`Failed to save order (${response.status})`)
    }
  }
}
```

**Key Features**:
- ✅ RESTful API integration
- ✅ Query parameter filtering
- ✅ Error handling with HTTP status codes
- ✅ JSON serialization

---

## API Contracts

### 1. Fetch Question Order

**Endpoint**: `POST /api/question-order/search`

**Request**:
```json
{
  "reviewType": "Due Diligence",
  "participantType": "XY",
  "country": "USA"
}
```

**Response** (with filters):
```json
{
  "status": "SUCCESS",
  "filteredSections": [
    {
      "sectionOrderId": 1,
      "sectionID": 1,
      "sectionName": "Customer Onboarding",
      "questions": [
        {
          "questionOrderId": 1,
          "questionID": "QID0001",
          "questionText": "What is the customer onboarding process?",
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
      "sectionOrderId": 1,
      "sectionID": 1,
      "sectionName": "Customer Onboarding",
      "questions": [
        {
          "questionOrderId": 1,
          "questionID": "QID0001",
          "questionText": "What is the customer onboarding process?",
          "reviewType": "Due Diligence",
          "participantType": "XY",
          "country": "USA",
          "status": "APPROVED"
        },
        {
          "questionOrderId": 2,
          "questionID": "QID0002",
          "questionText": "How often is customer data reviewed?",
          "reviewType": "Periodic Review",
          "participantType": "PQR",
          "country": "UK",
          "status": "APPROVED"
        }
      ]
    }
  ]
}
```

**Response** (without filters):
```json
{
  "status": "SUCCESS",
  "filteredSections": [],
  "sections": [...]
}
```

**Key Design Decisions**:
- `filteredSections` is **empty** when no filters are active
- `sections` **always contains all data** (full dataset)
- This dual-array approach allows client to:
  - Display filtered view from `filteredSections`
  - Apply algorithms on full dataset from `sections`
  - Show preview of both filtered and full order

### 2. Save Question Order

**Endpoint**: `POST /api/question-order`

**Request**:
```json
{
  "sections": [
    {
      "sectionID": 1,
      "questions": [
        {
          "questionID": "QID0001",
          "QuestionOrder": 1
        },
        {
          "questionID": "QID0002",
          "QuestionOrder": 2
        }
      ]
    },
    {
      "sectionID": 2,
      "questions": [
        {
          "questionID": "QID0003",
          "QuestionOrder": 3
        }
      ]
    }
  ]
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Question order saved successfully"
}
```

**Error Response**:
```json
{
  "status": "ERROR",
  "message": "Invalid question ID: QID9999"
}
```

**Validation Rules**:
- All `questionID` values must exist in database
- `QuestionOrder` must be sequential integers starting from 1
- No duplicate `QuestionOrder` values within a section
- No duplicate `questionID` values

### 3. Reset Question Order

**Endpoint**: `POST /api/question-order/reset`

**Request**: `{}` (empty body)

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Question order reset to defaults"
}
```

**Behavior**:
- Clears all custom ordering
- Resets to default alphabetical/ID-based order
- Returns fresh data immediately

---

## Database Schema

### IndexedDB Schema (Dexie)

**File**: `src/db/appDb.ts`

#### Tables

##### 1. sections

**Purpose**: Store section definitions

```typescript
interface Section {
  id: string              // Primary key
  title: string          // Section name
}

// Index
'id'
```

##### 2. questions

**Purpose**: Store question details

```typescript
interface Question {
  id: string                      // Primary key (e.g., "QID0001")
  sectionId: string              // Foreign key to sections
  text: string                   // Question text
  reviewType: ReviewType         // "Due Diligence" | "Periodic Review"
  participantType: ParticipantType // "XY" | "PQR"
  country: CountryType           // "USA" | "UK" | "India" | "Canada"
  status: QuestionStatus         // "APPROVED" | "REVIEW" | "CANCELLED"
  createdBy?: string             // User who created
  createdAt?: string             // ISO timestamp
}

// Indexes
'id, sectionId, reviewType, participantType, country, status, createdBy'
```

**Index Strategy**:
- `id`: Primary key lookups
- `sectionId`: Get all questions in a section
- `reviewType`, `participantType`, `country`: Filter queries
- `status`: Filter by status
- `createdBy`: Audit queries

##### 3. sectionQuestionOrder

**Purpose**: Store custom question ordering

```typescript
interface SectionQuestionOrder {
  sectionId: string      // Section reference
  questionId: string     // Question reference
  orderIndex: number     // Position in section (1-based)
}

// Indexes
'[sectionId+questionId], sectionId, orderIndex'
```

**Composite Primary Key**: `[sectionId, questionId]`
- Ensures no duplicate entries
- Fast lookups for specific question in section

**Index Strategy**:
- `[sectionId+questionId]`: Compound primary key
- `sectionId`: Get all orders for a section
- `orderIndex`: Sort by order

#### Schema Migrations

```typescript
// Version 1: Initial schema
this.version(1).stores({
  sections: 'id',
  questions: 'id, sectionId, reviewType, participantType, status',
  sectionQuestionOrder: '[sectionId+questionId], sectionId, orderIndex'
})

// Version 2: Add createdBy and createdAt
this.version(2).stores({
  sections: 'id',
  questions: 'id, sectionId, reviewType, participantType, status, createdBy',
  sectionQuestionOrder: '[sectionId+questionId], sectionId, orderIndex'
}).upgrade(async tx => {
  const questions = await tx.table('questions').toArray()
  await Promise.all(
    questions.map(q => 
      tx.table('questions').update(q.id, {
        createdBy: 'System',
        createdAt: new Date().toISOString()
      })
    )
  )
})

// Version 3: Add country field
this.version(3).stores({
  sections: 'id',
  questions: 'id, sectionId, reviewType, participantType, country, status, createdBy',
  sectionQuestionOrder: '[sectionId+questionId], sectionId, orderIndex'
}).upgrade(async tx => {
  const questions = await tx.table('questions').toArray()
  await Promise.all(
    questions.map(q => 
      tx.table('questions').update(q.id, {
        country: 'USA'
      })
    )
  )
})
```

**Migration Best Practices**:
- ✅ Always increment version number
- ✅ Provide data migration in `.upgrade()`
- ✅ Set default values for new fields
- ✅ Never delete old versions (Dexie handles migration chain)

### Backend Database Schema (Conceptual)

**Note**: This is conceptual for when moving to real backend

#### Tables

##### question_order

```sql
CREATE TABLE question_order (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL,
  question_id VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(section_id, question_id),
  UNIQUE(section_id, order_index),
  
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_question_order_section ON question_order(section_id);
CREATE INDEX idx_question_order_question ON question_order(question_id);
CREATE INDEX idx_question_order_index ON question_order(order_index);
```

**Constraints**:
- Unique combination of section and question
- Unique order_index within section (no gaps)
- Cascading deletes for data integrity

---

## UI/UX Design

### Visual Design System

#### Color Palette

```typescript
const theme = {
  primary: '#1976d2',      // Blue (MUI default primary)
  secondary: '#dc004e',    // Red (MUI default secondary)
  warning: '#ff9800',      // Orange (position changed)
  success: '#4caf50',      // Green (save success)
  error: '#f44336',        // Red (errors)
  info: '#2196f3',         // Light blue (current position)
  
  // Custom colors
  dragHover: '#ff9800',    // Orange border when drag over
  filtered: '#e0e0e0',     // Gray for filtered-out items
  changed: '#fff3e0',      // Light orange background for changed
}
```

#### Typography

```typescript
const typography = {
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'primary.main'
  },
  questionText: {
    fontSize: '0.875rem',
    fontWeight: 400,
    color: 'text.primary'
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: 700
  },
  metadata: {
    fontSize: '0.75rem',
    color: 'text.secondary'
  }
}
```

### Component Visual Specifications

#### Question Card

```tsx
<Card
  draggable
  sx={{
    cursor: 'move',
    border: dragOver ? '2px solid orange' : '1px solid #ddd',
    backgroundColor: isChanged ? '#fff3e0' : 'white',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: 3
    }
  }}
>
  {/* Header */}
  <Stack direction="row" justifyContent="space-between">
    <Box>
      {/* Current Position Badge */}
      <Chip 
        label={currentPosition}
        color="info"
        size="small"
      />
      
      {/* Changed Position Badge */}
      {isChanged && (
        <Chip
          label={`${originalPosition} → ${currentPosition}`}
          color="warning"
          size="small"
        />
      )}
    </Box>
  </Stack>
  
  {/* Question Text */}
  <Typography variant="body2">
    {questionText}
  </Typography>
  
  {/* Metadata */}
  <Stack direction="row" spacing={1}>
    <Chip label={reviewType} size="small" variant="outlined" />
    <Chip label={participantType} size="small" variant="outlined" />
    <Chip label={country} size="small" variant="outlined" />
  </Stack>
</Card>
```

#### Section Card

```tsx
<Card elevation={3}>
  {/* Section Header */}
  <CardContent>
    <Typography variant="h6" color="primary">
      {sectionName}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {questionCount} questions
    </Typography>
  </CardContent>
  
  {/* Questions List */}
  <Stack spacing={1} p={2}>
    {questions.map(question => <QuestionCard key={question.id} />)}
  </Stack>
</Card>
```

### Interaction Patterns

#### Drag and Drop States

```
Normal → Dragging → Drag Over → Drop/Cancel
  ↓         ↓           ↓            ↓
cursor:   cursor:    border:      update +
move      grabbing   orange       animation
                     2px
```

**Visual Feedback**:
1. **Normal**: `cursor: move`, subtle shadow
2. **Dragging**: `cursor: grabbing`, reduced opacity on dragged item
3. **Drag Over**: Orange 2px border on drop target
4. **Drop**: Smooth position animation (CSS transition)

#### Filter Application Flow

```
User selects filter → Show loading spinner
                           ↓
                    Fetch filtered data
                           ↓
                    Animate list update
                           ↓
                    Show filter chips
                           ↓
                    Update counts
```

**Visual Indicators**:
- Loading skeleton during fetch
- Fade-in animation for filtered results
- Active filter chips at top
- Question count badges update

### Responsive Design

#### Breakpoints

```typescript
const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 600,    // Mobile landscape
  md: 960,    // Tablet
  lg: 1280,   // Desktop
  xl: 1920    // Large desktop
}
```

#### Layout Adjustments

```tsx
// Mobile: Stack vertically
<Stack direction="column" spacing={2}>
  <FilterControls />
  <QuestionsList />
</Stack>

// Desktop: Side-by-side
<Grid container spacing={2}>
  <Grid item xs={12} md={3}>
    <FilterControls />
  </Grid>
  <Grid item xs={12} md={9}>
    <QuestionsList />
  </Grid>
</Grid>
```

### Accessibility (a11y)

#### Keyboard Navigation

```typescript
// Allow keyboard-triggered drag and drop
handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    // Select question for move
  }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    // Navigate questions
  }
  if (e.key === 'Escape') {
    // Cancel drag operation
  }
}
```

#### ARIA Attributes

```tsx
<Card
  role="button"
  aria-label={`Question ${position}: ${questionText}`}
  aria-grabbed={isDragging}
  aria-dropeffect="move"
  tabIndex={0}
>
```

#### Screen Reader Support

```tsx
<Typography component="span" sx={{ srOnly }}>
  Question {position} of {total}. {questionText}.
  Review type: {reviewType}.
  Participant type: {participantType}.
  Country: {country}.
  {isChanged && `Position changed from ${originalPosition} to ${currentPosition}`}
</Typography>
```

### Loading States

#### Skeleton Screens

```tsx
{loading && (
  <Stack spacing={1}>
    {[1, 2, 3].map(i => (
      <Card key={i}>
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="text" />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="circular" width={60} height={20} />
          <Skeleton variant="circular" width={60} height={20} />
        </Stack>
      </Card>
    ))}
  </Stack>
)}
```

---

## Security Considerations

### Frontend Security

#### 1. Input Validation

```typescript
// Validate filter inputs
const validateFilters = (filters: QuestionFilters): boolean => {
  const validReviewTypes = ['Due Diligence', 'Periodic Review']
  const validParticipantTypes = ['XY', 'PQR']
  const validCountries = ['USA', 'UK', 'India', 'Canada']
  
  if (filters.reviewType && !validReviewTypes.includes(filters.reviewType)) {
    throw new Error('Invalid review type')
  }
  // ... similar validation for other fields
  
  return true
}
```

#### 2. XSS Prevention

```tsx
// Always use React's built-in escaping
<Typography>{questionText}</Typography> // ✓ Safe

// Never use dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: untrustedContent }} /> // ✗ Dangerous
```

#### 3. CSRF Protection

```typescript
// Include CSRF token in all API requests
const saveOrder = async (data: SaveQuestionOrderRequest) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  
  const response = await fetch('/api/question-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || ''
    },
    body: JSON.stringify(data)
  })
}
```

### Backend Security

#### 1. Authentication

```typescript
// Require authentication for all ordering endpoints
app.post('/api/question-order', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  // Process request
})
```

#### 2. Authorization

```typescript
// Check user permissions
const canReorderQuestions = (user: User, sectionId: number): boolean => {
  // Check if user has permission for this section
  return user.permissions.includes('question.reorder') &&
         user.sections.includes(sectionId)
}
```

#### 3. Data Validation

```typescript
// Validate incoming data
const validateSaveRequest = (data: SaveQuestionOrderRequest): boolean => {
  // Check structure
  if (!Array.isArray(data.sections)) {
    throw new Error('Invalid sections format')
  }
  
  // Validate each section
  data.sections.forEach(section => {
    if (typeof section.sectionID !== 'number') {
      throw new Error('Invalid section ID')
    }
    
    // Check for duplicate question IDs
    const questionIds = section.questions.map(q => q.questionID)
    if (new Set(questionIds).size !== questionIds.length) {
      throw new Error('Duplicate question IDs detected')
    }
    
    // Validate sequential ordering
    const orders = section.questions.map(q => q.QuestionOrder).sort()
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        throw new Error('Non-sequential question order')
      }
    }
  })
  
  return true
}
```

#### 4. Rate Limiting

```typescript
// Prevent abuse of ordering API
import rateLimit from 'express-rate-limit'

const orderingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many ordering requests, please try again later'
})

app.post('/api/question-order', orderingLimiter, async (req, res) => {
  // Process request
})
```

### Data Integrity

#### 1. Atomic Operations

```typescript
// Use database transactions
const saveQuestionOrder = async (sections: SectionData[]) => {
  const transaction = await db.transaction()
  
  try {
    // Delete existing orders
    await transaction.questionOrder.deleteMany({
      where: { sectionId: { in: sections.map(s => s.sectionID) } }
    })
    
    // Insert new orders
    await transaction.questionOrder.createMany({
      data: sections.flatMap(section =>
        section.questions.map(q => ({
          sectionId: section.sectionID,
          questionId: q.questionID,
          orderIndex: q.QuestionOrder
        }))
      )
    })
    
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

#### 2. Optimistic Locking

```typescript
// Prevent concurrent update conflicts
interface QuestionOrder {
  id: number
  sectionId: number
  questionId: string
  orderIndex: number
  version: number  // Optimistic lock version
  updatedAt: Date
}

const updateOrder = async (order: QuestionOrder) => {
  const result = await db.questionOrder.updateMany({
    where: {
      id: order.id,
      version: order.version  // Only update if version matches
    },
    data: {
      orderIndex: order.orderIndex,
      version: order.version + 1,
      updatedAt: new Date()
    }
  })
  
  if (result.count === 0) {
    throw new Error('Concurrent modification detected, please refresh')
  }
}
```

---

## Performance Optimization

### Frontend Optimizations

#### 1. Memoization

```typescript
// Memoize expensive computations
const QuestionCard = React.memo(({ question, position }: Props) => {
  return <Card>...</Card>
}, (prevProps, nextProps) => {
  // Only re-render if these change
  return prevProps.question.questionID === nextProps.question.questionID &&
         prevProps.position === nextProps.position
})

// Memoize derived state
const filteredQuestions = useMemo(() => {
  return allQuestions.filter(q => matchesFilters(q, filters))
}, [allQuestions, filters])
```

#### 2. Virtual Scrolling

```typescript
// For large lists (100+ questions), use virtual scrolling
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={questions.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <QuestionCard question={questions[index]} />
    </div>
  )}
</FixedSizeList>
```

#### 3. Debouncing

```typescript
// Debounce filter changes
const debouncedFilter = useMemo(
  () => debounce((filters: QuestionFilters) => {
    dispatch(fetchQuestionOrder(filters))
  }, 300),
  [dispatch]
)

const handleFilterChange = (key: string, value: string) => {
  const newFilters = { ...filters, [key]: value }
  setFilters(newFilters)
  debouncedFilter(newFilters)
}
```

#### 4. Code Splitting

```typescript
// Lazy load ordering pages
const QuestionOrder = lazy(() => import('./pages/QuestionOrder'))
const SectionOrder = lazy(() => import('./pages/SectionOrder'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/ordering" element={<QuestionOrder />} />
    <Route path="/section-order" element={<SectionOrder />} />
  </Routes>
</Suspense>
```

### Backend Optimizations

#### 1. Database Indexing

```sql
-- Composite index for common queries
CREATE INDEX idx_questions_section_filters 
ON questions(section_id, review_type, participant_type, country);

-- Index for ordering queries
CREATE INDEX idx_question_order_lookup 
ON question_order(section_id, order_index);
```

#### 2. Query Optimization

```typescript
// Fetch questions with order in single query
const getQuestionsWithOrder = async (sectionId: number, filters: Filters) => {
  return await db.query(`
    SELECT 
      q.*,
      COALESCE(qo.order_index, 999999) as order_index
    FROM questions q
    LEFT JOIN question_order qo 
      ON q.id = qo.question_id AND qo.section_id = $1
    WHERE q.section_id = $1
      AND ($2::text IS NULL OR q.review_type = $2)
      AND ($3::text IS NULL OR q.participant_type = $3)
      AND ($4::text IS NULL OR q.country = $4)
    ORDER BY order_index, q.id
  `, [sectionId, filters.reviewType, filters.participantType, filters.country])
}
```

#### 3. Caching

```typescript
// Cache frequently accessed data
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // 5 minutes

const getQuestions = async (sectionId: number, filters: Filters) => {
  const cacheKey = `questions:${sectionId}:${JSON.stringify(filters)}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  // Fetch from database
  const questions = await db.getQuestions(sectionId, filters)
  
  // Store in cache
  cache.set(cacheKey, questions)
  
  return questions
}

// Invalidate cache on update
const saveQuestionOrder = async (data: SaveRequest) => {
  await db.saveOrder(data)
  
  // Clear relevant caches
  cache.del(`questions:${data.sectionId}:*`)
}
```

#### 4. Batch Operations

```typescript
// Batch save operations
const saveBatch = async (sections: SectionData[]) => {
  const allUpdates = sections.flatMap(section =>
    section.questions.map(q => ({
      sectionId: section.sectionID,
      questionId: q.questionID,
      orderIndex: q.QuestionOrder
    }))
  )
  
  // Single bulk insert instead of multiple queries
  await db.questionOrder.createMany({
    data: allUpdates,
    skipDuplicates: false
  })
}
```

### Network Optimizations

#### 1. Payload Compression

```typescript
// Enable gzip compression
import compression from 'compression'

app.use(compression())
```

#### 2. Response Pagination

```typescript
// Paginate large result sets
const getQuestions = async (sectionId: number, page = 1, limit = 50) => {
  const offset = (page - 1) * limit
  
  const [questions, total] = await Promise.all([
    db.questions
      .findMany({
        where: { sectionId },
        skip: offset,
        take: limit
      }),
    db.questions.count({ where: { sectionId } })
  ])
  
  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}
```

---

## Error Handling & Recovery

### Error Types

#### 1. Network Errors

```typescript
const fetchQuestionOrder = async (filters: QuestionFilters) => {
  try {
    const response = await fetch('/api/question-order/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error (no connection)
      throw new Error('Network error. Please check your connection.')
    }
    throw error
  }
}
```

#### 2. Validation Errors

```typescript
const validateQuestionOrder = (sections: SectionData[]): ValidationResult => {
  const errors: string[] = []
  
  sections.forEach(section => {
    // Check for missing questions
    if (section.questions.length === 0) {
      errors.push(`Section ${section.sectionID} has no questions`)
    }
    
    // Check for gaps in ordering
    const orders = section.questions.map(q => q.QuestionOrder).sort()
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        errors.push(`Gap in question order for section ${section.sectionID}`)
        break
      }
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### 3. Concurrent Update Errors

```typescript
// Detect and handle concurrent modifications
const saveWithConflictResolution = async (data: SaveRequest) => {
  try {
    await saveQuestionOrder(data)
  } catch (error) {
    if (error.code === 'CONCURRENT_MODIFICATION') {
      // Show dialog to user
      const choice = await showConflictDialog({
        title: 'Concurrent Update Detected',
        message: 'Someone else has modified this data. What would you like to do?',
        options: ['Reload and lose my changes', 'Overwrite their changes', 'Cancel']
      })
      
      if (choice === 'Reload') {
        await dispatch(fetchQuestionOrder(filters))
      } else if (choice === 'Overwrite') {
        await saveQuestionOrder(data, { force: true })
      }
    }
  }
}
```

### Error Recovery Strategies

#### 1. Automatic Retry with Exponential Backoff

```typescript
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      if (response.ok || response.status < 500) {
        return response
      }
      
      // Only retry on server errors
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error('Max retries exceeded')
}
```

#### 2. Optimistic Rollback

```typescript
const updateWithRollback = async (
  sectionId: number,
  newQuestions: Question[]
) => {
  // Save current state
  const snapshot = current(state.data.sections)
  const previousQuestions = snapshot
    .find(s => s.sectionID === sectionId)?.questions || []
  
  try {
    // Optimistic update
    dispatch(updateSectionQuestions({ sectionId, questions: newQuestions }))
    
    // Persist to backend
    await saveQuestionOrder({ sections: [{ sectionId, questions: newQuestions }] })
  } catch (error) {
    // Rollback on failure
    dispatch(updateSectionQuestions({ sectionId, questions: previousQuestions }))
    
    showErrorNotification('Failed to save changes. Changes have been reverted.')
    throw error
  }
}
```

#### 3. Offline Support

```typescript
// Queue mutations when offline
const offlineQueue: SaveRequest[] = []

const saveQuestionOrder = async (data: SaveRequest) => {
  if (!navigator.onLine) {
    // Add to queue
    offlineQueue.push(data)
    
    // Save to IndexedDB for persistence
    await db.offlineQueue.add({
      type: 'SAVE_ORDER',
      data,
      timestamp: Date.now()
    })
    
    showWarningNotification('You are offline. Changes will be saved when connection is restored.')
    return
  }
  
  // Online - process normally
  await api.saveOrder(data)
}

// Process queue when coming back online
window.addEventListener('online', async () => {
  const queued = await db.offlineQueue.toArray()
  
  for (const item of queued) {
    try {
      await api.saveOrder(item.data)
      await db.offlineQueue.delete(item.id)
    } catch (error) {
      console.error('Failed to sync queued item:', error)
      // Keep in queue for next sync attempt
    }
  }
})
```

### User-Facing Error Messages

```typescript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You do not have permission to reorder questions.',
  NOT_FOUND: 'The requested section or question was not found.',
  VALIDATION_ERROR: 'Invalid data. Please check your changes and try again.',
  CONCURRENT_UPDATE: 'Someone else has modified this data. Please refresh and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.'
}

const getErrorMessage = (error: Error): string => {
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  if (error.message.includes('401')) {
    return ERROR_MESSAGES.UNAUTHORIZED
  }
  if (error.message.includes('404')) {
    return ERROR_MESSAGES.NOT_FOUND
  }
  if (error.message.includes('validation')) {
    return ERROR_MESSAGES.VALIDATION_ERROR
  }
  if (error.message.includes('concurrent')) {
    return ERROR_MESSAGES.CONCURRENT_UPDATE
  }
  
  return ERROR_MESSAGES.SERVER_ERROR
}
```

---

## Testing Strategy

### Unit Tests

#### 1. Algorithm Tests

```typescript
describe('applyFilteredReorder', () => {
  it('should swap two items in full order', () => {
    const fullOrder = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
    const filteredIds = ['Q1', 'Q3', 'Q5']
    const newFilteredOrder = ['Q5', 'Q1', 'Q3']
    
    const result = applyFilteredReorder(fullOrder, filteredIds, newFilteredOrder)
    
    expect(result).toEqual(['Q5', 'Q2', 'Q3', 'Q4', 'Q1'])
  })
  
  it('should handle no movement', () => {
    const fullOrder = ['Q1', 'Q2', 'Q3']
    const result = applyFilteredReorder(fullOrder, fullOrder, fullOrder)
    
    expect(result).toEqual(fullOrder)
  })
  
  it('should return original order on invalid input', () => {
    const fullOrder = ['Q1', 'Q2', 'Q3']
    const result = applyFilteredReorder(fullOrder, [], [])
    
    expect(result).toEqual(fullOrder)
  })
})

describe('applyFilteredShift', () => {
  it('should insert item at new position', () => {
    const fullOrder = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
    const filteredIds = ['Q2', 'Q4']
    const newFilteredOrder = ['Q4', 'Q2']
    
    const result = applyFilteredShift(fullOrder, filteredIds, newFilteredOrder)
    
    expect(result).toEqual(['Q1', 'Q4', 'Q2', 'Q3', 'Q5'])
  })
})
```

#### 2. Repository Tests

```typescript
describe('DexieQuestionOrderRepository', () => {
  let repo: DexieQuestionOrderRepository
  let db: AppDb
  
  beforeEach(async () => {
    db = new AppDb()
    await db.delete()
    await db.open()
    repo = new DexieQuestionOrderRepository(db)
  })
  
  afterEach(async () => {
    await db.delete()
  })
  
  it('should return full order from sectionQuestionOrder', async () => {
    await db.sectionQuestionOrder.bulkAdd([
      { sectionId: '1', questionId: 'Q3', orderIndex: 1 },
      { sectionId: '1', questionId: 'Q1', orderIndex: 2 },
      { sectionId: '1', questionId: 'Q2', orderIndex: 3 }
    ])
    
    const result = await repo.getFullOrder('1')
    
    expect(result).toEqual(['Q3', 'Q1', 'Q2'])
  })
  
  it('should filter questions by criteria', async () => {
    await db.questions.bulkAdd([
      { id: 'Q1', sectionId: '1', reviewType: 'Due Diligence', /* ... */ },
      { id: 'Q2', sectionId: '1', reviewType: 'Periodic Review', /* ... */ },
      { id: 'Q3', sectionId: '1', reviewType: 'Due Diligence', /* ... */ }
    ])
    
    const result = await repo.getFiltered('1', { reviewType: 'Due Diligence' })
    
    expect(result).toEqual(['Q1', 'Q3'])
  })
  
  it('should save order atomically', async () => {
    await repo.saveOrder('1', ['Q1', 'Q2', 'Q3'])
    
    const saved = await db.sectionQuestionOrder
      .where('sectionId')
      .equals('1')
      .sortBy('orderIndex')
    
    expect(saved).toHaveLength(3)
    expect(saved[0].questionId).toBe('Q1')
    expect(saved[0].orderIndex).toBe(1)
  })
})
```

#### 3. Redux Slice Tests

```typescript
describe('questionOrderSlice', () => {
  it('should handle setFilters', () => {
    const state = reducer(initialState, setFilters({ reviewType: 'Due Diligence' }))
    
    expect(state.filters.reviewType).toBe('Due Diligence')
  })
  
  it('should handle updateSectionQuestions', () => {
    const initialData = {
      status: 'SUCCESS' as const,
      sections: [{
        sectionID: 1,
        questions: [{ questionID: 'Q1', /* ... */ }]
      }],
      filteredSections: []
    }
    
    const state = {
      ...initialState,
      data: initialData
    }
    
    const newQuestions = [{ questionID: 'Q2', /* ... */ }]
    const newState = reducer(state, updateSectionQuestions({
      sectionID: 1,
      questions: newQuestions
    }))
    
    expect(newState.data?.sections[0].questions).toEqual(newQuestions)
    expect(newState.hasChanges).toBe(true)
  })
})
```

### Integration Tests

```typescript
describe('Question Ordering Integration', () => {
  it('should complete full reorder flow', async () => {
    render(
      <Provider store={store}>
        <QuestionOrder />
      </Provider>
    )
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Customer Onboarding/i)).toBeInTheDocument()
    })
    
    // Drag question
    const question1 = screen.getByText(/What is your name/i)
    const question2 = screen.getByText(/What is your age/i)
    
    fireEvent.dragStart(question1)
    fireEvent.dragOver(question2)
    fireEvent.drop(question2)
    
    // Verify UI updated
    await waitFor(() => {
      expect(screen.getByText(/1 → 2/i)).toBeInTheDocument()
    })
    
    // Save
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)
    
    // Verify API called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/question-order',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })
})
```

### E2E Tests

```typescript
// Playwright or Cypress
describe('Question Ordering E2E', () => {
  it('should allow drag and drop reordering', () => {
    cy.visit('/question-bank/ordering')
    
    // Wait for load
    cy.contains('Customer Onboarding').should('be.visible')
    
    // Perform drag and drop
    cy.get('[data-question-id="Q1"]')
      .drag('[data-question-id="Q3"]')
    
    // Verify position changed
    cy.get('[data-question-id="Q1"]')
      .should('contain', '1 → 3')
    
    // Save
    cy.contains('button', 'Save to API').click()
    
    // Verify toast
    cy.contains('Successfully saved').should('be.visible')
  })
  
  it('should show confirmation when filtering', () => {
    cy.visit('/question-bank/ordering')
    
    // Apply filter
    cy.get('[data-testid="review-type-select"]').click()
    cy.contains('Due Diligence').click()
    
    // Drag question
    cy.get('[data-question-id="Q1"]')
      .drag('[data-question-id="Q5"]')
    
    // Confirm dialog appears
    cy.contains('This will affect hidden questions').should('be.visible')
    
    // Confirm
    cy.contains('button', 'Confirm').click()
    
    // Verify reorder happened
    cy.get('[data-question-id="Q1"]')
      .should('have.attr', 'data-position', '5')
  })
})
```

---

## Deployment Architecture

### Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - VITE_USE_MOCK_API=true
      - VITE_API_URL=http://localhost:3000
    command: npm run dev

  mockapi:
    build:
      context: .
      dockerfile: Dockerfile.mockapi
    ports:
      - "3000:3000"
    volumes:
      - ./src/services:/app/src/services
    environment:
      - NODE_ENV=development
```

### Production Environment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: question-ordering-frontend:latest
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.production.com
      - VITE_USE_MOCK_API=false
    restart: always

  backend:
    image: question-ordering-backend:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/questions
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=questions
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: question-ordering:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/frontend \
            frontend=question-ordering:${{ github.sha }}
          kubectl rollout status deployment/frontend
```

---

## Monitoring & Observability

### Frontend Monitoring

#### 1. Performance Metrics

```typescript
// Track page load time
window.addEventListener('load', () => {
  const perfData = window.performance.timing
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
  
  analytics.track('Page Load Time', {
    page: 'QuestionOrder',
    duration: pageLoadTime,
    timestamp: Date.now()
  })
})

// Track interaction performance
const trackDragPerformance = (startTime: number, endTime: number) => {
  const duration = endTime - startTime
  
  analytics.track('Drag Performance', {
    duration,
    timestamp: Date.now()
  })
}
```

#### 2. Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://your-sentry-dsn',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
  environment: import.meta.env.MODE
})

// Wrap app
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

#### 3. User Analytics

```typescript
// Track user actions
const trackReorder = (sectionId: number, algorithm: 'swap' | 'shift') => {
  analytics.track('Question Reordered', {
    sectionId,
    algorithm,
    timestamp: Date.now(),
    userId: currentUser.id
  })
}

const trackFilterUsage = (filters: QuestionFilters) => {
  analytics.track('Filters Applied', {
    filtersCount: Object.keys(filters).length,
    filters,
    timestamp: Date.now()
  })
}
```

### Backend Monitoring

#### 1. Logging

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Log API requests
app.use((req, res, next) => {
  logger.info('API Request', {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    timestamp: Date.now()
  })
  next()
})
```

#### 2. Metrics

```typescript
import promClient from 'prom-client'

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
})

const questionOrderSaves = new promClient.Counter({
  name: 'question_order_saves_total',
  help: 'Total number of question order saves'
})

// Track metrics
app.post('/api/question-order', async (req, res) => {
  const start = Date.now()
  
  try {
    await saveQuestionOrder(req.body)
    questionOrderSaves.inc()
    
    const duration = (Date.now() - start) / 1000
    httpRequestDuration.labels('POST', '/api/question-order', '200').observe(duration)
    
    res.json({ status: 'SUCCESS' })
  } catch (error) {
    const duration = (Date.now() - start) / 1000
    httpRequestDuration.labels('POST', '/api/question-order', '500').observe(duration)
    
    res.status(500).json({ error: error.message })
  }
})
```

### Dashboards

#### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Question Ordering Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "targets": [{
          "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])"
        }]
      },
      {
        "title": "Order Saves per Minute",
        "targets": [{
          "expr": "rate(question_order_saves_total[1m])"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(http_request_duration_seconds_count{status=~\"5..\"}[5m])"
        }]
      }
    ]
  }
}
```

---

## Future Enhancements

### Phase 2 Enhancements

#### 1. Undo/Redo Functionality

```typescript
interface HistoryState {
  past: QuestionOrderState[]
  present: QuestionOrderState
  future: QuestionOrderState[]
}

const undo = () => {
  if (history.past.length === 0) return
  
  const previous = history.past[history.past.length - 1]
  const newPast = history.past.slice(0, history.past.length - 1)
  
  setHistory({
    past: newPast,
    present: previous,
    future: [history.present, ...history.future]
  })
}

const redo = () => {
  if (history.future.length === 0) return
  
  const next = history.future[0]
  const newFuture = history.future.slice(1)
  
  setHistory({
    past: [...history.past, history.present],
    present: next,
    future: newFuture
  })
}
```

#### 2. Bulk Operations

```typescript
// Select multiple questions
const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())

// Move all selected to top/bottom
const moveSelectedToTop = () => {
  const section = currentSection
  const selected = Array.from(selectedQuestions)
  const unselected = section.questions.filter(q => !selectedQuestions.has(q.questionID))
  
  const newOrder = [...selected, ...unselected]
  updateSectionQuestions(section.sectionID, newOrder)
}
```

#### 3. Question Templates

```typescript
interface QuestionTemplate {
  id: string
  name: string
  questions: Partial<Question>[]
}

const applyTemplate = async (sectionId: number, templateId: string) => {
  const template = await fetchTemplate(templateId)
  
  const newQuestions = template.questions.map((q, idx) => ({
    ...q,
    sectionId,
    orderIndex: idx + 1
  }))
  
  await saveQuestions(newQuestions)
}
```

#### 4. Version History

```typescript
interface OrderVersion {
  id: number
  sectionId: number
  order: string[]
  createdAt: Date
  createdBy: string
  comment?: string
}

// Save version snapshot
const saveVersion = async (sectionId: number, comment: string) => {
  const currentOrder = await getCurrentOrder(sectionId)
  
  await db.orderVersions.add({
    sectionId,
    order: currentOrder,
    createdAt: new Date(),
    createdBy: currentUser.id,
    comment
  })
}

// Restore from version
const restoreVersion = async (versionId: number) => {
  const version = await db.orderVersions.get(versionId)
  await saveOrder(version.sectionId, version.order)
}
```

#### 5. Collaborative Editing

```typescript
// WebSocket integration for real-time updates
const socket = io('wss://api.production.com')

socket.on('question-order-updated', (data: {
  sectionId: number
  questions: Question[]
  userId: string
}) => {
  if (data.userId !== currentUser.id) {
    // Show notification
    showNotification(`${data.userId} updated the order`)
    
    // Update local state
    dispatch(updateSectionQuestions({
      sectionID: data.sectionId,
      questions: data.questions
    }))
  }
})
```

### Phase 3 Enhancements

#### 1. AI-Powered Suggestions

```typescript
// Analyze question order for optimization suggestions
const getSuggestions = async (sectionId: number) => {
  const response = await fetch('/api/ai/order-suggestions', {
    method: 'POST',
    body: JSON.stringify({ sectionId })
  })
  
  const suggestions = await response.json()
  
  return suggestions.map(s => ({
    confidence: s.confidence,
    reasoning: s.reasoning,
    proposedOrder: s.order
  }))
}
```

#### 2. Advanced Analytics

```typescript
// Track question effectiveness
interface QuestionAnalytics {
  questionId: string
  averageCompletionTime: number
  skipRate: number
  clarificationRequestRate: number
  position: number
}

// Recommend optimal order based on analytics
const getOptimalOrder = async (sectionId: number) => {
  const analytics = await fetchQuestionAnalytics(sectionId)
  
  // Sort by effectiveness score
  return analytics
    .sort((a, b) => calculateEffectiveness(b) - calculateEffectiveness(a))
    .map(a => a.questionId)
}
```

#### 3. Mobile App Support

```typescript
// React Native components
import { DragDropContext, Droppable, Draggable } from 'react-native-draggable-list'

const MobileQuestionOrder = () => {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions">
        {questions.map((question, index) => (
          <Draggable
            key={question.id}
            draggableId={question.id}
            index={index}
          >
            <QuestionCard question={question} />
          </Draggable>
        ))}
      </Droppable>
    </DragDropContext>
  )
}
```

---

## Conclusion

This technical design documentation provides a comprehensive overview of the Question Ordering System architecture, from high-level design patterns to low-level implementation details.

### Key Architectural Decisions

1. **Repository Pattern**: Abstracts data access for flexibility
2. **Redux State Management**: Centralized, predictable state
3. **Dual Algorithm Support**: Swap and Shift for different use cases
4. **Filter Preservation**: Maintains order of hidden items
5. **Optimistic Updates**: Better UX with rollback capability

### Success Metrics

- **Performance**: < 100ms for reorder operations
- **Reliability**: 99.9% uptime
- **Usability**: < 3 clicks to reorder questions
- **Accessibility**: WCAG 2.1 AA compliance

### Maintenance

- Regular dependency updates
- Security patches
- Performance monitoring
- User feedback integration

---

**Document Version**: 1.0  
**Last Updated**: February 19, 2026  
**Author**: Technical Architecture Team  
**Status**: Active
