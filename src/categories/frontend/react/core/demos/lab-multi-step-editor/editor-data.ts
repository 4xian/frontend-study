export type StepId = 'basics' | 'publishing' | 'review'

export type Audience = '' | 'students' | 'teachers' | 'public'

export type ArticleDraft = {
  readonly title: string
  readonly author: string
  readonly audience: Audience
  readonly summary: string
}

export type ArticleTemplate = {
  readonly id: 'blank' | 'seminar'
  readonly label: string
  readonly initialDraft: ArticleDraft
}

export type EditorStep = {
  readonly id: StepId
  readonly label: string
}

export const EDITOR_STEPS: readonly EditorStep[] = [
  { id: 'basics', label: '基本信息' },
  { id: 'publishing', label: '发布信息' },
  { id: 'review', label: '复核' },
]

export const AUDIENCE_OPTIONS: readonly {
  readonly value: Exclude<Audience, ''>
  readonly label: string
}[] = [
  { value: 'students', label: '本科生' },
  { value: 'teachers', label: '教师' },
  { value: 'public', label: '公众' },
]

export const AUDIENCE_LABELS: Readonly<Record<Exclude<Audience, ''>, string>> = {
  students: '本科生',
  teachers: '教师',
  public: '公众',
}

export const ARTICLE_TEMPLATES: readonly ArticleTemplate[] = [
  {
    id: 'blank',
    label: '空白文章',
    initialDraft: {
      title: '',
      author: '',
      audience: '',
      summary: '',
    },
  },
  {
    id: 'seminar',
    label: '研讨记录',
    initialDraft: {
      title: 'React State 设计研讨',
      author: '前端学习小组',
      audience: 'students',
      summary: '记录如何用最小事实、受控边界和稳定身份组织交互状态。',
    },
  },
]
