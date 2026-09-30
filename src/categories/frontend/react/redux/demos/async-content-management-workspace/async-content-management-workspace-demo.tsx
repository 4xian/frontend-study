import {
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
  configureStore,
} from '@reduxjs/toolkit'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './async-content-management-workspace-demo.css'

type ContentStatus = 'draft' | 'published'
type Filter = 'all' | ContentStatus
type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed'

type Content = {
  id: string
  title: string
  summary: string
  status: ContentStatus
  updatedAt: number
}

type ContentState = EntityState<Content, string> & {
  requestStatus: RequestStatus
  error: string | null
  selectedId: string | null
  filter: Filter
  operation: string
}

type WorkspaceRootState = {
  contentWorkspace: ContentState
}

const seedContents: Content[] = [
  {
    id: 'content-1',
    title: '异步请求的三个阶段',
    summary: '用 pending、fulfilled 和 rejected 组织可观察的异步流程。',
    status: 'published',
    updatedAt: 300,
  },
  {
    id: 'content-2',
    title: '实体集合的稳定主键',
    summary: '让 ids 与 entities 成为同一份内容事实的两个索引。',
    status: 'draft',
    updatedAt: 200,
  },
  {
    id: 'content-3',
    title: 'Selector 的派生边界',
    summary: '把筛选和视图组合留在查询层，而不是复制到 state。',
    status: 'published',
    updatedAt: 100,
  },
]

const contentAdapter = createEntityAdapter<Content>({
  sortComparer: (left, right) => right.updatedAt - left.updatedAt,
})

/** 创建每个 Demo 实例独占的初始工作区状态。 */
function createInitialContentState(): ContentState {
  return contentAdapter.getInitialState(
    {
      requestStatus: 'idle',
      error: null,
      selectedId: 'content-1',
      filter: 'all',
      operation: '等待操作',
    },
    seedContents,
  )
}

/** 模拟内容服务的延迟，并在请求取消时清理计时器。 */
function waitForService(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, 220)

    function handleAbort(): void {
      window.clearTimeout(timer)
      reject(new DOMException('请求已取消', 'AbortError'))
    }

    if (signal.aborted) {
      handleAbort()
    } else {
      signal.addEventListener('abort', handleAbort, { once: true })
    }
  })
}

/** 模拟加载工作区内容，并保留一个可复现的服务失败分支。 */
const loadContents = createAsyncThunk<
  Content[],
  boolean,
  { state: WorkspaceRootState; rejectValue: string }
>('contentWorkspace/loadContents', async (shouldFail, { rejectWithValue, signal }) => {
  await waitForService(signal)
  if (shouldFail) return rejectWithValue('内容服务暂时不可用，请稍后重试')
  return seedContents
})

/** 模拟保存标题，使用 rejectWithValue 返回可展示的业务错误。 */
const saveContent = createAsyncThunk<
  Content,
  { id: string; title: string },
  { state: WorkspaceRootState; rejectValue: string }
>('contentWorkspace/saveContent', async ({ id, title }, { rejectWithValue, getState, signal }) => {
  await waitForService(signal)
  const content = getState().contentWorkspace.entities[id]
  if (!content) return rejectWithValue('内容已不存在，请重新加载')
  const nextTitle = title.trim()
  if (nextTitle.length < 4) return rejectWithValue('标题至少需要 4 个字符')
  return { ...content, title: nextTitle, updatedAt: Date.now() }
})

/** 模拟发布或撤回内容，并返回更新后的实体。 */
const togglePublished = createAsyncThunk<
  Content,
  string,
  { state: WorkspaceRootState; rejectValue: string }
>('contentWorkspace/togglePublished', async (id, { rejectWithValue, getState, signal }) => {
  await waitForService(signal)
  const content = getState().contentWorkspace.entities[id]
  if (!content) return rejectWithValue('找不到要发布的内容')
  return {
    ...content,
    status: content.status === 'published' ? 'draft' : 'published',
    updatedAt: Date.now(),
  }
})

/** 模拟删除内容并返回被删除实体的 ID。 */
const deleteContent = createAsyncThunk<
  string,
  string,
  { state: WorkspaceRootState; rejectValue: string }
>('contentWorkspace/deleteContent', async (id, { rejectWithValue, getState, signal }) => {
  await waitForService(signal)
  if (!getState().contentWorkspace.entities[id]) return rejectWithValue('内容已经被删除')
  return id
})

