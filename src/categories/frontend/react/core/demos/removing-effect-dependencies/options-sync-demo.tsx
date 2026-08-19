import { useEffect, useRef, useState } from 'react'
import './options-sync-demo.css'

type RoomId = 'alpha' | 'beta'

type SyncOptions = Readonly<{
  endpoint: string
  roomId: RoomId
}>

type WidgetSnapshot = Readonly<{
  endpoint: string
  roomId: RoomId | '尚未同步'
  syncCount: number
}>

const roomEndpoint = 'https://rooms.example.local'

/** 模拟接受配置对象的本地外部系统。 */
class RoomSyncWidget {
  private snapshot: WidgetSnapshot = {
    endpoint: '尚未同步',
    roomId: '尚未同步',
    syncCount: 0,
  }

  /** 保存最新快照的发布函数。 */
  constructor(private readonly publish: (snapshot: WidgetSnapshot) => void) {}

  /** 记录 Effect 对外部系统发起的每一次同步。 */
  synchronize(options: SyncOptions): void {
    this.snapshot = {
      ...options,
      syncCount: this.snapshot.syncCount + 1,
    }
    this.publish(this.snapshot)
  }
}

type OptionsSyncSceneProps = Readonly<{
  onReset: () => void
}>

/** 演示把仅供 Effect 使用的 options 对象移入 Effect 以减少依赖。 */
function OptionsSyncScene({ onReset }: OptionsSyncSceneProps) {
  const [roomId, setRoomId] = useState<RoomId>('alpha')
  const [note, setNote] = useState('')
  const [widgetSnapshot, setWidgetSnapshot] = useState<WidgetSnapshot>({
    endpoint: '尚未同步',
    roomId: '尚未同步',
    syncCount: 0,
  })
  const widgetRef = useRef<RoomSyncWidget | null>(null)

  if (widgetRef.current === null) {
    widgetRef.current = new RoomSyncWidget(setWidgetSnapshot)
  }

  useEffect(() => {
    const options: SyncOptions = {
      endpoint: roomEndpoint,
      roomId,
    }

    widgetRef.current?.synchronize(options)
  }, [roomId])

  return (
    <section
      className="removing-effect-dependencies-demo"
      data-testid="removing-effect-dependencies-demo"
    >
      <header className="removing-effect-dependencies-demo-heading">
        <p>把不必要的依赖移出 render</p>
        <h2>同步真正需要的值，而不是对象身份</h2>
        <span>options 只供 Effect 同步外部 Widget；备注只改变界面。</span>
      </header>

      <div className="removing-effect-dependencies-demo-controls">
        <label>
          <span>房间</span>
          <select value={roomId} onChange={(event) => setRoomId(event.target.value as RoomId)}>
            <option value="alpha">alpha</option>
            <option value="beta">beta</option>
          </select>
        </label>
        <label className="removing-effect-dependencies-demo-note-field">
          <span>无关备注</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：仅供界面显示"
          />
        </label>
      </div>

      <div className="removing-effect-dependencies-demo-flow" aria-label="渲染值与外部系统快照">
        <section>
          <span>当前 React 输入</span>
          <strong data-testid="removing-effect-room-input">{roomId}</strong>
          <small data-testid="removing-effect-note-preview">备注：{note || '无'}</small>
        </section>
        <span aria-hidden="true">→</span>
        <section>
          <span>Widget 同步快照</span>
          <strong data-testid="removing-effect-widget-room">{widgetSnapshot.roomId}</strong>
          <small data-testid="removing-effect-widget-endpoint">{widgetSnapshot.endpoint}</small>
        </section>
      </div>

      <div className="removing-effect-dependencies-demo-result" role="status">
        <span>Effect 同步次数</span>
        <strong data-testid="removing-effect-widget-sync-count">{widgetSnapshot.syncCount}</strong>
        <code>options 在 Effect 内构造 · [roomId]</code>
      </div>

      <button type="button" onClick={onReset}>
        重置场景
      </button>
    </section>
  )
}

/** 通过替换场景实例恢复房间、备注和 Widget 的冷状态。 */
export default function OptionsSyncDemo() {
  const [sceneKey, setSceneKey] = useState(0)

  return <OptionsSyncScene key={sceneKey} onReset={() => setSceneKey((key) => key + 1)} />
}
