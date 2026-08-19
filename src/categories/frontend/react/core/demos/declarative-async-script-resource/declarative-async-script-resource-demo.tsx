import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import fixtureHtml from './async-script-fixture.html?raw'
import './declarative-async-script-resource-demo.css'

type FixtureStage =
  | 'loading'
  | 'ready'
  | 'single'
  | 'duplicate'
  | 'updated'
  | 'one-owner'
  | 'no-owner'
  | 'remounted'
  | 'v2'
  | 'opt-out'
  | 'unmounted'

type FixtureMode = Exclude<FixtureStage, 'loading' | 'ready' | 'unmounted'> | 'shell'

type ExecutionState = Readonly<{
  v1: number
  v2: number
  eventOptOut: number
  events: readonly string[]
}>

type FixtureWindow = Window & {
  __ASYNC_SCRIPT_RESOURCE_EXECUTIONS__?: ExecutionState
}

type ScriptSnapshot = Readonly<{
  headResourceCount: number
  bodyOptOutCount: number
  v1DomCount: number
  v2DomCount: number
  firstOwner: string
  rootText: string
  staticMarkerPresent: boolean
  executions: ExecutionState
  headResources: readonly string[]
}>

type FixtureHandle = {
  document: Document
  window: FixtureWindow
  root: Root | null
  observer: MutationObserver
  executionListener: EventListener
}

const v1ScriptSrc = '/react-course-fixtures/async-script-resource-v1.js'
const v2ScriptSrc = '/react-course-fixtures/async-script-resource-v2.js'
const eventOptOutScriptSrc = '/react-course-fixtures/async-script-event-opt-out.js'
const scriptExecutionEvent = 'react-course:async-script-resource-executed'

const emptyExecutions: ExecutionState = {
  v1: 0,
  v2: 0,
  eventOptOut: 0,
  events: [],
}

const emptySnapshot: ScriptSnapshot = {
  headResourceCount: 0,
  bodyOptOutCount: 0,
  v1DomCount: 0,
  v2DomCount: 0,
  firstOwner: '无',
  rootText: '等待独立文档载入',
  staticMarkerPresent: true,
  executions: emptyExecutions,
  headResources: [],
}

const stageLabels: Record<FixtureStage, string> = {
  loading: '正在载入独立文档',
  ready: '隔离 Root 已就绪',
  single: 'v1 首次声明',
  duplicate: 'v1 两个 owner',
  updated: '同 src 改写属性',
  'one-owner': '只保留一个 owner',
  'no-owner': '全部 owner 已移除',
  remounted: '同 document 重挂 v1',
  v2: '切换到新 src v2',
  'opt-out': '事件回调退出资源路径',
  unmounted: '隔离 Root 已卸载',
}

/** 保留普通 script 的事件 prop，使它明确退出特殊资源路径。 */
function ignoreOrdinaryScriptLoad(): undefined {
  return undefined
}

/** 在独立 Root 中显示尚未声明脚本的初始内容。 */
function FixtureShell() {
  return (
    <article data-script-resource-root-content>
      组件内容已提交，当前没有脚本 Resource owner。
    </article>
  )
}

/** 根据实验阶段声明脚本 owner，并保留可观察的业务内容。 */
function FixtureScriptView({ mode }: { mode: Exclude<FixtureMode, 'shell'> }) {
  const showSingleV1 = mode === 'single' || mode === 'one-owner'
  const showDuplicateV1 = mode === 'duplicate'
  const showUpdatedV1 = mode === 'updated'
  const showRemountedV1 = mode === 'remounted'
  const showV2 = mode === 'v2' || mode === 'opt-out'

  return (
    <>
      {showSingleV1 ? (
        <script key={`v1-${mode}`} async={true} src={v1ScriptSrc} data-owner="first" />
      ) : null}
      {showDuplicateV1 ? (
        <>
          <script key="v1-first" async={true} src={v1ScriptSrc} data-owner="first" />
          <script key="v1-second" async={true} src={v1ScriptSrc} data-owner="second" />
        </>
      ) : null}
      {showUpdatedV1 ? (
        <>
          <script
            key="v1-updated-first"
            async={true}
            src={v1ScriptSrc}
            data-owner="updated-first"
          />
          <script
            key="v1-updated-second"
            async={true}
            src={v1ScriptSrc}
            data-owner="updated-second"
          />
        </>
      ) : null}
      {showRemountedV1 ? (
        <script key="v1-remounted" async={true} src={v1ScriptSrc} data-owner="remounted" />
      ) : null}
      {showV2 ? (
        <script key="v2-first" async={true} src={v2ScriptSrc} data-owner="v2-first" />
      ) : null}
      {mode === 'opt-out' ? (
        <script
          async={true}
          src={eventOptOutScriptSrc}
          data-owner="event-opt-out"
          onLoad={ignoreOrdinaryScriptLoad}
        />
      ) : null}
      <article data-script-resource-root-content>
        业务内容已提交；脚本是否执行由 iframe window 中的独立计数判断。
      </article>
    </>
  )
}

