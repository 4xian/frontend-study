import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { TaskFilterRootState } from '../../app/store'

export type TaskFilter = 'all' | 'open' | 'completed'
export type Task = {
  id: string
  title: string
  completed: boolean
}

type TasksState = {
  items: Task[]
  filter: TaskFilter
}

const initialState: TasksState = {
  items: [
    { id: 'task-1', title: '阅读 Feature 目录规范', completed: true },
    { id: 'task-2', title: '为筛选条件定义 action', completed: false },
    { id: 'task-3', title: '验证 selector 的派生结果', completed: false },
  ],
  filter: 'all',
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** 设置当前任务筛选条件。 */
    filterChanged: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload
    },
    /** 切换指定任务的完成状态。 */
    taskToggled: (state, action: PayloadAction<string>) => {
      const task = state.items.find((item) => item.id === action.payload)
      if (task) task.completed = !task.completed
    },
    /** 恢复任务和筛选条件的初始状态。 */
    tasksReset: () => initialState,
  },
})

/** 读取当前筛选条件。 */
export const selectTaskFilter = (state: TaskFilterRootState) => state.tasks.filter

/** 读取全部任务。 */
export const selectAllTasks = (state: TaskFilterRootState) => state.tasks.items

/** 根据当前筛选条件派生可见任务。 */
export const selectVisibleTasks = (state: TaskFilterRootState) => {
  const { items, filter } = state.tasks
  if (filter === 'open') return items.filter((task) => !task.completed)
  if (filter === 'completed') return items.filter((task) => task.completed)
  return items
}

/** 读取当前筛选结果中的任务数量。 */
export const selectVisibleTaskCount = (state: TaskFilterRootState) =>
  selectVisibleTasks(state).length

/** 读取全部任务中的未完成数量。 */
export const selectOpenTaskCount = (state: TaskFilterRootState) =>
  state.tasks.items.filter((task) => !task.completed).length

export const { filterChanged, taskToggled, tasksReset } = tasksSlice.actions

export default tasksSlice.reducer
