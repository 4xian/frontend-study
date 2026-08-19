import { useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import './use-imperative-handle-demo.css'

type CommandEvidence = {
  label: string
  detail: string
}

/** 描述文本输入组件向父组件公开的最小命令接口。 */
export type InputHandle = {
  /** 聚焦内部输入框，并返回不包含 DOM 节点的执行证据。 */
  focus: () => CommandEvidence
  /** 全选内部文本，并返回不包含 DOM 节点的执行证据。 */
  selectAll: () => CommandEvidence
}

type TextFieldProps = {
  label: string
  ref?: Ref<InputHandle>
}

type CommandResult = {
  title: string
  detail: string
  api: string
  identity: string
  evidence: string
}

const initialResult: CommandResult = {
  title: '等待命令',
  detail: '先记录 handle，再比较依赖变化与普通外壳更新。',
  api: 'focus, selectAll',
  identity: '尚未记录引用',
  evidence: '尚未执行 DOM 命令',
}

/** 只暴露聚焦与全选命令，并把输入框 DOM Ref 留在组件内部。 */
function RestrictedInput({ label, ref }: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      /** 让内部输入框获得焦点，并返回当前依赖标签。 */
      focus() {
        const input = inputRef.current
        if (!input) {
          return { label, detail: '内部节点尚未就绪' }
        }

        input.focus()
        return {
          label,
          detail: document.activeElement === input ? '焦点已进入内部输入框' : '焦点未改变',
        }
      },
      /** 选中内部输入框的全部文本，并返回真实选择范围。 */
      selectAll() {
        const input = inputRef.current
        if (!input) {
          return { label, detail: '内部节点尚未就绪' }
        }

        input.select()
        return {
          label,
          detail: `${input.selectionStart}..${input.selectionEnd} / 文本长度 ${input.value.length}`,
        }
      },
    }),
    [label],
  )

  return (
    <label className="use-imperative-handle-demo-field">
      <span>{label}</span>
      <input
        aria-label={label}
        data-testid="imperative-input"
        defaultValue="React 19 handle"
        ref={inputRef}
      />
      <small>内部 inputRef 不会交给父组件；公开 handle 只包含两个命令。</small>
    </label>
  )
}

