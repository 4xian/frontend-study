import {
  createContext,
  useContext,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'

import './portal-tree-and-dom-placement-demo.css'

type ContextTone = '海蓝' | '琥珀'
type TargetId = 'A' | 'B'

type PortalChildProps = Readonly<{
  onProbeClick: (nativePathMarks: string[]) => void
  ref?: Ref<HTMLElement>
  targetId: TargetId
}>

const PortalToneContext = createContext<ContextTone>('海蓝')

/** 从原生 composedPath 中提取本 Demo 自有的稳定标记。 */
function readNativePathMarks(event: ReactMouseEvent<HTMLButtonElement>): string[] {
  const marks: string[] = []
  for (const target of event.nativeEvent.composedPath()) {
    if (!(target instanceof HTMLElement)) continue
    if (target.dataset.portalProbe === 'true') marks.push('portal-probe')
    if (target.dataset.portalChild === 'true') marks.push('portal-child')
    if (target.dataset.portalTarget) marks.push(`target-${target.dataset.portalTarget}`)
    if (target.dataset.portalDemoHost === 'true') marks.push('portal-host')
    if (target.dataset.reactEventParent === 'true') marks.push('react-parent')
  }
  return marks
}

/** 读取调用处 Context，并持有随 Portal 容器身份变化的本地 State。 */
function PortalChild({ onProbeClick, ref, targetId }: PortalChildProps) {
  const tone = useContext(PortalToneContext)
  const [initialTarget] = useState(targetId)
  const [localCount, setLocalCount] = useState(0)

  /** 记录 Portal child handler 与浏览器原生 DOM 路径。 */
  function handleProbeClick(event: ReactMouseEvent<HTMLButtonElement>): void {
    onProbeClick(readNativePathMarks(event))
  }

  /** 只更新 Portal child 的本地计数，不混入事件传播实验。 */
  function handleIncreaseLocalCount(event: ReactMouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    setLocalCount((current) => current + 1)
  }

  return (
    <article
      ref={ref}
      className={`portal-placement-child is-${tone === '海蓝' ? 'ocean' : 'amber'}`}
      data-portal-child="true"
      data-testid="portal-placement-child"
    >
      <span>Portal child / Target {targetId}</span>
      <strong data-testid="portal-context-tone">Context：{tone}</strong>
      <dl>
        <div>
          <dt>本实例的初始目标</dt>
          <dd data-testid="portal-initial-target">Target {initialTarget}</dd>
        </div>
        <div>
          <dt>本地计数</dt>
          <dd data-testid="portal-local-count">{localCount}</dd>
        </div>
      </dl>
      <div className="portal-placement-child-actions">
        <button
          type="button"
          data-portal-probe="true"
          data-testid="portal-probe-button"
          onClick={handleProbeClick}
        >
          记录一次 Portal 点击
        </button>
        <button
          type="button"
          className="is-quiet"
          data-testid="portal-local-count-button"
          onClick={handleIncreaseLocalCount}
        >
          本地计数 +1
        </button>
      </div>
    </article>
  )
}

/** 展示 Portal 的 React 树语义、DOM 落点与容器身份合同。 */
export default function PortalTreeAndDomPlacementDemo() {
  const reactParentRef = useRef<HTMLDivElement>(null)
  const [portalHostNode, setPortalHostNode] = useState<HTMLElement | null>(null)
  const [targetA, setTargetA] = useState<HTMLElement | null>(null)
  const [targetB, setTargetB] = useState<HTMLElement | null>(null)
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null)
  const [contextTone, setContextTone] = useState<ContextTone>('海蓝')
  const [activeTarget, setActiveTarget] = useState<TargetId>('A')
  const [parentClickCount, setParentClickCount] = useState(0)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [nativePathMarks, setNativePathMarks] = useState<string[]>([])
  const [shellRenderCount, setShellRenderCount] = useState(0)
  const [resetVersion, setResetVersion] = useState(0)

  /** 先记录 child handler，再让 React parent handler 追加传播结果。 */
  function handleProbeClick(marks: string[]): void {
    setEventLog(['Portal child'])
    setNativePathMarks(marks)
  }

  /** 只统计真正来自 Portal child 的 React 树冒泡点击。 */
  function handleReactParentClick(event: ReactMouseEvent<HTMLDivElement>): void {
    if (!(event.target instanceof Element)) return
    if (!event.target.closest('[data-portal-child="true"]')) return
    setParentClickCount((current) => current + 1)
    setEventLog((current) => [...current, 'React parent'])
  }

  /** 在同一目标容器下更新调用处 Provider 的值。 */
  function handleToggleContext(): void {
    setContextTone((current) => (current === '海蓝' ? '琥珀' : '海蓝'))
  }

  /** 只更换 createPortal 的 domNode，保持 portal key 与 child 类型不变。 */
  function handleSwitchTarget(): void {
    setActiveTarget((current) => (current === 'A' ? 'B' : 'A'))
    setEventLog([])
    setNativePathMarks([])
  }

  /** 触发调用处普通 render，验证同一目标下 child State 保留。 */
  function handleShellRender(): void {
    setShellRenderCount((current) => current + 1)
  }

  /** 清空事件证据，方便重复执行传播对照。 */
  function handleClearEventEvidence(): void {
    setEventLog([])
    setNativePathMarks([])
    setParentClickCount(0)
  }

  /** 把当前目标容器滚动进视口。 */
  function handleScrollToTarget(): void {
    const activeTargetNode = activeTarget === 'A' ? targetA : targetB
    activeTargetNode?.scrollIntoView({ block: 'center' })
  }

  /** 恢复初始变量，并通过新的 portal key 重建本地实验状态。 */
  function handleReset(): void {
    setContextTone('海蓝')
    setActiveTarget('A')
    setParentClickCount(0)
    setEventLog([])
    setNativePathMarks([])
    setShellRenderCount(0)
    setResetVersion((current) => current + 1)
  }

  const activeTargetNode = activeTarget === 'A' ? targetA : targetB
  const inactiveTarget: TargetId = activeTarget === 'A' ? 'B' : 'A'
  const inactiveTargetNode = inactiveTarget === 'A' ? targetA : targetB
  const ownerContainsPortal = Boolean(reactParentRef.current?.contains(portalNode))
  const hostContainsPortal = Boolean(portalHostNode?.contains(portalNode))
  const activeTargetContainsPortal = Boolean(activeTargetNode?.contains(portalNode))
  const inactiveTargetContainsPortal = Boolean(inactiveTargetNode?.contains(portalNode))
  const portalParentIsActiveTarget = portalNode?.parentElement === activeTargetNode
  const targetsBelongToHost = Boolean(
    portalHostNode &&
    targetA?.parentElement === portalHostNode &&
    targetB?.parentElement === portalHostNode,
  )
  const nativePathIncludesReactParent = nativePathMarks.includes('react-parent')

  return (
    <>
      <PortalToneContext.Provider value={contextTone}>
        <section className="portal-placement-demo" data-testid="portal-placement-demo">
          <header className="portal-placement-heading">
            <p>React tree / DOM tree</p>
            <h2>一个 child，两种位置关系</h2>
            <span>Portal 调用属于下方 React parent，真实 DOM 则进入组件另一分支中的 Target。</span>
          </header>

          <div className="portal-placement-lab">
            <section className="portal-placement-controls" aria-label="Portal 实验控制">
              <div className="portal-placement-section-heading">
                <div>
                  <span>Controls</span>
                  <h3>保持 portal key 与 child 类型稳定，只改变一个观察变量</h3>
                </div>
                <strong data-testid="active-portal-target">当前 Target {activeTarget}</strong>
              </div>
              <div className="portal-placement-buttons">
                <button type="button" onClick={handleToggleContext}>
                  Context 切换为{contextTone === '海蓝' ? '琥珀' : '海蓝'}
                </button>
                <button type="button" onClick={handleShellRender}>
                  只更新 owner 外壳（{shellRenderCount}）
                </button>
                <button type="button" onClick={handleSwitchTarget}>
                  切换到 Target {inactiveTarget}
                </button>
                <button type="button" className="is-quiet" onClick={handleScrollToTarget}>
                  定位当前 Target
                </button>
                <button type="button" className="is-quiet" onClick={handleClearEventEvidence}>
                  清空事件证据
                </button>
                <button
                  type="button"
                  className="is-quiet"
                  data-testid="portal-reset-button"
                  onClick={handleReset}
                >
                  重置实验
                </button>
              </div>
            </section>

            <div
              ref={reactParentRef}
              className="portal-placement-owner"
              data-react-event-parent="true"
              data-testid="portal-react-parent"
              onClick={handleReactParentClick}
            >
              <span>React Event Parent</span>
              <strong>Portal 调用写在这里</strong>
              <p>这个 DOM 容器不包含 Portal child，但它仍是 child 的 React 树祖先。</p>
              {activeTargetNode ? (
                createPortal(
                  <PortalChild
                    ref={setPortalNode}
                    onProbeClick={handleProbeClick}
                    targetId={activeTarget}
                  />,
                  activeTargetNode,
                  `portal-placement-lab-${resetVersion}`,
                )
              ) : (
                <small data-testid="portal-target-pending">正在取得 Portal 目标节点…</small>
              )}
            </div>

            <section className="portal-placement-observations" aria-label="Portal 观察结果">
              <div className="portal-placement-section-heading">
                <div>
                  <span>Observations</span>
                  <h3>React 关系与 DOM 关系分开读取</h3>
                </div>
                <strong>{activeTargetNode ? '目标节点已就绪' : '正在取得目标节点'}</strong>
              </div>

              <dl className="portal-placement-facts">
                <div>
                  <dt>Context</dt>
                  <dd data-testid="observed-context-tone">{contextTone}</dd>
                </div>
                <div>
                  <dt>React parent contains child</dt>
                  <dd data-testid="owner-contains-portal">{String(ownerContainsPortal)}</dd>
                </div>
                <div>
                  <dt>Portal host contains child</dt>
                  <dd data-testid="host-contains-portal">{String(hostContainsPortal)}</dd>
                </div>
                <div>
                  <dt>Target {activeTarget} contains child</dt>
                  <dd data-testid="active-target-contains-portal">
                    {String(activeTargetContainsPortal)}
                  </dd>
                </div>
                <div>
                  <dt>Target {inactiveTarget} contains child</dt>
                  <dd data-testid="inactive-target-contains-portal">
                    {String(inactiveTargetContainsPortal)}
                  </dd>
                </div>
                <div>
                  <dt>child parent 是当前 Target</dt>
                  <dd data-testid="portal-parent-is-active-target">
                    {String(portalParentIsActiveTarget)}
                  </dd>
                </div>
                <div>
                  <dt>A / B 属于目标区 host</dt>
                  <dd data-testid="targets-belong-to-host">{String(targetsBelongToHost)}</dd>
                </div>
                <div>
                  <dt>React parent 点击次数</dt>
                  <dd data-testid="react-parent-click-count">{parentClickCount}</dd>
                </div>
              </dl>

              <div className="portal-placement-evidence-row">
                <article>
                  <span>React event log</span>
                  <strong data-testid="react-event-log">
                    {eventLog.length ? eventLog.join(' → ') : '等待 Portal 点击'}
                  </strong>
                </article>
                <article>
                  <span>native composedPath 自有标记</span>
                  <strong data-testid="native-path-marks">
                    {nativePathMarks.length ? nativePathMarks.join(' → ') : '等待 Portal 点击'}
                  </strong>
                  <small data-testid="native-path-includes-react-parent">
                    包含 React parent：{String(nativePathIncludesReactParent)}
                  </small>
                </article>
              </div>
            </section>
          </div>
        </section>
      </PortalToneContext.Provider>

      <aside
        ref={setPortalHostNode}
        className="portal-placement-target-dock"
        data-portal-demo-host="true"
        data-testid="portal-placement-target-dock"
        aria-label="Portal DOM 目标区"
      >
        <div className="portal-placement-dock-heading">
          <span>DOM sibling branch</span>
          <strong>React parent 之外的 Portal DOM 落点</strong>
          <p>A 与 B 是稳定 DOM Node；切换目标会重建 Portal child。</p>
        </div>
        <div className="portal-placement-target-row">
          <section
            ref={setTargetA}
            className="portal-placement-target"
            data-portal-target="A"
            data-testid="portal-target-a"
            aria-label="Portal 目标 A"
          >
            <span className="portal-placement-target-label">DOM Target A</span>
          </section>
          <section
            ref={setTargetB}
            className="portal-placement-target"
            data-portal-target="B"
            data-testid="portal-target-b"
            aria-label="Portal 目标 B"
          >
            <span className="portal-placement-target-label">DOM Target B</span>
          </section>
        </div>
      </aside>
    </>
  )
}
