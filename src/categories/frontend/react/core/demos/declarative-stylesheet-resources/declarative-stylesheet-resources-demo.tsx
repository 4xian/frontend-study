import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import './declarative-stylesheet-resources-demo.css'

type FixturePhase = 'shell' | 'waiting' | 'ready' | 'unmounted'
type TokenVariant = 'stable' | 'changed'
type TokenVersion = 1 | 2

type ResourceSnapshot = Readonly<{
  phase: FixturePhase
  stylesheetCount: number
  inlineStyleCount: number
  preloadCount: number
  resourceOrder: readonly string[]
  tokenResources: readonly string[]
  rootText: string
  staticMarkerPresent: boolean
}>

type FixtureHandle = {
  document: Document
  root: Root | null
  observer: MutationObserver
  phase: FixturePhase
  stylesheetHref: string
}

type ResourceViewProps = Readonly<{
  includeDuplicates: boolean
  tokenVariant: TokenVariant
  tokenVersion: TokenVersion
  stylesheetHref: string
}>

let fixtureSequence = 0
const resetStyleHref = 'inline-reset-styles'
const componentStyleHref = 'inline-component-styles'
const overrideStyleHref = 'inline-override-styles'
const tokenStyleHrefs = {
  1: 'inline-token-styles-v1',
  2: 'inline-token-styles-v2',
} as const

const resetCss = `
  .fixture-resource-panel { box-sizing: border-box; }
`

const stableTokensCss = `
  .fixture-resource-panel { color: #18394a; background: #edf7f3; }
`

const changedTokensCss = `
  .fixture-resource-panel { color: #7a322e; background: #fff1ef; }
`

const componentCss = `
  .fixture-resource-panel { padding: 12px; border: 1px solid #5a7b70; }
`

const overrideCss = `
  .fixture-resource-panel { border-radius: 6px; }
`

/** 在独立 Document 中显示已提交的初始内容。 */
function FixtureShell() {
  return <article data-stylesheet-shell>当前仍是已提交的目录视图</article>
}

/** 声明可提升、分组并按 href 去重的样式资源。 */
function StylesheetResources({
  includeDuplicates,
  tokenVariant,
  tokenVersion,
  stylesheetHref,
}: ResourceViewProps) {
  const tokenStyleHref = tokenStyleHrefs[tokenVersion]
  const tokenCss = tokenVariant === 'stable' ? stableTokensCss : changedTokensCss
  const tokenPrecedence = tokenVariant === 'stable' ? 'foundation' : 'overrides'

  return (
    <>
      <style href={resetStyleHref} precedence="foundation">
        {resetCss}
      </style>
      <style href={tokenStyleHref} precedence={tokenPrecedence}>
        {tokenCss}
      </style>
      {includeDuplicates ? (
        <style href={tokenStyleHref} precedence={tokenPrecedence}>
          {tokenCss}
        </style>
      ) : null}
      <style href={componentStyleHref} precedence="components">
        {componentCss}
      </style>
      <link rel="stylesheet" href={stylesheetHref} precedence="foundation" />
      {includeDuplicates ? (
        <link rel="stylesheet" href={stylesheetHref} precedence="foundation" />
      ) : null}
      <style href={overrideStyleHref} precedence="overrides">
        {overrideCss}
      </style>
    </>
  )
}

/** 声明依赖外链样式的视图。 */
function ResourceView({
  includeDuplicates,
  tokenVariant,
  tokenVersion,
  stylesheetHref,
}: ResourceViewProps) {
  return (
    <Suspense fallback={<p data-stylesheet-fallback>正在等待样式资源</p>}>
      <StylesheetResources
        includeDuplicates={includeDuplicates}
        tokenVariant={tokenVariant}
        tokenVersion={tokenVersion}
        stylesheetHref={stylesheetHref}
      />
      <article className="fixture-resource-panel" data-stylesheet-content>
        样式资源已就绪，依赖视图完成提交
      </article>
    </Suspense>
  )
}

