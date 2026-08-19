import type { ReactNode } from 'react'
import './children-and-composition-demo.css'

type LearningPanelProps = {
  eyebrow: ReactNode
  children: ReactNode
  footer: ReactNode
}

type Lesson = {
  readonly title: string
  readonly minutes: number
}

type LessonPreviewProps = {
  lesson: Lesson
  renderSummary: (lesson: Lesson) => ReactNode
}

/** 组合固定外壳、主要 children 和命名区域。 */
function LearningPanel({ eyebrow, children, footer }: LearningPanelProps) {
  return (
    <article className="children-demo-panel">
      <header className="children-demo-panel-heading">{eyebrow}</header>
      <div className="children-demo-panel-body">{children}</div>
      <footer className="children-demo-panel-footer">{footer}</footer>
    </article>
  )
}

/** 调用 render prop，把课程数据交给调用方决定显示形式。 */
function LessonPreview({ lesson, renderSummary }: LessonPreviewProps) {
  return <div className="children-demo-preview">{renderSummary(lesson)}</div>
}

/** 展示 children、命名区域和 render prop 三种组合接口。 */
export default function ChildrenAndCompositionDemo() {
  const lesson: Lesson = { title: 'children 与组合', minutes: 36 }

  return (
    <section className="children-demo" data-testid="children-composition-demo">
      <header className="children-demo-heading">
        <p>Composition boundary</p>
        <h2>外壳固定，内容由调用方提供</h2>
      </header>

      <div className="children-demo-panels">
        <LearningPanel
          eyebrow={<strong>命名区域：eyebrow</strong>}
          footer={<small>命名区域：footer</small>}
        >
          <h3>默认区域：children</h3>
          <p>调用方决定正文，LearningPanel 只决定内容放在哪里。</p>
        </LearningPanel>

        <LearningPanel
          eyebrow={<strong>函数区域：renderSummary</strong>}
          footer={<small>命名区域：footer</small>}
        >
          <LessonPreview
            lesson={lesson}
            renderSummary={(currentLesson) => (
              <p>
                {currentLesson.title} · {currentLesson.minutes} 分钟
              </p>
            )}
          />
        </LearningPanel>
      </div>
    </section>
  )
}
