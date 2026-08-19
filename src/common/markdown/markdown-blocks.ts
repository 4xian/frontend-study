import type { ContentBlock, PitfallExample, PitfallItem } from '../content'

export interface MarkdownAstNode {
  type: string
  name?: string
  value?: string
  depth?: number
  lang?: string | null
  ordered?: boolean | null
  checked?: boolean | null
  url?: string
  attributes?: Record<string, string | null> | null
  children?: MarkdownAstNode[]
}

export interface MarkdownAssetAllowlist {
  demoIds: ReadonlySet<string>
  demoIdsByModule?: ReadonlyMap<string, ReadonlySet<string>>
  interactiveIds: ReadonlySet<string>
  principleIds?: ReadonlySet<string>
}

interface ConversionContext {
  sourcePath: string
  assets: MarkdownAssetAllowlist
}

interface PitfallFields {
  phenomenon?: string
  trigger?: string
  cause?: string
  consequence?: string
  affectedVersions?: string
  verification?: string
  source?: string
  wrong?: PitfallExample
  correct?: PitfallExample
}

type ListConversionBlock =
  Extract<ContentBlock, { type: 'list' }> | Extract<ContentBlock, { type: 'checklist' }>

const directiveNames = new Set([
  'tip',
  'warning',
  'pitfalls',
  'compare',
  'exercise',
  'steps',
  'code-details',
  'demo',
  'interactive',
  'principle',
])

/** 构造包含逻辑源路径的稳定转换错误。 */
function fail(context: ConversionContext, message: string): never {
  throw new Error(`[${context.sourcePath}] ${message}`)
}

/** 返回节点的子节点，不存在时使用空数组。 */
function childrenOf(node: MarkdownAstNode): MarkdownAstNode[] {
  return node.children ?? []
}

/** 将受支持的行内节点转换为现有 text block 可显示的文本。 */
function inlineText(node: MarkdownAstNode, context: ConversionContext): string {
  if (node.type === 'text') {
    const value = node.value ?? ''
    if (/\{\{[\s\S]*?\}\}/.test(value)) fail(context, '禁止 Vue 插值')
    return value
  }
  if (node.type === 'inlineCode') return `\`${node.value ?? ''}\``
  if (node.type === 'break') return '\n'
  if (node.type === 'strong' || node.type === 'emphasis' || node.type === 'delete') {
    return childrenOf(node)
      .map((child) => inlineText(child, context))
      .join('')
  }
  if (node.type === 'link') {
    const label = childrenOf(node)
      .map((child) => inlineText(child, context))
      .join('')
    return `${label} (${node.url ?? ''})`
  }
  return fail(context, `不支持的行内 AST 节点：${node.type}`)
}

/** 将段落或表格单元格转换为纯文本，并保留行内代码反引号。 */
function phrasingText(node: MarkdownAstNode, context: ConversionContext): string {
  return childrenOf(node)
    .map((child) => inlineText(child, context))
    .join('')
    .trim()
}

/** 将普通列表项转换为单行文本并拒绝嵌套块。 */
function listItemText(node: MarkdownAstNode, context: ConversionContext): string {
  const children = childrenOf(node)
  if (children.length !== 1 || children[0]?.type !== 'paragraph') {
    return fail(context, '普通列表项只能包含一个段落')
  }
  const value = phrasingText(children[0], context)
  if (!value) return fail(context, '列表项不能为空')
  return value
}

/** 将普通列表转换为保留顺序语义的 list block。 */
function convertList(node: MarkdownAstNode, context: ConversionContext): ListConversionBlock {
  const items = childrenOf(node)
  const isTaskList = items.some((item) => typeof item.checked === 'boolean')
  if (isTaskList) {
    if (!items.every((item) => typeof item.checked === 'boolean')) {
      return fail(context, '任务清单不能混入普通列表项')
    }
    return {
      type: 'checklist',
      items: items.map((item) => ({
        label: listItemText(item, context),
        checked: item.checked ?? false,
      })),
    }
  }
  return {
    type: 'list',
    ordered: node.ordered === true,
    items: items.map((item) => listItemText(item, context)),
  }
}

/** 将普通列表转换为旧 directive 所需的带前缀文本，并拒绝任务清单。 */
function listDirectiveText(
  block: ListConversionBlock,
  directiveName: string,
  context: ConversionContext,
): string {
  if (block.type === 'checklist') return fail(context, `${directiveName} 不接受任务清单`)
  return block.items
    .map((item, index) => `${block.ordered ? `${index + 1}.` : '-'} ${item}`)
    .join('\n')
}

