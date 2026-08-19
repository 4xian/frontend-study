import { memo, Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, ProfilerOnRenderCallback, SetStateAction } from 'react'

import './lab-render-performance-demo.css'

type StrategyId = 'baseline' | 'memo-only' | 'stable-value' | 'stable-callback' | 'complete'

type Workload = 1 | 2 | 3

type Report = Readonly<{
  id: string
  title: string
  owner: string
  status: '进行中' | '待复核' | '已完成'
  baseScore: number
}>

type ReportRow = Report &
  Readonly<{
    score: number
  }>

type MeasurementRecord = Readonly<{
  sequence: number
  id: string
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
}>

type WorkspaceProps = Readonly<{
  query: string
  workload: Workload
  selectedId: string | null
  onSelect: Dispatch<SetStateAction<string | null>>
  onRender: ProfilerOnRenderCallback
}>

type ReportListProps = Readonly<{
  rows: readonly ReportRow[]
  selectedId: string | null
  onSelect: (reportId: string) => void
  onRender: ProfilerOnRenderCallback
}>

type WorkspaceResultProps = ReportListProps &
  Readonly<{
    strategy: StrategyId
    ListComponent: typeof ReportList | typeof MemoReportList
  }>

type PerformanceSceneProps = Readonly<{
  onReset: () => void
}>

const reportTopics = ['渲染性能', '数据同步', '表单校验', '权限审计', '组件复用', '错误恢复']
const reportOwners = ['林宁', '周言', '陈初', '顾遥', '苏禾']
const reportStatuses: Report['status'][] = ['进行中', '待复核', '已完成']

const reports: readonly Report[] = Array.from({ length: 140 }, (_, index) => ({
  id: `report-${index + 1}`,
  title: `${reportTopics[index % reportTopics.length]}报告 ${index + 1}`,
  owner: reportOwners[index % reportOwners.length] ?? '未分配',
  status: reportStatuses[index % reportStatuses.length] ?? '进行中',
  baseScore: (index * 29 + 17) % 101,
}))

const strategyOrder: readonly StrategyId[] = [
  'baseline',
  'memo-only',
  'stable-value',
  'stable-callback',
  'complete',
]

const strategyDetails: Record<
  StrategyId,
  Readonly<{ label: string; summary: string; expectation: string }>
> = {
  baseline: {
    label: '未优化',
    summary: '普通列表、新数组、新函数',
    expectation: '无关主题更新会让列表再次 render。',
  },
  'memo-only': {
    label: '仅 memo',
    summary: 'memo 列表、新数组、新函数',
    expectation: '两个引用 Prop 都变化，列表仍会 render。',
  },
  'stable-value': {
    label: '稳定值',
    summary: 'memo + useMemo，新函数',
    expectation: 'rows 已稳定，但函数 Prop 仍会阻止跳过。',
  },
  'stable-callback': {
    label: '稳定函数',
    summary: 'memo + useCallback，新数组',
    expectation: '函数已稳定，但数组 Prop 仍会阻止跳过。',
  },
  complete: {
    label: '完整组合',
    summary: 'memo + useMemo + useCallback',
    expectation: '无关主题更新时，列表可以跳过 render。',
  },
}

const workloadLabels: Record<Workload, string> = {
  1: '标准',
  2: '较重',
  3: '重载',
}

