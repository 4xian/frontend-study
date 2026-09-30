import type { ContentEntry } from '@/common/content'
import { buildContentPath, buildModulePath, buildTechnologyPath } from './category-path'
import type {
  CatalogEntryNode,
  CatalogContentMeta,
  CatalogDemo,
  CatalogNode,
  CatalogSearchRecord,
  CatalogSource,
  CategoryContentEntryManifest,
  CategoryModuleManifest,
  CategoryNavigation,
  CategoryScope,
  CategoryTechnologyManifest,
  ContentType,
  EntryNeighbor,
  EntryNeighbors,
  LearningCategory,
  LearningEntryManifest,
  LearningCatalog,
  LearningRoadmapEntry,
  LearningTrack,
  ModuleScope,
  ReferenceOverview,
  SearchHit,
} from './types'

const domainTitles = {
  frontend: '前端开发',
  backend: '后端开发',
  network: '网络基础',
} as const

const domainSummaries = {
  frontend: '浏览已经开放的前端框架、生态与工程化内容。',
  backend: '浏览已经开放的后端语言、平台与数据能力。',
  network: '浏览已经开放的网络协议与诊断内容。',
} as const

const domainIds = ['frontend', 'backend', 'network'] as const

interface ModuleRecord {
  technology: CategoryTechnologyManifest
  module: CategoryModuleManifest
}

/** 返回条目类型对应的公开内容类型。 */
function getContentType(meta: CatalogContentMeta): ContentType {
  return meta.type === 'lesson' ? 'learn' : 'reference'
}

/** 返回条目在模块 manifest 中的阶段或参考分组。 */
function getEntryGroup(meta: CatalogContentMeta): string {
  return meta.type === 'lesson' ? meta.stage! : meta.group!
}

/** 判断目录标识是否符合小写 kebab-case 约束。 */
function isKebabId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

/** 判断条目稳定 ID 是否符合点分段约束。 */
function isStableId(value: string): boolean {
  return value.split('.').every(isKebabId)
}

/** 判断外部 Demo 是否使用可安全新开页面的 HTTPS 地址。 */
function isSecureExternalDemoUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/** 将模块身份转换为稳定的内部查找键。 */
function getModuleKey(scope: ModuleScope): string {
  return `${scope.domain}/${scope.technology}/${scope.module}`
}

/** 从技术 manifest 展开全部正式模块。 */
function flattenModules(technologies: CategoryTechnologyManifest[]): ModuleRecord[] {
  return technologies.flatMap((technology) =>
    technology.modules.map((module) => ({ technology, module })),
  )
}

/** 返回模块指定内容类型下的显式分组。 */
function getManifestGroups(record: ModuleRecord, contentType: ContentType) {
  return contentType === 'learn'
    ? (record.module.learningTrack?.stages ?? [])
    : (record.module.referenceTrack?.groups ?? [])
}

/** 返回模块分组中已经开放的条目 ID。 */
function getAvailableEntryIds(
  record: ModuleRecord,
  contentType: ContentType,
  groupId?: string,
): string[] {
  if (contentType === 'learn') {
    return (record.module.learningTrack?.stages ?? [])
      .filter((stage) => !groupId || stage.id === groupId)
      .flatMap((stage) =>
        stage.categories.flatMap((category) =>
          category.entries.filter((entry) => entry.status === 'available').map((entry) => entry.id),
        ),
      )
  }
  return (record.module.referenceTrack?.groups ?? [])
    .filter((group) => !groupId || group.id === groupId)
    .flatMap((group) => group.entryIds)
}

/** 为模块显式登记的正文生成唯一详情路径。 */
function getEntryPath(entry: CategoryContentEntryManifest): string {
  const { meta } = entry
  return buildContentPath({
    domain: meta.domain,
    technology: meta.technology,
    module: meta.module,
    contentType: getContentType(meta),
    slug: entry.slug,
  })
}

/** 将正文 manifest 转换为目录公开节点。 */
function toCatalogEntryNode(entry: CategoryContentEntryManifest): CatalogEntryNode {
  const { meta } = entry
  return {
    id: entry.slug,
    entryId: meta.id,
    title: meta.title,
    summary: meta.summary,
    status: 'available',
    path: getEntryPath(entry),
  }
}

