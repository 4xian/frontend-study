import { CatalogFrame } from './catalog-frame'
import { courses } from './course-data'
import { CourseList } from './course-list'
import './lab-static-course-catalog-demo.css'

/** 展示当前静态目录实际生成的函数组件树。 */
function ComponentTree() {
  return (
    <section aria-labelledby="static-catalog-tree-title">
      <p className="static-catalog-inspector-eyebrow">Render tree</p>
      <h3 id="static-catalog-tree-title">本次组件树</h3>
      <ul className="static-catalog-tree">
        <li>
          <code>StaticCourseCatalogDemo</code>
          <ul>
            <li>
              <code>CatalogFrame</code>
              <ul>
                <li>
                  <code>CourseList</code>
                  <ul>
                    <li>
                      <code>CourseCard</code>
                      <span>3 个实例</span>
                    </li>
                  </ul>
                </li>
                <li>
                  <code>ComponentTree</code>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
      <p className="static-catalog-inspector-note">函数组件节点，不包含普通 DOM 标签和数据模块。</p>
    </section>
  )
}

/** 用固定课程数据组装静态目录、数量摘要和组件树。 */
export default function StaticCourseCatalogDemo() {
  const publishedCourses = courses.filter((course) => course.published)

  return (
    <CatalogFrame title="React 基础课程目录" inspector={<ComponentTree />}>
      <section aria-labelledby="static-catalog-list-title">
        <div className="static-catalog-summary" aria-label="课程数量摘要">
          <div>
            <span>原始课程</span>
            <strong>{courses.length} 门</strong>
          </div>
          <div>
            <span>固定条件</span>
            <code>published === true</code>
          </div>
          <div>
            <span>显示结果</span>
            <strong>{publishedCourses.length} 门</strong>
          </div>
        </div>

        <div className="static-catalog-list-heading">
          <div>
            <p>筛选结果</p>
            <h3 id="static-catalog-list-title">已发布课程</h3>
          </div>
          <strong>
            {publishedCourses.length} / {courses.length}
          </strong>
        </div>

        <CourseList courses={publishedCourses} />
      </section>
    </CatalogFrame>
  )
}
