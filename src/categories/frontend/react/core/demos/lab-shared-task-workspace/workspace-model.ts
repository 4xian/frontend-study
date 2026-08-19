export const TASK_OWNERS = ['product', 'frontend', 'qa'] as const
export const TASK_STATUSES = ['todo', 'doing', 'done'] as const
export const TASK_FILTERS = ['all', ...TASK_STATUSES] as const

export type TaskOwner = (typeof TASK_OWNERS)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskFilter = (typeof TASK_FILTERS)[number]

export type WorkspaceTask = {
  readonly id: number
  readonly title: string
  readonly owner: TaskOwner
  readonly status: TaskStatus
}

export type WorkspaceState = {
  readonly tasks: readonly WorkspaceTask[]
  readonly filter: TaskFilter
  readonly selectedTaskId: number | null
  readonly nextTaskId: number
}

export type WorkspaceAction =
  | { type: 'task/added'; title: string; owner: TaskOwner }
  | { type: 'task/statusChanged'; taskId: number; status: TaskStatus }
  | { type: 'task/selected'; taskId: number }
  | { type: 'task/deleted'; taskId: number }
  | { type: 'filter/changed'; filter: TaskFilter }
  | { type: 'workspace/reset' }

export const TASK_OWNER_LABELS: Record<TaskOwner, string> = {
  product: '产品',
  frontend: '前端',
  qa: '测试',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

export const TASK_FILTER_LABELS: Record<TaskFilter, string> = {
  all: '全部',
  ...TASK_STATUS_LABELS,
}

const initialTasks: readonly WorkspaceTask[] = [
  { id: 1, title: '确认任务字段', owner: 'product', status: 'done' },
  { id: 2, title: '拆分 Provider 模块', owner: 'frontend', status: 'doing' },
  { id: 3, title: '核对状态边界', owner: 'qa', status: 'todo' },
]

/** 创建互不修改的工作区初始 State。 */
export function createInitialWorkspaceState(): WorkspaceState {
  return {
    tasks: [...initialTasks],
    filter: 'all',
    selectedTaskId: 2,
    nextTaskId: 4,
  }
}

/** 根据工作区 Action 纯计算下一份共享 State。 */
export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'task/added':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: state.nextTaskId,
            title: action.title,
            owner: action.owner,
            status: 'todo',
          },
        ],
        nextTaskId: state.nextTaskId + 1,
      }
    case 'task/statusChanged': {
      const currentTask = state.tasks.find((task) => task.id === action.taskId)
      if (!currentTask || currentTask.status === action.status) return state

      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, status: action.status } : task,
        ),
      }
    }
    case 'task/selected':
      if (state.selectedTaskId === action.taskId) return state
      return state.tasks.some((task) => task.id === action.taskId)
        ? { ...state, selectedTaskId: action.taskId }
        : state
    case 'task/deleted': {
      if (!state.tasks.some((task) => task.id === action.taskId)) return state

      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
        selectedTaskId: state.selectedTaskId === action.taskId ? null : state.selectedTaskId,
      }
    }
    case 'filter/changed':
      return state.filter === action.filter ? state : { ...state, filter: action.filter }
    case 'workspace/reset':
      return createInitialWorkspaceState()
    default: {
      const unhandledAction: never = action
      return unhandledAction
    }
  }
}
