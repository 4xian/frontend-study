import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

import { startBackgroundUpdate } from './start-transition-background-update'
import './start-transition-background-update-demo.css'

type ViewChoice = 'overview' | 'details' | 'history'

type CommitRecord = Readonly<{
  sequence: number
  view: ViewChoice
}>

const viewLabels: Record<ViewChoice, string> = {
  overview: '概览视图',
  details: '详细视图',
  history: '历史视图',
}

const viewDescriptions: Record<ViewChoice, string> = {
  overview: '显示摘要和最近活动。',
  details: '显示完整条目与辅助说明。',
  history: '显示按时间排列的历史记录。',
}

const viewItemCounts: Record<ViewChoice, number> = {
  overview: 80,
  details: 120,
  history: 160,
}

/** 根据当前视图和条目序号执行确定性的渲染期计算。 */
function calculateItemChecksum(view: ViewChoice, itemIndex: number): number {
  let checksum = view.length + itemIndex

  for (let index = 0; index < 3_000; index += 1) {
    checksum = (checksum * 31 + index + view.charCodeAt(index % view.length)) % 1_000_003
  }

  return checksum
}

/** 自持受控输入 State，让键击更新不要求后台视图子树重新渲染。 */
function ResponsiveInput() {
  const [inputValue, setInputValue] = useState('')

  /** 直接用普通 State 更新受控输入，不进入 Transition。 */
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setInputValue(event.target.value)
  }

  return (
    <label className="start-transition-background-update-input">
      <span>普通输入 State</span>
      <input
        value={inputValue}
        onChange={handleInputChange}
        placeholder="输入文字，同时切换后台视图"
      />
      <small>
        当前输入：
        <output data-testid="input-value">{inputValue || '（尚未输入）'}</output>
      </small>
    </label>
  )
}

type BackgroundRowProps = Readonly<{
  itemIndex: number
  view: ViewChoice
}>

/** 渲染一个确定性列表条目，为后台 render 提供可被调度器分段处理的组件边界。 */
function BackgroundRow({ itemIndex, view }: BackgroundRowProps) {
  const checksum = calculateItemChecksum(view, itemIndex)

  return (
    <li>
      <span>条目 {itemIndex + 1}</span>
      <output>{checksum}</output>
    </li>
  )
}

type BackgroundViewProps = Readonly<{
  view: ViewChoice
}>

/** 渲染后台 State 驱动的昂贵视图；它不读取输入框的普通 State。 */
function BackgroundView({ view }: BackgroundViewProps) {
  return (
    <article className="start-transition-background-update-view" data-testid="background-view">
      <span>后台视图已提交</span>
      <strong>{viewLabels[view]}</strong>
      <p>{viewDescriptions[view]}</p>
      <ul aria-label={`${viewLabels[view]}的本地条目`}>
        {Array.from({ length: viewItemCounts[view] }, (_, itemIndex) => (
          <BackgroundRow key={itemIndex} itemIndex={itemIndex} view={view} />
        ))}
      </ul>
    </article>
  )
}

type CommitLogProps = Readonly<{
  view: ViewChoice
}>

/** 只在后台视图提交后记录已提交结果，不把 render 尝试次数当作调度合同。 */
function CommitLog({ view }: CommitLogProps) {
  const [records, setRecords] = useState<CommitRecord[]>([])

  useEffect(() => {
    setRecords((currentRecords) => [
      ...currentRecords.slice(-4),
      { sequence: (currentRecords.at(-1)?.sequence ?? 0) + 1, view },
    ])
  }, [view])

  return (
    <section className="start-transition-background-update-log" aria-labelledby="commit-log-title">
      <header>
        <div>
          <span>已提交记录</span>
          <h3 id="commit-log-title">后台视图 commit</h3>
        </div>
        <output data-testid="commit-count">{records.length} 条</output>
      </header>
      <ol aria-label="后台视图提交记录">
        {records.map((record) => (
          <li key={record.sequence}>
            <span>#{record.sequence}</span>
            <strong>{viewLabels[record.view]}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}

type TransitionControlsProps = Readonly<{
  view: ViewChoice
  setView: (view: ViewChoice) => void
}>

/** 持有普通输入和 action 计数，并把真实视图 setter 交给 Hook 外包装函数。 */
function TransitionControls({ view, setView }: TransitionControlsProps) {
  const [transitionCalls, setTransitionCalls] = useState(0)

  /** 标记视图 State，并用控制子树的普通 State 同步记录 action 调用。 */
  function selectView(nextView: ViewChoice): void {
    startBackgroundUpdate(() => {
      setView(nextView)
    })
    setTransitionCalls((count) => count + 1)
  }

  return (
    <>
      <div className="start-transition-background-update-controls" aria-label="Transition 控制">
        <ResponsiveInput />
        <div className="start-transition-background-update-choices" aria-label="后台视图选择">
          <span>后台视图 State</span>
          <div>
            {(Object.keys(viewLabels) as ViewChoice[]).map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={view === choice}
                onClick={() => selectView(choice)}
              >
                {viewLabels[choice]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="start-transition-background-update-status" aria-live="polite">
        <div>
          <span>当前后台视图</span>
          <strong data-testid="view-value">{viewLabels[view]}</strong>
        </div>
        <div>
          <span>Transition action 调用</span>
          <strong data-testid="transition-call-count">{transitionCalls} 次</strong>
        </div>
        <div>
          <span>pending 信号</span>
          <strong data-testid="pending-signal">standalone API 不提供</strong>
        </div>
      </div>
    </>
  )
}

/** 演示输入普通更新与 Hook 外 standalone startTransition 的后台视图更新分离。 */
export default function StartTransitionBackgroundUpdateDemo() {
  const [view, setView] = useState<ViewChoice>('overview')

  return (
    <section
      className="start-transition-background-update-demo"
      data-testid="start-transition-background-update-demo"
    >
      <header className="start-transition-background-update-heading">
        <p>Standalone Transition</p>
        <h2>把非紧急视图交给后台更新</h2>
        <span>输入框保持普通更新；视图选择由 Hook 外的 startTransition 标记。</span>
      </header>

      <TransitionControls view={view} setView={setView} />

      <div className="start-transition-background-update-stage">
        <BackgroundView view={view} />
        <CommitLog view={view} />
      </div>
    </section>
  )
}
