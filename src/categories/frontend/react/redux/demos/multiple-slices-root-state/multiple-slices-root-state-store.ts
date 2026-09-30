import { configureStore, createSlice } from '@reduxjs/toolkit'

type CounterState = {
  value: number
}

type PreferencesState = {
  theme: 'light' | 'dark'
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } satisfies CounterState,
  reducers: {
    incremented: (state) => {
      state.value += 1
    },
    reset: (state) => {
      state.value = 0
    },
  },
})

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: { theme: 'light' } as PreferencesState,
  reducers: {
    themeToggled: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    reset: (state) => {
      state.theme = 'light'
    },
  },
})

/** 创建由多个 slice reducer 组成的 Demo store。 */
export function createMultipleSlicesStore() {
  return configureStore({
    reducer: {
      counter: counterSlice.reducer,
      preferences: preferencesSlice.reducer,
    },
  })
}

export type AppStore = ReturnType<typeof createMultipleSlicesStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export { counterSlice, preferencesSlice }
