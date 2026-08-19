export type CourseCategory = 'frontend' | 'backend' | 'design'
export type CourseCategoryFilter = CourseCategory | 'all'

export type Course = {
  readonly id: string
  readonly title: string
  readonly category: CourseCategory
  readonly categoryLabel: string
  readonly format: '线上' | '线下'
  readonly available: boolean
  readonly summary: string
}

export const COURSE_CATEGORY_OPTIONS: readonly {
  readonly value: CourseCategory
  readonly label: string
}[] = [
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '后端' },
  { value: 'design', label: '设计' },
]

export const COURSES: readonly Course[] = [
  {
    id: 'react-ui',
    title: 'React 界面开发',
    category: 'frontend',
    categoryLabel: '前端',
    format: '线上',
    available: true,
    summary: '使用组件与 State 完成可交互的前端界面。',
  },
  {
    id: 'typescript-app',
    title: 'TypeScript 工程实践',
    category: 'frontend',
    categoryLabel: '前端',
    format: '线下',
    available: true,
    summary: '用静态类型约束组织前端应用代码。',
  },
  {
    id: 'java-web',
    title: 'Java Web 入门',
    category: 'backend',
    categoryLabel: '后端',
    format: '线下',
    available: true,
    summary: '认识 Web 后端中的请求、响应与分层职责。',
  },
  {
    id: 'database-design',
    title: '数据库设计基础',
    category: 'backend',
    categoryLabel: '后端',
    format: '线上',
    available: false,
    summary: '从实体关系出发设计基础数据表结构。',
  },
  {
    id: 'interaction-design',
    title: '交互设计基础',
    category: 'design',
    categoryLabel: '设计',
    format: '线下',
    available: true,
    summary: '把用户目标转化为清楚且可验证的操作流程。',
  },
]
