import { CourseHeader } from './course-header'
import { courseMeta } from './course-meta'
import DraftLesson from './draft-lesson'
import PublishedLesson from './published-lesson'
import './module-boundaries-and-component-tree-demo.css'

const showDraft = false

/** 对照静态 JavaScript 模块依赖与本次 React render tree。 */
export default function ModuleBoundariesAndComponentTreeDemo() {
  const activeLesson = showDraft ? <DraftLesson /> : <PublishedLesson />

  return (
    <article className="module-tree-demo" data-testid="module-tree-demo">
      <CourseHeader />

      <p className="module-tree-status">
        {courseMeta.title}：{courseMeta.status}
      </p>

      {activeLesson}

      <div className="module-tree-compare">
        <section className="module-tree-panel" aria-labelledby="dependency-tree-title">
          <h4 id="dependency-tree-title">JavaScript module dependency tree</h4>
          <ul data-testid="module-dependency-tree">
            <li>
              <strong>Demo root module</strong>
              <ul>
                <li>course-header.tsx</li>
                <li>course-meta.ts</li>
                <li>draft-lesson.tsx</li>
                <li>published-lesson.tsx</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="module-tree-panel" aria-labelledby="render-tree-title">
          <h4 id="render-tree-title">Current React render tree</h4>
          <ul data-testid="react-render-tree">
            <li>
              <strong>ModuleBoundariesAndComponentTreeDemo</strong>
              <ul>
                <li>CourseHeader</li>
                <li>PublishedLesson</li>
              </ul>
            </li>
          </ul>
        </section>
      </div>

      <p className="module-tree-conclusion" data-testid="module-tree-conclusion">
        DraftLesson 已被静态 import，但固定分支没有渲染它，所以它只出现在左侧依赖树。
      </p>
    </article>
  )
}
