import { configureStore } from '@reduxjs/toolkit'
import questionsReducer from './questionsSlice'
import authReducer from './authSlice'
import questionOrderReducer from './questionOrderSlice'
import sectionOrderV2Reducer from './sectionOrderV2Slice'
import filterOptionsReducer from './filterOptionsSlice'

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    auth: authReducer,
    questionOrder: questionOrderReducer,
    sectionOrderV2: sectionOrderV2Reducer,
    filterOptions: filterOptionsReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
