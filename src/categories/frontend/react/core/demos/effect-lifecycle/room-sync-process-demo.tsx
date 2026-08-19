import { useEffect, useReducer, useRef, useState } from 'react'
import './room-sync-process-demo.css'

type RoomId = 'alpha' | 'beta'
type SyncEventKind = 'start' | 'stop'

type SyncEvent = {
  id: number
  kind: SyncEventKind
  roomId: RoomId
}

/** 保存一个确定性的外部同步过程，并通知界面刷新可观察快照。 */
class RoomSyncProcess {
  private activeRoom: RoomId | null = null
  private nextEventId = 0
  private readonly events: SyncEvent[] = []

  /** 创建带有稳定界面刷新出口的本地同步过程。 */
  constructor(private readonly notify: () => void) {}

  /** 开始同步指定房间，并记录本次 start。 */
  start(roomId: RoomId): void {
    this.activeRoom = roomId
    this.record('start', roomId)
  }

  /** 停止本次 setup 获得的房间同步，并记录本次 stop。 */
  stop(roomId: RoomId): void {
    if (this.activeRoom === roomId) this.activeRoom = null
    this.record('stop', roomId)
  }

  /** 返回活动房间和最近的生命周期事件。 */
  snapshot(): { activeRoom: RoomId | null; events: readonly SyncEvent[] } {
    return { activeRoom: this.activeRoom, events: this.events }
  }

  /** 追加一条有序事件，并让宿主读取最新快照。 */
  private record(kind: SyncEventKind, roomId: RoomId): void {
    this.nextEventId += 1
    this.events.push({ id: this.nextEventId, kind, roomId })
    if (this.events.length > 2) this.events.shift()
    this.notify()
  }
}

type RoomSynchronizerProps = {
  process: RoomSyncProcess
  roomId: RoomId
}

/** 用一个 Effect 把当前房间同步过程成对启动和停止。 */
function RoomSynchronizer({ process, roomId }: RoomSynchronizerProps) {
  useEffect(() => {
    process.start(roomId)
    return () => {
      process.stop(roomId)
    }
  }, [process, roomId])

  return null
}

/** 演示 Effect 在房间切换、隐藏和重新显示时的独立同步生命周期。 */
export default function RoomSyncProcessDemo() {
  const [, refresh] = useReducer((revision: number) => revision + 1, 0)
  const processRef = useRef<RoomSyncProcess | null>(null)
  const [roomId, setRoomId] = useState<RoomId>('alpha')
  const [syncing, setSyncing] = useState(true)
  const [renderCount, setRenderCount] = useState(0)
  const [mountVersion, setMountVersion] = useState(0)

  if (processRef.current === null) processRef.current = new RoomSyncProcess(refresh)
  const process = processRef.current
  const otherRoom: RoomId = roomId === 'alpha' ? 'beta' : 'alpha'
  const snapshot = process.snapshot()

  /** 只触发无关渲染，观察同步过程是否保持不变。 */
  function handleRerender(): void {
    setRenderCount((count) => count + 1)
  }

  /** 改变同步输入，让旧过程停止后开始新过程。 */
  function handleSwitchRoom(): void {
    setRoomId(otherRoom)
  }

  /** 通过挂载或卸载同步组件观察当前过程的 stop/start。 */
  function handleToggleSync(): void {
    setSyncing((current) => !current)
  }

  /** 创建新过程并恢复 alpha、显示和渲染计数的冷状态。 */
  function handleReset(): void {
    processRef.current = new RoomSyncProcess(refresh)
    setRoomId('alpha')
    setSyncing(true)
    setRenderCount(0)
    setMountVersion((version) => version + 1)
  }

  return (
    <section className="effect-lifecycle-demo" data-testid="effect-lifecycle-demo">
      {syncing ? <RoomSynchronizer key={mountVersion} process={process} roomId={roomId} /> : null}
      <header className="effect-lifecycle-demo-heading">
        <p>独立同步过程</p>
        <h2>先停止旧房间，再开始新房间</h2>
        <span>Effect 的 start 与 stop 不等同于组件的 mount 与 unmount。</span>
      </header>

      <div className="effect-lifecycle-demo-controls" aria-label="Effect 生命周期控制">
        <button type="button" onClick={handleRerender}>
          无关渲染 +1
        </button>
        <button type="button" onClick={handleSwitchRoom}>
          切换到 {otherRoom}
        </button>
        <button type="button" aria-pressed={syncing} onClick={handleToggleSync}>
          {syncing ? '隐藏同步过程' : '重新显示同步过程'}
        </button>
        <button type="button" onClick={handleReset}>
          重置场景
        </button>
      </div>

      <div className="effect-lifecycle-demo-status" role="status">
        <div>
          <span>活动同步</span>
          <strong data-testid="lifecycle-active-room">
            {snapshot.activeRoom ? `已同步 ${snapshot.activeRoom}` : '已停止'}
          </strong>
        </div>
        <div>
          <span>当前输入</span>
          <strong data-testid="lifecycle-room-id">{roomId}</strong>
        </div>
        <div>
          <span>无关渲染</span>
          <strong data-testid="lifecycle-render-count">{renderCount}</strong>
        </div>
      </div>

      <div className="effect-lifecycle-demo-events" aria-label="最近同步事件">
        <strong>最近同步事件</strong>
        {snapshot.events.length > 0 ? (
          <ol data-testid="lifecycle-events">
            {snapshot.events.map((event) => (
              <li key={event.id} data-event-kind={event.kind}>
                <span>{event.id}</span>
                <strong>{event.kind === 'start' ? '开始' : '停止'}</strong>
                <span>{event.roomId}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p data-testid="lifecycle-events">尚无同步事件</p>
        )}
      </div>
    </section>
  )
}
