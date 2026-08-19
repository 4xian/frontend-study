import { useEffect, useState } from 'react'
import './lifecycle-probe.css'

interface LifecycleProbeStats {
  activeListeners: number
  cleanups: number
  mounts: number
  signals: number
}

declare global {
  interface Window {
    __reactLifecycleProbe?: LifecycleProbeStats
  }
}

/** 返回跨挂载周期保留的可观察生命周期统计。 */
function getLifecycleStats(): LifecycleProbeStats {
  window.__reactLifecycleProbe ??= {
    activeListeners: 0,
    cleanups: 0,
    mounts: 0,
    signals: 0,
  }
  return window.__reactLifecycleProbe
}

/** 验证 React 事件、State、Effect 清理与受控渲染错误。 */
export default function LifecycleProbe() {
  const [count, setCount] = useState(0)
  const [signals, setSignals] = useState(() => getLifecycleStats().signals)
  const [shouldCrash, setShouldCrash] = useState(false)

  useEffect(() => {
    const stats = getLifecycleStats()
    stats.mounts += 1
    stats.activeListeners += 1
    const handleSignal = () => {
      stats.signals += 1
      setSignals(stats.signals)
    }
    window.addEventListener('react-lifecycle-probe', handleSignal)

    return () => {
      window.removeEventListener('react-lifecycle-probe', handleSignal)
      stats.activeListeners -= 1
      stats.cleanups += 1
    }
  }, [])

  if (shouldCrash) throw new Error('LifecycleProbe 受控渲染错误')

  return (
    <section className="react-lifecycle-probe" data-testid="react-lifecycle-probe">
      <strong>React runtime 已按需挂载</strong>
      <p>
        计数：<output data-testid="react-count">{count}</output>；宿主信号：
        <output data-testid="react-signals">{signals}</output>
      </p>
      <div className="react-lifecycle-actions">
        <button type="button" onClick={() => setCount((value) => value + 1)}>
          增加计数
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('react-lifecycle-probe'))}
        >
          发送宿主信号
        </button>
        <button className="danger" type="button" onClick={() => setShouldCrash(true)}>
          触发受控错误
        </button>
      </div>
    </section>
  )
}
