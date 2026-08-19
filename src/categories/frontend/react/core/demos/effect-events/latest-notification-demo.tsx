import { useEffect, useEffectEvent, useRef, useState } from 'react'
import './latest-notification-demo.css'

type RoomId = 'alpha' | 'beta'
type Theme = 'light' | 'dark'

type Notification = Readonly<{
  roomId: RoomId
  theme: Theme
}>

type ConnectedListener = () => void

/** 模拟只由 Effect 建立和清理的本地房间连接。 */
class RoomConnection {
  private listener: ConnectedListener | null = null
  private connected = false

  /** 保存本轮连接对应的房间。 */
  constructor(readonly roomId: RoomId) {}

  /** 登记连接事件监听器，并返回对称的注销函数。 */
  subscribe(listener: ConnectedListener): () => void {
    this.listener = listener
    return () => {
      if (this.listener === listener) this.listener = null
    }
  }

  /** 建立确定性的本地连接。 */
  connect(): void {
    this.connected = true
  }

  /** 断开连接并阻止旧连接继续发布事件。 */
  disconnect(): void {
    this.connected = false
    this.listener = null
  }

  /** 由普通按钮触发外部连接事件，再调用 Effect 内登记的监听器。 */
  emitConnected(): void {
    if (this.connected) this.listener?.()
  }
}

type LatestNotificationSceneProps = Readonly<{
  onReset: () => void
}>

/** 演示房间变化重连，而主题只在连接事件发生时读取最新值。 */
function LatestNotificationScene({ onReset }: LatestNotificationSceneProps) {
  const [roomId, setRoomId] = useState<RoomId>('alpha')
  const [theme, setTheme] = useState<Theme>('light')
  const [connectionCount, setConnectionCount] = useState(0)
  const [notification, setNotification] = useState<Notification | null>(null)
  const connectionRef = useRef<RoomConnection | null>(null)
  const connectionCountRef = useRef(0)

  /** 在连接事件发生时读取最新主题，而不把主题变成重连条件。 */
  const onConnected = useEffectEvent((connectedRoomId: RoomId) => {
    setNotification({ roomId: connectedRoomId, theme })
  })

  /** 只按房间变化建立连接，并对称注销监听器与断开资源。 */
  useEffect(() => {
    const connection = new RoomConnection(roomId)
    const unsubscribe = connection.subscribe(() => onConnected(roomId))
    connectionCountRef.current += 1
    connectionRef.current = connection
    connection.connect()
    setConnectionCount(connectionCountRef.current)

    return () => {
      unsubscribe()
      connection.disconnect()
      if (connectionRef.current === connection) connectionRef.current = null
    }
  }, [roomId])

  /** 切换当前房间，让外围 Effect 重新建立连接。 */
  function handleRoomChange(nextRoomId: RoomId) {
    setRoomId(nextRoomId)
    setNotification(null)
  }

  /** 切换通知主题，但不改变当前连接。 */
  function handleThemeChange(nextTheme: Theme) {
    setTheme(nextTheme)
  }

  /** 通过连接替身发布事件，不从普通事件处理器直接调用 Effect Event。 */
  function handleConnectedEvent() {
    connectionRef.current?.emitConnected()
  }

  return (
    <section className="effect-events-demo" data-testid="effect-events-demo">
      <header className="effect-events-demo-heading">
        <p>Reactive connection · latest notification</p>
        <h2>房间决定连接，主题决定通知外观</h2>
        <span>主题变化不会重连；下一次连接事件仍能读取最新主题。</span>
      </header>

      <div className="effect-events-demo-controls" aria-label="连接与通知设置">
        <label>
          <span>当前房间</span>
          <select
            aria-label="当前房间"
            value={roomId}
            onChange={(event) => handleRoomChange(event.target.value as RoomId)}
          >
            <option value="alpha">alpha</option>
            <option value="beta">beta</option>
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

      <div className="effect-events-demo-flow" aria-label="响应与非响应边界">
        <section>
          <span>响应条件</span>
          <strong>{roomId}</strong>
          <small>房间变化会停止旧连接并建立新连接。</small>
        </section>
        <span aria-hidden="true">→</span>
        <section>
          <span>Effect 建连次数</span>
          <strong data-testid="connection-count">{connectionCount}</strong>
          <small data-testid="connection-snapshot">{roomId} 房间已连接</small>
        </section>
        <span aria-hidden="true">→</span>
        <section>
          <span>最新非响应值</span>
          <strong>{theme}</strong>
          <small>Effect Event 在连接事件发生时读取。</small>
        </section>
      </div>

      <div
        className={`effect-events-demo-notification is-${notification?.theme ?? 'empty'}`}
        role="status"
        aria-live="polite"
      >
        <span>最近通知</span>
        <strong data-testid="latest-notification">
          {notification ? `${notification.roomId} / ${notification.theme}` : '暂无通知'}
        </strong>
      </div>

      <div className="effect-events-demo-actions">
        <button type="button" onClick={handleConnectedEvent}>
          触发连接事件
        </button>
        <button type="button" onClick={onReset}>
          重置演示
        </button>
      </div>
    </section>
  )
}

/** 通过重新挂载演示场景，把外部连接与界面状态一起恢复到冷启动。 */
export default function LatestNotificationDemo() {
  const [resetKey, setResetKey] = useState(0)

  /** 重新创建演示场景，清空连接、主题与通知。 */
  function resetScene() {
    setResetKey((current) => current + 1)
  }

  return <LatestNotificationScene key={resetKey} onReset={resetScene} />
}
