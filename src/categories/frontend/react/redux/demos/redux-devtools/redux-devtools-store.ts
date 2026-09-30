import { configureStore, createSlice, type Middleware } from '@reduxjs/toolkit'

type DevToolsDemoState = {
  count: number
  mode: 'idle' | 'active'
}

export type DevToolsHistoryEntry = Readonly<{
  id: number
  actionType: string
  count: number
  mode: DevToolsDemoState['mode']
}>

const initialState: DevToolsDemoState = { count: 0, mode: 'idle' }

const devToolsSlice = createSlice({
  name: 'devToolsDemo',
  initialState,
  reducers: {
    countIncremented: (state) => {
      state.count += 1
    },
    modeToggled: (state) => {
      state.mode = state.mode === 'idle' ? 'active' : 'idle'
    },
    reset: () => initialState,
  },
})

type DevToolsDemoRootState = {
  devToolsDemo: DevToolsDemoState
}

/** 判断值是否为带字符串 type 的 Redux action。 */
function isReduxAction(value: unknown): value is { type: string } {
  return (
    typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string'
  )
}

/** 创建记录动作与状态快照的本地观察中间件。 */
function createHistoryMiddleware(
  history: DevToolsHistoryEntry[],
  notify: () => void,
): Middleware<{}, DevToolsDemoRootState> {
  return ({ getState }) =>
    (next) =>
    (action) => {
      const result = next(action)
      if (isReduxAction(action) && !action.type.startsWith('@@redux/')) {
        const state = getState().devToolsDemo
        history.push({
          id: history.length,
          actionType: action.type,
          count: state.count,
          mode: state.mode,
        })
        notify()
      }
      return result
    }
}

/** 创建启用 Redux DevTools 配置的独立 Demo store。 */
export function createDevToolsDemoStore() {
  const history: DevToolsHistoryEntry[] = [
    { id: 0, actionType: '@@INIT', count: initialState.count, mode: initialState.mode },
  ]
  const listeners = new Set<() => void>()
  const notify = (): void => {
    listeners.forEach((listener) => listener())
  }
  const store = configureStore({
    reducer: {
      devToolsDemo: devToolsSlice.reducer,
    },
    devTools: {
      name: 'Redux DevTools 课程 Demo',
      trace: true,
      maxAge: 20,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(createHistoryMiddleware(history, notify)),
  })

  /** 返回当前本地动作历史快照。 */
  function getHistory(): readonly DevToolsHistoryEntry[] {
    return history.slice()
  }

  /** 订阅本地动作历史变化。 */
  function subscribeHistory(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { store, getHistory, subscribeHistory }
}

export type DevToolsDemoStore = ReturnType<typeof createDevToolsDemoStore>['store']
export type RootState = ReturnType<DevToolsDemoStore['getState']>
export type AppDispatch = DevToolsDemoStore['dispatch']

/** 读取 Demo 当前计数。 */
export const selectCount = (state: RootState) => state.devToolsDemo.count

/** 读取 Demo 当前模式。 */
export const selectMode = (state: RootState) => state.devToolsDemo.mode

export const { countIncremented, modeToggled, reset } = devToolsSlice.actions
