import { Profiler, useRef, useState } from 'react'
import type { ProfilerOnRenderCallback, Ref } from 'react'
import './profiler-render-measurement-demo.css'

type Workload = 1 | 2 | 3
type CommitPhase = Parameters<ProfilerOnRenderCallback>[1]

type CommitRecord = Readonly<{
  sequence: number
  id: string
  phase: CommitPhase
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
}>

type MeasurementLogProps = Readonly<{
  containerRef: Ref<HTMLElement>
}>

type MeasuredReportProps = Readonly<{
  revision: number
  workload: Workload
}>

const workloadLabels: Record<Workload, string> = {
  1: '轻负载',
  2: '中负载',
  3: '重负载',
}

/** 把 Profiler 的毫秒读数格式化为稳定、易比较的两位小数。 */
function formatDuration(duration: number): string {
  return `${duration.toFixed(2)} ms`
}

/** 把 Profiler 时间戳格式化为相对页面时间原点的毫秒值。 */
function formatTimestamp(timestamp: number): string {
  return `${timestamp.toFixed(2)} ms`
}

/** 把最近六次 commit 格式化为可扫描的多行记录。 */
function formatHistory(records: readonly CommitRecord[]): string {
  if (records.length === 0) return '暂无记录'

  return records
    .map(
      (record) =>
        `#${record.sequence} ${record.id} · ${record.phase}\n` +
        `actual ${formatDuration(record.actualDuration)} / ` +
        `base ${formatDuration(record.baseDuration)}\n` +
        `start ${formatTimestamp(record.startTime)} / ` +
        `commit ${formatTimestamp(record.commitTime)}`,
    )
    .join('\n\n')
}

/** 更新日志中的一个已命名字段，不安排新的 React render。 */
function writeLogField(container: HTMLElement, field: string, value: string) {
  const element = container.querySelector<HTMLElement>(`[data-log-field="${field}"]`)
  if (element) element.textContent = value
}

/** 把当前记录写入 Profiler 外部的日志 DOM，避免观察动作污染被测子树。 */
function renderMeasurementLog(container: HTMLElement | null, records: readonly CommitRecord[]) {
  if (!container) return

  const latestRecord = records.at(-1)
  writeLogField(container, 'phase', latestRecord?.phase ?? '等待首次测量')
  writeLogField(container, 'id', latestRecord?.id ?? '--')
  writeLogField(container, 'count', `${records.length} 条记录`)
  writeLogField(
    container,
    'actualDuration',
    latestRecord ? formatDuration(latestRecord.actualDuration) : '--',
  )
  writeLogField(
    container,
    'baseDuration',
    latestRecord ? formatDuration(latestRecord.baseDuration) : '--',
  )
  writeLogField(
    container,
    'startTime',
    latestRecord ? formatTimestamp(latestRecord.startTime) : '--',
  )
  writeLogField(
    container,
    'commitTime',
    latestRecord ? formatTimestamp(latestRecord.commitTime) : '--',
  )
  writeLogField(container, 'history', formatHistory(records))
}

/** 执行确定性的渲染期计算，为不同负载提供可重复触发的测量对象。 */
function calculateChecksum(workload: Workload, revision: number): number {
  let checksum = revision
  const iterations = workload * 350_000

  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + (((index + revision) * 17) % 101)) % 100_003
  }

  return checksum
}

/** 渲染被 Profiler 包裹的报告子树，并根据交互参数执行确定性工作。 */
function MeasuredReport({ revision, workload }: MeasuredReportProps) {
  const checksum = calculateChecksum(workload, revision)

  return (
    <article className="profiler-measurement-demo-report" data-testid="measured-report">
      <span>被测子树</span>
      <strong>{workloadLabels[workload]}</strong>
      <p>
        第 {revision} 次更新，校验值 <output>{checksum}</output>
      </p>
    </article>
  )
}

/** 提供位于被测子树之外的固定日志结构。 */
function MeasurementLog({ containerRef }: MeasurementLogProps) {
  return (
    <section
      ref={containerRef}
      className="profiler-measurement-demo-log"
      aria-labelledby="profiler-log-title"
    >
      <header>
        <div>
          <span>最近一次 commit</span>
          <h3 id="profiler-log-title" data-log-field="phase" data-testid="latest-phase">
            等待首次测量
          </h3>
        </div>
        <output data-log-field="count" data-testid="commit-count">
          0 条记录
        </output>
      </header>

      <p className="profiler-measurement-demo-boundary">
        边界 id：
        <output data-log-field="id" data-testid="latest-boundary-id">
          --
        </output>
      </p>

      <dl className="profiler-measurement-demo-metrics">
        <div>
          <dt>actualDuration</dt>
          <dd data-log-field="actualDuration" data-testid="latest-actual-duration">
            --
          </dd>
        </div>
        <div>
          <dt>baseDuration</dt>
          <dd data-log-field="baseDuration" data-testid="latest-base-duration">
            --
          </dd>
        </div>
        <div>
          <dt>startTime</dt>
          <dd data-log-field="startTime" data-testid="latest-start-time">
            --
          </dd>
        </div>
        <div>
          <dt>commitTime</dt>
          <dd data-log-field="commitTime" data-testid="latest-commit-time">
            --
          </dd>
        </div>
      </dl>

      <output
        className="profiler-measurement-demo-history"
        data-log-field="history"
        aria-label="Profiler commit 记录"
      >
        暂无记录
      </output>
    </section>
  )
}

/** 演示 Profiler 如何按 commit 区分 mount/update 并报告两类渲染时长。 */
export default function ProfilerRenderMeasurementDemo() {
  const [revision, setRevision] = useState(0)
  const [workload, setWorkload] = useState<Workload>(1)
  const recordsRef = useRef<CommitRecord[]>([])
  const logRef = useRef<HTMLElement>(null)

  /** 把被测子树的 commit 数据转交给 Profiler 外部的日志组件。 */
  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    const currentRecords = recordsRef.current
    recordsRef.current = [
      ...currentRecords.slice(-5),
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
  }

  /** 触发一次参数明确的被测子树 update。 */
  function updateReport() {
    setRevision((currentRevision) => currentRevision + 1)
  }

  /** 切换渲染期工作量，并触发一次新的被测 commit。 */
  function changeWorkload(nextWorkload: Workload) {
    setWorkload(nextWorkload)
  }

  /** 清空日志组件的可见记录，不重新渲染被测子树。 */
  function clearMeasurements() {
    recordsRef.current = []
    renderMeasurementLog(logRef.current, recordsRef.current)
  }

  return (
    <section className="profiler-measurement-demo" data-testid="profiler-measurement-demo">
      <header className="profiler-measurement-demo-heading">
        <p>Commit measurement</p>
        <h2>先记录渲染成本，再讨论优化</h2>
        <span>触发更新或切换负载时，会产生一条可读的 Profiler commit 记录。</span>
      </header>

      <div className="profiler-measurement-demo-controls" aria-label="被测报告控制">
        <fieldset>
          <legend>渲染负载</legend>
          {([1, 2, 3] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={workload === value}
              onClick={() => changeWorkload(value)}
            >
              {workloadLabels[value]}
            </button>
          ))}
        </fieldset>
        <button type="button" onClick={updateReport}>
          触发一次 update
        </button>
        <button type="button" className="is-secondary" onClick={clearMeasurements}>
          清空记录
        </button>
      </div>

      <div className="profiler-measurement-demo-stage">
        <MeasurementLog containerRef={logRef} />

        <Profiler id="report" onRender={handleRender}>
          <MeasuredReport revision={revision} workload={workload} />
        </Profiler>
      </div>
    </section>
  )
}
