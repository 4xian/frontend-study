import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentType, ErrorInfo, LazyExoticComponent, ReactNode } from 'react'

import type { LazyReportPanelProps } from './lazy-report-panel'
import {
  getModuleLoaderCallCount,
  loadReportModule,
  prepareReportModule,
  rejectReportModule,
  resetReportModules,
  resolveReportModule,
} from './report-module-loader'
import {
  getReportCreationCount,
  prepareReportResource,
  rejectReportResource,
  resetReportResources,
  resolveReportResource,
} from './report-resource'
import type { ReportId } from './report-resource'
import './lab-lazy-report-viewer-demo.css'

type ViewerPhase =
  | 'idle'
  | 'module-pending'
  | 'module-released'
  | 'module-error'
  | 'data-pending'
  | 'data-released'
  | 'data-ready'
  | 'data-error'
  | 'outer-error'

type ReportAttempt = Readonly<{
  reportId: ReportId
  number: number
}>

type ViewerBoundaryProps = Readonly<{
  children: ReactNode
  fallback: ReactNode
  onCatch: (error: Error, errorInfo: ErrorInfo) => void
}>

type ViewerBoundaryState = Readonly<{
  hasError: boolean
}>

const reportOptions: readonly Readonly<{
  id: ReportId
  label: string
  summary: string
}>[] = [
  {
    id: 'enrollment',
    label: '课程报名质量',
    summary: '报名校验、材料与重复提交',
  },
  {
    id: 'runtime',
    label: '前端运行稳定性',
    summary: '正常会话、局部恢复与未恢复失败',
  },
]

const phaseLabels: Record<ViewerPhase, string> = {
  idle: '尚未选择报告',
  'module-pending': '查看器代码正在等待',
  'module-released': '代码加载门已放行',
  'module-error': '查看器代码加载失败',
  'data-pending': '查看器已就绪，报告数据正在等待',
  'data-released': '报告 Promise 已兑现',
  'data-ready': '报告内容已提交',
  'data-error': '报告读取失败',
  'outer-error': '外层查看器边界已接管',
}

/** 捕获 lazy loader 或内层 fallback 继续向上传播的渲染错误。 */
class ViewerErrorBoundary extends Component<ViewerBoundaryProps, ViewerBoundaryState> {
  state: ViewerBoundaryState = { hasError: false }

  /** 把后代错误转换为查看器区域的 fallback State。 */
  static getDerivedStateFromError(): ViewerBoundaryState {
    return { hasError: true }
  }

  /** 在 fallback 提交后向边界外状态面板报告错误。 */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onCatch(error, errorInfo)
  }

  /** 根据捕获状态显示外层 fallback 或继续渲染查看器区域。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

/** 为一次明确尝试创建稳定的 lazy 组件类型。 */
function createLazyReportPanel(
  moduleKey: string,
): LazyExoticComponent<ComponentType<LazyReportPanelProps>> {
  return lazy(() => loadReportModule(moduleKey))
}

type ModuleLoadingFallbackProps = Readonly<{
  reportLabel: string
}>

/** 显示查看器动态模块 pending 时的外层 Suspense fallback。 */
function ModuleLoadingFallback({ reportLabel }: ModuleLoadingFallbackProps) {
  return (
    <article
      className="lazy-report-viewer-fallback is-module"
      role="status"
      data-testid="report-module-pending"
    >
      <span>代码边界</span>
      <strong>正在加载报告查看器</strong>
      <p>{reportLabel}已选中，外壳和报告列表仍可操作。</p>
    </article>
  )
}

type ViewerAreaFailureProps = Readonly<{
  phase: ViewerPhase
  onRetryModule: () => void
  onRestoreDataFallback: () => void
}>

/** 显示外层边界接管的代码失败或内层 fallback 失败。 */
function ViewerAreaFailure({
  phase,
  onRetryModule,
  onRestoreDataFallback,
}: ViewerAreaFailureProps) {
  const isModuleFailure = phase === 'module-error'

  return (
    <article
      className="lazy-report-viewer-fallback is-outer-error"
      role="alert"
      data-testid="report-viewer-outer-error"
    >
      <span>查看器 Error Boundary</span>
      <strong>{isModuleFailure ? '查看器代码加载失败' : '报告区域的内层失败提示不可用'}</strong>
      <p>
        {isModuleFailure
          ? '同一个 lazy 类型已经缓存 rejection，需要新 lazy 身份和新边界。'
          : '内层边界不能捕获自己的 fallback 错误，失败已继续交给外层边界。'}
      </p>
      <button type="button" onClick={isModuleFailure ? onRetryModule : onRestoreDataFallback}>
        {isModuleFailure ? '使用新模块重试' : '恢复安全失败提示'}
      </button>
    </article>
  )
}

