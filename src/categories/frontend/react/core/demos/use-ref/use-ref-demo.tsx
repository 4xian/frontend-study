import { useRef, useState } from 'react'
import './use-ref-demo.css'

type PublicSnapshot = {
  batchNumber: number
  lastPublishedCount: number
  totalPublishedCount: number
  stateUpdateCount: number
}

const initialSnapshot: PublicSnapshot = {
  batchNumber: 0,
  lastPublishedCount: 0,
  totalPublishedCount: 0,
  stateUpdateCount: 0,
}

/** 展示 Ref 工作值与可见 State 快照之间不同的更新边界。 */
export default function UseRefDemo() {
  const pendingCountRef = useRef(0)
  const [snapshot, setSnapshot] = useState(initialSnapshot)

  /** 把一次待发布校验写入 Ref，不请求新的 render。 */
  function handleRecord() {
    pendingCountRef.current += 1
  }

  /** 单独更新可见 State，用于证明 Ref 工作值能够跨 render 保留。 */
  function handleStateUpdate() {
    setSnapshot((current) => ({
      ...current,
      stateUpdateCount: current.stateUpdateCount + 1,
    }))
  }

  /** 在事件中读取 Ref，并把当前批次发布为可见 State。 */
  function handlePublish() {
    const publishedCount = pendingCountRef.current
    pendingCountRef.current = 0
    setSnapshot((current) => ({
      ...current,
      batchNumber: current.batchNumber + 1,
      lastPublishedCount: publishedCount,
      totalPublishedCount: current.totalPublishedCount + publishedCount,
    }))
  }

  /** 丢弃尚未发布的 Ref 工作值，不改变当前页面快照。 */
  function handleDiscard() {
    pendingCountRef.current = 0
  }

  /** 同时恢复 Ref 工作值与可见 State，便于重复观察。 */
  function handleReset() {
    pendingCountRef.current = 0
    setSnapshot(initialSnapshot)
  }

  return (
    <section className="use-ref-demo" data-testid="use-ref-demo">
      <header className="use-ref-demo-heading">
        <p>Mutable value boundary</p>
        <h2>工作值留在 Ref，公开结果进入 State</h2>
        <span>待发布数量不会进入 JSX；只有发布事件会把它复制到可见快照。</span>
      </header>

      <div className="use-ref-demo-status" role="status" aria-live="polite">
        <div>
          <span>已发布批次</span>
          <strong data-testid="use-ref-batch-number">{snapshot.batchNumber}</strong>
        </div>
        <div>
          <span>最近发布</span>
          <strong data-testid="use-ref-last-count">{snapshot.lastPublishedCount}</strong>
        </div>
        <div>
          <span>累计发布</span>
          <strong data-testid="use-ref-total-count">{snapshot.totalPublishedCount}</strong>
        </div>
        <div>
          <span>独立 State 更新</span>
          <strong data-testid="use-ref-state-updates">{snapshot.stateUpdateCount}</strong>
        </div>
      </div>

      <div className="use-ref-demo-actions" aria-label="Ref 与 State 操作">
        <button type="button" onClick={handleRecord}>
          登记到 Ref
        </button>
        <button type="button" onClick={handleStateUpdate}>
          仅更新 State
        </button>
        <button type="button" onClick={handlePublish}>
          发布批次
        </button>
        <button type="button" onClick={handleDiscard}>
          丢弃待发布
        </button>
        <button type="button" onClick={handleReset}>
          重置全部
        </button>
      </div>

      <div className="use-ref-demo-observation">
        <strong>观察边界</strong>
        <p>
          登记到 Ref 后，四项公开结果都不变。先触发任意次数的独立 State 更新，再发布批次，先前登记的
          Ref 工作值仍会进入最近发布与累计发布。
        </p>
      </div>
    </section>
  )
}
