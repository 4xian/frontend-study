import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import {
  createSourceFile,
  forEachChild,
  isCallExpression,
  isIdentifier,
  isStringLiteralLike,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  type Node,
} from 'typescript'
import type { HmrContext, Plugin, ResolvedConfig } from 'vite'
import type { ContentEntry, ContentMeta, ReferenceMeta } from '../src/common/content'
import type { MarkdownAssetAllowlist } from '../src/common/markdown/markdown-blocks'
import { parseContentMarkdown, parseContentMeta } from '../src/common/markdown/markdown-adapter'

export interface MarkdownPluginOptions {
  root?: string
}

const catalogMetaModuleId = 'virtual:content-catalog-meta'
const resolvedCatalogMetaModuleId = `\0${catalogMetaModuleId}`
const searchIndexModuleId = 'virtual:content-search-index'
const resolvedSearchIndexModuleId = `\0${searchIndexModuleId}`

/** 递归收集目录下符合文件名条件的文件。 */
async function collectFiles(
  directory: string,
  include: (fileName: string) => boolean,
): Promise<string[]> {
  if (!existsSync(directory)) return []
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path, include) : Promise.resolve([path])
    }),
  )
  return files.flat().filter((path) => include(path))
}

interface ManifestAssetIds {
  all: Set<string>
  byModule: Map<string, Set<string>>
}

/** 从资产 manifest 的 TypeScript AST 收集全局与模块级稳定 ID。 */
async function collectManifestAssetIds(
  root: string,
  manifestName: string,
): Promise<ManifestAssetIds> {
  const files = await collectFiles(join(root, 'src/categories'), (path) =>
    path.endsWith(`/${manifestName}`),
  )
  const all = new Set<string>()
  const byModule = new Map<string, Set<string>>()
  for (const file of files) {
    const parts = relative(join(root, 'src/categories'), file).split(sep)
    const moduleKey = parts.slice(0, 3).join('/')
    const moduleIds = new Set<string>()
    const source = await readFile(file, 'utf8')
    const tree = createSourceFile(file, source, ScriptTarget.Latest, true, ScriptKind.TS)
    /** 递归读取仅符合稳定 ID 语法的字符串字面量。 */
    function visit(node: Node): void {
      if (isStringLiteralLike(node) && /^[a-z0-9]+(?:[.-][a-z0-9]+){2,}$/.test(node.text)) {
        all.add(node.text)
        moduleIds.add(node.text)
      }
      forEachChild(node, visit)
    }
    visit(tree)
    byModule.set(moduleKey, moduleIds)
  }
  return { all, byModule }
}

/** 建立 Markdown directive 可引用的正式资产白名单。 */
async function createAssetAllowlist(root: string): Promise<MarkdownAssetAllowlist> {
  const [demos, interactiveIds, principles] = await Promise.all([
    collectManifestAssetIds(root, 'demo-manifest.ts'),
    Promise.resolve(new Set<string>()),
    collectManifestAssetIds(root, 'principle-manifest.ts'),
  ])
  return {
    demoIds: demos.all,
    demoIdsByModule: demos.byModule,
    interactiveIds,
    principleIds: principles.all,
  }
}

/** 将真实模块路径转换为 adapter 校验使用的仓库逻辑路径。 */
function toLogicalSourcePath(file: string, root: string): string | undefined {
  let path = relative(root, file).split(sep).join('/')
  const parts = path.split('/')
  if (
    parts.length === 7 &&
    parts[0] === 'src' &&
    parts[1] === 'categories' &&
    ['learn', 'reference'].includes(parts[5] ?? '')
  ) {
    return path
  }
  return undefined
}

interface RegisteredContentFile {
  file: string
  sourcePath: string
}

interface ContentCatalogIndex {
  files: RegisteredContentFile[]
  manifestFiles: string[]
  metaByPath: Map<string, CatalogContentMeta>
  searchById: Map<string, CatalogSearchRecord>
}

interface CatalogContentMeta {
  id: string
  type: ContentMeta['type']
  title: string
  summary: string
  domain: ContentMeta['domain']
  technology: string
  module: string
  level?: ContentMeta['level']
  prerequisites?: string[]
  related?: string[]
  stage?: string
  group?: string
  headingIds?: string[]
}

interface CatalogSearchRecord {
  values: string[]
}

