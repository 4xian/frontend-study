import { Component, lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'

import { getLazyPanelLoadCallCount, loadLazyCoursePanel } from './lazy-load-count'
import './lazy-component-code-splitting-demo.css'

const LazyCoursePanel = lazy(loadLazyCoursePanel)

type LazyLoadErrorBoundaryProps = Readonly<{
  children: ReactNode
  fallback: ReactNode
}>

type LazyLoadErrorBoundaryState = Readonly<{
  hasError: boolean
}>

let failureLoaderCallCount = 0

/** 记录并执行一次确定性失败的动态导入。 */
function loadFailurePanel() {
  failureLoaderCallCount += 1
  return import('./lazy-failure-panel')
}

const LazyFailurePanel = lazy(loadFailurePanel)

/**
 * 将动态导入的 rejection 隔离在 Demo 局部区域。
 *
 * 边界保留在当前 Demo 内，确保源码区完整呈现等待与失败两种相邻边界的协作方式。
 */
class LazyLoadErrorBoundary extends Component<
  LazyLoadErrorBoundaryProps,
  LazyLoadErrorBoundaryState
> {
  state: LazyLoadErrorBoundaryState = { hasError: false }

  /** 把后代错误转换为当前边界的 fallback 状态。 */
  static getDerivedStateFromError(): LazyLoadErrorBoundaryState {
    return { hasError: true }
  }

  /** 显示局部失败结果或继续渲染 lazy 后代。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

/** 读取失败 loader 的累计调用次数。 */
function getFailureLoaderCallCount(): number {
  return failureLoaderCallCount
}

type LazyLoadFailureFallbackProps = Readonly<{
  onReset: () => void
}>

/** 在 Error Boundary 提交失败 UI 时读取 rejected loader 的当前计数。 */
function LazyLoadFailureFallback({ onReset }: LazyLoadFailureFallbackProps) {
  return (
    <article className="lazy-split-demo-failure" role="alert">
      <span>Error Boundary</span>
      <strong>按需模块加载失败已被局部接管</strong>
      <p>
        失败 loader 调用{' '}
        <output data-testid="lazy-failure-loader-count">{getFailureLoaderCallCount()}</output>{' '}
        次；同一个 lazy 类型不会自动重试。
      </p>
      <button type="button" onClick={onReset}>
        重置失败演示
      </button>
    </article>
  )
}

/** 演示首次 render 才加载模块，并对照模块缓存与组件实例 State。 */
export default function LazyComponentCodeSplittingDemo() {
  const [showPanel, setShowPanel] = useState(false)
  const [shellRevision, setShellRevision] = useState(0)
  const [showFailure, setShowFailure] = useState(false)
  const [failureBoundaryVersion, setFailureBoundaryVersion] = useState(0)

  /** 卸载失败子树并重建边界，不创建新的 lazy 类型。 */
  function resetFailureDemo(): void {
    setShowFailure(false)
    setFailureBoundaryVersion((version) => version + 1)
  }

  return (
    <section className="lazy-split-demo" data-testid="lazy-component-code-splitting-demo">
      <header className="lazy-split-demo-heading">
        <p>On-demand module</p>
        <h2>组件代码只在第一次需要时加载</h2>
        <span>
          外壳版本 <output data-testid="lazy-shell-revision">{shellRevision}</output>
        </span>
      </header>

      <div className="lazy-split-demo-controls" aria-label="lazy 组件加载控制">
        <button type="button" onClick={() => setShowPanel((visible) => !visible)}>
          {showPanel ? '隐藏按需面板' : '显示按需面板'}
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={() => setShellRevision((revision) => revision + 1)}
        >
          更新外壳
        </button>
        <button
          type="button"
          className="is-secondary"
          onClick={() => setShowFailure(true)}
          disabled={showFailure}
        >
          演示加载失败
        </button>
      </div>

      <div className="lazy-split-demo-status" aria-label="模块加载状态">
        <div>
          <span>按需面板</span>
          <strong data-testid="lazy-panel-status">{showPanel ? '已进入组件树' : '尚未渲染'}</strong>
        </div>
        <div>
          <span>当前 loader 调用</span>
          <strong>
            {showPanel ? (
              '请查看按需面板'
            ) : (
              <>
                <output data-testid="lazy-loader-count">{getLazyPanelLoadCallCount()}</output> 次
              </>
            )}
          </strong>
        </div>
      </div>

      {showPanel ? (
        <Suspense
          fallback={
            <p className="lazy-split-demo-fallback" role="status" data-testid="lazy-panel-fallback">
              正在加载按需面板…
            </p>
          }
        >
          <LazyCoursePanel />
        </Suspense>
      ) : (
        <p className="lazy-split-demo-placeholder" data-testid="lazy-panel-placeholder">
          当前分支没有渲染 lazy 组件，因此还不需要它的模块。
        </p>
      )}

      <LazyLoadErrorBoundary
        key={failureBoundaryVersion}
        fallback={<LazyLoadFailureFallback onReset={resetFailureDemo} />}
      >
        {showFailure ? (
          <Suspense
            fallback={
              <p className="lazy-split-demo-fallback" role="status">
                正在加载失败示例…
              </p>
            }
          >
            <LazyFailurePanel />
          </Suspense>
        ) : null}
      </LazyLoadErrorBoundary>
    </section>
  )
}
