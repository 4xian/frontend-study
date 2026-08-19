import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import './document-metadata-hoisting-demo.css'

type FixtureRoute = 'catalog' | 'lesson' | 'none'
type FixturePhase = 'committed' | 'unmounted' | 'waiting'

type MetadataValues = Readonly<{
  title: string
  description: string
  canonicalUrl: string
}>

type OwnedMetadataNodes = Readonly<{
  title: HTMLTitleElement | null
  description: HTMLMetaElement | null
  canonical: HTMLLinkElement | null
}>

type MetadataSnapshot = Readonly<{
  phase: FixturePhase
  titleValues: readonly string[]
  descriptionValues: readonly string[]
  canonicalValues: readonly string[]
  localItemValues: readonly string[]
  primaryIdentity: 'baseline' | 'preserved' | 'replaced' | 'absent'
  staticMarkerPresent: boolean
  bodyDocumentMetadataCount: number
  headMarkup: readonly string[]
}>

type FixtureHandle = {
  document: Document
  root: Root | null
  baselineNodes: OwnedMetadataNodes | null
}

type FixtureTreeProps = Readonly<{
  route: FixtureRoute
  includeDuplicate: boolean
  onCommitted: () => void
}>

const routeMetadata: Record<Exclude<FixtureRoute, 'none'>, MetadataValues> = {
  catalog: {
    title: '前端课程目录',
    description: '浏览可学习的前端课程。',
    canonicalUrl: 'https://example.test/catalog',
  },
  lesson: {
    title: '文档元数据提升',
    description: '理解组件声明如何进入文档 head。',
    canonicalUrl: 'https://example.test/lesson/document-metadata',
  },
}

/** 读取指定 owner 对应的三类文档级元数据节点。 */
function readOwnedNodes(document: Document, owner: string): OwnedMetadataNodes {
  return {
    title: document.head.querySelector(`title[data-a20-owned="${owner}"]`),
    description: document.head.querySelector(`meta[name="description"][data-a20-owned="${owner}"]`),
    canonical: document.head.querySelector(`link[rel="canonical"][data-a20-owned="${owner}"]`),
  }
}

/** 判断当前 primary 元数据是否延续首次提交建立的 DOM 节点身份。 */
function readPrimaryIdentity(
  baseline: OwnedMetadataNodes | null,
  current: OwnedMetadataNodes,
): MetadataSnapshot['primaryIdentity'] {
  if (!current.title || !current.description || !current.canonical) return 'absent'
  if (!baseline) return 'baseline'

  return baseline.title === current.title &&
    baseline.description === current.description &&
    baseline.canonical === current.canonical
    ? 'preserved'
    : 'replaced'
}

/** 从隔离文档读取可展示的 head、body 与节点身份快照。 */
function readMetadataSnapshot(handle: FixtureHandle, phase: FixturePhase): MetadataSnapshot {
  const { document } = handle
  const primaryNodes = readOwnedNodes(document, 'primary')
  const primaryIdentity = readPrimaryIdentity(handle.baselineNodes, primaryNodes)

  if (!handle.baselineNodes && primaryIdentity === 'baseline') {
    handle.baselineNodes = primaryNodes
  }

  const ownedHeadNodes = Array.from(document.head.querySelectorAll('[data-a20-owned]'))

  return {
    phase,
    titleValues: Array.from(
      document.head.querySelectorAll<HTMLTitleElement>('title[data-a20-owned]'),
      (node) => node.textContent ?? '',
    ),
    descriptionValues: Array.from(
      document.head.querySelectorAll<HTMLMetaElement>('meta[name="description"][data-a20-owned]'),
      (node) => node.content,
    ),
    canonicalValues: Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"][data-a20-owned]'),
      (node) => node.getAttribute('href') ?? '',
    ),
    localItemValues: Array.from(
      document.body.querySelectorAll<HTMLMetaElement>('meta[itemprop="headline"]'),
      (node) => node.content,
    ),
    primaryIdentity,
    staticMarkerPresent: Boolean(document.head.querySelector('[data-a20-static]')),
    bodyDocumentMetadataCount: document.body.querySelectorAll('[data-a20-owned]').length,
    headMarkup: ownedHeadNodes.map((node) => node.outerHTML),
  }
}

