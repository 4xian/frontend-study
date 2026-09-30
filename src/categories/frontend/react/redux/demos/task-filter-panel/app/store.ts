import { configureStore } from '@reduxjs/toolkit'

import tasksReducer from '../features/tasks/tasksSlice'

/** 创建任务筛选面板使用的 Redux store。 */
export function createTaskFilterStore() {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
  })
}

export type TaskFilterStore = ReturnType<typeof createTaskFilterStore>
export type TaskFilterRootState = ReturnType<TaskFilterStore['getState']>
export type TaskFilterDispatch = TaskFilterStore['dispatch']
