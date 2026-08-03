import type { ContentEntry, ContentMeta, ReferenceMeta } from '@/content/schema'
import type {
  CatalogEntryNode,
  CatalogNavigation,
  CatalogNode,
  CatalogScope,
  CatalogSource,
  ContentPurpose,
  EcosystemManifest,
  EntryNeighbor,
  EntryNeighbors,
  LearningCategory,
  LearningEntryManifest,
  LearningCatalog,
  LearningRoadmapEntry,
  LearningTrack,
  LearningTrackScope,
  ReferenceOverview,
  SearchHit,
  TrackManifest,
} from './types'

const purposeByType = {
  lesson: 'learn',
  reference: 'reference',
  project: 'projects',
} as const

/**
 * 根据目录层级生成稳定路径。
 */
function buildPath(scope: CatalogScope, entrySlug?: string): string {
  const segments = [scope.purpose, scope.ecosystem, scope.module, scope.collection, entrySlug]
  return `/${segments.filter(Boolean).join('/')}`
}

/**
 * 取稳定 ID 的最后一段作为条目路径段。
 */
function getEntrySlug(id: string): string {
  return id.split('.').at(-1) ?? id
}

/**
 * 判断路径清单中的 ID 是否符合小写标识约束。
 */
function isKebabId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

/**
 * 判断条目稳定 ID 是否符合小写点分段约束。
 */
function isStableId(value: string): boolean {
  return value.split('.').every(isKebabId)
}

/**
 * 判断模块是否已具备可独立展示的课程或参考总览。
 */
function hasModuleOverview(
  source: CatalogSource,
  purpose: ContentPurpose,
  ecosystem: string,
  module: string,
): boolean {
  if (purpose === 'learn') {
    return source.tracks.some(
      (track) =>
        track.purpose === 'learn' &&
        track.ecosystem === ecosystem &&
        track.module === module &&
        track.collections.some((stage) =>
          stage.categories.some((category) => category.entries.length > 0),
        ),
    )
  }
  if (purpose === 'reference') {
    return Boolean(
      source.referenceIndexes?.some(
        (index) => index.ecosystem === ecosystem && index.module === module,
      ),
    )
  }
  return false
}

/**
 * 将生态 manifest 转为当前目的下的导航节点。
 */
function toEcosystemNode(
  ecosystem: EcosystemManifest,
  purpose: ContentPurpose,
  source: CatalogSource,
  metaById: Map<string, ContentMeta>,
): CatalogNode {
  const firstEntry = findFirstEntryMeta(source, metaById, {
    purpose,
    ecosystem: ecosystem.id,
  })
  const firstAvailableModule = ecosystem.modules.find((module) => {
    if (module.status !== 'available') return false
    return (
      hasModuleOverview(source, purpose, ecosystem.id, module.id) ||
      Boolean(
        findFirstEntryMeta(source, metaById, {
          purpose,
          ecosystem: ecosystem.id,
          module: module.id,
        }),
      )
    )
  })
  return {
    id: ecosystem.id,
    title: ecosystem.title,
    summary: ecosystem.summary,
    status: ecosystem.status === 'available' && firstAvailableModule ? 'available' : 'planned',
    path:
      firstEntry && purpose === 'projects'
        ? getMetaPath(firstEntry)
        : buildPath({ purpose, ecosystem: ecosystem.id, module: firstAvailableModule?.id }),
  }
}

/**
 * 校验 catalog 输入的唯一性和跨清单引用。
 */
