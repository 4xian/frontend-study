import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { batchMetadata, javaLanguageCapabilities } from './java-language-capability-catalog.mjs'

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

/** 断言审计合同成立。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算字符串或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 解析生成器命令行参数。 */
function parseArguments(argv) {
  const options = { check: false, prepare: false }
  for (const argument of argv) {
    if (argument === '--check') options.check = true
    else if (argument === '--prepare') options.prepare = true
    else throw new Error(`未知参数：${argument}`)
  }
  assert(!(options.check && options.prepare), '--check 与 --prepare 不能同时使用')
  return options
}

/** 解析非空 JSON Lines 内容。 */
function parseJsonLines(content, sourceName) {
  const trimmed = content.trim()
  assert(trimmed.length > 0, `${sourceName} 为空`)
  return trimmed.split('\n').map((line) => JSON.parse(line))
}

/** 读取十批人工复核记录并验证路径分母。 */
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
      assert(sha256(content) === shard.sha256, `${relativePath}/${shard.fileName} SHA-256 不一致`)
      records.push(
        ...parseJsonLines(content, shard.fileName).map((record) => ({
          ...record,
          reviewBatch: manifest.batchId,
        })),
      )
    }
  }
  assert(records.length === 3436, `人工复核记录数错误：${records.length}`)
  assert(records.every((record) => record.auditStatus === 'reviewed'), '存在未完成的人工复核记录')
  const paths = new Set(records.map((record) => record.path))
  assert(paths.size === 3436, `人工复核路径不唯一：${paths.size}`)
  return records.sort((left, right) => left.inventoryIndex - right.inventoryIndex)
}

/** 读取七个自动提取分片并验证内容哈希。 */
function readExtractedRecords() {
  const manifest = readJson(extractionManifestPath)
  assert(manifest.snapshotId === batchMetadata.snapshotId, '自动提取快照不一致')
  assert(manifest.analysisId === batchMetadata.analysisId, '自动提取分析 ID 不一致')
  const records = []
  for (const shard of manifest.shards) {
    const shardPath = path.join(auditDirectory, 'extracted', shard.fileName)
    const content = fs.readFileSync(shardPath, 'utf8')
    assert(sha256(content) === shard.sha256, `${shard.fileName} SHA-256 不一致`)
    records.push(...parseJsonLines(content, shard.fileName))
  }
  assert(records.length === 3436, `自动提取记录数错误：${records.length}`)
  const paths = new Set(records.map((record) => record.path))
  assert(paths.size === 3436, `自动提取路径不唯一：${paths.size}`)
  return records.sort((left, right) => left.inventoryIndex - right.inventoryIndex)
}

