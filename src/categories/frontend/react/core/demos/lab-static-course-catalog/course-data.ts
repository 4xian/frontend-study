export type Course = {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly level: '基础' | '进阶'
  readonly published: boolean
  readonly featured: boolean
}

export const courses: readonly Course[] = [
  {
    id: 'tsx-foundations',
    title: 'TSX 页面结构',
    summary: '使用标记、表达式与属性描述页面内容。',
    level: '基础',
    published: true,
    featured: false,
  },
  {
    id: 'component-contracts',
    title: '组件与 Props 合同',
    summary: '用组件边界和只读输入组织重复界面。',
    level: '基础',
    published: true,
    featured: true,
  },
  {
    id: 'list-identity',
    title: '列表与稳定身份',
    summary: '把课程数据转换为带稳定 key 的列表项。',
    level: '基础',
    published: true,
    featured: false,
  },
  {
    id: 'content-layout',
    title: '内容区域组合',
    summary: '组合主要内容与职责明确的辅助区域。',
    level: '进阶',
    published: false,
    featured: false,
  },
  {
    id: 'catalog-review',
    title: '目录结构复查',
    summary: '根据模块树、组件树和页面结果检查结构。',
    level: '进阶',
    published: false,
    featured: false,
  },
]
