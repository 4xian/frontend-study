import { configureStore, createSlice } from '@reduxjs/toolkit'

type CounterState = {
  value: number
}

const counterSlice = createSlice({
  name: 'typedHooksCounter',
  initialState: { value: 0 } satisfies CounterState,
  reducers: {
    incremented: (state) => {
      state.value += 1
    },
    decremented: (state) => {
      state.value -= 1
    },
    reset: (state) => {
      state.value = 0
    },
  },
})

/** 创建当前 Demo 使用的 Redux store。 */
export function createTypedHooksStore() {
  return configureStore({
    reducer: {
      counter: counterSlice.reducer,
    },
  })
}

export type AppStore = ReturnType<typeof createTypedHooksStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export { counterSlice }
