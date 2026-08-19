import { useId } from 'react'
import type { ChangeEvent } from 'react'
import type { Course } from './course-data'

type CourseListProps = {
  courses: readonly Course[]
  selectedCourseId: string
  onCourseChange: (courseId: string) => void
}

type CourseOptionProps = {
  course: Course
  inputId: string
  selected: boolean
  onCourseChange: (courseId: string) => void
}

/** 渲染一门课程的原生单选控件、状态与说明。 */
function CourseOption({ course, inputId, selected, onCourseChange }: CourseOptionProps) {
  /** 把当前 radio 的业务值交给课程选择 State 所有者。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onCourseChange(event.currentTarget.value)
  }

  const itemClassName = [
    'course-registration-option',
    selected ? 'is-selected' : '',
    course.available ? '' : 'is-unavailable',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={itemClassName} data-course-id={course.id}>
      <input
        id={inputId}
        name="courseId"
        type="radio"
        value={course.id}
        checked={selected}
        disabled={!course.available}
        required
        onChange={handleChange}
      />
      <label htmlFor={inputId}>
        <span className="course-registration-option-heading">
          <strong>{course.title}</strong>
          <span>{course.available ? '可以报名' : '名额已满'}</span>
        </span>
        <span className="course-registration-option-meta">
          {course.categoryLabel} · {course.format}
        </span>
        <span className="course-registration-option-summary">{course.summary}</span>
      </label>
    </li>
  )
}

/** 使用稳定业务 ID 渲染可见课程和原生单选组。 */
export function CourseList({ courses, selectedCourseId, onCourseChange }: CourseListProps) {
  const idPrefix = useId()

  return (
    <fieldset className="course-registration-list">
      <legend>选择一门课程</legend>
      {courses.length === 0 ? (
        <p className="course-registration-empty">没有符合当前条件的课程。</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <CourseOption
              key={course.id}
              course={course}
              inputId={`${idPrefix}-${course.id}`}
              selected={selectedCourseId === course.id}
              onCourseChange={onCourseChange}
            />
          ))}
        </ul>
      )}
    </fieldset>
  )
}
