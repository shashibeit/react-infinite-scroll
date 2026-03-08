import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFilterOptions, FilterOptionsResponse, FilterOption } from '../services/mockSectionOrderData'

// Types
export interface FilterOptionsState {
  reviewTypes: FilterOption[]
  participantTypes: FilterOption[]
  countries: FilterOption[]
  loading: boolean
  error: string | null
}

const initialState: FilterOptionsState = {
  reviewTypes: [],
  participantTypes: [],
  countries: [],
  loading: false,
  error: null,
}

// Async thunk to fetch filter options
export const fetchFilterOptions = createAsyncThunk<FilterOptionsResponse>(
  'filterOptions/fetchOptions',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching filter options from Redux')

      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/filter-options', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // })
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`)
      // }
      // const data: FilterOptionsResponse = await response.json()

      // FOR NOW: Using mock API
      const data = getFilterOptions()

      console.log('✅ Filter options received:', data)

      return data
    } catch (error: any) {
      console.error('❌ Failed to fetch filter options:', error)
      return rejectWithValue(error.message || 'Failed to fetch filter options')
    }
  }
)

const filterOptionsSlice = createSlice({
  name: 'filterOptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilterOptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.loading = false
        state.reviewTypes = action.payload.reviewTypes
        state.participantTypes = action.payload.participantTypes
        state.countries = action.payload.countries
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default filterOptionsSlice.reducer