/** 将正文 manifest 转换为相邻导航项。 */
function toEntryNeighbor(
  entry: CategoryContentEntryManifest | undefined,
): EntryNeighbor | undefined {
  if (!entry) return undefined
  return { id: entry.meta.id, title: entry.meta.title, path: getEntryPath(entry) }
}

/** 判断正文是否位于指定技术目录范围内。 */
function matchesScope(meta: CatalogContentMeta, scope: CategoryScope): boolean {
  return (
    (!scope.domain || meta.domain === scope.domain) &&
    (!scope.technology || meta.technology === scope.technology) &&
    (!scope.module || meta.module === scope.module) &&
    (!scope.contentType || getContentType(meta) === scope.contentType) &&
    (!scope.group || getEntryGroup(meta) === scope.group)
  )
}

/** 返回首屏元数据中允许同步搜索的基础文本。 */
function getCatalogMetaSearchValues(meta: CatalogContentMeta): string[] {
  return [meta.title, meta.summary]
}

/** 将课程规划条目解析为模块总览公开节点。 */
function toLearningRoadmapEntry(
  entry: LearningEntryManifest,
  contentById: Map<string, CategoryContentEntryManifest>,
): LearningRoadmapEntry {
  if (entry.status === 'planned') {
    return {
      id: entry.id.split('.').at(-1) ?? entry.id,
      entryId: entry.id,
      title: entry.title,
      summary: entry.summary,
      status: 'planned',
    }
  }
  const content = contentById.get(entry.id)!
  return { ...toCatalogEntryNode(content), summary: content.meta.summary }
}

/** 解析课程知识类别并统计开放与规划数量。 */
function toLearningCategory(
  category: {
    id: string
    title: string
    summary: string
    topics: string[]
    entries: LearningEntryManifest[]
  },
  contentById: Map<string, CategoryContentEntryManifest>,
): LearningCategory {
  const entries = category.entries.map((entry) => toLearningRoadmapEntry(entry, contentById))
  return {
    id: category.id,
    title: category.title,
    summary: category.summary,
    topics: category.topics,
    entries,
    availableCount: entries.filter((entry) => entry.status === 'available').length,
    total: entries.length,
  }
}

