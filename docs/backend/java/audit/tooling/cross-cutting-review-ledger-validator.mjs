import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultSignoffPath = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-cross-cutting-signoff.json',
)
const signoffPath = process.env.DZZZ_CROSS_CUTTING_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_CROSS_CUTTING_SIGNOFF_PATH)
  : defaultSignoffPath
const startupLedgerPath = path.join(auditDirectory, 'reviews', 'phase-1c-startup-config.json')
const priorReviewDirectories = [
  ['phase-1c-web-entry', 'Web 入口'],
  ['phase-1c-business-layer', '业务层'],
  ['phase-1c-data-access', '数据访问'],
  ['phase-1c-data-model', '数据模型'],
]
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-cross-cutting')
const reviewDirectory = process.env.DZZZ_CROSS_CUTTING_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_CROSS_CUTTING_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const manifestPath = path.join(reviewDirectory, 'manifest.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'

const expectedReviewedAt = '2026-08-04T02:57:50.000Z'
const expectedBatchFileCount = 40
const expectedBatchLoc = 1773
const expectedDeclaredTypeCount = 40
const expectedFieldCount = 18
const expectedPublicMethodCount = 78
const expectedPriorReviewedCount = 2888
const expectedReviewedTotal = 2928
const expectedInventoryIndexRanges = [
  [2, 18],
  [124, 134],
  [1122, 1125],
  [2366, 2373],
]
const expectedRoots = ['annoation', 'aop', 'context', 'exception', 'validator']
const expectedRootCounts = { annoation: 14, aop: 3, context: 11, exception: 4, validator: 8 }
const expectedMachineRoleCounts = { 'cross-cutting': 40 }
const expectedFinalRoleCounts = { 'async-integration': 7, 'cross-cutting': 33 }
const expectedShapeCounts = {
  'annotation-contract': 13,
  'annotation-validator': 6,
  'application-context-bridge': 1,
  'application-event': 6,
  'application-event-publisher': 1,
  aspect: 2,
  'exception-type': 3,
  'global-exception-handler': 1,
  'pointcut-declaration': 1,
  'request-context-accessor': 1,
  'startup-hook': 1,
  'thread-context-holder': 1,
  'validation-contract': 1,
  'validation-result-model': 2,
}
const expectedRiskCategoryCounts = {
  'ambient-request-session-context': 1,
  'anonymous-user-fallback-object': 1,
  'aspect-alters-exception-flow': 2,
  'aspect-logs-arguments-or-results': 1,
  'broad-global-exception-handler': 1,
  'broad-service-pointcut': 1,
  'commented-context-cleanup': 1,
  'custom-validation-name-collision': 6,
  'custom-validator-contract': 6,
  'event-publication-mode-not-local': 1,
  'exception-message-in-response': 1,
  'exception-response-without-http-status': 1,
  'ineffective-inherited-annotation': 10,
  'legacy-misspelled-contract': 25,
  'mutable-application-event': 4,
  'mutable-static-context': 2,
  'raw-thread-local-type': 1,
  'reflection-driven-parameter-contract': 1,
  'startup-external-initialization': 1,
  'static-service-locator': 1,
  'string-intern-monitor': 1,
  'thread-local-cleanup-obligation': 1,
  'unbounded-rate-limiter-cache': 1,
  'unsupported-validator-type-passes': 2,
  'validation-error-prints-raw-value': 1,
  'validator-array-assumption': 1,
}
const expectedRiskCandidateCount = Object.values(expectedRiskCategoryCounts).reduce(
  (total, count) => total + count,
  0,
)
const standardValidationFiles = new Set([
  'Constraint.java',
  'Min.java',
  'NotBlank.java',
  'NotNull.java',
  'Size.java',
  'Valid.java',
])

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 断言条件成立，否则给出可定位的错误。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 读取 Phase 1B 全部分片，并按路径建立记录索引。 */
function readExtractedRecords(manifest) {
  const records = new Map()
  for (const shard of manifest.shards) {
    const shardPath = path.join(auditDirectory, 'extracted', shard.fileName)
    for (const line of fs.readFileSync(shardPath, 'utf8').trim().split('\n')) {
      const record = JSON.parse(line)
      records.set(record.path, record)
    }
  }
  return records
}

/** 读取并校验一个分片目录中的 reviewed 记录。 */
function readShardedRecords(manifest, directory, label) {
  const records = []
  const expectedFiles = new Set(['manifest.json'])
  for (const shard of manifest.shards) {
    expectedFiles.add(shard.fileName)
    const shardPath = path.join(directory, shard.fileName)
    assert(fs.existsSync(shardPath), `${label}缺少分片 ${shard.fileName}`)
    const content = fs.readFileSync(shardPath, 'utf8')
    assert(sha256(content) === shard.sha256, `${label}${shard.fileName} SHA-256 不一致`)
    const shardRecords = content
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
    assert(shardRecords.length === shard.fileCount, `${label}${shard.fileName} 记录数不一致`)
    records.push(...shardRecords)
  }
  const actualFiles = fs.readdirSync(directory).sort()
  assert(
    JSON.stringify(actualFiles) === JSON.stringify([...expectedFiles].sort()),
    `${label}目录包含未登记文件`,
  )
  return records
}

/** 判断冻结文件是否属于第 6 批物理范围。 */
function isExpectedBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:annoation|aop|context|exception|validator)\/.*\.java$/.test(
    file.path,
  )
}

