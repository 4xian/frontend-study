import { useState } from 'react'
import './use-state-demo.css'

type StudyMode = 'reading' | 'practice'

type CounterCopyProps = {
  name: string
  testId: 'first' | 'second'
}

/** 为每个组件副本创建独立的初始标签。 */
function createInitialLabel(): string {
  return '等待操作'
}

/** 展示一份拥有独立计数、模式和标签的组件副本。 */
function CounterCopy({ name, testId }: CounterCopyProps) {
  const [count, setCount] = useState(0)
  const [mode, setMode] = useState<StudyMode>('reading')
  const [label] = useState(createInitialLabel)

  /** 根据前一计数增加当前副本的值。 */
  function handleIncrement() {
    setCount((previous) => previous + 1)
  }

  /** 使用直接值恢复当前副本的计数。 */
  function handleReset() {
    setCount(0)
  }

  /** 使用联合类型中的明确值进入练习模式。 */
  function handlePractice() {
    setMode('practice')
  }

  /** 使用联合类型中的明确值返回阅读模式。 */
  function handleReading() {
    setMode('reading')
  }

  return (
    <section className="use-state-demo-copy" data-testid={`use-state-${testId}`}>
      <header>
        <p>{name}</p>
        <span>{label}</span>
      </header>

      <dl className="use-state-demo-values" aria-live="polite">
        <div>
          <dt>count</dt>
          <dd data-testid={`use-state-${testId}-count`}>{count}</dd>
        </div>
        <div>
          <dt>mode</dt>
          <dd data-testid={`use-state-${testId}-mode`}>{mode}</dd>
        </div>
      </dl>

      <div className="use-state-demo-actions" aria-label={`${name}操作`}>
        <button type="button" onClick={handleIncrement}>
          增加
        </button>
        <button type="button" onClick={handleReset}>
          归零
        </button>
        <button type="button" onClick={handlePractice}>
          练习模式
        </button>
        <button type="button" onClick={handleReading}>
          阅读模式
        </button>
      </div>
    </section>
  )
}

/** 对照两个组件副本各自保存的 useState 值。 */
export default function UseStateDemo() {
  return (
    <section className="use-state-demo" data-testid="use-state-demo">
      <header className="use-state-demo-heading">
        <p>useState</p>
        <h2>局部状态与独立组件副本</h2>
        <span>操作任意一边，另一边的 count 和 mode 都不会改变</span>
      </header>

      <div className="use-state-demo-copies">
        <CounterCopy name="第一个副本" testId="first" />
        <CounterCopy name="第二个副本" testId="second" />
      </div>

      <dl className="use-state-demo-facts">
        <div>
          <dt>二元组</dt>
          <dd>每次调用都返回当前值和对应 setter</dd>
        </div>
        <div>
          <dt>initializer</dt>
          <dd>
            <code>createInitialLabel</code> 作为函数传入
          </dd>
        </div>
        <div>
          <dt>直接值</dt>
          <dd>归零和模式切换提交明确的下一值</dd>
        </div>
        <div>
          <dt>updater</dt>
          <dd>增加操作由前一 count 返回下一 count</dd>
        </div>
      </dl>
    </section>
  )
}
