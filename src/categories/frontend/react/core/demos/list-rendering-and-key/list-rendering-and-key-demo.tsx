import { Fragment } from 'react'
import './list-rendering-and-key-demo.css'

type Course = {
  id: string
  title: string
  published: boolean
}

type CourseRowProps = {
  courseId: string
  title: string
}

type IdentityItem = {
  id: string
  label: string
}

type IdentityOrderProps = {
  title: string
  items: readonly IdentityItem[]
}

type KeyExample = {
  id: string
  code: string
  description: string
}

type KeyRule = {
  id: string
  name: string
  description: string
}

const courses: readonly Course[] = [
  { id: 'react-conditional', title: '条件渲染', published: false },
  { id: 'react-lists', title: '列表渲染与 key', published: true },
  { id: 'react-props', title: 'Props', published: true },
  { id: 'react-children', title: 'children 与组合', published: true },
]

const initialOrder: readonly IdentityItem[] = [
  { id: 'A', label: '项目 A' },
  { id: 'B', label: '项目 B' },
  { id: 'C', label: '项目 C' },
]

const reorderedItems: readonly IdentityItem[] = [
  { id: 'B', label: '项目 B' },
  { id: 'C', label: '项目 C' },
  { id: 'A', label: '项目 A' },
]

const keyExamples: readonly KeyExample[] = [
  {
    id: 'index',
    code: 'key={index}',
    description: '插入、删除或重排后，同一索引可能改指另一条数据',
  },
  {
    id: 'random',
    code: 'key={Math.random()}',
    description: '每次 render 都产生新值，无法匹配同一数据',
  },
]

const keyRules: readonly KeyRule[] = [
  { id: 'sibling', name: '唯一范围', description: '只在当前父级的兄弟项之间唯一' },
  { id: 'stable', name: '稳定来源', description: '来自数据，并随同一项目保持不变' },
  { id: 'special', name: '特殊字段', description: '不会自动进入普通 prop 或 DOM attribute' },
]

/** 显示一条课程数据，并通过普通 prop 接收业务 ID。 */
function CourseRow({ courseId, title }: CourseRowProps) {
  return (
    <li className="list-key-demo-course" data-course-id={courseId}>
      <strong>{title}</strong>
      <span>{courseId}</span>
    </li>
  )
}

/** 展示同一组数据在指定顺序下的稳定 ID。 */
function IdentityOrder({ title, items }: IdentityOrderProps) {
  return (
    <section className="list-key-demo-order" aria-label={title}>
      <h4>{title}</h4>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.label}</span>
            <code>{item.id}</code>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** 展示 filter、map、稳定 key、重排和显式 Fragment。 */
export default function ListRenderingAndKeyDemo() {
  const publishedCourses = courses.filter((course) => course.published)

  return (
    <section className="list-key-demo" aria-labelledby="list-key-demo-title">
      <header className="list-key-demo-heading">
        <p>数组转换与身份</p>
        <h2 id="list-key-demo-title">从数据得到稳定列表</h2>
      </header>

      <div className="list-key-demo-summary" aria-label="数组转换摘要">
        <div>
          <span>输入数据</span>
          <strong>{courses.map((course) => course.id).join(' → ')}</strong>
        </div>
        <div>
          <span>filter 后结果</span>
          <strong>{publishedCourses.map((course) => course.id).join(' → ')}</strong>
        </div>
      </div>

      <ol className="list-key-demo-courses" aria-label="已发布课程">
        {publishedCourses.map((course) => (
          <CourseRow key={course.id} courseId={course.id} title={course.title} />
        ))}
      </ol>

      <section className="list-key-demo-identity" aria-labelledby="list-key-demo-identity-title">
        <h3 id="list-key-demo-identity-title">重排观察</h3>
        <p>A、B、C 变为 B、C、A 后，同一项目仍显示原来的稳定 ID。</p>
        <div className="list-key-demo-orders">
          <IdentityOrder title="变化前：A、B、C" items={initialOrder} />
          <IdentityOrder title="变化后：B、C、A" items={reorderedItems} />
        </div>
      </section>

      <section className="list-key-demo-examples" aria-labelledby="list-key-demo-examples-title">
        <h3 id="list-key-demo-examples-title">不稳定 key 对照</h3>
        <ul>
          {keyExamples.map((example) => (
            <li key={example.id}>
              <code>{example.code}</code>
              <span>{example.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <dl className="list-key-demo-rules">
        {keyRules.map((rule) => (
          <Fragment key={rule.id}>
            <dt>{rule.name}</dt>
            <dd>{rule.description}</dd>
          </Fragment>
        ))}
      </dl>

      <p className="list-key-demo-note">
        页面显示的业务 ID 来自 courseId；React 使用的 key 不会自动传给组件。
      </p>
    </section>
  )
}
