import { unified } from 'unified'
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import type { ContentEntry, ContentMeta } from '../content'
import { headingId } from '../content'
import { convertMarkdownBlocks, readMarkdownHeadingText } from './markdown-blocks'
import type { MarkdownAssetAllowlist, MarkdownAstNode } from './markdown-blocks'
import { parseCategoryFrontmatter } from './category-frontmatter'
import type { CategoryFrontmatter } from './category-frontmatter'

export interface ContentMarkdownInput {
  source: string
  sourcePath: string
  assets: MarkdownAssetAllowlist
}

const markdownParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm, { singleTilde: false })
  .use(remarkDirective)

/** 构造包含逻辑源路径的统一 Markdown 错误。 */
function fail(sourcePath: string, message: string): never {
  throw new Error(`[${sourcePath}] ${message}`)
}

/** 校验类别文件位置与 frontmatter 的领域身份一致。 */
function validateLocation(frontmatter: CategoryFrontmatter, sourcePath: string): void {
  if (sourcePath.startsWith('/') || sourcePath.includes('\\')) {
    fail(sourcePath, '逻辑源路径必须是仓库相对 POSIX 路径')
  }
  const parts = sourcePath.split('/')
  if (
    parts.length !== 7 ||
    parts[0] !== 'src' ||
    parts[1] !== 'categories' ||
    !parts[6]?.endsWith('.md')
  ) {
    fail(
      sourcePath,
      '路径必须符合 src/categories/<domain>/<technology>/<module>/<content-type>/<slug>.md',
    )
  }
  const [, , domain, technology, module, contentType, file] = parts
  const expectedContentType = frontmatter.type === 'lesson' ? 'learn' : 'reference'
  if (
    frontmatter.domain !== domain ||
    frontmatter.technology !== technology ||
    frontmatter.module !== module ||
    expectedContentType !== contentType
  ) {
    fail(sourcePath, '文件位置与 frontmatter 领域身份不一致')
  }
  const slug = file.slice(0, -3)
  if (!frontmatter.id.endsWith(`.${slug}`)) fail(sourcePath, '稳定 ID 末段必须与文件 slug 一致')
}

/** 转换为最终 Catalog 使用的领域身份与内容分组。 */
function toMeta(frontmatter: CategoryFrontmatter): ContentMeta {
  return {
    id: frontmatter.id,
    type: frontmatter.type,
    title: frontmatter.title,
    summary: frontmatter.summary,
    domain: frontmatter.domain,
    technology: frontmatter.technology,
    module: frontmatter.module,
    stage: frontmatter.type === 'lesson' ? frontmatter.stage : undefined,
    group: frontmatter.type === 'reference' ? frontmatter.group : undefined,
    level: frontmatter.type === 'lesson' ? frontmatter.level : undefined,
    prerequisites: frontmatter.type === 'lesson' ? frontmatter.prerequisites : undefined,
    related: frontmatter.related,
    tags: frontmatter.tags,
    sources: frontmatter.sources,
    appliesTo: frontmatter.appliesTo,
    verifiedAt: frontmatter.verifiedAt,
    modernBaseline: frontmatter.modernBaseline,
    legacyBaseline: frontmatter.legacyBaseline,
    projectEvidence: frontmatter.projectEvidence,
  }
}

/** 把统一类别 Markdown 转换为运行时 ContentEntry。 */
export function parseContentMarkdown(input: ContentMarkdownInput): ContentEntry {
  const tree = markdownParser.parse(input.source) as unknown as { children: MarkdownAstNode[] }
  const yamlNodes = tree.children.filter((node) => node.type === 'yaml')
  if (tree.children[0]?.type !== 'yaml' || yamlNodes.length !== 1) {
    fail(input.sourcePath, '必须且只能在文档开头提供一个 YAML frontmatter')
  }
  const frontmatter = parseCategoryFrontmatter(yamlNodes[0]!.value ?? '', input.sourcePath)
  validateLocation(frontmatter, input.sourcePath)

  const bodyNodes = tree.children.slice(1)
  const titleNode = bodyNodes[0]
  if (titleNode?.type !== 'heading' || titleNode.depth !== 1) {
    fail(input.sourcePath, '正文必须以唯一一级标题开始')
  }
  const title = readMarkdownHeadingText(titleNode, input.sourcePath)
  if (title !== frontmatter.title) fail(input.sourcePath, '一级标题必须与 title 一致')
  if (bodyNodes.slice(1).some((node) => node.type === 'heading' && node.depth === 1)) {
    fail(input.sourcePath, '正文只能包含一个一级标题')
  }

  const blocks = convertMarkdownBlocks(bodyNodes.slice(1), input.sourcePath, input.assets)
  const meta = toMeta(frontmatter)
  if (frontmatter.type === 'lesson') {
    return {
      meta: {
        ...meta,
        type: 'lesson',
        stage: frontmatter.stage,
        level: frontmatter.level,
        prerequisites: frontmatter.prerequisites,
        estimatedMinutes: frontmatter.estimatedMinutes,
      },
      objectives: frontmatter.objectives,
      blocks,
      exercises: blocks
        .filter((block) => block.type === 'exercise')
        .map((block) => block.instructions),
      recap: frontmatter.recap,
    }
  }
  return {
    meta: {
      ...meta,
      type: 'reference',
      group: frontmatter.group,
      anchors: frontmatter.anchors,
      headingIds: blocks.flatMap((block) =>
        block.type === 'heading' ? [headingId(block.content)] : [],
      ),
    },
    signature: frontmatter.signature,
    blocks,
  }
}