/** 组合报告选择、两层 Suspense、两层错误边界与可验证重试。 */
export default function LabLazyReportViewerDemo() {
  const identitySequence = useRef(0)
  const [phase, setPhase] = useState<ViewerPhase>('idle')
  const [attempt, setAttempt] = useState<ReportAttempt | null>(null)
  const [moduleKey, setModuleKey] = useState<string | null>(null)
  const [resourceKey, setResourceKey] = useState<string | null>(null)
  const [LazyReportPanel, setLazyReportPanel] = useState<LazyExoticComponent<
    ComponentType<LazyReportPanelProps>
  > | null>(null)
  const [moduleBoundaryVersion, setModuleBoundaryVersion] = useState(1)
  const [dataBoundaryVersion, setDataBoundaryVersion] = useState(1)
  const [shellRevision, setShellRevision] = useState(0)
  const [moduleLoadCount, setModuleLoadCount] = useState(0)
  const [breakDataFallback, setBreakDataFallback] = useState(false)
  const selectedReport = reportOptions.find((option) => option.id === attempt?.reportId)

  /** 在 Demo 挂载和卸载边界清理模块级确定性 fixture。 */
  useEffect(() => {
    resetReportModules()
    resetReportResources()
    return () => {
      resetReportModules()
      resetReportResources()
    }
  }, [])

  /** 在异步阶段提交后同步 lazy loader 调用次数，避免渲染期间直接更新 State。 */
  useEffect(() => {
    setModuleLoadCount(getModuleLoaderCallCount())
  }, [LazyReportPanel, moduleKey, phase])

  /** 生成不会与先前尝试复用的模块 key 或资源 key。 */
  function createIdentity(
    prefix: 'module' | 'resource',
    reportId: ReportId,
    number: number,
  ): string {
    identitySequence.current += 1
    return `${prefix}:${reportId}:${number}:${identitySequence.current}`
  }

  /** 同时准备一次新 lazy 类型和新报告 Promise。 */
  function startAttempt(reportId: ReportId, number: number): void {
    const nextModuleKey = createIdentity('module', reportId, number)
    const nextResourceKey = createIdentity('resource', reportId, number)
    prepareReportModule(nextModuleKey)
    prepareReportResource(nextResourceKey, reportId)
    setAttempt({ reportId, number })
    setModuleKey(nextModuleKey)
    setResourceKey(nextResourceKey)
    setLazyReportPanel(() => createLazyReportPanel(nextModuleKey))
    setModuleBoundaryVersion((version) => version + 1)
    setDataBoundaryVersion((version) => version + 1)
    setBreakDataFallback(false)
    setPhase('module-pending')
  }

  /** 选择报告并开始一条拥有独立身份的读取链。 */
  function selectReport(reportId: ReportId): void {
    const nextNumber = attempt?.reportId === reportId ? attempt.number + 1 : 1
    startAttempt(reportId, nextNumber)
  }

  /** 放行真实动态导入，让 lazy 从代码 fallback 进入查看器。 */
  function completeModuleLoad(): void {
    if (!moduleKey) return
    resolveReportModule(moduleKey)
    setPhase('module-released')
  }

  /** 拒绝当前 lazy loader，让外层 Error Boundary 接管。 */
  function failModuleLoad(): void {
    if (!moduleKey) return
    rejectReportModule(moduleKey)
    setPhase('module-error')
  }

  /** 创建新 lazy 类型并重建外层边界，不更换尚未读取的报告资源。 */
  function retryModuleLoad(): void {
    if (!attempt) return
    const nextModuleKey = createIdentity('module', attempt.reportId, attempt.number)
    prepareReportModule(nextModuleKey)
    setModuleKey(nextModuleKey)
    setLazyReportPanel(() => createLazyReportPanel(nextModuleKey))
    setModuleBoundaryVersion((version) => version + 1)
    setPhase('module-pending')
  }

  /** 兑现当前报告 Promise，让 use 返回固定报告数据。 */
  function completeReportRead(): void {
    if (!resourceKey) return
    resolveReportResource(resourceKey)
    setPhase('data-released')
  }

  /** 拒绝当前报告 Promise，让内层 Error Boundary 接管。 */
  function failReportRead(): void {
    if (!resourceKey) return
    rejectReportResource(resourceKey)
    setPhase('data-error')
  }

  /** 为同一报告创建新 Promise，并重建已失败的数据边界。 */
  function retryReportRead(): void {
    if (!attempt) return
    const nextNumber = attempt.number + 1
    const nextResourceKey = createIdentity('resource', attempt.reportId, nextNumber)
    prepareReportResource(nextResourceKey, attempt.reportId)
    setAttempt({ reportId: attempt.reportId, number: nextNumber })
    setResourceKey(nextResourceKey)
    setDataBoundaryVersion((version) => version + 1)
    setBreakDataFallback(false)
    setPhase('data-pending')
  }

  /** 只重建数据边界，故意继续读取同一个 rejected Promise。 */
  function retryWithBoundaryOnly(): void {
    setDataBoundaryVersion((version) => version + 1)
  }

  /** 只替换报告 Promise，故意保留错误边界的 hasError State。 */
  function retryWithResourceOnly(): void {
    if (!attempt) return
    const nextNumber = attempt.number + 1
    const nextResourceKey = createIdentity('resource', attempt.reportId, nextNumber)
    prepareReportResource(nextResourceKey, attempt.reportId)
    setAttempt({ reportId: attempt.reportId, number: nextNumber })
    setResourceKey(nextResourceKey)
  }

  /** 重建 lazy、Promise 与两个 boundary 身份，重新开始整条读取链。 */
  function rebuildWholeAttempt(): void {
    if (!attempt) return
    startAttempt(attempt.reportId, attempt.number + 1)
  }

  /** 只更新边界外外壳，验证当前异步身份保持不变。 */
  function rerenderShell(): void {
    setShellRevision((revision) => revision + 1)
  }

  /** 让报告错误 fallback 自身失败，验证错误继续交给外层边界。 */
  function breakInnerFallback(): void {
    setBreakDataFallback(true)
  }

  /** 重建外层边界并恢复同步、安全的内层错误 fallback。 */
  function restoreDataFallback(): void {
    setBreakDataFallback(false)
    setModuleBoundaryVersion((version) => version + 1)
    setPhase('data-error')
  }

  /** 清空所有实验状态与模块级 cache。 */
  function resetDemo(): void {
    resetReportModules()
    resetReportResources()
    identitySequence.current = 0
    setPhase('idle')
    setAttempt(null)
    setModuleKey(null)
    setResourceKey(null)
    setLazyReportPanel(null)
    setModuleBoundaryVersion((version) => version + 1)
    setDataBoundaryVersion((version) => version + 1)
    setShellRevision(0)
    setModuleLoadCount(0)
    setBreakDataFallback(false)
  }

  /** 在 lazy 模块外壳提交后把状态推进到数据等待。 */
  const recordPanelReady = useCallback(() => {
    setPhase((currentPhase) =>
      currentPhase === 'module-pending' || currentPhase === 'module-released'
        ? 'data-pending'
        : currentPhase,
    )
  }, [])

  /** 在报告成功内容提交后记录最终状态。 */
  const recordReportReady = useCallback(() => {
    setPhase('data-ready')
  }, [])

  /** 在内层错误边界提交后记录报告读取失败。 */
  const recordReportError = useCallback(() => {
    setPhase('data-error')
  }, [])

  /** 在外层错误边界提交后区分模块失败与 fallback 向上传播。 */
  const recordViewerError = useCallback((error: Error) => {
    setPhase((currentPhase) =>
      error.message === '报告查看器代码加载失败' || currentPhase === 'module-error'
        ? 'module-error'
        : 'outer-error',
    )
  }, [])

  const canSettleModule = phase === 'module-pending'
  const canSettleData = phase === 'data-pending'

  return (
    <section className="lazy-report-viewer-demo" data-testid="lab-lazy-report-viewer-demo">
      <header className="lazy-report-viewer-demo-heading">
        <div>
          <p>Async report workspace</p>
          <h2>异步报告查看器</h2>
        </div>
        <span>
          外壳 revision <output data-testid="report-shell-revision">{shellRevision}</output>
        </span>
      </header>

      <section className="lazy-report-viewer-picker" aria-labelledby="report-picker-title">
        <header>
          <div>
            <span>持续可用的页面外壳</span>
            <h3 id="report-picker-title">选择报告</h3>
          </div>
          <p>代码或数据等待、失败时，这里仍可操作。</p>
        </header>
        <div className="lazy-report-viewer-options">
          {reportOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={attempt?.reportId === option.id}
              onClick={selectReport.bind(null, option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.summary}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="lazy-report-viewer-controls" aria-label="异步报告状态控制">
        <button type="button" onClick={completeModuleLoad} disabled={!canSettleModule}>
          完成代码加载
        </button>
        <button
          type="button"
          className="is-danger"
          onClick={failModuleLoad}
          disabled={!canSettleModule}
        >
          代码加载失败
        </button>
        <button type="button" onClick={completeReportRead} disabled={!canSettleData}>
          兑现报告数据
        </button>
        <button
          type="button"
          className="is-danger"
          onClick={failReportRead}
          disabled={!canSettleData}
        >
          报告数据失败
        </button>
        <button type="button" className="is-secondary" onClick={rerenderShell} disabled={!attempt}>
          父级重新 render
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={rebuildWholeAttempt}
          disabled={!attempt}
        >
          重建整次尝试
        </button>
        <button type="button" className="is-quiet" onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="lazy-report-viewer-status" aria-live="polite">
        <div>
          <span>当前阶段</span>
          <strong data-testid="report-viewer-phase">{phaseLabels[phase]}</strong>
        </div>
        <div>
          <span>报告 / 尝试</span>
          <strong data-testid="report-viewer-attempt">
            {selectedReport && attempt
              ? `${attempt.reportId} · ${selectedReport.label} / ${attempt.number}`
              : '--'}
          </strong>
        </div>
        <div>
          <span>lazy loader 调用</span>
          <strong>
            <output data-testid="report-module-load-count">{moduleLoadCount}</output> 次
          </strong>
        </div>
        <div>
          <span>报告 Promise 创建</span>
          <strong>
            <output data-testid="report-resource-create-count">{getReportCreationCount()}</output>{' '}
            次
          </strong>
        </div>
        <div>
          <span>边界版本</span>
          <strong data-testid="report-boundary-versions">
            {moduleBoundaryVersion} / {dataBoundaryVersion}
          </strong>
        </div>
      </div>

      {attempt && resourceKey && LazyReportPanel ? (
        <ViewerErrorBoundary
          key={moduleBoundaryVersion}
          fallback={
            <ViewerAreaFailure
              phase={phase}
              onRetryModule={retryModuleLoad}
              onRestoreDataFallback={restoreDataFallback}
            />
          }
          onCatch={recordViewerError}
        >
          <section className="lazy-report-viewer-area">
            <header>
              <div>
                <span>当前查看区域</span>
                <h3>{selectedReport?.label}</h3>
              </div>
              <p>工具栏位于数据 Suspense 之外。</p>
            </header>

            {phase === 'data-error' ? (
              <div className="lazy-report-viewer-retry-probes" aria-label="不完整重试对照">
                <button type="button" className="is-secondary" onClick={retryWithBoundaryOnly}>
                  只换数据边界
                </button>
                <button type="button" className="is-secondary" onClick={retryWithResourceOnly}>
                  只换报告资源
                </button>
              </div>
            ) : null}

            <Suspense
              fallback={<ModuleLoadingFallback reportLabel={selectedReport?.label ?? ''} />}
            >
              <LazyReportPanel
                resourceKey={resourceKey}
                dataBoundaryVersion={dataBoundaryVersion}
                breakDataFallback={breakDataFallback}
                onPanelReady={recordPanelReady}
                onReportReady={recordReportReady}
                onReportError={recordReportError}
                onRetryReport={retryReportRead}
                onBreakDataFallback={breakInnerFallback}
              />
            </Suspense>
          </section>
        </ViewerErrorBoundary>
      ) : (
        <article className="lazy-report-viewer-empty" data-testid="report-viewer-idle">
          <strong>查看器尚未进入组件树</strong>
          <p>选择一份报告后，代码和数据会分别进入可控制的等待阶段。</p>
        </article>
      )}
    </section>
  )
}
