import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import { useCallback } from 'react'
import { 
  fetchQuestionOrder, 
  saveQuestionOrder, 
  resetQuestionOrderData,
  setFilters,
  clearFilters,
  updateSectionQuestions,
  reorderFilteredQuestions,
  markAsSaved,
  clearError,
  QuestionOrderItem,
  QuestionFilters
} from './questionOrderSlice'

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T,>(selector: (state: RootState) => T): T => useSelector(selector)

// Custom hook for question order management
export const useQuestionOrder = () => {
  const dispatch = useAppDispatch()
  
  const data = useAppSelector(state => state.questionOrder.data)
  const filters = useAppSelector(state => state.questionOrder.filters)
  const loading = useAppSelector(state => state.questionOrder.loading)
  const error = useAppSelector(state => state.questionOrder.error)
  const hasChanges = useAppSelector(state => state.questionOrder.hasChanges)
  
  // Get sections (filtered or all based on whether filters are active)
  const sections = data ? (data.filteredSections.length > 0 ? data.filteredSections : data.sections) : []
  const allSections = data?.sections || []
  const filteredSections = data?.filteredSections || []
  const isFiltered = (data?.filteredSections.length || 0) > 0
  
  // Fetch data with optional filters
  const loadData = useCallback((filters: QuestionFilters = {}) => {
    dispatch(fetchQuestionOrder(filters))
  }, [dispatch])
  
  // Update filters and refetch
  const updateFilters = useCallback((newFilters: QuestionFilters) => {
    dispatch(setFilters(newFilters))
    dispatch(fetchQuestionOrder(newFilters))
  }, [dispatch])
  
  // Clear filters and refetch all data
  const resetFilters = useCallback(() => {
    dispatch(clearFilters())
    dispatch(fetchQuestionOrder({}))
  }, [dispatch])
  
  // Save current order to backend
  const saveOrder = useCallback(() => {
    if (data) {
      dispatch(saveQuestionOrder({ sections: data.sections }))
    }
  }, [dispatch, data])
  
  // Reset all data (regenerate mock data)
  const resetData = useCallback(() => {
    dispatch(resetQuestionOrderData())
  }, [dispatch])
  
  // Update questions in a section
  const updateQuestions = useCallback((sectionID: number, questions: QuestionOrderItem[]) => {
    dispatch(updateSectionQuestions({ sectionID, questions }))
  }, [dispatch])
  
  // Reorder questions in filtered view
  const reorderQuestions = useCallback((sectionID: number, sourceQuestionID: string, targetQuestionID: string) => {
    dispatch(reorderFilteredQuestions({ sectionID, sourceQuestionID, targetQuestionID }))
  }, [dispatch])
  
  // Mark as saved
  const markSaved = useCallback(() => {
    dispatch(markAsSaved())
  }, [dispatch])
  
  // Clear error message
  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])
  
  return {
    // State
    data,
    sections,
    allSections,
    filteredSections,
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
    reorderQuestions,
    markSaved,
    dismissError
  }
}
