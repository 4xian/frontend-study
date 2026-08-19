import { useRef, useState } from 'react'
import type { Ref } from 'react'
import './ref-as-prop-demo.css'

type InputProps = {
  label: string
  hint: string
  testId: string
  ref?: Ref<HTMLInputElement>
}

type RefCheckResult = {
  title: string
  detail: string
  target: string
}

const initialResult: RefCheckResult = {
  title: '等待检查',
  detail: '先让普通按钮获得焦点，再检查两条 Ref 路径。',
  target: '尚未执行命令式动作',
}

/** 接收父组件 Ref，并把它精确转交给内部宿主输入框。 */
function ForwardingInput({ label, hint, testId, ref }: InputProps) {
  return (
    <label className="ref-as-prop-demo-field">
      <span>{label}</span>
      <input ref={ref} data-testid={testId} defaultValue="React 19" />
      <small>{hint}</small>
    </label>
  )
}

/** 保留一个接收但不转交 Ref 的最小失败对照。 */
function SwallowingInput({ label, hint, testId }: InputProps) {
  return (
    <label className="ref-as-prop-demo-field">
      <span>{label}</span>
      <input data-testid={testId} defaultValue="Ref 被组件吞掉" />
      <small>{hint}</small>
    </label>
  )
}

/** 对照 React 19 函数组件透明转交 Ref 与遗漏转交的结果。 */
export default function RefAsPropDemo() {
  const forwardedInputRef = useRef<HTMLInputElement>(null)
  const swallowedInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<RefCheckResult>(initialResult)

  /** 记录普通按钮焦点，建立后续聚焦行为的可见起点。 */
  function handleBaselineFocus() {
    setResult({
      title: '普通按钮已获得焦点',
      detail: '下一步可让父组件通过转交后的对象 Ref 聚焦输入框。',
      target: 'BUTTON / ref-as-prop-baseline',
    })
  }

  /** 通过已透明转交的对象 Ref 聚焦真实宿主输入框。 */
  function handleFocusForwardedInput() {
    const input = forwardedInputRef.current
    if (!input) return

    input.focus()
    setResult({
      title: '转交成功',
      detail: '父组件对象 Ref 指向子组件内部的真实输入框。',
      target: `${input.tagName} / ${input.dataset.testid}`,
    })
  }

  /** 在用户事件中确认未转交的对象 Ref 仍然为空。 */
  function handleInspectSwallowedRef() {
    const target = swallowedInputRef.current
    setResult({
      title: target === null ? '未转交 Ref 为 null' : '发现意外目标',
      detail:
        target === null
          ? '输入框真实存在，但 React 不会自动为自定义组件寻找内部节点。'
          : '失败对照不应获得任何宿主节点。',
      target: target === null ? 'null' : `${target.tagName} / unexpected`,
    })
  }

  /** 恢复固定的初始观察结果，便于重复执行完整路径。 */
  function handleReset() {
    setResult(initialResult)
  }

  return (
    <section className="ref-as-prop-demo" data-testid="ref-as-prop-demo">
      <header className="ref-as-prop-demo-heading">
        <p>Transparent ref handoff</p>
        <h2>检查父组件 Ref 最终指向谁</h2>
        <span>两个输入框都存在；只有显式转交的 Ref 能让父组件取得宿主节点。</span>
      </header>

      <div className="ref-as-prop-demo-fields">
        <div className="ref-as-prop-demo-path" data-path="forwarded">
          <strong>成功路径</strong>
          <ForwardingInput
            ref={forwardedInputRef}
            label="已转交的搜索框"
            hint="Ref 精确落到内部 input。"
            testId="ref-as-prop-forwarded-input"
          />
        </div>

        <div className="ref-as-prop-demo-path" data-path="swallowed">
          <strong>失败对照</strong>
          <SwallowingInput
            ref={swallowedInputRef}
            label="未转交的搜索框"
            hint="组件接收 Ref，但没有把它写到 input。"
            testId="ref-as-prop-swallowed-input"
          />
        </div>
      </div>

      <div className="ref-as-prop-demo-actions" aria-label="Ref 转交检查操作">
        <button type="button" data-testid="ref-as-prop-baseline" onClick={handleBaselineFocus}>
          普通按钮聚焦
        </button>
        <button type="button" onClick={handleFocusForwardedInput}>
          聚焦已转交输入框
        </button>
        <button type="button" onClick={handleInspectSwallowedRef}>
          检查未转交 Ref
        </button>
        <button type="button" onClick={handleReset}>
          重置结果
        </button>
      </div>

      <div className="ref-as-prop-demo-result" role="status" aria-live="polite">
        <span>检查结果</span>
        <strong data-testid="ref-as-prop-result-title">{result.title}</strong>
        <p>{result.detail}</p>
        <code data-testid="ref-as-prop-result-target">{result.target}</code>
      </div>
    </section>
  )
}
