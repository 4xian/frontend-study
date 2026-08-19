import type { ReactNode } from 'react'
import './conditional-rendering-demo.css'

type CourseState =
  { kind: 'ready'; title: string; duration: number } | { kind: 'maintenance'; reason: string }

type CourseStateCardProps = {
  state: CourseState
}

type ChoiceLineProps = {
  label: string
  children: ReactNode
}

type InternalNoteProps = {
  visible: boolean
}

/** 使用可辨识联合与提前返回展示完整的课程状态分支。 */
function CourseStateCard({ state }: CourseStateCardProps) {
  if (state.kind === 'maintenance') {
    return (
      <article className="conditional-demo-card conditional-demo-card-warning">
        <p className="conditional-demo-card-label">if / early return</p>
        <h3>课程维护中</h3>
        <p>{state.reason}</p>
      </article>
    )
  }

  return (
    <article className="conditional-demo-card conditional-demo-card-ready">
      <p className="conditional-demo-card-label">if / default return</p>
      <h3>{state.title}</h3>
      <p>{state.duration} 分钟 · 可以开始学习</p>
    </article>
  )
}

/** 为一个条件表达式提供稳定的标签与结果区域。 */
function ChoiceLine({ label, children }: ChoiceLineProps) {
  return (
    <div className="conditional-demo-choice">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** 在不可见时明确返回 null。 */
function InternalNote({ visible }: InternalNoteProps) {
  if (!visible) {
    return null
  }

  return (
    <p className="conditional-demo-internal" data-testid="conditional-internal-note">
      内部提示
    </p>
  )
}

/** 并排展示条件分支、三元表达式、逻辑与和空结果。 */
export default function ConditionalRenderingDemo() {
  const readyCourse: CourseState = { kind: 'ready', title: '条件渲染', duration: 70 }
  const maintenanceCourse: CourseState = { kind: 'maintenance', reason: '预计 18:00 恢复' }
  const messageCount = 0
  const canContinue = true
  const showInternalNote = false
  let progressContent: ReactNode = <span>先完成基础练习</span>

  if (canContinue) {
    progressContent = <strong>可以继续阅读</strong>
  }

  return (
    <section className="conditional-demo" data-testid="conditional-rendering-demo">
      <header className="conditional-demo-heading">
        <p>Branch selection</p>
        <h2>同一组输入，不同的 ReactNode 结果</h2>
      </header>

      <div className="conditional-demo-cards">
        <CourseStateCard state={readyCourse} />
        <CourseStateCard state={maintenanceCourse} />
      </div>

      <dl className="conditional-demo-choices">
        <ChoiceLine label="三元表达式">
          <strong data-testid="conditional-ternary-result">
            {canContinue ? '可以继续' : '先回顾示例'}
          </strong>
        </ChoiceLine>
        <ChoiceLine label="条件变量">
          <span data-testid="conditional-variable-result">{progressContent}</span>
        </ChoiceLine>
        <ChoiceLine label="count && node">
          <span data-testid="conditional-unsafe-zero">
            {messageCount && <strong>有新消息</strong>}
          </span>
        </ChoiceLine>
        <ChoiceLine label="count > 0 && node">
          <span data-testid="conditional-safe-zero">
            {messageCount > 0 && <strong>有新消息</strong>}
          </span>
        </ChoiceLine>
        <ChoiceLine label="return null">
          <span data-testid="conditional-null-result">
            <InternalNote visible={showInternalNote} />
          </span>
        </ChoiceLine>
      </dl>

      <p className="conditional-demo-note">
        数字 0 会显示；明确比较产生 false，false 与 null 都不会生成可见内容。
      </p>
    </section>
  )
}
