import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '../../app/store'

type Task = {
  id: string
  title: string
  completed: boolean
}

type TasksState = {
  items: Task[]
}

const initialState: TasksState = {
  items: [
    { id: 'task-1', title: '确认 Feature 边界', completed: true },
    { id: 'task-2', title: '集中维护 slice 逻辑', completed: false },
    { id: 'task-3', title: '从组件派发业务 action', completed: false },
  ],
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** 切换指定任务的完成状态。 */
    taskToggled: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.completed = !task.completed
    },
    /** 恢复任务 Feature 的初始状态。 */
    tasksReset: () => initialState,
  },
})

/** 读取任务 Feature 的任务列表。 */
export const selectTasks = (state: RootState) => state.tasks.items

/** 读取任务 Feature 的未完成数量。 */
export const selectOpenTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => !task.completed).length

export const { taskToggled, tasksReset } = tasksSlice.actions

export default tasksSlice.reducer
