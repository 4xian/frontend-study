import { createRoot, type Root } from 'react-dom/client'
import { preconnect, prefetchDNS, preinit, preinitModule, preload, preloadModule } from 'react-dom'

import {
  resourceHintClassicUrl,
  resourceHintModuleUrl,
  resourceHintStyleUrl,
  resourceHintsMessageSource,
  type ResourceHintAction,
  type ResourceHintCommandMessage,
  type ResourceHintRootState,
  type ResourceHintSnapshot,
  type ResourceHintSnapshotMessage,
  type ResourceHintStage,
} from './resource-hints-contract'

declare global {
  interface Window {
    __RESOURCE_HINT_CLASSIC_RUNS__?: number
    __RESOURCE_HINT_MODULE_RUNS__?: number
  }
}

const rootContainer = document.getElementById('resource-hints-root')
const styleTarget = document.getElementById('resource-hints-style-target')

let fixtureRoot: Root | null = rootContainer ? createRoot(rootContainer) : null
let stage: ResourceHintStage = 'ready'
let rootState: ResourceHintRootState = 'mounted'

/** 展示 iframe 内部 Root 的当前生命周期，不承载资源节点。 */
function FixtureStatus({
  currentStage,
  currentRootState,
}: {
  currentStage: ResourceHintStage
  currentRootState: ResourceHintRootState
}) {
  return (
    <main className="resource-hints-fixture-status">
      <span>独立 realm 中的 React Root</span>
      <strong>
        {currentRootState} / {currentStage}
      </strong>
    </main>
  )
}

