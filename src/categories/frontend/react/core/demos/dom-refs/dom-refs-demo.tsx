import { useRef, useState } from 'react'
import './dom-refs-demo.css'

type MeasurementSnapshot = {
  width: number
  height: number
  top: number
}

/** 展示对象 Ref 对固定宿主节点执行聚焦、滚动和一次性测量。 */
export default function DomRefsDemo() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollViewportRef = useRef<HTMLDivElement | null>(null)
  const scrollTargetRef = useRef<HTMLDivElement | null>(null)
  const measureTargetRef = useRef<HTMLDivElement | null>(null)
  const [focusStatus, setFocusStatus] = useState('尚未聚焦')
  const [scrollCount, setScrollCount] = useState(0)
  const [measurement, setMeasurement] = useState<MeasurementSnapshot | null>(null)

  /** 聚焦当前仍挂载的输入框，并记录可见证据。 */
  function handleFocus() {
    const input = inputRef.current
    if (input === null) return

    input.focus()
    setFocusStatus(document.activeElement === input ? '已聚焦' : '焦点未进入输入框')
  }

  /** 把固定目标滚动到容器视口内，并累计明确的用户动作。 */
  function handleScroll() {
    const target = scrollTargetRef.current
    if (target === null) return

    target.scrollIntoView({ behavior: 'auto', block: 'end' })
    setScrollCount((current) => current + 1)
  }

  /** 读取固定证据块的当前几何，并只保存普通数值快照。 */
  function handleMeasure() {
    const target = measureTargetRef.current
    if (target === null) return

    const rect = target.getBoundingClientRect()
    setMeasurement({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
    })
  }

  /** 清空公开证据，并把 Demo 自己的焦点和滚动位置恢复到初始状态。 */
  function handleReset() {
    inputRef.current?.blur()
    scrollViewportRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    setFocusStatus('尚未聚焦')
    setScrollCount(0)
    setMeasurement(null)
  }

  return (
    <section className="dom-refs-demo" data-testid="dom-refs-demo">
      <header className="dom-refs-demo-heading">
        <p>固定节点</p>
        <h2>在事件中访问 React 已提交的节点</h2>
        <span>Ref 只执行浏览器命令；页面证据仍由 State 声明式渲染。</span>
      </header>

      <div className="dom-refs-demo-toolbar" aria-label="DOM Ref 操作">
        <label htmlFor="dom-refs-search">课程搜索词</label>
        <input id="dom-refs-search" ref={inputRef} type="text" defaultValue="React DOM" />
        <div className="dom-refs-demo-actions">
          <button type="button" onClick={handleFocus}>
            聚焦输入框
          </button>
          <button type="button" onClick={handleScroll}>
            滚动到目标
          </button>
          <button type="button" onClick={handleMeasure}>
            读取几何
          </button>
          <button type="button" onClick={handleReset}>
            重置证据
          </button>
        </div>
      </div>

      <div className="dom-refs-demo-workspace">
        <div
          ref={scrollViewportRef}
          className="dom-refs-demo-scroll-viewport"
          data-testid="dom-refs-scroll-viewport"
          aria-label="滚动观察区"
        >
          <p>起点：目标节点此时还在容器下方。</p>
          <p>Ref 不负责创建节点，它只连接 React 已经渲染的宿主元素。</p>
          <p>滚动是一次浏览器命令，不需要把滚动位置写进 JSX。</p>
          <p>目标从首次提交起就存在，因此这里不需要强制同步 State 更新。</p>
          <div
            ref={scrollTargetRef}
            className="dom-refs-demo-scroll-target"
            data-testid="dom-refs-scroll-target"
          >
            固定滚动目标
          </div>
        </div>

        <div
          ref={measureTargetRef}
          className="dom-refs-demo-measure-target"
          data-testid="dom-refs-measure-target"
        >
          <strong>固定测量目标</strong>
          <span>点击后读取这块区域当时的宽、高和顶部位置。</span>
        </div>
      </div>

      <div className="dom-refs-demo-status" role="status" aria-live="polite">
        <div>
          <span>焦点证据</span>
          <strong data-testid="dom-refs-focus-status">{focusStatus}</strong>
        </div>
        <div>
          <span>滚动动作</span>
          <strong data-testid="dom-refs-scroll-count">{scrollCount}</strong>
        </div>
        <div>
          <span>几何快照</span>
          <strong data-testid="dom-refs-measurement">
            {measurement === null
              ? '尚未读取'
              : `${measurement.width} x ${measurement.height}, top ${measurement.top}`}
          </strong>
        </div>
      </div>
    </section>
  )
}