const contentSlice = createSlice({
  name: 'contentWorkspace',
  initialState: createInitialContentState,
  reducers: {
    filterChanged(state, action: PayloadAction<Filter>) {
      state.filter = action.payload
    },
    selectedChanged(state, action: PayloadAction<string>) {
      state.selectedId = action.payload
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadContents.pending, (state) => {
        state.requestStatus = 'pending'
        state.error = null
        state.operation = '正在加载内容'
      })
      .addCase(loadContents.fulfilled, (state, action) => {
        contentAdapter.setAll(state, action.payload)
        state.requestStatus = 'succeeded'
        state.error = null
        state.selectedId = action.payload[0]?.id ?? null
        state.operation = '内容加载完成'
      })
      .addCase(loadContents.rejected, (state, action) => {
        state.requestStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? '加载失败'
        state.operation = '内容加载失败'
      })
      .addCase(saveContent.pending, (state) => {
        state.requestStatus = 'pending'
        state.error = null
        state.operation = '正在保存标题'
      })
      .addCase(saveContent.fulfilled, (state, action) => {
        contentAdapter.upsertOne(state, action.payload)
        state.requestStatus = 'succeeded'
        state.error = null
        state.operation = '标题保存完成'
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.requestStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? '保存失败'
        state.operation = '标题保存失败'
      })
      .addCase(togglePublished.pending, (state) => {
        state.requestStatus = 'pending'
        state.error = null
        state.operation = '正在更新发布状态'
      })
      .addCase(togglePublished.fulfilled, (state, action) => {
        contentAdapter.upsertOne(state, action.payload)
        state.requestStatus = 'succeeded'
        state.error = null
        state.operation = '发布状态已更新'
      })
      .addCase(togglePublished.rejected, (state, action) => {
        state.requestStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? '发布状态更新失败'
        state.operation = '发布状态更新失败'
      })
      .addCase(deleteContent.pending, (state) => {
        state.requestStatus = 'pending'
        state.error = null
        state.operation = '正在删除内容'
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        contentAdapter.removeOne(state, action.payload)
        state.requestStatus = 'succeeded'
        state.error = null
        state.selectedId = state.ids[0] ?? null
        state.operation = '内容删除完成'
      })
      .addCase(deleteContent.rejected, (state, action) => {
        state.requestStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? '删除失败'
        state.operation = '内容删除失败'
      })
  },
})

const selectors = contentAdapter.getSelectors<RootState>((state) => state.contentWorkspace)
const { filterChanged, selectedChanged } = contentSlice.actions