/** 将完整正文元数据投影为首屏目录使用的轻量字段。 */
function toCatalogContentMeta(meta: ContentMeta): CatalogContentMeta {
  const referenceMeta = meta.type === 'reference' ? (meta as ReferenceMeta) : undefined
  return {
    id: meta.id,
    type: meta.type,
    title: meta.title,
    summary: meta.summary,
    domain: meta.domain,
    technology: meta.technology,
    module: meta.module,
    level: meta.level,
    prerequisites: meta.prerequisites,
    related: meta.related,
    stage: meta.stage,
    group: meta.group,
    headingIds: referenceMeta?.headingIds,
  }
}

/** 提取只用于全文搜索的字段，避免首屏目录重复携带正文来源数据。 */
function toCatalogSearchRecord(meta: ContentMeta): CatalogSearchRecord {
  const referenceMeta = meta.type === 'reference' ? (meta as ReferenceMeta) : undefined
  const sourceValues = meta.sources.flatMap((source) => [
    source.title,
    source.appliesTo ?? '',
    ...(source.claims ?? []),
  ])
  return {
    values: [
      ...meta.tags,
      ...(referenceMeta?.anchors ?? []),
      ...sourceValues,
      ...Object.values(meta.modernBaseline ?? {}),
      ...Object.values(meta.legacyBaseline ?? {}),
      ...(meta.projectEvidence ?? []).map((evidence) => evidence.symbol),
    ],
  }
}

/** 从显式 entry manifest 的动态 loader 收集正式登记 Markdown。 */
async function collectRegisteredContentFiles(root: string): Promise<{
  files: RegisteredContentFile[]
  manifestFiles: string[]
}> {
  const manifestFiles = await collectFiles(join(root, 'src/categories'), (path) =>
    path.endsWith('/entry-manifest.ts'),
  )
  const registered = new Map<string, RegisteredContentFile>()

  for (const manifestFile of manifestFiles) {
    const source = await readFile(manifestFile, 'utf8')
    const tree = createSourceFile(manifestFile, source, ScriptTarget.Latest, true, ScriptKind.TS)
    const loaderSourcePaths = new Set<string>()
    const metaSourcePaths = new Set<string>()
    /** 收集当前 manifest 中使用固定字面量声明的正文动态导入。 */
    function visit(node: Node): void {
      if (isCallExpression(node) && node.expression.kind === SyntaxKind.ImportKeyword) {
        const request = node.arguments[0]
        if (request && isStringLiteralLike(request)) {
          const queryIndex = request.text.indexOf('?')
          const requestPath = queryIndex < 0 ? request.text : request.text.slice(0, queryIndex)
          const query =
            queryIndex < 0
              ? new URLSearchParams()
              : new URLSearchParams(request.text.slice(queryIndex + 1))
          if (query.has('content-entry')) {
            const file = resolve(dirname(manifestFile), requestPath)
            const sourcePath = toLogicalSourcePath(file, root)
            if (!sourcePath) {
              throw new Error(
                `正文 loader 路径不符合类别目录约定：${manifestFile} -> ${request.text}`,
              )
            }
            if (loaderSourcePaths.has(sourcePath) || registered.has(sourcePath)) {
              throw new Error(`正文 loader 重复登记：${sourcePath}`)
            }
            loaderSourcePaths.add(sourcePath)
            registered.set(sourcePath, { file, sourcePath })
          }
        }
      }
      if (isCallExpression(node) && isIdentifier(node.expression)) {
        const request = node.arguments[0]
        if (node.expression.text === 'getContentMeta' && request && isStringLiteralLike(request)) {
          const file = resolve(root, request.text)
          const sourcePath = toLogicalSourcePath(file, root)
          if (!sourcePath) {
            throw new Error(`正文 meta 路径不符合类别目录约定：${manifestFile} -> ${request.text}`)
          }
          if (metaSourcePaths.has(sourcePath)) throw new Error(`正文 meta 重复登记：${sourcePath}`)
          metaSourcePaths.add(sourcePath)
        }
      }
      forEachChild(node, visit)
    }
    visit(tree)
    if (
      loaderSourcePaths.size !== metaSourcePaths.size ||
      [...loaderSourcePaths].some((sourcePath) => !metaSourcePaths.has(sourcePath))
    ) {
      throw new Error(`entry manifest 的 meta 与正文 loader 不一致：${manifestFile}`)
    }
  }

  return {
    files: [...registered.values()].sort((left, right) =>
      left.sourcePath.localeCompare(right.sourcePath),
    ),
    manifestFiles,
  }
}

