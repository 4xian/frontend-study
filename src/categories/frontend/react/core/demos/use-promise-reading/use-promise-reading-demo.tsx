import { Component, Suspense, createContext, use, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  getReportCreationCount,
  getReportPromise,
  prepareReportResource,
  rejectReportResource,
  resetReportResources,
  resolveReportResource,
} from './report-resource'
import './use-promise-reading-demo.css'

type ReadingStage =
  | 'idle'
  | 'pending'
  | 'resolving'
  | 'resolved'
  | 'rejecting'
  | 'rejected'
  | 'recovery-pending'
  | 'recovery-resolving'
type ReadingMode = 'success' | 'failure' | 'recovery' | null

const stageLabels: Record<ReadingStage, string> = {
  idle: '实验尚未开始',
  pending: 'cached Promise 正在等待',
  resolving: 'Promise 已兑现，React 正在提交内容',
  resolved: '异步值已提交',
  rejecting: 'Promise 已拒绝，React 正在提交错误状态',
  rejected: '读取失败已交给错误边界',
  'recovery-pending': '新资源正在等待兑现',
  'recovery-resolving': '新资源已兑现，React 正在提交内容',
}

const AccessContext = createContext('默认访客')

type ConditionalAccessLabelProps = Readonly<{
  enabled: boolean
  label: string
  testId: string
}>

/** 在功能开启时读取当前位置最近的 AccessContext，关闭时提前返回。 */
function ConditionalAccessLabel({ enabled, label, testId }: ConditionalAccessLabelProps) {
  if (!enabled) {
    return (
      <article className="context-reading-result is-disabled">
        <span>{label}</span>
        <strong data-testid={testId}>未读取</strong>
        <p>条件分支在调用 use 前结束。</p>
      </article>
    )
  }

  const access = use(AccessContext)

  return (
    <article className="context-reading-result">
      <span>{label}</span>
      <strong data-testid={testId}>{access}</strong>
      <p>use 返回当前位置可见的 Context 值。</p>
    </article>
  )
}

type ErrorBoundaryProps = Readonly<{
  children: ReactNode
  fallback: ReactNode
  onCatch: () => void
}>

type ErrorBoundaryState = Readonly<{
  hasError: boolean
}>

/** 捕获 reader 在 render 中读取到的 rejection，并显示固定失败内容。 */
class ReportErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  /** 把后代读取错误转换为当前边界的 fallback State。 */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  /** 在错误 fallback 提交后回报边界已经接管读取失败。 */
  componentDidCatch(): void {
    this.props.onCatch()
  }

  /** 根据捕获状态显示失败内容或继续渲染后代。 */
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

type ReportReaderProps = Readonly<{
  resourceKey: string
  onCommit: () => void
}>

/** 在 render 中用 use 读取同一资源 key 对应的 cached Promise。 */
function ReportReader({ resourceKey, onCommit }: ReportReaderProps) {
  const report = use(getReportPromise(resourceKey))

  /** 在成功内容提交后向边界外回报可见结果。 */
  useEffect(() => {
    onCommit()
  }, [onCommit])

  return (
    <article className="promise-reading-result" data-testid="promise-reading-result">
      <span>fulfilled：use 返回异步值</span>
      <strong>{report.title}</strong>
      <p>{report.summary}</p>
    </article>
  )
}

/** 显示 Promise pending 时由最近 Suspense 接管的等待区域。 */
function ReadingFallback() {
  return (
    <article
      className="promise-reading-fallback is-pending"
      role="status"
      data-testid="promise-reading-pending"
    >
      <span>pending：最近的 Suspense 已接管</span>
      <strong>正在等待本地报告...</strong>
      <p>父级重新 render 仍会读取当前资源 key 下的同一个 Promise。</p>
    </article>
  )
}

/** 显示 reader 读取到 rejection 后的固定错误状态。 */
function ReadingErrorFallback() {
  return (
    <article
      className="promise-reading-fallback is-error"
      role="alert"
      data-testid="promise-reading-error"
    >
      <span>rejected：最近的 Error Boundary 已接管</span>
      <strong>本地报告读取失败</strong>
      <p>旧 Promise 已经 rejected；恢复需要新资源，并重建当前错误边界。</p>
    </article>
  )
}