/** 读取独立 Document 中的资源顺序、去重数量和正文提交状态。 */
function readResourceSnapshot(handle: FixtureHandle): ResourceSnapshot {
  const resourceNodes = Array.from(
    handle.document.head.querySelectorAll<HTMLElement>(
      'style[data-precedence], link[rel="stylesheet"][data-precedence]',
    ),
  )
  const container = handle.document.body.querySelector<HTMLElement>('[data-stylesheet-root]')
  const tokenResources = Array.from(
    handle.document.head.querySelectorAll<HTMLStyleElement>(
      'style[data-href^="inline-token-styles-v"]',
    ),
    (node) => {
      const content = node.textContent ?? ''
      const variant = content.includes('#7a322e') ? '变更内容' : '初始内容'
      return `${node.dataset.href ?? '未知身份'} · ${node.dataset.precedence ?? '未分组'} · ${variant}`
    },
  )

  return {
    phase: handle.phase,
    stylesheetCount: handle.document.head.querySelectorAll('link[rel="stylesheet"]').length,
    inlineStyleCount: handle.document.head.querySelectorAll('style[data-precedence]').length,
    preloadCount: handle.document.head.querySelectorAll('link[rel="preload"][as="style"]').length,
    resourceOrder: resourceNodes.map((node) => {
      const identity = node.getAttribute('href') ?? node.getAttribute('data-href') ?? '未知资源'
      return `${node.tagName.toLowerCase()} · ${node.dataset.precedence ?? '未分组'} · ${identity}`
    }),
    tokenResources,
    rootText: container?.textContent?.trim() || '空',
    staticMarkerPresent: Boolean(handle.document.head.querySelector('[data-stylesheet-static]')),
  }
}

/** 建立带静态 head 标记、观察器和专属 React Root 的独立 Document。 */
function createStylesheetFixture(onSnapshot: (handle: FixtureHandle) => void): FixtureHandle {
  fixtureSequence += 1
  const fixtureDocument = document.implementation.createHTMLDocument()
  const staticMarker = fixtureDocument.createElement('meta')
  staticMarker.name = 'fixture-owner'
  staticMarker.content = 'outside-react'
  staticMarker.dataset.stylesheetStatic = 'true'
  fixtureDocument.head.append(staticMarker)

  const container = fixtureDocument.createElement('div')
  container.dataset.stylesheetRoot = 'true'
  fixtureDocument.body.append(container)

  const handle = {
    document: fixtureDocument,
    root: createRoot(container),
    observer: null as unknown as MutationObserver,
    phase: 'shell' as FixturePhase,
    stylesheetHref: new URL(
      `/react-course-fixtures/controlled-foundation-${fixtureSequence}.css`,
      window.location.origin,
    ).href,
  }
  const observer = new MutationObserver(() => {
    if (handle.document.body.querySelector('[data-stylesheet-content]')) {
      handle.phase = 'ready'
    }
    onSnapshot(handle)
  })
  observer.observe(fixtureDocument.head, { childList: true, subtree: true })
  observer.observe(fixtureDocument.body, { childList: true, subtree: true })
  handle.observer = observer

  return handle
}

/** 卸载专属 Root 并停止观察当前独立 Document。 */
function releaseStylesheetFixture(handle: FixtureHandle): void {
  if (handle.root) {
    const root = handle.root
    handle.root = null
    root.unmount()
  }
  handle.observer.disconnect()
}

/** 把初始目录视图提交到独立 Document。 */
function renderFixtureShell(handle: FixtureHandle): void {
  handle.phase = 'shell'
  handle.root?.render(<FixtureShell />)
}

/** 请求渲染依赖样式资源的视图。 */
function renderResourceView(
  handle: FixtureHandle,
  includeDuplicates: boolean,
  tokenVariant: TokenVariant,
  tokenVersion: TokenVersion,
): void {
  if (handle.phase === 'shell') handle.phase = 'waiting'
  handle.root?.render(
    <ResourceView
      includeDuplicates={includeDuplicates}
      tokenVariant={tokenVariant}
      tokenVersion={tokenVersion}
      stylesheetHref={handle.stylesheetHref}
    />,
  )
}