/** 将 GFM 表格转换为列数稳定的 table block。 */
function convertTable(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  const rows = childrenOf(node).map((row) =>
    childrenOf(row).map((cell) => phrasingText(cell, context)),
  )
  if (rows.length < 2 || rows[0]?.length === 0) return fail(context, '表格至少需要表头和一行正文')
  const columnCount = rows[0]!.length
  if (!rows.every((row) => row.length === columnCount)) return fail(context, '表格每行列数必须一致')
  return { type: 'table', headers: rows[0]!, rows: rows.slice(1) }
}

/** 读取由粗体标签开头的结构化字段段落。 */
function readLabelledParagraph(
  node: MarkdownAstNode,
  context: ConversionContext,
): { label: string; value: string } | undefined {
  const children = childrenOf(node)
  if (node.type !== 'paragraph' || children[0]?.type !== 'strong') return undefined
  const label = phrasingText(children[0], context).replace(/[：:]$/, '')
  const value = children
    .slice(1)
    .map((child) => inlineText(child, context))
    .join('')
    .trim()
  return { label, value }
}

/** 确保 directive 内没有嵌套或非容器 directive。 */
function rejectNestedDirectives(node: MarkdownAstNode, context: ConversionContext): void {
  for (const child of childrenOf(node)) {
    if (['containerDirective', 'leafDirective', 'textDirective'].includes(child.type)) {
      fail(context, `禁止嵌套或非容器 directive：${child.name ?? child.type}`)
    }
    rejectNestedDirectives(child, context)
  }
}

/** 将 tip 或 warning 的段落内容转换为提示块。 */
function convertTip(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  if (Object.keys(node.attributes ?? {}).length > 0) fail(context, `${node.name} 不接受属性`)
  const content = childrenOf(node)
    .map((child) => {
      if (child.type === 'paragraph') return phrasingText(child, context)
      if (child.type === 'list') {
        return listDirectiveText(convertList(child, context), node.name!, context)
      }
      return fail(context, `${node.name} 不支持 AST 节点：${child.type}`)
    })
    .join('\n')
    .trim()
  if (!content) fail(context, `${node.name} 内容不能为空`)
  return { type: 'tip', style: node.name === 'warning' ? 'warning' : 'info', content }
}

/** 将一个 pitfalls 三级标题分段转换为完整易错项。 */
function convertPitfallItem(
  title: string,
  nodes: MarkdownAstNode[],
  context: ConversionContext,
): PitfallItem {
  const fields: PitfallFields = {}
  let pendingExample: 'wrong' | 'correct' | undefined
  for (const node of nodes) {
    const labelled = readLabelledParagraph(node, context)
    if (labelled) {
      if (labelled.label === '现象') fields.phenomenon = labelled.value
      else if (labelled.label === '触发条件') fields.trigger = labelled.value
      else if (labelled.label === '原因') fields.cause = labelled.value
      else if (labelled.label === '后果') fields.consequence = labelled.value
      else if (labelled.label === '影响版本') fields.affectedVersions = labelled.value
      else if (labelled.label === '验证方式') fields.verification = labelled.value
      else if (labelled.label === '来源') fields.source = labelled.value
      else if (labelled.label === '错误示例') pendingExample = 'wrong'
      else if (labelled.label === '正确写法') pendingExample = 'correct'
      else fail(context, `pitfalls 未知字段：${labelled.label}`)
      continue
    }
    if (node.type === 'code' && pendingExample) {
      if (!node.lang) fail(context, `pitfalls ${pendingExample} 代码缺少语言`)
      fields[pendingExample] = { lang: node.lang, content: node.value ?? '' }
      pendingExample = undefined
      continue
    }
    fail(context, `pitfalls 不支持 AST 节点：${node.type}`)
  }
  if (
    !fields.trigger ||
    !fields.cause ||
    !fields.consequence ||
    !fields.verification ||
    !fields.wrong ||
    !fields.correct
  ) {
    fail(context, `pitfalls「${title}」缺少触发条件、原因、后果、两段代码或验证方式`)
  }
  return {
    title,
    description: fields.cause,
    phenomenon: fields.phenomenon,
    trigger: fields.trigger,
    cause: fields.cause,
    consequence: fields.consequence,
    wrong: fields.wrong,
    correct: fields.correct,
    affectedVersions: fields.affectedVersions,
    verification: fields.verification,
    source: fields.source,
  }
}