/** 演示 use 读取 Context 与 cached Promise 时的公开行为。 */
export default function UseResourceReadingDemo() {
  const [contextReadingEnabled, setContextReadingEnabled] = useState(true)
  const [usesAlternateOuterAccess, setUsesAlternateOuterAccess] = useState(false)
  const [stage, setStage] = useState<ReadingStage>('idle')
  const [mode, setMode] = useState<ReadingMode>(null)
  const [resourceKey, setResourceKey] = useState<string | null>(null)
  const [generation, setGeneration] = useState(0)
  const [boundaryVersion, setBoundaryVersion] = useState(1)
  const [parentRevision, setParentRevision] = useState(0)
  const outerAccess = usesAlternateOuterAccess ? '课程维护者' : '课程编辑者'

  /** 在 Demo 挂载与卸载边界清理模块级实验资源。 */
  useEffect(() => {
    resetReportResources()
    return resetReportResources
  }, [])

  /** 在成功内容实际提交后同步可观察阶段。 */
  const recordReportCommit = useCallback(() => {
    setStage('resolved')
  }, [])

  /** 在错误 fallback 实际提交后同步可观察阶段。 */
  const recordReportCatch = useCallback(() => {
    setStage('rejected')
  }, [])

  /** 切换条件分支是否执行 use(context)。 */
  function toggleContextReading(): void {
    setContextReadingEnabled((enabled) => !enabled)
  }

  /** 切换外层 provider value，观察其后代读取结果。 */
  function switchOuterAccess(): void {
    setUsesAlternateOuterAccess((usesAlternate) => !usesAlternate)
  }

  /** 为所选成功或失败路径准备第一代资源。 */
  function startReading(nextMode: Exclude<ReadingMode, 'recovery' | null>): void {
    const nextGeneration = 1
    const nextResourceKey = `report-${nextGeneration}`
    prepareReportResource(nextResourceKey)
    setGeneration(nextGeneration)
    setResourceKey(nextResourceKey)
    setMode(nextMode)
    setStage('pending')
  }

  /** 只更新边界外的父级 revision，不改变资源身份。 */
  function rerenderParent(): void {
    setParentRevision((revision) => revision + 1)
  }

  /** 兑现成功路径的当前 cached Promise。 */
  function resolveCurrentReport(): void {
    if (!resourceKey) return
    resolveReportResource(resourceKey)
    setStage(stage === 'recovery-pending' ? 'recovery-resolving' : 'resolving')
  }

  /** 拒绝失败路径的当前 cached Promise。 */
  function rejectCurrentReport(): void {
    if (!resourceKey) return
    rejectReportResource(resourceKey)
    setStage('rejecting')
  }

  /** 创建新资源并重建错误边界，进入恢复 pending。 */
  function recoverWithFreshResource(): void {
    const nextGeneration = generation + 1
    const nextResourceKey = `report-${nextGeneration}`
    prepareReportResource(nextResourceKey)
    setGeneration(nextGeneration)
    setResourceKey(nextResourceKey)
    setBoundaryVersion((version) => version + 1)
    setMode('recovery')
    setStage('recovery-pending')
  }

  /** 清空本课 cache 与界面状态，使另一条路径重新从 idle 开始。 */
  function rebuildExperiment(): void {
    resetReportResources()
    setStage('idle')
    setMode(null)
    setResourceKey(null)
    setGeneration(0)
    setBoundaryVersion((version) => version + 1)
    setParentRevision(0)
  }

  return (
    <section className="promise-reading-demo" data-testid="use-resource-reading-demo">
      <header className="promise-reading-heading">
        <p>Resource reading</p>
        <h2>Context 与 Promise 两类资源读取</h2>
        <span>Context 立即返回可见值；Promise 按当前状态返回、挂起或抛出失败。</span>
      </header>

      <section className="resource-reading-section" aria-labelledby="context-reading-title">
        <header className="resource-reading-section-heading">
          <h3 id="context-reading-title">Context：默认值与最近 provider</h3>
          <p>三个读取组件执行同一逻辑，所在树位置决定最终结果。</p>
        </header>

        <div className="context-reading-controls" aria-label="Context 读取控制">
          <button type="button" onClick={toggleContextReading}>
            {contextReadingEnabled ? '关闭条件读取' : '开启条件读取'}
          </button>
          <button type="button" className="is-secondary" onClick={switchOuterAccess}>
            切换外层 provider 值
          </button>
        </div>

        <div className="context-reading-status" aria-live="polite">
          <span>条件读取</span>
          <strong data-testid="context-reading-enabled">
            {contextReadingEnabled ? '已开启' : '已关闭'}
          </strong>
          <span>外层 provider 当前值</span>
          <strong data-testid="context-outer-provider-value">{outerAccess}</strong>
        </div>

        <div className="context-reading-results">
          <ConditionalAccessLabel
            enabled={contextReadingEnabled}
            label="没有 provider"
            testId="context-default-value"
          />
          <AccessContext value={outerAccess}>
            <ConditionalAccessLabel
              enabled={contextReadingEnabled}
              label="外层 provider 后代"
              testId="context-outer-value"
            />
            <AccessContext value="只读审阅者">
              <ConditionalAccessLabel
                enabled={contextReadingEnabled}
                label="内层 provider 后代"
                testId="context-inner-value"
              />
            </AccessContext>
          </AccessContext>
        </div>
      </section>

      <section className="resource-reading-section" aria-labelledby="promise-reading-title">
        <header className="resource-reading-section-heading">
          <h3 id="promise-reading-title">Promise：等待、成功、失败与恢复</h3>
          <p>控制区位于边界外，可验证父级重渲染不会新建当前资源。</p>
        </header>

        <div className="promise-reading-controls" aria-label="Promise 读取控制">
          <button type="button" onClick={() => startReading('success')} disabled={stage !== 'idle'}>
            开始成功读取
          </button>
          <button
            type="button"
            className="is-secondary"
            onClick={() => startReading('failure')}
            disabled={stage !== 'idle'}
          >
            开始失败读取
          </button>
          <button
            type="button"
            className="is-secondary"
            onClick={rerenderParent}
            disabled={!['pending', 'resolved', 'recovery-pending'].includes(stage)}
          >
            父级重新 render
          </button>
          <button
            type="button"
            onClick={resolveCurrentReport}
            disabled={stage !== 'pending' || mode !== 'success'}
          >
            兑现成功
          </button>
          <button
            type="button"
            className="is-danger"
            onClick={rejectCurrentReport}
            disabled={stage !== 'pending' || mode !== 'failure'}
          >
            拒绝读取
          </button>
          <button
            type="button"
            className="is-secondary"
            onClick={recoverWithFreshResource}
            disabled={stage !== 'rejected'}
          >
            恢复为成功
          </button>
          <button
            type="button"
            onClick={resolveCurrentReport}
            disabled={stage !== 'recovery-pending'}
          >
            兑现恢复
          </button>
          <button type="button" className="is-quiet" onClick={rebuildExperiment}>
            重建实验
          </button>
        </div>

        <div className="promise-reading-status" aria-live="polite">
          <div>
            <span>当前阶段</span>
            <strong data-testid="promise-reading-stage">{stageLabels[stage]}</strong>
          </div>
          <div>
            <span>资源代次 / 创建次数</span>
            <strong>
              <output data-testid="promise-reading-generation">{generation}</output> /{' '}
              <output data-testid="promise-reading-creation-count">
                {getReportCreationCount()}
              </output>
            </strong>
          </div>
          <div>
            <span>父级 render revision</span>
            <strong data-testid="promise-reading-parent-revision">{parentRevision}</strong>
          </div>
          <div>
            <span>Error Boundary 版本</span>
            <strong data-testid="promise-reading-boundary-version">{boundaryVersion}</strong>
          </div>
        </div>

        {resourceKey ? (
          <ReportErrorBoundary
            key={boundaryVersion}
            fallback={<ReadingErrorFallback />}
            onCatch={recordReportCatch}
          >
            <Suspense fallback={<ReadingFallback />}>
              <ReportReader resourceKey={resourceKey} onCommit={recordReportCommit} />
            </Suspense>
          </ReportErrorBoundary>
        ) : (
          <article className="promise-reading-placeholder" data-testid="promise-reading-idle">
            <strong>Reader 尚未挂载</strong>
            <p>选择一条路径后，事件会先准备资源，render 再把 cached Promise 交给 use。</p>
          </article>
        )}
      </section>
    </section>
  )
}