/** 向原始归一化输入聚合一条文件证据。 */
function addSourceObservation(groups, sourceKind, key, label, filePath, options = {}) {
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

/** 建立人工能力、语言信号、框架信号和风险说明的完整原始分母。 */
function buildSourceGroups(reviewedRecords, extractedRecords) {
  const groups = new Map()
  for (const record of reviewedRecords) {
    for (const capability of record.capabilityCandidates ?? []) {
      addSourceObservation(
        groups,
        'review-capability',
        capability,
        capability,
        record.path,
        { reviewBatch: record.reviewBatch },
      )
    }
    for (const risk of record.riskCandidates ?? []) {
      addSourceObservation(
        groups,
        'review-risk',
        sha256(risk.summary),
        risk.summary,
        record.path,
        { reviewBatch: record.reviewBatch, category: risk.category ?? 'uncategorized' },
      )
    }
  }
  for (const record of extractedRecords) {
    for (const feature of record.languageFeatures) {
      addSourceObservation(groups, 'language-feature', feature.id, feature.id, record.path)
    }
    for (const usage of record.frameworkUsages) {
      addSourceObservation(groups, 'framework-usage', usage.id, usage.id, record.path)
    }
  }
  return groups
}

/** 返回原始输入的稳定排序。 */
function compareSourceGroups(left, right) {
  const kindDifference =
    sourceKindOrder.indexOf(left.sourceKind) - sourceKindOrder.indexOf(right.sourceKind)
  return kindDifference || left.key.localeCompare(right.key, 'zh-CN')
}

/** 校验人工目录并建立每个原始输入到规范能力的唯一映射。 */
function buildNormalizationAssignments(groups) {
  const assignments = new Map()
  const capabilityIds = new Set()
  for (const capability of javaLanguageCapabilities) {
    assert(!capabilityIds.has(capability.capabilityId), `能力 ID 重复：${capability.capabilityId}`)
    capabilityIds.add(capability.capabilityId)
    for (const [sourceKind, key] of capability.sources) {
      const sourceKey = `${sourceKind}\u0000${key}`
      assert(groups.has(sourceKey), `人工目录引用不存在的原始输入：${sourceKind}/${key}`)
      assert(!assignments.has(sourceKey), `原始输入被重复归一化：${sourceKind}/${key}`)
      assignments.set(sourceKey, capability.capabilityId)
    }
  }
  for (const capability of javaLanguageCapabilities) {
    for (const prerequisite of capability.prerequisites) {
      assert(capabilityIds.has(prerequisite), `前置能力不存在：${prerequisite}`)
      assert(prerequisite !== capability.capabilityId, `能力不能依赖自身：${capability.capabilityId}`)
    }
  }
  return assignments
}

/** 生成带稳定编号和进度状态的原始输入清单。 */
function buildSourceInventory(groups, assignments) {
  const counters = new Map()
  const inventory = [...groups.values()].sort(compareSourceGroups).map((group) => {
    const next = (counters.get(group.sourceKind) ?? 0) + 1
    counters.set(group.sourceKind, next)
    const sourceId = `${sourcePrefixes[group.sourceKind]}-${String(next).padStart(4, '0')}`
    const capabilityId = assignments.get(`${group.sourceKind}\u0000${group.key}`) ?? null
    return {
      sourceId,
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
  const counts = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      inventory.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  const assignmentsCount = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      inventory
        .filter((source) => source.sourceKind === sourceKind)
        .reduce((total, source) => total + source.observedFileCount, 0),
    ]),
  )
  assert(inventory.length === 906, `原始输入总数错误：${inventory.length}`)
  assert(counts['review-capability'] === 550, '文件级能力候选分母错误')
  assert(counts['language-feature'] === 16, '语言信号分母错误')
  assert(counts['framework-usage'] === 21, '框架信号分母错误')
  assert(counts['review-risk'] === 319, '风险说明分母错误')
  assert(Object.values(assignmentsCount).reduce((sum, count) => sum + count, 0) === 27731, '证据文件关联总数错误')
  assert(inventory.filter((source) => source.normalizationStatus === 'normalized').length === 40, '首批归一化输入数错误')
  return { inventory, counts, assignmentsCount }
}

/** 从自动提取记录取得代表符号。 */
function representativeSymbol(filePath, extractedByPath) {
  const extracted = extractedByPath.get(filePath)
  const declaredType = extracted?.declaredTypes?.find((type) => type.owner === null)
  return {
    symbol: declaredType?.qualifiedName ?? path.basename(filePath, '.java'),
    path: filePath,
  }
}

/** 为规范能力选择跨原始输入的稳定代表符号。 */
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
  return selectedPaths.slice(0, 5).map((filePath) => representativeSymbol(filePath, extractedByPath))
}