function validateSource(source: CatalogSource): void {
  const ecosystemIds = new Set<string>()
  const metaById = new Map<string, ContentMeta>()
  const referencedEntries = new Set<string>()

  for (const ecosystem of source.ecosystems) {
    if (!isKebabId(ecosystem.id) || ecosystemIds.has(ecosystem.id)) {
      throw new Error(`无效或重复的生态 ID：${ecosystem.id}`)
    }
    ecosystemIds.add(ecosystem.id)
    const moduleIds = new Set<string>()
    for (const module of ecosystem.modules) {
      if (!isKebabId(module.id) || moduleIds.has(module.id)) {
        throw new Error(`无效或重复的模块 ID：${ecosystem.id}/${module.id}`)
      }
      moduleIds.add(module.id)
    }
  }

  for (const meta of source.metas) {
    if (!isStableId(meta.id) || metaById.has(meta.id)) {
      throw new Error(`无效或重复的条目 ID：${meta.id}`)
    }
    metaById.set(meta.id, meta)
  }

  for (const track of source.tracks) {
    const ecosystem = source.ecosystems.find((item) => item.id === track.ecosystem)
    if (!ecosystem?.modules.some((item) => item.id === track.module)) {
      throw new Error(`清单引用了不存在的模块：${track.ecosystem}/${track.module}`)
    }
    const collectionIds = new Set<string>()
    for (const collection of track.collections) {
      if (!isKebabId(collection.id) || collectionIds.has(collection.id)) {
        throw new Error(`无效或重复的集合 ID：${collection.id}`)
      }
      collectionIds.add(collection.id)

      const entryIds: string[] = []
      if ('categories' in collection) {
        const categoryIds = new Set<string>()
        for (const category of collection.categories) {
          if (!isKebabId(category.id) || categoryIds.has(category.id)) {
            throw new Error(`无效或重复的知识类别 ID：${collection.id}/${category.id}`)
          }
          categoryIds.add(category.id)
          for (const entry of category.entries) {
            if (!isStableId(entry.id) || referencedEntries.has(entry.id)) {
              throw new Error(`无效或重复的课程规划 ID：${entry.id}`)
            }
            referencedEntries.add(entry.id)
            if (entry.status === 'available') entryIds.push(entry.id)
          }
        }
      } else {
        entryIds.push(...collection.entryIds)
      }

      for (const entryId of entryIds) {
        const meta = metaById.get(entryId)
        if (!meta) throw new Error(`清单引用了不存在的条目：${entryId}`)
        if (
          meta.ecosystem !== track.ecosystem ||
          meta.module !== track.module ||
          meta.collection !== collection.id ||
          purposeByType[meta.type] !== track.purpose
        ) {
          throw new Error(`条目元数据与清单位置不一致：${entryId}`)
        }
        if (track.purpose !== 'learn') {
          if (referencedEntries.has(entryId)) throw new Error(`条目被重复编排：${entryId}`)
          referencedEntries.add(entryId)
        }
      }
    }
  }

  for (const index of source.referenceIndexes ?? []) {
    for (const group of index.groups) {
      for (const section of group.sections) {
        for (const item of section.items) {
          if (item.status === 'available' && !item.target) {
            throw new Error(`已上线参考索引缺少站内目标：${item.id}`)
          }
          if (!item.target) continue

          const targetMeta = metaById.get(item.target.entryId)
          if (!targetMeta || targetMeta.type !== 'reference') {
            throw new Error(`参考索引目标不存在：${item.id}`)
          }
          if (targetMeta.ecosystem !== index.ecosystem || targetMeta.module !== index.module) {
            throw new Error(`参考索引目标与模块不一致：${item.id}`)
          }
        }
      }
    }
  }

  for (const meta of source.metas) {
    if (!referencedEntries.has(meta.id)) throw new Error(`条目未加入清单：${meta.id}`)
    if (!source.loaders[meta.id]) throw new Error(`条目缺少正文加载器：${meta.id}`)
  }
}

/**
 * 查找与 scope 对应的 track manifest。
 */
function findTrack(source: CatalogSource, scope: CatalogScope): TrackManifest | undefined {
  return source.tracks.find(
    (track) =>
      track.purpose === scope.purpose &&
      track.ecosystem === scope.ecosystem &&
      track.module === scope.module,
  )
}

/**
 * 返回指定集合中已经发布并可参与导航的条目 ID。
 */
function getAvailableEntryIds(track: TrackManifest, collectionId: string): string[] {
  if (track.purpose === 'learn') {
    const stage = track.collections.find((item) => item.id === collectionId)
    return (
      stage?.categories.flatMap((category) =>
        category.entries.filter((entry) => entry.status === 'available').map((entry) => entry.id),
      ) ?? []
    )
  }

  return track.collections.find((item) => item.id === collectionId)?.entryIds ?? []
}

/**
 * 按 track 与 collection 的声明顺序返回指定范围内的首个已发布条目。
 */
function findFirstEntryMeta(
  source: CatalogSource,
  metaById: Map<string, ContentMeta>,
  scope: CatalogScope,
): ContentMeta | undefined {
  for (const track of source.tracks) {
    if (
      track.purpose !== scope.purpose ||
      (scope.ecosystem && track.ecosystem !== scope.ecosystem) ||
      (scope.module && track.module !== scope.module)
    ) {
      continue
    }

    for (const collection of track.collections) {
      if (scope.collection && collection.id !== scope.collection) continue
      const firstEntryId = getAvailableEntryIds(track, collection.id)[0]
      if (firstEntryId) return metaById.get(firstEntryId)
    }
  }

  return undefined
}

/**
 * 判断元数据是否位于给定目录范围内。
 */