/** 找到 head 中与目标地址完全一致的 link 元素。 */
function findLinks(rel: string, href: string): HTMLLinkElement[] {
  return Array.from(document.head.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`)).filter(
    (link) => link.getAttribute('href') === href,
  )
}

/** 找到 head 中与目标地址和模块形态一致的 script 元素。 */
function findScripts(src: string, module: boolean): HTMLScriptElement[] {
  return Array.from(document.head.querySelectorAll<HTMLScriptElement>('script[src]')).filter(
    (script) =>
      script.getAttribute('src') === src && (script.getAttribute('type') === 'module') === module,
  )
}

/** 将当前实验相关的 head 节点整理为可读列表。 */
function readHeadEntries(): string[] {
  const resourceUrls = new Set([
    resourceHintClassicUrl,
    resourceHintModuleUrl,
    resourceHintStyleUrl,
  ])
  return Array.from(document.head.children).flatMap((element) => {
    if (element instanceof HTMLLinkElement) {
      const href = element.getAttribute('href') ?? ''
      const isConnection =
        href === location.origin && (element.rel === 'dns-prefetch' || element.rel === 'preconnect')
      if (!isConnection && !resourceUrls.has(href)) return []
      const asValue = element.getAttribute('as')
      return [`link · rel=${element.rel}${asValue ? ` · as=${asValue}` : ''} · ${href}`]
    }
    if (element instanceof HTMLScriptElement) {
      const src = element.getAttribute('src') ?? ''
      if (!resourceUrls.has(src)) return []
      const scriptType = element.type === 'module' ? 'module' : 'classic'
      return [`script · ${scriptType} · async=${element.async} · ${src}`]
    }
    return []
  })
}

/** 读取 Document 级节点、脚本执行数和样式应用状态。 */
function readSnapshot(): ResourceHintSnapshot {
  const classicPreload = findLinks('preload', resourceHintClassicUrl)[0]
  return {
    stage,
    rootState,
    dnsCount: findLinks('dns-prefetch', location.origin).length,
    preconnectCount: findLinks('preconnect', location.origin).length,
    classicPreloadCount: findLinks('preload', resourceHintClassicUrl).length,
    modulePreloadCount: findLinks('modulepreload', resourceHintModuleUrl).length,
    classicScriptCount: findScripts(resourceHintClassicUrl, false).length,
    moduleScriptCount: findScripts(resourceHintModuleUrl, true).length,
    stylesheetCount: findLinks('stylesheet', resourceHintStyleUrl).length,
    classicRuns: window.__RESOURCE_HINT_CLASSIC_RUNS__ ?? 0,
    moduleRuns: window.__RESOURCE_HINT_MODULE_RUNS__ ?? 0,
    styleApplied:
      styleTarget !== null &&
      getComputedStyle(styleTarget).getPropertyValue('--resource-hints-style-state').trim() ===
        'applied',
    firstFetchPriority: classicPreload?.getAttribute('fetchpriority') ?? '无',
    firstCrossOrigin: classicPreload?.getAttribute('crossorigin') ?? '无',
    headEntries: readHeadEntries(),
  }
}

/** 更新仍存活的 React Root 状态标签。 */
function renderFixtureStatus(): void {
  fixtureRoot?.render(<FixtureStatus currentStage={stage} currentRootState={rootState} />)
}

/** 向父页面发布纯数据快照，并在所有副作用就绪后收敛阶段。 */
function publishSnapshot(): void {
  let snapshot = readSnapshot()
  if (
    stage === 'preinitializing' &&
    snapshot.classicRuns === 1 &&
    snapshot.moduleRuns === 1 &&
    snapshot.styleApplied
  ) {
    stage = 'preinitialized'
    snapshot = readSnapshot()
  }
  renderFixtureStatus()
  const message: ResourceHintSnapshotMessage = {
    source: resourceHintsMessageSource,
    type: 'snapshot',
    snapshot,
  }
  window.parent.postMessage(message, location.origin)
}

/** 重复声明同一 origin，验证连接提示按相同参数去重。 */
function declareConnections(): void {
  prefetchDNS(location.origin)
  prefetchDNS(location.origin)
  preconnect(location.origin, { crossOrigin: 'anonymous' })
  preconnect(location.origin, { crossOrigin: 'anonymous' })
}

/** 提前下载 classic 与 module 资源，但不触发执行。 */
function discoverResources(useConflictingClassicOptions = false): void {
  preload(resourceHintClassicUrl, {
    as: 'script',
    crossOrigin: useConflictingClassicOptions ? 'use-credentials' : 'anonymous',
    fetchPriority: useConflictingClassicOptions ? 'low' : 'high',
  })
  preloadModule(resourceHintModuleUrl, {
    as: 'script',
    crossOrigin: 'anonymous',
  })
}

/** 立即执行两种脚本并应用 stylesheet，使用与首次提示一致的属性。 */
function activateResources(): void {
  preinit(resourceHintClassicUrl, {
    as: 'script',
    crossOrigin: 'anonymous',
    fetchPriority: 'high',
  })
  preinitModule(resourceHintModuleUrl, {
    as: 'script',
    crossOrigin: 'anonymous',
  })
  preinit(resourceHintStyleUrl, {
    as: 'style',
    precedence: 'medium',
  })
}

/** 卸载 Root，同时保留同一 Document 的资源与副作用。 */
function unmountFixtureRoot(): void {
  fixtureRoot?.unmount()
  fixtureRoot = null
  rootState = 'unmounted'
  stage = 'root-unmounted'
  publishSnapshot()
}

/** 在同一 Document 中重建 Root，并复调全部 API 验证资源仍被复用。 */
function remountFixtureRoot(): void {
  if (!rootContainer || fixtureRoot) return
  fixtureRoot = createRoot(rootContainer)
  rootState = 'remounted'
  stage = 'root-remounted'
  declareConnections()
  discoverResources(true)
  activateResources()
  publishSnapshot()
}

/** 执行父页面发来的单步实验动作。 */
function runAction(action: ResourceHintAction): void {
  if (action === 'declare-connections') {
    declareConnections()
    stage = 'connections'
  } else if (action === 'preload-resources') {
    discoverResources()
    stage = 'preloaded'
  } else if (action === 'preinit-resources') {
    stage = 'preinitializing'
    activateResources()
  } else if (action === 'repeat-resources') {
    declareConnections()
    discoverResources(true)
    activateResources()
    stage = 'repeated'
  } else if (action === 'unmount-root') {
    unmountFixtureRoot()
    return
  } else {
    remountFixtureRoot()
    return
  }
  publishSnapshot()
}

/** 校验来源并处理父页面的跨 realm 控制消息。 */
function handleParentMessage(event: MessageEvent<unknown>): void {
  if (event.origin !== location.origin || event.source !== window.parent) return
  const message = event.data as Partial<ResourceHintCommandMessage>
  if (
    message.source !== resourceHintsMessageSource ||
    message.type !== 'command' ||
    !message.action
  ) {
    return
  }
  runAction(message.action)
}

/** 在资源节点发生变化时发布新的确定性 DOM 快照。 */
function handleHeadMutation(): void {
  publishSnapshot()
}

/** 在脚本执行或 stylesheet load 后发布副作用终态。 */
function handleResourceSettled(): void {
  publishSnapshot()
}

const headObserver = new MutationObserver(handleHeadMutation)
headObserver.observe(document.head, { childList: true })
window.addEventListener('message', handleParentMessage)
window.addEventListener('react-course:resource-hint-executed', handleResourceSettled)
document.addEventListener('load', handleResourceSettled, true)

renderFixtureStatus()
publishSnapshot()
