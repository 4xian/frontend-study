import { memo, Profiler, useCallback, useRef, useState } from 'react'
import type { ProfilerOnRenderCallback, Ref } from 'react'
import './use-callback-function-identity-demo.css'

type ToolbarKind = 'inline' | 'cached'
type CommitPhase = Parameters<ProfilerOnRenderCallback>[1]

type CommitRecord = Readonly<{
  sequence: number
  kind: ToolbarKind
  phase: CommitPhase
}>

type RecordsRef = {
  current: CommitRecord[]
}

type LogRef = {
  current: HTMLElement | null
}

type ToolbarProps = Readonly<{
  kind: ToolbarKind
  reportVersion: number
  recordsRef: RecordsRef
  logRef: LogRef
  onSave: () => void
}>

type MeasurementLogProps = Readonly<{
  containerRef: Ref<HTMLElement>
}>

const toolbarLabels: Record<ToolbarKind, string> = {
  inline: '每次新建函数',
  cached: 'useCallback 函数',
}

/** 执行确定性的渲染期计算，让两个工具栏拥有相同的可测工作。 */
function calculateChecksum(version: number): number {
  let checksum = version

  for (let index = 0; index < 220_000; index += 1) {
    checksum = (checksum + (((index + version) * 23) % 127)) % 100_019
  }

  return checksum
}

/** 把最近八次 commit 格式化为便于对照的历史文本。 */
function formatHistory(records: readonly CommitRecord[]): string {
  if (records.length === 0) return '暂无记录'

  return records
    .map((record) => `#${record.sequence} ${toolbarLabels[record.kind]} · ${record.phase} commit`)
    .join('\n\n')
}

/** 更新日志中的一个字段，不安排新的 React render。 */
function writeLogField(container: HTMLElement | null, field: string, value: string) {
  const element = container?.querySelector<HTMLElement>(`[data-log-field="${field}"]`)
  if (element) element.textContent = value
}

/** 把工具栏 commit 记录写入被测组件外部的固定日志 DOM。 */
function renderCommitLog(container: HTMLElement | null, records: readonly CommitRecord[]) {
  const inlineCount = records.filter((record) => record.kind === 'inline').length
  const cachedCount = records.filter((record) => record.kind === 'cached').length
  const latestRecord = records.at(-1)

  writeLogField(container, 'inline-count', String(inlineCount))
  writeLogField(container, 'cached-count', String(cachedCount))
  writeLogField(container, 'total-count', `${records.length} 条`)
  writeLogField(
    container,
    'latest',
    latestRecord
      ? `${toolbarLabels[latestRecord.kind]}完成 ${latestRecord.phase} commit。`
      : '记录已清空，等待下一次工具栏 commit。',
  )
  writeLogField(container, 'history', formatHistory(records))
}

/** 把保存结果写入观察区，不让结果展示触发父组件 render。 */
function writeSaveResult(
  container: HTMLOutputElement | null,
  kind: ToolbarKind,
  reportVersion: number,
) {
  if (container) {
    container.textContent = `${toolbarLabels[kind]}保存了报告版本 ${reportVersion}。`
  }
}

/** 渲染工具栏内容，并执行两个分支共用的确定性工作。 */
function ToolbarContent({
  kind,
  reportVersion,
  onSave,
}: Pick<ToolbarProps, 'kind' | 'reportVersion' | 'onSave'>) {
  const checksum = calculateChecksum(reportVersion)

  return (
    <article
      className={`callback-identity-demo-toolbar is-${kind}`}
      data-testid={`${kind}-toolbar`}
    >
      <span>{toolbarLabels[kind]}</span>
      <strong>报告版本 {reportVersion}</strong>
      <p>
        校验值 <output>{checksum}</output>
      </p>
      <button type="button" onClick={onSave} data-testid={`${kind}-save`}>
        保存当前版本
      </button>
    </article>
  )
}

/** 在工具栏真正 render 时记录内部 Profiler 的 commit 数据。 */
function Toolbar({ kind, reportVersion, recordsRef, logRef, onSave }: ToolbarProps) {
  /** 将当前工具栏的 commit 追加到共享的观察记录。 */
  const handleRender: ProfilerOnRenderCallback = (_id, phase) => {
    const currentRecords = recordsRef.current
    const nextRecords = [
      ...currentRecords.slice(-7),
      {
        sequence: (currentRecords.at(-1)?.sequence ?? 0) + 1,
        kind,
        phase,
      },
    ]
    recordsRef.current = nextRecords
    renderCommitLog(logRef.current, nextRecords)
  }

  return (
    <Profiler id={`${kind}-toolbar`} onRender={handleRender}>
      <ToolbarContent kind={kind} reportVersion={reportVersion} onSave={onSave} />
    </Profiler>
  )
}

