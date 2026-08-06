import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_CAPABILITY_NORMALIZATION_DIRECTORY
  ? path.resolve(process.env.DZZZ_CAPABILITY_NORMALIZATION_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_CAPABILITY_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_CAPABILITY_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-java-language-signoff.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const sourceInventoryFileName = 'capability-normalization-source-inventory.jsonl'
const matrixJsonFileName = 'java-language-capability-matrix.json'
const matrixMarkdownFileName = 'java-language-capability-matrix.md'
const manifestFileName = 'phase-1d-java-language-manifest.json'
const snapshotId = 'dzzz-app-20260803-179e722831ab'
const analysisId = 'dzzz-app-analysis-20260803-958d37cf1be1'
const batchId = 'phase-1d-java-language'
const reviewedAt = '2026-08-04T09:02:48.000Z'

const reviewSources = [
  ['single', 'phase-1c-startup-config.json'],
  ['sharded', 'phase-1c-web-entry'],
  ['sharded', 'phase-1c-business-layer'],
  ['sharded', 'phase-1c-data-access'],
  ['sharded', 'phase-1c-data-model'],
  ['sharded', 'phase-1c-cross-cutting'],
  ['sharded', 'phase-1c-async-integration'],
  ['sharded', 'phase-1c-infrastructure'],
  ['sharded', 'phase-1c-common-code'],
  ['sharded', 'phase-1c-test'],
]

const sourceKindOrder = [
  'review-capability',
  'language-feature',
  'framework-usage',
  'review-risk',
]

const sourcePrefixes = {
  'review-capability': 'CAP',
  'language-feature': 'LANG',
  'framework-usage': 'FRAME',
  'review-risk': 'RISK',
}

const expectedCapabilities = [
  {
    capabilityId: 'JAVA-LANG-001',
    name: '类、对象、字段与封装',
    sources: [
      ['review-capability', 'Java 类与字段封装'],
      ['review-capability', '普通 Java 数据对象'],
    ],
    prerequisites: [],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-002',
    name: '对象创建与普通类生命周期',
    sources: [
      ['review-capability', '显式对象创建'],
      ['review-capability', '普通类生命周期'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-003',
    name: '接口、抽象类型与多态',
    sources: [
      ['review-capability', 'Java 接口'],
      ['review-capability', '接口合同'],
      ['review-capability', '接口与抽象类'],
      ['review-capability', '多态'],
      ['review-capability', '多态与实现替换'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-004',
    name: '继承与方法覆写',
    sources: [
      ['review-capability', '继承'],
      ['review-capability', '继承与覆写'],
      ['review-capability', '模型继承'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-005',
    name: '枚举类型',
    sources: [
      ['review-capability', 'Java enum'],
      ['review-capability', '枚举合同'],
      ['review-capability', '嵌套枚举'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-006',
    name: '泛型声明、边界与泛型方法',
    sources: [
      ['review-capability', 'Java 泛型'],
      ['review-capability', '泛型'],
      ['review-capability', '泛型边界'],
      ['review-capability', '泛型方法'],
      ['review-capability', '泛型接口'],
      ['language-feature', 'generic-declaration'],
    ],
    prerequisites: ['JAVA-LANG-001', 'JAVA-LANG-003'],
    recommendedStage: 'intermediate',
  },
  {
    capabilityId: 'JAVA-LANG-007',
    name: '注解声明、使用与元注解',
    sources: [
      ['review-capability', '注解'],
      ['review-capability', 'Java 注解元数据'],
      ['review-capability', '注解目标与保留策略'],
      ['language-feature', 'annotation-use'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-008',
    name: 'Lambda 表达式与方法引用',
    sources: [
      ['review-capability', 'Lambda'],
      ['language-feature', 'lambda'],
      ['language-feature', 'method-reference'],
    ],
    prerequisites: ['JAVA-LANG-003'],
    recommendedStage: 'intermediate',
  },
  {
    capabilityId: 'JAVA-LANG-009',
    name: '异常层级、抛出与捕获',
    sources: [
      ['review-capability', '异常层级'],
      ['review-capability', '异常合同'],
      ['language-feature', 'catch-clause'],
      ['language-feature', 'throw'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-010',
    name: 'switch 分支',
    sources: [['language-feature', 'switch']],
    prerequisites: [],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-011',
    name: '增强 for 循环',
    sources: [['language-feature', 'enhanced-for']],
    prerequisites: [],
    recommendedStage: 'basic',
  },
  {
    capabilityId: 'JAVA-LANG-012',
    name: '成员类与匿名类体',
    sources: [
      ['review-capability', '成员类'],
      ['language-feature', 'anonymous-class-body'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'intermediate',
  },
  {
    capabilityId: 'JAVA-LANG-013',
    name: 'synchronized 同步块',
    sources: [['language-feature', 'synchronized-block']],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'advanced',
  },
  {
    capabilityId: 'JAVA-LANG-014',
    name: 'try-with-resources',
    sources: [['language-feature', 'try-with-resources']],
    prerequisites: ['JAVA-LANG-009'],
    recommendedStage: 'intermediate',
  },
  {
    capabilityId: 'JAVA-LANG-015',
    name: '常量与不可变数据',
    sources: [
      ['review-capability', '常量'],
      ['review-capability', '不可变数据'],
    ],
    prerequisites: ['JAVA-LANG-001'],
    recommendedStage: 'basic',
  },
]

/** 断言独立校验合同成立。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 解析非空 JSON Lines。 */
function parseJsonLines(content, sourceName) {
  assert(content.trim().length > 0, `${sourceName} 为空`)
  return content.trim().split('\n').map(JSON.parse)
}

/** 独立读取十批人工复核记录。 */
function readReviewedRecords() {
  const records = []
  const reviewsDirectory = path.join(auditDirectory, 'reviews')
  for (const [kind, relativePath] of reviewSources) {
    if (kind === 'single') {
      const ledger = readJson(path.join(reviewsDirectory, relativePath))
      records.push(...ledger.records.map((record) => ({ ...record, reviewBatch: ledger.batchId })))
      continue
    }
    const directory = path.join(reviewsDirectory, relativePath)
    const manifest = readJson(path.join(directory, 'manifest.json'))
    for (const shard of manifest.shards) {
      const content = fs.readFileSync(path.join(directory, shard.fileName), 'utf8')
      assert(sha256(content) === shard.sha256, `${relativePath}/${shard.fileName} 哈希错误`)
      records.push(
        ...parseJsonLines(content, shard.fileName).map((record) => ({
          ...record,
          reviewBatch: manifest.batchId,
        })),
      )
    }
  }
  records.sort((left, right) => left.inventoryIndex - right.inventoryIndex)
  assert(records.length === 3436, `复核记录数错误：${records.length}`)
  assert(new Set(records.map((record) => record.path)).size === 3436, '复核路径不唯一')
  assert(records.every((record) => record.auditStatus === 'reviewed'), '复核状态没有全量完成')
  return records
}

/** 独立读取七个自动提取分片。 */
function readExtractedRecords() {
  const manifest = readJson(extractionManifestPath)
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, '自动提取身份错误')
  const records = []
  for (const shard of manifest.shards) {
    const content = fs.readFileSync(path.join(auditDirectory, 'extracted', shard.fileName), 'utf8')
    assert(sha256(content) === shard.sha256, `${shard.fileName} 哈希错误`)
    records.push(...parseJsonLines(content, shard.fileName))
  }
  records.sort((left, right) => left.inventoryIndex - right.inventoryIndex)
  assert(records.length === 3436, `提取记录数错误：${records.length}`)
  assert(new Set(records.map((record) => record.path)).size === 3436, '提取路径不唯一')
  return records
}

/** 聚合一条独立原始输入证据。 */
function addObservation(groups, sourceKind, key, label, filePath, options = {}) {
  const groupKey = `${sourceKind}\u0000${key}`
  const current = groups.get(groupKey) ?? {
    sourceKind,
    key,
    label,
    observedFiles: new Set(),
    evidenceBatches: new Set(),
    categories: new Set(),
  }
  assert(current.label === label, `原始输入键冲突：${sourceKind}/${key}`)
  current.observedFiles.add(filePath)
  if (options.reviewBatch) current.evidenceBatches.add(options.reviewBatch)
  if (options.category) current.categories.add(options.category)
  groups.set(groupKey, current)
}

/** 从两类事实源独立重建四类原始输入。 */
function deriveSourceGroups(reviewedRecords, extractedRecords) {
  const groups = new Map()
  for (const record of reviewedRecords) {
    for (const capability of record.capabilityCandidates ?? []) {
      addObservation(groups, 'review-capability', capability, capability, record.path, {
        reviewBatch: record.reviewBatch,
      })
    }
    for (const risk of record.riskCandidates ?? []) {
      addObservation(groups, 'review-risk', sha256(risk.summary), risk.summary, record.path, {
        reviewBatch: record.reviewBatch,
        category: risk.category ?? 'uncategorized',
      })
    }
  }
  for (const record of extractedRecords) {
    for (const feature of record.languageFeatures) {
      addObservation(groups, 'language-feature', feature.id, feature.id, record.path)
    }
    for (const usage of record.frameworkUsages) {
      addObservation(groups, 'framework-usage', usage.id, usage.id, record.path)
    }
  }
  return groups
}

/** 返回独立原始输入的稳定排序。 */
function compareGroups(left, right) {
  const kindDifference =
    sourceKindOrder.indexOf(left.sourceKind) - sourceKindOrder.indexOf(right.sourceKind)
  return kindDifference || left.key.localeCompare(right.key, 'zh-CN')
}

/** 从独立能力合同建立唯一映射。 */
function deriveAssignments(groups) {
  const assignments = new Map()
  const capabilityIds = new Set(expectedCapabilities.map((capability) => capability.capabilityId))
  assert(capabilityIds.size === 15, '独立能力 ID 不唯一')
  for (const capability of expectedCapabilities) {
    for (const [sourceKind, key] of capability.sources) {
      const sourceKey = `${sourceKind}\u0000${key}`
      assert(groups.has(sourceKey), `独立合同引用不存在的输入：${sourceKind}/${key}`)
      assert(!assignments.has(sourceKey), `独立合同重复映射：${sourceKind}/${key}`)
      assignments.set(sourceKey, capability.capabilityId)
    }
    for (const prerequisite of capability.prerequisites) {
      assert(capabilityIds.has(prerequisite), `独立前置能力不存在：${prerequisite}`)
    }
  }
  assert(assignments.size === 40, `独立映射数错误：${assignments.size}`)
  return assignments
}

/** 独立生成 906 条带状态的原始输入。 */
function deriveSourceInventory(groups, assignments) {
  const counters = new Map()
  const inventory = [...groups.values()].sort(compareGroups).map((group) => {
    const next = (counters.get(group.sourceKind) ?? 0) + 1
    counters.set(group.sourceKind, next)
    const capabilityId = assignments.get(`${group.sourceKind}\u0000${group.key}`) ?? null
    return {
      sourceId: `${sourcePrefixes[group.sourceKind]}-${String(next).padStart(4, '0')}`,
      sourceKind: group.sourceKind,
      key: group.key,
      label: group.label,
      normalizationStatus: capabilityId ? 'normalized' : 'pending',
      capabilityId,
      observedFileCount: group.observedFiles.size,
      observedFiles: [...group.observedFiles].sort(),
      ...(group.evidenceBatches.size > 0
        ? { evidenceBatches: [...group.evidenceBatches].sort() }
        : {}),
      ...(group.categories.size > 0 ? { categories: [...group.categories].sort() } : {}),
    }
  })
  assert(inventory.length === 906, `独立原始输入数错误：${inventory.length}`)
  assert(inventory.filter((source) => source.normalizationStatus === 'normalized').length === 40, '完成输入数错误')
  return inventory
}

/** 从独立提取事实取得代表符号。 */
function deriveSymbol(filePath, extractedByPath) {
  const record = extractedByPath.get(filePath)
  const declaredType = record?.declaredTypes?.find((type) => type.owner === null)
  return {
    symbol: declaredType?.qualifiedName ?? path.basename(filePath, '.java'),
    path: filePath,
  }
}

/** 独立选择每项最多五个代表符号。 */
function deriveRepresentativeSymbols(sources, extractedByPath) {
  const selectedPaths = []
  for (const source of sources) {
    if (selectedPaths.length >= 5) break
    const firstUnusedPath = source.observedFiles.find((filePath) => !selectedPaths.includes(filePath))
    if (firstUnusedPath) selectedPaths.push(firstUnusedPath)
  }
  const allPaths = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
  for (const filePath of allPaths) {
    if (selectedPaths.length >= 5) break
    if (!selectedPaths.includes(filePath)) selectedPaths.push(filePath)
  }
  return selectedPaths.slice(0, 5).map((filePath) => deriveSymbol(filePath, extractedByPath))
}

/** 独立构建 15 条规范能力记录。 */
function deriveCapabilities(sourceInventory, extractedRecords) {
  const sourceByKey = new Map(
    sourceInventory.map((source) => [`${source.sourceKind}\u0000${source.key}`, source]),
  )
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  return expectedCapabilities.map((expected) => {
    const sources = expected.sources.map(([sourceKind, key]) => {
      const source = sourceByKey.get(`${sourceKind}\u0000${key}`)
      assert(source, `独立能力缺少输入：${expected.capabilityId}/${sourceKind}/${key}`)
      return source
    })
    const observedFiles = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
    return {
      capabilityId: expected.capabilityId,
      name: expected.name,
      kind: 'java-language',
      observedFileCount: observedFiles.length,
      observedFiles,
      representativeSymbols: deriveRepresentativeSymbols(sources, extractedByPath),
      normalizedFrom: sources.map((source) => ({
        sourceId: source.sourceId,
        sourceKind: source.sourceKind,
        key: source.key,
        label: source.label,
        observedFileCount: source.observedFileCount,
      })),
      modernBaseline: { java: '25 LTS' },
      legacyBaseline: { java: '8' },
      prerequisites: expected.prerequisites,
      recommendedStage: expected.recommendedStage,
      exampleStatus: 'not-started',
      researchStatus: 'not-started',
      courseStatus: 'candidate',
    }
  })
}

/** 把阶段代码转换为矩阵中的中文标签。 */
function stageLabel(stage) {
  return { basic: '基础', intermediate: '中级', advanced: '高级' }[stage]
}

/** 独立生成 Markdown 摘要的精确内容合同。 */
function deriveMarkdown(matrix, sourceKindCounts) {
  const lines = [
    '# `dzzz-app` Java 语言能力矩阵',
    '',
    '> 批次：Phase 1D 第 1 批：Java 语言能力归一化',
    `> 源码快照：\`${snapshotId}\``,
    `> 自动分析：\`${analysisId}\``,
    '> 状态：首批已归一化，研究与课程正文尚未开始',
    '',
    '## 1. 本批边界',
    '',
    '十批人工台账与自动提取共形成 906 个唯一原始输入：',
    '',
    `- 文件级能力候选：${sourceKindCounts['review-capability']} 个；`,
    `- Java 语言特征信号：${sourceKindCounts['language-feature']} 个；`,
    `- 框架使用信号：${sourceKindCounts['framework-usage']} 个；`,
    `- 唯一风险说明：${sourceKindCounts['review-risk']} 个。`,
    '',
    `本批只把其中 ${matrix.summary.normalizedSourceItemCount} 个语言输入合并为 ${matrix.summary.capabilityCount} 个规范能力。`,
    `其余 ${matrix.summary.pendingSourceItemCount} 个输入保持 \`pending\`，留给标准库、框架、工程模式和风险反例批次。`,
    '原始输入清单保留全部证据文件，不因别名合并丢失路径。',
    '',
    '## 2. 规范能力',
    '',
  ]
  for (const capability of matrix.capabilities) {
    lines.push(
      `### ${capability.capabilityId} ${capability.name}`,
      '',
      `- 类型：\`${capability.kind}\`；推荐阶段：${stageLabel(capability.recommendedStage)}。`,
      `- 项目证据：${capability.observedFileCount} 个文件；原始输入：${capability.normalizedFrom.length} 个。`,
      `- 现代基线：Java ${capability.modernBaseline.java}；项目补充：Java ${capability.legacyBaseline.java}。`,
      `- 前置能力：${capability.prerequisites.length > 0 ? capability.prerequisites.map((id) => `\`${id}\``).join('、') : '本批内无'}。`,
      `- 状态：研究 \`${capability.researchStatus}\`，示例 \`${capability.exampleStatus}\`，课程 \`${capability.courseStatus}\`。`,
      `- 合并来源：${capability.normalizedFrom.map((source) => `\`${source.sourceKind}:${source.label}\``).join('、')}。`,
      '- 代表符号：',
      ...capability.representativeSymbols.map(
        (symbol) => `  - \`${symbol.symbol}\`：\`${symbol.path}\``,
      ),
      '',
    )
  }
  lines.push(
    '## 3. 当前边界',
    '',
    '- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。',
    '- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。',
    '- 具体语法规则、API 合同、易错点和开发技巧必须在 Phase 2 后按来源规范逐项在线核验。',
    '- 本批不处理标准库、Spring、MyBatis、工程模式、项目示例和风险反例。',
    '- Phase 1D 尚未完成，Gate 1 仍未通过。',
    '',
    '下一批只能继续处理标准库能力归一化，不能开始课程正文、菜单或 Markdown adapter。',
  )
  return lines.join('\n')
}

/** 验证人工签核的身份、方法和精确产物绑定。 */
function validateSignoff(signoff, artifactHashes) {
  assert(signoff.schemaVersion === 1, '签核 schemaVersion 错误')
  assert(signoff.snapshotId === snapshotId && signoff.analysisId === analysisId, '签核快照身份错误')
  assert(signoff.batchId === batchId && signoff.status === 'approved', '签核批次或状态错误')
  assert(signoff.reviewedBy === 'Codex', '签核审查者错误')
  assert(signoff.reviewerType === 'agent-assisted-manual-review', '签核审查类型错误')
  assert(signoff.reviewedAt === reviewedAt, '签核时间错误')
  assert(
    signoff.reviewMethod ===
      '核对 906 个原始输入分母、27731 条文件关联，并逐项确认 40 个语言输入只映射到 15 个规范 Java 语言能力一次。',
    '签核方法错误',
  )
  assert(
    signoff.approvalContract ===
      '人工签核必须同时绑定原始输入清单、结构化矩阵和 Markdown 摘要的 SHA-256；未映射输入保持 pending。',
    '签核批准合同错误',
  )
  assert(
    JSON.stringify(signoff.summary) ===
      JSON.stringify({
        rawSourceItemCount: 906,
        normalizedSourceItemCount: 40,
        pendingSourceItemCount: 866,
        capabilityCount: 15,
      }),
    '签核汇总错误',
  )
  assert(signoff.artifacts.length === 3, '签核产物数错误')
  assert(
    JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(Object.keys(artifactHashes).sort()),
    '签核产物路径集合错误',
  )
  for (const artifact of signoff.artifacts) {
    assert(artifactHashes[artifact.path] === artifact.sha256, `签核产物哈希错误：${artifact.path}`)
  }
}

/** 独立重建所有正式产物并逐字节核对。 */
function validate() {
  const reviewedRecords = readReviewedRecords()
  const extractedRecords = readExtractedRecords()
  for (let index = 0; index < reviewedRecords.length; index += 1) {
    assert(reviewedRecords[index].path === extractedRecords[index].path, `记录路径错位：${index + 1}`)
    assert(reviewedRecords[index].sourceSha256 === extractedRecords[index].sourceSha256, `源码身份错位：${reviewedRecords[index].path}`)
  }
  const groups = deriveSourceGroups(reviewedRecords, extractedRecords)
  const assignments = deriveAssignments(groups)
  const sourceInventory = deriveSourceInventory(groups, assignments)
  const sourceKindCounts = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      sourceInventory.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  const sourceKindFileAssignments = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      sourceInventory
        .filter((source) => source.sourceKind === sourceKind)
        .reduce((total, source) => total + source.observedFileCount, 0),
    ]),
  )
  assert(
    JSON.stringify(sourceKindCounts) ===
      JSON.stringify({
        'review-capability': 550,
        'language-feature': 16,
        'framework-usage': 21,
        'review-risk': 319,
      }),
    '原始输入分类分母错误',
  )
  assert(Object.values(sourceKindFileAssignments).reduce((sum, count) => sum + count, 0) === 27731, '文件关联总数错误')
  const capabilities = deriveCapabilities(sourceInventory, extractedRecords)
  const normalizedObservedFiles = new Set(capabilities.flatMap((capability) => capability.observedFiles))
  const matrix = {
    schemaVersion: 1,
    snapshotId,
    analysisId,
    batchId,
    reviewedAt,
    matrixKind: 'java-language',
    summary: {
      rawSourceItemCount: 906,
      normalizedSourceItemCount: 40,
      pendingSourceItemCount: 866,
      capabilityCount: 15,
      normalizedObservedFileCount: normalizedObservedFiles.size,
      representativeSymbolCount: capabilities.reduce(
        (total, capability) => total + capability.representativeSymbols.length,
        0,
      ),
    },
    capabilities,
  }
  assert(matrix.summary.normalizedObservedFileCount === 3414, '规范能力证据文件并集错误')
  assert(matrix.summary.representativeSymbolCount === 74, '代表符号总数错误')
  const sourceInventoryContent = `${sourceInventory.map((source) => JSON.stringify(source)).join('\n')}\n`
  const matrixJsonContent = `${JSON.stringify(matrix, null, 2)}\n`
  const matrixMarkdownContent = `${deriveMarkdown(matrix, sourceKindCounts)}\n`
  const artifactHashes = {
    [sourceInventoryFileName]: sha256(sourceInventoryContent),
    [matrixJsonFileName]: sha256(matrixJsonContent),
    [matrixMarkdownFileName]: sha256(matrixMarkdownContent),
  }
  const actualSourceInventory = fs.readFileSync(path.join(outputDirectory, sourceInventoryFileName), 'utf8')
  const actualMatrixJson = fs.readFileSync(path.join(outputDirectory, matrixJsonFileName), 'utf8')
  const actualMatrixMarkdown = fs.readFileSync(path.join(outputDirectory, matrixMarkdownFileName), 'utf8')
  assert(actualSourceInventory === sourceInventoryContent, '原始输入清单内容不一致')
  assert(actualMatrixJson === matrixJsonContent, 'Java 语言能力矩阵内容不一致')
  assert(actualMatrixMarkdown === matrixMarkdownContent, 'Java 语言能力 Markdown 内容不一致')
  const signoff = readJson(signoffPath)
  validateSignoff(signoff, artifactHashes)
  const signoffBytes = `${JSON.stringify(signoff, null, 2)}\n`
  const expectedManifest = {
    schemaVersion: 1,
    snapshotId,
    analysisId,
    batchId,
    status: 'completed',
    reviewedAt,
    gateStatus: 'not-passed',
    sourceInventory: {
      path: sourceInventoryFileName,
      sha256: artifactHashes[sourceInventoryFileName],
      itemCount: 906,
      observedFileAssignments: 27731,
      sourceKindCounts,
      sourceKindFileAssignments,
    },
    matrix: {
      jsonPath: matrixJsonFileName,
      jsonSha256: artifactHashes[matrixJsonFileName],
      markdownPath: matrixMarkdownFileName,
      markdownSha256: artifactHashes[matrixMarkdownFileName],
      ...matrix.summary,
    },
    manualReviewSignoff: {
      path: 'reviews/phase-1d-java-language-signoff.json',
      sha256: sha256(signoffBytes),
      reviewedBy: signoff.reviewedBy,
      reviewerType: signoff.reviewerType,
    },
    coverageBoundary: {
      normalizedKinds: ['java-language'],
      pendingKinds: ['standard-library', 'framework', 'engineering-pattern', 'review-risk'],
      nextBatch: 'standard-library',
      courseAuthoringStarted: false,
    },
  }
  const actualManifest = fs.readFileSync(path.join(outputDirectory, manifestFileName), 'utf8')
  assert(actualManifest === `${JSON.stringify(expectedManifest, null, 2)}\n`, '归一化 manifest 内容不一致')
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId,
      rawSourceItemCount: 906,
      normalizedSourceItemCount: 40,
      pendingSourceItemCount: 866,
      capabilityCount: 15,
      normalizedObservedFileCount: 3414,
      gateStatus: 'not-passed',
    }),
  )
}

validate()
