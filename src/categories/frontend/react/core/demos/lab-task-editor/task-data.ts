export type Task = {
  readonly id: number
  readonly title: string
  readonly completed: boolean
}

export type TaskFilter = 'all' | 'active' | 'completed'

export const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: '拆分任务组件', completed: false },
  { id: 2, title: '实现添加与编辑', completed: true },
  { id: 3, title: '核对不可变更新', completed: false },
]
