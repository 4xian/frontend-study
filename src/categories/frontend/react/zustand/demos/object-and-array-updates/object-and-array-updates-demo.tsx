import { create } from 'zustand'
import { type ComponentType, useRef, useState } from 'react'

import './object-and-array-updates-demo.css'

type Profile = {
  name: string
  city: string
}

type WorkspaceState = {
  profile: Profile
  tags: string[]
}

type WorkspaceActions = {
  rename: (name: string) => void
  moveTo: (city: string) => void
  addTag: (label: string) => void
  removeTag: (label: string) => void
  mutateCityInPlace: (city: string) => void
  reset: () => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

const initialWorkspaceState: WorkspaceState = {
  profile: {
    name: '林青',
    city: '杭州',
  },
  tags: ['草稿'],
}

const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  profile: { ...initialWorkspaceState.profile },
  tags: [...initialWorkspaceState.tags],
  /** 展开资料卡后写入新的姓名。 */
  rename: (name: string) =>
    set((state) => ({
      profile: { ...state.profile, name },
    })),
  /** 展开资料卡后写入新的城市。 */
  moveTo: (city: string) =>
    set((state) => ({
      profile: { ...state.profile, city },
    })),
  /** 用展开运算生成包含新标签的数组。 */
  addTag: (label: string) =>
    set((state) => ({
      tags: [...state.tags, label],
    })),
  /** 用 filter 生成去掉指定标签的新数组。 */
  removeTag: (label: string) =>
    set((state) => ({
      tags: state.tags.filter((item) => item !== label),
    })),
  /** 故意就地改城市，用来对照界面不会更新。 */
  mutateCityInPlace: (city: string) => {
    useWorkspaceStore.getState().profile.city = city
  },
  /** 恢复演示用的初始资料和标签。 */
  reset: () =>
    set({
      profile: { ...initialWorkspaceState.profile },
      tags: [...initialWorkspaceState.tags],
    }),
}))

/** 只选择资料卡，城市按不可变方式更新后才会增加渲染次数。 */
function ProfileSubscriber() {
  const profile = useWorkspaceStore((state) => state.profile)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="object-array-panel" data-testid="profile-subscriber">
      <span>选择 profile</span>
      <strong data-testid="workspace-profile">
        {profile.name} · {profile.city}
      </strong>
      <p>
        渲染次数 <b data-testid="profile-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择标签数组，资料卡变化时不应增加渲染次数。 */
function TagSubscriber() {
  const tags = useWorkspaceStore((state) => state.tags)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="object-array-panel" data-testid="tag-subscriber">
      <span>选择 tags</span>
      <strong data-testid="workspace-tags">{tags.join('、') || '空'}</strong>
      <p>
        渲染次数 <b data-testid="tag-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只负责编辑姓名，避免父组件订阅 profile。 */
function NameEditor() {
  const name = useWorkspaceStore((state) => state.profile.name)
  const rename = useWorkspaceStore((state) => state.rename)

  return (
    <label className="object-array-field">
      <span>rename(name)</span>
      <input value={name} aria-label="资料姓名" onChange={(event) => rename(event.target.value)} />
    </label>
  )
}

/** 只负责编辑城市。 */
function CityEditor() {
  const city = useWorkspaceStore((state) => state.profile.city)
  const moveTo = useWorkspaceStore((state) => state.moveTo)

  return (
    <label className="object-array-field">
      <span>moveTo(city)</span>
      <input value={city} aria-label="资料城市" onChange={(event) => moveTo(event.target.value)} />
    </label>
  )
}

/** 展示对象按层复制和数组替换的更新结果。 */
function ObjectAndArrayUpdatesDemo() {
  const addTag = useWorkspaceStore((state) => state.addTag)
  const removeTag = useWorkspaceStore((state) => state.removeTag)
  const mutateCityInPlace = useWorkspaceStore((state) => state.mutateCityInPlace)
  const reset = useWorkspaceStore((state) => state.reset)
  const [draftTag, setDraftTag] = useState('紧急')

  return (
    <section className="object-array-demo" data-testid="object-array-demo">
      <header className="object-array-heading">
        <p>Zustand immutable updates</p>
        <h2>嵌套对象按层复制，数组换成新数组</h2>
        <span>改城市时标签面板不应增加渲染次数；就地改城市不会刷新资料卡。</span>
      </header>

      <div className="object-array-panels">
        <ProfileSubscriber />
        <TagSubscriber />
      </div>

      <div className="object-array-controls">
        <NameEditor />
        <CityEditor />

        <label className="object-array-field">
          <span>新标签</span>
          <input
            value={draftTag}
            aria-label="新标签"
            onChange={(event) => setDraftTag(event.target.value)}
          />
        </label>

        <div className="object-array-actions">
          <button type="button" onClick={() => addTag(draftTag.trim() || '未命名')}>
            添加标签
          </button>
          <button type="button" onClick={() => removeTag('草稿')}>
            移除草稿
          </button>
          <button type="button" onClick={() => mutateCityInPlace('上海')}>
            就地改城市
          </button>
          <button type="button" onClick={reset}>
            重置工作区
          </button>
        </div>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供对象与数组更新观察组件。 */
export function createObjectAndArrayUpdatesDemo(): ComponentType {
  return ObjectAndArrayUpdatesDemo
}