/** 将完整正文转换为 Vite 可返回的受控 ESM。 */
function toContentEntryCode(entry: ContentEntry): string {
  const metaCode = `export const meta = ${JSON.stringify(entry.meta)};`
  return `${metaCode}\nexport default ${JSON.stringify(entry)};`
}

/** 为正式登记正文建立轻量 Catalog 索引，可选执行完整正文校验。 */
async function createContentCatalogIndex(
  root: string,
  assets: MarkdownAssetAllowlist,
  validateContent: boolean,
  contentEntryCodeByFile: Map<string, string>,
): Promise<ContentCatalogIndex> {
  const registered = await collectRegisteredContentFiles(root)
  const parsed = await Promise.all(
    registered.files.map(async (item) => {
      const source = await readFile(item.file, 'utf8')
      const input = { source, sourcePath: item.sourcePath, assets }
      if (!validateContent) return { item, meta: parseContentMeta(input) }
      const entry = parseContentMarkdown(input)
      contentEntryCodeByFile.set(item.file, toContentEntryCode(entry))
      return { item, meta: entry.meta }
    }),
  )
  return {
    ...registered,
    metaByPath: new Map(
      parsed.map(({ item, meta }) => [item.sourcePath, toCatalogContentMeta(meta)]),
    ),
    searchById: new Map(parsed.map(({ meta }) => [meta.id, toCatalogSearchRecord(meta)])),
  }
}

/** 判断请求是否只包含插件拥有的正文或 catalog meta 查询。 */
function parseModuleRequest(id: string): { file: string; catalogMetaOnly: boolean } | undefined {
  const queryIndex = id.indexOf('?')
  const file = queryIndex < 0 ? id : id.slice(0, queryIndex)
  if (!file.endsWith('.md')) return undefined
  const query =
    queryIndex < 0 ? new URLSearchParams() : new URLSearchParams(id.slice(queryIndex + 1))
  query.delete('import')
  const catalogMetaOnly = query.has('catalog-meta')
  const contentEntry = query.has('content-entry')
  query.delete('catalog-meta')
  query.delete('content-entry')
  if (catalogMetaOnly === contentEntry || [...query.keys()].length > 0) return undefined
  return { file, catalogMetaOnly }
}

