import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './crud-management-workspace-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  tasks: TaskItem[]
  nextId: number
  listCount: number
  detailCounts: Record<string, number>
  onListCountChange?: (count: number) => void
  onDetailCountsChange?: (counts: Record<string, number>) => void
}

const createdTitle = '核对创建任务'
const editedTitle = '核对保存任务'

const taskStore: TaskStore = {
  tasks: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
  nextId: 2,
  listCount: 0,
  detailCounts: {},
}

/** 等待固定时长，让读取和写入能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 读取任务列表，并统计真实列表请求。 */
async function loadTasks(): Promise<TaskItem[]> {
  queueMicrotask(() => {
    taskStore.listCount += 1
    taskStore.onListCountChange?.(taskStore.listCount)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskStore.tasks))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 按编号读取任务详情，并统计这一条的真实请求。 */
async function loadTaskDetail(id: string): Promise<TaskItem> {
  queueMicrotask(() => {
    taskStore.detailCounts = {
      ...taskStore.detailCounts,
      [id]: (taskStore.detailCounts[id] ?? 0) + 1,
    }
    taskStore.onDetailCountsChange?.(taskStore.detailCounts)
  })
  await waitForQuery(1400)
  const task = taskStore.tasks.find((item) => item.id === id)
  if (!task) {
    throw new Error('读取失败：HTTP 404')
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(task))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 追加一条林晓的新任务。 */
async function createTask(): Promise<TaskItem> {
  await waitForQuery(1400)
  const created: TaskItem = {
    id: `t-${taskStore.nextId}`,
    title: createdTitle,
    owner: '林晓',
  }
  taskStore.nextId += 1
  taskStore.tasks = [...taskStore.tasks, created]
  return created
}

/** 把指定任务标题改成核对保存任务。 */
async function editTask(id: string): Promise<TaskItem> {
  await waitForQuery(1400)
  const current = taskStore.tasks.find((item) => item.id === id)
  if (!current) {
    throw new Error('保存失败：HTTP 404')
  }
  const updated: TaskItem = {
    ...current,
    title: editedTitle,
  }
  taskStore.tasks = taskStore.tasks.map((item) => (item.id === id ? updated : item))
  return updated
}

/** 按编号删除任务。 */
async function deleteTask(id: string): Promise<{ id: string }> {
  await waitForQuery(1400)
  const exists = taskStore.tasks.some((item) => item.id === id)
  if (!exists) {
    throw new Error('删除失败：HTTP 404')
  }
  taskStore.tasks = taskStore.tasks.filter((item) => item.id !== id)
  return { id }
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'] as const,
  queryFn: loadTasks,
  staleTime: Infinity,
  retry: false,
})

/** 把任务编号写进详情 queryKey。 */
function taskDetailOptions(id: string) {
  return queryOptions({
    queryKey: ['tasks', 'detail', id] as const,
    queryFn: () => loadTaskDetail(id),
    staleTime: Infinity,
    retry: false,
  })
}

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

const editTaskOptions = mutationOptions({
  mutationFn: editTask,
  retry: false,
})

const deleteTaskOptions = mutationOptions({
  mutationFn: deleteTask,
  retry: false,
})

/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 订阅当前选中任务的详情。 */
function useTaskDetail(id: string) {
  return useQuery(taskDetailOptions(id))
}

/** 创建后只作废列表这条查询，不连带详情。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}

/** 保存后用响应对象写回详情缓存。 */
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskDetailOptions(data.id).queryKey, data)
    },
  })
}

/** 删除后只作废列表这条查询。 */
function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...deleteTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskListOptions.queryKey,
        exact: true,
      })
    },
  })
}

type TaskDetailPaneProps = {
  selectedId: string
  busy: boolean
  onTitleChange: (title: string) => void
}

/** 有选中编号时才订阅详情，避免空字符串进入 queryKey。 */
function TaskDetailPane({ selectedId, busy, onTitleChange }: TaskDetailPaneProps): ReactElement {
  const detailQuery = useTaskDetail(selectedId)
  const detailTask = detailQuery.data

  useEffect(() => {
    if (detailTask?.title) {
      onTitleChange(detailTask.title)
    }
  }, [detailTask?.title, onTitleChange])

  if (detailQuery.isPending) {
    return (
      <p className="crud-workspace-message" role="status">
        正在读取详情。
      </p>
    )
  }

  if (detailQuery.isSuccess && detailTask) {
    return (
      <ul data-testid="crud-workspace-detail-list">
        <li>
          {detailTask.title} / {detailTask.owner}
        </li>
      </ul>
    )
  }

  if (busy) {
    return (
      <p className="crud-workspace-message" role="status">
        正在写入详情。
      </p>
    )
  }

  return (
    <p className="crud-workspace-message" role="status">
      详情不可用。
    </p>
  )
}

