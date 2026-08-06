import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { frameworkCapabilities, batchMetadata } from './framework-capability-catalog.mjs'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_FRAMEWORK_NORMALIZATION_DIRECTORY
  ? path.resolve(process.env.DZZZ_FRAMEWORK_NORMALIZATION_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_FRAMEWORK_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_FRAMEWORK_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-framework-signoff.json')
const previousManifestPath = path.join(auditDirectory, 'phase-1d-standard-library-manifest.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const sourceInventoryFileName = 'framework-capability-source-inventory.jsonl'
const matrixJsonFileName = 'java-framework-capability-matrix.json'
const matrixMarkdownFileName = 'java-framework-capability-matrix.md'
const manifestFileName = 'phase-1d-framework-manifest.json'
const previousSourceInventorySha256 =
  'a9f55eb514c827e4cbf1316f79f031e677e03ea0fb6afe0aae7ffc075ba4aebe'
const previousManifestSha256 = '24b0c25cb19b4c765bdd36f04599391960251606a539a9c9c6a0de0235bf8784'
const sourceKindOrder = ['review-capability', 'language-feature', 'framework-usage', 'review-risk']

/** 断言构建合同成立。 */
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

/** 解析构建命令参数。 */
function parseArguments(argumentsList) {
  const allowed = new Set(['--check', '--prepare'])
  for (const argument of argumentsList) assert(allowed.has(argument), `未知参数：${argument}`)
  assert(
    !(argumentsList.includes('--check') && argumentsList.includes('--prepare')),
    '--check 与 --prepare 不能同时使用',
  )
  return {
    check: argumentsList.includes('--check'),
    prepare: argumentsList.includes('--prepare'),
  }
}

/** 验证上一批 manifest 并读取其 754 个 pending 输入。 */
function readPreviousPendingInventory() {
  const manifestContent = fs.readFileSync(previousManifestPath, 'utf8')
  assert(sha256(manifestContent) === previousManifestSha256, '上一批 manifest 哈希错误')
  const manifest = JSON.parse(manifestContent)
  assert(manifest.batchId === 'phase-1d-standard-library', '上一批 batchId 错误')
  assert(manifest.status === 'completed' && manifest.gateStatus === 'not-passed', '上一批状态错误')
  assert(manifest.snapshotId === batchMetadata.snapshotId, '上一批快照错误')
  assert(manifest.analysisId === batchMetadata.analysisId, '上一批分析 ID 错误')
  assert(manifest.sourceInventory.itemCount === 866, '上一批原始输入数错误')
  assert(manifest.matrix.normalizedSourceItemCount === 112, '上一批完成输入数错误')
  assert(manifest.matrix.pendingSourceItemCount === 754, '上一批 pending 分母错误')
  assert(manifest.coverageBoundary.nextBatch === 'framework', '上一批后继批次错误')

  const sourcePath = path.join(auditDirectory, manifest.sourceInventory.path)
  const sourceContent = fs.readFileSync(sourcePath, 'utf8')
  assert(sha256(sourceContent) === previousSourceInventorySha256, '上一批原始输入清单哈希错误')
  assert(
    manifest.sourceInventory.sha256 === previousSourceInventorySha256,
    '上一批 manifest 未绑定清单',
  )
  const sourceInventory = parseJsonLines(sourceContent, manifest.sourceInventory.path)
  assert(sourceInventory.length === 866, '上一批原始输入清单行数错误')
  assert(
    new Set(sourceInventory.map((source) => source.sourceId)).size === 866,
    '上一批 sourceId 不唯一',
  )
  assert(
    sourceInventory.filter((source) => source.normalizationStatus === 'normalized').length === 112,
    '上一批 normalized 输入数错误',
  )
  const pending = sourceInventory.filter((source) => source.normalizationStatus === 'pending')
  assert(pending.length === 754, `上一批 pending 输入数错误：${pending.length}`)
  assert(
    pending.every((source) => source.capabilityId === null),
    '上一批 pending 输入已有能力 ID',
  )
  return pending
}

/** 读取七个自动提取分片并验证身份和哈希。 */
function readExtractedRecords() {
  const manifest = readJson(extractionManifestPath)
  assert(manifest.snapshotId === batchMetadata.snapshotId, '自动提取快照错误')
  assert(manifest.analysisId === batchMetadata.analysisId, '自动提取分析 ID 错误')
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

/** 从人工目录建立每个原始输入到框架与第三方库能力的唯一映射。 */
function buildAssignments(pendingInventory) {
  const pendingKeys = new Set(
    pendingInventory.map((source) => `${source.sourceKind}\u0000${source.key}`),
  )
  const assignments = new Map()
  const capabilityIds = new Set(frameworkCapabilities.map((capability) => capability.capabilityId))
  assert(capabilityIds.size === 34, '框架与第三方库能力 ID 不唯一')
  for (const capability of frameworkCapabilities) {
    assert(capability.kind === 'framework-library', `能力类型错误：${capability.capabilityId}`)
    for (const [sourceKind, key] of capability.sources) {
      assert(
        sourceKind === 'review-capability' || sourceKind === 'framework-usage',
        `本批越界输入：${sourceKind}/${key}`,
      )
      const sourceKey = `${sourceKind}\u0000${key}`
      assert(pendingKeys.has(sourceKey), `目录引用不存在的 pending 输入：${sourceKind}/${key}`)
      assert(!assignments.has(sourceKey), `目录重复映射：${sourceKind}/${key}`)
      assignments.set(sourceKey, capability.capabilityId)
    }
    for (const prerequisite of capability.prerequisites) {
      assert(
        prerequisite.startsWith('JAVA-LANG-') ||
          prerequisite.startsWith('JAVA-STDLIB-') ||
          capabilityIds.has(prerequisite),
        `前置能力不存在：${capability.capabilityId}/${prerequisite}`,
      )
    }
  }
  assert(assignments.size === 235, '独立映射数错误')
  return assignments
}

/** 为本批 754 个输入写入归一化状态。 */
function buildSourceInventory(pendingInventory, assignments) {
  const inventory = pendingInventory.map((source) => {
    const capabilityId = assignments.get(`${source.sourceKind}\u0000${source.key}`) ?? null
    return {
      ...source,
      normalizationStatus: capabilityId ? 'normalized' : 'pending',
      capabilityId,
    }
  })
  assert(inventory.length === 754, '本批原始输入分母错误')
  assert(
    inventory.filter((source) => source.normalizationStatus === 'normalized').length === 235,
    '本批完成输入数错误',
  )
  assert(
    inventory.filter((source) => source.normalizationStatus === 'pending').length === 519,
    '本批 pending 输入数错误',
  )
  assert(
    inventory.every((source) =>
      source.observedFiles.every((filePath) => filePath.startsWith('dzzz-app/')),
    ),
    '原始输入包含 dzzz-app 外路径',
  )
  assert(
    inventory
      .filter((source) => source.sourceKind === 'framework-usage')
      .every((source) => source.normalizationStatus === 'normalized'),
    '框架输入没有全部归一化',
  )
  assert(
    inventory
      .filter((source) => source.sourceKind === 'review-risk')
      .every((source) => source.normalizationStatus === 'pending'),
    '风险输入被提前归一化',
  )
  return inventory
}

/** 从提取记录取得代表符号。 */
function representativeSymbol(filePath, extractedByPath) {
  const extracted = extractedByPath.get(filePath)
  assert(extracted, `代表文件不在冻结提取记录中：${filePath}`)
  const declaredType = extracted.declaredTypes?.find((type) => type.owner === null)
  return {
    symbol: declaredType?.qualifiedName ?? path.basename(filePath, '.java'),
    path: filePath,
  }
}

/** 为一个能力稳定选择最多五个代表符号。 */
function selectRepresentativeSymbols(sources, extractedByPath) {
  const selectedPaths = []
  for (const source of sources) {
    if (selectedPaths.length >= 5) break
    const firstUnusedPath = source.observedFiles.find(
      (filePath) => !selectedPaths.includes(filePath),
    )
    if (firstUnusedPath) selectedPaths.push(firstUnusedPath)
  }
  const union = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
  for (const filePath of union) {
    if (selectedPaths.length >= 5) break
    if (!selectedPaths.includes(filePath)) selectedPaths.push(filePath)
  }
  return selectedPaths.map((filePath) => representativeSymbol(filePath, extractedByPath))
}

/** 把人工目录与本批输入合并为规范能力矩阵。 */
function buildCapabilities(sourceInventory, extractedRecords) {
  const sourceByKey = new Map(
    sourceInventory.map((source) => [`${source.sourceKind}\u0000${source.key}`, source]),
  )
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  return frameworkCapabilities.map((catalogEntry) => {
    const sources = catalogEntry.sources.map(([sourceKind, key]) => {
      const source = sourceByKey.get(`${sourceKind}\u0000${key}`)
      assert(source, `能力缺少原始输入：${catalogEntry.capabilityId}/${sourceKind}/${key}`)
      assert(source.capabilityId === catalogEntry.capabilityId, '原始输入能力映射错位')
      return source
    })
    const observedFiles = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
    return {
      capabilityId: catalogEntry.capabilityId,
      name: catalogEntry.name,
      kind: catalogEntry.kind,
      observedFileCount: observedFiles.length,
      observedFiles,
      representativeSymbols: selectRepresentativeSymbols(sources, extractedByPath),
      normalizedFrom: sources.map((source) => ({
        sourceId: source.sourceId,
        sourceKind: source.sourceKind,
        key: source.key,
        label: source.label,
        observedFileCount: source.observedFileCount,
      })),
      modernBaseline: catalogEntry.modernBaseline,
      legacyBaseline: catalogEntry.legacyBaseline,
      prerequisites: catalogEntry.prerequisites,
      recommendedStage: catalogEntry.recommendedStage,
      exampleStatus: catalogEntry.exampleStatus,
      researchStatus: catalogEntry.researchStatus,
      courseStatus: catalogEntry.courseStatus,
    }
  })
}

/** 统计本批输入数量和文件关联数量。 */
function summarizeSources(sourceInventory) {
  const counts = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      sourceInventory.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  const fileAssignments = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      sourceInventory
        .filter((source) => source.sourceKind === sourceKind)
        .reduce((total, source) => total + source.observedFileCount, 0),
    ]),
  )
  assert(counts['review-capability'] === 414, '文件级能力候选分母错误')
  assert(counts['language-feature'] === 0, '语言信号分母错误')
  assert(counts['framework-usage'] === 21, '框架信号分母错误')
  assert(counts['review-risk'] === 319, '风险说明分母错误')
  assert(
    JSON.stringify(fileAssignments) ===
      JSON.stringify({
        'review-capability': 11019,
        'language-feature': 0,
        'framework-usage': 5300,
        'review-risk': 3152,
      }),
    '本批证据文件关联计数错误',
  )
  return { counts, fileAssignments }
}

