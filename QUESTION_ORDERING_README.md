# Question Ordering System - User Guide

## Overview

This application provides two different approaches to managing question order across multiple sections. Both pages work with the same database but use different reordering algorithms to suit different use cases.

---

## Table of Contents

1. [Question Order Page (Swap Behavior)](#question-order-page-swap-behavior)
2. [Section Order Page (Shift/Insert Behavior)](#section-order-page-shiftinsert-behavior)
3. [Database Structure](#database-structure)
4. [Filtering System](#filtering-system)
5. [Save to API](#save-to-api)
6. [Common Features](#common-features)

---

## Question Order Page (Swap Behavior)

**Location:** `/question-bank/ordering`

**Algorithm:** `applyFilteredReorder` (Swap)

### Purpose
This page is designed for scenarios where you want to **swap positions** between two questions. When you drag a question onto another, they exchange positions.

### How It Works

**Without Filters:**
```
Before: Q1, Q2, Q3, Q4, Q5
Drag Q2 onto Q4
After:  Q1, Q4, Q3, Q2, Q5
```
Q2 and Q4 swap positions directly.

**With Filters Active:**
When filters are applied, the swap operation affects the **full order** but maintains relative positions:

```
Full Order:      Q1(USA), Q2(UK), Q3(USA), Q4(UK), Q5(USA)
Filter: USA      Q1, Q3, Q5
Drag Q1 onto Q5
Result:          Q5(USA), Q2(UK), Q3(USA), Q4(UK), Q1(USA)
```

The filtered questions swap their global positions, and non-filtered questions shift to maintain order.

### Features

1. **Drag and Drop Reordering**
   - Click and hold a question card
   - Drag it over another question
   - Release to swap positions
   - Orange border indicates drop target

2. **Confirmation Dialog**
   - Appears when reordering with filters active
   - Explains that ALL questions will be affected
   - Prevents accidental changes to hidden questions

3. **Visual Indicators**
   - **Blue badge:** Current position number
   - **Orange badge:** Position changed from original
   - **Previous → New:** Shows position change
   - **Filtered Order box:** Shows only visible questions
   - **Final Order box:** Shows all questions with grayed-out filtered ones

4. **Save to API**
   - Logs current order to console
   - Formats data with QID format and global ordering
   - Shows success/error toast notifications

### Data Output Format

```json
{
  "sections": [
    {
      "sectionID": "1",
      "questions": [
        { "questionID": "QID0001", "QuestionOrder": 1 },
        { "questionID": "QID0002", "QuestionOrder": 2 }
      ]
    },
    {
      "sectionID": "2",
      "questions": [
        { "questionID": "QID0003", "QuestionOrder": 3 },
        { "questionID": "QID0004", "QuestionOrder": 4 }
      ]
    }
  ]
}
```

### Use Cases

- **Simple position swaps:** Trading places between specific questions
- **Manual sorting:** Organizing questions by swapping adjacent items
- **Fine-tuning:** Making minor adjustments to existing order

---

## Section Order Page (Shift/Insert Behavior)

**Location:** `/question-bank/section-order`

**Algorithm:** `applyFilteredShift` (Shift/Insert)

### Purpose
This page is designed for scenarios where you want to **insert a question at a new position**, pushing all other questions down. This is like inserting a new item into a list.

### How It Works

**Without Filters:**
```
Before: Q1, Q2, Q3, Q4, Q5
Drag Q5 onto Q2
After:  Q1, Q5, Q2, Q3, Q4
```
Q5 is removed from position 5, inserted before Q2, and all others shift down.

**With Filters Active:**
When filters are applied, the shift operation inserts at the global position:

```
Full Order:      Q1(USA), Q2(UK), Q3(USA), Q4(UK), Q5(USA)
Filter: USA      Q1, Q3, Q5
Drag Q5 onto Q3
Result:          Q1(USA), Q2(UK), Q5(USA), Q3(USA), Q4(UK)
```

Q5 is removed and inserted before Q3 in the global order, UK questions shift accordingly.

### Features

1. **Drag and Drop Reordering**
   - Click and hold a question card
   - Drag it over another question
   - Release to insert before that question
   - Dashed orange border indicates insertion point

2. **Confirmation Dialog**
   - Appears when reordering with filters active
   - Explains the shift behavior
   - Warns about global impact on all questions

3. **Visual Indicators**
   - Same as Question Order page
   - Additional info box explaining shift behavior
   - Example scenario shown at top of page

4. **Save to API**
   - Sends formatted data to `/api/section-order`
   - Includes all sections with their questions in order
   - QuestionOrder is global across all sections
   - questionID uses stable QID format

### Data Output Format

```json
{
  "sections": [
    {
      "sectionID": "1",
      "questions": [
        { "questionID": "QID0001", "QuestionOrder": 1 },
        { "questionID": "QID0002", "QuestionOrder": 2 }
      ]
    },
    {
      "sectionID": "2",
      "questions": [
        { "questionID": "QID0003", "QuestionOrder": 3 },
        { "questionID": "QID0004", "QuestionOrder": 4 }
      ]
    }
  ]
}
```

**Key Differences from Question Order:**
- QuestionOrder continues globally (doesn't reset per section)
- questionID is stable (same question always has same QID)
- sectionID is numeric (1, 2, 3, etc.)

### Use Cases

- **List reorganization:** Moving items to new positions naturally
- **Priority changes:** Inserting urgent questions at specific positions
- **Structured ordering:** Building a sequence where position matters

---

## Database Structure

### Sections
```typescript
interface Section {
  id: string        // "1", "2", "3", etc.
  title: string     // "Customer Onboarding", "Risk Assessment", etc.
}
```

**Current Data:** 13 sections with various business topics

### Questions
```typescript
interface Question {
  id: string                    // "QID0001", "QID0002", etc.
  sectionId: string            // "1", "2", "3", etc.
  text: string                 // Question text
  reviewType: ReviewType       // "Due Diligence" | "Periodic Review"
  participantType: ParticipantType  // "XY" | "PQR"
  country: CountryType         // "USA" | "UK" | "India" | "Canada"
  status: QuestionStatus       // "APPROVED" | "REVIEW" | "CANCELLED"
  createdBy?: string           // User role who created
  createdAt?: string           // ISO timestamp
}
```

**Current Data:** 
- 5-10 questions per section (randomly generated)
- Total: ~78-130 questions
- Randomly distributed across 4 countries
- Mix of review types and participant types

### Section Question Order
```typescript
interface SectionQuestionOrder {
  sectionId: string
  questionId: string
  orderIndex: number    // 1-based position within section
}
```

This table maintains the actual order of questions within each section.

---

## Filtering System

Both pages support three types of filters that work together:

### 1. Review Type Filter
**Options:** Due Diligence, Periodic Review  
**Behavior:** Shows only questions matching the selected review type

### 2. Participant Type Filter
**Options:** XY, PQR  
**Behavior:** Shows only questions for the selected participant type

### 3. Country Filter
**Options:** USA, UK, India, Canada  
**Behavior:** Shows only questions for the selected country

### Combined Filtering

Filters work with AND logic:
```
Filter: ReviewType=Due Diligence AND Country=USA
Result: Only questions that are BOTH Due Diligence AND USA
```

### Important Notes

⚠️ **Reordering with active filters affects ALL questions, not just visible ones!**

When you reorder filtered questions:
1. The visible questions get repositioned as requested
2. Hidden questions shift to maintain relative order
3. A confirmation dialog appears to warn you
4. The "Final Order" box shows all questions with hidden ones grayed out

### Filter Display

- **Filtered Order Box (Blue):** Shows only matching questions
- **Final Order Box (Gray):** Shows all questions
  - Normal text: Matches current filters (visible)
  - Grayed italic text: Doesn't match filters (hidden but still in order)

---

## Save to API

Both pages include a "Save to API" button that formats and sends the current order.

### Question Order Page

**Button:** "Save to API" (with loading state)  
**Action:** Logs formatted data to console  
**Purpose:** Debug and verify order before API integration

**Console Output:**
```
=== POST Data (Question Order) ===
Data Object: {...}
JSON String: {...}
===================================
```

**Note:** Currently logs only. Update handler to send to actual endpoint.

### Section Order Page

**Button:** "Save to API" (blue, primary)  
**Endpoint:** `/api/section-order` (TODO: replace with actual)  
**Method:** POST  
**Purpose:** Persist order to backend

**Features:**
- Loading state ("Saving..." text)
- Success toast notification
- Error toast with console details
- Logs formatted data for debugging

**To Configure:**
Replace the placeholder endpoint in `handleSaveToAPI`:
```typescript
const response = await fetch('/api/section-order', {  // <- Update this URL
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formattedData)
})
```

---

## Common Features

### Reset Mock Data

**Button:** "Reset Mock Data" (secondary)  
**Action:** Regenerates database with fresh random data  
**Effect:**
- Clears all existing data
- Creates 13 sections
- Generates 5-10 random questions per section
- Randomly assigns countries, review types, participant types
- Creates random initial order
- Resets all filters and selections

**When to Use:**
- Testing with fresh data
- Resetting after experiments
- Generating new random scenarios

### Export JSON

**Button:** "Export JSON" (outlined)  
**Action:** Downloads complete database as JSON file  
**Filename:** `[page]-order-export-YYYY-MM-DD.json`  
**Content:**
```json
{
  "sections": [...],
  "questions": [...],
  "sectionQuestionOrder": [...]
}
```

**When to Use:**
- Backing up current state
- Sharing data with team
- Debugging order issues
- Migration/import to other systems

### Question Card Information

Each question card displays:

1. **Position Badge (Circle)**
   - Blue: Current position
   - Orange: Position changed from original

2. **Question Text**
   - Full text of the question

3. **Position Change (if applicable)**
   - "Previous: X → New: Y" in orange

4. **Metadata**
   - Review Type • Participant Type • Country

### Drag and Drop States

**Dragging:**
- Cursor changes to "grab"
- Card gets beige background (#fff3e0)

**Over Valid Target:**
- Question Order: Orange border (2px dashed)
- Section Order: Orange border (2px dashed)

**After Reorder:**
- Question gets gray background
- Gray border (2px solid)
- Indicates it has been moved

---

## Keyboard and Accessibility

### Current Limitations
- Drag and drop requires mouse/pointer
- No keyboard navigation for reordering
- Screen reader support limited

### Future Enhancements
- Arrow key reordering
- Tab navigation between cards
- ARIA labels for screen readers
- Keyboard shortcuts for common actions

---

## Technical Details

### State Management

Both pages use React useState hooks for:
- `filters`: Current filter selections
- `sections`: List of all sections
- `sectionData`: Processed data with ordered questions
- `draggedQuestion`: Currently dragged item
- `dragOverQuestion`: Current drop target
- `reorderedQuestions`: Set of modified question IDs
- `confirmDialogOpen`: Confirmation dialog state
- `pendingDrop`: Stores drag data during confirmation
- `saving`: Save operation state
- `snackbar`: Toast notification state

### Data Flow

1. **Load:** Fetch sections and questions from IndexedDB
2. **Filter:** Apply selected filters to question lists
3. **Display:** Render filtered questions in current order
4. **Drag:** Track source and target questions
5. **Confirm:** Show dialog if filters active
6. **Apply:** Run reorder algorithm (swap or shift)
7. **Save:** Persist new order to database
8. **Reload:** Refresh display with new order

### Algorithms

**applyFilteredReorder (Swap):**
```typescript
// Swaps positions of two items in filtered view
// Then applies swap to full order maintaining relative positions
```

**applyFilteredShift (Shift/Insert):**
```typescript
// Removes source from filtered list
// Inserts before target
// Maps back to full order with insertions
```

See `ORDERING_GUIDE.md` for detailed algorithm explanations.

---

## Troubleshooting

### Drag and Drop Not Working
- **Check:** Are you trying to drag between sections? Only intra-section dragging is supported.
- **Check:** Is the question card fully loaded? Wait for page to finish loading.
- **Check:** Try refreshing the page.

### Filters Not Showing Questions
- **Check:** Do any questions match your filter combination?
- **Solution:** Clear one or more filters to see more results.
- **Tip:** The count next to section title shows total visible questions.

### Confirmation Dialog Stuck
- **Action:** Click "Cancel" to close
- **Action:** Refresh page if needed
- **Check:** Make sure you're not in the middle of a drag operation

### Save Button Not Working
- **Check:** Console for error messages
- **Check:** Network tab in DevTools (Section Order page only)
- **Check:** API endpoint is accessible
- **Solution:** Update endpoint URL in code

### Order Not Persisting
- **Check:** Did you click "Save to API"?
- **Check:** IndexedDB is enabled in browser
- **Check:** No browser extensions blocking IndexedDB
- **Solution:** Try in incognito mode

### Questions Out of Order After Filter
- **Expected:** This is normal - filters show subset in their global order
- **Action:** Clear filters to see full sequence
- **Reference:** See "Final Order" box for complete order

---

## Best Practices

### When to Use Question Order (Swap)
✅ Fine-tuning specific question positions  
✅ Trading places between two questions  
✅ Making small adjustments  
✅ Working with mostly correct order

### When to Use Section Order (Shift)
✅ Major reorganization  
✅ Moving questions to new positions  
✅ Building order from scratch  
✅ Priority-based ordering

### Working with Filters
✅ Review "Final Order" before confirming  
✅ Clear filters to see full impact  
✅ Export JSON before major changes  
✅ Reset Mock Data to start fresh if needed

### Before Saving
✅ Verify order in "Final Order" box  
✅ Check console logs for data format  
✅ Test with small changes first  
✅ Export current state as backup

---

## API Integration Guide

### Question Order Page

Currently logs to console. To integrate:

1. Add endpoint URL
2. Implement fetch request
3. Add error handling
4. Add toast notifications

```typescript
// In handleSaveToAPI function
const response = await fetch('YOUR_API_ENDPOINT', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formattedData)
})
```

### Section Order Page

Already has API integration structure:

1. Update endpoint URL (line ~320)
2. Configure authentication if needed
3. Customize error handling if needed

```typescript
const response = await fetch('/api/section-order', { // <- Update URL
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Add auth headers here if needed
  },
  body: JSON.stringify(formattedData)
})
```

---

## Data Model Reference

### Question ID Format
- **Pattern:** `QID0001`, `QID0002`, `QID0003`, etc.
- **Padding:** 4 digits with leading zeros
- **Stability:** Same question always has same QID
- **Global:** Unique across all sections

### Section ID Format
- **Pattern:** `"1"`, `"2"`, `"3"`, etc.
- **Type:** Numeric string
- **Sequential:** Ordered from 1 to 13

### Question Order Values
- **Type:** Integer
- **Start:** 1 (not 0)
- **Scope Question Order:** Resets per section (1, 2, 3...)
- **Scope Section Order:** Global across all sections (1, 2, 3, 4, 5...)

---

## Summary

### Question Order (Swap)
- **Algorithm:** Swap positions
- **Use Case:** Fine-tuning, position trades
- **Output:** Per-section ordering
- **Best For:** Minor adjustments

### Section Order (Shift)
- **Algorithm:** Insert and shift
- **Use Case:** Reorganization, priority changes  
- **Output:** Global ordering
- **Best For:** Major changes

Both pages work with the same data and support:
- ✅ Drag and drop reordering
- ✅ Three-way filtering (Review Type, Participant Type, Country)
- ✅ Confirmation dialogs for filtered operations
- ✅ Visual indicators for changes
- ✅ Export and reset functionality
- ✅ Save to API integration

Choose the page that matches your ordering needs!
