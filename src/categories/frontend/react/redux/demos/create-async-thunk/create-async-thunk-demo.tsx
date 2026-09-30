import { configureStore, createAsyncThunk } from '@reduxjs/toolkit'
import { useId, useState, type ChangeEvent, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch } from 'react-redux'

import './create-async-thunk-demo.css'

type PreviewRequest = {
  courseId: string
  shouldFail: boolean
}

type CoursePreview = {
  courseId: string
  title: string
  summary: string
}

type RequestObservation = {
  actionType: string
  matchedCase: string
  dispatchPromise: string
  argument: string
  payloadOrError: string
  unwrapResult: string
}

type DemoState = {
  ready: boolean
}

const initialCourseId = 'redux-async'
const initialDemoState: DemoState = { ready: true }

/** 创建尚未派发请求时的观察结果。 */
function createInitialObservation(): RequestObservation {
  return {
    actionType: '尚未产生最终 action',
    matchedCase: '等待匹配',
    dispatchPromise: '尚未等待',
    argument: '尚未传入',
    payloadOrError: '尚无结果',
    unwrapResult: '尚未调用',
  }
}

/** 模拟课程预览服务，并根据参数返回数据或抛出错误。 */
async function requestCoursePreview(request: PreviewRequest): Promise<CoursePreview> {
  await Promise.resolve()

  if (request.shouldFail) {
    throw new Error(`无法加载课程 ${request.courseId}`)
  }

  return {
    courseId: request.courseId,
    title: 'createAsyncThunk',
    summary: '自动生成异步流程 action，并保留可类型推导的请求参数与结果。',
  }
}

const loadCoursePreview = createAsyncThunk('coursePreview/load', async (request: PreviewRequest) =>
  requestCoursePreview(request),
)

/** 为观察 action 提供不处理业务状态的最小 Reducer。 */
function demoReducer(state: DemoState = initialDemoState): DemoState {
  return state
}

/** 为每个 Demo 实例创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({ reducer: demoReducer })
}

type DemoStore = ReturnType<typeof createDemoStore>
type AppDispatch = DemoStore['dispatch']

/** 创建能够识别异步 Thunk 返回类型的预类型 dispatch Hook。 */
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 从未知错误值中读取适合界面展示的消息。 */
function readErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

