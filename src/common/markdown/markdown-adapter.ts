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

interface ParsedMarkdownDocument {
  frontmatter: CategoryFrontmatter
  bodyNodes: MarkdownAstNode[]
}

interface MarkdownFence {
  marker: '`' | '~'
  length: number
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

/** 只保留 frontmatter 与根级标题，避免 Catalog 索引解析完整正文 AST。 */
function projectContentMetaSource(source: string, sourcePath: string): string {
  const lines = source.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') fail(sourcePath, '必须在文档开头提供 YAML frontmatter')
  const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line.trim() === '---')
  if (frontmatterEnd < 0) fail(sourcePath, 'YAML frontmatter 缺少结束分隔符')

  const projected = lines.slice(0, frontmatterEnd + 1)
  let fence: MarkdownFence | undefined
  let inDirective = false
  for (const line of lines.slice(frontmatterEnd + 1)) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1]![0] as MarkdownFence['marker']
      const length = fenceMatch[1]!.length
      if (!fence) fence = { marker, length }
      else if (fence.marker === marker && length >= fence.length) fence = undefined
      continue
    }
    if (fence) continue

    if (/^ {0,3}:::[a-z]/i.test(line)) {
      inDirective = true
      continue
    }
    if (inDirective && /^ {0,3}:::\s*$/.test(line)) {
      inDirective = false
      continue
    }
    if (!inDirective && /^ {0,3}#{1,6}(?:\s|$)/.test(line)) projected.push(line)
  }
  return projected.join('\n')
}

/** 校验标题层级并返回 frontmatter 与根级标题节点。 */
function parseContentMetaDocument(input: ContentMarkdownInput): ParsedMarkdownDocument {
  const projectedSource = projectContentMetaSource(input.source, input.sourcePath)
  const tree = markdownParser.parse(projectedSource) as unknown as { children: MarkdownAstNode[] }
  const yamlNodes = tree.children.filter((node) => node.type === 'yaml')
  if (tree.children[0]?.type !== 'yaml' || yamlNodes.length !== 1) {
    fail(input.sourcePath, '必须且只能在文档开头提供一个 YAML frontmatter')
  }
  const frontmatter = parseCategoryFrontmatter(yamlNodes[0]!.value ?? '', input.sourcePath)
  validateLocation(frontmatter, input.sourcePath)

  const bodyNodes = tree.children.slice(1)
  validateDocumentStructure(frontmatter, bodyNodes, input.sourcePath)
  return { frontmatter, bodyNodes }
}

/** 校验统一 Markdown 的标题结构，确保索引和正文解析使用同一规则。 */
function validateDocumentStructure(
  frontmatter: CategoryFrontmatter,
  bodyNodes: MarkdownAstNode[],
  sourcePath: string,
): void {
  const titleNode = bodyNodes[0]
  if (titleNode?.type !== 'heading' || titleNode.depth !== 1) {
    fail(sourcePath, '正文必须以唯一一级标题开始')
  }
  const title = readMarkdownHeadingText(titleNode, sourcePath)
  if (title !== frontmatter.title) fail(sourcePath, '一级标题必须与 title 一致')
  if (bodyNodes.slice(1).some((node) => node.type === 'heading' && node.depth === 1)) {
    fail(sourcePath, '正文只能包含一个一级标题')
  }
  if (
    bodyNodes.slice(1).some((node) => node.type === 'heading' && ![2, 3].includes(node.depth ?? 0))
  ) {
    fail(sourcePath, '正文只允许二级或三级标题')
  }
}

/** 解析统一 Markdown 的 frontmatter、根标题和可用于索引的标题节点。 */
function parseMarkdownDocument(input: ContentMarkdownInput): ParsedMarkdownDocument {
  const tree = markdownParser.parse(input.source) as unknown as { children: MarkdownAstNode[] }
  const yamlNodes = tree.children.filter((node) => node.type === 'yaml')
  if (tree.children[0]?.type !== 'yaml' || yamlNodes.length !== 1) {
    fail(input.sourcePath, '必须且只能在文档开头提供一个 YAML frontmatter')
  }
  const frontmatter = parseCategoryFrontmatter(yamlNodes[0]!.value ?? '', input.sourcePath)
  validateLocation(frontmatter, input.sourcePath)

  const bodyNodes = tree.children.slice(1)
  validateDocumentStructure(frontmatter, bodyNodes, input.sourcePath)

  return { frontmatter, bodyNodes }
}

/** 仅提取 Catalog 所需的元数据，避免索引阶段转换正文和 directive。 */
export function parseContentMeta(input: ContentMarkdownInput): ContentEntry['meta'] {
  const { frontmatter, bodyNodes } = parseContentMetaDocument(input)
  const meta = toMeta(frontmatter)
  if (frontmatter.type === 'lesson') {
    return {
      ...meta,
      type: 'lesson',
      stage: frontmatter.stage,
      level: frontmatter.level,
      prerequisites: frontmatter.prerequisites,
      estimatedMinutes: frontmatter.estimatedMinutes,
    }
  }
  return {
    ...meta,
    type: 'reference',
    group: frontmatter.group,
    anchors: frontmatter.anchors,
    headingIds: bodyNodes
      .slice(1)
      .filter((node) => node.type === 'heading')
      .map((node) => headingId(readMarkdownHeadingText(node, input.sourcePath))),
  }
}

/** 把统一类别 Markdown 转换为运行时 ContentEntry。 */
export function parseContentMarkdown(input: ContentMarkdownInput): ContentEntry {
  const { frontmatter, bodyNodes } = parseMarkdownDocument(input)

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