/** 通过父组件事件调用受限 handle，并展示依赖与生命周期证据。 */
export default function UseImperativeHandleDemo() {
  const fieldRef = useRef<InputHandle>(null)
  const previousHandleRef = useRef<InputHandle | null>(null)
  const hasObservedHandleRef = useRef(false)
  const [label, setLabel] = useState('主搜索框')
  const [shellRevision, setShellRevision] = useState(0)
  const [isMounted, setIsMounted] = useState(true)
  const [experimentKey, setExperimentKey] = useState(0)
  const [result, setResult] = useState<CommandResult>(initialResult)

  /** 调用子组件的 focus 命令，并显示命令读取到的最新标签。 */
  function handleFocus() {
    const handle = fieldRef.current
    if (!handle) {
      setResult({
        title: 'handle 当前为空',
        detail: '子组件未挂载，父组件没有可调用的命令。',
        api: '无',
        identity: 'ref.current = null',
        evidence: 'focus 未执行',
      })
      return
    }

    const evidence = handle.focus()
    setResult({
      title: 'focus 命令已执行',
      detail: `命令闭包读取到“${evidence.label}”。`,
      api: Object.keys(handle).sort().join(', '),
      identity: handle instanceof HTMLInputElement ? '错误：DOM 节点' : '正确：自定义命令对象',
      evidence: evidence.detail,
    })
  }

  /** 调用子组件的 selectAll 命令，并显示真实选择范围。 */
  function handleSelectAll() {
    const handle = fieldRef.current
    if (!handle) {
      setResult({
        title: 'handle 当前为空',
        detail: '子组件未挂载，父组件没有可调用的命令。',
        api: '无',
        identity: 'ref.current = null',
        evidence: 'selectAll 未执行',
      })
      return
    }

    const evidence = handle.selectAll()
    setResult({
      title: 'selectAll 命令已执行',
      detail: `命令闭包读取到“${evidence.label}”。`,
      api: Object.keys(handle).sort().join(', '),
      identity: handle instanceof HTMLInputElement ? '错误：DOM 节点' : '正确：自定义命令对象',
      evidence: evidence.detail,
    })
  }

  /** 记录当前 handle，并与上次事件中保存的引用比较。 */
  function handleInspectInterface() {
    const handle = fieldRef.current
    if (!handle) {
      setResult({
        title: '公开 Ref 已清空',
        detail: '子组件卸载后，父组件读取到 null。',
        api: '无',
        identity: 'ref.current = null',
        evidence: '旧命令对象不再通过 Ref 暴露',
      })
      return
    }

    const identity = !hasObservedHandleRef.current
      ? '首次记录 handle 引用'
      : Object.is(previousHandleRef.current, handle)
        ? '与上次记录为同一对象'
        : '与上次记录不是同一对象'

    previousHandleRef.current = handle
    hasObservedHandleRef.current = true
    setResult({
      title: '接口检查完成',
      detail: '公开对象没有 style、value 或 remove 等 DOM 字段。',
      api: Object.keys(handle).sort().join(', '),
      identity,
      evidence:
        handle instanceof HTMLInputElement ? '错误：泄漏 DOM' : '正确：不是 HTMLInputElement',
    })
  }

  /** 切换 createHandle 读取的标签依赖，触发句柄更新。 */
  function handleToggleLabel() {
    setLabel((current) => (current === '主搜索框' ? '备用搜索框' : '主搜索框'))
    setResult({
      title: '标签依赖已切换',
      detail: '提交后再次记录 handle，可观察到新对象；命令也会读取新标签。',
      api: 'focus, selectAll',
      identity: '等待再次记录',
      evidence: '依赖数组为 [label]',
    })
  }

  /** 只更新父级外壳，不改变 createHandle 的依赖。 */
  function handleShellUpdate() {
    setShellRevision((current) => current + 1)
    setResult({
      title: '父级外壳已更新',
      detail: 'label 没有变化；再次记录 handle 应得到同一对象。',
      api: 'focus, selectAll',
      identity: '等待再次记录',
      evidence: '无关 State 不在依赖数组中',
    })
  }

  /** 切换子组件挂载状态，观察公开 Ref 的建立与清空。 */
  function handleToggleMounted() {
    setIsMounted((current) => !current)
    setResult({
      title: isMounted ? '正在卸载子组件' : '正在重新挂载子组件',
      detail: isMounted ? '提交后检查接口应读取到 null。' : '提交后会建立新的 handle。',
      api: isMounted ? '等待清空' : '等待建立',
      identity: '等待提交',
      evidence: 'Ref 随挂载状态变化',
    })
  }

  /** 重建子组件并恢复所有可见观察值。 */
  function handleReset() {
    setExperimentKey((current) => current + 1)
    setLabel('主搜索框')
    setShellRevision(0)
    setIsMounted(true)
    setResult(initialResult)
    previousHandleRef.current = null
    hasObservedHandleRef.current = false
  }

  return (
    <section className="use-imperative-handle-demo" data-testid="use-imperative-handle-demo">
      <header className="use-imperative-handle-demo-heading">
        <p>Limited imperative API</p>
        <h2>公开命令，不公开内部节点</h2>
        <span>比较依赖更新、无关 render 与卸载清理对 handle 的影响。</span>
      </header>

      <dl className="use-imperative-handle-demo-ledger" aria-label="当前实验状态">
        <div>
          <dt>label 依赖</dt>
          <dd data-testid="imperative-handle-label">{label}</dd>
        </div>
        <div>
          <dt>外壳 revision</dt>
          <dd data-testid="imperative-handle-shell-revision">{shellRevision}</dd>
        </div>
        <div>
          <dt>子组件</dt>
          <dd data-testid="imperative-handle-mounted">{isMounted ? '已挂载' : '已卸载'}</dd>
        </div>
      </dl>

      <div className="use-imperative-handle-demo-panel">
        {isMounted ? <RestrictedInput key={experimentKey} ref={fieldRef} label={label} /> : null}
        <div className="use-imperative-handle-demo-actions" aria-label="命令式 handle 操作">
          <button type="button" data-testid="imperative-handle-focus" onClick={handleFocus}>
            调用 focus
          </button>
          <button type="button" data-testid="imperative-handle-select" onClick={handleSelectAll}>
            调用 selectAll
          </button>
          <button
            type="button"
            data-testid="imperative-handle-inspect"
            onClick={handleInspectInterface}
          >
            记录当前 handle
          </button>
          <button
            type="button"
            data-testid="imperative-handle-label-toggle"
            onClick={handleToggleLabel}
          >
            切换 label 依赖
          </button>
          <button type="button" data-testid="imperative-handle-shell" onClick={handleShellUpdate}>
            只更新外壳
          </button>
          <button type="button" data-testid="imperative-handle-mount" onClick={handleToggleMounted}>
            {isMounted ? '卸载子组件' : '重新挂载'}
          </button>
          <button type="button" data-testid="imperative-handle-reset" onClick={handleReset}>
            重建实验
          </button>
        </div>
      </div>

      <div className="use-imperative-handle-demo-result" role="status" aria-live="polite">
        <span>命令与合同证据</span>
        <strong data-testid="imperative-handle-result-title">{result.title}</strong>
        <p data-testid="imperative-handle-result-detail">{result.detail}</p>
        <code data-testid="imperative-handle-result-api">公开 API：{result.api}</code>
        <code data-testid="imperative-handle-result-identity">引用关系：{result.identity}</code>
        <code data-testid="imperative-handle-result-evidence">执行证据：{result.evidence}</code>
      </div>
    </section>
  )
}
