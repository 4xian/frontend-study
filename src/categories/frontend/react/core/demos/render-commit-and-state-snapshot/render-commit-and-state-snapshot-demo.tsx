import { useState } from 'react'
import './render-commit-and-state-snapshot-demo.css'

type UpdateModelExperimentProps = {
  label: string
  step: number
}

/** 展示 State 快照、批处理与更新队列怎样产生下一版界面。 */
function UpdateModelExperiment({ label, step }: UpdateModelExperimentProps) {
  const [count, setCount] = useState(0)
  const nextCount = count + step

  /** 提交单个直接值，并记录 setter 前后的同一份 handler 快照。 */
  function handleSnapshotUpdate() {
    console.info('[update-model-demo] setter 前', { label, step, count, nextCount })
    setCount(nextCount)
    console.info('[update-model-demo] setter 后', { label, step, count, nextCount })
  }

  /** 连续提交三个由当前 render 快照计算出的直接值。 */
  function handleDirectValues() {
    setCount(count + step)
    setCount(count + step)
    setCount(count + step)
  }

  /** 连续提交三个依赖 pending State 的纯 updater。 */
  function handleUpdaters() {
    setCount((pending) => pending + step)
    setCount((pending) => pending + step)
    setCount((pending) => pending + step)
  }

  /** 先替换为当前快照加五倍步长，再基于队列结果增加一个步长。 */
  function handleReplaceThenUpdate() {
    setCount(count + step * 5)
    setCount((pending) => pending + step)
  }

  /** 依次替换、更新并再次替换，展示队列位置的语义。 */
  function handleFinalReplacement() {
    setCount(count + step * 5)
    setCount((pending) => pending + step)
    setCount(42)
  }

  /** 把数字 State 恢复为统一观察起点。 */
  function handleReset() {
    setCount(0)
  }

  return (
    <section className="update-model-demo" data-testid="render-snapshot-demo">
      <header className="update-model-heading">
        <p>State update flow</p>
        <h2>{label}</h2>
        <span>Props 与 State 都属于当前 render；先重置到 0，再观察下一版界面。</span>
      </header>

      <div className="update-model-values" aria-live="polite">
        <div>
          <span>当前 render 的 count</span>
          <output data-testid="snapshot-current-count">{count}</output>
        </div>
        <div>
          <span>Props 提供的固定 step</span>
          <strong data-testid="snapshot-step">{step}</strong>
        </div>
        <div>
          <span>当前快照算出的 count + step</span>
          <strong data-testid="snapshot-next-count">{nextCount}</strong>
        </div>
      </div>

      <div className="update-model-actions" aria-label="State 更新序列">
        <button type="button" data-action="snapshot" onClick={handleSnapshotUpdate}>
          单次请求并记录快照
        </button>
        <button type="button" data-action="direct" onClick={handleDirectValues}>
          三次直接值
        </button>
        <button type="button" data-action="updater" onClick={handleUpdaters}>
          三个 updater
        </button>
        <button type="button" data-action="mixed" onClick={handleReplaceThenUpdate}>
          替换后更新
        </button>
        <button type="button" data-action="final-replace" onClick={handleFinalReplacement}>
          最后替换为 42
        </button>
        <button type="button" data-action="reset" onClick={handleReset} disabled={count === 0}>
          重置为 0
        </button>
      </div>

      <dl className="update-model-phases">
        <div>
          <dt>Trigger</dt>
          <dd>setter 提交下一次 React render 的更新请求。</dd>
        </div>
        <div>
          <dt>Render</dt>
          <dd>React 处理队列，并使用下一 State 计算 UI。</dd>
        </div>
        <div>
          <dt>Commit</dt>
          <dd>React 把必要的文本变化应用到 DOM。</dd>
        </div>
        <div>
          <dt>Paint</dt>
          <dd>浏览器在 DOM 更新后绘制页面，不承诺独立帧数。</dd>
        </div>
      </dl>

      <dl className="update-model-rules">
        <div>
          <dt>三次直接值</dt>
          <dd>
            从 0 开始，三项都是 replace with {step}，最终为 {step}。
          </dd>
        </div>
        <div>
          <dt>三个 updater</dt>
          <dd>
            从 0 开始，pending State 依次为 0、{step}、{step * 2}，最终为 {step * 3}。
          </dd>
        </div>
        <div>
          <dt>替换后更新</dt>
          <dd>
            从 0 开始，先 replace with {step * 5}，再增加一个步长，最终为 {step * 6}。
          </dd>
        </div>
        <div>
          <dt>最后替换</dt>
          <dd>
            从 0 开始，{step * 5}、{step * 6} 之后再 replace with 42，最终为 42。
          </dd>
        </div>
      </dl>
    </section>
  )
}

/** 提供固定标签和步长的更新模型观察入口。 */
export default function RenderCommitAndStateSnapshotDemo() {
  return <UpdateModelExperiment label="从快照与队列到下一版界面" step={1} />
}
