import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './async-error-reject-with-value-demo.css'

type SaveMode = 'success' | 'validation' | 'system'

type Profile = {
  email: string
  displayName: string
}

type SaveProfileRequest = Profile & {
  mode: SaveMode
}

type ProfileValidationError = {
  code: 'EMAIL_TAKEN'
  message: string
  fields: {
    email: string
  }
}

type SaveStatus = 'idle' | 'pending' | 'succeeded' | 'failed'

type ProfileState = {
  profile: Profile | null
  status: SaveStatus
  fieldError: string | null
  systemError: string | null
}

type ResultObservation = {
  kind: string
  payload: string
  error: string
  unwrap: string
}

/** 创建互不共享引用的资料初始状态。 */
function createInitialProfileState(): ProfileState {
  return {
    profile: null,
    status: 'idle',
    fieldError: null,
    systemError: null,
  }
}

/** 创建尚未派发保存请求时的观察结果。 */
function createInitialObservation(): ResultObservation {
  return {
    kind: '尚未产生 rejected action',
    payload: '尚无业务错误 payload',
    error: '尚无序列化错误',
    unwrap: '尚未调用 unwrap',
  }
}

/** 模拟资料保存服务的成功、预期校验失败和意外异常。 */
async function requestProfileSave(request: SaveProfileRequest): Promise<Profile> {
  await Promise.resolve()

  if (request.mode === 'system') {
    throw new Error('资料服务暂时不可用')
  }

  return {
    email: request.email,
    displayName: request.displayName,
  }
}

const saveProfile = createAsyncThunk<
  Profile,
  SaveProfileRequest,
  { rejectValue: ProfileValidationError }
>('profile/save', async (request, { rejectWithValue }) => {
  if (request.mode === 'validation') {
    return rejectWithValue({
      code: 'EMAIL_TAKEN',
      message: '资料未保存，请修正邮箱字段。',
      fields: {
        email: '该邮箱已被其他账号使用',
      },
    })
  }

  return requestProfileSave(request)
})

const profileSlice = createSlice({
  name: 'profile',
  initialState: createInitialProfileState(),
  reducers: {
    resetProfile: createInitialProfileState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveProfile.pending, (state) => {
        state.status = 'pending'
        state.fieldError = null
        state.systemError = null
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.status = 'failed'

        if (action.payload) {
          state.fieldError = action.payload.fields.email
          state.systemError = null
          return
        }

        state.fieldError = null
        state.systemError = action.error.message ?? '未知系统错误'
      })
  },
})

const { resetProfile } = profileSlice.actions

/** 为每个 Demo 实例创建独立的 Redux store。 */
function createDemoStore() {
  return configureStore({
    reducer: {
      profile: profileSlice.reducer,
    },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 把 unwrap 抛出的业务 payload 或序列化错误转换为观察文本。 */
function describeUnwrappedError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && 'message' in error) {
      return `业务 payload：${String(error.code)} / ${String(error.message)}`
    }

    if ('message' in error) {
      return `序列化错误：${String(error.message)}`
    }
  }

  return `未知值：${String(error)}`
}

/** 展示 rejectWithValue 与普通抛错形成的两种 rejected action。 */
function AsyncErrorRejectWithValuePanel(): ReactElement {
  const dispatch = useAppDispatch()
  const profileState = useAppSelector((state) => state.profile)
  const [observation, setObservation] = useState(createInitialObservation)
  const isPending = profileState.status === 'pending'

  /** 派发指定结果的保存请求，并观察最终 action 与 unwrap。 */
  async function runSave(mode: SaveMode): Promise<void> {
    const dispatched = dispatch(
      saveProfile({
        email: 'student@example.com',
        displayName: 'Redux 学习者',
        mode,
      }),
    )
    const finalAction = await dispatched
    let unwrap = ''

    try {
      const profile = await dispatched.unwrap()
      unwrap = `返回资料：${profile.displayName}`
    } catch (error) {
      unwrap = describeUnwrappedError(error)
    }

    if (saveProfile.fulfilled.match(finalAction)) {
      setObservation({
        kind: 'fulfilled：保存成功',
        payload: `资料 payload：${finalAction.payload.email}`,
        error: '没有 error 字段',
        unwrap,
      })
      return
    }

    setObservation({
      kind: finalAction.meta.rejectedWithValue ? 'rejected：业务拒绝' : 'rejected：意外异常',
      payload: finalAction.payload
        ? `${finalAction.payload.code} / ${finalAction.payload.fields.email}`
        : 'payload 为 undefined',
      error: finalAction.error.message ?? '没有错误消息',
      unwrap,
    })
  }

  /** 恢复 Slice 和观察面板的初始状态。 */
  function resetDemo(): void {
    dispatch(resetProfile())
    setObservation(createInitialObservation())
  }

  return (
    <section className="async-error-demo" data-testid="async-error-reject-with-value-demo">
      <header className="async-error-demo__heading">
        <p>Typed rejection</p>
        <h2>异步错误分流台</h2>
        <span>预期业务拒绝进入 payload，意外异常保留在 error。</span>
      </header>

      <section className="async-error-demo__status" aria-live="polite" aria-busy={isPending}>
        <span>当前请求状态</span>
        <strong data-testid="async-error-status">{profileState.status}</strong>
      </section>

      <div className="async-error-demo__controls">
        <button
          className="async-error-demo__primary"
          data-testid="async-error-success"
          type="button"
          disabled={isPending}
          onClick={() => void runSave('success')}
        >
          保存成功
        </button>
        <button
          data-testid="async-error-validation"
          type="button"
          disabled={isPending}
          onClick={() => void runSave('validation')}
        >
          返回业务错误
        </button>
        <button
          data-testid="async-error-system"
          type="button"
          disabled={isPending}
          onClick={() => void runSave('system')}
        >
          抛出系统异常
        </button>
        <button
          data-testid="async-error-reset"
          type="button"
          disabled={isPending}
          onClick={resetDemo}
        >
          重置
        </button>
      </div>

      <section className="async-error-demo__state" aria-label="Reducer 错误状态">
        <h3>Reducer 中的错误</h3>
        <dl>
          <div>
            <dt>字段错误</dt>
            <dd data-testid="async-error-field-error">
              {profileState.fieldError ?? '没有字段错误'}
            </dd>
          </div>
          <div>
            <dt>系统错误</dt>
            <dd data-testid="async-error-system-error">
              {profileState.systemError ?? '没有系统错误'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="async-error-demo__observation" aria-label="最终 action 观察结果">
        <h3>最终 action 与 unwrap</h3>
        <dl>
          <div>
            <dt>结果分支</dt>
            <dd data-testid="async-error-kind">{observation.kind}</dd>
          </div>
          <div>
            <dt>action.payload</dt>
            <dd data-testid="async-error-payload">{observation.payload}</dd>
          </div>
          <div>
            <dt>action.error</dt>
            <dd data-testid="async-error-error">{observation.error}</dd>
          </div>
          <div>
            <dt>unwrap()</dt>
            <dd data-testid="async-error-unwrap">{observation.unwrap}</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}

/** 为错误分流 Demo 提供可重复挂载的独立 Provider。 */
function AsyncErrorRejectWithValueDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <AsyncErrorRejectWithValuePanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册异步错误分流组件。 */
export function createAsyncErrorRejectWithValueDemo(): ComponentType {
  return AsyncErrorRejectWithValueDemoRoot
}
