import {
  Activity,
  Suspense,
  use,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import type { ChangeEvent } from 'react'

import {
  getSearchRecord,
  getSearchPromise,
  prepareDetailTransition,
  prepareSearchResource,
  resetConcurrentSearchResources,
  resolveDetailTransition,
  resolveSearchResource,
} from './concurrent-search-resource'
import type { SearchRecord } from './concurrent-search-resource'
import './lab-concurrent-search-workspace-demo.css'

type SearchRequest = Readonly<{
  id: string
  query: string
}>

type DetailWorkspaceProps = Readonly<{
  record: SearchRecord
  onEffectEvent: (message: string) => void
}>

const initialDetail = getSearchRecord('render-priority')!

let nextDomIdentity = 1
const domIdentities = new WeakMap<HTMLElement, string>()

/** 返回一个 DOM 节点在当前页面中的稳定实验身份。 */
function getDomIdentity(node: HTMLElement): string {
  const existing = domIdentities.get(node)
  if (existing) return existing

  const identity = `detail-dom-${nextDomIdentity}`
  nextDomIdentity += 1
  domIdentities.set(node, identity)
  return identity
}

/** 在 Activity 内保留本地 State、未受控草稿和真实 DOM 节点。 */
function DetailWorkspace({ record, onEffectEvent }: DetailWorkspaceProps) {
  const [inspectionCount, setInspectionCount] = useState(0)
  const [domIdentity, setDomIdentity] = useState('等待节点')

  useEffect(() => {
    onEffectEvent('Effect setup：详情工作区已建立同步')
    return () => onEffectEvent('Effect cleanup：详情工作区已暂停同步')
  }, [onEffectEvent])

  /** 记录同一宿主节点的身份，显隐切换不会重新分配该值。 */
  const assignArticleRef = useCallback((node: HTMLElement | null): void => {
    if (node) setDomIdentity(getDomIdentity(node))
  }, [])

  /** 增加内部计数，观察 Activity 恢复后的 State 是否仍在。 */
  function inspectOnce(): void {
    setInspectionCount((count) => count + 1)
  }

  return (
    <article
      ref={assignArticleRef}
      className="concurrent-detail-card"
      data-testid="concurrent-detail"
      data-dom-identity={domIdentity}
    >
      <header className="concurrent-detail-heading">
        <div>
          <span>当前详情</span>
          <h3>{record.title}</h3>
        </div>
        <output>{record.tags.join(' / ')}</output>
      </header>
      <p>{record.summary}</p>
      <div className="concurrent-detail-metrics">
        <div>
          <span>内部 State</span>
          <strong data-testid="detail-inspection-count">{inspectionCount} 次检查</strong>
        </div>
        <div>
          <span>DOM 身份</span>
          <strong data-testid="detail-dom-identity">{domIdentity}</strong>
        </div>
      </div>
      <label className="concurrent-detail-draft">
        <span>未受控草稿</span>
        <textarea
          defaultValue="这段文字由 DOM 自己保留，Activity 隐藏时不会被清空。"
          data-testid="detail-draft"
          rows={4}
        />
      </label>
      <button type="button" className="is-detail" onClick={inspectOnce}>
        记录一次详情检查
      </button>
    </article>
  )
}

type SearchResultsProps = Readonly<{
  request: SearchRequest
  onSelect: (record: SearchRecord) => void
  isSelectionPending: boolean
}>

/** 在 render 阶段读取稳定 Promise，未完成时把结果交给 Suspense fallback。 */
function SearchResults({ request, onSelect, isSelectionPending }: SearchResultsProps) {
  const records = use(getSearchPromise(request.id))

  return (
    <div className="concurrent-results-list" data-testid="concurrent-results-list">
      {records.length > 0 ? (
        <ul>
          {records.map((record) => (
            <li key={record.id}>
              <button type="button" disabled={isSelectionPending} onClick={() => onSelect(record)}>
                <strong>{record.title}</strong>
                <span>{record.summary}</span>
                <small>{record.tags.join(' / ')}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concurrent-results-empty">没有匹配的本地条目，请换一个搜索词。</p>
      )}
    </div>
  )
}

type SearchWorkspaceProps = Readonly<{
  onRebuild: () => void
}>

/** 组合输入、deferred 结果、Transition 详情选择和 Activity 隐藏恢复。 */
function SearchWorkspace({ onRebuild }: SearchWorkspaceProps) {
  const [query, setQuery] = useState('suspense')
  const [requestSequence, setRequestSequence] = useState(0)
  const [requestedRequest, setRequestedRequest] = useState<SearchRequest | null>(null)
  const [hasVisibleResults, setHasVisibleResults] = useState(false)
  const [releasedRequests, setReleasedRequests] = useState<ReadonlySet<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState(initialDetail.id)
  const [isDetailVisible, setIsDetailVisible] = useState(true)
  const [pendingDetailId, setPendingDetailId] = useState<string | null>(null)
  const [effectEvents, setEffectEvents] = useState<readonly string[]>([])
  const [domSnapshot, setDomSnapshot] = useState('尚未检查')
  const [isPending, startTransition] = useTransition()
  const activeDetailTransition = useRef<string | null>(null)
  const detailTransitionSequence = useRef(0)

  const deferredRequest = useDeferredValue(requestedRequest)
  const resultRequest = hasVisibleResults && deferredRequest ? deferredRequest : requestedRequest
  const isStale = Boolean(
    requestedRequest && deferredRequest && requestedRequest.id !== deferredRequest.id,
  )

  /** 同步更新受控输入，结果查询只在提交按钮中创建新请求。 */
  function updateQuery(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value)
  }

  /** 为当前输入创建新资源并启动一次搜索；资源本身仍由手动 gate 控制。 */
  function submitSearch(): void {
    const nextSequence = requestSequence + 1
    const nextRequest = {
      id: `search-${nextSequence}`,
      query: query.trim(),
    } satisfies SearchRequest
    prepareSearchResource(nextRequest.id, nextRequest.query)
    setRequestSequence(nextSequence)
    setRequestedRequest(nextRequest)
  }

  /** 兑现最新搜索资源，让首次 fallback 或 stale 结果进入下一次 render。 */
  function releaseSearch(): void {
    if (!requestedRequest) return
    resolveSearchResource(requestedRequest.id)
    setReleasedRequests((requests) => {
      const nextRequests = new Set(requests)
      nextRequests.add(requestedRequest.id)
      return nextRequests
    })
    if (!hasVisibleResults) setHasVisibleResults(true)
  }

  /** 记录 Activity 后代 Effect 的建立与清理事件。 */
  const recordEffectEvent = useCallback((message: string): void => {
    setEffectEvents((events) => [...events.slice(-3), message])
  }, [])

  /** 创建详情异步 Action，await 后再次包裹最终 State 更新。 */
  function selectDetail(record: SearchRecord): void {
    if (isPending || record.id === selectedId) return
    detailTransitionSequence.current += 1
    const transitionId = `detail-${detailTransitionSequence.current}`
    const transitionPromise = prepareDetailTransition(transitionId)
    activeDetailTransition.current = transitionId
    setPendingDetailId(record.id)

    startTransition(async () => {
      await transitionPromise
      startTransition(() => {
        setSelectedId(record.id)
        setPendingDetailId(null)
        activeDetailTransition.current = null
      })
    })
  }

  /** 兑现当前详情 gate，使异步 Action 进入最终提交阶段。 */
  function releaseDetail(): void {
    if (activeDetailTransition.current) {
      resolveDetailTransition(activeDetailTransition.current)
    }
  }

  /** 切换 Activity 模式，保留详情子树的 State 与 DOM。 */
  function toggleDetail(): void {
    setIsDetailVisible((visible) => !visible)
  }

  /** 读取真实 DOM 快照，确认 hidden display、节点身份和未受控值。 */
  function inspectDom(): void {
    const node = document.querySelector<HTMLElement>('[data-testid="concurrent-detail"]')
    const draft = node?.querySelector<HTMLTextAreaElement>('[data-testid="detail-draft"]')
    const display = node ? getComputedStyle(node).display : '不存在'
    setDomSnapshot(
      node
        ? `connected=${String(node.isConnected)}；display=${display}；identity=${node.dataset.domIdentity ?? '未知'}；draft=${draft?.value ?? '未知'}`
        : '详情节点不存在',
    )
  }

  const selectedRecord = getSearchRecord(selectedId) ?? initialDetail
  const canReleaseSearch = Boolean(requestedRequest && !releasedRequests.has(requestedRequest.id))
  const canReleaseDetail = Boolean(isPending && pendingDetailId)

  return (
    <section className="concurrent-search-workspace" data-testid="concurrent-search-workspace">
      <div className="concurrent-search-controls" aria-label="并发搜索控制">
        <label>
          <span>搜索词</span>
          <input
            type="search"
            value={query}
            onChange={updateQuery}
            data-testid="concurrent-query-input"
          />
        </label>
        <button type="button" onClick={submitSearch}>
          执行搜索
        </button>
        <button
          type="button"
          className="is-release"
          onClick={releaseSearch}
          disabled={!canReleaseSearch}
        >
          放行最新搜索
        </button>
        <button type="button" className="is-quiet" onClick={onRebuild}>
          重建实验
        </button>
      </div>

      <div className="concurrent-search-status" aria-live="polite">
        <div>
          <span>最新输入</span>
          <strong data-testid="concurrent-latest-query">{query || '空字符串'}</strong>
        </div>
        <div>
          <span>结果查询</span>
          <strong data-testid="concurrent-result-query">
            {resultRequest?.query || '尚未搜索'}
          </strong>
        </div>
        <div className={isStale ? 'is-stale' : 'is-synced'}>
          <span>结果状态</span>
          <strong data-testid="concurrent-stale-state">
            {isStale ? 'stale：旧结果仍在显示' : '已同步'}
          </strong>
        </div>
        <div>
          <span>Transition</span>
          <strong data-testid="concurrent-transition-state">
            {isPending ? 'pending：详情等待放行' : 'idle'}
          </strong>
        </div>
      </div>

      <div className="concurrent-search-main">
        <section
          className={isStale ? 'concurrent-results-panel is-stale' : 'concurrent-results-panel'}
        >
          <header className="concurrent-results-heading">
            <div>
              <span>搜索结果</span>
              <h3>本地知识索引</h3>
            </div>
            <output>{isStale ? '保留旧结果' : '显示当前结果'}</output>
          </header>
          {!resultRequest ? (
            <p className="concurrent-results-empty">
              输入关键词后执行搜索，首次结果会进入 Suspense 等待。
            </p>
          ) : (
            <Suspense
              fallback={
                <p className="concurrent-results-fallback" data-testid="concurrent-search-fallback">
                  首次搜索正在准备结果，控制区仍可操作。
                </p>
              }
            >
              <SearchResults
                request={resultRequest}
                onSelect={selectDetail}
                isSelectionPending={isPending}
              />
            </Suspense>
          )}
        </section>

        <aside className="concurrent-detail-area">
          <header className="concurrent-detail-toolbar">
            <div>
              <span>详情工作区</span>
              <strong>{isDetailVisible ? 'visible' : 'hidden'}</strong>
            </div>
            <button
              type="button"
              className="is-detail"
              aria-expanded={isDetailVisible}
              onClick={toggleDetail}
            >
              {isDetailVisible ? '隐藏详情' : '显示详情'}
            </button>
          </header>
          <p className="concurrent-detail-note">
            {pendingDetailId
              ? `正在准备“${getSearchRecord(pendingDetailId)?.title ?? '新详情'}”，旧详情保持可见。`
              : '选择结果后，详情通过异步 Transition 提交。'}
          </p>
          <button
            type="button"
            className="is-release"
            onClick={releaseDetail}
            disabled={!canReleaseDetail}
          >
            放行详情选择
          </button>
          <Activity mode={isDetailVisible ? 'visible' : 'hidden'} name="并发搜索详情">
            <DetailWorkspace record={selectedRecord} onEffectEvent={recordEffectEvent} />
          </Activity>
        </aside>
      </div>

      <div className="concurrent-search-observations">
        <section>
          <header>
            <span>Activity Effect 日志</span>
            <strong>{effectEvents.length} 条</strong>
          </header>
          <ol data-testid="concurrent-effect-events">
            {effectEvents.length > 0 ? (
              effectEvents.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)
            ) : (
              <li>等待详情工作区建立 Effect。</li>
            )}
          </ol>
        </section>
        <section>
          <header>
            <span>DOM 检查</span>
            <button type="button" className="is-quiet" onClick={inspectDom}>
              检查详情 DOM
            </button>
          </header>
          <p data-testid="concurrent-dom-snapshot">{domSnapshot}</p>
        </section>
      </div>
    </section>
  )
}

/** 提供完整冷启动路径，让资源、State 与 DOM 一起重新建立。 */
export default function LabConcurrentSearchWorkspaceDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 路由离开时清理模块级 gate，保证再次进入仍从冷启动开始。 */
  useEffect(() => {
    return () => resetConcurrentSearchResources()
  }, [])

  /** 清理手动 gate，并通过 key 重建整个实验实例。 */
  function rebuildExperiment(): void {
    resetConcurrentSearchResources()
    setExperimentVersion((version) => version + 1)
  }

  return (
    <section
      className="lab-concurrent-search-workspace-demo"
      data-testid="lab-concurrent-search-workspace-demo"
    >
      <header className="concurrent-search-heading">
        <p>Concurrent search</p>
        <h2>输入、结果和详情各自保持可响应</h2>
        <span>首次结果等待 Suspense；新查询保留 deferred 旧结果；详情选择由 Transition 放行。</span>
      </header>
      <SearchWorkspace key={experimentVersion} onRebuild={rebuildExperiment} />
    </section>
  )
}