/** 为两个实验分支增加相同的默认 Props 比较。 */
const MemoizedToolbar = memo(Toolbar)

/** 提供位于被测工具栏之外的固定日志结构。 */
function MeasurementLog({ containerRef }: MeasurementLogProps) {
  return (
    <section
      ref={containerRef}
      className="callback-identity-demo-log"
      aria-labelledby="callback-identity-log-title"
    >
      <header>
        <div>
          <span>当前观察窗口</span>
          <h3 id="callback-identity-log-title">工具栏 commit</h3>
        </div>
        <output data-log-field="total-count" data-testid="total-commit-count">
          0 条
        </output>
      </header>

      <dl className="callback-identity-demo-counts">
        <div>
          <dt>每次新建函数</dt>
          <dd data-log-field="inline-count" data-testid="inline-commit-count">
            0
          </dd>
        </div>
        <div>
          <dt>useCallback</dt>
          <dd data-log-field="cached-count" data-testid="cached-commit-count">
            0
          </dd>
        </div>
      </dl>

      <p
        className="callback-identity-demo-latest"
        data-log-field="latest"
        role="status"
        aria-live="polite"
      >
        记录已清空，等待下一次工具栏 commit。
      </p>

      <output
        className="callback-identity-demo-history"
        data-log-field="history"
        aria-label="工具栏 commit 历史"
      >
        暂无记录
      </output>
    </section>
  )
}

/** 对照每次新建的函数与 useCallback 函数在 memo 子组件中的身份效果。 */
export default function UseCallbackFunctionIdentityDemo() {
  const [parentRevision, setParentRevision] = useState(0)
  const [reportVersion, setReportVersion] = useState(1)
  const recordsRef = useRef<CommitRecord[]>([])
  const logRef = useRef<HTMLElement>(null)
  const saveResultRef = useRef<HTMLOutputElement>(null)

  /** 让普通分支每次父组件 render 都得到新的函数 Prop。 */
  function saveFromInlineFunction() {
    writeSaveResult(saveResultRef.current, 'inline', reportVersion)
  }

  /** 在报告版本不变时返回旧函数，变化时返回读取新版本的新函数。 */
  const saveFromCachedFunction = useCallback(() => {
    writeSaveResult(saveResultRef.current, 'cached', reportVersion)
  }, [reportVersion])

  /** 只更新父级自己的 State，不修改任一工具栏的标量输入。 */
  function updateParentOnly() {
    setParentRevision((currentRevision) => currentRevision + 1)
  }

  /** 更新两个工具栏显示的版本，同时刷新缓存函数的真实依赖。 */
  function updateReportVersion() {
    setReportVersion((currentVersion) => currentVersion + 1)
  }

  /** 清空外部日志，不触发父组件与工具栏更新。 */
  function clearRecords() {
    recordsRef.current = []
    renderCommitLog(logRef.current, recordsRef.current)
  }

  return (
    <section className="callback-identity-demo" data-testid="use-callback-function-identity-demo">
      <header className="callback-identity-demo-heading">
        <p>Function identity</p>
        <h2>相同父级更新下，对照两个函数 Prop</h2>
        <span>
          父级版本 <output data-testid="parent-revision">{parentRevision}</output>，报告版本{' '}
          <output data-testid="report-version">{reportVersion}</output>
        </span>
      </header>

      <div className="callback-identity-demo-controls" aria-label="函数身份对照控制">
        <button type="button" onClick={updateParentOnly}>
          仅更新父组件
        </button>
        <button type="button" onClick={updateReportVersion}>
          修改报告版本
        </button>
        <button type="button" className="is-secondary" onClick={clearRecords}>
          清空记录
        </button>
      </div>

      <output
        ref={saveResultRef}
        className="callback-identity-demo-result"
        role="status"
        aria-live="polite"
        data-testid="save-result"
      >
        尚未保存报告。
      </output>

      <div className="callback-identity-demo-stage">
        <MeasurementLog containerRef={logRef} />
        <div className="callback-identity-demo-toolbars">
          <MemoizedToolbar
            kind="inline"
            reportVersion={reportVersion}
            recordsRef={recordsRef}
            logRef={logRef}
            onSave={saveFromInlineFunction}
          />
          <MemoizedToolbar
            kind="cached"
            reportVersion={reportVersion}
            recordsRef={recordsRef}
            logRef={logRef}
            onSave={saveFromCachedFunction}
          />
        </div>
      </div>
    </section>
  )
}
