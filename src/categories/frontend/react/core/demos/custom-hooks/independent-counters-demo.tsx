import { useDebugValue, useState } from 'react'
import './independent-counters-demo.css'

type Counter = Readonly<{
  count: number
  increment: () => void
  reset: () => void
}>

type CounterDebugValue = Readonly<{
  name: string
  count: number
}>

/** 把计数状态格式化为 React DevTools 中的可读标签。 */
function formatCounterDebugValue(value: CounterDebugValue): string {
  return `${value.name}: ${value.count}`
}

/** 创建一份独立计数状态、操作函数和调试标签。 */
function useCounter(name: string, initialValue: number): Counter {
  const [count, setCount] = useState(initialValue)
  useDebugValue({ name, count }, formatCounterDebugValue)

  /** 在当前 Hook 调用拥有的 State 上增加一次。 */
  function increment() {
    setCount((current) => current + 1)
  }

  /** 只把当前 Hook 调用恢复到自己的初始值。 */
  function reset() {
    setCount(initialValue)
  }

  return { count, increment, reset }
}

/** 对照同一个自定义 Hook 的两次独立调用。 */
export default function IndependentCountersDemo() {
  const leftCounter = useCounter('左侧', 0)
  const rightCounter = useCounter('右侧', 0)

  return (
    <section className="custom-hooks-demo" data-testid="custom-hooks-demo">
      <header className="custom-hooks-demo-heading">
        <p>Custom Hook + DevTools</p>
        <h2>复用计数逻辑，保留两份独立 State</h2>
        <span>
          两个区域调用同一个 useCounter；页面读取 count，调试标签只供 React DevTools 检查。
        </span>
      </header>

      <div className="custom-hooks-demo-flow" aria-label="自定义 Hook 调用关系">
        <section>
          <span>共享实现</span>
          <strong>useCounter(name, 0)</strong>
          <small>一套创建、增加、重置和调试标签逻辑</small>
        </section>
        <span aria-hidden="true">→</span>
        <section>
          <span>调用结果</span>
          <strong>两份 State</strong>
          <small>每个调用位置独立保存计数</small>
        </section>
      </div>

      <div className="custom-hooks-demo-counters">
        <section aria-labelledby="left-counter-title">
          <span>第一次调用</span>
          <h3 id="left-counter-title">左侧计数</h3>
          <strong data-testid="left-count">{leftCounter.count}</strong>
          <div>
            <button type="button" onClick={leftCounter.increment}>
              增加左侧
            </button>
            <button type="button" onClick={leftCounter.reset}>
              重置左侧
            </button>
          </div>
        </section>

        <section aria-labelledby="right-counter-title">
          <span>第二次调用</span>
          <h3 id="right-counter-title">右侧计数</h3>
          <strong data-testid="right-count">{rightCounter.count}</strong>
          <div>
            <button type="button" onClick={rightCounter.increment}>
              增加右侧
            </button>
            <button type="button" onClick={rightCounter.reset}>
              重置右侧
            </button>
          </div>
        </section>
      </div>

      <p className="custom-hooks-demo-result" role="status" aria-live="polite">
        当前结果：左侧 <strong>{leftCounter.count}</strong> / 右侧{' '}
        <strong>{rightCounter.count}</strong>
      </p>
    </section>
  )
}
