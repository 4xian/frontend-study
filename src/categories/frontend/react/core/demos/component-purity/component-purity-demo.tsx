import './component-purity-demo.css'

type Course = Readonly<{
  id: string
  title: string
  published: boolean
}>

type CalculationResult = Readonly<{
  visibleTitles: readonly string[]
  summary: string
}>

type ResultCardProps = {
  label: string
  result: CalculationResult
}

type CheckRowProps = {
  label: string
  value: string
  passed: boolean
}

const courses: readonly Course[] = [
  { id: 'tsx', title: 'TSX 标记语法', published: true },
  { id: 'props', title: 'Props', published: true },
  { id: 'events', title: '事件处理', published: false },
]

/** 把只读课程输入转换成可重复比较的值摘要。 */
function createInputFingerprint(items: readonly Course[]): string {
  return items.map((course) => `${course.id}:${course.title}:${course.published}`).join(' | ')
}

/** 使用本次调用内新建的数组组装课程计算结果。 */
function calculateVisibleCourses(items: readonly Course[]): CalculationResult {
  const visibleTitles: string[] = []

  for (const course of items) {
    if (course.published) {
      visibleTitles.push(course.title)
    }
  }

  return {
    visibleTitles,
    summary: `${visibleTitles.length} / ${items.length} 门课程可见`,
  }
}

/** 展示一次纯计算的值结果和局部数组内容。 */
function ResultCard({ label, result }: ResultCardProps) {
  return (
    <article className="purity-demo-result-card">
      <p>{label}</p>
      <strong>{result.summary}</strong>
      <ul>
        {result.visibleTitles.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
    </article>
  )
}

/** 展示一条可直接观察的纯度检查结果。 */
function CheckRow({ label, value, passed }: CheckRowProps) {
  return (
    <div className="purity-demo-check-row">
      <dt>{label}</dt>
      <dd>
        <strong className={passed ? 'purity-demo-pass' : 'purity-demo-fail'}>
          {passed ? '成立' : '不成立'}
        </strong>
        <span>{value}</span>
      </dd>
    </div>
  )
}

/** 用同一份只读输入重复计算，展示幂等结果与局部修改边界。 */
export default function ComponentPurityDemo() {
  const inputBefore = createInputFingerprint(courses)
  const firstResult = calculateVisibleCourses(courses)
  const secondResult = calculateVisibleCourses(courses)
  const inputAfter = createInputFingerprint(courses)
  const sameValueResult =
    firstResult.summary === secondResult.summary &&
    firstResult.visibleTitles.join('|') === secondResult.visibleTitles.join('|')
  const independentLocalArrays = firstResult.visibleTitles !== secondResult.visibleTitles
  const inputStayedUnchanged = inputBefore === inputAfter

  return (
    <section className="purity-demo" data-testid="component-purity-demo">
      <header className="purity-demo-heading">
        <p>Pure render calculation</p>
        <h2>同一输入可以安全重复计算</h2>
      </header>

      <div className="purity-demo-input">
        <span>只读输入</span>
        <code>{inputBefore}</code>
      </div>

      <div className="purity-demo-results">
        <ResultCard label="第 1 次计算" result={firstResult} />
        <ResultCard label="第 2 次计算" result={secondResult} />
      </div>

      <dl className="purity-demo-checks">
        <CheckRow label="值结果" value="两次摘要和课程顺序一致" passed={sameValueResult} />
        <CheckRow
          label="局部所有权"
          value="每次调用都创建自己的结果数组"
          passed={independentLocalArrays}
        />
        <CheckRow label="输入所有权" value="计算前后的输入指纹一致" passed={inputStayedUnchanged} />
      </dl>

      <div className="purity-demo-boundaries" aria-label="Render 纯度边界">
        <section>
          <strong>可以在 render 中完成</strong>
          <p>读取输入、条件判断、局部数组组装、返回 JSX。</p>
        </section>
        <section>
          <strong>不能在 render 中完成</strong>
          <p>修改输入或共享值、写 DOM、请求网络、读取新的随机值或当前时间。</p>
        </section>
      </div>
    </section>
  )
}
