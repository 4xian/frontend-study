import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './resource-symmetry-demo.css'

type RoomId = 'general' | 'travel' | 'music'

type ResourceAudit = {
  setupCount: number
  cleanupCount: number
  activeConnections: number
  connectedRoom: RoomId | null
}

type Story = Readonly<{
  id: string
  title: string
}>

const baseStories: readonly Story[] = [
  { id: 'render', title: '纯渲染' },
  { id: 'cleanup', title: '对称清理' },
]

const createStory: Story = { id: 'create', title: '添加观察' }

/** 复制当前资源审计值，避免页面 State 持有可变对象。 */
function copyAudit(audit: ResourceAudit): ResourceAudit {
  return { ...audit }
}

/** 创建一份可连接、可对称断开的本地聊天室资源。 */
function createConnection(roomId: RoomId, audit: ResourceAudit) {
  let connected = false

  return {
    /** 建立当前房间资源，并记录一份活跃连接。 */
    connect() {
      if (connected) return
      connected = true
      audit.setupCount += 1
      audit.activeConnections += 1
      audit.connectedRoom = roomId
    },
    /** 只撤销当前连接对象建立的房间资源。 */
    disconnect() {
      if (!connected) return
      connected = false
      audit.cleanupCount += 1
      audit.activeConnections -= 1
      if (audit.connectedRoom === roomId) audit.connectedRoom = null
    },
  }
}

/** 通过局部新数组生成稳定故事列表，不修改只读输入。 */
function PureStoryList() {
  const visibleStories = [...baseStories, createStory]

  return (
    <ul className="strict-mode-story-list" aria-label="纯渲染观察列表">
      {visibleStories.map((story) => (
        <li key={story.id}>{story.title}</li>
      ))}
    </ul>
  )
}

/** 展示重复渲染与资源重连后的最终不变量。 */
function StrictModeProbe() {
  const [roomId, setRoomId] = useState<RoomId>('general')
  const [renderActions, setRenderActions] = useState(0)
  const auditRef = useRef<ResourceAudit>({
    setupCount: 0,
    cleanupCount: 0,
    activeConnections: 0,
    connectedRoom: null,
  })
  const [auditSnapshot, setAuditSnapshot] = useState(() => copyAudit(auditRef.current))

  useEffect(() => {
    const connection = createConnection(roomId, auditRef.current)
    connection.connect()
    setAuditSnapshot(copyAudit(auditRef.current))

    return () => {
      connection.disconnect()
    }
  }, [roomId])

  /** 切换房间，让旧连接先清理、新连接再建立。 */
  function handleRoomChange(event: ChangeEvent<HTMLSelectElement>) {
    setRoomId(event.target.value as RoomId)
  }

  /** 触发与连接依赖无关的普通重新渲染。 */
  function handleRender() {
    setRenderActions((current) => current + 1)
  }

  const resourceBalanced = auditSnapshot.activeConnections === 1

  return (
    <div className="strict-mode-probe">
      <section className="strict-mode-panel" aria-labelledby="strict-mode-render-title">
        <span>render 检查</span>
        <h3 id="strict-mode-render-title">相同输入保持相同结果</h3>
        <PureStoryList />
        <dl className="strict-mode-metrics">
          <div>
            <dt>故事数量</dt>
            <dd data-testid="story-count">3</dd>
          </div>
          <div>
            <dt>用户动作</dt>
            <dd data-testid="render-actions">{renderActions}</dd>
          </div>
        </dl>
        <button type="button" onClick={handleRender}>
          触发普通重新渲染
        </button>
      </section>

      <section className="strict-mode-panel" aria-labelledby="strict-mode-resource-title">
        <span>Effect 检查</span>
        <h3 id="strict-mode-resource-title">重复 setup 后仍保留一份资源</h3>
        <label htmlFor="strict-mode-room">当前房间</label>
        <select id="strict-mode-room" value={roomId} onChange={handleRoomChange}>
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
        <dl className="strict-mode-metrics">
          <div>
            <dt>setup</dt>
            <dd data-testid="setup-count">{auditSnapshot.setupCount}</dd>
          </div>
          <div>
            <dt>cleanup</dt>
            <dd data-testid="cleanup-count">{auditSnapshot.cleanupCount}</dd>
          </div>
          <div>
            <dt>活跃连接</dt>
            <dd data-testid="active-count">{auditSnapshot.activeConnections}</dd>
          </div>
        </dl>
        <p
          className={resourceBalanced ? 'strict-mode-result is-balanced' : 'strict-mode-result'}
          data-testid="resource-invariant"
          role="status"
          aria-live="polite"
        >
          {resourceBalanced
            ? `资源平衡：${auditSnapshot.connectedRoom ?? roomId} 只有一份活跃连接`
            : '资源异常：请检查 setup 与 cleanup 是否对称'}
        </p>
      </section>
    </div>
  )
}

/** 提供可重置的 StrictMode 资源对称性观察区。 */
export default function ResourceSymmetryDemo() {
  const [probeKey, setProbeKey] = useState(0)

  /** 使用新的组件身份重新开始观察。 */
  function handleReset() {
    setProbeKey((current) => current + 1)
  }

  return (
    <section className="strict-mode-demo" data-testid="strict-mode-demo">
      <header className="strict-mode-heading">
        <div>
          <p>StrictMode development checks</p>
          <h2>验证纯渲染与资源对称性</h2>
          <span>关注最终不变量，不把开发调用次数当成业务合同。</span>
        </div>
        <button type="button" onClick={handleReset}>
          重置观察
        </button>
      </header>

      <StrictModeProbe key={probeKey} />
    </section>
  )
}
