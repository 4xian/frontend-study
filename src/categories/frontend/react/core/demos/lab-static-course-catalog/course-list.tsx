import type { Course } from './course-data'

type CourseCardProps = {
  course: Course
}

type CourseListProps = {
  courses: readonly Course[]
}

/** 显示一门课程的固定标题、摘要、难度与推荐状态。 */
function CourseCard({ course }: CourseCardProps) {
  return (
    <li className="static-catalog-card" data-course-id={course.id}>
      <div className="static-catalog-card-meta">
        <span>{course.level}</span>
        {course.featured && <strong>推荐</strong>}
      </div>
      <h3>{course.title}</h3>
      <p>{course.summary}</p>
      <code>{course.id}</code>
    </li>
  )
}

/** 把筛选后的课程数组转换为带稳定 key 的列表。 */
export function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return <p className="static-catalog-empty">暂无已发布课程</p>
  }

  return (
    <ul className="static-catalog-list">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </ul>
  )
}