/** 独立解析第 6 批物理根目录。 */
function deriveRoot(filePath) {
  return filePath.split('/bdzz/')[1].split('/')[0]
}

/** 使用显式文件组独立确定横切职责形态。 */
function deriveShape(filePath) {
  const fileName = path.basename(filePath)
  if (filePath.includes('/context/event/')) {
    return fileName === 'EventPublisher.java' ? 'application-event-publisher' : 'application-event'
  }
  if (filePath.includes('/annoation/impl/')) return 'annotation-validator'
  if (filePath.includes('/annoation/')) return 'annotation-contract'
  if (['AppAspect.java', 'DzzzAspect.java'].includes(fileName)) return 'aspect'
  if (fileName === 'PointCuts.java') return 'pointcut-declaration'
  const contextShapes = {
    'InitializeYjbjWord.java': 'startup-hook',
    'SpringContext.java': 'application-context-bridge',
    'TableShardContext.java': 'thread-context-holder',
    'WebAppContext.java': 'request-context-accessor',
  }
  if (contextShapes[fileName]) return contextShapes[fileName]
  if (fileName === 'GloableExceptionHandler.java') return 'global-exception-handler'
  if (filePath.includes('/exception/')) return 'exception-type'
  if (fileName === 'ConstraintValidator.java') return 'validation-contract'
  if (['Error.java', 'Result.java'].includes(fileName)) return 'validation-result-model'
  return 'annotation-validator'
}

/** 从形态独立推导最终语义角色。 */
function deriveFinalRole(shape) {
  return shape.startsWith('application-event') ? 'async-integration' : 'cross-cutting'
}

/** 读取并校验冻结 Java 源码。 */
function readFrozenSource(file) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  assert(sha256(sourceBuffer) === file.sha256, `${file.path} 当前源码 SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  assert((sourceText.match(/\n/g)?.length ?? 0) === file.loc, `${file.path} 当前源码 LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  return sourceLines
}

/** 返回源码中匹配表达式的稳定行号。 */
function scanLines(sourceLines, pattern) {
  const lines = []
  sourceLines.forEach((line, index) => {
    if (pattern.test(line)) lines.push(index + 1)
  })
  return lines
}

/** 向独立风险结果追加非空行号。 */
function appendRisk(risks, category, lines) {
  const normalized = [...new Set(lines)].sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized })
}