/** 将 pitfalls directive 转换为一个或多个完整易错项。 */
function convertPitfalls(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  if (Object.keys(node.attributes ?? {}).length > 0) fail(context, 'pitfalls 不接受属性')
  const items: PitfallItem[] = []
  let title: string | undefined
  let section: MarkdownAstNode[] = []
  /** 将当前三级标题及其正文追加为一个完整易错项。 */
  const flush = () => {
    if (title) items.push(convertPitfallItem(title, section, context))
  }
  for (const child of childrenOf(node)) {
    if (child.type === 'heading' && child.depth === 3) {
      flush()
      title = phrasingText(child, context)
      section = []
      continue
    }
    if (!title) fail(context, 'pitfalls 必须以三级标题开始')
    section.push(child)
  }
  flush()
  if (items.length === 0) fail(context, 'pitfalls 至少需要一个错误项')
  return { type: 'pitfalls', items }
}

/** 将 compare directive 转换为严格的错误与正确两侧。 */
function convertCompare(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  const attributes = node.attributes ?? {}
  if (Object.keys(attributes).some((key) => !['before', 'after'].includes(key))) {
    fail(context, 'compare 只接受 before 与 after 属性')
  }
  const hasExplicitLabels =
    typeof attributes.before === 'string' && typeof attributes.after === 'string'
  if ((attributes.before !== undefined || attributes.after !== undefined) && !hasExplicitLabels) {
    fail(context, 'compare 的 before 与 after 必须同时提供文本值')
  }
  const expectedLabels: [string, string] = hasExplicitLabels
    ? [attributes.before!, attributes.after!]
    : ['错误写法', '正确写法']
  const sides: { label: string; code: PitfallExample }[] = []
  let label: string | undefined
  for (const child of childrenOf(node)) {
    if (child.type === 'heading' && child.depth === 3) {
      if (label) fail(context, `compare「${label}」缺少代码`)
      label = phrasingText(child, context)
      continue
    }
    if (child.type === 'code' && label) {
      if (!child.lang) fail(context, `compare「${label}」代码缺少语言`)
      sides.push({ label, code: { lang: child.lang, content: child.value ?? '' } })
      label = undefined
      continue
    }
    fail(context, `compare 不支持 AST 节点：${child.type}`)
  }
  if (label || sides.length !== 2) fail(context, 'compare 必须正好包含错误与正确两侧')
  if (sides[0]!.label !== expectedLabels[0] || sides[1]!.label !== expectedLabels[1]) {
    fail(context, `compare 标题必须依次为“${expectedLabels[0]}”和“${expectedLabels[1]}”`)
  }
  return {
    type: 'compare',
    before: sides[0]!.code.content,
    after: sides[1]!.code.content,
    labels: expectedLabels,
    languages: [sides[0]!.code.lang, sides[1]!.code.lang],
  }
}

/** 将 exercise directive 转换为练习、完成标准与可选答案。 */
function convertExercise(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  if (Object.keys(node.attributes ?? {}).length > 0) fail(context, 'exercise 不接受属性')
  const children = childrenOf(node)
  const heading = children[0]
  if (heading?.type !== 'heading' || heading.depth !== 3) {
    return fail(context, 'exercise 必须以三级标题开始')
  }
  const fields = new Map<string, string>()
  let pendingCodeField: string | undefined
  for (const child of children.slice(1)) {
    if (child.type === 'code' && pendingCodeField) {
      fields.set(pendingCodeField, child.value ?? '')
      pendingCodeField = undefined
      continue
    }
    const labelled = readLabelledParagraph(child, context)
    if (!labelled || !['要求', '验收', '完成标准', '参考答案'].includes(labelled.label)) {
      fail(context, `exercise 包含未知字段或节点：${labelled?.label ?? child.type}`)
    }
    const field = labelled.label === '完成标准' ? '验收' : labelled.label
    if (pendingCodeField) fail(context, `${pendingCodeField}标签后必须紧跟代码块`)
    if (!labelled.value) {
      pendingCodeField = field
      continue
    }
    fields.set(field, labelled.value)
  }
  if (pendingCodeField) fail(context, `${pendingCodeField}标签后缺少代码块`)
  if (!fields.get('要求') || !fields.get('验收')) fail(context, 'exercise 缺少要求或验收')
  return {
    type: 'exercise',
    title: phrasingText(heading, context),
    instructions: fields.get('要求')!,
    acceptance: fields.get('验收')!,
    answer: fields.get('参考答案'),
  }
}