/** 建立不连接真实页面的独立 Document 与专属 React Root。 */
function createMetadataFixture(): FixtureHandle {
  const fixtureDocument = document.implementation.createHTMLDocument()
  const staticMarker = fixtureDocument.createElement('meta')
  staticMarker.name = 'fixture-owner'
  staticMarker.content = 'outside-react'
  staticMarker.dataset.a20Static = 'true'
  fixtureDocument.head.append(staticMarker)

  const container = fixtureDocument.createElement('div')
  container.dataset.fixtureRoot = 'true'
  fixtureDocument.body.append(container)

  return {
    document: fixtureDocument,
    root: createRoot(container),
    baselineNodes: null,
  }
}

/** 释放隔离 React Root，同时保留 Document 供卸载后取样。 */
function unmountMetadataFixture(handle: FixtureHandle): void {
  if (!handle.root) return

  const root = handle.root
  handle.root = null
  root.unmount()
}

/** 声明一组由指定组件拥有的文档级元数据。 */
function PageMetadata({ values, owner }: { values: MetadataValues; owner: string }) {
  return (
    <>
      <title data-a20-owned={owner}>{`${values.title}`}</title>
      <meta data-a20-owned={owner} name="description" content={values.description} />
      <link data-a20-owned={owner} rel="canonical" href={values.canonicalUrl} />
    </>
  )
}

/** 在更深组件中声明相同语义的元数据，用于观察重复而非覆盖。 */
function NestedMetadata({ values }: { values: MetadataValues }) {
  return <PageMetadata values={values} owner="nested" />
}

/** 渲染到隔离 Document，提交后通知宿主读取真实 DOM 快照。 */
function FixtureTree({ route, includeDuplicate, onCommitted }: FixtureTreeProps) {
  const values = route === 'none' ? null : routeMetadata[route]

  useEffect(() => {
    onCommitted()
  }, [includeDuplicate, onCommitted, route])

  return (
    <main data-fixture-content>
      {values ? <PageMetadata values={values} owner="primary" /> : null}
      {values && includeDuplicate ? <NestedMetadata values={values} /> : null}

      <article itemScope data-fixture-article>
        <meta
          itemProp="headline"
          content={values?.title ?? '未选择页面'}
          data-item-metadata="headline"
        />
        <h1>{values?.title ?? '没有文档级元数据'}</h1>
      </article>
    </main>
  )
}

/** 把当前控制状态提交到隔离 Document 的 React Root。 */
function renderMetadataFixture(
  handle: FixtureHandle,
  route: FixtureRoute,
  includeDuplicate: boolean,
  onCommitted: () => void,
): void {
  handle.root?.render(
    <FixtureTree route={route} includeDuplicate={includeDuplicate} onCommitted={onCommitted} />,
  )
}

/** 创建尚未完成 React 提交时的稳定占位快照。 */
function createWaitingSnapshot(): MetadataSnapshot {
  return {
    phase: 'waiting',
    titleValues: [],
    descriptionValues: [],
    canonicalValues: [],
    localItemValues: [],
    primaryIdentity: 'absent',
    staticMarkerPresent: true,
    bodyDocumentMetadataCount: 0,
    headMarkup: [],
  }
}

/** 把数组值格式化为适合紧凑观察面板的文本。 */
function formatValues(values: readonly string[]): string {
  return values.length > 0 ? values.join(' | ') : '无'
}

