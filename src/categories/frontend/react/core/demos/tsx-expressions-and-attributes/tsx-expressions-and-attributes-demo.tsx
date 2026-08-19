import './tsx-expressions-and-attributes-demo.css'

const course = {
  level: '基础',
  pendingCount: 0,
  title: 'TSX 表达式与属性',
}

/** 把课程标题转换为可直接显示的字符串。 */
function formatCourseTitle(title: string): string {
  return title.toUpperCase()
}

/** 展示动态值、Boolean attribute 与常见 empty child。 */
export default function TsxExpressionsAndAttributesDemo() {
  return (
    <article className="react-tsx-expression-card" data-testid="react-tsx-expression-demo">
      <header>
        <p>{course.level}课程</p>
        <h3>{course.title}</h3>
        <output aria-label="待处理数量">待处理 {course.pendingCount} 项</output>
      </header>

      <dl>
        <div>
          <dt>静态字符串</dt>
          <dd data-testid="react-static-title" title="{course.title}">
            引号内的 {'{course.title}'} 不会求值
          </dd>
        </div>
        <div>
          <dt>动态 attribute</dt>
          <dd data-testid="react-dynamic-title" title={course.title}>
            花括号读取变量：{course.title}
          </dd>
        </div>
        <div>
          <dt>函数调用结果</dt>
          <dd data-testid="react-function-result">{formatCourseTitle(course.title)}</dd>
        </div>
        <div>
          <dt>数值 child</dt>
          <dd data-testid="react-number-child">待处理：[{course.pendingCount}]</dd>
        </div>
        <div>
          <dt>空 child</dt>
          <dd data-testid="react-empty-children">
            true[{true}] false[{false}] null[{null}] undefined[{undefined}]
          </dd>
        </div>
      </dl>

      <div className="react-tsx-expression-actions" aria-label="Boolean attribute 对照">
        <button type="button" disabled>
          disabled 简写
        </button>
        <button type="button" disabled={true}>
          显式 true
        </button>
        <button type="button" disabled={false}>
          显式 false
        </button>
      </div>
    </article>
  )
}