/** 将 steps directive 转换为按三级标题分段的步骤列表。 */
function convertSteps(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  if (Object.keys(node.attributes ?? {}).length > 0) fail(context, 'steps 不接受属性')
  const items: { title: string; content: string }[] = []
  let title: string | undefined
  let content: string[] = []
  /** 将当前三级标题及其正文追加为一个完整步骤。 */
  const flush = () => {
    if (!title) return
    const value = content.join('\n').trim()
    if (!value) fail(context, `steps「${title}」内容不能为空`)
    items.push({ title, content: value })
  }
  for (const child of childrenOf(node)) {
    if (child.type === 'heading' && child.depth === 3) {
      flush()
      title = phrasingText(child, context)
      content = []
      continue
    }
    if (!title) fail(context, 'steps 必须以三级标题开始')
    if (child.type === 'paragraph') content.push(phrasingText(child, context))
    else if (child.type === 'list') {
      content.push(listDirectiveText(convertList(child, context), 'steps', context))
    } else fail(context, `steps 不支持 AST 节点：${child.type}`)
  }
  flush()
  if (items.length === 0) fail(context, 'steps 至少需要一个步骤')
  return { type: 'steps', items }
}

/** 将单个具名代码块转换为默认折叠的完整示例。 */
function convertCodeDetails(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  const attributes = node.attributes ?? {}
  if (Object.keys(attributes).length !== 1 || typeof attributes.title !== 'string') {
    return fail(context, 'code-details 只接受一个非空 title 属性')
  }
  const title = attributes.title.trim()
  if (!title) return fail(context, 'code-details title 不能为空')
  const children = childrenOf(node)
  if (children.length !== 1 || children[0]?.type !== 'code') {
    return fail(context, 'code-details 必须且只能包含一个代码块')
  }
  const code = children[0]
  if (!code.lang) return fail(context, 'code-details 代码缺少语言')
  const content = (code.value ?? '').trimEnd()
  if (!content) return fail(context, 'code-details 代码不能为空')
  return { type: 'code-details', title, lang: code.lang, content }
}

/** 读取 demo 或 interactive directive 的唯一 ID 属性。 */
function directiveAssetId(node: MarkdownAstNode, context: ConversionContext): string {
  const attributes = node.attributes ?? {}
  if (Object.keys(attributes).length !== 1 || typeof attributes.id !== 'string') {
    return fail(context, `${node.name} 只接受一个非空 id 属性`)
  }
  if (!attributes.id) return fail(context, `${node.name} id 不能为空`)
  return attributes.id
}

/** 将原理动画 directive 转换为登记资产引用。 */
function convertPrinciple(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  const id = directiveAssetId(node, context)
  if (!(context.assets.principleIds ?? context.assets.interactiveIds).has(id)) {
    fail(context, `未知 principle ID：${id}`)
  }
  const content = childrenOf(node)
    .map((child) => {
      if (child.type !== 'paragraph') fail(context, `principle 不支持 AST 节点：${child.type}`)
      return phrasingText(child, context)
    })
    .join('\n')
    .trim()
  if (!content) fail(context, 'principle 内容不能为空')
  return { type: 'principle', id, content }
}

/** 将 demo directive 转换为登记资产引用。 */
function convertDemo(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  const attributes = node.attributes ?? {}
  if (
    typeof attributes.id !== 'string' ||
    !attributes.id ||
    Object.keys(attributes).some((key) => !['id', 'playground'].includes(key)) ||
    (attributes.playground !== undefined &&
      !['true', 'false'].includes(attributes.playground ?? ''))
  ) {
    fail(context, 'demo 只接受非空 id 与可选 playground 布尔属性')
  }
  const id = attributes.id
  if (!context.assets.demoIds.has(id)) fail(context, `未知 demo ID：${id}`)
  if (context.assets.demoIdsByModule) {
    const parts = context.sourcePath.split('/')
    const moduleKey = `${parts[2]}/${parts[3]}/${parts[4]}`
    if (!context.assets.demoIdsByModule.get(moduleKey)?.has(id)) {
      fail(context, `当前模块未登记 demo ID：${id}`)
    }
  }
  const description = childrenOf(node)
    .map((child) => {
      if (child.type !== 'paragraph') fail(context, `demo 不支持 AST 节点：${child.type}`)
      return phrasingText(child, context)
    })
    .join('\n')
    .trim()
  return {
    type: 'demo',
    id,
    description: description || undefined,
    playground: attributes.playground === undefined ? undefined : attributes.playground === 'true',
  }
}

