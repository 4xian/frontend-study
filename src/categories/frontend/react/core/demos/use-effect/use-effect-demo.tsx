import { useEffect, useRef, useState } from 'react'
import './use-effect-demo.css'

type Mode = 'compact' | 'expanded'

/** 维护一个只拥有宿主节点的外部小部件，并同步它的模式显示。 */
class ExternalModeWidget {
  private readonly host: HTMLDivElement

  /** 绑定外部小部件唯一拥有的宿主节点。 */
  constructor(host: HTMLDivElement) {
    this.host = host
  }

  /** 把 React 当前模式写入外部小部件的可观察 DOM 状态。 */
  setMode(mode: Mode): void {
    this.host.dataset.mode = mode
    this.host.textContent = mode === 'compact' ? 'Widget：紧凑模式' : 'Widget：展开模式'
  }
}

/** 通过事件改变 React 目标值，让 Effect 在提交后同步外部小部件。 */
export default function UseEffectDemo() {
  const [mode, setMode] = useState<Mode>('compact')
  const hostRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<ExternalModeWidget | null>(null)

  /** 提交后创建或复用 Widget，并同步当前模式。 */
  useEffect(() => {
    if (!hostRef.current) return
    if (!widgetRef.current) widgetRef.current = new ExternalModeWidget(hostRef.current)
    widgetRef.current.setMode(mode)
  }, [mode])

  /** 请求 React 提交另一个模式，外部小部件随后由 Effect 同步。 */
  function handleModeChange(nextMode: Mode) {
    setMode(nextMode)
  }

  return (
    <section className="use-effect-demo" data-testid="use-effect-demo">
      <header className="use-effect-demo-heading">
        <p>Render → commit → setup</p>
        <h2>把 React 的模式同步给外部小部件</h2>
        <span>React 负责目标值，Widget 负责自己的宿主节点内容。</span>
      </header>

      <div className="use-effect-demo-controls" aria-label="模式控制">
        <button
          type="button"
          aria-pressed={mode === 'compact'}
          onClick={() => handleModeChange('compact')}
        >
          紧凑模式
        </button>
        <button
          type="button"
          aria-pressed={mode === 'expanded'}
          onClick={() => handleModeChange('expanded')}
        >
          展开模式
        </button>
      </div>

      <div className="use-effect-demo-panels">
        <article className="use-effect-demo-panel">
          <span>React 当前目标</span>
          <strong data-testid="effect-react-mode">{mode}</strong>
          <small>这部分由 render 产生。</small>
        </article>
        <article className="use-effect-demo-panel use-effect-demo-external">
          <span>外部 Widget</span>
          <div ref={hostRef} data-testid="effect-widget" aria-live="polite" />
          <small>这部分由提交后的 setup 写入。</small>
        </article>
      </div>

      <p className="use-effect-demo-status" data-testid="effect-sync-status" role="status">
        React 当前目标是 <strong>{mode}</strong>，可与 Widget 的 <code>data-mode</code> 对照。
      </p>
    </section>
  )
}
