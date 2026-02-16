# Question Ordering Guide

This application provides two different methods for reordering questions: **Swap** and **Shift**. Each method is available on a separate tab under Question Bank.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Question Ordering Tab (Swap Behavior)](#question-ordering-tab-swap-behavior)
- [Section Order Tab (Shift Behavior)](#section-order-tab-shift-behavior)
- [Filtering Behavior](#filtering-behavior)
- [Visual Examples](#visual-examples)

---

## Overview

Both tabs allow drag-and-drop reordering of questions within sections, but they use different logic:

| Tab | Behavior | Use Case |
|-----|----------|----------|
| **Question Ordering** | **Swap** - Exchanges positions | When you want to directly swap two questions |
| **Section Order** | **Shift/Insert** - Inserts at position | When you want to move a question and shift others |

---

## Question Ordering Tab (Swap Behavior)

### How It Works

When you drag a question onto another question, they **swap positions**. All other questions remain in their original positions.

### Example Without Filters

**Initial Order:**
```
1. What is your name?
2. What is your age?
3. What is your address?
4. What is your phone?
5. What is your email?
```

**Action:** Drag question 2 onto question 4

**Result:**
```
1. What is your name?
2. What is your phone?      ← Was at position 4
3. What is your address?     (No change)
4. What is your age?         ← Was at position 2
5. What is your email?       (No change)
```

**Explanation:** Questions 2 and 4 swapped positions. Questions 1, 3, and 5 stayed in place.

### Example With Filters

**Full Order:**
```
1. Question A (Due Diligence, XY)
2. Question B (Periodic Review, PQR)
3. Question C (Due Diligence, XY)
4. Question D (Periodic Review, PQR)
5. Question E (Due Diligence, XY)
6. Question F (Periodic Review, PQR)
```

**Filter Applied:** Review Type = "Due Diligence"

**Filtered View:**
```
1. Question A
3. Question C
5. Question E
```

**Action:** Drag Question E (position 5 in full order) onto Question A (position 1 in full order)

**Result - Full Order:**
```
1. Question E ← Swapped with Question A
2. Question B (No change - was hidden by filter)
3. Question C (No change)
4. Question D (No change - was hidden by filter)
5. Question A ← Swapped with Question E
6. Question F (No change - was hidden by filter)
```

**Filtered View After Swap:**
```
1. Question E
3. Question C
5. Question A
```

**Key Point:** Only the two dragged items swap positions. Hidden questions (B, D, F) maintain their positions.

---

## Section Order Tab (Shift Behavior)

### How It Works

When you drag a question onto another question, the dragged question is **inserted before** the target. All other questions **shift** to make room.

### Example Without Filters

**Initial Order:**
```
1. What is your name?
2. What is your age?
3. What is your address?
4. What is your phone?
5. What is your email?
```

**Action:** Drag question 5 onto question 2

**Result:**
```
1. What is your name?        (No change)
2. What is your email?        ← Was at position 5, inserted here
3. What is your age?          ← Shifted down (was 2)
4. What is your address?      ← Shifted down (was 3)
5. What is your phone?        ← Shifted down (was 4)
```

**Explanation:** Question 5 was removed and inserted at position 2. Questions 2-4 all shifted down by one position.

### Example With Filters

**Full Order:**
```
1. Question A (Due Diligence, XY)
2. Question B (Periodic Review, PQR)
3. Question C (Due Diligence, XY)
4. Question D (Periodic Review, PQR)
5. Question E (Due Diligence, XY)
6. Question F (Periodic Review, PQR)
7. Question G (Due Diligence, XY)
8. Question H (Periodic Review, PQR)
```

**Filter Applied:** Review Type = "Due Diligence"

**Filtered View:**
```
4. Question A (position 1 in full order)
7. Question C (position 3 in full order)
8. Question E (position 5 in full order)
9. Question G (position 7 in full order)
```

**Action:** Drag Question G (position 7 in full order) onto Question A (position 1 in full order)

**Step-by-Step Transformation:**

1. **Remove Question G from full order:**
   ```
   1. Question A
   2. Question B
   3. Question C
   4. Question D
   5. Question E
   6. Question F
   (7. Question G - REMOVED)
   7. Question H ← Shifted up
   ```

2. **Find Question A (now at position 1)**

3. **Insert Question G before Question A:**
   ```
   1. Question G ← INSERTED HERE
   2. Question A ← Shifted down
   3. Question B ← Shifted down
   4. Question C ← Shifted down
   5. Question D ← Shifted down
   6. Question E ← Shifted down
   7. Question F ← Shifted down
   8. Question H (No further change)
   ```

**Filtered View After Shift:**
```
1. Question G ← Now at position 1
2. Question A ← Shifted to position 2
4. Question C ← Shifted to position 4
6. Question E ← Shifted to position 6
```

**Key Point:** The dragged question is removed from its position and inserted at the target position. All questions between the source and target positions shift to accommodate the change, **including hidden questions**.

---

## Filtering Behavior

### Confirmation Dialog

When you reorder questions while filters are active, a confirmation dialog appears to warn you that:

- **Question Ordering Tab:** The swap will affect the full order, not just visible questions
- **Section Order Tab:** The shift will affect the full order and all questions will shift accordingly

### Why This Matters

Hidden questions (filtered out) are still part of the full order. When you reorder visible questions:

- **Swap:** Only swaps the two specific questions you dragged
- **Shift:** Shifts ALL questions in the full order, including hidden ones

### Example Scenario

**Full Order:** [1, 2, 3, 4, 5, 6, 7, 8]

**Filter:** Show only even numbers

**Visible:** [2, 4, 6, 8]

**Action:** Drag 8 to position of 2

**Swap Result:** [1, **8**, 3, 4, 5, 6, 7, **2**]
- Only 2 and 8 swapped
- Odd numbers unchanged

**Shift Result:** [1, **8**, 2, 3, 4, 5, 6, 7]
- 8 removed from position 8
- 8 inserted at position 2
- Everything from position 2-7 shifted right by one

---

## Visual Examples

### Swap Behavior (Question Ordering Tab)

```
Before:  [A] [B] [C] [D] [E]
Action:  Drag E onto B
After:   [A] [E] [C] [D] [B]

Only B and E swapped positions
```

### Shift Behavior (Section Order Tab)

```
Before:  [A] [B] [C] [D] [E]
Action:  Drag E onto B
After:   [A] [E] [B] [C] [D]

E was removed and inserted before B
B, C, and D all shifted right by one position
```

### With Filters - Swap

```
Full:     [A₁] [B₂] [C₁] [D₂] [E₁] [F₂]
Filter:   Type = 1
Visible:  [A₁] [C₁] [E₁]

Action:   Drag E₁ onto A₁

Result:   [E₁] [B₂] [C₁] [D₂] [A₁] [F₂]
          └──────────────────┘
          Only A₁ and E₁ swapped
          B₂, D₂, F₂ stayed in place
```

### With Filters - Shift

```
Full:     [A₁] [B₂] [C₁] [D₂] [E₁] [F₂]
Filter:   Type = 1
Visible:  [A₁] [C₁] [E₁]

Action:   Drag E₁ onto A₁

Result:   [E₁] [A₁] [B₂] [C₁] [D₂] [F₂]
          ──────────────────────────┘
          E₁ inserted at position 1
          Everything from A₁ to F₂ shifted right
```

---

## When to Use Each Method

### Use Question Ordering (Swap) When:
- ✅ You want to directly exchange two questions
- ✅ You want minimal impact on other questions
- ✅ You're fine-tuning specific positions
- ✅ You want hidden questions to stay in their positions

### Use Section Order (Shift) When:
- ✅ You want to move a question to a specific location
- ✅ You want a natural "insert" behavior
- ✅ You're reorganizing larger sections
- ✅ You expect questions to shift like a list

---

## Technical Implementation

### Question Ordering - Swap Logic
```typescript
// Swap positions of two items in full order
fullOrder[draggedPos] = targetItem
fullOrder[targetPos] = draggedItem
```

### Section Order - Shift Logic
```typescript
// Remove dragged item
result.splice(draggedPos, 1)

// Find new position of target after removal
newTargetPos = result.indexOf(targetItem)

// Insert dragged item before target
result.splice(newTargetPos, 0, draggedItem)
```

---

## Summary

| Feature | Question Ordering | Section Order |
|---------|------------------|---------------|
| **Algorithm** | Swap | Shift/Insert |
| **Items Affected** | 2 items | All items between source and target |
| **Hidden Items** | Stay in place | Shift with visible items |
| **Best For** | Direct exchanges | Natural repositioning |
| **Visual Metaphor** | "Trade places" | "Cut and paste" |

Both methods persist changes to IndexedDB and maintain consistency across filtered and unfiltered views.

---

**Need Help?** Check the example boxes at the top of each tab for quick reference!
