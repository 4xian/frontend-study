import { useState } from 'react'
import type { SubmitEvent as ReactSubmitEvent } from 'react'
import { CourseFilters } from './course-filters'
import { COURSES, type CourseCategoryFilter } from './course-data'
import { CourseList } from './course-list'
import { RegistrationFields } from './registration-fields'
import './lab-course-registration-demo.css'

type SubmittedEntry = {
  readonly name: string
  readonly value: string
}

/** 组合筛选、课程选择、报名字段和最后提交快照。 */
export default function LabCourseRegistrationDemo() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CourseCategoryFilter>('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [submittedEntries, setSubmittedEntries] = useState<readonly SubmittedEntry[] | null>(null)

  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visibleCourses = COURSES.filter((course) => {
    const matchesQuery = course.title.toLocaleLowerCase('zh-CN').includes(normalizedQuery)
    const matchesCategory = category === 'all' || course.category === category
    const matchesAvailability = !onlyAvailable || course.available

    return matchesQuery && matchesCategory && matchesAvailability
  })
  const hasSelectableCourse = visibleCourses.some((course) => course.available)
  const selectedCourse = COURSES.find((course) => course.id === selectedCourseId)

  /** 更新课程名称筛选，并清空可能不再可见的课程选择。 */
  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery)
    setSelectedCourseId('')
  }

  /** 更新课程分类筛选，并清空可能不再可见的课程选择。 */
  function handleCategoryChange(nextCategory: CourseCategoryFilter) {
    setCategory(nextCategory)
    setSelectedCourseId('')
  }

  /** 更新可报名筛选，并清空可能不再可见的课程选择。 */
  function handleAvailabilityChange(nextValue: boolean) {
    setOnlyAvailable(nextValue)
    setSelectedCourseId('')
  }

  /** 更新根组件拥有的当前课程选择。 */
  function handleCourseChange(courseId: string) {
    setSelectedCourseId(courseId)
  }

  /** 取消默认导航，并保存浏览器生成的最后提交条目。 */
  function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const entries = Array.from(formData.entries(), ([name, value]) => ({
      name,
      value: typeof value === 'string' ? value : value.name,
    }))

    setSubmittedEntries(entries)
  }

  return (
    <section className="course-registration-demo" aria-labelledby="course-registration-title">
      <header className="course-registration-heading">
        <p>Course registration</p>
        <h2 id="course-registration-title">课程报名</h2>
        <span>筛选固定课程，选择可报名项目，并查看浏览器实际生成的提交数据。</span>
      </header>

      <CourseFilters
        query={query}
        category={category}
        onlyAvailable={onlyAvailable}
        onQueryChange={handleQueryChange}
        onCategoryChange={handleCategoryChange}
        onAvailabilityChange={handleAvailabilityChange}
      />

      <div className="course-registration-result-bar">
        <output aria-live="polite">匹配 {visibleCourses.length} 门课程</output>
        <span>{selectedCourse ? `当前选择：${selectedCourse.title}` : '当前尚未选择课程'}</span>
      </div>

      <form className="course-registration-form" onSubmit={handleSubmit}>
        <CourseList
          courses={visibleCourses}
          selectedCourseId={selectedCourseId}
          onCourseChange={handleCourseChange}
        />

        <RegistrationFields
          studentName={studentName}
          studentEmail={studentEmail}
          onStudentNameChange={setStudentName}
          onStudentEmailChange={setStudentEmail}
        />

        <div className="course-registration-actions">
          <p>{hasSelectableCourse ? '请选择课程并填写必填字段。' : '当前结果中没有可报名课程。'}</p>
          <button type="submit" disabled={!hasSelectableCourse}>
            提交报名
          </button>
        </div>
      </form>

      <section className="course-registration-snapshot" aria-live="polite">
        <div className="course-registration-section-heading">
          <p>FormData snapshot</p>
          <h3>最后提交数据</h3>
        </div>
        {submittedEntries ? (
          <dl>
            {submittedEntries.map((entry) => (
              <div key={entry.name}>
                <dt>{entry.name}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="course-registration-no-snapshot">尚未提交。</p>
        )}
      </section>
    </section>
  )
}
