import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface UserRecord {
  id: number
  questionText: string
  status: string
  reviewType: string
  participantType: string
  section: string
  countries: string
}

interface QuestionsState {
  rows: UserRecord[]
  offset: number
  loading: boolean
  hasMore: boolean
  searchText: string
  debouncedSearchText: string
  sortField: string
  sortOrder: 'asc' | 'desc'
  totalRecords: number
  error: string | null
}

const initialState: QuestionsState = {
  rows: [],
  offset: 0,
  loading: false,
  hasMore: true,
  searchText: '',
  debouncedSearchText: '',
  sortField: '',
  sortOrder: 'asc',
  totalRecords: 0,
  error: null
}

interface FetchQuestionsParams {
  offset: number
  searchText: string
  sortField: string
  sortOrder: 'asc' | 'desc'
  append?: boolean
}

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (params: FetchQuestionsParams, { rejectWithValue }) => {
    try {
      const { offset, searchText, sortField, sortOrder } = params
      const response = await fetch(
        `/api/getrecords?searchText=${encodeURIComponent(searchText)}&offset=${offset}&sortField=${sortField}&sortOrder=${sortOrder}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const data = await response.json()
      return {
        records: data.records || data || [],
        total: data.total || 0,
        append: params.append || false,
        offset
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload
    },
    setDebouncedSearchText: (state, action: PayloadAction<string>) => {
      state.debouncedSearchText = action.payload
    },
    setSortField: (state, action: PayloadAction<string>) => {
      state.sortField = action.payload
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload
    },
    resetQuestions: (state) => {
      state.rows = []
      state.offset = 0
      state.hasMore = true
    },
    incrementOffset: (state, action: PayloadAction<number>) => {
      state.offset += action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false
        const { records, append, offset } = action.payload
        
        if (append) {
          state.rows = [...state.rows, ...records]
        } else {
          state.rows = records
        }
        
        state.offset = offset
        state.hasMore = records.length === 100
        state.totalRecords = state.rows.length
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setSearchText,
  setDebouncedSearchText,
  setSortField,
  setSortOrder,
  resetQuestions,
  incrementOffset
} = questionsSlice.actions

export default questionsSlice.reducer