/** 以隔离文档演示元数据的提升、更新、重复与卸载边界。 */
export default function DocumentMetadataHoistingDemo() {
  const fixtureRef = useRef<FixtureHandle | null>(null)
  const [route, setRoute] = useState<FixtureRoute>('catalog')
  const [includeDuplicate, setIncludeDuplicate] = useState(false)
  const [snapshot, setSnapshot] = useState<MetadataSnapshot>(createWaitingSnapshot)

  /** 在隔离 Root 完成提交后读取对应 Document 的真实节点。 */
  const handleFixtureCommitted = useCallback((): void => {
    const handle = fixtureRef.current
    if (!handle?.root) return
    setSnapshot(readMetadataSnapshot(handle, 'committed'))
  }, [])

  /** 创建初始 fixture，并在 Demo 离开时清理专属 React Root。 */
  useEffect(() => {
    const handle = createMetadataFixture()
    fixtureRef.current = handle
    renderMetadataFixture(handle, route, includeDuplicate, handleFixtureCommitted)

    return () => {
      const currentHandle = fixtureRef.current
      if (currentHandle) unmountMetadataFixture(currentHandle)
      fixtureRef.current = null
    }
  }, [handleFixtureCommitted])

  /** 控制状态变化后只重渲染隔离 Root，不触碰真实课程文档。 */
  useEffect(() => {
    const handle = fixtureRef.current
    if (!handle?.root) return
    renderMetadataFixture(handle, route, includeDuplicate, handleFixtureCommitted)
  }, [handleFixtureCommitted, includeDuplicate, route])

  /** 切换到目录页元数据。 */
  function selectCatalog(): void {
    setRoute('catalog')
  }

  /** 切换到课程页元数据，观察同一节点的属性更新。 */
  function selectLesson(): void {
    setRoute('lesson')
  }

  /** 移除文档级声明，同时保留正文中的 itemProp 元数据。 */
  function removeDocumentMetadata(): void {
    setRoute('none')
  }

  /** 显示或移除深层组件声明的第二套相同元数据。 */
  function toggleDuplicate(): void {
    setIncludeDuplicate(!includeDuplicate)
  }

  /** 卸载 fixture Root，并记录 React-owned head 节点的清理结果。 */
  function unmountFixture(): void {
    const handle = fixtureRef.current
    if (!handle?.root) return
    unmountMetadataFixture(handle)
    setSnapshot(readMetadataSnapshot(handle, 'unmounted'))
  }

  /** 重建独立 Document，使实验恢复到当前控制状态。 */
  function rebuildFixture(): void {
    const previousHandle = fixtureRef.current
    if (previousHandle) unmountMetadataFixture(previousHandle)

    const nextHandle = createMetadataFixture()
    fixtureRef.current = nextHandle
    setSnapshot(createWaitingSnapshot())
    renderMetadataFixture(nextHandle, route, includeDuplicate, handleFixtureCommitted)
  }

  /** 恢复目录页、关闭重复声明并建立全新的隔离 Document。 */
  function resetExperiment(): void {
    const previousHandle = fixtureRef.current
    if (previousHandle) unmountMetadataFixture(previousHandle)

    const nextHandle = createMetadataFixture()
    fixtureRef.current = nextHandle
    setRoute('catalog')
    setIncludeDuplicate(false)
    setSnapshot(createWaitingSnapshot())
    renderMetadataFixture(nextHandle, 'catalog', false, handleFixtureCommitted)
  }

  const fixtureMounted = snapshot.phase !== 'unmounted'
  const phaseLabel =
    snapshot.phase === 'committed'
      ? '已提交'
      : snapshot.phase === 'unmounted'
        ? 'Root 已卸载'
        : '等待提交'
  const identityLabel =
    snapshot.primaryIdentity === 'preserved'
      ? '原节点已更新'
      : snapshot.primaryIdentity === 'baseline'
        ? '已建立基线'
        : snapshot.primaryIdentity === 'replaced'
          ? '节点已重新建立'
          : '当前无主节点'

  return (
    <section className="metadata-demo" data-testid="document-metadata-hoisting-demo">
      <header className="metadata-demo-heading">
        <p>Isolated document fixture</p>
        <h2>组件声明与 document head</h2>
        <span>观察结果来自独立 Document，真实课程页元数据保持不变。</span>
      </header>

      <div className="metadata-demo-body">
        <section className="metadata-controls" aria-label="隔离文档状态">
          <div className="metadata-control-heading">
            <div>
              <span>当前页面状态</span>
              <strong data-testid="metadata-fixture-phase">{phaseLabel}</strong>
            </div>
            <button
              type="button"
              className="is-quiet metadata-rebuild-button"
              aria-label="重建 Document"
              title="重建 Document"
              onClick={rebuildFixture}
            >
              <span aria-hidden="true">&#x21bb;</span>
            </button>
          </div>

          <div className="metadata-segments" aria-label="页面元数据选择">
            <button
              type="button"
              data-action="catalog"
              aria-pressed={route === 'catalog'}
              onClick={selectCatalog}
            >
              目录页
            </button>
            <button
              type="button"
              data-action="lesson"
              aria-pressed={route === 'lesson'}
              onClick={selectLesson}
            >
              课程页
            </button>
            <button
              type="button"
              data-action="none"
              aria-pressed={route === 'none'}
              onClick={removeDocumentMetadata}
            >
              移除文档元数据
            </button>
          </div>

          <div className="metadata-secondary-actions">
            <label>
              <input
                type="checkbox"
                checked={includeDuplicate}
                onChange={toggleDuplicate}
                disabled={!fixtureMounted || route === 'none'}
              />
              <span>嵌套组件声明相同元数据</span>
            </label>
            <button
              type="button"
              className="is-danger"
              data-action="unmount"
              onClick={unmountFixture}
              disabled={!fixtureMounted}
            >
              卸载 Root
            </button>
            <button type="button" className="is-quiet" onClick={resetExperiment}>
              重置实验
            </button>
          </div>
        </section>

        <section className="metadata-counts" aria-label="元数据节点数量" aria-live="polite">
          <div>
            <span>title</span>
            <strong data-testid="metadata-title-count">{snapshot.titleValues.length}</strong>
          </div>
          <div>
            <span>description meta</span>
            <strong data-testid="metadata-description-count">
              {snapshot.descriptionValues.length}
            </strong>
          </div>
          <div>
            <span>canonical link</span>
            <strong data-testid="metadata-canonical-count">
              {snapshot.canonicalValues.length}
            </strong>
          </div>
          <div>
            <span>body itemProp</span>
            <strong data-testid="metadata-item-count">{snapshot.localItemValues.length}</strong>
          </div>
        </section>

        <section className="metadata-observation">
          <div className="metadata-observation-heading">
            <div>
              <span>Committed DOM observation</span>
              <h3>{identityLabel}</h3>
            </div>
            <strong className={snapshot.staticMarkerPresent ? 'is-pass' : 'is-fail'}>
              {snapshot.staticMarkerPresent ? '静态 head 节点保留' : '静态 head 节点缺失'}
            </strong>
          </div>

          <dl className="metadata-values">
            <div>
              <dt>title 文本</dt>
              <dd data-testid="metadata-title-values">{formatValues(snapshot.titleValues)}</dd>
            </div>
            <div>
              <dt>description 内容</dt>
              <dd data-testid="metadata-description-values">
                {formatValues(snapshot.descriptionValues)}
              </dd>
            </div>
            <div>
              <dt>canonical href</dt>
              <dd data-testid="metadata-canonical-values">
                {formatValues(snapshot.canonicalValues)}
              </dd>
            </div>
            <div>
              <dt>body 中文档级元数据节点</dt>
              <dd data-testid="metadata-body-document-count">
                {snapshot.bodyDocumentMetadataCount}
              </dd>
            </div>
          </dl>

          <div className="metadata-markup" data-testid="metadata-head-markup">
            <span>隔离 document.head 中的 React-owned 节点</span>
            {snapshot.headMarkup.length > 0 ? (
              <pre>
                <code>{snapshot.headMarkup.join('\n')}</code>
              </pre>
            ) : (
              <p>当前没有 React-owned 文档级元数据。</p>
            )}
          </div>
        </section>

        <dl className="metadata-boundaries">
          <div>
            <dt>提升结果</dt>
            <dd>文档级 title、meta、link 位于隔离 head，业务容器中数量为 0。</dd>
          </div>
          <div>
            <dt>重复边界</dt>
            <dd>嵌套声明会增加真实节点，不会自动覆盖或合并。</dd>
          </div>
          <div>
            <dt>局部元数据</dt>
            <dd>带 itemProp 的 meta 留在其条目所在的 body 子树。</dd>
          </div>
          <div>
            <dt>所有权清理</dt>
            <dd>卸载 Root 后，React-owned head 与 body 节点一起移除。</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