/** 将统一 Markdown 编译为只包含已校验 JSON 数据的受控 ESM。 */
export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  const root = resolve(options.root ?? process.cwd())
  let config: ResolvedConfig | undefined
  let assets: Promise<MarkdownAssetAllowlist> | undefined
  let catalogIndex: Promise<ContentCatalogIndex> | undefined
  const contentEntryCodeByFile = new Map<string, string>()

  /** 返回当前模式下唯一的 Catalog 索引构建任务。 */
  function getCatalogIndex(): Promise<ContentCatalogIndex> {
    assets ??= createAssetAllowlist(root)
    if (catalogIndex) return catalogIndex
    const pending = assets.then((allowlist) =>
      createContentCatalogIndex(
        root,
        allowlist,
        config?.command === 'build',
        contentEntryCodeByFile,
      ),
    )
    let recoverable: Promise<ContentCatalogIndex>
    recoverable = pending.catch((error) => {
      if (catalogIndex === recoverable) catalogIndex = undefined
      assets = undefined
      throw error
    })
    catalogIndex = recoverable
    return recoverable
  }

  /** 使开发服务器中的虚拟 Catalog 索引失效并参与本轮 HMR。 */
  function invalidateCatalogIndex(server: HmrContext['server']) {
    catalogIndex = undefined
    const modules = [resolvedCatalogMetaModuleId, resolvedSearchIndexModuleId]
      .map((id) => server.moduleGraph.getModuleById(id))
      .filter((module): module is NonNullable<typeof module> => Boolean(module))
    for (const module of modules) server.moduleGraph.invalidateModule(module)
    return modules
  }

  return {
    name: 'content-markdown',
    enforce: 'pre',
    /** 记录 Vite 当前命令，使生产构建执行完整正文校验。 */
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    /** 解析统一虚拟 Catalog 索引。 */
    resolveId(id) {
      if (id === catalogMetaModuleId) return resolvedCatalogMetaModuleId
      if (id === searchIndexModuleId) return resolvedSearchIndexModuleId
      return null
    },
    /** 生产构建前完整校验全部正式登记正文，并缓存后续模块结果。 */
    async buildStart() {
      if (config?.command === 'build') await getCatalogIndex()
    },
    /** 根据变更内容精确刷新资产白名单、Catalog 索引或单篇正文。 */
    async handleHotUpdate({ file, modules, server }) {
      if (['demo-manifest.ts', 'principle-manifest.ts'].includes(basename(file))) {
        assets = undefined
        contentEntryCodeByFile.clear()
        if (!catalogIndex) return
        const index = await catalogIndex
        const contentModules = new Set(
          index.files.flatMap((item) =>
            [...(server.moduleGraph.getModulesByFile(item.file) ?? [])].filter((module) =>
              module.id?.includes('content-entry'),
            ),
          ),
        )
        for (const module of contentModules) server.moduleGraph.invalidateModule(module)
        return [...modules, ...contentModules]
      }
      if (basename(file) === 'entry-manifest.ts') {
        return [...modules, ...invalidateCatalogIndex(server)]
      }
      if (!file.endsWith('.md') || !catalogIndex) return

      const currentIndex = await catalogIndex
      const registered = currentIndex.files.find((item) => item.file === file)
      if (!registered) return
      assets ??= createAssetAllowlist(root)
      const source = await readFile(file, 'utf8')
      const nextMeta = parseContentMeta({
        source,
        sourcePath: registered.sourcePath,
        assets: await assets,
      })
      const previousMeta = currentIndex.metaByPath.get(registered.sourcePath)
      const nextCatalogMeta = toCatalogContentMeta(nextMeta)
      const nextSearchRecord = toCatalogSearchRecord(nextMeta)
      const previousSearchRecord = currentIndex.searchById.get(nextMeta.id)
      if (
        JSON.stringify(previousMeta) !== JSON.stringify(nextCatalogMeta) ||
        JSON.stringify(previousSearchRecord) !== JSON.stringify(nextSearchRecord)
      ) {
        return [...modules, ...invalidateCatalogIndex(server)]
      }
    },
    /** 读取并编译统一 Markdown 正文的模块请求。 */
    async load(id) {
      if (id === resolvedCatalogMetaModuleId) {
        const index = await getCatalogIndex()
        for (const file of [...index.manifestFiles, ...index.files.map((item) => item.file)]) {
          this.addWatchFile(file)
        }
        const serializedMeta = JSON.stringify(Object.fromEntries(index.metaByPath))
        return {
          code: `const contentMetaByPath = ${serializedMeta};
export function getContentMeta(path) {
  const meta = contentMetaByPath[path];
  if (!meta) throw new Error(\`Catalog 索引缺少正文元数据：\${path}\`);
  return meta;
}`,
          moduleType: 'js',
        }
      }
      if (id === resolvedSearchIndexModuleId) {
        const index = await getCatalogIndex()
        for (const file of [...index.manifestFiles, ...index.files.map((item) => item.file)]) {
          this.addWatchFile(file)
        }
        return {
          code: `export const contentSearchIndex = ${JSON.stringify(Object.fromEntries(index.searchById))};`,
          moduleType: 'js',
        }
      }
      const request = parseModuleRequest(id)
      if (!request) return null
      const sourcePath = toLogicalSourcePath(request.file, root)
      if (!sourcePath) return null
      const catalogIndex = await getCatalogIndex()
      if (!catalogIndex.files.some((item) => item.file === request.file)) {
        throw new Error(`Markdown 正文未在 entry manifest 登记：${sourcePath}`)
      }
      const cachedContentEntryCode = contentEntryCodeByFile.get(request.file)
      if (!request.catalogMetaOnly && cachedContentEntryCode) {
        return { code: cachedContentEntryCode, moduleType: 'js' }
      }
      assets ??= createAssetAllowlist(root)
      const source = await readFile(request.file, 'utf8')
      const input = { source, sourcePath, assets: await assets }
      if (request.catalogMetaOnly) {
        const meta = parseContentMeta(input)
        return {
          code: `export const meta = ${JSON.stringify(toCatalogContentMeta(meta))};`,
          moduleType: 'js',
        }
      }
      const entry = parseContentMarkdown(input)
      return {
        code: toContentEntryCode(entry),
        moduleType: 'js',
      }
    },
  }
}
