import './props-demo.css'

type Lesson = {
  readonly title: string
  readonly minutes: number
}

type LessonCardProps = {
  courseCode: string
  lesson: Lesson
  level?: '基础' | '进阶'
  topics: readonly string[]
  formatMinutes: (minutes: number) => string
}

/** 把分钟数格式化为课程时长文本。 */
function formatMinutes(minutes: number) {
  return `${minutes} 分钟`
}

/** 只读取父组件提供的 Props，并计算当前课程卡片。 */
function LessonCard({
  courseCode,
  lesson,
  level = '基础',
  topics,
  formatMinutes,
}: LessonCardProps) {
  const displayTitle = lesson.title.toUpperCase()

  return (
    <article
      className="props-demo-card"
      data-course-code={courseCode}
      data-testid="props-demo-card"
    >
      <div className="props-demo-card-heading">
        <span>{level}</span>
        <code>{courseCode}</code>
      </div>
      <h3>{displayTitle}</h3>
      <p>{formatMinutes(lesson.minutes)}</p>
      <small>{topics.join(' / ')}</small>
    </article>
  )
}

/** 完整转发同一份 Props 合同，不在封装层消费字段。 */
function LessonCardFrame(props: LessonCardProps) {
  return <LessonCard {...props} />
}

const advancedCardProps: LessonCardProps = {
  courseCode: 'REACT-P02',
  lesson: { title: 'Props 进阶边界', minutes: 35 },
  level: '进阶',
  topics: ['只读快照', '受控 spread'],
  formatMinutes,
}

/** 展示同一组件接收两组不同 Props，以及可选值的默认行为。 */
export default function PropsDemo() {
  const starterLesson: Lesson = { title: 'Props 基础', minutes: 20 }

  return (
    <section className="props-demo" data-testid="props-demo">
      <header className="props-demo-heading">
        <p>父组件提供输入</p>
        <h2>同一个组件，两组 Props</h2>
      </header>

      <div className="props-demo-flow" aria-label="Props 单向数据流">
        <span>父组件</span>
        <strong aria-hidden="true">→</strong>
        <span>LessonCard</span>
      </div>

      <div className="props-demo-cards">
        <LessonCard
          courseCode="REACT-P01"
          lesson={starterLesson}
          topics={['必填属性', '默认值']}
          formatMinutes={formatMinutes}
        />
        <LessonCardFrame {...advancedCardProps} />
      </div>

      <dl className="props-demo-facts">
        <div>
          <dt>第一张</dt>
          <dd>省略 level，使用默认值“基础”</dd>
        </div>
        <div>
          <dt>第二张</dt>
          <dd>薄封装通过 spread 完整转发同一份合同</dd>
        </div>
        <div>
          <dt>对象输入</dt>
          <dd>组件读取 lesson，不修改父组件拥有的数据</dd>
        </div>
      </dl>
    </section>
  )
}
