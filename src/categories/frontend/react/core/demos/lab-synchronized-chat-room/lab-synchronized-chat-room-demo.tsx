import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './lab-synchronized-chat-room-demo.css'

type RoomId = 'general' | 'travel' | 'music'
type ServerUrl = 'https://chat.local' | 'https://campus.local'
type Theme = 'light' | 'dark'
type ConnectionListener = () => void

type AuditEvent = Readonly<{
  id: number
  kind: 'connect' | 'disconnect' | 'notice' | 'message'
  detail: string
}>

type AuditSnapshot = Readonly<{
  setupCount: number
  cleanupCount: number
  activeCount: number
  activeTarget: string
  events: readonly AuditEvent[]
}>

const INITIAL_AUDIT: AuditSnapshot = {
  setupCount: 0,
  cleanupCount: 0,
  activeCount: 0,
  activeTarget: '尚未连接',
  events: [],
}

/** 保存聊天室连接的资源快照和最近事件。 */
class ChatAudit {
  private nextEventId = 0
  private snapshotValue: AuditSnapshot = INITIAL_AUDIT

  /** 为当前审计实例绑定稳定的 React 快照更新出口。 */
  constructor(private readonly publish: (snapshot: AuditSnapshot) => void) {}

  /** 记录一次连接 setup，并更新当前活跃目标。 */
  connect(serverUrl: ServerUrl, roomId: RoomId): void {
    this.update('connect', `连接 ${roomId} @ ${serverUrl}`, {
      setupCount: this.snapshotValue.setupCount + 1,
      activeCount: this.snapshotValue.activeCount + 1,
      activeTarget: `${roomId} @ ${serverUrl}`,
    })
  }

  /** 记录一次对称 cleanup，并释放当前连接。 */
  disconnect(serverUrl: ServerUrl, roomId: RoomId): void {
    const nextActiveCount = Math.max(0, this.snapshotValue.activeCount - 1)
    this.update('disconnect', `断开 ${roomId} @ ${serverUrl}`, {
      cleanupCount: this.snapshotValue.cleanupCount + 1,
      activeCount: nextActiveCount,
      activeTarget: nextActiveCount === 0 ? '尚未连接' : this.snapshotValue.activeTarget,
    })
  }

  /** 记录 Effect Event 使用最新主题生成的连接通知。 */
  notice(roomId: RoomId, theme: Theme): void {
    this.update('notice', `${roomId} 已连接，通知主题 ${theme}`)
  }

  /** 记录由用户事件发送的本地消息。 */
  message(roomId: RoomId, text: string): void {
    this.update('message', `${roomId}：${text}`)
  }

  /** 合并计数变化、追加事件，并发布不可变快照。 */
  private update(
    kind: AuditEvent['kind'],
    detail: string,
    changes: Partial<Omit<AuditSnapshot, 'events'>> = {},
  ): void {
    this.nextEventId += 1
    const events = [...this.snapshotValue.events, { id: this.nextEventId, kind, detail }].slice(-6)
    this.snapshotValue = { ...this.snapshotValue, ...changes, events }
    this.publish(this.snapshotValue)
  }
}

/** 模拟一份可订阅 connected 事件、可发送消息并可断开的本地连接。 */
class ChatConnection {
  private listener: ConnectionListener | null = null
  private connected = false

  /** 固定本连接的服务器、房间和资源审计对象。 */
  constructor(
    private readonly serverUrl: ServerUrl,
    private readonly roomId: RoomId,
    private readonly audit: ChatAudit,
  ) {}

  /** 登记 connected 事件监听器，并返回只撤销本次登记的函数。 */
  subscribeConnected(listener: ConnectionListener): () => void {
    this.listener = listener
    return () => {
      if (this.listener === listener) this.listener = null
    }
  }

  /** 建立本地连接并发布一次 connected 事件。 */
  connect(): void {
    if (this.connected) return
    this.connected = true
    this.audit.connect(this.serverUrl, this.roomId)
    this.listener?.()
  }

  /** 对称断开本连接，并阻止旧实例继续发布事件。 */
  disconnect(): void {
    if (!this.connected) return
    this.connected = false
    this.listener = null
    this.audit.disconnect(this.serverUrl, this.roomId)
  }

  /** 从当前连接再发布一次 connected 事件。 */
  emitConnected(): void {
    if (this.connected) this.listener?.()
  }

  /** 把非空消息写入当前房间的本地审计日志。 */
  send(text: string): void {
    if (this.connected) this.audit.message(this.roomId, text)
  }
}

type ChatRoomResult = Readonly<{
  emitConnected: () => void
  sendMessage: (text: string) => void
}>

/** 按服务器和房间同步连接，并用 Effect Event 读取最新主题。 */
function useChatRoom(
  audit: ChatAudit,
  serverUrl: ServerUrl,
  roomId: RoomId,
  theme: Theme,
): ChatRoomResult {
  const connectionRef = useRef<ChatConnection | null>(null)

  /** 处理连接事件时读取最新主题，不把主题变成重连条件。 */
  const onConnected = useEffectEvent(() => {
    audit.notice(roomId, theme)
  })

  useEffect(() => {
    const connection = new ChatConnection(serverUrl, roomId, audit)
    const unsubscribe = connection.subscribeConnected(onConnected)
    connectionRef.current = connection
    connection.connect()

    return () => {
      unsubscribe()
      connection.disconnect()
      if (connectionRef.current === connection) connectionRef.current = null
    }
  }, [audit, serverUrl, roomId])

  /** 让当前连接重新发布 connected 事件。 */
  function emitConnected(): void {
    connectionRef.current?.emitConnected()
  }

  /** 由普通用户事件把消息发给当前连接。 */
  function sendMessage(text: string): void {
    connectionRef.current?.send(text)
  }

  return { emitConnected, sendMessage }
}

