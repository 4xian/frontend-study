import { useEffect, useRef, useState } from 'react'
import './dependency-map-demo.css'

type Region = 'north' | 'south'
type RoomId = 'alpha' | 'beta'

type WidgetSnapshot = Readonly<{
  endpoint: string
  roomId: RoomId | '尚未同步'
  syncCount: number
}>

const ENDPOINTS: Readonly<Record<Region, string>> = {
  north: 'north.example.local',
  south: 'south.example.local',
}

/** 模拟 React 外部系统，并发布最近一次有效同步快照。 */
class DependencyWidget {
  private snapshot: WidgetSnapshot = {
    endpoint: '尚未同步',
    roomId: '尚未同步',
    syncCount: 0,
  }

  /** 保存用于把外部系统快照投影回界面的发布函数。 */
  constructor(private readonly publish: (snapshot: WidgetSnapshot) => void) {}

  /** 记录 Effect 对外部系统发起的每一次同步。 */
  synchronize(endpoint: string, roomId: RoomId): void {
    this.snapshot = {
      endpoint,
      roomId,
      syncCount: this.snapshot.syncCount + 1,
    }
    this.publish(this.snapshot)
  }
}

type DependencySceneProps = Readonly<{
  onReset: () => void
}>

/** 演示两个真实依赖变化与一次无关 render 的同步边界。 */
function DependencyScene({ onReset }: DependencySceneProps) {
  const [region, setRegion] = useState<Region>('north')
  const [roomId, setRoomId] = useState<RoomId>('alpha')
  const [note, setNote] = useState('')
  const [widgetSnapshot, setWidgetSnapshot] = useState<WidgetSnapshot>({
    endpoint: '尚未同步',
    roomId: '尚未同步',
    syncCount: 0,
  })
  const widgetRef = useRef<DependencyWidget | null>(null)
  const endpoint = ENDPOINTS[region]

  if (widgetRef.current === null) {
    widgetRef.current = new DependencyWidget(setWidgetSnapshot)
  }

  useEffect(() => {
    widgetRef.current?.synchronize(endpoint, roomId)
  }, [endpoint, roomId])

  return (
    <section className="effect-dependencies-demo" data-testid="effect-dependencies-demo">
      <header className="effect-dependencies-demo-heading">
        <p>完整依赖清单</p>
        <h2>Effect 读取什么，就声明什么</h2>
        <span>区域决定 endpoint，房间决定同步目标；备注只制造无关 render。</span>
      </header>

      <div className="effect-dependencies-demo-controls">
        <label>
          <span>区域</span>
          <select value={region} onChange={(event) => setRegion(event.target.value as Region)}>
            <option value="north">north</option>
            <option value="south">south</option>
          </select>
        </label>
        <label>
          <span>房间</span>
          <select value={roomId} onChange={(event) => setRoomId(event.target.value as RoomId)}>
            <option value="alpha">alpha</option>
            <option value="beta">beta</option>
          </select>
        </label>
        <label className="effect-dependencies-demo-note-field">
          <span>无关备注</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：仅供界面显示"
          />
        </label>
      </div>

      <div className="effect-dependencies-demo-flow" aria-label="依赖与外部系统快照">
        <section>
          <span>当前 React 输入</span>
          <strong data-testid="dependency-input-endpoint">{endpoint}</strong>
          <small data-testid="dependency-note-preview">备注：{note || '无'}</small>
        </section>
        <span aria-hidden="true">→</span>
        <section>
          <span>Widget 同步快照</span>
          <strong data-testid="dependency-widget-endpoint">{widgetSnapshot.endpoint}</strong>
          <small>
            room: <b data-testid="dependency-widget-room">{widgetSnapshot.roomId}</b>
          </small>
        </section>
      </div>

      <div className="effect-dependencies-demo-result" role="status">
        <span>Effect 同步次数</span>
        <strong data-testid="dependency-widget-sync-count">{widgetSnapshot.syncCount}</strong>
        <code>[endpoint, roomId]</code>
      </div>

      <button type="button" onClick={onReset}>
        重置场景
      </button>
    </section>
  )
}

/** 通过替换场景实例恢复外部 Widget 与全部输入的冷状态。 */
export default function DependencyMapDemo() {
  const [sceneKey, setSceneKey] = useState(0)

  return <DependencyScene key={sceneKey} onReset={() => setSceneKey((key) => key + 1)} />
}