/** 校验最终 Catalog 输入的身份、编排、引用和加载器唯一性。 */
function validateSource(source: CatalogSource): void {
  const technologyKeys = new Set<string>()
  const moduleByKey = new Map<string, ModuleRecord>()
  const manifestEntryIds = new Set<string>()
  const availableEntryIds = new Set<string>()
  const assetIds = new Set<string>()
  const contentById = new Map<string, CategoryContentEntryManifest>()
  const paths = new Set<string>()

  for (const technology of source.technologies) {
    const technologyKey = `${technology.domain}/${technology.id}`
    if (!isKebabId(technology.id) || technologyKeys.has(technologyKey)) {
      throw new Error(`无效或重复的 Technology：${technologyKey}`)
    }
    technologyKeys.add(technologyKey)
    if (technology.modules.length === 0) throw new Error(`Technology 没有模块：${technologyKey}`)

    const moduleIds = new Set<string>()
    for (const module of technology.modules) {
      const scope = { domain: technology.domain, technology: technology.id, module: module.id }
      const moduleKey = getModuleKey(scope)
      if (!isKebabId(module.id) || moduleIds.has(module.id)) {
        throw new Error(`无效或重复的 Module：${moduleKey}`)
      }
      moduleIds.add(module.id)
      moduleByKey.set(moduleKey, { technology, module })

      for (const asset of [...module.demos, ...(module.principles ?? [])]) {
        if (assetIds.has(asset.id)) throw new Error(`重复的 Demo 或原理资产 ID：${asset.id}`)
        if (!asset.id.startsWith(`${technology.id}.${module.id}.`)) {
          throw new Error(`Demo 或原理资产跨模块登记：${asset.id} -> ${moduleKey}`)
        }
        if ('url' in asset && !isSecureExternalDemoUrl(asset.url)) {
          throw new Error(`外部 Demo 必须使用 HTTPS：${asset.id}`)
        }
        assetIds.add(asset.id)
      }

      for (const entry of module.entries) {
        const { meta } = entry
        if (!isKebabId(entry.slug)) throw new Error(`无效的条目 slug：${entry.slug}`)
        if (!isStableId(meta.id) || contentById.has(meta.id)) {
          throw new Error(`无效或重复的正文条目 ID：${meta.id}`)
        }
        if (
          meta.domain !== technology.domain ||
          meta.technology !== technology.id ||
          meta.module !== module.id
        ) {
          throw new Error(`正文条目不属于当前模块：${meta.id} -> ${moduleKey}`)
        }
        const contentType = getContentType(meta)
        const groupId = getEntryGroup(meta)
        if (
          !getManifestGroups({ technology, module }, contentType).some(
            (group) => group.id === groupId,
          )
        ) {
          throw new Error(`条目指向未登记分组：${meta.id} -> ${groupId}`)
        }
        const path = getEntryPath(entry)
        if (paths.has(path)) throw new Error(`重复的条目路径：${path}`)
        if (typeof entry.load !== 'function') throw new Error(`条目缺少正文加载器：${meta.id}`)
        paths.add(path)
        contentById.set(meta.id, entry)
      }

      for (const stage of module.learningTrack?.stages ?? []) {
        if (!isKebabId(stage.id)) throw new Error(`无效的课程阶段 ID：${moduleKey}/${stage.id}`)
        const categoryIds = new Set<string>()
        for (const category of stage.categories) {
          if (!isKebabId(category.id) || categoryIds.has(category.id)) {
            throw new Error(`无效或重复的知识类别 ID：${moduleKey}/${stage.id}/${category.id}`)
          }
          categoryIds.add(category.id)
          for (const entry of category.entries) {
            if (!isStableId(entry.id) || manifestEntryIds.has(entry.id)) {
              throw new Error(`无效或重复的课程规划 ID：${entry.id}`)
            }
            manifestEntryIds.add(entry.id)
            if (entry.status === 'available') availableEntryIds.add(entry.id)
          }
        }
      }

      const referenceGroupIds = new Set<string>()
      for (const group of module.referenceTrack?.groups ?? []) {
        if (!isKebabId(group.id) || referenceGroupIds.has(group.id)) {
          throw new Error(`无效或重复的 Reference 分组 ID：${moduleKey}/${group.id}`)
        }
        referenceGroupIds.add(group.id)
        for (const entryId of group.entryIds) {
          if (!isStableId(entryId) || manifestEntryIds.has(entryId)) {
            throw new Error(`无效或重复的 Reference 条目 ID：${entryId}`)
          }
          manifestEntryIds.add(entryId)
          availableEntryIds.add(entryId)
        }
      }
    }
  }

  for (const { meta } of contentById.values()) {
    if (!availableEntryIds.has(meta.id)) throw new Error(`条目未加入模块 manifest：${meta.id}`)
    for (const field of ['prerequisites', 'related'] as const) {
      for (const targetId of meta[field] ?? []) {
        if (!contentById.has(targetId))
          throw new Error(`${meta.id} 的 ${field} 目标不存在：${targetId}`)
      }
    }
  }

  for (const entryId of availableEntryIds) {
    if (!contentById.has(entryId)) throw new Error(`已开放 manifest 条目缺少正文：${entryId}`)
  }

  const metaById = new Map([...contentById].map(([id, entry]) => [id, entry.meta]))

  for (const { technology, module } of moduleByKey.values()) {
    for (const group of module.referenceIndex?.groups ?? []) {
      for (const section of group.sections) {
        for (const item of section.items) {
          if (item.status === 'available' && !item.target) {
            throw new Error(`已开放 Reference 索引缺少站内目标：${item.id}`)
          }
          if (item.target)
            validateReferenceTarget(item.id, item.target, technology, module, metaById)
        }
      }
    }
    for (const item of module.referenceIndex?.searchItems ?? []) {
      validateReferenceTarget(item.id, item.target, technology, module, metaById)
    }
  }
}

