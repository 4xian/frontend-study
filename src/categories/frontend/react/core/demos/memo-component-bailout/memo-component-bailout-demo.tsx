import { memo, Profiler, useRef, useState } from 'react'
import type { ProfilerOnRenderCallback, Ref } from 'react'
import './memo-component-bailout-demo.css'

type ReportKind = 'normal' | 'memoized'
type CommitPhase = Parameters<ProfilerOnRenderCallback>[1]

type RenderRecord = Readonly<{
  sequence: number
  kind: ReportKind
  phase: CommitPhase
  actualDuration: number
  baseDuration: number
}>

type RecordsRef = {
  current: RenderRecord[]
}

type LogRef = {
  current: HTMLElement | null
}

type ReportProps = Readonly<{
  kind: ReportKind
  version: number
  recordsRef: RecordsRef
  logRef: LogRef
}>

type MeasurementLogProps = Readonly<{
  containerRef: Ref<HTMLElement>
}>

const reportLabels: Record<ReportKind, string> = {
  normal: '普通组件',
  memoized: 'memo 组件',
}

/** 把 Profiler 的毫秒读数格式化为便于对照的两位小数。 */
function formatDuration(duration: number): string {
  return `${duration.toFixed(2)} ms`
}

/** 执行确定性的渲染期计算，让两种报告拥有相同的可测工作。 */
function calculateChecksum(version: number): number {
  let checksum = version

  for (let index = 0; index < 260_000; index += 1) {
    checksum = (checksum + (((index + version) * 19) % 113)) % 100_019
  }

  return checksum
}

/** 把最近八次 commit 格式化为可扫描的历史文本。 */
function formatHistory(records: readonly RenderRecord[]): string {
  if (records.length === 0) return '暂无记录'

  return records
    .map(
      (record) =>
        `#${record.sequence} ${reportLabels[record.kind]} · ${record.phase}\n` +
        `actual ${formatDuration(record.actualDuration)} / ` +
        `base ${formatDuration(record.baseDuration)}`,
    )
    .join('\n\n')
}

/** 更新日志中的一个字段，不安排新的 React render。 */
function writeLogField(container: HTMLElement | null, field: string, value: string) {
  const element = container?.querySelector<HTMLElement>(`[data-log-field="${field}"]`)
  if (element) element.textContent = value
}

/** 把报告 commit 记录写入被测组件外部的固定日志 DOM。 */
function renderCommitLog(container: HTMLElement | null, records: readonly RenderRecord[]) {
  const normalCount = records.filter((record) => record.kind === 'normal').length
  const memoizedCount = records.filter((record) => record.kind === 'memoized').length
  const latestRecord = records.at(-1)

  writeLogField(container, 'normal-count', String(normalCount))
  writeLogField(container, 'memoized-count', String(memoizedCount))
  writeLogField(container, 'total-count', `${records.length} 条`)
  writeLogField(
    container,
    'latest',
    latestRecord
      ? `${reportLabels[latestRecord.kind]} ${latestRecord.phase}：actual ${formatDuration(latestRecord.actualDuration)} / base ${formatDuration(latestRecord.baseDuration)}`
      : '记录已清空，等待下一次报告 commit。',
  )
  writeLogField(container, 'history', formatHistory(records))
}

/** 渲染报告的可见内容，并根据相同 Props 执行相同计算。 */
function ReportContent({ kind, version }: Pick<ReportProps, 'kind' | 'version'>) {
  const checksum = calculateChecksum(version)

  return (
    <article className={`memo-bailout-demo-report is-${kind}`} data-testid={`${kind}-report`}>
      <span>{reportLabels[kind]}</span>
      <strong>报告版本 {version}</strong>
      <p>
        校验值 <output>{checksum}</output>
      </p>
    </article>
  )
}

