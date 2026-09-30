import { createContext } from 'react-router'

export type ContentStatus = 'draft' | 'published'

export type WorkspaceUser = {
  id: string
  name: string
  role: 'editor'
}

export type ContentRecord = {
  id: string
  title: string
  summary: string
  status: ContentStatus
  updatedAt: string
}

export type ContentFilters = {
  query: string
  status: 'all' | ContentStatus
}

export type ContentRepository = ReturnType<typeof createContentRepository>

export const workspaceUserContext = createContext<WorkspaceUser>()

const initialContents: ContentRecord[] = [
  {
    id: 'router-data-flow',
    title: 'Data Router 数据流',
    summary: '用 loader、action 和 revalidation 组织页面数据生命周期。',
    status: 'published',
    updatedAt: '2026-08-26 09:10',
  },
  {
    id: 'form-feedback',
    title: '表单反馈设计',
    summary: '让校验错误留在当前编辑页面，并把成功提交导向规范 URL。',
    status: 'draft',
    updatedAt: '2026-08-25 16:40',
  },
  {
    id: 'fetcher-patterns',
    title: 'Fetcher 局部交互',
    summary: '在不改变地址的情况下完成行内发布和局部数据同步。',
    status: 'published',
    updatedAt: '2026-08-24 11:25',
  },
  {
    id: 'error-recovery',
    title: '错误恢复手册',
    summary: '区分 404 资源缺失和 503 暂时故障，并提供可执行恢复动作。',
    status: 'draft',
    updatedAt: '2026-08-23 14:05',
  },
]

/** 创建一次 Demo 挂载独享的内容仓库。 */
export function createContentRepository() {
  let contents = initialContents.map((content) => ({ ...content }))
  let temporaryFailureConsumed = false

  /** 返回当前演示用户。 */
  function currentUser(): WorkspaceUser {
    return { id: 'editor-01', name: '编辑员 Lin', role: 'editor' }
  }

  /** 按 URL 过滤条件返回内容副本。 */
  function list(filters: ContentFilters): ContentRecord[] {
    return contents
      .filter((content) => filters.status === 'all' || content.status === filters.status)
      .filter((content) => {
        const query = filters.query.toLowerCase()
        return !query || `${content.title} ${content.summary}`.toLowerCase().includes(query)
      })
      .map((content) => ({ ...content }))
  }

  /** 根据内容 ID 返回详情副本。 */
  function get(id: string): ContentRecord | undefined {
    const content = contents.find((item) => item.id === id)
    return content ? { ...content } : undefined
  }

  /** 更新标题和摘要，并记录一次新的更新时间。 */
  function update(id: string, input: Pick<ContentRecord, 'title' | 'summary'>): ContentRecord {
    contents = contents.map((content) =>
      content.id === id ? { ...content, ...input, updatedAt: '2026-08-26 10:00' } : content,
    )
    return get(id)!
  }

  /** 切换发布状态并返回更新后的内容副本。 */
  function toggleStatus(id: string): ContentRecord {
    const current = get(id)!
    return updateStatus(id, current.status === 'published' ? 'draft' : 'published')
  }

  /** 写入指定发布状态，保持状态切换逻辑与内容编辑分离。 */
  function updateStatus(id: string, status: ContentStatus): ContentRecord {
    contents = contents.map((content) =>
      content.id === id ? { ...content, status, updatedAt: '2026-08-26 10:00' } : content,
    )
    return get(id)!
  }

  /** 汇总全部内容数量，供根布局 loader 使用。 */
  function stats() {
    return {
      total: contents.length,
      draft: contents.filter((content) => content.status === 'draft').length,
      published: contents.filter((content) => content.status === 'published').length,
    }
  }

  /** 消费一次详情服务故障，用于演示 revalidator 的恢复路径。 */
  function consumeTemporaryFailure(): boolean {
    if (temporaryFailureConsumed) return false
    temporaryFailureConsumed = true
    return true
  }

  return { currentUser, list, get, update, toggleStatus, stats, consumeTemporaryFailure }
}