/** 将课程阶段代码转换为中文。 */
function stageLabel(stage) {
  return { basic: '基础', intermediate: '中级', advanced: '高级' }[stage]
}

/** 生成适合人工阅读的框架与第三方库能力矩阵摘要。 */
function buildMarkdown(matrix, sourceSummary) {
  const lines = [
    '# `dzzz-app` Java 框架与第三方库能力矩阵',
    '',
    `> 批次：${batchMetadata.batchName}`,
    `> 源码快照：\`${batchMetadata.snapshotId}\``,
    `> 自动分析：\`${batchMetadata.analysisId}\``,
    '> 状态：框架批次已归一化，研究与课程正文尚未开始',
    '',
    '## 1. 本批边界',
    '',
    `本批输入严格来自上一批的 ${sourceSummary.total} 个 \`pending\` 输入：`,
    '',
    `- 文件级能力候选：${sourceSummary.counts['review-capability']} 个；`,
    `- 剩余 Java 语言信号：${sourceSummary.counts['language-feature']} 个；`,
    `- 框架使用信号：${sourceSummary.counts['framework-usage']} 个；`,
    `- 唯一风险说明：${sourceSummary.counts['review-risk']} 个。`,
    '',
    `本批把 ${matrix.summary.normalizedSourceItemCount} 个有直接 import、注解或配置 API 证据的输入合并为 ${matrix.summary.capabilityCount} 个框架与第三方库能力。`,
    `其余 ${matrix.summary.pendingSourceItemCount} 个输入继续保持 \`pending\`。`,
    '业务流程、设计模式、通用集成概念、风险说明和名实不符的残留候选均未提前归一化。',
    '',
    '## 2. 规范能力',
    '',
  ]
  for (const capabilityItem of matrix.capabilities) {
    lines.push(
      `### ${capabilityItem.capabilityId} ${capabilityItem.name}`,
      '',
      `- 类型：\`${capabilityItem.kind}\`；推荐阶段：${stageLabel(capabilityItem.recommendedStage)}。`,
      `- 项目证据：${capabilityItem.observedFileCount} 个文件；原始输入：${capabilityItem.normalizedFrom.length} 个。`,
      `- 现代基线：Java ${capabilityItem.modernBaseline.java}；项目补充：Java ${capabilityItem.legacyBaseline.java}。`,
      `- 前置能力：${capabilityItem.prerequisites.length > 0 ? capabilityItem.prerequisites.map((id) => `\`${id}\``).join('、') : '本批内无'}。`,
      `- 状态：研究 \`${capabilityItem.researchStatus}\`，示例 \`${capabilityItem.exampleStatus}\`，课程 \`${capabilityItem.courseStatus}\`。`,
      `- 合并来源：${capabilityItem.normalizedFrom.map((source) => `\`${source.sourceKind}:${source.label}\``).join('、')}。`,
      '- 代表符号：',
      ...capabilityItem.representativeSymbols.map(
        (symbol) => `  - \`${symbol.symbol}\`：\`${symbol.path}\``,
      ),
      '',
    )
  }
  lines.push(
    '## 3. 已验证边界决定',
    '',
    '- 21 个自动框架信号已全部归一化；319 个风险说明全部保持 `pending`。',
    '- `RedisConfig` 是有效配置类；`SSL` 归入 Apache HttpClient，静态资源 URL 编码归入 Spring MVC。',
    '- `Builder 模式` 的 395 个冻结证据文件均直接使用 Lombok `@Builder`，因此只在本批归入 Lombok，不提前讲设计模式。',
    '- `事务`、`超时`、`外部 HTTP`、`HTTP 调用`、`文档转换`、`XML I/O` 和`媒体流`是混合或间接场景，继续留给工程模式批次。',
    '- `派生配置`、`配置数据建模`、`BeanUtils`、`Spring Order` 和文档端点访问控制没有形成单一直接框架证据，继续保持 `pending`。',
    '- `URLConnection`、名实不符的 `ReentrantLock` 以及纯 `synchronized`、`volatile`、默认方法不伪装成框架能力。',
    '',
    '## 4. 当前边界',
    '',
    '- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。',
    '- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。',
    '- 具体框架合同、迁移差异、易错点、替代方案和开发技巧必须在 Phase 2 后逐项在线核验。',
    '- 本批不处理工程模式、风险反例、项目示例、课程正文或前端平台。',
    '- Phase 1D 尚未完成，Gate 1 仍未通过。',
    '',
    '下一批只能继续处理工程模式能力归一化，不能开始风险反例、课程正文、菜单或 Markdown adapter。',
  )
  return lines.join('\n')
}