/** 在组件真正 render 时记录内部 Profiler 的 commit 数据。 */
function Report({ kind, version, recordsRef, logRef }: ReportProps) {
  /** 将当前报告的 commit 追加到共享的观察记录。 */
  const handleRender: ProfilerOnRenderCallback = (_id, phase, actualDuration, baseDuration) => {
    const currentRecords = recordsRef.current
    const nextRecords = [
      ...currentRecords.slice(-7),
      {
        sequence: (currentRecords.at(-1)?.sequence ?? 0) + 1,
        kind,
        phase,
        actualDuration,
        baseDuration,
      },
    ]
    recordsRef.current = nextRecords
    renderCommitLog(logRef.current, nextRecords)
  }

  return (
    <Profiler id={kind} onRender={handleRender}>
      <ReportContent kind={kind} version={version} />
    </Profiler>
  )
}

/** 只增加 Props 比较能力，不改变报告组件的功能输出。 */
const MemoizedReport = memo(Report)

/** 提供位于被测报告之外的固定日志结构。 */
function MeasurementLog({ containerRef }: MeasurementLogProps) {
  return (
    <section
      ref={containerRef}
      className="memo-bailout-demo-log"
      aria-labelledby="memo-bailout-log-title"
    >
      <header>
        <div>
          <span>当前观察窗口</span>
          <h3 id="memo-bailout-log-title">真实 commit</h3>
        </div>
        <output data-log-field="total-count" data-testid="total-commit-count">
          0 条
        </output>
      </header>

      <dl className="memo-bailout-demo-counts">
        <div>
          <dt>普通组件</dt>
          <dd data-log-field="normal-count" data-testid="normal-commit-count">
            0
          </dd>
        </div>
        <div>
          <dt>memo 组件</dt>
          <dd data-log-field="memoized-count" data-testid="memoized-commit-count">
            0
          </dd>
        </div>
      </dl>

      <p
        className="memo-bailout-demo-latest"
        data-log-field="latest"
        role="status"
        aria-live="polite"
      >
        记录已清空，等待下一次报告 commit。
      </p>

      <output
        className="memo-bailout-demo-history"
        data-log-field="history"
        aria-label="报告 commit 历史"
      >
        暂无记录
      </output>
    </section>
  )
}

/** 演示父级更新时普通组件重渲染，而相同 Props 的 memo 组件跳过工作。 */
export default function MemoComponentBailoutDemo() {
  const [parentRevision, setParentRevision] = useState(0)
  const [reportVersion, setReportVersion] = useState(1)
  const recordsRef = useRef<RenderRecord[]>([])
  const logRef = useRef<HTMLElement>(null)

  /** 只更新父级自己的 State，不改变传给两个报告的 Props。 */
  function updateParentOnly() {
    setParentRevision((currentRevision) => currentRevision + 1)
  }

  /** 修改两个报告共享的标量 Prop，要求普通与 memo 分支都正常 render。 */
  function updateReportProps() {
    setReportVersion((currentVersion) => currentVersion + 1)
  }

  /** 清空外部日志，不触发被测父级与两个报告更新。 */
  function clearRecords() {
    recordsRef.current = []
    renderCommitLog(logRef.current, recordsRef.current)
  }

  return (
    <section className="memo-bailout-demo" data-testid="memo-component-bailout-demo">
      <header className="memo-bailout-demo-heading">
        <p>Props comparison</p>
        <h2>相同输入时，观察哪一个组件跳过 render</h2>
        <span>
          父级版本 <output data-testid="parent-revision">{parentRevision}</output>，报告 Prop{' '}
          <output data-testid="report-version">{reportVersion}</output>
        </span>
      </header>

      <div className="memo-bailout-demo-controls" aria-label="组件渲染对照控制">
        <button type="button" onClick={updateParentOnly}>
          仅更新父组件
        </button>
        <button type="button" onClick={updateReportProps}>
          修改报告 Props
        </button>
        <button type="button" className="is-secondary" onClick={clearRecords}>
          清空记录
        </button>
      </div>

      <div className="memo-bailout-demo-stage">
        <MeasurementLog containerRef={logRef} />
        <div className="memo-bailout-demo-reports">
          <Report kind="normal" version={reportVersion} recordsRef={recordsRef} logRef={logRef} />
          <MemoizedReport
            kind="memoized"
            version={reportVersion}
            recordsRef={recordsRef}
            logRef={logRef}
          />
        </div>
      </div>
    </section>
  )
}
