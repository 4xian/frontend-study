import { Component, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import './error-boundary-render-failures-demo.css'

type ErrorBoundaryProps = Readonly<{
  children: ReactNode
  fallback: ReactNode
  onCatch?: (error: Error, errorInfo: ErrorInfo) => void
}>

type ErrorBoundaryState = Readonly<{
  hasError: boolean
}>

/** 隔离后代渲染失败，并用调用方提供的局部回退内容替换崩溃子树。 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  /** 把后代错误纯粹转换为当前边界的回退状态。 */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  /** 在提交回退界面后，把错误与组件栈交给可选的本地观察器。 */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onCatch?.(error, errorInfo)
  }

  /** 根据捕获状态显示回退内容或继续渲染后代。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

type ReportPanelProps = Readonly<{
  shouldCrash: boolean
}>

/** 渲染带局部 State 的报告面板，并在指定 render 中同步抛错。 */
function ReportPanel({ shouldCrash }: ReportPanelProps) {
  const [draftRevision, setDraftRevision] = useState(0)

  if (shouldCrash) {
    throw new Error('报告面板渲染失败')
  }

  return (
    <article className="error-boundary-demo-report" data-testid="error-boundary-report">
      <span>受保护的后代</span>
      <strong>季度报告草稿</strong>
      <p>
        局部草稿版本 <output data-testid="error-boundary-draft-revision">{draftRevision}</output>
      </p>
      <button type="button" onClick={() => setDraftRevision((revision) => revision + 1)}>
        修改局部草稿
      </button>
    </article>
  )
}

type LocalFallbackProps = Readonly<{
  onRecover: () => void
}>

/** 显示目标边界的局部失败状态与显式恢复入口。 */
function LocalFallback({ onRecover }: LocalFallbackProps) {
  return (
    <article
      className="error-boundary-demo-fallback is-local"
      role="alert"
      data-testid="error-boundary-local-fallback"
    >
      <span>局部边界已接管</span>
      <strong>报告面板暂时不可用</strong>
      <p>控制区与相邻状态仍然可用。恢复会重建这一个边界及其后代。</p>
      <button type="button" onClick={onRecover}>
        重新加载局部面板
      </button>
    </article>
  )
}

/** 让目标边界的回退路径失败，以验证错误继续交给更高层边界。 */
function BrokenLocalFallback(): never {
  throw new Error('局部回退渲染失败')
}

type GuardFallbackProps = Readonly<{
  catchCount: number
  onReset: () => void
}>

/** 显示更高层边界接管结果，并提供整个实验的重建入口。 */
function GuardFallback({ catchCount, onReset }: GuardFallbackProps) {
  return (
    <section
      className="error-boundary-demo error-boundary-demo-guard"
      role="alert"
      data-testid="error-boundary-guard-fallback"
    >
      <header>
        <p>Outer boundary</p>
        <h2>更高层边界接管了局部回退错误</h2>
        <span>
          外层捕获记录 <output data-testid="error-boundary-guard-catch-count">{catchCount}</output>{' '}
          次
        </span>
      </header>
      <p>目标边界不能捕获自己的回退失败；这次恢复会重建整个实验子树。</p>
      <button type="button" onClick={onReset}>
        重建整个实验
      </button>
    </section>
  )
}

/** 管理目标边界之外的失败条件、恢复版本与捕获记录。 */
function ErrorBoundaryScene() {
  const [shouldCrash, setShouldCrash] = useState(false)
  const [breakFallback, setBreakFallback] = useState(false)
  const [boundaryVersion, setBoundaryVersion] = useState(1)
  const [catchCount, setCatchCount] = useState(0)
  const [latestCatch, setLatestCatch] = useState('尚未捕获错误。')

  /** 让受保护后代在下一次 render 中同步抛错。 */
  function triggerRenderFailure(): void {
    setBreakFallback(false)
    setShouldCrash(true)
  }

  /** 解除失败条件并通过新 key 重建目标边界与后代。 */
  function recoverLocalPanel(): void {
    setShouldCrash(false)
    setBreakFallback(false)
    setBoundaryVersion((version) => version + 1)
  }

  /** 同时触发后代错误和回退错误，验证目标边界不能接管自己。 */
  function triggerFallbackFailure(): void {
    setBreakFallback(true)
    setShouldCrash(true)
  }

  /** 保存目标边界提交后的本地捕获证据，不调用网络或 console。 */
  function recordLocalCatch(error: Error, errorInfo: ErrorInfo): void {
    setCatchCount((count) => count + 1)
    setLatestCatch(
      `${error.name} 已被目标边界捕获${errorInfo.componentStack ? '，组件栈已提供。' : '。'}`,
    )
  }

  return (
    <section className="error-boundary-demo" data-testid="error-boundary-render-failures-demo">
      <header className="error-boundary-demo-heading">
        <p>Render failure isolation</p>
        <h2>只替换崩溃子树，保留可恢复的控制区</h2>
        <span>
          目标边界版本 <output data-testid="error-boundary-version">{boundaryVersion}</output>
        </span>
      </header>

      <div className="error-boundary-demo-controls" aria-label="渲染失败隔离控制">
        <button type="button" onClick={triggerRenderFailure} disabled={shouldCrash}>
          触发渲染失败
        </button>
        <button type="button" className="is-secondary" onClick={triggerFallbackFailure}>
          验证向上层传播
        </button>
      </div>

      <div className="error-boundary-demo-status" aria-label="边界外状态">
        <div>
          <span>相邻功能</span>
          <strong data-testid="error-boundary-neighbor-status">保持可用</strong>
        </div>
        <div>
          <span>目标边界捕获</span>
          <strong data-testid="error-boundary-catch-count">{catchCount} 次</strong>
        </div>
      </div>

      <p className="error-boundary-demo-latest" role="status" data-testid="error-boundary-latest">
        {latestCatch}
      </p>

      <ErrorBoundary
        key={boundaryVersion}
        fallback={
          breakFallback ? <BrokenLocalFallback /> : <LocalFallback onRecover={recoverLocalPanel} />
        }
        onCatch={recordLocalCatch}
      >
        <ReportPanel shouldCrash={shouldCrash} />
      </ErrorBoundary>
    </section>
  )
}

/** 用更高层边界包围实验，证明内层边界自身失败会继续向上交付。 */
export default function ErrorBoundaryRenderFailuresDemo() {
  const [guardVersion, setGuardVersion] = useState(1)
  const [guardCatchCount, setGuardCatchCount] = useState(0)

  /** 记录更高层边界捕获到的内层回退失败。 */
  function recordGuardCatch(): void {
    setGuardCatchCount((count) => count + 1)
  }

  /** 通过新 key 重建更高层边界及整个实验子树。 */
  function resetWholeDemo(): void {
    setGuardCatchCount(0)
    setGuardVersion((version) => version + 1)
  }

  return (
    <ErrorBoundary
      key={guardVersion}
      fallback={<GuardFallback catchCount={guardCatchCount} onReset={resetWholeDemo} />}
      onCatch={recordGuardCatch}
    >
      <ErrorBoundaryScene />
    </ErrorBoundary>
  )
}
