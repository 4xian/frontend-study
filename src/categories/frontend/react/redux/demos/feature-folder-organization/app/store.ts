import { configureStore } from '@reduxjs/toolkit'

import tasksReducer from '../features/tasks/tasksSlice'

/** 创建按 Feature 组织 reducer 的 Redux store。 */
export function createFeatureFolderStore() {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
  })
}

export type AppStore = ReturnType<typeof createFeatureFolderStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