/** 校验 Reference 索引目标属于当前模块且锚点真实存在。 */
function validateReferenceTarget(
  itemId: string,
  target: { entryId: string; anchor?: string },
  technology: CategoryTechnologyManifest,
  module: CategoryModuleManifest,
  metaById: Map<string, CatalogContentMeta>,
): void {
  const meta = metaById.get(target.entryId)
  if (
    !meta ||
    meta.type !== 'reference' ||
    meta.domain !== technology.domain ||
    meta.technology !== technology.id ||
    meta.module !== module.id
  ) {
    throw new Error(`Reference 索引目标不存在或跨模块：${itemId}`)
  }
  if (target.anchor && !(meta.headingIds ?? []).includes(target.anchor)) {
    throw new Error(`Reference 索引锚点不存在：${itemId}#${target.anchor}`)
  }
}

/** 创建仅通过最终技术目录访问内容的 LearningCatalog。 */
export function createLearningCatalog(source: CatalogSource): LearningCatalog {
  validateSource(source)
  const moduleRecords = flattenModules(source.technologies)
  const moduleByKey = new Map(
    moduleRecords.map((record) => [
      getModuleKey({
        domain: record.technology.domain,
        technology: record.technology.id,
        module: record.module.id,
      }),
      record,
    ]),
  )
  const contentEntries = moduleRecords.flatMap((record) => record.module.entries)
  const contentById = new Map(contentEntries.map((entry) => [entry.meta.id, entry]))
  const metas = contentEntries.map((entry) => entry.meta)
  const metaById = new Map(metas.map((meta) => [meta.id, meta]))
  const metaByPath = new Map(contentEntries.map((entry) => [getEntryPath(entry), entry.meta]))
  let searchIndex: Map<string, CatalogSearchRecord> | undefined
  let searchIndexPromise: Promise<void> | undefined

  /** 返回指定身份的正式模块记录。 */
  function findModule(scope: ModuleScope): ModuleRecord | undefined {
    return moduleByKey.get(getModuleKey(scope))
  }

  /** 返回当前技术目录范围及可跳转节点。 */
  function getNavigation(scope: CategoryScope = {}): CategoryNavigation {
    const domains = domainIds.map<CatalogNode>((domain) => ({
      id: domain,
      title: domainTitles[domain],
      summary: domainSummaries[domain],
      status: 'available',
      path: '/',
    }))
    const domain = domains.find((item) => item.id === scope.domain)
    const technologyManifests = source.technologies.filter(
      (technology) => technology.domain === scope.domain,
    )
    const technologies = technologyManifests.map<CatalogNode>((technology) => ({
      id: technology.id,
      title: technology.title,
      summary: technology.summary,
      status: 'available',
      path: buildTechnologyPath({ domain: technology.domain, technology: technology.id }),
    }))
    const technologyManifest = technologyManifests.find(
      (technology) => technology.id === scope.technology,
    )
    const technology = technologies.find((item) => item.id === scope.technology)
    const modules = (technologyManifest?.modules ?? []).map<CatalogNode>((module) => ({
      id: module.id,
      title: module.title,
      summary: module.summary,
      status: 'available',
      path: buildModulePath({
        domain: technologyManifest!.domain,
        technology: technologyManifest!.id,
        module: module.id,
      }),
    }))
    const module = modules.find((item) => item.id === scope.module)
    const record =
      scope.domain && scope.technology && scope.module
        ? findModule({
            domain: scope.domain,
            technology: scope.technology,
            module: scope.module,
          })
        : undefined
    const groups =
      record && scope.contentType
        ? getManifestGroups(record, scope.contentType).map<CatalogNode>((group) => {
            const firstId = getAvailableEntryIds(record, scope.contentType!, group.id)[0]
            const firstEntry = firstId ? contentById.get(firstId) : undefined
            return {
              id: group.id,
              title: group.title,
              summary: group.summary,
              status: firstEntry ? 'available' : 'planned',
              path: firstEntry ? getEntryPath(firstEntry) : (module?.path ?? '/'),
            }
          })
        : []
    const group = groups.find((item) => item.id === scope.group)
    const entries =
      record && scope.contentType
        ? getAvailableEntryIds(record, scope.contentType, scope.group).map((id) =>
            toCatalogEntryNode(contentById.get(id)!),
          )
        : []
    const valid =
      (!scope.domain || Boolean(domain)) &&
      (!scope.technology || Boolean(technologyManifest)) &&
      (!scope.module || Boolean(record)) &&
      (!scope.group || Boolean(group))

    return {
      valid,
      scope,
      domains,
      domain,
      technologies,
      technology,
      modules,
      module,
      groups,
      group,
      entries,
    }
  }

  /** 返回模块的完整课程规划与已开放顺序。 */
  function getLearningTrack(scope: ModuleScope): LearningTrack | undefined {
    const record = findModule(scope)
    const manifest = record?.module.learningTrack
    if (!record || !manifest) return undefined
    const stages = manifest.stages.map((stage) => {
      const categories = stage.categories.map((category) =>
        toLearningCategory(category, contentById),
      )
      return {
        id: stage.id,
        title: stage.title,
        summary: stage.summary,
        entries: getAvailableEntryIds(record, 'learn', stage.id).map((id) =>
          toCatalogEntryNode(contentById.get(id)!),
        ),
        categories,
      }
    })
    const entries = stages.flatMap((stage) => stage.entries)
    const roadmapTotal = stages.reduce(
      (total, stage) =>
        total + stage.categories.reduce((stageTotal, category) => stageTotal + category.total, 0),
      0,
    )
    return { stages, entries, total: entries.length, roadmapTotal }
  }

  /** 返回模块官方 Reference 索引及已解析路径。 */
  function getReferenceOverview(scope: ModuleScope): ReferenceOverview | undefined {
    const index = findModule(scope)?.module.referenceIndex
    if (!index) return undefined
    const groups = index.groups.map((group) => ({
      id: group.id,
      title: group.title,
      sections: group.sections.map((section) => ({
        id: section.id,
        title: section.title,
        items: section.items.map((item) => {
          const targetEntry = item.target ? contentById.get(item.target.entryId) : undefined
          const targetPath = targetEntry ? getEntryPath(targetEntry) : undefined
          return {
            ...item,
            path:
              targetPath && item.target?.anchor
                ? `${targetPath}#${item.target.anchor}`
                : targetPath,
          }
        }),
      })),
    }))
    const items = groups.flatMap((group) => group.sections.flatMap((section) => section.items))
    return {
      appliesTo: index.appliesTo,
      verifiedAt: index.verifiedAt,
      groups,
      availableCount: items.filter((item) => item.status === 'available').length,
      total: items.length,
    }
  }

  /** 返回模块显式登记的轻量 Demo 清单，不加载组件或源码。 */
  function getDemos(scope: ModuleScope): CatalogDemo[] {
    const assets = findModule(scope)?.module.demos ?? []
    return assets.map((asset) => {
      const title = asset.title ?? asset.id.split('.').at(-1)?.replaceAll('-', ' ') ?? asset.id
      return 'url' in asset
        ? { id: asset.id, title, kind: 'external', url: asset.url }
        : { id: asset.id, title, kind: 'local' }
    })
  }

  /** 按稳定 ID 返回轻量元数据。 */
  function getEntry(id: string): CatalogContentMeta | undefined {
    return metaById.get(id)
  }

  /** 按完整详情路径返回轻量元数据。 */
  function getEntryByPath(path: string): CatalogContentMeta | undefined {
    return metaByPath.get(path)
  }

  /** 按稳定 ID 懒加载正文。 */
  async function loadEntry(id: string): Promise<ContentEntry> {
    const entry = contentById.get(id)
    if (!entry) throw new Error(`内容不存在：${id}`)
    return entry.load()
  }

  /** 在搜索弹层打开时懒加载完整搜索字段，并复用并发请求。 */
  async function prepareSearch(): Promise<void> {
    if (searchIndex) return
    searchIndexPromise ??= import('virtual:content-search-index')
      .then(({ contentSearchIndex }) => {
        searchIndex = new Map(Object.entries(contentSearchIndex))
      })
      .catch((error) => {
        searchIndexPromise = undefined
        throw error
      })
    await searchIndexPromise
  }

  /** 使用轻量元数据与 Reference 索引搜索当前技术范围。 */
  function search(query: string, scope?: CategoryScope): SearchHit[] {
    if (scope && !getNavigation(scope).valid) return []
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const referenceHits = normalizedQuery
      ? moduleRecords
          .filter(
            ({ technology, module }) =>
              (!scope?.domain || technology.domain === scope.domain) &&
              (!scope?.technology || technology.id === scope.technology) &&
              (!scope?.module || module.id === scope.module) &&
              (!scope?.contentType || scope.contentType === 'reference'),
          )
          .flatMap(({ module }) => {
            const index = module.referenceIndex
            if (!index) return []
            const items = [
              ...index.groups.flatMap((group) =>
                group.sections.flatMap((section) =>
                  section.items.filter((item) => item.status === 'available' && item.target),
                ),
              ),
              ...(index.searchItems ?? []),
            ]
            return items
              .filter((item) =>
                [item.name, ...(item.aliases ?? []), item.sourceTag ?? ''].some((value) =>
                  value.toLocaleLowerCase().includes(normalizedQuery),
                ),
              )
              .flatMap<SearchHit>((item) => {
                const target = item.target
                const entry = target ? contentById.get(target.entryId) : undefined
                const meta = entry?.meta
                if (
                  !target ||
                  !entry ||
                  !meta ||
                  (scope?.group && getEntryGroup(meta) !== scope.group)
                ) {
                  return []
                }
                const path = getEntryPath(entry)
                return [
                  {
                    id: item.id,
                    title: item.name,
                    summary: meta.summary,
                    path: target.anchor ? `${path}#${target.anchor}` : path,
                    group: getModuleKey(meta),
                    groupLabel: module.title,
                  },
                ]
              })
          })
      : []
    const sourceTagOnly =
      referenceHits.length > 0 &&
      ['public', 'internal', 'alpha', 'deprecated'].includes(normalizedQuery)
    const metaHits = metas
      .filter((meta) => !scope || matchesScope(meta, scope))
      .filter((meta) => !sourceTagOnly || meta.type !== 'reference')
      .filter(
        (meta) =>
          !normalizedQuery ||
          [...getCatalogMetaSearchValues(meta), ...(searchIndex?.get(meta.id)?.values ?? [])].some(
            (value) => value.toLocaleLowerCase().includes(normalizedQuery),
          ),
      )
      .map<SearchHit>((meta) => ({
        id: meta.id,
        title: meta.title,
        summary: meta.summary,
        path: getEntryPath(contentById.get(meta.id)!),
        group: getModuleKey(meta),
        groupLabel: findModule(meta)?.module.title ?? meta.module,
      }))
    const seenPaths = new Set<string>()
    return [...referenceHits, ...metaHits].filter((hit) => {
      if (seenPaths.has(hit.path)) return false
      seenPaths.add(hit.path)
      return true
    })
  }

  /** 按模块 manifest 顺序返回相邻条目。 */
  function getNeighbors(id: string): EntryNeighbors {
    for (const record of moduleRecords) {
      for (const contentType of ['learn', 'reference'] as const) {
        const ids = getAvailableEntryIds(record, contentType)
        const index = ids.indexOf(id)
        if (index !== -1) {
          return {
            previous: index > 0 ? toEntryNeighbor(contentById.get(ids[index - 1]!)) : undefined,
            next:
              index < ids.length - 1
                ? toEntryNeighbor(contentById.get(ids[index + 1]!))
                : undefined,
          }
        }
      }
    }
    return {}
  }

  return {
    getNavigation,
    getLearningTrack,
    getReferenceOverview,
    getDemos,
    getEntry,
    getEntryByPath,
    loadEntry,
    search,
    prepareSearch,
    getNeighbors,
  }
}
