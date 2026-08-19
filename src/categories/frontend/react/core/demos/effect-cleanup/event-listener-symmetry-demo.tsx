import { useEffect, useReducer, useState } from 'react'
import './event-listener-symmetry-demo.css'

type ChannelId = 'alpha' | 'beta'
type SignalListener = (message: string) => void
type ScenarioChannels = Record<ChannelId, SignalChannel>

/** 保存一个确定性的外部事件频道，并追踪仍然活跃的监听结果。 */
class SignalChannel {
  private readonly listeners = new Set<SignalListener>()
  private deliveredSignals = 0
  private lastDeliveredSignal = 'none'
  private sequence = 0

  /** 绑定频道身份与稳定的界面刷新回调。 */
  constructor(
    readonly id: ChannelId,
    private readonly notify: () => void,
  ) {}

  /** 注册一个外部事件监听器。 */
  addListener(listener: SignalListener): void {
    this.listeners.add(listener)
    this.notify()
  }

  /** 撤销传入的同一个外部事件监听器。 */
  removeListener(listener: SignalListener): void {
    this.listeners.delete(listener)
    this.notify()
  }

  /** 向当前仍存活的监听器发送一个确定性信号。 */
  emit(): void {
    this.sequence += 1
    const message = `${this.id}-${this.sequence}`

    this.listeners.forEach((listener) => {
      this.deliveredSignals += 1
      this.lastDeliveredSignal = message
      listener(message)
    })
    this.notify()
  }

  /** 返回供界面观察的资源和事件快照。 */
  snapshot() {
    return {
      activeListeners: this.listeners.size,
      deliveredSignals: this.deliveredSignals,
      lastDeliveredSignal: this.lastDeliveredSignal,
    }
  }
}

type ListenerRegistrationProps = {
  channel: SignalChannel
}

/** 在当前频道注册监听，并在频道变化或卸载时撤销同一 handler。 */
function ListenerRegistration({ channel }: ListenerRegistrationProps) {
  useEffect(() => {
    /** 接收当前频道消息；可观察计数由外部频道维护。 */
    function handleSignal(_message: string): void {}

    channel.addListener(handleSignal)
    return () => {
      channel.removeListener(handleSignal)
    }
  }, [channel])

  return null
}

/** 创建两个共享同一刷新出口的确定性频道。 */
function createChannels(notify: () => void): ScenarioChannels {
  return {
    alpha: new SignalChannel('alpha', notify),
    beta: new SignalChannel('beta', notify),
  }
}

/** 演示监听资源在频道切换、卸载和重置路径中的对称清理。 */
export default function EffectCleanupDemo() {
  const [, refresh] = useReducer((revision: number) => revision + 1, 0)
  const [channels, setChannels] = useState(() => createChannels(refresh))
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>('alpha')
  const [listening, setListening] = useState(true)
  const otherChannel: ChannelId = selectedChannel === 'alpha' ? 'beta' : 'alpha'

  /** 向当前选中的外部频道发送一条消息。 */
  function handleSendCurrent(): void {
    channels[selectedChannel].emit()
  }

  /** 向当前未选中的外部频道发送一条消息。 */
  function handleSendOther(): void {
    channels[otherChannel].emit()
  }

  /** 切换依赖频道，让 React 先清理旧监听再建立新监听。 */
  function handleSwitchChannel(): void {
    setSelectedChannel(otherChannel)
  }

  /** 通过挂载或卸载监听子组件切换资源拥有状态。 */
  function handleToggleListening(): void {
    setListening((current) => !current)
  }

  /** 创建全新的双频道场景并恢复冷启动状态。 */
  function handleReset(): void {
    setChannels(createChannels(refresh))
    setSelectedChannel('alpha')
    setListening(true)
  }

  return (
    <section className="effect-cleanup-demo" data-testid="effect-cleanup-demo">
      {listening ? <ListenerRegistration channel={channels[selectedChannel]} /> : null}
      <header className="effect-cleanup-demo-heading">
        <p>setup ↔ cleanup</p>
        <h2>频道变化时先撤销旧监听，再建立新监听</h2>
        <span>消息只会交给当前仍注册 listener 的频道。</span>
      </header>

      <div className="effect-cleanup-demo-controls" aria-label="监听资源控制">
        <button type="button" aria-pressed={listening} onClick={handleToggleListening}>
          {listening ? '卸载监听' : '重新挂载'}
        </button>
        <button type="button" onClick={handleSendCurrent}>
          发送到当前频道
        </button>
        <button type="button" onClick={handleSendOther}>
          发送到另一频道
        </button>
        <button type="button" onClick={handleSwitchChannel}>
          切换到 {otherChannel}
        </button>
        <button type="button" onClick={handleReset}>
          重置场景
        </button>
      </div>

      <p className="effect-cleanup-demo-status" role="status">
        当前频道：<strong data-testid="cleanup-current-channel">{selectedChannel}</strong>；监听：
        <strong data-testid="cleanup-listening-state">{listening ? '启用' : '暂停'}</strong>
      </p>

      <div className="effect-cleanup-demo-panels">
        {(Object.keys(channels) as ChannelId[]).map((channelId) => {
          const snapshot = channels[channelId].snapshot()
          return (
            <article
              className="effect-cleanup-demo-panel"
              data-current={channelId === selectedChannel}
              key={channelId}
            >
              <span>{channelId} 频道</span>
              <strong data-testid={`cleanup-${channelId}-active`}>
                listener：{snapshot.activeListeners}
              </strong>
              <small data-testid={`cleanup-${channelId}-delivered`}>
                已接收 {snapshot.deliveredSignals} 条；最近：{snapshot.lastDeliveredSignal}
              </small>
            </article>
          )
        })}
      </div>
    </section>
  )
}