function matchesScope(meta: ContentMeta, scope: CatalogScope): boolean {
  return (
    purposeByType[meta.type] === scope.purpose &&
    (!scope.ecosystem || meta.ecosystem === scope.ecosystem) &&
    (!scope.module || meta.module === scope.module) &&
    (!scope.collection || meta.collection === scope.collection)
  )
}

/**
 * 为正文元数据生成搜索与路由共用的目标路径。
 */
function getMetaPath(meta: ContentMeta): string {
  return buildPath(
    {
      purpose: purposeByType[meta.type],
      ecosystem: meta.ecosystem,
      module: meta.module,
      collection: meta.collection,
    },
    getEntrySlug(meta.id),
  )
}

/**
 * 将条目元数据转为不泄露路径规则的相邻导航项。
 */
function toEntryNeighbor(meta: ContentMeta | undefined): EntryNeighbor | undefined {
  if (!meta) return undefined
  return { id: meta.id, title: meta.title, path: getMetaPath(meta) }
}

/**
 * 将条目元数据转为课程和目录共用的公开节点。
 */
function toCatalogEntryNode(meta: ContentMeta): CatalogEntryNode {
  return {
    id: getEntrySlug(meta.id),
    entryId: meta.id,
    title: meta.title,
    summary: meta.summary,
    status: 'available',
    path: getMetaPath(meta),
  }
}

/**
 * 将课程规划条目解析为总览可直接渲染的公开节点。
 */
function toLearningRoadmapEntry(
  entry: LearningEntryManifest,
  metaById: Map<string, ContentMeta>,
): LearningRoadmapEntry {
  if (entry.status === 'planned') {
    return {
      id: getEntrySlug(entry.id),
      entryId: entry.id,
      title: entry.title,
      summary: entry.summary,
      status: 'planned',
    }
  }

  const meta = metaById.get(entry.id)!
  return {
    ...toCatalogEntryNode(meta),
    summary: meta.summary,
  }
}

/**
 * 解析知识类别，并分别统计已上线课程与完整规划数量。
 */