/** 创建每个 Demo 实例独立的 Redux store。 */
function createDemoStore() {
  return configureStore({ reducer: { contentWorkspace: contentSlice.reducer } })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']
type AbortableRequest = Promise<unknown> & { abort: () => void }

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 根据当前筛选条件派生工作区可见内容。 */
const selectVisibleContents = createSelector(
  [selectors.selectAll, (state: RootState) => state.contentWorkspace.filter],
  (contents, filter) => contents.filter((content) => filter === 'all' || content.status === filter),
)

/** 展示异步内容工作区的实体列表、编辑和请求状态。 */
function AsyncContentManagementWorkspacePanel(): ReactElement {
  const dispatch = useAppDispatch()
  const activeRequests = useRef<Set<AbortableRequest>>(new Set())
  const [draftTitle, setDraftTitle] = useState('')
  const contents = useAppSelector(selectVisibleContents)
  const selectedId = useAppSelector((state) => state.contentWorkspace.selectedId)
  const selectedContent = useAppSelector((state) =>
    selectedId ? selectors.selectById(state, selectedId) : undefined,
  )
  const filter = useAppSelector((state) => state.contentWorkspace.filter)
  const requestStatus = useAppSelector((state) => state.contentWorkspace.requestStatus)
  const error = useAppSelector((state) => state.contentWorkspace.error)
  const operation = useAppSelector((state) => state.contentWorkspace.operation)
  const ids = useAppSelector(selectors.selectIds)
  const isPending = requestStatus === 'pending'

  useEffect(() => {
    return () => {
      for (const request of activeRequests.current) request.abort()
      activeRequests.current.clear()
    }
  }, [])

  /** 追踪异步请求，使组件卸载时可以中止仍在等待的 thunk。 */
  function trackRequest<T extends AbortableRequest>(request: T): T {
    activeRequests.current.add(request)
    void request.finally(() => activeRequests.current.delete(request))
    return request
  }

  /** 同步选中内容的标题到本地编辑草稿。 */
  function beginEdit(content: Content): void {
    dispatch(selectedChanged(content.id))
    setDraftTitle(content.title)
  }

  /** 保存当前编辑草稿，并等待 thunk 完成。 */
  async function handleSave(): Promise<void> {
    if (!selectedContent) return
    await trackRequest(dispatch(saveContent({ id: selectedContent.id, title: draftTitle })))
  }

  /** 载入成功的内容集合。 */
  async function handleLoad(): Promise<void> {
    const result = await trackRequest(dispatch(loadContents(false)))
    if (loadContents.fulfilled.match(result)) setDraftTitle(result.payload[0]?.title ?? '')
  }

  /** 触发服务失败分支，观察 rejectWithValue 的错误信息。 */
  async function handleLoadFailure(): Promise<void> {
    await trackRequest(dispatch(loadContents(true)))
  }

  /** 删除当前内容，并清空已提交实体之外的本地编辑草稿。 */
  async function handleDelete(): Promise<void> {
    if (!selectedContent) return
    const result = await trackRequest(dispatch(deleteContent(selectedContent.id)))
    if (deleteContent.fulfilled.match(result)) setDraftTitle('')
  }

  return (
    <section className="async-content-workspace" data-testid="async-content-workspace-demo">
      <header className="async-content-workspace__heading">
        <p>ASYNC CONTENT WORKSPACE</p>
        <h2>异步内容管理工作区</h2>
        <span>实体集合负责内容事实，异步 Thunk 负责一次操作的生命周期。</span>
      </header>

      <section className={`async-content-workspace__status is-${requestStatus}`} aria-live="polite">
        <div>
          <span>请求状态</span>
          <strong data-testid="async-content-request-status">{requestStatus}</strong>
        </div>
        <p>{operation}</p>
      </section>

      <div className="async-content-workspace__toolbar">
        <button type="button" disabled={isPending} onClick={() => void handleLoad()}>
          加载内容
        </button>
        <button type="button" disabled={isPending} onClick={() => void handleLoadFailure()}>
          模拟加载失败
        </button>
        <label>
          筛选
          <select
            value={filter}
            disabled={isPending}
            onChange={(event) => dispatch(filterChanged(event.target.value as Filter))}
          >
            <option value="all">全部</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </label>
      </div>

      <div className="async-content-workspace__body">
        <section className="async-content-workspace__list" aria-label="内容列表">
          <div className="async-content-workspace__section-heading">
            <h3>内容集合</h3>
            <span>{contents.length} 条可见</span>
          </div>
          {contents.length > 0 ? (
            <ul>
              {contents.map((content) => (
                <li key={content.id}>
                  <button
                    className={content.id === selectedId ? 'is-selected' : ''}
                    type="button"
                    onClick={() => beginEdit(content)}
                  >
                    <strong>{content.title}</strong>
                    <span>{content.status === 'published' ? '已发布' : '草稿'}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>当前筛选没有内容。</p>
          )}
        </section>

        <section className="async-content-workspace__editor" aria-label="内容编辑器">
          <div className="async-content-workspace__section-heading">
            <h3>编辑内容</h3>
            <span>{selectedContent ? selectedContent.id : '未选择'}</span>
          </div>
          {selectedContent ? (
            <>
              <p>{selectedContent.summary}</p>
              <label>
                标题
                <input
                  value={draftTitle || selectedContent.title}
                  disabled={isPending}
                  onChange={(event) => setDraftTitle(event.target.value)}
                />
              </label>
              <div className="async-content-workspace__editor-actions">
                <button type="button" disabled={isPending} onClick={() => void handleSave()}>
                  保存标题
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => void trackRequest(dispatch(togglePublished(selectedContent.id)))}
                >
                  {selectedContent.status === 'published' ? '撤回发布' : '发布内容'}
                </button>
                <button type="button" disabled={isPending} onClick={() => void handleDelete()}>
                  删除内容
                </button>
              </div>
            </>
          ) : (
            <p>从左侧选择一条内容开始编辑。</p>
          )}
          {error ? <p className="async-content-workspace__error">{error}</p> : null}
        </section>
      </div>

      <footer className="async-content-workspace__state">
        <span>adapter selectors</span>
        <code data-testid="async-content-ids">{JSON.stringify(ids)}</code>
      </footer>
    </section>
  )
}

/** 为工作区提供可重复挂载的独立 Provider。 */
function AsyncContentManagementWorkspaceDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <AsyncContentManagementWorkspacePanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册异步内容管理工作区。 */
export function createAsyncContentManagementWorkspaceDemo(): ComponentType {
  return AsyncContentManagementWorkspaceDemoRoot
}
