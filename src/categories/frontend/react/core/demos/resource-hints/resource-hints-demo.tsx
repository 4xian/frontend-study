import { useEffect, useRef, useState } from 'react'

import {
  isResourceHintSnapshotMessage,
  resourceHintClassicUrl,
  resourceHintModuleUrl,
  resourceHintStyleUrl,
  resourceHintsFixturePath,
  resourceHintsMessageSource,
  type ResourceHintAction,
  type ResourceHintCommandMessage,
  type ResourceHintSnapshot,
  type ResourceHintStage,
} from './resource-hints-contract'
import './resource-hints-demo.css'

const stageLabels: Record<ResourceHintStage, string> = {
  loading: '正在建立独立 Document',
  ready: '新 Document 已就绪',
  connections: '连接提示已声明',
  preloaded: '资源已提前发现',
  preinitializing: '正在执行并应用资源',
  preinitialized: '资源已执行并应用',
  repeated: '重复调用仍保持首次合同',
  'root-unmounted': 'Root 已卸载，Document 保留',
  'root-remounted': '同 Document Root 已重建',
}

const trackedResourceUrls = new Set([
  resourceHintClassicUrl,
  resourceHintModuleUrl,
  resourceHintStyleUrl,
])

/** 统计学习站宿主 head 中是否出现本实验的资源节点。 */
function countHostResourceNodes(): number {
  return Array.from(document.head.children).filter((element) => {
    if (element instanceof HTMLLinkElement) {
      const href = element.getAttribute('href') ?? ''
      const isTrackedConnection =
        href === location.origin && (element.rel === 'dns-prefetch' || element.rel === 'preconnect')
      return isTrackedConnection || trackedResourceUrls.has(href)
    }
    return (
      element instanceof HTMLScriptElement &&
      trackedResourceUrls.has(element.getAttribute('src') ?? '')
    )
  }).length
}