function toLearningCategory(
  category: {
    id: string
    title: string
    summary: string
    topics: string[]
    entries: LearningEntryManifest[]
  },
  metaById: Map<string, ContentMeta>,
): LearningCategory {
  const entries = category.entries.map((entry) => toLearningRoadmapEntry(entry, metaById))
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

/**
 * 创建只通过公开目录接口访问内部清单和加载器的 LearningCatalog。
 */
export function createLearningCatalog(source: CatalogSource): LearningCatalog {
  validateSource(source)
  const metaById = new Map(source.metas.map((meta) => [meta.id, meta]))

  /**
   * 返回 scope 对应的有序目录，无法解析的层级标记为无效。
   */
  function getNavigation(scope: CatalogScope): CatalogNavigation {
    const ecosystems = source.ecosystems.map((item) =>
      toEcosystemNode(item, scope.purpose, source, metaById),
    )
    const ecosystemManifest = scope.ecosystem
      ? source.ecosystems.find((item) => item.id === scope.ecosystem)
      : undefined
    const ecosystem = ecosystems.find((item) => item.id === scope.ecosystem)
    const moduleManifest = scope.module
      ? ecosystemManifest?.modules.find((item) => item.id === scope.module)
      : undefined
    const modules = (ecosystemManifest?.modules ?? []).map((item) => {
      const firstEntry = findFirstEntryMeta(source, metaById, {
        purpose: scope.purpose,
        ecosystem: scope.ecosystem,
        module: item.id,
      })
      const hasOverview = hasModuleOverview(source, scope.purpose, scope.ecosystem!, item.id)
      return {
        ...item,
        status:
          item.status === 'available' && (firstEntry || hasOverview)
            ? ('available' as const)
            : ('planned' as const),
        path:
          firstEntry && scope.purpose === 'projects'
            ? getMetaPath(firstEntry)
            : buildPath({
                purpose: scope.purpose,
                ecosystem: scope.ecosystem,
                module: item.id,
              }),
      }
    })
    const module = modules.find((item) => item.id === moduleManifest?.id)
    const track = scope.module ? findTrack(source, scope) : undefined
    const collectionManifest = scope.collection
      ? track?.collections.find((item) => item.id === scope.collection)
      : undefined
    const collections = (track?.collections ?? []).map((item) => {
      const firstEntryId = track ? getAvailableEntryIds(track, item.id)[0] : undefined
      const firstEntry = firstEntryId ? metaById.get(firstEntryId) : undefined
      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        status: firstEntry ? ('available' as const) : ('planned' as const),
        path: firstEntry
          ? getMetaPath(firstEntry)
          : buildPath({
              purpose: scope.purpose,
              ecosystem: scope.ecosystem,
              module: scope.module,
              collection: item.id,
            }),
      }
    })
    const collection = collections.find((item) => item.id === scope.collection)
    const entries =
      track && collectionManifest
        ? getAvailableEntryIds(track, collectionManifest.id).map((id) =>
            toCatalogEntryNode(metaById.get(id)!),
          )
        : []
    const valid =
      (!scope.ecosystem || Boolean(ecosystemManifest)) &&
      (!scope.module || Boolean(moduleManifest)) &&
      (!scope.collection || Boolean(collectionManifest))

    return {
      valid,
      scope,
      ecosystems,
      ecosystem,
      modules,
      module,
      collections,
      collection,
      entries,
    }
  }

  /**
   * 按显式阶段返回课程顺序和供进度计算使用的总课数。
   */
  function getLearningTrack(scope: LearningTrackScope): LearningTrack | undefined {
    const track = findTrack(source, { purpose: 'learn', ...scope })
    if (!track || track.purpose !== 'learn') return undefined

    const stages = track.collections.map((collection) => {
      const categories = collection.categories.map((category) =>
        toLearningCategory(category, metaById),
      )
      return {
        id: collection.id,
        title: collection.title,
        summary: collection.summary,
        entries: getAvailableEntryIds(track, collection.id).map((id) =>
          toCatalogEntryNode(metaById.get(id)!),
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

  /**
   * 返回官方参考索引及其已解析的站内详情或锚点路径。
   */
  function getReferenceOverview(scope: LearningTrackScope): ReferenceOverview | undefined {
    const index = source.referenceIndexes?.find(
      (item) => item.ecosystem === scope.ecosystem && item.module === scope.module,
    )
    if (!index) return undefined

    const groups = index.groups.map((group) => ({
      id: group.id,
      title: group.title,
      sections: group.sections.map((section) => ({
        id: section.id,
        title: section.title,
        items: section.items.map((item) => {
          const targetMeta = item.target ? metaById.get(item.target.entryId) : undefined
          const targetPath = targetMeta ? getMetaPath(targetMeta) : undefined
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
      ecosystem: index.ecosystem,
      module: index.module,
      appliesTo: index.appliesTo,
      verifiedAt: index.verifiedAt,
      groups,
      availableCount: items.filter((item) => item.status === 'available').length,
      total: items.length,
    }
  }

  /**
   * 按稳定 ID 返回轻量元数据，不执行正文模块。
   */
  function getEntry(id: string): ContentMeta | undefined {
    return metaById.get(id)
  }

  /**
   * 仅在调用方请求条目正文时执行对应动态加载器。
   */
  async function loadEntry(id: string): Promise<ContentEntry> {
    const loader = source.loaders[id]
    if (!loader) throw new Error(`内容不存在：${id}`)
    return loader()
  }

  /**
   * 仅使用轻量元数据执行当前目录范围内的搜索。
   */
  function search(query: string, scope?: CatalogScope): SearchHit[] {
    if (scope && !getNavigation(scope).valid) return []
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return source.metas
      .filter((meta) => !scope || matchesScope(meta, scope))
      .filter((meta) => {
        if (!normalizedQuery) return true
        const anchors = meta.type === 'reference' ? ((meta as ReferenceMeta).anchors ?? []) : []
        return [meta.title, meta.summary, ...meta.tags, ...anchors].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        )
      })
      .map((meta) => ({
        id: meta.id,
        title: meta.title,
        summary: meta.summary,
        path: getMetaPath(meta),
        group: `${meta.ecosystem}.${meta.module}`,
        groupLabel:
          source.ecosystems
            .find((item) => item.id === meta.ecosystem)
            ?.modules.find((item) => item.id === meta.module)?.title ?? meta.module,
      }))
  }

  /**
   * 按 track 与 collection 顺序返回可跳转的相邻条目。
   */
  function getNeighbors(id: string): EntryNeighbors {
    for (const track of source.tracks) {
      const orderedIds = track.collections.flatMap((collection) =>
        getAvailableEntryIds(track, collection.id),
      )
      const index = orderedIds.indexOf(id)
      if (index !== -1) {
        return {
          previous: index > 0 ? toEntryNeighbor(metaById.get(orderedIds[index - 1]!)) : undefined,
          next:
            index < orderedIds.length - 1
              ? toEntryNeighbor(metaById.get(orderedIds[index + 1]!))
              : undefined,
        }
      }
    }
    return {}
  }

  return {
    getNavigation,
    getLearningTrack,
    getReferenceOverview,
    getEntry,
    loadEntry,
    search,
    getNeighbors,
  }
}
