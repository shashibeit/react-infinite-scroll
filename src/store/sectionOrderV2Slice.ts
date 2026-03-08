import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  buildApiResponse,
  updateSectionOrder,
} from '../services/mockSectionOrderData'

// Interfaces
export interface Question {
  questionSeqNo: number
  questionId: string
  questionOrderId: string | number
  questionText?: string
  countries?: string[]
  participantTypes?: string[]
  reviewTypes?: string[]
}

export interface FilteredSection {
  sectionSeqNo: number
  sectionId: number
  sectionOrderId: string
  sectionName: string
  questions?: Question[]
}

export interface UpdateSectionOrderRequest {
  sections: FilteredSection[]
}

export interface UpdateSectionOrderResponse {
  status: 'SUCCESS' | 'ERROR'
  statusCode: string
  message: string
  data?: {
    sectionsUpdated: number
    questionsReordered: number
  }
}

export interface ApiResponse {
  status: 'SUCCESS' | 'ERROR'
  statusCode: string
  filteredSections: FilteredSection[]
  sections: FilteredSection[]
}

export interface FilterRequest {
  reviewTypes: string[]
  participantTypes: string[]
  countries: string[]
}

// Redux State
export interface SectionOrderV2State {
  sections: FilteredSection[]
  fullOrderSections: FilteredSection[]
  filters: {
    reviewTypes: string[]
    participantTypes: string[]
    countries: string[]
  }
  loading: boolean
  submitLoading: boolean
  error: string | null
}

const initialState: SectionOrderV2State = {
  sections: [],
  fullOrderSections: [],
  filters: {
    reviewTypes: [],
    participantTypes: [],
    countries: [],
  },
  loading: false,
  submitLoading: false,
  error: null,
}

// Async thunk to fetch filtered section order data
export const fetchSectionOrderData = createAsyncThunk<ApiResponse, FilterRequest>(
  'sectionOrderV2/fetchData',
  async (filters: FilterRequest, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching section order with filters:', filters)

      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/section-order/search', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(filters),
      // })
      // const data: ApiResponse = await response.json()

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

// Async thunk to submit updated section order
export const submitSectionOrderData = createAsyncThunk<UpdateSectionOrderResponse, UpdateSectionOrderRequest>(
  'sectionOrderV2/submit',
  async (request: UpdateSectionOrderRequest, { rejectWithValue }) => {
    try {
      console.log('📤 Submitting section order:', request)

      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/section-order/update', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(request),
      // })
      // const data: UpdateSectionOrderResponse = await response.json()

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

const sectionOrderV2Slice = createSlice({
  name: 'sectionOrderV2',
  initialState,
  reducers: {
    setSections: (state, action: PayloadAction<FilteredSection[]>) => {
      state.sections = action.payload
    },
    setFullOrderSections: (state, action: PayloadAction<FilteredSection[]>) => {
      state.fullOrderSections = action.payload
    },
    setFilters: (
      state,
      action: PayloadAction<{
        reviewTypes: string[]
        participantTypes: string[]
        countries: string[]
      }>
    ) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch section order data
    builder
      .addCase(fetchSectionOrderData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSectionOrderData.fulfilled, (state, action) => {
        state.loading = false
        state.sections =
          action.payload.filteredSections.length > 0
            ? action.payload.filteredSections
            : action.payload.sections
        state.fullOrderSections = action.payload.sections
      })
      .addCase(fetchSectionOrderData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Submit section order data
    builder
      .addCase(submitSectionOrderData.pending, (state) => {
        state.submitLoading = true
        state.error = null
      })
      .addCase(submitSectionOrderData.fulfilled, (state) => {
        state.submitLoading = false
      })
      .addCase(submitSectionOrderData.rejected, (state, action) => {
        state.submitLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSections, setFullOrderSections, setFilters, clearError } =
  sectionOrderV2Slice.actions

export default sectionOrderV2Slice.reducer
