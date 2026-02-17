import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { QuestionFilters } from '../services/mockApi'

// Types matching backend API response
export interface QuestionOrderItem {
  questionSeqNo: number
  questionID: string
  questionText: string
  reviewType?: string
  participantType?: string
  country?: string
  status?: string
}

export interface SectionOrderItem {
  sectionSeqNo: number
  sectionID: number
  sectionName: string
  questions: QuestionOrderItem[]
}

export interface QuestionOrderResponse {
  status: 'SUCCESS' | 'ERROR'
  filteredSections: SectionOrderItem[]
  sections: SectionOrderItem[]
  message?: string
}

interface QuestionOrderState {
  data: QuestionOrderResponse | null
  filters: QuestionFilters
  loading: boolean
  error: string | null
  hasChanges: boolean
}

const initialState: QuestionOrderState = {
  data: null,
  filters: {},
  loading: false,
  error: null,
  hasChanges: false
}

// Async thunk to fetch question order data from API
export const fetchQuestionOrder = createAsyncThunk(
  'questionOrder/fetch',
  async (filters: QuestionFilters, { rejectWithValue }) => {
    try {
      // Build query params
      const params = new URLSearchParams()
      if (filters.reviewType) params.append('reviewType', filters.reviewType)
      if (filters.participantType) params.append('participantType', filters.participantType)
      if (filters.country) params.append('country', filters.country)

      const response = await fetch(`/api/question-order?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionOrderResponse = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch question order')
    }
  }
)

// Async thunk to save question order to API
export const saveQuestionOrder = createAsyncThunk(
  'questionOrder/save',
  async (data: { sections: SectionOrderItem[] }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/question-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save question order')
    }
  }
)

// Async thunk to reset data
export const resetQuestionOrderData = createAsyncThunk(
  'questionOrder/reset',
  async (_, { rejectWithValue }) => {
    try {
      const resetResponse = await fetch('/api/question-order/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!resetResponse.ok) {
        throw new Error(`HTTP error! status: ${resetResponse.status}`)
      }

      // Fetch fresh data after reset
      const dataResponse = await fetch('/api/question-order')
      
      if (!dataResponse.ok) {
        throw new Error(`HTTP error! status: ${dataResponse.status}`)
      }
      
      const data: QuestionOrderResponse = await dataResponse.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset data')
    }
  }
)

const questionOrderSlice = createSlice({
  name: 'questionOrder',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<QuestionFilters>) => {
      state.filters = action.payload
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {}
    },
    
    // Update question order within a section (for local state before saving)
    updateSectionQuestions: (state, action: PayloadAction<{ sectionID: number; questions: QuestionOrderItem[] }>) => {
      if (state.data) {
        const { sectionID, questions } = action.payload
        
        // Update in sections array
        const sectionIndex = state.data.sections.findIndex(s => s.sectionID === sectionID)
        if (sectionIndex !== -1) {
          state.data.sections[sectionIndex].questions = questions
          state.hasChanges = true
        }
        
        // If filters are active, also update in filteredSections
        if (state.data.filteredSections.length > 0) {
          const filteredIndex = state.data.filteredSections.findIndex(s => s.sectionID === sectionID)
          if (filteredIndex !== -1) {
            // Only update questions that match current filters
            const filteredQuestions = questions.filter(q => {
              if (state.filters.reviewType && q.reviewType !== state.filters.reviewType) return false
              if (state.filters.participantType && q.participantType !== state.filters.participantType) return false
              if (state.filters.country && q.country !== state.filters.country) return false
              return true
            })
            state.data.filteredSections[filteredIndex].questions = filteredQuestions
          }
        }
      }
    },
    
    // Reorder questions in filtered view
    reorderFilteredQuestions: (state, action: PayloadAction<{ 
      sectionID: number
      sourceQuestionID: string
      targetQuestionID: string 
    }>) => {
      if (state.data && state.data.filteredSections.length > 0) {
        const { sectionID, sourceQuestionID, targetQuestionID } = action.payload
        const sectionIndex = state.data.filteredSections.findIndex(s => s.sectionID === sectionID)
        
        if (sectionIndex !== -1) {
          const questions = [...state.data.filteredSections[sectionIndex].questions]
          const sourceIndex = questions.findIndex(q => q.questionID === sourceQuestionID)
          const targetIndex = questions.findIndex(q => q.questionID === targetQuestionID)
          
          if (sourceIndex !== -1 && targetIndex !== -1) {
            // Swap
            const [removed] = questions.splice(sourceIndex, 1)
            questions.splice(targetIndex, 0, removed)
            
            // Update sequence numbers
            questions.forEach((q, idx) => {
              q.questionSeqNo = idx + 1
            })
            
            state.data.filteredSections[sectionIndex].questions = questions
            state.hasChanges = true
          }
        }
      }
    },
    
    // Mark as saved (no changes)
    markAsSaved: (state) => {
      state.hasChanges = false
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch question order
      .addCase(fetchQuestionOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuestionOrder.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.hasChanges = false
      })
      .addCase(fetchQuestionOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Save question order
      .addCase(saveQuestionOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveQuestionOrder.fulfilled, (state) => {
        state.loading = false
        state.hasChanges = false
      })
      .addCase(saveQuestionOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Reset data
      .addCase(resetQuestionOrderData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetQuestionOrderData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.filters = {}
        state.hasChanges = false
      })
      .addCase(resetQuestionOrderData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setFilters,
  clearFilters,
  updateSectionQuestions,
  reorderFilteredQuestions,
  markAsSaved,
  clearError
} = questionOrderSlice.actions

export default questionOrderSlice.reducer
