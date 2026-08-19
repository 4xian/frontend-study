import { Suspense, useCallback, useDeferredValue, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

import { createDeferredResultResource } from './deferred-result-resource'
import type { DeferredResultResource } from './deferred-result-resource'
import './use-deferred-value-stale-content-demo.css'

type DeferredResultsProps = Readonly<{
  query: string
  resource: DeferredResultResource
  onCommit: (query: string) => void
}>

/** 读取 deferred query 的结果，并在真实提交后报告当前 query。 */
function DeferredResults({ query, resource, onCommit }: DeferredResultsProps) {
  const results = resource.read(query)

  /** 只记录已经提交到屏幕的结果 query。 */
  useEffect(() => {
    onCommit(query)
  }, [onCommit, query])

  return (
    <div className="deferred-results-list" data-testid="deferred-results-list">
      <header>
        <span>结果实际读取</span>
        <strong data-testid="result-query">{query || '全部内容'}</strong>
      </header>
      {results.length > 0 ? (
        <ul>
          {results.map((result) => (
            <li key={result.id}>
              <strong>{result.title}</strong>
              <span>{result.summary}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="deferred-results-empty">当前本地目录没有匹配结果。</p>
      )}
    </div>
  )
}

type DeferredValueExperimentProps = Readonly<{
  onRebuild: () => void
}>

/** 演示最新输入、deferred query、陈旧结果与最终提交之间的关系。 */
function DeferredValueExperiment({ onRebuild }: DeferredValueExperimentProps) {
  const [query, setQuery] = useState('react')
  const deferredQuery = useDeferredValue(query)
  const [committedQuery, setCommittedQuery] = useState('react')
  const [resource] = useState(() => createDeferredResultResource('react'))
  const isStale = query !== deferredQuery

  /** 更新受控 input 的紧急 State，不把输入本身延迟。 */
  function updateQuery(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value)
  }

  /** 用固定目标快速建立可重复的 stale 场景。 */
  function selectPreset(nextQuery: string): void {
    setQuery(nextQuery)
  }

  /** 推进最新输入对应的本地结果，允许后台 render 完成。 */
  function releaseCurrentResult(): void {
    resource.release(query)
  }

  /** 记录结果子树最近一次真正提交的 query。 */
  const recordCommittedQuery = useCallback((nextQuery: string): void => {
    setCommittedQuery(nextQuery)
  }, [])

  const canRelease = isStale && !resource.isReady(query)

  return (
    <section className="deferred-value-experiment">
      <div className="deferred-value-controls" aria-label="陈旧内容控制">
        <label>
          <span>最新搜索词</span>
          <input
            type="text"
            value={query}
            onChange={updateQuery}
            data-testid="latest-query-input"
          />
        </label>
        <div className="deferred-value-actions">
          <button type="button" onClick={() => selectPreset('hooks')}>
            输入 hooks
          </button>
          <button type="button" className="is-secondary" onClick={() => selectPreset('suspense')}>
            输入 suspense
          </button>
          <button
            type="button"
            className="is-release"
            onClick={releaseCurrentResult}
            disabled={!canRelease}
          >
            推进当前结果
          </button>
          <button type="button" className="is-quiet" onClick={onRebuild}>
            重建实验
          </button>
        </div>
      </div>

      <div className="deferred-value-status" aria-live="polite">
        <div>
          <span>最新 query</span>
          <strong data-testid="latest-query">{query || '空字符串'}</strong>
        </div>
        <div>
          <span>deferred query</span>
          <strong data-testid="deferred-query">{deferredQuery || '空字符串'}</strong>
        </div>
        <div className={isStale ? 'is-stale' : 'is-synced'}>
          <span>结果状态</span>
          <strong data-testid="stale-state">
            {isStale ? '结果正在追上最新输入' : '结果已同步'}
          </strong>
        </div>
        <div>
          <span>最近 Effect commit</span>
          <strong data-testid="committed-query">{committedQuery}</strong>
        </div>
      </div>

      <section
        className={isStale ? 'deferred-results-panel is-stale' : 'deferred-results-panel'}
        aria-labelledby="deferred-results-title"
        data-testid="deferred-results-panel"
      >
        <header className="deferred-results-heading">
          <div>
            <span>已提交结果</span>
            <h3 id="deferred-results-title">课程目录</h3>
          </div>
          <output>{isStale ? '旧结果保持可见' : '显示最新结果'}</output>
        </header>
        <Suspense
          fallback={
            <p className="deferred-results-fallback" data-testid="results-fallback">
              首次结果正在准备
            </p>
          }
        >
          <DeferredResults
            query={deferredQuery}
            resource={resource}
            onCommit={recordCommittedQuery}
          />
        </Suspense>
      </section>
    </section>
  )
}

/** 提供可重建的实验边界，让实例级结果资源和界面状态一起复位。 */
export default function UseDeferredValueStaleContentDemo() {
  const [experimentVersion, setExperimentVersion] = useState(1)

  /** 通过更换 key 创建全新的陈旧内容实验。 */
  function rebuildExperiment(): void {
    setExperimentVersion((version) => version + 1)
  }

  return (
    <section
      className="use-deferred-value-stale-content-demo"
      data-testid="use-deferred-value-stale-content-demo"
    >
      <header className="deferred-value-heading">
        <p>Deferred value</p>
        <h2>输入立即更新，结果在准备好后追上</h2>
        <span>最新值驱动输入；deferred 值只交给允许暂时落后的结果区。</span>
      </header>

      <DeferredValueExperiment key={experimentVersion} onRebuild={rebuildExperiment} />
    </section>
  )
}
