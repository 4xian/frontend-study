import { useState } from 'react'
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react'
import './dom-props-demo.css'

type CardState = 'ready' | 'paused'

type StatusCardProps = ComponentPropsWithoutRef<'article'> & {
  children: ReactNode
  state: CardState
  'data-course-id'?: string
}

/** 过滤组件私有的 state prop，并把其余合法 DOM props 传给 article。 */
function StatusCard({ state, className, style, children, ...domProps }: StatusCardProps) {
  const mergedClassName = ['dom-props-card', `is-${state}`, className].filter(Boolean).join(' ')
  const mergedStyle: CSSProperties = {
    borderLeftWidth: state === 'ready' ? 8 : 4,
    opacity: state === 'ready' ? 1 : 0.72,
    ...style,
  }

  return (
    <article {...domProps} className={mergedClassName} style={mergedStyle}>
      {children}
    </article>
  )
}

/** 展示常见 DOM prop 的命名、值语义、样式映射与透传边界。 */
export default function DomPropsDemo() {
  const [state, setState] = useState<CardState>('ready')
  const [detailsVisible, setDetailsVisible] = useState(true)
  const isReady = state === 'ready'

  /** 在 ready 与 paused 之间切换，观察属性值和 DOM 结果。 */
  function handleToggleState() {
    setState((current) => (current === 'ready' ? 'paused' : 'ready'))
  }

  /** 切换 hidden 布尔 prop，观察详情是否参与展示。 */
  function handleToggleDetails() {
    setDetailsVisible((visible) => !visible)
  }

  return (
    <section className="dom-props-demo" aria-labelledby="dom-props-demo-title">
      <header className="dom-props-heading">
        <p>DOM props</p>
        <h2 id="dom-props-demo-title">从 TSX prop 到真实 DOM</h2>
        <span>切换状态后，比较命名、值类型、样式和自定义数据的实际结果。</span>
      </header>

      <StatusCard
        state={state}
        className="course-status"
        title={isReady ? '课程可以开始' : '课程暂时停用'}
        tabIndex={isReady ? 0 : -1}
        aria-disabled={!isReady}
        data-course-id="react-dom-props"
        data-state={state}
      >
        <div className="dom-props-card-heading">
          <div>
            <span>React Core</span>
            <strong>{isReady ? '可开始学习' : '暂时停用'}</strong>
          </div>
          <span className="dom-props-state" data-state={state}>
            {state}
          </span>
        </div>

        <div className="dom-props-output-pair">
          <label htmlFor="dom-props-output">当前状态</label>
          <output id="dom-props-output" aria-live="polite">
            {isReady ? 'ready' : 'paused'}
          </output>
        </div>

        <p hidden={!detailsVisible}>
          <code>hidden</code> 为 false 时，这段详情会出现在页面中。
        </p>

        <button type="button" disabled={!isReady}>
          进入课程
        </button>
      </StatusCard>

      <dl className="dom-props-observer" aria-label="当前 DOM prop 结果">
        <div>
          <dt>class</dt>
          <dd>dom-props-card is-{state} course-status</dd>
        </div>
        <div>
          <dt>tabindex</dt>
          <dd>{isReady ? '0' : '-1'}</dd>
        </div>
        <div>
          <dt>aria-disabled</dt>
          <dd>{String(!isReady)}</dd>
        </div>
        <div>
          <dt>data-state</dt>
          <dd>{state}</dd>
        </div>
        <div>
          <dt>border-left-width</dt>
          <dd>{isReady ? '8px' : '4px'}</dd>
        </div>
        <div>
          <dt>hidden</dt>
          <dd>{detailsVisible ? '未设置' : '已设置'}</dd>
        </div>
      </dl>

      <div className="dom-props-actions" aria-label="DOM prop 观察操作">
        <button type="button" onClick={handleToggleState}>
          切换状态
        </button>
        <button type="button" onClick={handleToggleDetails}>
          {detailsVisible ? '隐藏详情' : '显示详情'}
        </button>
      </div>

      <p className="dom-props-rule">
        组件私有的 <code>state</code> 已在透传前消费，不会成为 article 的未知属性。
      </p>
    </section>
  )
}