/** 展示六个 API 的节点映射、执行边界和 Document 生命周期。 */
export default function ResourceHintsDemo() {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [frameGeneration, setFrameGeneration] = useState(1)
  const [snapshot, setSnapshot] = useState<ResourceHintSnapshot | null>(null)
  const [hostResourceCount, setHostResourceCount] = useState(() => countHostResourceNodes())

  useEffect(() => {
    /** 只采用当前 iframe window 发出的同源快照。 */
    function handleSnapshotMessage(event: MessageEvent<unknown>): void {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        !isResourceHintSnapshotMessage(event.data)
      ) {
        return
      }
      setSnapshot(event.data.snapshot)
      setHostResourceCount(countHostResourceNodes())
    }

    window.addEventListener('message', handleSnapshotMessage)
    return () => window.removeEventListener('message', handleSnapshotMessage)
  }, [])

  /** 向独立 realm 发送一个资源实验动作。 */
  function sendCommand(action: ResourceHintAction): void {
    const message: ResourceHintCommandMessage = {
      source: resourceHintsMessageSource,
      type: 'command',
      action,
    }
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin)
  }

  /** 声明 DNS 与 preconnect 提示。 */
  function declareConnections(): void {
    sendCommand('declare-connections')
  }

  /** 预加载 classic 与 module 资源但不执行。 */
  function preloadResources(): void {
    sendCommand('preload-resources')
  }

  /** 预初始化脚本与样式并观察副作用。 */
  function preinitResources(): void {
    sendCommand('preinit-resources')
  }

  /** 使用冲突的后续优先级重复调用全部资源 API。 */
  function repeatResources(): void {
    sendCommand('repeat-resources')
  }

  /** 卸载独立文档中的 React Root。 */
  function unmountRoot(): void {
    sendCommand('unmount-root')
  }

  /** 在同一 Document 中重建 Root 并复调资源 API。 */
  function remountRoot(): void {
    sendCommand('remount-root')
  }

  /** 销毁旧 iframe realm，并载入一个全新的 Document。 */
  function rebuildDocument(): void {
    setSnapshot(null)
    setHostResourceCount(countHostResourceNodes())
    setFrameGeneration((current) => current + 1)
  }

  const stage = snapshot?.stage ?? 'loading'
  const resourceExecutionReady =
    snapshot?.classicRuns === 1 && snapshot.moduleRuns === 1 && snapshot.styleApplied

  return (
    <section className="resource-hints-demo" data-testid="resource-hints-demo">
      <header className="resource-hints-demo-heading">
        <p>Independent browser realm</p>
        <h2>资源提示与立即生效观察器</h2>
        <span>六个 API 只在同源 iframe 内运行，学习站宿主 Document 保持不变。</span>
      </header>

      <div className="resource-hints-demo-body">
        <section className="resource-hints-controls" aria-label="资源提示实验控制">
          <div className="resource-hints-section-heading">
            <div>
              <span>当前阶段</span>
              <strong data-testid="resource-hints-stage">{stageLabels[stage]}</strong>
            </div>
            <button
              type="button"
              className="resource-hints-rebuild"
              aria-label="重建 Document"
              title="重建 Document"
              onClick={rebuildDocument}
            >
              <span aria-hidden="true">&#x21bb;</span>
            </button>
          </div>

          <div className="resource-hints-actions">
            <button type="button" onClick={declareConnections} disabled={stage !== 'ready'}>
              声明连接提示
            </button>
            <button type="button" onClick={preloadResources} disabled={stage !== 'connections'}>
              提前发现资源
            </button>
            <button type="button" onClick={preinitResources} disabled={stage !== 'preloaded'}>
              立即执行与应用
            </button>
            <button
              type="button"
              onClick={repeatResources}
              disabled={stage !== 'preinitialized' || !resourceExecutionReady}
            >
              重复相同身份
            </button>
            <button
              type="button"
              className="is-danger"
              onClick={unmountRoot}
              disabled={stage !== 'repeated'}
            >
              卸载 Root
            </button>
            <button type="button" onClick={remountRoot} disabled={stage !== 'root-unmounted'}>
              同 Document 重建 Root
            </button>
          </div>
        </section>

        <section className="resource-hints-observations" aria-label="资源提示观察结果">
          <div className="resource-hints-section-heading">
            <div>
              <span>Document generation {frameGeneration}</span>
              <h3>节点、执行与样式分别观察</h3>
            </div>
            <strong
              className={hostResourceCount === 0 ? 'is-pass' : 'is-fail'}
              data-testid="resource-hints-host-count"
            >
              宿主资源节点：{hostResourceCount}
            </strong>
          </div>

          <dl className="resource-hints-counts">
            <div>
              <dt>DNS / preconnect</dt>
              <dd data-testid="resource-hints-connection-counts">
                {snapshot?.dnsCount ?? 0} / {snapshot?.preconnectCount ?? 0}
              </dd>
            </div>
            <div>
              <dt>preload / modulepreload</dt>
              <dd data-testid="resource-hints-preload-counts">
                {snapshot?.classicPreloadCount ?? 0} / {snapshot?.modulePreloadCount ?? 0}
              </dd>
            </div>
            <div>
              <dt>classic / module script</dt>
              <dd data-testid="resource-hints-script-counts">
                {snapshot?.classicScriptCount ?? 0} / {snapshot?.moduleScriptCount ?? 0}
              </dd>
            </div>
            <div>
              <dt>classic / module 执行</dt>
              <dd data-testid="resource-hints-execution-counts">
                {snapshot?.classicRuns ?? 0} / {snapshot?.moduleRuns ?? 0}
              </dd>
            </div>
            <div>
              <dt>stylesheet / 应用</dt>
              <dd data-testid="resource-hints-style-state">
                {snapshot?.stylesheetCount ?? 0} / {snapshot?.styleApplied ? '已应用' : '未应用'}
              </dd>
            </div>
            <div>
              <dt>Root 生命周期</dt>
              <dd data-testid="resource-hints-root-state">{snapshot?.rootState ?? 'loading'}</dd>
            </div>
          </dl>

          <div className="resource-hints-first-contract">
            <span>首次 preload 属性</span>
            <strong data-testid="resource-hints-first-contract">
              fetchPriority={snapshot?.firstFetchPriority ?? '无'} · crossOrigin=
              {snapshot?.firstCrossOrigin ?? '无'}
            </strong>
          </div>

          <div className="resource-hints-head-list">
            <span>隔离 head 中的目标节点</span>
            {snapshot?.headEntries.length ? (
              <ol data-testid="resource-hints-head-entries">
                {snapshot.headEntries.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ol>
            ) : (
              <p data-testid="resource-hints-head-entries">当前没有实验资源节点。</p>
            )}
          </div>
        </section>

        <section className="resource-hints-frame-section" aria-label="独立资源提示文档">
          <div className="resource-hints-section-heading">
            <div>
              <span>Same-origin fixture</span>
              <h3>React DOM 在此 realm 中独立求值</h3>
            </div>
          </div>
          <iframe
            key={frameGeneration}
            ref={frameRef}
            className="resource-hints-frame"
            src={`${resourceHintsFixturePath}?generation=${frameGeneration}`}
            title={`资源提示隔离文档，第 ${frameGeneration} 代`}
          />
        </section>
      </div>
    </section>
  )
}