/** 根据当前源码独立复算风险类别和精确行号。 */
function deriveRisks(file, extractedRecord, sourceLines, shape) {
  const risks = []
  const fileName = path.basename(file.path)
  const sourceText = sourceLines.join('\n')
  appendRisk(risks, 'legacy-misspelled-contract', scanLines(sourceLines, /annoation|Messgae|Gloable/))
  if (
    extractedRecord.declaredTypes[0]?.kind === 'annotation' &&
    sourceText.includes('@Inherited') &&
    !/ElementType\.TYPE\b/.test(sourceText)
  ) {
    appendRisk(risks, 'ineffective-inherited-annotation', [
      ...scanLines(sourceLines, /@Inherited/),
      ...scanLines(sourceLines, /@Target/),
    ])
  }
  if (standardValidationFiles.has(fileName)) {
    appendRisk(risks, 'custom-validation-name-collision', [extractedRecord.declaredTypes[0].line])
  }
  if (shape === 'annotation-validator') {
    appendRisk(risks, 'custom-validator-contract', [extractedRecord.declaredTypes[0].line])
  }
  if (fileName === 'MinValidator.java' || fileName === 'SizeValidator.java') {
    appendRisk(
      risks,
      'unsupported-validator-type-passes',
      scanLines(sourceLines, /className|instanceof|return bl/),
    )
  }
  if (fileName === 'NotNullElementValidator.java') {
    appendRisk(
      risks,
      'validator-array-assumption',
      scanLines(sourceLines, /Object\[\] objects|\(Object\[\]\) object|for \(Object o : objects\)/),
    )
  }
  if (fileName === 'Error.java') {
    appendRisk(
      risks,
      'validation-error-prints-raw-value',
      scanLines(sourceLines, /String toString|", value="/),
    )
  }
  if (fileName === 'PointCuts.java') {
    appendRisk(
      risks,
      'broad-service-pointcut',
      scanLines(sourceLines, /execution\(public \* com\.tdh\.bdzz\.service\.impl/),
    )
  }
  if (fileName === 'DzzzAspect.java') {
    appendRisk(
      risks,
      'aspect-logs-arguments-or-results',
      scanLines(sourceLines, /joinPoint\.getArgs\(\)|^\s*result\s*$/),
    )
    appendRisk(risks, 'aspect-alters-exception-flow', scanLines(sourceLines, /throw new BpException/))
    appendRisk(risks, 'commented-context-cleanup', scanLines(sourceLines, /\/\/.*cleanContext/))
    appendRisk(
      risks,
      'reflection-driven-parameter-contract',
      scanLines(sourceLines, /ReflectionCacheUtil/),
    )
  }
  if (fileName === 'AppAspect.java') {
    appendRisk(
      risks,
      'aspect-alters-exception-flow',
      scanLines(sourceLines, /catch \(Throwable|return null/),
    )
    appendRisk(risks, 'string-intern-monitor', scanLines(sourceLines, /orgin\.intern\(\)/))
    appendRisk(risks, 'unbounded-rate-limiter-cache', scanLines(sourceLines, /rateLimiterMap|\.put\(orgin/))
  }
  if (fileName === 'SpringContext.java') {
    appendRisk(
      risks,
      'static-service-locator',
      scanLines(sourceLines, /static ApplicationContext|applicationContext\.getBean/),
    )
  }
  if (fileName === 'TableShardContext.java') {
    appendRisk(
      risks,
      'thread-local-cleanup-obligation',
      scanLines(sourceLines, /ThreadLocal|\.remove\(\)/),
    )
    appendRisk(risks, 'raw-thread-local-type', scanLines(sourceLines, /new ThreadLocal\(\)/))
  }
  if (fileName === 'WebAppContext.java') {
    appendRisk(
      risks,
      'ambient-request-session-context',
      scanLines(sourceLines, /RequestContextHolder|getCurrentSession|getCurrentUser/),
    )
    appendRisk(
      risks,
      'anonymous-user-fallback-object',
      scanLines(sourceLines, /return new UserBean\(\)/),
    )
  }
  if (fileName === 'InitializeYjbjWord.java') {
    appendRisk(
      risks,
      'startup-external-initialization',
      scanLines(sourceLines, /void run|AsposeContext\.initContext/),
    )
  }
  if (shape === 'application-event' && extractedRecord.annotations.some((item) => item.name === 'Data')) {
    appendRisk(
      risks,
      'mutable-application-event',
      extractedRecord.annotations.filter((item) => item.name === 'Data').map((item) => item.line),
    )
  }
  if (shape === 'application-event-publisher') {
    appendRisk(risks, 'event-publication-mode-not-local', scanLines(sourceLines, /publishEvent/))
  }
  if (shape === 'global-exception-handler') {
    appendRisk(
      risks,
      'broad-global-exception-handler',
      scanLines(sourceLines, /@ExceptionHandler\(Exception\.class\)/),
    )
    if (!sourceText.includes('@ResponseStatus')) {
      appendRisk(
        risks,
        'exception-response-without-http-status',
        scanLines(sourceLines, /@ExceptionHandler/),
      )
    }
    appendRisk(
      risks,
      'exception-message-in-response',
      scanLines(sourceLines, /ResultEO\.fail\(e\.getMessage\(\)\)|append\(fieldError/),
    )
  }
  appendRisk(
    risks,
    'mutable-static-context',
    extractedRecord.fields
      .filter((field) => field.modifiers.includes('static') && !field.modifiers.includes('final'))
      .map((field) => field.line),
  )
  return risks
}

/** 独立压缩 Phase 1B 的内部 CodeGraph 使用边。 */
function deriveUsageEvidence(extractedRecord) {
  /** 只投影单条候选中属于公开台账合同的稳定字段。 */
  const projectCandidate = (candidate) => ({
    kind: candidate.kind,
    sourcePath: candidate.sourcePath,
    sourceSymbol: candidate.sourceSymbol,
    targetPath: candidate.targetPath,
    targetSymbol: candidate.targetSymbol,
    occurrences: candidate.occurrences,
    lines: candidate.lines,
  })
  const inbound = extractedRecord.codeGraph.internalInboundCandidates.map(projectCandidate)
  const outbound = extractedRecord.codeGraph.internalOutboundCandidates.map(projectCandidate)
  return {
    inbound,
    outbound,
    inboundOccurrenceCount: inbound.reduce((total, item) => total + item.occurrences, 0),
    outboundOccurrenceCount: outbound.reduce((total, item) => total + item.occurrences, 0),
  }
}

/** 独立计算直接依赖清单。 */
function deriveDependencies(extractedRecord) {
  const values = extractedRecord.frameworkUsages.map((usage) => usage.id)
  values.push(
    ...extractedRecord.imports
      .map((item) => item.name)
      .filter((name) => /^(?:com\.tdh\.bdzz|javax\.|org\.aspectj|org\.springframework)/.test(name)),
  )
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

/** 独立计算源码证据应覆盖的结构行。 */
function deriveSourceEvidenceLines(extractedRecord) {
  return [
    ...extractedRecord.declaredTypes.map((item) => item.line),
    ...extractedRecord.annotations.map((item) => item.line),
    ...extractedRecord.fields.map((item) => item.line),
    ...extractedRecord.publicMethods.flatMap((item) => [item.line, item.endLine]),
  ]
    .filter(Number.isInteger)
    .filter((line, index, values) => values.indexOf(line) === index)
    .sort((left, right) => left - right)
}

/** 验证记录中的源码行号合法。 */
function validateLines(lines, loc, label) {
  assert(Array.isArray(lines) && lines.length > 0, `${label} 缺少源码行号`)
  assert(lines.every((line) => Number.isInteger(line) && line >= 1 && line <= loc), `${label} 行号越界`)
}

/** 验证单条横切能力记录的身份、语义和风险证据。 */
function validateRecord(record, file, extractedRecord) {
  const label = `横切能力记录 ${record.path ?? '<unknown>'}`
  assert(file, `${label} 不在第 6 批冻结范围`)
  assert(extractedRecord, `${label} 缺少 Phase 1B 记录`)
  const sourceLines = readFrozenSource(file)
  const expectedShape = deriveShape(file.path)
  const expectedRisks = deriveRisks(file, extractedRecord, sourceLines, expectedShape)
  const actualRisks = record.riskCandidates.map(({ category, lines }) => ({ category, lines }))
  const expectedUsage = deriveUsageEvidence(extractedRecord)

  assert(record.inventoryIndex === file.index, `${label} inventoryIndex 不一致`)
  assert(record.sourceSha256 === file.sha256, `${label} sourceSha256 不一致`)
  assert(record.sourceSha256 === extractedRecord.sourceSha256, `${label} 与 Phase 1B 哈希不一致`)
  assert(record.loc === file.loc, `${label} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${label} 状态不是 reviewed`)
  assert(record.machineRoleCandidate === 'cross-cutting', `${label} 机器角色不是 cross-cutting`)
  assert(record.machineRoleCandidate === extractedRecord.inferredRole.primary, `${label} 机器角色已漂移`)
  assert(record.crossCuttingRoot === deriveRoot(file.path), `${label} 物理根目录不一致`)
  assert(record.crossCuttingShape === expectedShape, `${label} 横切职责形态与源码不一致`)
  assert(record.finalRole === deriveFinalRole(expectedShape), `${label} 最终角色与源码职责不一致`)
  assert(record.structure.declaredTypeCount === extractedRecord.declaredTypes.length, `${label} 类型数不一致`)
  assert(record.structure.fieldCount === extractedRecord.fields.length, `${label} 字段数不一致`)
  assert(record.structure.publicMethodCount === extractedRecord.publicMethods.length, `${label} 方法数不一致`)
  assert(record.structure.primaryTypeKind === extractedRecord.declaredTypes[0]?.kind, `${label} 类型种类不一致`)
  assert(
    JSON.stringify(record.structure.extends) === JSON.stringify(extractedRecord.declaredTypes[0]?.extends ?? []),
    `${label} extends 不一致`,
  )
  assert(
    JSON.stringify(record.structure.implements) ===
      JSON.stringify(extractedRecord.declaredTypes[0]?.implements ?? []),
    `${label} implements 不一致`,
  )
  const expectedAnnotationNames = [
    ...new Set(extractedRecord.annotations.map((item) => item.name)),
  ].sort()
  assert(
    JSON.stringify(record.annotationProfile.names) === JSON.stringify(expectedAnnotationNames),
    `${label} 注解清单不一致`,
  )
  assert(
    JSON.stringify(record.frameworkUsages) ===
      JSON.stringify(extractedRecord.frameworkUsages.map((usage) => usage.id).sort()),
    `${label} 框架信号不一致`,
  )
  assert(JSON.stringify(record.usageEvidence) === JSON.stringify(expectedUsage), `${label} 使用边不一致`)
  assert(
    JSON.stringify(record.dependencies) === JSON.stringify(deriveDependencies(extractedRecord)),
    `${label} 依赖清单不一致`,
  )
  assert(JSON.stringify(actualRisks) === JSON.stringify(expectedRisks), `${label} 风险类别或行号与源码不一致`)
  for (const risk of record.riskCandidates) {
    assert(typeof risk.summary === 'string' && risk.summary.trim(), `${label} 风险缺少摘要`)
    validateLines(risk.lines, record.loc, `${label} 风险 ${risk.category}`)
  }
  assert(Array.isArray(record.capabilityCandidates) && record.capabilityCandidates.length > 0, `${label} 缺少能力候选`)
  for (const field of ['roleDetail', 'responsibility', 'lifecycle']) {
    assert(typeof record[field] === 'string' && record[field].trim(), `${label} 缺少 ${field}`)
  }
  assert(record.sourceEvidence.length === 1, `${label} 源码证据数量不一致`)
  assert(
    JSON.stringify(record.sourceEvidence[0].lines) ===
      JSON.stringify(deriveSourceEvidenceLines(extractedRecord)),
    `${label} 源码证据行不一致`,
  )
  validateLines(record.sourceEvidence[0].lines, record.loc, `${label} 源码证据`)
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  const counts = new Map()
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 独立统计风险类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 读取前五批 reviewed 路径并验证累计分母。 */
function readPriorReviewedPaths() {
  const startup = readJson(startupLedgerPath).records.map((record) => record.path)
  const sharded = priorReviewDirectories.flatMap(([directoryName, label]) => {
    const directory = path.join(auditDirectory, 'reviews', directoryName)
    const manifest = readJson(path.join(directory, 'manifest.json'))
    return readShardedRecords(manifest, directory, `${label} `).map((record) => record.path)
  })
  const paths = [...startup, ...sharded]
  assert(paths.length === expectedPriorReviewedCount, '前五批 reviewed 数量不是 2888')
  assert(new Set(paths).size === paths.length, '前五批 reviewed 路径存在重叠')
  return new Set(paths)
}

/** 验证人工签核与 manifest、分片和冻结身份一致。 */
function validateSignoff(signoff, manifest, records, inventory, extractionManifest) {
  assert(signoff.schemaVersion === 1, '横切能力签核 schemaVersion 不受支持')
  assert(signoff.snapshotId === inventory.snapshotId, '横切能力签核 snapshotId 不一致')
  assert(signoff.analysisId === extractionManifest.analysisId, '横切能力签核 analysisId 不一致')
  assert(signoff.batchId === 'phase-1c-cross-cutting', '横切能力签核 batchId 不一致')
  assert(signoff.status === 'approved', '横切能力人工签核状态不是 approved')
  assert(signoff.reviewedAt === expectedReviewedAt, '横切能力签核 reviewedAt 不一致')
  assert(sha256(fs.readFileSync(signoffPath)) === manifest.manualReviewSignoff.sha256, '横切能力签核 SHA-256 不一致')
  assert(signoff.shards.length === manifest.shards.length, '横切能力签核分片数不一致')
  const expectedShards = manifest.shards.map(({ fileName, fileCount, sha256: hash }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision: 'approved',
  }))
  assert(JSON.stringify(signoff.shards) === JSON.stringify(expectedShards), '横切能力签核没有绑定当前分片')
  assert(signoff.summary.approvedFileCount === records.length, '横切能力签核文件数不一致')
  assert(
    signoff.summary.approvedLoc === records.reduce((total, record) => total + record.loc, 0),
    '横切能力签核 LOC 不一致',
  )
  assert(signoff.summary.approvedShardCount === manifest.shards.length, '横切能力签核分片汇总不一致')
}

/** 验证第 6 批横切能力台账、独立语义和累计状态。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const signoff = readJson(signoffPath)
  const manifest = readJson(manifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const expectedFiles = inventory.files.filter(isExpectedBatchFile)
  const records = readShardedRecords(manifest, reviewDirectory, '横切能力 ')

  assert(manifest.schemaVersion === 1, '横切能力 manifest schemaVersion 不受支持')
  assert(manifest.snapshotId === inventory.snapshotId, '横切能力 manifest snapshotId 不一致')
  assert(manifest.analysisId === extractionManifest.analysisId, '横切能力 manifest analysisId 不一致')
  assert(manifest.batchId === 'phase-1c-cross-cutting', '横切能力 manifest batchId 不一致')
  assert(manifest.status === 'completed', '横切能力批次状态不是 completed')
  assert(manifest.reviewedAt === expectedReviewedAt, '横切能力 manifest reviewedAt 不一致')
  assert(JSON.stringify(manifest.batchScope.roots) === JSON.stringify(expectedRoots), '横切能力根目录不一致')
  assert(
    JSON.stringify(manifest.batchScope.javaInventoryIndexRanges) ===
      JSON.stringify(expectedInventoryIndexRanges),
    '横切能力库存索引区间不一致',
  )
  assert(manifest.shards.length === 1, '横切能力分片数不是 1')
  assert(records.length === expectedBatchFileCount, '横切能力记录数不是 40')
  assert(records.length === expectedFiles.length, '横切能力没有覆盖完整物理分母')
  assert(
    JSON.stringify(records.map((record) => record.path)) ===
      JSON.stringify(expectedFiles.map((file) => file.path)),
    '横切能力路径集合或顺序不一致',
  )
  assert(new Set(records.map((record) => record.path)).size === records.length, '横切能力路径重复')

  const priorPaths = readPriorReviewedPaths()
  assert(records.every((record) => !priorPaths.has(record.path)), '横切能力与前五批路径发生重叠')
  const filesByPath = new Map(expectedFiles.map((file) => [file.path, file]))
  for (const record of records) {
    validateRecord(record, filesByPath.get(record.path), extractedByPath.get(record.path))
  }
  validateSignoff(signoff, manifest, records, inventory, extractionManifest)

  const batchLoc = records.reduce((total, record) => total + record.loc, 0)
  const declaredTypeCount = records.reduce(
    (total, record) => total + record.structure.declaredTypeCount,
    0,
  )
  const fieldCount = records.reduce((total, record) => total + record.structure.fieldCount, 0)
  const publicMethodCount = records.reduce(
    (total, record) => total + record.structure.publicMethodCount,
    0,
  )
  const rootCounts = countBy(records, 'crossCuttingRoot')
  const machineRoleCandidateCounts = countBy(records, 'machineRoleCandidate')
  const finalRoleCounts = countBy(records, 'finalRole')
  const crossCuttingShapeCounts = countBy(records, 'crossCuttingShape')
  const roleCorrectionCount = records.filter(
    (record) => record.machineRoleCandidate !== record.finalRole,
  ).length
  const annotationTypeCount = records.filter(
    (record) => record.structure.primaryTypeKind === 'annotation',
  ).length
  const inboundUsageOccurrenceCount = records.reduce(
    (total, record) => total + record.usageEvidence.inboundOccurrenceCount,
    0,
  )
  const outboundUsageOccurrenceCount = records.reduce(
    (total, record) => total + record.usageEvidence.outboundOccurrenceCount,
    0,
  )
  const risks = records.flatMap((record) => record.riskCandidates)
  const riskCategoryCounts = countRiskCategories(records)
  const currentAuditStatusCounts = {
    unreviewed: inventory.summary.total.fileCount - expectedReviewedTotal,
    reviewing: 0,
    reviewed: expectedReviewedTotal,
    blocked: 0,
  }

  assert(batchLoc === expectedBatchLoc, '横切能力 LOC 不是 1773')
  assert(declaredTypeCount === expectedDeclaredTypeCount, '横切能力类型数不是 40')
  assert(fieldCount === expectedFieldCount, '横切能力字段数不是 18')
  assert(publicMethodCount === expectedPublicMethodCount, '横切能力公开方法数不是 78')
  assert(JSON.stringify(rootCounts) === JSON.stringify(expectedRootCounts), '横切能力根目录汇总不一致')
  assert(
    JSON.stringify(machineRoleCandidateCounts) === JSON.stringify(expectedMachineRoleCounts),
    '横切能力机器角色汇总不一致',
  )
  assert(JSON.stringify(finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts), '横切能力最终角色汇总不一致')
  assert(JSON.stringify(crossCuttingShapeCounts) === JSON.stringify(expectedShapeCounts), '横切能力形态汇总不一致')
  assert(roleCorrectionCount === 7, '横切能力角色纠正数不是 7')
  assert(annotationTypeCount === 13, '横切能力注解类型数不是 13')
  assert(inboundUsageOccurrenceCount === 2258, '横切能力入站使用出现次数不是 2258')
  assert(outboundUsageOccurrenceCount === 38, '横切能力出站使用出现次数不是 38')
  assert(risks.length === expectedRiskCandidateCount, '横切能力风险候选数不是 75')
  assert(
    JSON.stringify(riskCategoryCounts) === JSON.stringify(expectedRiskCategoryCounts),
    '横切能力风险类别汇总不一致',
  )
  const expectedRiskIds = Array.from(
    { length: expectedRiskCandidateCount },
    (_, index) => `XC-${String(index + 1).padStart(4, '0')}`,
  )
  assert(
    JSON.stringify(risks.map((risk) => risk.id)) === JSON.stringify(expectedRiskIds),
    '横切能力风险 ID 必须连续且唯一',
  )

  const expectedSummary = {
    batchFileCount: records.length,
    batchLoc,
    declaredTypeCount,
    fieldCount,
    publicMethodCount,
    rootCounts,
    machineRoleCandidateCounts,
    finalRoleCounts,
    crossCuttingShapeCounts,
    roleCorrectionCount,
    annotationTypeCount,
    inboundUsageOccurrenceCount,
    outboundUsageOccurrenceCount,
    riskCandidateCount: risks.length,
    riskCategoryCounts,
    currentAuditStatusCounts,
  }
  assert(JSON.stringify(manifest.summary) === JSON.stringify(expectedSummary), '横切能力 manifest summary 不一致')
  assert(
    Object.values(currentAuditStatusCounts).reduce((total, count) => total + count, 0) ===
      inventory.summary.total.fileCount,
    '前六批累计状态没有覆盖冻结分母',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: manifest.batchId,
      reviewedFiles: records.length,
      batchLoc,
      crossCuttingShapeCounts,
      riskCandidateCount: risks.length,
      roleCorrectionCount,
      currentAuditStatusCounts,
    }),
  )
}

main()