/** 展示 createAsyncThunk 生成的 action、派发结果与 unwrap 行为。 */
function CreateAsyncThunkPanel(): ReactElement {
  const courseIdInputId = useId()
  const dispatch = useAppDispatch()
  const [courseId, setCourseId] = useState(initialCourseId)
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState('选择成功或失败请求，观察同一个异步 Thunk 的结果。')
  const [observation, setObservation] = useState(createInitialObservation)

  /** 同步保存准备传给 Thunk action creator 的课程 ID。 */
  function changeCourseId(event: ChangeEvent<HTMLInputElement>): void {
    setCourseId(event.target.value)
  }

  /** 派发异步 Thunk，并同时观察最终 action 与 unwrap 结果。 */
  async function runRequest(shouldFail: boolean): Promise<void> {
    const request: PreviewRequest = {
      courseId: courseId.trim() || initialCourseId,
      shouldFail,
    }

    setIsRunning(true)
    setStatus(`已派发 ${loadCoursePreview.pending.type}，正在等待 payloadCreator。`)
    setObservation({
      actionType: loadCoursePreview.pending.type,
      matchedCase: '等待最终 action',
      dispatchPromise: '等待中',
      argument: `${request.courseId} / ${shouldFail ? '失败' : '成功'}`,
      payloadOrError: 'payloadCreator 执行中',
      unwrapResult: '等待中',
    })

    const dispatched = dispatch(loadCoursePreview(request))
    const finalAction = await dispatched
    let matchedCase = '未匹配预期 action'
    let payloadOrError = '没有可展示的 action 内容'
    let finalStatus = '请求结束：生成了未预期的 action。'
    let unwrapResult = ''

    if (loadCoursePreview.fulfilled.match(finalAction)) {
      matchedCase = 'fulfilled.match(action) 为 true'
      payloadOrError = `payload：${finalAction.payload.summary}`
      finalStatus = '请求完成：生成 fulfilled action。'
    } else if (loadCoursePreview.rejected.match(finalAction)) {
      matchedCase = 'rejected.match(action) 为 true'
      payloadOrError = `error：${finalAction.error.message ?? '未知错误'}`
      finalStatus = '请求失败：生成 rejected action。'
    }

    try {
      const payload = await dispatched.unwrap()
      unwrapResult = `返回 payload：${payload.title}`
    } catch (error) {
      unwrapResult = `抛出错误：${readErrorMessage(error)}`
    }

    setObservation({
      actionType: finalAction.type,
      matchedCase,
      dispatchPromise: 'Promise 已解决，没有因 rejected action 自行抛出',
      argument: `${finalAction.meta.arg.courseId} / ${
        finalAction.meta.arg.shouldFail ? '失败' : '成功'
      }`,
      payloadOrError,
      unwrapResult,
    })
    setStatus(finalStatus)
    setIsRunning(false)
  }

  /** 恢复输入与观察结果。 */
  function resetDemo(): void {
    setCourseId(initialCourseId)
    setIsRunning(false)
    setStatus('选择成功或失败请求，观察同一个异步 Thunk 的结果。')
    setObservation(createInitialObservation())
  }

  return (
    <section className="create-async-thunk-demo" data-testid="create-async-thunk-demo">
      <header className="create-async-thunk-demo__heading">
        <p>Redux Toolkit</p>
        <h2>createAsyncThunk 结果观察台</h2>
        <span>同一个 payloadCreator 会根据 Promise 结果生成 fulfilled 或 rejected action。</span>
      </header>

      <section className="create-async-thunk-demo__types" aria-label="自动生成的 action type">
        <h3>自动生成的 action type</h3>
        <ol>
          <li>
            <span>开始</span>
            <code data-testid="create-async-thunk-pending-type">
              {loadCoursePreview.pending.type}
            </code>
          </li>
          <li>
            <span>成功</span>
            <code data-testid="create-async-thunk-fulfilled-type">
              {loadCoursePreview.fulfilled.type}
            </code>
          </li>
          <li>
            <span>失败</span>
            <code data-testid="create-async-thunk-rejected-type">
              {loadCoursePreview.rejected.type}
            </code>
          </li>
        </ol>
      </section>

      <div className="create-async-thunk-demo__input">
        <label htmlFor={courseIdInputId}>请求参数 courseId</label>
        <input
          id={courseIdInputId}
          data-testid="create-async-thunk-course-id"
          type="text"
          value={courseId}
          disabled={isRunning}
          onChange={changeCourseId}
        />
      </div>

      <div className="create-async-thunk-demo__controls">
        <button
          className="create-async-thunk-demo__primary"
          data-testid="create-async-thunk-success"
          type="button"
          disabled={isRunning}
          onClick={() => void runRequest(false)}
        >
          {isRunning ? '请求运行中' : '运行成功请求'}
        </button>
        <button
          data-testid="create-async-thunk-failure"
          type="button"
          disabled={isRunning}
          onClick={() => void runRequest(true)}
        >
          运行失败请求
        </button>
        <button
          data-testid="create-async-thunk-reset"
          type="button"
          disabled={isRunning}
          onClick={resetDemo}
        >
          恢复初始状态
        </button>
      </div>

      <p
        className="create-async-thunk-demo__status"
        data-testid="create-async-thunk-status"
        aria-live="polite"
      >
        {status}
      </p>

      <dl className="create-async-thunk-demo__results" aria-busy={isRunning}>
        <div>
          <dt>最终 action.type</dt>
          <dd data-testid="create-async-thunk-final-type">{observation.actionType}</dd>
        </div>
        <div>
          <dt>Matcher 判断</dt>
          <dd data-testid="create-async-thunk-match">{observation.matchedCase}</dd>
        </div>
        <div>
          <dt>dispatch Promise</dt>
          <dd data-testid="create-async-thunk-promise">{observation.dispatchPromise}</dd>
        </div>
        <div>
          <dt>meta.arg</dt>
          <dd data-testid="create-async-thunk-arg">{observation.argument}</dd>
        </div>
        <div>
          <dt>最终 action 内容</dt>
          <dd data-testid="create-async-thunk-payload">{observation.payloadOrError}</dd>
        </div>
        <div>
          <dt>.unwrap()</dt>
          <dd data-testid="create-async-thunk-unwrap">{observation.unwrapResult}</dd>
        </div>
      </dl>
    </section>
  )
}

/** 为 React Demo 提供独立 store 和 Provider 作用域。 */
function CreateAsyncThunkDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <CreateAsyncThunkPanel />
    </Provider>
  )
}

/** 为 React Demo 注册 createAsyncThunk 结果观察组件。 */
export function createCreateAsyncThunkDemo(): ComponentType {
  return CreateAsyncThunkDemoRoot
}
