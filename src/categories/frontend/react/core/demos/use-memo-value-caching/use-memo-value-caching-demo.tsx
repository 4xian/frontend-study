import { useEffect, useMemo, useRef, useState } from 'react'
import './use-memo-value-caching-demo.css'

type Workload = 1 | 2 | 3

type CachedResult = Readonly<{
  query: string
  workload: Workload
  matches: number
  checksum: number
}>

const workloadLabels: Record<Workload, string> = {
  1: '轻负载',
  2: '中负载',
  3: '重负载',
}

const sampleTerms = ['react', 'state', 'effect'] as const

const records = Array.from({ length: 160 }, (_, index) => ({
  title: `${sampleTerms[index % sampleTerms.length]} 课程条目 ${index + 1}`,
  score: (index * 17) % 100,
}))

/** 执行确定性的同步计算，让缓存命中和失效都能被观察。 */
function calculateReport(query: string, workload: Workload): CachedResult {
  const normalizedQuery = query.trim().toLowerCase()
  const matches = records.filter((record) => record.title.includes(normalizedQuery)).length
  let checksum = matches + workload
  const iterations = workload * 180_000

  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + (((index + matches) * 23) % 127)) % 100_003
  }

  return { query, workload, matches, checksum }
}

/** 格式化缓存结果，保持展示内容与计算逻辑分离。 */
function formatResult(result: CachedResult): string {
  return `${result.matches} 项匹配，校验值 ${result.checksum}`
}

type CalculationPanelProps = Readonly<{
  result: CachedResult
}>

type CachedCalculationPanelProps = Readonly<{
  result: CachedResult
  generation: number
  identityPreserved: boolean | null
  observation: string
}>

/** 显示直接计算分支的当前结果。 */
function DirectCalculationPanel({ result }: CalculationPanelProps) {
  return (
    <article className="use-memo-demo-panel is-direct" data-testid="direct-panel">
      <span>直接计算</span>
      <strong>{formatResult(result)}</strong>
      <p>每次父组件 render 都重新执行同一计算。</p>
    </article>
  )
}

/** 显示 useMemo 分支的结果、身份比较和已提交缓存版本数。 */
function CachedCalculationPanel({
  result,
  generation,
  identityPreserved,
  observation,
}: CachedCalculationPanelProps) {
  return (
    <article className="use-memo-demo-panel is-cached" data-testid="cached-panel">
      <span>useMemo 缓存</span>
      <strong>{formatResult(result)}</strong>
      <p>依赖未变时返回同一个结果引用，依赖变化时生成新结果。</p>
      <dl className="use-memo-demo-details">
        <div>
          <dt>缓存生成</dt>
          <dd data-testid="memo-generation-count">{generation} 次</dd>
        </div>
        <div>
          <dt>最近身份</dt>
          <dd data-testid="memo-identity-status">
            {identityPreserved === null
              ? '首次结果'
              : identityPreserved
                ? 'Object.is 相同'
                : 'Object.is 不同'}
          </dd>
        </div>
      </dl>
      <output className="use-memo-demo-observation" data-testid="memo-observation">
        {observation}
      </output>
    </article>
  )
}

/** 对照无关更新和依赖变化对 useMemo 值缓存的影响。 */
export default function UseMemoValueCachingDemo() {
  const [parentRevision, setParentRevision] = useState(0)
  const [query, setQuery] = useState<(typeof sampleTerms)[number]>('react')
  const [workload, setWorkload] = useState<Workload>(1)
  const [observation, setObservation] = useState('先触发一次无关更新，观察缓存是否复用。')
  const [generation, setGeneration] = useState(0)
  const beforeUpdateRef = useRef<CachedResult | null>(null)
  const committedResultRef = useRef<CachedResult | null>(null)
  const directResult = calculateReport(query, workload)
  const cachedResult = useMemo(() => calculateReport(query, workload), [query, workload])
  const identityPreserved = beforeUpdateRef.current
    ? Object.is(beforeUpdateRef.current, cachedResult)
    : null

  /** 只统计新的缓存结果已经提交到界面的次数，不把开发期额外调用当作业务次数。 */
  useEffect(() => {
    if (committedResultRef.current === cachedResult) return
    committedResultRef.current = cachedResult
    setGeneration((currentGeneration) => currentGeneration + 1)
  }, [cachedResult])

  /** 在更新前保存当前缓存对象，供下一次 render 比较引用身份。 */
  function markBeforeUpdate(message: string) {
    beforeUpdateRef.current = cachedResult
    setObservation(message)
  }

  /** 只改变无关 State，保持 useMemo 的两个依赖不变。 */
  function updateParentOnly() {
    markBeforeUpdate('父组件版本改变，query 和 workload 未变。')
    setParentRevision((currentRevision) => currentRevision + 1)
  }

  /** 切换计算依赖中的关键词，要求缓存生成新的结果。 */
  function updateQuery() {
    const currentIndex = sampleTerms.indexOf(query)
    const nextQuery = sampleTerms[(currentIndex + 1) % sampleTerms.length] ?? sampleTerms[0]
    markBeforeUpdate(`query 从 ${query} 改为 ${nextQuery}，缓存依赖发生变化。`)
    setQuery(nextQuery)
  }

  /** 切换计算规模，观察依赖变化带来的重新计算。 */
  function updateWorkload(nextWorkload: Workload) {
    if (nextWorkload === workload) {
      markBeforeUpdate(`workload 保持${workloadLabels[nextWorkload]}，缓存依赖未变。`)
      return
    }

    markBeforeUpdate(`workload 改为${workloadLabels[nextWorkload]}，缓存依赖发生变化。`)
    setWorkload(nextWorkload)
  }

  /** 恢复初始输入，并用当前结果建立下一次更新的比较基线。 */
  function resetObservation() {
    beforeUpdateRef.current = cachedResult
    setParentRevision(0)
    setQuery('react')
    setWorkload(1)
    setObservation('已恢复初始输入，先触发一次无关更新，观察缓存是否复用。')
  }

  return (
    <section className="use-memo-demo" data-testid="use-memo-value-caching-demo">
      <header className="use-memo-demo-heading">
        <p>Value caching</p>
        <h2>依赖不变时，计算结果可以复用</h2>
        <span>
          父组件版本 <output data-testid="memo-parent-revision">{parentRevision}</output>，关键词{' '}
          <output data-testid="memo-query">{query}</output>，缓存依赖 query / workload
        </span>
      </header>

      <div className="use-memo-demo-controls" aria-label="值缓存观察控制">
        <button type="button" onClick={updateParentOnly}>
          仅更新父组件
        </button>
        <button type="button" onClick={updateQuery}>
          修改关键词
        </button>
        <fieldset>
          <legend>计算规模</legend>
          {([1, 2, 3] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={workload === value}
              onClick={() => updateWorkload(value)}
            >
              {workloadLabels[value]}
            </button>
          ))}
        </fieldset>
        <button type="button" className="is-secondary" onClick={resetObservation}>
          重置观察
        </button>
      </div>

      <p className="use-memo-demo-observation" role="status" aria-live="polite">
        {observation}
      </p>

      <div className="use-memo-demo-stage">
        <DirectCalculationPanel result={directResult} />
        <CachedCalculationPanel
          result={cachedResult}
          generation={generation}
          identityPreserved={identityPreserved}
          observation={observation}
        />
      </div>

      <p className="use-memo-demo-generation" data-testid="memo-generation-summary">
        已提交缓存结果：{generation} 个版本。无关更新不应增加这个数字，依赖变化会生成新版本。
      </p>
    </section>
  )
}