/** 验证人工签核精确绑定三份候选产物。 */
function validateSignoff(signoff, artifactHashes, matrixSummary) {
  assert(signoff.schemaVersion === 1, '签核 schemaVersion 错误')
  assert(signoff.snapshotId === batchMetadata.snapshotId, '签核快照错误')
  assert(signoff.analysisId === batchMetadata.analysisId, '签核分析 ID 错误')
  assert(signoff.batchId === batchMetadata.batchId && signoff.status === 'approved', '签核状态错误')
  assert(signoff.reviewedAt === batchMetadata.reviewedAt, '签核时间错误')
  assert(signoff.reviewedBy === 'Codex', '签核审查者错误')
  assert(signoff.reviewerType === 'agent-assisted-manual-review', '签核审查类型错误')
  const expectedSummary = {
    rawSourceItemCount: 754,
    normalizedSourceItemCount: 235,
    pendingSourceItemCount: 519,
    capabilityCount: 34,
    normalizedObservedFileCount: 3085,
    representativeSymbolCount: 137,
  }
  assert(JSON.stringify(signoff.summary) === JSON.stringify(expectedSummary), '签核摘要错误')
  for (const [key, value] of Object.entries(expectedSummary)) {
    assert(matrixSummary[key] === value, `矩阵摘要错误：${key}`)
  }
  assert(
    JSON.stringify(matrixSummary.pendingBySourceKind) ===
      JSON.stringify({
        'review-capability': 200,
        'language-feature': 0,
        'framework-usage': 0,
        'review-risk': 319,
      }),
    '矩阵 pending 分类错误',
  )
  assert(signoff.artifacts.length === 3, '签核产物数错误')
  assert(
    JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(Object.keys(artifactHashes).sort()),
    '签核产物路径集合错误',
  )
  for (const artifact of signoff.artifacts) {
    assert(
      artifactHashes[artifact.path] === artifact.sha256,
      `签核未绑定当前产物：${artifact.path}`,
    )
  }
}

