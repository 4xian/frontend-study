import './function-components-demo.css'

/** 返回函数组件 Demo 的主标题。 */
function CourseTitle() {
  return (
    <header className="function-components-title">
      <p>React function component</p>
      <h3>函数组件</h3>
    </header>
  )
}

/** 使用箭头函数返回一条可重复使用的课程提示。 */
const LessonNote = () => {
  return (
    <section className="function-components-result" data-testid="function-components-result">
      <strong>先阅读定义，再核对 JSX 使用位置</strong>
      <span>这个界面由同一个箭头函数组件返回。</span>
    </section>
  )
}

/** 明确返回 null，表示当前组件不产生可见内容。 */
function HiddenNotice() {
  return null
}

/** 展示函数声明、箭头函数、重复使用、顶层定义与 null 返回。 */
export default function FunctionComponentsDemo() {
  return (
    <article className="function-components-demo" data-testid="function-components-demo">
      <CourseTitle />

      <div className="function-components-compare" aria-label="相同函数组件的两次使用">
        <LessonNote />
        <LessonNote />
      </div>

      <dl className="function-components-facts">
        <div>
          <dt>定义语法</dt>
          <dd>普通 JavaScript 函数</dd>
        </div>
        <div>
          <dt>组件名称</dt>
          <dd>大写开头，使用 PascalCase</dd>
        </div>
        <div>
          <dt>使用方式</dt>
          <dd>写成 JSX tag，由 React 调用</dd>
        </div>
        <div>
          <dt>定义位置</dt>
          <dd>模块顶层，不嵌套在其他组件中</dd>
        </div>
      </dl>

      <section className="function-components-null-check" aria-label="null 返回结果">
        <p>HiddenNotice 输出区域</p>
        <div
          className="function-components-null-output"
          data-testid="function-components-null-output"
        >
          <HiddenNotice />
        </div>
        <strong data-testid="function-components-null-result">无可见内容</strong>
      </section>
    </article>
  )
}