type ChatRoomSceneProps = Readonly<{
  onReset: () => void
}>

/** 组合房间、服务器、主题、消息和连接审计的完整实战场景。 */
function ChatRoomScene({ onReset }: ChatRoomSceneProps) {
  const [serverUrl, setServerUrl] = useState<ServerUrl>('https://chat.local')
  const [roomId, setRoomId] = useState<RoomId>('general')
  const [theme, setTheme] = useState<Theme>('light')
  const [draft, setDraft] = useState('')
  const [auditSnapshot, setAuditSnapshot] = useState<AuditSnapshot>(INITIAL_AUDIT)
  const [audit] = useState(() => new ChatAudit(setAuditSnapshot))
  const { emitConnected, sendMessage } = useChatRoom(audit, serverUrl, roomId, theme)
  const activeBalanced = auditSnapshot.activeCount === 1

  /** 切换服务器地址，让 Effect 释放旧连接后建立新连接。 */
  function handleServerChange(event: ChangeEvent<HTMLSelectElement>): void {
    setServerUrl(event.target.value as ServerUrl)
  }

  /** 切换房间，让 Effect 按新的响应值重新同步。 */
  function handleRoomChange(event: ChangeEvent<HTMLSelectElement>): void {
    setRoomId(event.target.value as RoomId)
  }

  /** 修改通知主题，不改变当前连接身份。 */
  function handleThemeChange(nextTheme: Theme): void {
    setTheme(nextTheme)
  }

  /** 更新受控的本地消息草稿。 */
  function handleDraftChange(event: ChangeEvent<HTMLInputElement>): void {
    setDraft(event.target.value)
  }

  /** 在提交事件中发送非空消息，再清空草稿。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return
    sendMessage(message)
    setDraft('')
  }

  return (
    <section className="chat-room-demo" data-testid="chat-room-demo">
      <header className="chat-room-heading">
        <div>
          <p>Synchronized chat room</p>
          <h2>切换目标时重连，主题变化时保留连接</h2>
          <span>连接由 Effect 持有，消息由用户事件发送。</span>
        </div>
        <button type="button" onClick={onReset}>
          重置聊天室
        </button>
      </header>

      <div className="chat-room-settings" aria-label="聊天室连接设置">
        <label>
          <span>服务器</span>
          <select value={serverUrl} onChange={handleServerChange}>
            <option value="https://chat.local">chat.local</option>
            <option value="https://campus.local">campus.local</option>
          </select>
        </label>

        <label>
          <span>房间</span>
          <select value={roomId} onChange={handleRoomChange}>
            <option value="general">general</option>
            <option value="travel">travel</option>
            <option value="music">music</option>
          </select>
        </label>

        <fieldset>
          <legend>通知主题</legend>
          <button
            type="button"
            aria-pressed={theme === 'light'}
            onClick={() => handleThemeChange('light')}
          >
            浅色
          </button>
          <button
            type="button"
            aria-pressed={theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
          >
            深色
          </button>
        </fieldset>
      </div>

      <div className="chat-room-status" aria-label="连接资源状态">
        <div>
          <span>当前目标</span>
          <strong data-testid="chat-active-target">{auditSnapshot.activeTarget}</strong>
        </div>
        <div>
          <span>setup</span>
          <strong data-testid="chat-setup-count">{auditSnapshot.setupCount}</strong>
        </div>
        <div>
          <span>cleanup</span>
          <strong data-testid="chat-cleanup-count">{auditSnapshot.cleanupCount}</strong>
        </div>
        <div>
          <span>活跃连接</span>
          <strong data-testid="chat-active-count">{auditSnapshot.activeCount}</strong>
        </div>
      </div>

      <p
        className={activeBalanced ? 'chat-room-invariant is-balanced' : 'chat-room-invariant'}
        data-testid="chat-resource-invariant"
        role="status"
        aria-live="polite"
      >
        {activeBalanced ? '资源平衡：当前只有一份活跃连接' : '正在同步连接资源'}
      </p>

      <div className={`chat-room-notice is-${theme}`}>
        <span>Effect Event 观察</span>
        <strong>当前主题：{theme}</strong>
        <button type="button" onClick={emitConnected}>
          触发 connected 事件
        </button>
      </div>

      <form className="chat-room-composer" onSubmit={handleSubmit}>
        <label htmlFor="chat-room-message">本地消息</label>
        <div>
          <input
            id="chat-room-message"
            value={draft}
            onChange={handleDraftChange}
            placeholder="输入要发送的消息"
          />
          <button type="submit" disabled={!draft.trim()}>
            发送消息
          </button>
        </div>
      </form>

      <section className="chat-room-events" aria-labelledby="chat-room-events-title">
        <h3 id="chat-room-events-title">最近事件</h3>
        {auditSnapshot.events.length > 0 ? (
          <ol data-testid="chat-event-log">
            {auditSnapshot.events.map((event) => (
              <li key={event.id} data-event-kind={event.kind}>
                <span>{event.id}</span>
                <strong>{event.kind}</strong>
                <span>{event.detail}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p data-testid="chat-event-log">尚无事件</p>
        )}
      </section>
    </section>
  )
}

/** 用新的组件身份重置 State、连接资源和审计日志。 */
export default function LabSynchronizedChatRoomDemo() {
  const [sceneKey, setSceneKey] = useState(0)

  /** 重新挂载完整实战场景。 */
  function handleReset(): void {
    setSceneKey((current) => current + 1)
  }

  return <ChatRoomScene key={sceneKey} onReset={handleReset} />
}