/** 根据上一批 pending 输入构建本批四份正式产物。 */
function buildArtifacts(signoff = null) {
  const pendingInventory = readPreviousPendingInventory()
  const extractedRecords = readExtractedRecords()
  const assignments = buildAssignments(pendingInventory)
  const sourceInventory = buildSourceInventory(pendingInventory, assignments)
  const sourceSummary = summarizeSources(sourceInventory)
  const capabilities = buildCapabilities(sourceInventory, extractedRecords)
  const normalizedSources = sourceInventory.filter(
    (source) => source.normalizationStatus === 'normalized',
  )
  const pendingSources = sourceInventory.filter(
    (source) => source.normalizationStatus === 'pending',
  )
  const normalizedObservedFiles = new Set(capabilities.flatMap((item) => item.observedFiles))
  const pendingBySourceKind = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      pendingSources.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  const matrix = {
    schemaVersion: batchMetadata.schemaVersion,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    reviewedAt: batchMetadata.reviewedAt,
    matrixKind: 'java-framework-library',
    inputLineage: {
      previousBatchId: 'phase-1d-standard-library',
      previousManifestSha256,
      previousSourceInventorySha256,
      previousPendingSourceItemCount: 754,
    },
    summary: {
      rawSourceItemCount: sourceInventory.length,
      normalizedSourceItemCount: normalizedSources.length,
      pendingSourceItemCount: pendingSources.length,
      pendingBySourceKind,
      capabilityCount: capabilities.length,
      normalizedObservedFileCount: normalizedObservedFiles.size,
      representativeSymbolCount: capabilities.reduce(
        (total, item) => total + item.representativeSymbols.length,
        0,
      ),
    },
    capabilities,
  }
  const sourceInventoryContent = `${sourceInventory.map((source) => JSON.stringify(source)).join('\n')}\n`
  const matrixJsonContent = `${JSON.stringify(matrix, null, 2)}\n`
  const matrixMarkdownContent = `${buildMarkdown(matrix, {
    total: sourceInventory.length,
    counts: sourceSummary.counts,
  })}\n`
  const artifactHashes = {
    [sourceInventoryFileName]: sha256(sourceInventoryContent),
    [matrixJsonFileName]: sha256(matrixJsonContent),
    [matrixMarkdownFileName]: sha256(matrixMarkdownContent),
  }
  if (signoff) validateSignoff(signoff, artifactHashes, matrix.summary)
  const manifest = {
    schemaVersion: batchMetadata.schemaVersion,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    status: signoff ? 'completed' : 'awaiting-signoff',
    reviewedAt: batchMetadata.reviewedAt,
    gateStatus: 'not-passed',
    previousBatch: matrix.inputLineage,
    sourceInventory: {
      path: sourceInventoryFileName,
      sha256: artifactHashes[sourceInventoryFileName],
      itemCount: sourceInventory.length,
      observedFileAssignments: Object.values(sourceSummary.fileAssignments).reduce(
        (sum, count) => sum + count,
        0,
      ),
      sourceKindCounts: sourceSummary.counts,
      sourceKindFileAssignments: sourceSummary.fileAssignments,
    },
    matrix: {
      jsonPath: matrixJsonFileName,
      jsonSha256: artifactHashes[matrixJsonFileName],
      markdownPath: matrixMarkdownFileName,
      markdownSha256: artifactHashes[matrixMarkdownFileName],
      ...matrix.summary,
    },
    ...(signoff
      ? {
          manualReviewSignoff: {
            path: 'reviews/phase-1d-framework-signoff.json',
            sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
            reviewedBy: signoff.reviewedBy,
            reviewerType: signoff.reviewerType,
          },
        }
      : {}),
    coverageBoundary: {
      normalizedKinds: ['framework-library'],
      pendingKinds: ['engineering-pattern', 'review-risk', 'residual-or-invalid'],
      nextBatch: 'engineering-pattern',
      courseAuthoringStarted: false,
    },
  }
  return {
    sourceInventoryContent,
    matrixJsonContent,
    matrixMarkdownContent,
    manifestContent: `${JSON.stringify(manifest, null, 2)}\n`,
    summary: matrix.summary,
  }
}