/** 读取脚本 DOM、首次属性、Root 内容和 iframe 自身的执行计数。 */
function readScriptSnapshot(handle: FixtureHandle): ScriptSnapshot {
  const headResources = Array.from(
    handle.document.head.querySelectorAll<HTMLScriptElement>('script[async][src]'),
  )
  const executions = handle.window.__ASYNC_SCRIPT_RESOURCE_EXECUTIONS__ ?? emptyExecutions

  return {
    headResourceCount: headResources.length,
    bodyOptOutCount: handle.document.body.querySelectorAll(
      `script[async][src="${eventOptOutScriptSrc}"]`,
    ).length,
    v1DomCount: handle.document.head.querySelectorAll(`script[async][src="${v1ScriptSrc}"]`).length,
    v2DomCount: handle.document.head.querySelectorAll(`script[async][src="${v2ScriptSrc}"]`).length,
    firstOwner:
      handle.document.head
        .querySelector<HTMLScriptElement>(`script[async][src="${v1ScriptSrc}"]`)
        ?.getAttribute('data-owner') ?? '无',
    rootText: handle.document.getElementById('root')?.textContent?.trim() || 'Root 内容为空',
    staticMarkerPresent: Boolean(
      handle.document.head.querySelector('[data-script-resource-static-marker]'),
    ),
    executions: {
      v1: executions.v1,
      v2: executions.v2,
      eventOptOut: executions.eventOptOut,
      events: [...executions.events],
    },
    headResources: headResources.map((script) => {
      const source = script.getAttribute('src') ?? '未知 src'
      return `${source} · owner=${script.getAttribute('data-owner') ?? '未标记'}`
    }),
  }
}

/** 建立 iframe 内的 React Root、DOM 观察器和脚本执行事件监听器。 */
function createScriptFixture(
  frameDocument: Document,
  frameWindow: FixtureWindow,
  onSnapshot: (handle: FixtureHandle) => void,
): FixtureHandle | null {
  const container = frameDocument.getElementById('root')
  if (!container) return null

  const handle = {
    document: frameDocument,
    window: frameWindow,
    root: createRoot(container),
    observer: null as unknown as MutationObserver,
    executionListener: null as unknown as EventListener,
  }
  const observer = new MutationObserver(() => onSnapshot(handle))
  const executionListener: EventListener = () => onSnapshot(handle)

  observer.observe(frameDocument.head, { childList: true, subtree: true })
  observer.observe(frameDocument.body, { childList: true, subtree: true })
  frameWindow.addEventListener(scriptExecutionEvent, executionListener)
  handle.observer = observer
  handle.executionListener = executionListener
  return handle
}

/** 断开 fixture 观察器，并卸载仍然存活的专属 Root。 */
function releaseScriptFixture(handle: FixtureHandle, deferRootUnmount = false): void {
  handle.observer.disconnect()
  handle.window.removeEventListener(scriptExecutionEvent, handle.executionListener)
  const root = handle.root
  handle.root = null
  if (!root) return
  if (deferRootUnmount) {
    queueMicrotask(() => root.unmount())
    return
  }
  root.unmount()
}

/** 返回当前阶段由 React 声明的 Resource owner 数。 */
function getResourceOwnerCount(stage: FixtureStage): number {
  if (stage === 'duplicate' || stage === 'updated') return 2
  if (
    stage === 'single' ||
    stage === 'one-owner' ||
    stage === 'remounted' ||
    stage === 'v2' ||
    stage === 'opt-out'
  ) {
    return 1
  }
  return 0
}

