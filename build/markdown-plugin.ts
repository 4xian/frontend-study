import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import {
  createSourceFile,
  forEachChild,
  isStringLiteralLike,
  ScriptKind,
  ScriptTarget,
  type Node,
} from 'typescript'
import type { Plugin } from 'vite'
import type { MarkdownAssetAllowlist } from '../src/common/markdown/markdown-blocks'
import { parseContentMarkdown } from '../src/common/markdown/markdown-adapter'

export interface MarkdownPluginOptions {
  root?: string
}

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
  let assets: Promise<MarkdownAssetAllowlist> | undefined

  return {
    name: 'content-markdown',
    enforce: 'pre',
    /** 读取并编译统一 Markdown 正文的模块请求。 */
    async load(id) {
      const request = parseModuleRequest(id)
      if (!request) return null
      const sourcePath = toLogicalSourcePath(request.file, root)
      if (!sourcePath) return null
      assets ??= createAssetAllowlist(root)
      const source = await readFile(request.file, 'utf8')
      const input = { source, sourcePath, assets: await assets }
      const entry = parseContentMarkdown(input)
      const metaCode = `export const meta = ${JSON.stringify(entry.meta)};`
      return {
        code: request.catalogMetaOnly
          ? metaCode
          : `${metaCode}\nexport default ${JSON.stringify(entry)};`,
        moduleType: 'js',
      }
    },
  }
}