/** 将构建结果写入指定目录。 */
function writeArtifacts(artifacts) {
  fs.mkdirSync(outputDirectory, { recursive: true })
  fs.writeFileSync(
    path.join(outputDirectory, sourceInventoryFileName),
    artifacts.sourceInventoryContent,
  )
  fs.writeFileSync(path.join(outputDirectory, matrixJsonFileName), artifacts.matrixJsonContent)
  fs.writeFileSync(
    path.join(outputDirectory, matrixMarkdownFileName),
    artifacts.matrixMarkdownContent,
  )
  fs.writeFileSync(path.join(outputDirectory, manifestFileName), artifacts.manifestContent)
}

/** 对比正式目录中的产物与当前输入推导结果。 */
function checkArtifacts(artifacts) {
  const expected = [
    [sourceInventoryFileName, artifacts.sourceInventoryContent],
    [matrixJsonFileName, artifacts.matrixJsonContent],
    [matrixMarkdownFileName, artifacts.matrixMarkdownContent],
    [manifestFileName, artifacts.manifestContent],
  ]
  for (const [fileName, content] of expected) {
    const actual = fs.readFileSync(path.join(outputDirectory, fileName), 'utf8')
    assert(actual === content, `${fileName} 与当前归一化输入不一致`)
  }
}

/** 执行准备、写入或只读检查流程。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  if (options.prepare) {
    assert(outputDirectory !== auditDirectory, '--prepare 必须指定独立输出目录')
    const artifacts = buildArtifacts()
    writeArtifacts(artifacts)
    console.log(JSON.stringify({ status: 'PASS', mode: 'prepare', ...artifacts.summary }))
    return
  }
  const signoff = readJson(signoffPath)
  const artifacts = buildArtifacts(signoff)
  if (options.check) checkArtifacts(artifacts)
  else writeArtifacts(artifacts)
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.check ? 'check' : 'write',
      ...artifacts.summary,
    }),
  )
}

main()