/** 展示 async script 的 head 放置、src 去重、执行与卸载合同。 */
export default function DeclarativeAsyncScriptResourceDemo() {
  const fixtureRef = useRef<FixtureHandle | null>(null)
  const mountedRef = useRef(true)
  const [frameGeneration, setFrameGeneration] = useState(1)
  const [stage, setStage] = useState<FixtureStage>('loading')
  const [snapshot, setSnapshot] = useState<ScriptSnapshot>(emptySnapshot)

  /** 保存当前 iframe 的最新脚本快照。 */
  const refreshSnapshot = useCallback((handle: FixtureHandle): void => {
    if (mountedRef.current && fixtureRef.current === handle) {
      setSnapshot(readScriptSnapshot(handle))
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      const handle = fixtureRef.current
      fixtureRef.current = null
      if (handle) releaseScriptFixture(handle, true)
    }
  }, [])

  /** 在 iframe load 后建立干净的脚本资源实验 Root。 */
  function handleFrameLoad(event: SyntheticEvent<HTMLIFrameElement>): void {
    const frameDocument = event.currentTarget.contentDocument
    const frameWindow = event.currentTarget.contentWindow as FixtureWindow | null
    if (!frameDocument || !frameWindow) return

    const previousHandle = fixtureRef.current
    if (previousHandle) releaseScriptFixture(previousHandle)
    const handle = createScriptFixture(frameDocument, frameWindow, refreshSnapshot)
    if (!handle) return

    fixtureRef.current = handle
    handle.root?.render(<FixtureShell />)
    setStage('ready')
    queueMicrotask(() => refreshSnapshot(handle))
  }

  /** 渲染指定脚本声明阶段，并在提交后重新读取隔离文档。 */
  function renderFixtureStage(nextStage: Exclude<FixtureStage, 'loading' | 'ready' | 'unmounted'>) {
    const handle = fixtureRef.current
    if (!handle?.root) return
    handle.root.render(<FixtureScriptView mode={nextStage} />)
    setStage(nextStage)
    queueMicrotask(() => refreshSnapshot(handle))
  }

  /** 首次声明一个 v1 Script Resource。 */
  function declareFirstV1(): void {
    renderFixtureStage('single')
  }

  /** 增加第二个同 src owner，观察文档级去重。 */
  function addDuplicateV1Owner(): void {
    renderFixtureStage('duplicate')
  }

  /** 用同一 src 重新声明不同 data 属性。 */
  function attemptSameSrcUpdate(): void {
    renderFixtureStage('updated')
  }

  /** 删除一个重复 owner，只保留一个 v1 声明。 */
  function removeDuplicateOwner(): void {
    renderFixtureStage('one-owner')
  }

  /** 删除当前 Root 中的全部脚本 Resource owner。 */
  function removeAllOwners(): void {
    renderFixtureStage('no-owner')
  }

  /** 在同一 document 中重新挂载相同 v1 src。 */
  function remountV1(): void {
    renderFixtureStage('remounted')
  }

  /** 改用 v2 src，建立第二个脚本 Resource。 */
  function switchToV2(): void {
    renderFixtureStage('v2')
  }

  /** 加入带 onLoad 的普通 script，观察它没有进入 head Resource 集合。 */
  function showEventOptOut(): void {
    renderFixtureStage('opt-out')
  }

  /** 卸载隔离 Root，并保留当前 document 供终态观察。 */
  function unmountFixtureRoot(): void {
    const handle = fixtureRef.current
    if (!handle?.root) return
    const root = handle.root
    handle.root = null
    root.unmount()
    setStage('unmounted')
    refreshSnapshot(handle)
  }

  /** 销毁旧 iframe 实验引用，并载入全新的同源文档。 */
  function resetFixture(): void {
    const handle = fixtureRef.current
    fixtureRef.current = null
    if (handle) releaseScriptFixture(handle)
    setStage('loading')
    setSnapshot(emptySnapshot)
    setFrameGeneration((current) => current + 1)
  }

  const resourceOwnerCount = getResourceOwnerCount(stage)
  const ordinaryOwnerCount = stage === 'opt-out' ? 1 : 0
  const v1Ready = snapshot.executions.v1 === 1
  const v2Ready = snapshot.executions.v2 === 1

  return (
    <section className="async-script-demo" data-testid="declarative-async-script-resource-demo">
      <header className="async-script-demo-heading">
        <p>Isolated iframe document</p>
        <h2>异步脚本资源观察器</h2>
        <span>脚本只进入同源 iframe，不修改学习站自身的 head 或 window。</span>
      </header>

      <div className="async-script-demo-body">
        <section className="async-script-controls" aria-label="异步脚本资源控制">
          <div className="async-script-section-heading">
            <div>
              <span>当前阶段</span>
              <strong data-testid="async-script-stage">{stageLabels[stage]}</strong>
            </div>
            <button type="button" className="is-quiet" onClick={resetFixture}>
              重建 Document
            </button>
          </div>

          <div className="async-script-actions">
            <button type="button" onClick={declareFirstV1} disabled={stage !== 'ready'}>
              声明 v1
            </button>
            <button
              type="button"
              onClick={addDuplicateV1Owner}
              disabled={stage !== 'single' || !v1Ready}
            >
              增加同 src owner
            </button>
            <button type="button" onClick={attemptSameSrcUpdate} disabled={stage !== 'duplicate'}>
              同 src 改属性
            </button>
            <button type="button" onClick={removeDuplicateOwner} disabled={stage !== 'updated'}>
              删除一个 owner
            </button>
            <button type="button" onClick={removeAllOwners} disabled={stage !== 'one-owner'}>
              删除全部 owner
            </button>
            <button type="button" onClick={remountV1} disabled={stage !== 'no-owner'}>
              重挂同一 v1
            </button>
            <button type="button" onClick={switchToV2} disabled={stage !== 'remounted'}>
              切换到 v2 src
            </button>
            <button type="button" onClick={showEventOptOut} disabled={stage !== 'v2' || !v2Ready}>
              加入 onLoad 普通脚本
            </button>
            <button
              type="button"
              className="is-danger"
              onClick={unmountFixtureRoot}
              disabled={stage !== 'opt-out'}
            >
              卸载 Root
            </button>
          </div>
        </section>

        <section className="async-script-observations" aria-label="异步脚本观察结果">
          <div className="async-script-section-heading">
            <div>
              <span>Owner / DOM / execution</span>
              <h3>三类数量分别观察</h3>
            </div>
            <strong className={snapshot.staticMarkerPresent ? 'is-pass' : 'is-fail'}>
              静态标记：{snapshot.staticMarkerPresent ? '保留' : '缺失'}
            </strong>
          </div>

          <dl className="async-script-counts">
            <div>
              <dt>Resource owner 声明</dt>
              <dd data-testid="async-script-owner-count">{resourceOwnerCount}</dd>
            </div>
            <div>
              <dt>head Resource DOM</dt>
              <dd data-testid="async-script-head-count">{snapshot.headResourceCount}</dd>
            </div>
            <div>
              <dt>v1 / v2 执行</dt>
              <dd data-testid="async-script-execution-counts">
                {snapshot.executions.v1} / {snapshot.executions.v2}
              </dd>
            </div>
            <div>
              <dt>普通 script owner / body DOM</dt>
              <dd data-testid="async-script-opt-out-counts">
                {ordinaryOwnerCount} / {snapshot.bodyOptOutCount}
              </dd>
            </div>
          </dl>

          <dl className="async-script-facts">
            <div>
              <dt>v1 DOM / v2 DOM</dt>
              <dd data-testid="async-script-version-dom-counts">
                {snapshot.v1DomCount} / {snapshot.v2DomCount}
              </dd>
            </div>
            <div>
              <dt>v1 实际 data-owner</dt>
              <dd data-testid="async-script-first-owner">{snapshot.firstOwner}</dd>
            </div>
            <div>
              <dt>Root 当前文本</dt>
              <dd data-testid="async-script-root-text">{snapshot.rootText}</dd>
            </div>
            <div>
              <dt>事件 opt-out 执行诊断</dt>
              <dd>{snapshot.executions.eventOptOut}</dd>
            </div>
          </dl>

          <div className="async-script-resource-list">
            <span>iframe head 中的 Resource</span>
            {snapshot.headResources.length > 0 ? (
              <ol data-testid="async-script-resource-list">
                {snapshot.headResources.map((resource) => (
                  <li key={resource}>{resource}</li>
                ))}
              </ol>
            ) : (
              <p>当前 head 中没有 async script Resource。</p>
            )}
          </div>

          <p className="async-script-event-log" data-testid="async-script-event-log">
            执行事件：
            {snapshot.executions.events.length > 0
              ? snapshot.executions.events.join('、')
              : '尚未执行脚本'}
          </p>
        </section>

        <section className="async-script-frame-section" aria-label="隔离脚本文档">
          <div className="async-script-section-heading">
            <div>
              <span>Real browsing context</span>
              <h3>脚本执行发生在这个同源 iframe</h3>
            </div>
          </div>
          <iframe
            key={frameGeneration}
            className="async-script-frame"
            title="声明式异步脚本资源隔离文档"
            srcDoc={fixtureHtml}
            onLoad={handleFrameLoad}
          />
        </section>
      </div>
    </section>
  )
}
