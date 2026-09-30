import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { type ComponentType, useRef } from 'react'

import './immer-middleware-demo.css'

type WorkspaceStore = {
  profile: { name: string; city: string }
  tags: string[]
  ticks: number
  moveTo: (city: string) => void
  addTag: (label: string) => void
  tick: () => void
}

const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set, get) => ({
    profile: { name: '林青', city: '杭州' },
    tags: ['草稿'],
    ticks: 0,
    /** 在草稿上改城市，姓名仍留在同一份资料对象里。 */
    moveTo: (city) =>
      set((state) => {
        state.profile.city = city
      }),
    /** 在草稿数组上 push，当前标签换成新引用。 */
    addTag: (label) =>
      set((state) => {
        state.tags.push(label)
      }),
    /** 用对象 updater 增加无关计数，不走 produce。 */
    tick: () => set({ ticks: get().ticks + 1 }),
  })),
)

/** 选择资料对象，展示草稿赋值后姓名仍在、引用被换掉。 */
function ProfilePane() {
  const profile = useWorkspaceStore((state) => state.profile)
  const previousProfile = useRef(profile)
  const replaced = previousProfile.current !== profile
  previousProfile.current = profile

  return (
    <section className="immer-pane" data-testid="profile-pane">
      <h3>资料草稿</h3>
      <p>
        姓名 <strong data-testid="profile-name">{profile.name}</strong>
      </p>
      <p>
        城市 <strong data-testid="profile-city">{profile.city}</strong>
      </p>
      <p className="immer-count">
        资料引用 <strong data-testid="profile-replaced">{replaced ? '已更换' : '未更换'}</strong>
      </p>
    </section>
  )
}

/** 选择标签数组，展示 push 后当前数组是新引用。 */
function TagsPane() {
  const tags = useWorkspaceStore((state) => state.tags)
  const previousTags = useRef(tags)
  const replaced = previousTags.current !== tags
  previousTags.current = tags

  return (
    <section className="immer-pane" data-testid="tags-pane">
      <h3>标签草稿</h3>
      <pre data-testid="tag-list">{tags.join('、')}</pre>
      <p className="immer-count">
        标签引用 <strong data-testid="tags-replaced">{replaced ? '已更换' : '未更换'}</strong>
      </p>
    </section>
  )
}

/** 选择无关计数，对象 updater 不应换掉资料和标签引用。 */
function TicksPane() {
  const ticks = useWorkspaceStore((state) => state.ticks)

  return (
    <section className="immer-pane" data-testid="ticks-pane">
      <h3>对象 updater</h3>
      <p className="immer-count">
        无关计数 <strong data-testid="immer-ticks">{ticks}</strong>
      </p>
    </section>
  )
}

/** 对照草稿赋值、数组 push 和对象浅合并。 */
function ImmerMiddlewareDemo() {
  return (
    <section className="immer-demo" data-testid="immer-middleware-demo">
      <header className="immer-heading">
        <p>Zustand Immer Middleware</p>
        <h2>在草稿上改城市和标签，对象 updater 仍浅合并</h2>
        <span>
          迁到上海后姓名仍在，资料引用被换掉。增加标签后当前数组是新引用。增加无关计数时，资料和标签引用都不变。
        </span>
      </header>

      <div className="immer-panes">
        <ProfilePane />
        <TagsPane />
        <TicksPane />
      </div>

      <div className="immer-actions">
        <button
          type="button"
          data-testid="move-to-shanghai"
          onClick={() => useWorkspaceStore.getState().moveTo('上海')}
        >
          迁到上海
        </button>
        <button
          type="button"
          data-testid="add-tag"
          onClick={() => useWorkspaceStore.getState().addTag('紧急')}
        >
          增加标签
        </button>
        <button
          type="button"
          data-testid="bump-ticks"
          onClick={() => useWorkspaceStore.getState().tick()}
        >
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 Immer Middleware 观察组件。 */
export function createImmerMiddlewareDemo(): ComponentType {
  return ImmerMiddlewareDemo
}
