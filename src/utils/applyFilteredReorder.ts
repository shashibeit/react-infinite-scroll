/**
 * Applies filtered reorder by swapping the dragged item with the target item.
 * 
 * Example:
 * - Full order: [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * - Filtered (displayed): [1, 3, 4, 5]
 * - User drags 5 to position of 1
 * - New filtered order: [5, 1, 3, 4]
 * - Result: [5, 2, 3, 4, 1, 6, 7, 8, 9]
 *   - Only 1 and 5 swapped positions, everything else stayed the same
 */
export const applyFilteredReorder = (
  fullOrder: string[],
  filteredIds: string[],
  newFilteredOrder: string[]
): string[] => {
  if (filteredIds.length !== newFilteredOrder.length || filteredIds.length === 0) {
    return fullOrder
  }

  // Find the item that moved the most (the dragged item)
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

  // If nothing moved, return as-is
  if (!draggedItem || oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return fullOrder
  }

  // Find the target item (what was at the new position before the drag)
  const targetItem = filteredIds[newIndex]

  // Swap dragged and target in the full order
  const result = [...fullOrder]
  const draggedPosInFull = fullOrder.indexOf(draggedItem)
  const targetPosInFull = fullOrder.indexOf(targetItem)

  if (draggedPosInFull !== -1 && targetPosInFull !== -1) {
    result[draggedPosInFull] = targetItem
    result[targetPosInFull] = draggedItem
  }

  return result
}
