import { create } from 'zustand'
import { type ComponentType, useRef } from 'react'

import './async-action-demo.css'

type Profile = {
  name: string
}

type ProfileState = {
  profile: Profile | null
  loading: boolean
  error: string | null
  requestId: number
  ticks: number
}

type ProfileActions = {
  loadProfile: (mode: 'ok' | 'fail' | 'stale') => Promise<void>
  tick: () => void
  reset: () => void
}

type ProfileStore = ProfileState & ProfileActions

/** 等待指定毫秒，用来模拟网络延迟。 */
function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/** 按模式返回资料、失败或迟到的成功。 */
async function fakeFetch(mode: 'ok' | 'fail' | 'stale'): Promise<Profile> {
  await wait(mode === 'stale' ? 900 : 250)
  if (mode === 'fail') throw new Error('加载失败')
  return { name: mode === 'stale' ? '迟到的结果' : '林间' }
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  requestId: 0,
  ticks: 0,
}

const useProfileStore = create<ProfileStore>()((set, get) => ({
  ...initialState,
  /** 发出一次加载，并用 requestId 丢掉过期结果。 */
  loadProfile: async (mode) => {
    const requestId = get().requestId + 1
    set({ requestId, loading: true, error: null, profile: null })
    try {
      const profile = await fakeFetch(mode)
      if (get().requestId !== requestId) return
      set({ profile, loading: false, error: null })
    } catch (error) {
      if (get().requestId !== requestId) return
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      })
    }
  },
  /** 增加与资料无关的计数。 */
  tick: () => set((state) => ({ ticks: state.ticks + 1 })),
  /** 恢复演示用的初始资料 Store。 */
  reset: () => set({ ...initialState }),
}))

/** 只选择 loading，观察请求开始和结束。 */
function LoadingSubscriber() {
  const loading = useProfileStore((state) => state.loading)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="async-action-panel" data-testid="loading-subscriber">
      <span>加载中</span>
      <strong data-testid="async-action-loading">{loading ? '是' : '否'}</strong>
      <p>
        渲染次数 <b data-testid="loading-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择资料姓名。 */
function ProfileSubscriber() {
  const name = useProfileStore((state) => state.profile?.name ?? '空')
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="async-action-panel" data-testid="profile-subscriber">
      <span>资料姓名</span>
      <strong data-testid="async-action-profile">{name}</strong>
      <p>
        渲染次数 <b data-testid="profile-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择错误文案。 */
function ErrorSubscriber() {
  const error = useProfileStore((state) => state.error)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="async-action-panel" data-testid="error-subscriber">
      <span>错误</span>
      <strong data-testid="async-action-error">{error ?? '无'}</strong>
      <p>
        渲染次数 <b data-testid="error-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 不传选择函数，任意字段变化都会重渲染。 */
function WholeStoreSubscriber() {
  const profile = useProfileStore()
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="async-action-panel" data-testid="whole-subscriber">
      <span>不传选择函数</span>
      <strong data-testid="async-action-whole">
        {profile.loading ? '加载' : '空闲'} / {profile.ticks}
      </strong>
      <p>
        渲染次数 <b data-testid="whole-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择加载成功的 Action。 */
function LoadOkButton() {
  const loadProfile = useProfileStore((state) => state.loadProfile)

  return (
    <button type="button" onClick={() => void loadProfile('ok')}>
      加载资料
    </button>
  )
}

/** 只选择加载失败的 Action。 */
function LoadFailButton() {
  const loadProfile = useProfileStore((state) => state.loadProfile)

  return (
    <button type="button" onClick={() => void loadProfile('fail')}>
      模拟失败
    </button>
  )
}

/** 只选择发出慢请求的 Action。 */
function LoadStaleButton() {
  const loadProfile = useProfileStore((state) => state.loadProfile)

  return (
    <button type="button" onClick={() => void loadProfile('stale')}>
      发出慢请求
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = useProfileStore((state) => state.ticks)

  return (
    <p className="async-action-ticks" aria-live="polite">
      无关计数 <strong data-testid="async-action-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示异步 Action 的 loading、结果、错误和过期写入。 */
function AsyncActionDemo() {
  const tick = useProfileStore((state) => state.tick)
  const reset = useProfileStore((state) => state.reset)

  return (
    <section className="async-action-demo" data-testid="async-action-demo">
      <header className="async-action-heading">
        <p>Zustand async action</p>
        <h2>准备好再写入，过期结果丢掉</h2>
        <span>先发出慢请求再模拟失败时，迟到的成功不会覆盖错误。</span>
      </header>

      <TicksDisplay />

      <div className="async-action-panels">
        <LoadingSubscriber />
        <ProfileSubscriber />
        <ErrorSubscriber />
        <WholeStoreSubscriber />
      </div>

      <div className="async-action-actions">
        <LoadOkButton />
        <LoadFailButton />
        <LoadStaleButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
        <button type="button" onClick={reset}>
          重置资料
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供异步 Action 观察组件。 */
export function createAsyncActionDemo(): ComponentType {
  return AsyncActionDemo
}
