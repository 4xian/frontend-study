/** @jsxImportSource react */

import { Component, Suspense, use, useEffect } from 'react'
import type { ReactNode } from 'react'

import { getReportPromise } from './report-resource'

type DataErrorBoundaryProps = Readonly<{
  children: ReactNode
  fallback: ReactNode
  onCatch: () => void
}>

type DataErrorBoundaryState = Readonly<{
  hasError: boolean
}>

/** 把报告 Promise 的 rejection 隔离在查看器内部。 */
class DataErrorBoundary extends Component<DataErrorBoundaryProps, DataErrorBoundaryState> {
  state: DataErrorBoundaryState = { hasError: false }

  /** 把后代读取失败转换为当前边界的 fallback State。 */
  static getDerivedStateFromError(): DataErrorBoundaryState {
    return { hasError: true }
  }

  /** 在失败 UI 提交后向仍存活的父级报告结果。 */
  componentDidCatch(): void {
    this.props.onCatch()
  }

  /** 根据捕获状态显示报告失败提示或继续渲染后代。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

type ReportBodyProps = Readonly<{
  resourceKey: string
  onReady: () => void
}>

/** 在 render 中读取 cached Promise，并渲染完整报告。 */
function ReportBody({ resourceKey, onReady }: ReportBodyProps) {
  const report = use(getReportPromise(resourceKey))

  /** 在成功内容提交后把可见阶段同步给父级状态面板。 */
  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <article className="lazy-report-viewer-body" data-testid="lazy-report-viewer-report">
      <header>
        <div>
          <span>报告已读取</span>
          <h3>{report.title}</h3>
        </div>
        <small>{report.updatedAt}</small>
      </header>
      <p>{report.summary}</p>
      <dl>
        {report.metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

/** 显示报告 Promise pending 时的内层 Suspense fallback。 */
function ReportDataFallback() {
  return (
    <article
      className="lazy-report-viewer-fallback is-data"
      role="status"
      data-testid="report-data-pending"
    >
      <span>数据边界</span>
      <strong>正在读取报告数据</strong>
      <p>查看器外壳保持可见，报告主体等待 cached Promise。</p>
    </article>
  )
}

type ReportDataErrorFallbackProps = Readonly<{
  onRetry: () => void
  onBreakFallback: () => void
}>

/** 显示报告读取失败，并把重试交给边界外父级。 */
function ReportDataErrorFallback({ onRetry, onBreakFallback }: ReportDataErrorFallbackProps) {
  return (
    <article
      className="lazy-report-viewer-fallback is-error"
      role="alert"
      data-testid="report-data-error"
    >
      <span>数据 Error Boundary</span>
      <strong>报告读取失败</strong>
      <p>旧 Promise 已经 rejected；完整重试会创建新资源并重建本边界。</p>
      <div>
        <button type="button" onClick={onRetry}>
          完整重试报告
        </button>
        <button type="button" className="is-secondary" onClick={onBreakFallback}>
          让失败提示也失败
        </button>
      </div>
    </article>
  )
}

/** 模拟内层 fallback 自身渲染失败，让错误继续到外层边界。 */
function BrokenDataErrorFallback(): never {
  throw new Error('报告读取失败提示渲染失败')
}

export type LazyReportPanelProps = Readonly<{
  resourceKey: string
  dataBoundaryVersion: number
  breakDataFallback: boolean
  onPanelReady: () => void
  onReportReady: () => void
  onReportError: () => void
  onRetryReport: () => void
  onBreakDataFallback: () => void
}>

/** 提供已加载的查看器外壳，并在内部细分报告数据边界。 */
export default function LazyReportPanel({
  resourceKey,
  dataBoundaryVersion,
  breakDataFallback,
  onPanelReady,
  onReportReady,
  onReportError,
  onRetryReport,
  onBreakDataFallback,
}: LazyReportPanelProps) {
  /** 在动态模块和查看器外壳提交后通知父级。 */
  useEffect(() => {
    onPanelReady()
  }, [onPanelReady])

  const dataFallback = breakDataFallback ? (
    <BrokenDataErrorFallback />
  ) : (
    <ReportDataErrorFallback onRetry={onRetryReport} onBreakFallback={onBreakDataFallback} />
  )

  return (
    <section className="lazy-report-viewer-panel" data-testid="lazy-report-viewer-panel">
      <header className="lazy-report-viewer-panel-heading">
        <div>
          <span>按需模块已就绪</span>
          <h2>报告详情查看器</h2>
        </div>
        <p>数据边界版本 {dataBoundaryVersion}</p>
      </header>

      <DataErrorBoundary key={dataBoundaryVersion} fallback={dataFallback} onCatch={onReportError}>
        <Suspense fallback={<ReportDataFallback />}>
          <ReportBody resourceKey={resourceKey} onReady={onReportReady} />
        </Suspense>
      </DataErrorBoundary>
    </section>
  )
}