/** 演示声明式样式资源的放置、分组、去重和提交等待。 */
export default function DeclarativeStylesheetResourcesDemo() {
  const fixtureRef = useRef<FixtureHandle | null>(null)
  const [includeDuplicates, setIncludeDuplicates] = useState(true)
  const [tokenVariant, setTokenVariant] = useState<TokenVariant>('stable')
  const [tokenVersion, setTokenVersion] = useState<TokenVersion>(1)
  const [snapshot, setSnapshot] = useState<ResourceSnapshot>({
    phase: 'shell',
    stylesheetCount: 0,
    inlineStyleCount: 0,
    preloadCount: 0,
    resourceOrder: [],
    tokenResources: [],
    rootText: '等待建立独立 Document',
    staticMarkerPresent: true,
  })

  /** 读取指定 fixture 的最新 DOM 状态。 */
  const refreshSnapshot = useCallback((handle: FixtureHandle): void => {
    setSnapshot(readResourceSnapshot(handle))
  }, [])

  /** 创建初始 fixture，并在 Demo 离开时释放当前专属 Root。 */
  useEffect(() => {
    const handle = createStylesheetFixture(refreshSnapshot)
    fixtureRef.current = handle
    renderFixtureShell(handle)

    return () => {
      const currentHandle = fixtureRef.current
      if (currentHandle) releaseStylesheetFixture(currentHandle)
      fixtureRef.current = null
    }
  }, [refreshSnapshot])

  /** 请求进入依赖外链 stylesheet 的视图。 */
  function startResourceView(): void {
    const handle = fixtureRef.current
    if (!handle?.root) return
    renderResourceView(handle, includeDuplicates, tokenVariant, tokenVersion)
    refreshSnapshot(handle)
  }

  /** 向受控 stylesheet 派发 load，允许等待中的视图完成提交。 */
  function completeStylesheetLoad(): void {
    const handle = fixtureRef.current
    if (!handle?.root) return

    /** 向当前 fixture 中已经插入的 stylesheet 派发 load。 */
    const dispatchStylesheetLoad = (): void => {
      if (fixtureRef.current !== handle || !handle.root) return
      const stylesheet = handle.document.head.querySelector<HTMLLinkElement>(
        `link[rel="stylesheet"][href="${handle.stylesheetHref}"]`,
      )
      stylesheet?.dispatchEvent(new Event('load'))
      refreshSnapshot(handle)
    }

    const stylesheet = handle.document.head.querySelector<HTMLLinkElement>(
      `link[rel="stylesheet"][href="${handle.stylesheetHref}"]`,
    )
    if (stylesheet) {
      dispatchStylesheetLoad()
      return
    }

    const stylesheetObserver = new MutationObserver(() => {
      const insertedStylesheet = handle.document.head.querySelector<HTMLLinkElement>(
        `link[rel="stylesheet"][href="${handle.stylesheetHref}"]`,
      )
      if (!insertedStylesheet) return
      stylesheetObserver.disconnect()
      insertedStylesheet.dispatchEvent(new Event('load'))
      refreshSnapshot(handle)
    })
    stylesheetObserver.observe(handle.document.head, { childList: true })

    const preload = handle.document.head.querySelector<HTMLLinkElement>(
      `link[rel="preload"][as="style"][href="${handle.stylesheetHref}"]`,
    )
    preload?.dispatchEvent(new Event('load'))
  }

  /** 切换重复声明，并重新提交当前资源视图。 */
  function toggleDuplicates(): void {
    const handle = fixtureRef.current
    const nextValue = !includeDuplicates
    setIncludeDuplicates(nextValue)
    if (!handle?.root || snapshot.phase === 'shell') return
    renderResourceView(handle, nextValue, tokenVariant, tokenVersion)
    refreshSnapshot(handle)
  }

  /** 请求用同一 href 改写 CSS 与 precedence，观察资源保持首次合同。 */
  function attemptSameHrefUpdate(): void {
    const handle = fixtureRef.current
    if (!handle?.root || snapshot.phase !== 'ready' || tokenVariant === 'changed') return
    setTokenVariant('changed')
    renderResourceView(handle, includeDuplicates, 'changed', tokenVersion)
    refreshSnapshot(handle)
  }

  /** 使用新 href 建立第二版内联样式资源。 */
  function createNewTokenResource(): void {
    const handle = fixtureRef.current
    if (!handle?.root || snapshot.phase !== 'ready' || tokenVersion === 2) return
    setTokenVersion(2)
    renderResourceView(handle, includeDuplicates, tokenVariant, 2)
    refreshSnapshot(handle)
  }

  /** 卸载专属 Root，观察样式资源与静态节点的保留边界。 */
  function unmountFixture(): void {
    const handle = fixtureRef.current
    if (!handle?.root) return
    const root = handle.root
    handle.root = null
    root.unmount()
    handle.phase = 'unmounted'
    refreshSnapshot(handle)
  }

  /** 重建独立 Document，并恢复初始目录视图。 */
  function resetFixture(): void {
    const previousHandle = fixtureRef.current
    if (previousHandle) releaseStylesheetFixture(previousHandle)

    const nextHandle = createStylesheetFixture(refreshSnapshot)
    fixtureRef.current = nextHandle
    setIncludeDuplicates(true)
    setTokenVariant('stable')
    setTokenVersion(1)
    renderFixtureShell(nextHandle)
    refreshSnapshot(nextHandle)
  }

  const phaseLabel =
    snapshot.phase === 'shell'
      ? '目录视图已提交'
      : snapshot.phase === 'waiting'
        ? '等待 stylesheet'
        : snapshot.phase === 'ready'
          ? '依赖视图已提交'
          : 'Root 已卸载'
  const hasResourceOwners = snapshot.phase === 'waiting' || snapshot.phase === 'ready'
  const declaredLinkCount = hasResourceOwners ? (includeDuplicates ? 2 : 1) : 0
  const declaredTokenStyleCount = hasResourceOwners ? (includeDuplicates ? 2 : 1) : 0
  const selectedTokenHref = tokenStyleHrefs[tokenVersion]
  const selectedTokenDomCount = snapshot.tokenResources.filter((item) =>
    item.includes(selectedTokenHref),
  ).length

  return (
    <section className="stylesheet-demo" data-testid="declarative-stylesheet-resources-demo">
      <header className="stylesheet-demo-heading">
        <p>Isolated document fixture</p>
        <h2>样式资源提交观察器</h2>
        <span>资源节点只进入独立 Document，不影响当前学习站样式。</span>
      </header>

      <div className="stylesheet-demo-body">
        <section className="stylesheet-controls" aria-label="样式资源控制">
          <div className="stylesheet-control-heading">
            <div>
              <span>当前阶段</span>
              <strong data-testid="stylesheet-fixture-phase">{phaseLabel}</strong>
            </div>
            <button type="button" className="is-quiet" onClick={resetFixture}>
              重建 Document
            </button>
          </div>

          <div className="stylesheet-actions">
            <button type="button" onClick={startResourceView} disabled={snapshot.phase !== 'shell'}>
              进入依赖视图
            </button>
            <button
              type="button"
              onClick={completeStylesheetLoad}
              disabled={snapshot.phase !== 'waiting'}
            >
              标记 stylesheet 已加载
            </button>
            <button
              type="button"
              className="is-danger"
              onClick={unmountFixture}
              disabled={snapshot.phase === 'unmounted'}
            >
              卸载 Root
            </button>
            <button
              type="button"
              className="is-quiet"
              onClick={attemptSameHrefUpdate}
              disabled={snapshot.phase !== 'ready' || tokenVariant === 'changed'}
            >
              尝试同 href 更新
            </button>
            <button
              type="button"
              className="is-quiet"
              onClick={createNewTokenResource}
              disabled={snapshot.phase !== 'ready' || tokenVersion === 2}
            >
              建立新 href 版本
            </button>
          </div>

          <label className="stylesheet-duplicate-control">
            <input
              type="checkbox"
              checked={includeDuplicates}
              onChange={toggleDuplicates}
              disabled={snapshot.phase === 'unmounted'}
            />
            <span>重复声明同 href 的 link 与 style</span>
          </label>
        </section>

        <section className="stylesheet-observation" aria-label="样式资源观察结果">
          <div className="stylesheet-observation-heading">
            <div>
              <span>独立 Document 快照</span>
              <h3>声明数量与 DOM 资源数量</h3>
            </div>
            <strong className={snapshot.staticMarkerPresent ? 'is-pass' : 'is-fail'}>
              静态标记：{snapshot.staticMarkerPresent ? '保留' : '缺失'}
            </strong>
          </div>

          <div className="stylesheet-counts">
            <div>
              <span>link 声明 / DOM</span>
              <strong data-testid="stylesheet-link-count">
                {declaredLinkCount} / {snapshot.stylesheetCount}
              </strong>
            </div>
            <div>
              <span>重复 style 声明 / 对应 DOM</span>
              <strong data-testid="stylesheet-style-dedupe-count">
                {declaredTokenStyleCount} / {selectedTokenDomCount}
              </strong>
            </div>
            <div>
              <span>全部内联资源</span>
              <strong data-testid="stylesheet-inline-count">{snapshot.inlineStyleCount}</strong>
            </div>
            <div>
              <span>自动 preload</span>
              <strong>{snapshot.preloadCount}</strong>
            </div>
          </div>

          <dl className="stylesheet-commit-state">
            <div>
              <dt>Root 当前文本</dt>
              <dd data-testid="stylesheet-root-text">{snapshot.rootText}</dd>
            </div>
            <div>
              <dt>提交判断</dt>
              <dd>
                {snapshot.phase === 'waiting'
                  ? '加载协调尚未结束，fallback 保持且依赖内容未揭示。'
                  : snapshot.phase === 'ready'
                    ? 'load 事件已解除等待，依赖视图完成提交。'
                    : snapshot.phase === 'unmounted'
                      ? 'Root 内容已清空，资源节点不保证随 owner 删除。'
                      : '尚未请求依赖 stylesheet 的视图。'}
              </dd>
            </div>
            <div>
              <dt>请求的 token 资源</dt>
              <dd>
                {selectedTokenHref} · {tokenVariant === 'stable' ? '初始内容' : '变更内容'}
              </dd>
            </div>
            <div>
              <dt>实际保留的 token 资源</dt>
              <dd data-testid="stylesheet-token-resources">
                {snapshot.tokenResources.length > 0 ? snapshot.tokenResources.join(' | ') : '无'}
              </dd>
            </div>
          </dl>

          <div className="stylesheet-order">
            <span>head 中的资源顺序</span>
            {snapshot.resourceOrder.length > 0 ? (
              <ol data-testid="stylesheet-resource-order">
                {snapshot.resourceOrder.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : (
              <p>尚无带 precedence 的样式资源。</p>
            )}
          </div>
        </section>

        <section className="stylesheet-boundaries" aria-label="观察边界">
          <div>
            <strong>去重身份</strong>
            <span>相同 href 的特殊声明共享一个资源节点。</span>
          </div>
          <div>
            <strong>分组顺序</strong>
            <span>foundation、components、overrides 按首次发现顺序排列，同组资源相邻。</span>
          </div>
          <div>
            <strong>提交协调</strong>
            <span>外链未就绪时保持 fallback，就绪后一次提交依赖视图。</span>
          </div>
        </section>
      </div>
    </section>
  )
}
