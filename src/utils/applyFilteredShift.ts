/**
 * Applies filtered reorder by shifting/inserting the dragged item at the target position.
 * 
 * Example:
 * - Full order: [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * - Filtered (displayed): [4, 7, 8]
 * - User drags 8 to position of 4
 * - New filtered order: [8, 4, 7]
 * - Result: [1, 2, 3, 8, 4, 5, 6, 7, 9]
 *   - 8 was removed from its original position and inserted before 4
 *   - Items between shift accordingly
 */
export const applyFilteredShift = (
  fullOrder: string[],
  filteredIds: string[],
  newFilteredOrder: string[]
): string[] => {
  if (filteredIds.length !== newFilteredOrder.length || filteredIds.length === 0) {
    return fullOrder
  }

  // Find the item that moved (the dragged item)
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

  // If nothing moved, return as-is
  if (!draggedItem || oldFilteredIndex === newFilteredIndex) {
    return fullOrder
  }

  // Get the target item (the item at the new position in the original filtered order)
  const targetItem = filteredIds[newFilteredIndex]

  // Find positions in full order
  const draggedPosInFull = fullOrder.indexOf(draggedItem)
  const targetPosInFull = fullOrder.indexOf(targetItem)

  if (draggedPosInFull === -1 || targetPosInFull === -1) {
    return fullOrder
  }

  // Create new full order by removing dragged item and inserting at target position
  const result = [...fullOrder]
  
  // Remove the dragged item first
  result.splice(draggedPosInFull, 1)
  
  // Find where the target item is NOW (after removal)
  const newTargetPos = result.indexOf(targetItem)
  
  if (newTargetPos === -1) {
    return fullOrder // Safety check
  }
  
  // Insert dragged item BEFORE the target (at target's current position)
  result.splice(newTargetPos, 0, draggedItem)

  return result
}
