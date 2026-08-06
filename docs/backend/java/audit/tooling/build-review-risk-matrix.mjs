import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { batchMetadata, reviewRiskPatterns } from './review-risk-catalog.mjs'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_REVIEW_RISK_DIRECTORY
  ? path.resolve(process.env.DZZZ_REVIEW_RISK_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_REVIEW_RISK_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_REVIEW_RISK_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-review-risk-signoff.json')
const previousManifestPath = path.join(auditDirectory, 'phase-1d-engineering-pattern-manifest.json')
const previousInventoryPath = path.join(
  auditDirectory,
  'engineering-pattern-capability-source-inventory.jsonl',
)
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const canonicalInventoryPath = path.join(
  auditDirectory,
  'capability-normalization-source-inventory.jsonl',
)
const sourceInventoryFileName = 'review-risk-source-inventory.jsonl'
const matrixJsonFileName = 'java-review-risk-matrix.json'
const matrixMarkdownFileName = 'java-review-risk-matrix.md'
const manifestFileName = 'phase-1d-review-risk-manifest.json'
const previousManifestSha256 = '2ea5eea9d4fd4ce5242daaf7daba0d21c901c2a5c949bcac4d178f43ffea2324'
const previousSourceInventorySha256 =
  '7ade12db21b935a1655f5f70544f486afa5a823074264144f89550103096e25b'
const canonicalInventorySha256 =
  '7a5a9d5745820f7ac8e9874419e8a45c9cc7b60723ee9f886e3a4336d7454815'
const previousMatrixSpecs = [
  [
    'java-language-capability-matrix.json',
    'b42122285a7e4680c9d5148b44effaa5838a8d2bfa62e1cb2c4f0175d727c076',
    'java-language',
    40,
  ],
  [
    'java-standard-library-capability-matrix.json',
    '3ee20550ba22602c462dcfdc619bccaa5e844ab2b8224ec657b194bc0136853d',
    'java-standard-library',
    112,
  ],
  [
    'java-framework-capability-matrix.json',
    '033362651a4b1a25abf3b16d6bd01449a6888464a949f92f5bc9b96893d7612a',
    'java-framework-library',
    235,
  ],
  [
    'java-engineering-pattern-capability-matrix.json',
    '8cd1619084b8b0f9dadb9ea8a3915eb8dcaa8064e2e2ea90d5d700020373dc3b',
    'java-engineering-pattern',
    200,
  ],
]

/** 在合同不成立时立即终止本批生成。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 解析非空 JSONL 文本。 */
function parseJsonLines(content, sourceName) {
  assert(content.trim().length > 0, `${sourceName} 为空`)
  return content.trim().split('\n').map(JSON.parse)
}

/** 解析并限制命令行参数。 */
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

/** 读取并验证上一批保留的 319 个风险输入。 */
function readPreviousPendingInventory() {
  const manifestContent = fs.readFileSync(previousManifestPath, 'utf8')
  assert(sha256(manifestContent) === previousManifestSha256, '上一批 manifest 哈希错误')
  const manifest = JSON.parse(manifestContent)
  assert(manifest.batchId === 'phase-1d-engineering-pattern', '上一批 batchId 错误')
  assert(manifest.status === 'completed' && manifest.gateStatus === 'not-passed', '上一批状态错误')
  assert(manifest.snapshotId === batchMetadata.snapshotId, '上一批快照错误')
  assert(manifest.analysisId === batchMetadata.analysisId, '上一批分析 ID 错误')
  assert(manifest.matrix.pendingSourceItemCount === 319, '上一批 pending 分母错误')
  assert(manifest.coverageBoundary.nextBatch === 'review-risk', '上一批后继批次错误')

  const inventoryContent = fs.readFileSync(previousInventoryPath, 'utf8')
  assert(sha256(inventoryContent) === previousSourceInventorySha256, '上一批输入清单哈希错误')
  const inventory = parseJsonLines(inventoryContent, path.basename(previousInventoryPath))
  const pending = inventory.filter((source) => source.normalizationStatus === 'pending')
  assert(pending.length === 319, `上一批 pending 输入数错误：${pending.length}`)
  assert(
    pending.every(
      (source) =>
        source.sourceKind === 'review-risk' &&
        source.capabilityId === null &&
        /^RISK-\d{4}$/.test(source.sourceId),
    ),
    '上一批 pending 包含非风险输入或已有归属',
  )
  assert(new Set(pending.map((source) => source.sourceId)).size === 319, '风险 sourceId 不唯一')
  return pending.sort((left, right) => left.sourceId.localeCompare(right.sourceId))
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

/** 从人工目录建立 319 条风险的唯一显式映射。 */
function buildAssignments(pendingInventory) {
  const sourceIds = new Set(pendingInventory.map((source) => source.sourceId))
  const assignments = new Map()
  const riskIds = new Set(reviewRiskPatterns.map((pattern) => pattern.riskId))
  assert(reviewRiskPatterns.length === 47 && riskIds.size === 47, '规范风险 ID 不唯一')
  for (const pattern of reviewRiskPatterns) {
    assert(pattern.kind === 'review-risk-pattern', `风险类型错误：${pattern.riskId}`)
    assert(pattern.evidencePolicy === 'project-risk-evidence-only', `证据策略错误：${pattern.riskId}`)
    assert(pattern.sourceIds.length > 0, `风险没有原始输入：${pattern.riskId}`)
    for (const sourceId of pattern.sourceIds) {
      assert(sourceIds.has(sourceId), `目录引用不存在的风险输入：${sourceId}`)
      assert(!assignments.has(sourceId), `目录重复映射：${sourceId}`)
      assignments.set(sourceId, pattern.riskId)
    }
    for (const prerequisite of pattern.prerequisites) {
      assert(/^JAVA-(LANG|STDLIB|FRAMEWORK|ENGINEERING)-\d{3}$/.test(prerequisite), `前置能力格式错误：${pattern.riskId}/${prerequisite}`)
    }
  }
  assert(assignments.size === 319, `风险独立映射数错误：${assignments.size}`)
  return assignments
}

/** 为本批 319 个输入写入规范风险归属。 */
function buildSourceInventory(pendingInventory, assignments) {
  const inventory = pendingInventory.map((source) => ({
    ...source,
    normalizationStatus: 'normalized',
    riskId: assignments.get(source.sourceId),
  }))
  assert(inventory.length === 319, '本批原始输入分母错误')
  assert(inventory.every((source) => source.riskId), '风险输入缺少规范归属')
  assert(
    inventory.every((source) => source.observedFileCount === source.observedFiles.length),
    '风险输入文件计数错误',
  )
  assert(
    inventory.every((source) => source.observedFiles.every((filePath) => filePath.startsWith('dzzz-app/'))),
    '风险输入包含 dzzz-app 外路径',
  )
  return inventory
}

/** 从冻结提取记录取得代表符号。 */
function representativeSymbol(filePath, extractedByPath) {
  const extracted = extractedByPath.get(filePath)
  assert(extracted, `代表文件不在冻结提取记录中：${filePath}`)
  const declaredType = extracted.declaredTypes?.find((type) => type.owner === null)
  return {
    symbol: declaredType?.qualifiedName ?? path.basename(filePath, '.java'),
    path: filePath,
  }
}

/** 为一个风险稳定选择最多五个代表符号。 */
function selectRepresentativeSymbols(sources, extractedByPath) {
  const selectedPaths = []
  for (const source of sources) {
    if (selectedPaths.length >= 5) break
    const firstUnusedPath = source.observedFiles.find((filePath) => !selectedPaths.includes(filePath))
    if (firstUnusedPath) selectedPaths.push(firstUnusedPath)
  }
  const union = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
  for (const filePath of union) {
    if (selectedPaths.length >= 5) break
    if (!selectedPaths.includes(filePath)) selectedPaths.push(filePath)
  }
  return selectedPaths.map((filePath) => representativeSymbol(filePath, extractedByPath))
}

/** 把人工目录与风险输入合并为规范风险矩阵。 */
function buildRiskPatterns(sourceInventory, extractedRecords) {
  const sourceById = new Map(sourceInventory.map((source) => [source.sourceId, source]))
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  return reviewRiskPatterns.map((catalogEntry) => {
    const sources = catalogEntry.sourceIds.map((sourceId) => {
      const source = sourceById.get(sourceId)
      assert(source, `规范风险缺少原始输入：${catalogEntry.riskId}/${sourceId}`)
      assert(source.riskId === catalogEntry.riskId, `原始输入风险映射错位：${sourceId}`)
      return source
    })
    const observedFiles = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
    return {
      riskId: catalogEntry.riskId,
      name: catalogEntry.name,
      kind: catalogEntry.kind,
      evidencePolicy: catalogEntry.evidencePolicy,
      observedFileCount: observedFiles.length,
      observedFiles,
      representativeSymbols: selectRepresentativeSymbols(sources, extractedByPath),
      normalizedFrom: sources.map((source) => ({
        sourceId: source.sourceId,
        sourceKind: source.sourceKind,
        key: source.key,
        label: source.label,
        categories: source.categories,
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

/** 独立汇总前四批与当前风险批，验证 906 个原始输入全局零重叠全覆盖。 */
function validateGlobalCoverage(riskPatterns) {
  const canonicalContent = fs.readFileSync(canonicalInventoryPath, 'utf8')
  assert(sha256(canonicalContent) === canonicalInventorySha256, 'Phase 1D 初始清单哈希错误')
  const canonicalInventory = parseJsonLines(canonicalContent, path.basename(canonicalInventoryPath))
  assert(canonicalInventory.length === 906, 'Phase 1D 初始清单分母错误')
  const canonicalSourceIds = canonicalInventory.map((source) => source.sourceId).sort()
  assert(new Set(canonicalSourceIds).size === 906, 'Phase 1D 初始 sourceId 不唯一')

  const normalizedSourceIds = []
  const batchCounts = []
  for (const [fileName, expectedHash, matrixKind, expectedCount] of previousMatrixSpecs) {
    const content = fs.readFileSync(path.join(auditDirectory, fileName), 'utf8')
    assert(sha256(content) === expectedHash, `前序矩阵哈希错误：${fileName}`)
    const matrix = JSON.parse(content)
    assert(matrix.matrixKind === matrixKind, `前序矩阵类型错误：${fileName}`)
    const sourceIds = matrix.capabilities.flatMap((item) => item.normalizedFrom.map((source) => source.sourceId))
    assert(sourceIds.length === expectedCount, `前序矩阵归一化数错误：${fileName}`)
    normalizedSourceIds.push(...sourceIds)
    batchCounts.push(expectedCount)
  }
  const riskSourceIds = riskPatterns.flatMap((item) => item.normalizedFrom.map((source) => source.sourceId))
  assert(riskSourceIds.length === 319, '风险矩阵归一化数错误')
  normalizedSourceIds.push(...riskSourceIds)
  batchCounts.push(riskSourceIds.length)
  assert(
    JSON.stringify(batchCounts) === JSON.stringify([40, 112, 235, 200, 319]),
    'Phase 1D 分批统计错误',
  )
  assert(normalizedSourceIds.length === 906, 'Phase 1D 全局归一化总数错误')
  assert(new Set(normalizedSourceIds).size === 906, 'Phase 1D 原始输入被跨批重复归一化')
  assert(
    JSON.stringify([...normalizedSourceIds].sort()) === JSON.stringify(canonicalSourceIds),
    'Phase 1D 全局归一化存在遗漏或额外输入',
  )
  return {
    canonicalSourceItemCount: 906,
    normalizedSourceItemCount: 906,
    pendingSourceItemCount: 0,
    batchNormalizedSourceItemCounts: batchCounts,
    normalizedCatalogItemCount: 15 + 33 + 34 + 38 + reviewRiskPatterns.length,
    duplicateSourceAssignmentCount: 0,
    missingSourceItemCount: 0,
    extraSourceItemCount: 0,
  }
}

/** 将课程阶段代码转换为中文。 */
function stageLabel(stage) {
  return { basic: '基础', intermediate: '中级', advanced: '高级' }[stage]
}

/** 生成适合人工阅读的风险反例矩阵摘要。 */
function buildMarkdown(matrix) {
  const lines = [
    '# `dzzz-app` Java 风险反例矩阵',
    '',
    `> 批次：${batchMetadata.batchName}`,
    `> 源码快照：\`${batchMetadata.snapshotId}\``,
    `> 自动分析：\`${batchMetadata.analysisId}\``,
    '> 状态：319 条风险已完成唯一归一化；仅作为正确实践、易错点和拒绝模式证据',
    '',
    '## 1. 本批边界',
    '',
    `本批严格以上一批保留的 ${matrix.summary.rawSourceItemCount} 个 \`review-risk\` 输入为分母，`,
    `人工归一化为 ${matrix.summary.riskPatternCount} 个规范风险模式。项目旧写法不因进入矩阵而被认可。`,
    '',
    `- 已归一化输入：${matrix.summary.normalizedSourceItemCount}；`,
    `- 待处理输入：${matrix.summary.pendingSourceItemCount}；`,
    `- 唯一证据文件：${matrix.summary.normalizedObservedFileCount}；`,
    `- 代表符号：${matrix.summary.representativeSymbolCount}。`,
    '',
    '## 2. 规范风险模式',
    '',
  ]
  for (const item of matrix.riskPatterns) {
    lines.push(
      `### ${item.riskId} ${item.name}`,
      '',
      `- 类型：\`${item.kind}\`；推荐阶段：${stageLabel(item.recommendedStage)}。`,
      `- 项目证据：${item.observedFileCount} 个文件；原始风险：${item.normalizedFrom.length} 条。`,
      `- 证据政策：\`${item.evidencePolicy}\`，不得把项目旧写法当作推荐示例。`,
      `- 前置能力：${item.prerequisites.map((id) => `\`${id}\``).join('、')}。`,
      `- 状态：研究 \`${item.researchStatus}\`，示例 \`${item.exampleStatus}\`，课程 \`${item.courseStatus}\`。`,
      '- 原始风险：',
      ...item.normalizedFrom.map((source) => `  - \`${source.sourceId}\`：${source.label}`),
      '- 代表符号：',
      ...item.representativeSymbols.map((symbol) => `  - \`${symbol.symbol}\`：\`${symbol.path}\``),
      '',
    )
  }
  lines.push(
    '## 3. 全局关闭检查',
    '',
    `- 五批归一化计数：${matrix.globalNormalization.batchNormalizedSourceItemCounts.join(' + ')} = ${matrix.globalNormalization.normalizedSourceItemCount}。`,
    `- 规范目录项：${matrix.globalNormalization.normalizedCatalogItemCount} 个，其中本批风险模式 ${matrix.summary.riskPatternCount} 个。`,
    '- 全局 sourceId 重复、遗漏和额外映射均为 0。',
    '- 3436 个 Java 文件人工审计已完成，正式证据仍只来自冻结的 `dzzz-app` 路径与哈希。',
    '- Gate 1 通过只允许进入 Phase 2 知识点与学习路径冻结，不等于任何知识点已研究或课程正文已编写。',
    '',
    '## 4. 当前边界',
    '',
    '- 本批未进行线上研究、项目示例改写、课程正文、菜单、Markdown adapter 或 Java 高亮实现。',
    '- 后续研究必须以现代受支持稳定版本为主，Java 8 与 Spring Boot 2.3 只作项目兼容补充。',
    '- 每条风险进入课程前仍需用官方规范、官方文档或权威安全资料验证正确做法。',
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
  assert(JSON.stringify(signoff.summary) === JSON.stringify(matrixSummary), '签核摘要错误')
  assert(signoff.artifacts.length === 3, '签核产物数错误')
  assert(
    JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(Object.keys(artifactHashes).sort()),
    '签核产物路径集合错误',
  )
  for (const artifact of signoff.artifacts) {
    assert(artifactHashes[artifact.path] === artifact.sha256, `签核未绑定当前产物：${artifact.path}`)
  }
}

/** 根据上一批 pending 输入构建本批四份正式产物。 */
function buildArtifacts(signoff = null) {
  const pendingInventory = readPreviousPendingInventory()
  const extractedRecords = readExtractedRecords()
  const assignments = buildAssignments(pendingInventory)
  const sourceInventory = buildSourceInventory(pendingInventory, assignments)
  const riskPatterns = buildRiskPatterns(sourceInventory, extractedRecords)
  const globalNormalization = validateGlobalCoverage(riskPatterns)
  const normalizedObservedFiles = new Set(riskPatterns.flatMap((item) => item.observedFiles))
  const summary = {
    rawSourceItemCount: sourceInventory.length,
    normalizedSourceItemCount: sourceInventory.length,
    pendingSourceItemCount: 0,
    pendingBySourceKind: {
      'review-capability': 0,
      'language-feature': 0,
      'framework-usage': 0,
      'review-risk': 0,
    },
    riskPatternCount: riskPatterns.length,
    normalizedObservedFileCount: normalizedObservedFiles.size,
    representativeSymbolCount: riskPatterns.reduce(
      (total, item) => total + item.representativeSymbols.length,
      0,
    ),
  }
  const matrix = {
    schemaVersion: batchMetadata.schemaVersion,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    reviewedAt: batchMetadata.reviewedAt,
    matrixKind: 'java-review-risk',
    inputLineage: {
      previousBatchId: 'phase-1d-engineering-pattern',
      previousManifestSha256,
      previousSourceInventorySha256,
      previousPendingSourceItemCount: 319,
    },
    summary,
    globalNormalization,
    riskPatterns,
  }
  const sourceInventoryContent = `${sourceInventory.map((source) => JSON.stringify(source)).join('\n')}\n`
  const matrixJsonContent = `${JSON.stringify(matrix, null, 2)}\n`
  const matrixMarkdownContent = `${buildMarkdown(matrix)}\n`
  const artifactHashes = {
    [sourceInventoryFileName]: sha256(sourceInventoryContent),
    [matrixJsonFileName]: sha256(matrixJsonContent),
    [matrixMarkdownFileName]: sha256(matrixMarkdownContent),
  }
  if (signoff) validateSignoff(signoff, artifactHashes, summary)
  const manifest = {
    schemaVersion: batchMetadata.schemaVersion,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    status: signoff ? 'completed' : 'awaiting-signoff',
    reviewedAt: batchMetadata.reviewedAt,
    gateStatus: signoff ? 'passed' : 'awaiting-signoff',
    previousBatch: matrix.inputLineage,
    sourceInventory: {
      path: sourceInventoryFileName,
      sha256: artifactHashes[sourceInventoryFileName],
      itemCount: sourceInventory.length,
      observedFileAssignments: sourceInventory.reduce(
        (total, source) => total + source.observedFileCount,
        0,
      ),
      sourceKindCounts: {
        'review-capability': 0,
        'language-feature': 0,
        'framework-usage': 0,
        'review-risk': 319,
      },
      sourceKindFileAssignments: {
        'review-capability': 0,
        'language-feature': 0,
        'framework-usage': 0,
        'review-risk': 3152,
      },
    },
    matrix: {
      jsonPath: matrixJsonFileName,
      jsonSha256: artifactHashes[matrixJsonFileName],
      markdownPath: matrixMarkdownFileName,
      markdownSha256: artifactHashes[matrixMarkdownFileName],
      ...summary,
    },
    globalNormalization,
    ...(signoff
      ? {
          manualReviewSignoff: {
            path: 'reviews/phase-1d-review-risk-signoff.json',
            sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
            reviewedBy: signoff.reviewedBy,
            reviewerType: signoff.reviewerType,
          },
        }
      : {}),
    coverageBoundary: {
      normalizedKinds: ['review-risk-pattern'],
      pendingKinds: [],
      nextPhase: 'phase-2-knowledge-path',
      courseAuthoringStarted: false,
    },
  }
  return {
    sourceInventoryContent,
    matrixJsonContent,
    matrixMarkdownContent,
    manifestContent: `${JSON.stringify(manifest, null, 2)}\n`,
    summary,
    artifactHashes,
  }
}

/** 将构建结果写入指定目录。 */
function writeArtifacts(artifacts) {
  fs.mkdirSync(outputDirectory, { recursive: true })
  fs.writeFileSync(path.join(outputDirectory, sourceInventoryFileName), artifacts.sourceInventoryContent)
  fs.writeFileSync(path.join(outputDirectory, matrixJsonFileName), artifacts.matrixJsonContent)
  fs.writeFileSync(path.join(outputDirectory, matrixMarkdownFileName), artifacts.matrixMarkdownContent)
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
    console.log(
      JSON.stringify({
        status: 'PASS',
        mode: 'prepare',
        ...artifacts.summary,
        artifactHashes: artifacts.artifactHashes,
      }),
    )
    return
  }
  const signoff = readJson(signoffPath)
  const artifacts = buildArtifacts(signoff)
  if (options.check) checkArtifacts(artifacts)
  else writeArtifacts(artifacts)
  console.log(
    JSON.stringify({ status: 'PASS', mode: options.check ? 'check' : 'write', ...artifacts.summary }),
  )
}

main()