/** 用固定数据、固定循环和固定排序生成可比较的报告行。 */
function calculateReportRows(query: string, workload: Workload): readonly ReportRow[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')

  return reports
    .filter((report) => {
      const searchable = `${report.title} ${report.owner} ${report.status}`.toLocaleLowerCase(
        'zh-CN',
      )
      return searchable.includes(normalizedQuery)
    })
    .map((report) => {
      let score = report.baseScore

      for (let repetition = 0; repetition < workload; repetition += 1) {
        score = report.baseScore

        for (let cycle = 0; cycle < 2400; cycle += 1) {
          score = (score * 33 + report.id.charCodeAt(cycle % report.id.length) + cycle) % 100_003
        }
      }

      return { ...report, score }
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
}

/** 把同一结果集压缩成便于核对的确定性校验值。 */
function calculateChecksum(rows: readonly ReportRow[]): number {
  return rows.reduce((total, row) => (total + row.score) % 100_003, 0)
}

/** 把 Profiler 的毫秒数据格式化为稳定的两位小数文本。 */
function formatDuration(duration: number): string {
  return `${duration.toFixed(2)} ms`
}

/** 更新日志面板中的边界计数、最新数据和最近记录。 */
function renderMeasurementLog(
  host: HTMLElement | null,
  records: readonly MeasurementRecord[],
): void {
  if (!host) return

  const workspaceRecords = records.filter((record) => record.id === 'workspace')
  const listRecords = records.filter((record) => record.id === 'report-list')
  const latestRecord = records.at(-1)
  const workspaceCount = host.querySelector<HTMLElement>('[data-log-field="workspace-count"]')
  const listCount = host.querySelector<HTMLElement>('[data-log-field="list-count"]')
  const latestBoundary = host.querySelector<HTMLElement>('[data-log-field="latest-boundary"]')
  const latestPhase = host.querySelector<HTMLElement>('[data-log-field="latest-phase"]')
  const latestActual = host.querySelector<HTMLElement>('[data-log-field="latest-actual"]')
  const latestBase = host.querySelector<HTMLElement>('[data-log-field="latest-base"]')
  const history = host.querySelector<HTMLElement>('[data-log-field="history"]')

  if (workspaceCount) workspaceCount.textContent = String(workspaceRecords.length)
  if (listCount) listCount.textContent = String(listRecords.length)
  if (latestBoundary) latestBoundary.textContent = latestRecord?.id ?? '--'
  if (latestPhase) latestPhase.textContent = latestRecord?.phase ?? '--'
  if (latestActual) {
    latestActual.textContent = latestRecord ? formatDuration(latestRecord.actualDuration) : '--'
  }
  if (latestBase) {
    latestBase.textContent = latestRecord ? formatDuration(latestRecord.baseDuration) : '--'
  }
  if (history) {
    history.textContent = records.length
      ? records
          .map(
            (record) =>
              `#${record.sequence} ${record.id} · ${record.phase} · actual ${formatDuration(record.actualDuration)} · base ${formatDuration(record.baseDuration)} · commit ${record.commitTime.toFixed(1)}`,
          )
          .join('\n')
      : '暂无记录'
  }
}

/** 渲染固定数量的报告行，并在列表内部建立独立 Profiler 边界。 */
function ReportList({ rows, selectedId, onSelect, onRender }: ReportListProps) {
  const checksum = calculateChecksum(rows)

  return (
    <Profiler id="report-list" onRender={onRender}>
      <section className="render-performance-demo-list" data-testid="render-performance-list">
        <header>
          <div>
            <span>慢列表边界</span>
            <h3>诊断报告</h3>
          </div>
          <p>
            {rows.length} 条 · 校验值{' '}
            <output data-testid="render-performance-checksum">{checksum}</output>
          </p>
        </header>

        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                aria-pressed={selectedId === row.id}
                onClick={() => onSelect(row.id)}
              >
                <span>
                  <strong>{row.title}</strong>
                  <small>
                    {row.owner} · {row.status}
                  </small>
                </span>
                <output>{row.score}</output>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </Profiler>
  )
}

const MemoReportList = memo(ReportList)

/** 组合策略说明与共享列表，保证五种策略只改变缓存关系。 */
function WorkspaceResult({
  strategy,
  ListComponent,
  rows,
  selectedId,
  onSelect,
  onRender,
}: WorkspaceResultProps) {
  const details = strategyDetails[strategy]

  return (
    <article
      className="render-performance-demo-workspace"
      data-testid="render-performance-workspace"
    >
      <header className="render-performance-demo-workspace-heading">
        <div>
          <span>当前策略</span>
          <h2 data-testid="render-performance-strategy-label">{details.label}</h2>
        </div>
        <p>{details.summary}</p>
      </header>
      <p
        className="render-performance-demo-expectation"
        data-testid="render-performance-expectation"
      >
        {details.expectation}
      </p>
      <ListComponent rows={rows} selectedId={selectedId} onSelect={onSelect} onRender={onRender} />
    </article>
  )
}

/** 提供普通组件、新计算结果和新函数的未优化基线。 */
function BaselineWorkspace({ query, workload, selectedId, onSelect, onRender }: WorkspaceProps) {
  const rows = calculateReportRows(query, workload)

  /** 把报告选择转交给父级，并在每次 render 创建新身份。 */
  function selectReport(reportId: string): void {
    onSelect(reportId)
  }

  return (
    <WorkspaceResult
      strategy="baseline"
      ListComponent={ReportList}
      rows={rows}
      selectedId={selectedId}
      onSelect={selectReport}
      onRender={onRender}
    />
  )
}

/** 只包装 memo，保留新数组和新函数以暴露 Props 身份问题。 */
function MemoOnlyWorkspace({ query, workload, selectedId, onSelect, onRender }: WorkspaceProps) {
  const rows = calculateReportRows(query, workload)

  /** 把报告选择转交给父级，并故意保留每次 render 的新函数身份。 */
  function selectReport(reportId: string): void {
    onSelect(reportId)
  }

  return (
    <WorkspaceResult
      strategy="memo-only"
      ListComponent={MemoReportList}
      rows={rows}
      selectedId={selectedId}
      onSelect={selectReport}
      onRender={onRender}
    />
  )
}

/** 稳定计算结果，但保留新函数以隔离剩余的回调身份问题。 */
function StableValueWorkspace({ query, workload, selectedId, onSelect, onRender }: WorkspaceProps) {
  const rows = useMemo(() => calculateReportRows(query, workload), [query, workload])

  /** 把报告选择转交给父级，并故意让函数 Prop 在每次 render 变化。 */
  function selectReport(reportId: string): void {
    onSelect(reportId)
  }

  return (
    <WorkspaceResult
      strategy="stable-value"
      ListComponent={MemoReportList}
      rows={rows}
      selectedId={selectedId}
      onSelect={selectReport}
      onRender={onRender}
    />
  )
}

/** 稳定回调身份，但保留新数组以隔离剩余的值身份问题。 */
function StableCallbackWorkspace({
  query,
  workload,
  selectedId,
  onSelect,
  onRender,
}: WorkspaceProps) {
  const rows = calculateReportRows(query, workload)
  const selectReport = useCallback((reportId: string) => onSelect(reportId), [onSelect])

  return (
    <WorkspaceResult
      strategy="stable-callback"
      ListComponent={MemoReportList}
      rows={rows}
      selectedId={selectedId}
      onSelect={selectReport}
      onRender={onRender}
    />
  )
}

/** 同时稳定计算结果和回调身份，让 memo 获得完整跳过条件。 */
function CompleteWorkspace({ query, workload, selectedId, onSelect, onRender }: WorkspaceProps) {
  const rows = useMemo(() => calculateReportRows(query, workload), [query, workload])
  const selectReport = useCallback((reportId: string) => onSelect(reportId), [onSelect])

  return (
    <WorkspaceResult
      strategy="complete"
      ListComponent={MemoReportList}
      rows={rows}
      selectedId={selectedId}
      onSelect={selectReport}
      onRender={onRender}
    />
  )
}

const strategyComponents: Record<StrategyId, (props: WorkspaceProps) => React.JSX.Element> = {
  baseline: BaselineWorkspace,
  'memo-only': MemoOnlyWorkspace,
  'stable-value': StableValueWorkspace,
  'stable-callback': StableCallbackWorkspace,
  complete: CompleteWorkspace,
}

/** 管理一次可重置的诊断会话和被测边界之外的测量日志。 */
function PerformanceScene({ onReset }: PerformanceSceneProps) {
  const [strategy, setStrategy] = useState<StrategyId>('baseline')
  const [darkTheme, setDarkTheme] = useState(false)
  const [query, setQuery] = useState('性能')
  const [workload, setWorkload] = useState<Workload>(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const recordsRef = useRef<MeasurementRecord[]>([])
  const logRef = useRef<HTMLElement>(null)
  const StrategyWorkspace = strategyComponents[strategy]

  /** 收集内外 Profiler 的 commit 数据，并直接刷新被测树外的日志。 */
  const handleRender = useCallback<ProfilerOnRenderCallback>(
    (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      const currentRecords = recordsRef.current
      recordsRef.current = [
        ...currentRecords.slice(-11),
        {
          sequence: (currentRecords.at(-1)?.sequence ?? 0) + 1,
          id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        },
      ]
      renderMeasurementLog(logRef.current, recordsRef.current)
    },
    [],
  )

  useEffect(() => {
    recordsRef.current = []
    renderMeasurementLog(logRef.current, recordsRef.current)
  }, [])

  /** 切换对照策略并清空旧策略的测量记录。 */
  function changeStrategy(nextStrategy: StrategyId): void {
    recordsRef.current = []
    renderMeasurementLog(logRef.current, recordsRef.current)
    setStrategy(nextStrategy)
  }

  /** 只改变列表无关的父级主题 State。 */
  function toggleTheme(): void {
    setDarkTheme((currentTheme) => !currentTheme)
  }

  /** 切换查询依赖，要求所有策略重新生成结果。 */
  function changeQuery(): void {
    setQuery((currentQuery) => (currentQuery === '性能' ? '待复核' : '性能'))
    setSelectedId(null)
  }

  /** 切换固定计算规模，形成一组新的可比较输入。 */
  function changeWorkload(nextWorkload: Workload): void {
    setWorkload(nextWorkload)
  }

  /** 清空可见测量日志，不触发被测工作区更新。 */
  function clearMeasurements(): void {
    recordsRef.current = []
    renderMeasurementLog(logRef.current, recordsRef.current)
  }

  return (
    <section
      className={`render-performance-demo${darkTheme ? ' is-contrast' : ''}`}
      data-testid="lab-render-performance-demo"
    >
      <header className="render-performance-demo-heading">
        <div>
          <p>Render diagnosis</p>
          <h2>固定输入，逐项定位无关渲染</h2>
        </div>
        <span>
          父级主题{' '}
          <output data-testid="render-performance-theme">{darkTheme ? '深色' : '浅色'}</output>
        </span>
      </header>

      <fieldset className="render-performance-demo-strategies">
        <legend>对照策略</legend>
        {strategyOrder.map((strategyId) => (
          <button
            key={strategyId}
            type="button"
            aria-pressed={strategy === strategyId}
            disabled={strategy === strategyId}
            onClick={() => changeStrategy(strategyId)}
          >
            {strategyDetails[strategyId].label}
          </button>
        ))}
      </fieldset>

      <div className="render-performance-demo-controls" aria-label="渲染诊断控制">
        <button type="button" onClick={toggleTheme}>
          仅切换主题
        </button>
        <button type="button" onClick={changeQuery}>
          修改查询
        </button>
        <fieldset>
          <legend>计算规模</legend>
          {([1, 2, 3] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={workload === value}
              disabled={workload === value}
              onClick={() => changeWorkload(value)}
            >
              {workloadLabels[value]}
            </button>
          ))}
        </fieldset>
        <button type="button" className="is-secondary" onClick={clearMeasurements}>
          清空测量
        </button>
        <button type="button" className="is-secondary" onClick={onReset}>
          重置实验
        </button>
      </div>

      <p className="render-performance-demo-inputs">
        查询 <output data-testid="render-performance-query">{query}</output> · 计算规模{' '}
        <output data-testid="render-performance-workload">{workloadLabels[workload]}</output> · 选中{' '}
        <output data-testid="render-performance-selected">{selectedId ?? '无'}</output>
      </p>

      <Profiler id="workspace" onRender={handleRender}>
        <StrategyWorkspace
          query={query}
          workload={workload}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRender={handleRender}
        />
      </Profiler>

      <section
        ref={logRef}
        className="render-performance-demo-log"
        aria-label="Profiler 测量记录"
        data-testid="render-performance-log"
      >
        <header>
          <div>
            <span>Profiler commits</span>
            <h3>测量记录</h3>
          </div>
          <p>
            workspace <output data-log-field="workspace-count">0</output> · list{' '}
            <output data-log-field="list-count" data-testid="render-performance-list-count">
              0
            </output>
          </p>
        </header>
        <dl>
          <div>
            <dt>最新边界</dt>
            <dd data-log-field="latest-boundary">--</dd>
          </div>
          <div>
            <dt>phase</dt>
            <dd data-log-field="latest-phase">--</dd>
          </div>
          <div>
            <dt>actualDuration</dt>
            <dd data-log-field="latest-actual">--</dd>
          </div>
          <div>
            <dt>baseDuration</dt>
            <dd data-log-field="latest-base">--</dd>
          </div>
        </dl>
        <output data-log-field="history" className="render-performance-demo-history">
          暂无记录
        </output>
      </section>
    </section>
  )
}

/** 提供整棵实验子树的显式重建入口。 */
export default function LabRenderPerformanceDemo() {
  const [sessionVersion, setSessionVersion] = useState(1)

  /** 通过新 key 重建会话并恢复全部固定初值。 */
  function resetExperiment(): void {
    setSessionVersion((currentVersion) => currentVersion + 1)
  }

  return <PerformanceScene key={sessionVersion} onReset={resetExperiment} />
}