/** 把人工目录合并为规范 Java 语言能力记录。 */
function buildCapabilities(sourceInventory, extractedRecords) {
  const sourceByKey = new Map(
    sourceInventory.map((source) => [`${source.sourceKind}\u0000${source.key}`, source]),
  )
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  return javaLanguageCapabilities.map((catalogEntry) => {
    const sources = catalogEntry.sources.map(([sourceKind, key]) => {
      const source = sourceByKey.get(`${sourceKind}\u0000${key}`)
      assert(source, `能力缺少原始输入：${catalogEntry.capabilityId}/${sourceKind}/${key}`)
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

/** 将课程阶段代码转换为中文。 */
function stageLabel(stage) {
  return { basic: '基础', intermediate: '中级', advanced: '高级' }[stage]
}

/** 生成适合人工阅读的 Java 语言能力矩阵摘要。 */
function buildMarkdown(matrix, sourceSummary) {
  const lines = [
    '# `dzzz-app` Java 语言能力矩阵',
    '',
    `> 批次：${batchMetadata.batchName}`,
    `> 源码快照：\`${batchMetadata.snapshotId}\``,
    `> 自动分析：\`${batchMetadata.analysisId}\``,
    '> 状态：首批已归一化，研究与课程正文尚未开始',
    '',
    '## 1. 本批边界',
    '',
    `十批人工台账与自动提取共形成 ${sourceSummary.total} 个唯一原始输入：`,
    '',
    `- 文件级能力候选：${sourceSummary.counts['review-capability']} 个；`,
    `- Java 语言特征信号：${sourceSummary.counts['language-feature']} 个；`,
    `- 框架使用信号：${sourceSummary.counts['framework-usage']} 个；`,
    `- 唯一风险说明：${sourceSummary.counts['review-risk']} 个。`,
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

/** 根据当前输入和可选签核构建四份正式产物。 */
function buildArtifacts(signoff = null) {
  const reviewedRecords = readReviewedRecords()
  const extractedRecords = readExtractedRecords()
  for (let index = 0; index < reviewedRecords.length; index += 1) {
    assert(reviewedRecords[index].path === extractedRecords[index].path, `路径错位：${index + 1}`)
    assert(reviewedRecords[index].sourceSha256 === extractedRecords[index].sourceSha256, `源码身份错位：${reviewedRecords[index].path}`)
  }
  const groups = buildSourceGroups(reviewedRecords, extractedRecords)
  const assignments = buildNormalizationAssignments(groups)
  const sourceData = buildSourceInventory(groups, assignments)
  const capabilities = buildCapabilities(sourceData.inventory, extractedRecords)
  const normalizedObservedFiles = new Set(capabilities.flatMap((capability) => capability.observedFiles))
  const matrix = {
    schemaVersion: batchMetadata.schemaVersion,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    reviewedAt: batchMetadata.reviewedAt,
    matrixKind: 'java-language',
    summary: {
      rawSourceItemCount: sourceData.inventory.length,
      normalizedSourceItemCount: sourceData.inventory.filter(
        (source) => source.normalizationStatus === 'normalized',
      ).length,
      pendingSourceItemCount: sourceData.inventory.filter(
        (source) => source.normalizationStatus === 'pending',
      ).length,
      capabilityCount: capabilities.length,
      normalizedObservedFileCount: normalizedObservedFiles.size,
      representativeSymbolCount: capabilities.reduce(
        (total, capability) => total + capability.representativeSymbols.length,
        0,
      ),
    },
    capabilities,
  }
  const sourceInventoryContent = `${sourceData.inventory.map((source) => JSON.stringify(source)).join('\n')}\n`
  const matrixJsonContent = `${JSON.stringify(matrix, null, 2)}\n`
  const matrixMarkdownContent = `${buildMarkdown(matrix, {
    total: sourceData.inventory.length,
    counts: sourceData.counts,
  })}\n`
  const artifactHashes = {
    [sourceInventoryFileName]: sha256(sourceInventoryContent),
    [matrixJsonFileName]: sha256(matrixJsonContent),
    [matrixMarkdownFileName]: sha256(matrixMarkdownContent),
  }
  if (signoff) validateSignoff(signoff, artifactHashes)
  const manifest = {
    schemaVersion: batchMetadata.schemaVersion,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    status: signoff ? 'completed' : 'awaiting-signoff',
    reviewedAt: batchMetadata.reviewedAt,
    gateStatus: 'not-passed',
    sourceInventory: {
      path: sourceInventoryFileName,
      sha256: artifactHashes[sourceInventoryFileName],
      itemCount: sourceData.inventory.length,
      observedFileAssignments: Object.values(sourceData.assignmentsCount).reduce(
        (sum, count) => sum + count,
        0,
      ),
      sourceKindCounts: sourceData.counts,
      sourceKindFileAssignments: sourceData.assignmentsCount,
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
            path: 'reviews/phase-1d-java-language-signoff.json',
            sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
            reviewedBy: signoff.reviewedBy,
            reviewerType: signoff.reviewerType,
          },
        }
      : {}),
    coverageBoundary: {
      normalizedKinds: ['java-language'],
      pendingKinds: ['standard-library', 'framework', 'engineering-pattern', 'review-risk'],
      nextBatch: 'standard-library',
      courseAuthoringStarted: false,
    },
  }
  return {
    sourceInventoryContent,
    matrixJsonContent,
    matrixMarkdownContent,
    manifestContent: `${JSON.stringify(manifest, null, 2)}\n`,
    summary: manifest.matrix,
  }
}

/** 验证人工签核精确绑定三份候选产物。 */
function validateSignoff(signoff, artifactHashes) {
  assert(signoff.schemaVersion === 1, '签核 schemaVersion 错误')
  assert(signoff.snapshotId === batchMetadata.snapshotId, '签核快照错误')
  assert(signoff.analysisId === batchMetadata.analysisId, '签核分析 ID 错误')
  assert(signoff.batchId === batchMetadata.batchId && signoff.status === 'approved', '签核状态错误')
  assert(signoff.reviewedAt === batchMetadata.reviewedAt, '签核时间错误')
  assert(signoff.reviewedBy === 'Codex', '签核审查者错误')
  assert(signoff.reviewerType === 'agent-assisted-manual-review', '签核审查类型错误')
  assert(signoff.summary.rawSourceItemCount === 906, '签核原始输入分母错误')
  assert(signoff.summary.normalizedSourceItemCount === 40, '签核归一化输入数错误')
  assert(signoff.summary.capabilityCount === 15, '签核能力数错误')
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
    console.log(JSON.stringify({ status: 'PASS', mode: 'prepare', ...artifacts.summary }))
    return
  }
  const signoff = readJson(signoffPath)
  const artifacts = buildArtifacts(signoff)
  if (options.check) checkArtifacts(artifacts)
  else writeArtifacts(artifacts)
  console.log(JSON.stringify({ status: 'PASS', mode: options.check ? 'check' : 'write', ...artifacts.summary }))
}

main()
