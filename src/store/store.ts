import { configureStore } from '@reduxjs/toolkit'
import questionsReducer from './questionsSlice'
import authReducer from './authSlice'
import questionOrderReducer from './questionOrderSlice'

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    auth: authReducer,
    questionOrder: questionOrderReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