/** 将 interactive directive 转换为登记资产引用。 */
function convertInteractive(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  const id = directiveAssetId(node, context)
  if (childrenOf(node).length > 0) fail(context, 'interactive 不接受正文')
  if (!context.assets.interactiveIds.has(id)) fail(context, `未知 interactive ID：${id}`)
  return { type: 'interactive', id }
}

/** 将一个允许的容器 directive 转换为现有内容块。 */
function convertDirective(node: MarkdownAstNode, context: ConversionContext): ContentBlock {
  if (!node.name || !directiveNames.has(node.name)) {
    return fail(context, `未知 directive：${node.name ?? '<missing>'}`)
  }
  rejectNestedDirectives(node, context)
  if (node.name === 'tip' || node.name === 'warning') return convertTip(node, context)
  if (node.name === 'pitfalls') return convertPitfalls(node, context)
  if (node.name === 'compare') return convertCompare(node, context)
  if (node.name === 'exercise') return convertExercise(node, context)
  if (node.name === 'steps') return convertSteps(node, context)
  if (node.name === 'code-details') return convertCodeDetails(node, context)
  if (node.name === 'demo') return convertDemo(node, context)
  if (node.name === 'principle') return convertPrinciple(node, context)
  return convertInteractive(node, context)
}

/** 将根级 mdast 节点穷尽式转换为现有 ContentBlock。 */
export function convertMarkdownBlocks(
  nodes: MarkdownAstNode[],
  sourcePath: string,
  assets: MarkdownAssetAllowlist,
): ContentBlock[] {
  const context = { sourcePath, assets }
  const blocks: ContentBlock[] = []
  for (const node of nodes) {
    if (node.type === 'heading') {
      if (node.depth !== 2 && node.depth !== 3) {
        fail(context, `正文只允许二级或三级标题，收到 H${node.depth}`)
      }
      blocks.push({
        type: 'heading',
        content: phrasingText(node, context),
        depth: node.depth,
      })
    } else if (node.type === 'paragraph') {
      blocks.push({ type: 'text', content: phrasingText(node, context) })
    } else if (node.type === 'list') {
      blocks.push(convertList(node, context))
    } else if (node.type === 'code') {
      if (!node.lang) fail(context, '课程代码块必须声明语言')
      blocks.push({ type: 'code', lang: node.lang, content: node.value ?? '' })
    } else if (node.type === 'table') {
      blocks.push(convertTable(node, context))
    } else if (node.type === 'containerDirective') {
      blocks.push(convertDirective(node, context))
    } else if (node.type === 'html') {
      fail(context, '禁止任意 HTML 或 Vue 模板')
    } else if (node.type === 'textDirective' || node.type === 'leafDirective') {
      fail(context, `禁止非容器 directive：${node.name ?? node.type}`)
    } else {
      fail(context, `不支持的根级 AST 节点：${node.type}`)
    }
  }
  return blocks
}

/** 使用受控行内节点规则读取标题文本。 */
export function readMarkdownHeadingText(node: MarkdownAstNode, sourcePath: string): string {
  const context: ConversionContext = {
    sourcePath,
    assets: { demoIds: new Set(), interactiveIds: new Set() },
  }
  if (node.type !== 'heading') fail(context, `预期 heading，收到 ${node.type}`)
  return phrasingText(node, context)
}

/** 返回根级二级标题的稳定文本列表。 */
export function collectSecondLevelHeadings(nodes: MarkdownAstNode[], sourcePath: string): string[] {
  return nodes
    .filter((node) => node.type === 'heading' && node.depth === 2)
    .map((node) => readMarkdownHeadingText(node, sourcePath))
}

/** 返回指定二级标题之后首个普通列表的条目。 */
export function collectSectionList(
  nodes: MarkdownAstNode[],
  heading: string,
  sourcePath: string,
): string[] {
  const context: ConversionContext = {
    sourcePath,
    assets: { demoIds: new Set(), interactiveIds: new Set() },
  }
  const headingIndex = nodes.findIndex(
    (node) =>
      node.type === 'heading' && node.depth === 2 && phrasingText(node, context) === heading,
  )
  if (headingIndex < 0) return []
  const sectionNodes = nodes.slice(headingIndex + 1)
  const list = sectionNodes.find((node) => {
    if (node.type === 'heading') return false
    return node.type === 'list'
  })
  if (
    !list ||
    sectionNodes.slice(0, sectionNodes.indexOf(list)).some((node) => node.type === 'heading')
  ) {
    return []
  }
  if (childrenOf(list).some((item) => typeof item.checked === 'boolean')) {
    fail(context, `${heading} 必须使用普通列表`)
  }
  return childrenOf(list).map((item) => listItemText(item, context))
}
