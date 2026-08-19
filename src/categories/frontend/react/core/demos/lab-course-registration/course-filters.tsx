import { useId } from 'react'
import type { ChangeEvent } from 'react'
import { COURSE_CATEGORY_OPTIONS, type CourseCategoryFilter } from './course-data'

type CourseFiltersProps = {
  query: string
  category: CourseCategoryFilter
  onlyAvailable: boolean
  onQueryChange: (nextQuery: string) => void
  onCategoryChange: (nextCategory: CourseCategoryFilter) => void
  onAvailabilityChange: (nextValue: boolean) => void
}

/** 渲染三项受控筛选，并把用户输入交给根组件。 */
export function CourseFilters({
  query,
  category,
  onlyAvailable,
  onQueryChange,
  onCategoryChange,
  onAvailabilityChange,
}: CourseFiltersProps) {
  const idPrefix = useId()
  const queryId = `${idPrefix}-query`
  const queryHelpId = `${idPrefix}-query-help`
  const categoryId = `${idPrefix}-category`
  const availabilityId = `${idPrefix}-availability`

  /** 把搜索框的最新字符串交给筛选 State 所有者。 */
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.currentTarget.value)
  }

  /** 把分类下拉框的固定选项交给筛选 State 所有者。 */
  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    onCategoryChange(event.currentTarget.value as CourseCategoryFilter)
  }

  /** 把只看可报名复选框的布尔值交给筛选 State 所有者。 */
  function handleAvailabilityChange(event: ChangeEvent<HTMLInputElement>) {
    onAvailabilityChange(event.currentTarget.checked)
  }

  return (
    <section className="course-registration-filters" aria-labelledby={`${idPrefix}-title`}>
      <div className="course-registration-section-heading">
        <p>筛选条件</p>
        <h3 id={`${idPrefix}-title`}>查找课程</h3>
      </div>

      <div className="course-registration-filter-controls">
        <div className="course-registration-field">
          <label htmlFor={queryId}>课程名称</label>
          <input
            id={queryId}
            value={query}
            onChange={handleQueryChange}
            aria-describedby={queryHelpId}
            placeholder="例如：React"
          />
          <p id={queryHelpId}>支持按课程名称进行包含匹配。</p>
        </div>

        <div className="course-registration-field">
          <label htmlFor={categoryId}>课程分类</label>
          <select id={categoryId} value={category} onChange={handleCategoryChange}>
            <option value="all">全部分类</option>
            {COURSE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="course-registration-availability">
          <input
            id={availabilityId}
            type="checkbox"
            checked={onlyAvailable}
            onChange={handleAvailabilityChange}
          />
          <label htmlFor={availabilityId}>只看可报名课程</label>
        </div>
      </div>
    </section>
  )
}