/** 观察 CRUD 工作区：创建和删除作废列表，保存只写详情。 */
function CrudManagementWorkspacePanel(): ReactElement {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState('t-1')
  const [listCount, setListCount] = useState(taskStore.listCount)
  const [detailCounts, setDetailCounts] = useState(taskStore.detailCounts)
  const [detailTitle, setDetailTitle] = useState('现有任务')
  const listQuery = useTaskList()
  const createMutation = useCreateTask()
  const editMutation = useEditTask()
  const deleteMutation = useDeleteTask()
  const busy =
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending ||
    listQuery.isFetching
  const listTasks = listQuery.data ?? []
  const firstTask = listTasks[0]

  useEffect(() => {
    taskStore.onListCountChange = setListCount
    taskStore.onDetailCountsChange = setDetailCounts
    return () => {
      taskStore.onListCountChange = undefined
      taskStore.onDetailCountsChange = undefined
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetailTitle('无')
    }
  }, [selectedId])

  /** 通过数据 Hook 创建任务。 */
  function runCreate(): void {
    createMutation.mutate()
  }

  /** 通过数据 Hook 保存当前选中任务。 */
  function runEdit(): void {
    if (!selectedId) {
      return
    }
    editMutation.mutate(selectedId)
  }

  /** 通过数据 Hook 删除当前选中任务。 */
  function runDelete(): void {
    if (!selectedId) {
      return
    }
    const removingId = selectedId
    deleteMutation.mutate(removingId, {
      onSuccess: () => {
        setSelectedId((current) => {
          if (current !== removingId) {
            return current
          }
          const remaining = taskStore.tasks[0]
          return remaining ? remaining.id : ''
        })
      },
    })
  }

  /** 恢复初始任务并重新读取。 */
  function resetDemo(): void {
    taskStore.tasks = [{ id: 't-1', title: '现有任务', owner: '林晓' }]
    taskStore.nextId = 2
    taskStore.listCount = 0
    taskStore.detailCounts = {}
    setListCount(0)
    setDetailCounts({})
    setDetailTitle('现有任务')
    setSelectedId('t-1')
    createMutation.reset()
    editMutation.reset()
    deleteMutation.reset()
    void queryClient.invalidateQueries()
  }

  return (
    <section className="crud-workspace-demo" data-testid="crud-workspace-demo">
      <header className="crud-workspace-header">
        <span>TanStack Query</span>
        <h2>CRUD 管理工作区</h2>
        <p>
          列表和详情都走数据 Hook。创建、删除只作废列表；保存用响应写回详情，列表标题不会一起变。
        </p>
      </header>

      <div className="crud-workspace-metrics" aria-live="polite">
        <div>
          <span>列表次数</span>
          <strong data-testid="crud-workspace-list-count">{listCount}</strong>
        </div>
        <div>
          <span>详情次数</span>
          <strong data-testid="crud-workspace-detail-count">
            {selectedId ? (detailCounts[selectedId] ?? 0) : 0}
          </strong>
        </div>
        <div>
          <span>列表条数</span>
          <strong data-testid="crud-workspace-list-length">{listTasks.length}</strong>
        </div>
        <div>
          <span>列表首条</span>
          <strong data-testid="crud-workspace-list-title">
            {firstTask ? firstTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>详情标题</span>
          <strong data-testid="crud-workspace-detail-title">{detailTitle}</strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="crud-workspace-owner">{firstTask ? firstTask.owner : '无'}</strong>
        </div>
        <div>
          <span>创建</span>
          <strong data-testid="crud-workspace-create-status">{createMutation.status}</strong>
        </div>
        <div>
          <span>保存</span>
          <strong data-testid="crud-workspace-edit-status">{editMutation.status}</strong>
        </div>
        <div>
          <span>删除</span>
          <strong data-testid="crud-workspace-delete-status">{deleteMutation.status}</strong>
        </div>
      </div>

      <div className="crud-workspace-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={runCreate}>
          创建任务
        </button>
        <button type="button" disabled={busy || !selectedId} onClick={runEdit}>
          保存修改
        </button>
        <button type="button" disabled={busy || !selectedId} onClick={runDelete}>
          删除任务
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="crud-workspace-columns">
        <section className="crud-workspace-card">
          <h3>列表 useTaskList</h3>
          {listQuery.isPending ? (
            <p className="crud-workspace-message" role="status">
              正在读取列表。
            </p>
          ) : null}
          {listQuery.isSuccess ? (
            <div className="crud-workspace-list" data-testid="crud-workspace-list">
              {listTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  data-selected={task.id === selectedId ? 'true' : 'false'}
                  disabled={busy}
                  onClick={() => setSelectedId(task.id)}
                >
                  {task.title} / {task.owner}
                </button>
              ))}
            </div>
          ) : null}
        </section>
        <section className="crud-workspace-card">
          <h3>详情 useTaskDetail</h3>
          {selectedId ? (
            <TaskDetailPane selectedId={selectedId} busy={busy} onTitleChange={setDetailTitle} />
          ) : (
            <p className="crud-workspace-message" role="status">
              请选择任务。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function CrudManagementWorkspaceDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      taskStore.tasks = [{ id: 't-1', title: '现有任务', owner: '林晓' }]
      taskStore.nextId = 2
      taskStore.listCount = 0
      taskStore.detailCounts = {}
      taskStore.onListCountChange = undefined
      taskStore.onDetailCountsChange = undefined
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <CrudManagementWorkspacePanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 CRUD 管理工作区 Demo。 */
export function createCrudManagementWorkspaceDemo(): ComponentType {
  return CrudManagementWorkspaceDemoRoot
}
