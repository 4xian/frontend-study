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
  'phase-1c-async-integration-signoff.json',
)
const signoffPath = process.env.DZZZ_ASYNC_INTEGRATION_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_ASYNC_INTEGRATION_SIGNOFF_PATH)
  : defaultSignoffPath
const defaultReviewDirectory = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-async-integration',
)
const reviewDirectory = process.env.DZZZ_ASYNC_INTEGRATION_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_ASYNC_INTEGRATION_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const manifestPath = path.join(reviewDirectory, 'manifest.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'
const expectedReviewedAt = '2026-08-04T03:46:40.000Z'
const expectedPriorReviewedCount = 2928
const expectedBatchFileCount = 191
const expectedBatchLoc = 29485
const expectedReviewedTotal = 3119
const expectedDeclaredTypeCount = 198
const expectedFieldCount = 1758
const expectedPublicMethodCount = 412
const expectedInboundOccurrenceCount = 2823
const expectedOutboundOccurrenceCount = 7953
const expectedIndexRanges = [
  [1141, 1143],
  [1147, 1173],
  [2102, 2114],
  [2124, 2270],
  [3423, 3423],
]
const expectedRootCounts = { handler: 24, listener: 6, timer: 160, ws: 1 }
const expectedMachineRoleCounts = { 'async-integration': 190, unclassified: 1 }
const expectedFinalRoleCounts = {
  'async-integration': 79,
  common: 4,
  'data-access': 3,
  'data-model': 102,
  infrastructure: 3,
}
const expectedShapeCounts = {
  'application-listener': 6,
  'burn-handler-contract': 1,
  'burn-print-adapter': 1,
  'cleanup-contract': 1,
  'cleanup-handler': 9,
  'data-report-adapter': 4,
  'data-report-contract': 1,
  'data-sync-chain': 2,
  'data-sync-handler': 9,
  'data-sync-handler-contract': 1,
  'file-process-contract': 2,
  'file-process-handler': 3,
  'handler-factory': 4,
  'mybatis-type-handler': 3,
  'retransmission-endpoint': 1,
  'scheduled-task': 1,
  'task-business-model': 4,
  'task-enum': 4,
  'task-exchange-model': 63,
  'task-service': 13,
  'task-transfer-model': 35,
  'task-trigger': 12,
  'voice-to-text-adapter': 10,
  'voice-to-text-contract': 1,
}
const expectedSignalFileCounts = {
  scheduledLines: 2,
  asyncLines: 8,
  postConstructLines: 2,
  applicationListenerLines: 6,
  completableFutureLines: 3,
  rawThreadLines: 3,
  blockingSleepLines: 6,
  concurrentMapLines: 5,
}
const expectedRiskCategoryCounts = {
  'async-transaction-boundary': 3,
  'blocking-sleep': 6,
  'broad-catch': 42,
  'field-injection': 67,
  'legacy-fastjson-persistence': 1,
  'legacy-misspelled-contract': 4,
  'local-scheduling-enable': 2,
  'mutable-handler-registry': 4,
  'mutable-static-state': 4,
  'mutable-task-model': 101,
  'raw-thread': 3,
  'sensitive-model-field': 19,
  'shared-session-state': 1,
  'startup-external-work': 2,
  'synchronous-event-listener': 4,
  'unobserved-future-failure': 1,
}
const expectedRiskCandidateCount = Object.values(expectedRiskCategoryCounts).reduce(
  (total, count) => total + count,
  0,
)
const priorReviewSources = [
  { kind: 'single', path: 'phase-1c-startup-config.json' },
  { kind: 'sharded', path: 'phase-1c-web-entry' },
  { kind: 'sharded', path: 'phase-1c-business-layer' },
  { kind: 'sharded', path: 'phase-1c-data-access' },
  { kind: 'sharded', path: 'phase-1c-data-model' },
  { kind: 'sharded', path: 'phase-1c-cross-cutting' },
]

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

/** 读取前六批已复核路径并验证路径唯一。 */
function readPriorReviewedPaths() {
  const reviewed = new Set()
  for (const source of priorReviewSources) {
    const sourcePath = path.join(auditDirectory, 'reviews', source.path)
    if (source.kind === 'single') {
      for (const record of readJson(sourcePath).records) {
        assert(!reviewed.has(record.path), `前六批重复路径：${record.path}`)
        reviewed.add(record.path)
      }
      continue
    }
    const manifest = readJson(path.join(sourcePath, 'manifest.json'))
    for (const shard of manifest.shards) {
      const content = fs.readFileSync(path.join(sourcePath, shard.fileName), 'utf8')
      assert(sha256(content) === shard.sha256, `${source.path}/${shard.fileName} 哈希不一致`)
      for (const line of content.trim().split('\n')) {
        const record = JSON.parse(line)
        assert(!reviewed.has(record.path), `前六批重复路径：${record.path}`)
        reviewed.add(record.path)
      }
    }
  }
  assert(reviewed.size === expectedPriorReviewedCount, '前六批已复核分母不一致')
  return reviewed
}

/** 读取并校验第 7 批全部分片。 */
function readReviewRecords(manifest) {
  const records = []
  const expectedFiles = new Set(['manifest.json'])
  for (const shard of manifest.shards) {
    expectedFiles.add(shard.fileName)
    const shardPath = path.join(reviewDirectory, shard.fileName)
    assert(fs.existsSync(shardPath), `缺少第 7 批分片：${shard.fileName}`)
    const content = fs.readFileSync(shardPath, 'utf8')
    assert(sha256(content) === shard.sha256, `${shard.fileName} SHA-256 不一致`)
    const shardRecords = content
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
    assert(shardRecords.length === shard.fileCount, `${shard.fileName} 记录数不一致`)
    assert(shardRecords[0].inventoryIndex === shard.firstInventoryIndex, `${shard.fileName} 首索引错误`)
    assert(shardRecords.at(-1).inventoryIndex === shard.lastInventoryIndex, `${shard.fileName} 尾索引错误`)
    assert(shardRecords[0].path === shard.firstPath, `${shard.fileName} 首路径错误`)
    assert(shardRecords.at(-1).path === shard.lastPath, `${shard.fileName} 尾路径错误`)
    records.push(...shardRecords)
  }
  assert(
    JSON.stringify(fs.readdirSync(reviewDirectory).sort()) ===
      JSON.stringify([...expectedFiles].sort()),
    '第 7 批目录包含未登记文件',
  )
  return records
}

/** 判断库存文件是否属于第 7 批物理目录。 */
function isPhysicalBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:handler|listener|timer|ws)\/.*\.java$/.test(
    file.path,
  )
}

/** 独立推导第 7 批物理根目录。 */
function deriveRoot(filePath) {
  return filePath.split('/bdzz/')[1].split('/')[0]
}

/** 使用显式路径组独立确定第 7 批职责形态。 */
function deriveShape(filePath) {
  const fileName = path.basename(filePath)
  if (/\/handler\/(?:AbstractJsonTypeHandler|EnumTypeHandler|FastJsonTypeHandler)\.java$/.test(filePath)) {
    return 'mybatis-type-handler'
  }
  if (filePath.includes('/handler/burn/')) {
    if (fileName === 'BurnPrintHandler.java') return 'burn-handler-contract'
    if (fileName === 'BurnPrintHandlerFactory.java') return 'handler-factory'
    return 'burn-print-adapter'
  }
  if (filePath.includes('/handler/datareport/')) {
    if (fileName === 'DataReportHandler.java') return 'data-report-contract'
    if (fileName === 'DataReportHandlerFactory.java') return 'handler-factory'
    return 'data-report-adapter'
  }
  if (filePath.includes('/handler/voice2text/')) {
    if (fileName === 'Voice2TextHandler.java') return 'voice-to-text-contract'
    if (fileName === 'Voice2TextHandlerFactory.java') return 'handler-factory'
    return 'voice-to-text-adapter'
  }
  if (filePath.includes('/listener/')) return 'application-listener'
  if (filePath.includes('/timer/bo/')) return 'task-business-model'
  if (filePath.includes('/timer/dto/')) return 'task-transfer-model'
  if (filePath.includes('/timer/enums/')) return 'task-enum'
  if (filePath.includes('/timer/eo/')) return 'task-exchange-model'
  if (filePath.includes('/timer/trialInspect/')) return 'scheduled-task'
  if (filePath.includes('/timer/service/')) return 'task-service'
  if (filePath.includes('/timer/handler/clearExpireData/')) {
    return fileName === 'ClearExpireDataHandler.java' ? 'cleanup-contract' : 'cleanup-handler'
  }
  if (filePath.includes('/timer/handler/fileProcess/')) {
    if (fileName === 'FileProcessHandlerFactory.java') return 'handler-factory'
    if (['AbstractFileProcessHandler.java', 'FileProcessHandler.java'].includes(fileName)) {
      return 'file-process-contract'
    }
    return 'file-process-handler'
  }
  if (['JzDataSyncHandlerChain.java', 'TdhTsglptJzDataSyncHandlerChain.java'].includes(fileName)) {
    return 'data-sync-chain'
  }
  if (fileName === 'JzDataSyncHandler.java') return 'data-sync-handler-contract'
  if (filePath.includes('/timer/handler/')) return 'data-sync-handler'
  if (filePath.includes('/timer/')) return 'task-trigger'
  if (filePath.endsWith('/ws/ReTransmissionService.java')) return 'retransmission-endpoint'
  throw new Error(`无法独立推导职责形态：${filePath}`)
}

/** 结合职责形态和源码声明证据独立推导最终语义角色。 */
function deriveFinalRole(shape, filePath, extractedRecord, sourceLines) {
  const topLevelTypes = extractedRecord.declaredTypes.filter((type) => type.owner === null)
  const annotationNames = new Set(extractedRecord.annotations.map((annotation) => annotation.name))
  const sourceText = sourceLines.join('\n')
  if (shape === 'mybatis-type-handler') {
    const extendsTypeHandler = topLevelTypes.some((type) =>
      type.extends.some((name) => /^(?:BaseTypeHandler|AbstractJsonTypeHandler)</.test(name)),
    )
    assert(
      extendsTypeHandler && extractedRecord.frameworkUsages.some((usage) => usage.id === 'mybatis'),
      `${filePath} 缺少 MyBatis TypeHandler 源码证据`,
    )
    return 'data-access'
  }
  if (filePath.includes('/handler/burn/')) {
    const hasBurnContract = topLevelTypes.some(
      (type) =>
        (shape === 'burn-handler-contract' && type.kind === 'interface') ||
        (shape === 'burn-print-adapter' && type.implements.includes('BurnPrintHandler')) ||
        (shape === 'handler-factory' && type.name === 'BurnPrintHandlerFactory'),
    )
    assert(hasBurnContract, `${filePath} 缺少刻录打印基础设施源码证据`)
    return 'infrastructure'
  }
  if (['task-business-model', 'task-transfer-model', 'task-exchange-model'].includes(shape)) {
    const isDataCarrier =
      topLevelTypes.some((type) => type.kind === 'class') &&
      extractedRecord.fields.length > 0 &&
      !['Component', 'Service', 'Repository', 'Controller'].some((name) => annotationNames.has(name))
    assert(isDataCarrier, `${filePath} 缺少任务数据模型源码证据`)
    return 'data-model'
  }
  if (shape === 'task-enum') {
    assert(topLevelTypes.some((type) => type.kind === 'enum'), `${filePath} 缺少枚举源码证据`)
    return 'common'
  }
  const contractShapes = new Set([
    'cleanup-contract',
    'data-report-contract',
    'data-sync-handler-contract',
    'file-process-contract',
    'voice-to-text-contract',
  ])
  if (contractShapes.has(shape)) {
    const isContract = topLevelTypes.some(
      (type) => type.kind === 'interface' || type.modifiers.includes('abstract'),
    )
    assert(isContract, `${filePath} 缺少异步集成合同源码证据`)
    return 'async-integration'
  }
  if (shape === 'application-listener') {
    const implementsListener = topLevelTypes.some((type) =>
      type.implements.some((name) => name.startsWith('ApplicationListener<')),
    )
    assert(implementsListener, `${filePath} 缺少 ApplicationListener 源码证据`)
    return 'async-integration'
  }
  if (shape === 'retransmission-endpoint') {
    assert(
      annotationNames.has('WebService') && /CompletableFuture\.(?:runAsync|supplyAsync)/.test(sourceText),
      `${filePath} 缺少重传端点异步源码证据`,
    )
    return 'async-integration'
  }
  assert(
    annotationNames.has('Component') || annotationNames.has('Service'),
    `${filePath} 缺少受管异步集成组件源码证据`,
  )
  return 'async-integration'
}

/** 读取并验证冻结 Java 源码。 */
function readFrozenSource(file) {
  const sourceBuffer = fs.readFileSync(path.join(sourceRepository, file.path))
  assert(sha256(sourceBuffer) === file.sha256, `${file.path} 当前源码 SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  assert((sourceText.match(/\n/g)?.length ?? 0) === file.loc, `${file.path} 当前源码 LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  return sourceLines
}

/** 返回源码中匹配表达式的稳定行号。 */
function scanLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => (pattern.test(line) ? [index + 1] : []))
}

/** 独立提取异步、调度和并发信号。 */
function deriveSignals(sourceLines) {
  return {
    scheduledLines: scanLines(sourceLines, /@Scheduled\b/),
    asyncLines: scanLines(sourceLines, /@Async\b/),
    postConstructLines: scanLines(sourceLines, /@PostConstruct\b/),
    applicationListenerLines: scanLines(sourceLines, /implements ApplicationListener</),
    completableFutureLines: scanLines(sourceLines, /CompletableFuture\.(?:runAsync|supplyAsync)/),
    rawThreadLines: scanLines(sourceLines, /new Thread\s*\(/),
    blockingSleepLines: scanLines(sourceLines, /Thread\.sleep\s*\(/),
    concurrentMapLines: scanLines(sourceLines, /\bnew\s+ConcurrentHashMap\s*</),
  }
}

/** 向独立风险结果追加非空行号。 */
function appendRisk(risks, category, lines) {
  const normalized = [...new Set(lines)].sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized })
}

/** 根据当前源码独立复算风险类别和精确行号。 */
function deriveRisks(extractedRecord, sourceLines, shape, signals) {
  const risks = []
  const sourceText = sourceLines.join('\n')
  appendRisk(risks, 'field-injection', scanLines(sourceLines, /@(Autowired|Resource)\b/))
  appendRisk(risks, 'raw-thread', signals.rawThreadLines)
  appendRisk(risks, 'blocking-sleep', signals.blockingSleepLines)
  const hasExplicitFutureExecutor = /\},\s*[A-Za-z_$][\w$]*\s*\)\s*(?:\.|;)/.test(sourceText)
  assert(
    signals.completableFutureLines.length === 0 || hasExplicitFutureExecutor,
    '冻结范围出现未显式指定 Executor 的 CompletableFuture',
  )
  if (signals.completableFutureLines.length > 0 && !/\.exceptionally\s*\(|\.handle\s*\(|\.whenComplete\s*\(/.test(sourceText)) {
    appendRisk(risks, 'unobserved-future-failure', signals.completableFutureLines)
  }
  appendRisk(risks, 'startup-external-work', signals.postConstructLines)
  if (signals.asyncLines.length > 0 && extractedRecord.annotations.some((item) => item.name === 'Transactional')) {
    appendRisk(risks, 'async-transaction-boundary', [
      ...signals.asyncLines,
      ...scanLines(sourceLines, /@Transactional\b/),
    ])
  }
  if (signals.scheduledLines.length > 0 && scanLines(sourceLines, /@EnableScheduling\b/).length > 0) {
    appendRisk(risks, 'local-scheduling-enable', [
      ...signals.scheduledLines,
      ...scanLines(sourceLines, /@EnableScheduling\b/),
    ])
  }
  appendRisk(
    risks,
    'mutable-static-state',
    extractedRecord.fields
      .filter((field) => field.modifiers.includes('static') && !field.modifiers.includes('final'))
      .map((field) => field.line),
  )
  if (shape === 'handler-factory') {
    appendRisk(risks, 'mutable-handler-registry', signals.concurrentMapLines)
  }
  if (shape === 'mybatis-type-handler') {
    appendRisk(
      risks,
      'legacy-fastjson-persistence',
      scanLines(sourceLines, /JSON\.(?:parseObject|toJSONString)|FastJson/),
    )
  }
  if (shape === 'voice-to-text-adapter') {
    appendRisk(
      risks,
      'shared-session-state',
      extractedRecord.fields
        .filter(
          (field) =>
            !field.modifiers.includes('final') &&
            /^(?:Map|List|Set)<|(?:Session|Socket|Buffer|Channel)/.test(field.type),
        )
        .map((field) => field.line),
    )
  }
  if (['task-business-model', 'task-transfer-model', 'task-exchange-model'].includes(shape)) {
    appendRisk(
      risks,
      'mutable-task-model',
      extractedRecord.annotations.filter((item) => item.name === 'Data').map((item) => item.line),
    )
    appendRisk(
      risks,
      'sensitive-model-field',
      extractedRecord.fields
        .filter((field) => /(password|passwd|pwd|token|secret|key|sfz|zjhm)/i.test(field.name))
        .map((field) => field.line),
    )
  }
  if (shape === 'application-listener' && signals.completableFutureLines.length === 0) {
    appendRisk(risks, 'synchronous-event-listener', signals.applicationListenerLines)
  }
  appendRisk(risks, 'broad-catch', scanLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/))
  appendRisk(risks, 'legacy-misspelled-contract', scanLines(sourceLines, /DatsSync|Messgae/))
  return risks
}

/** 独立复算源码证据行号。 */
function deriveSourceEvidenceLines(extractedRecord, signals) {
  return [
    ...extractedRecord.declaredTypes.map((item) => item.line),
    ...extractedRecord.annotations.map((item) => item.line),
    ...extractedRecord.fields.map((item) => item.line),
    ...extractedRecord.publicMethods.flatMap((item) => [item.line, item.endLine]),
    ...Object.values(signals).flat(),
  ]
    .filter(Number.isInteger)
    .filter((line, index, values) => values.indexOf(line) === index)
    .sort((left, right) => left - right)
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  const counts = new Map()
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 统计全部风险类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 把库存索引压缩为连续区间。 */
function buildIndexRanges(records) {
  const ranges = []
  for (const record of records) {
    const current = ranges.at(-1)
    if (!current || record.inventoryIndex !== current[1] + 1) {
      ranges.push([record.inventoryIndex, record.inventoryIndex])
    } else current[1] = record.inventoryIndex
  }
  return ranges
}

/** 校验单条记录与库存、提取数据和源码完全一致。 */
function validateRecord(record, file, extractedRecord, priorPaths, riskIds) {
  assert(!priorPaths.has(record.path), `${record.path} 与前六批重叠`)
  assert(record.inventoryIndex === file.index, `${record.path} 库存索引不一致`)
  assert(record.sourceSha256 === file.sha256, `${record.path} 冻结哈希不一致`)
  assert(record.loc === file.loc, `${record.path} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${record.path} 状态不是 reviewed`)
  assert(record.machineRoleCandidate === extractedRecord.inferredRole.primary, `${record.path} 机器角色错误`)
  const sourceLines = readFrozenSource(file)
  const shape = deriveShape(record.path)
  assert(record.asyncRoot === deriveRoot(record.path), `${record.path} 物理根目录错误`)
  assert(record.asyncShape === shape, `${record.path} 职责形态错误`)
  assert(
    record.finalRole === deriveFinalRole(shape, record.path, extractedRecord, sourceLines),
    `${record.path} 最终角色错误`,
  )
  const signals = deriveSignals(sourceLines)
  assert(JSON.stringify(record.asyncSignals) === JSON.stringify(signals), `${record.path} 执行信号错误`)
  const expectedRisks = deriveRisks(extractedRecord, sourceLines, shape, signals)
  const actualRisks = record.riskCandidates.map((risk) => ({
    category: risk.category,
    lines: risk.lines,
  }))
  assert(
    JSON.stringify(actualRisks) === JSON.stringify(expectedRisks),
    `${record.path} 风险语义或行号错误：actual=${JSON.stringify(actualRisks)}, expected=${JSON.stringify(expectedRisks)}`,
  )
  for (const risk of record.riskCandidates) {
    assert(/^AI-\d{4}$/.test(risk.id), `${record.path} 风险编号格式错误`)
    assert(!riskIds.has(risk.id), `${record.path} 风险编号重复`)
    assert(typeof risk.summary === 'string' && risk.summary.length > 0, `${risk.id} 缺少说明`)
    for (const line of risk.lines) assert(line >= 1 && line <= file.loc, `${risk.id} 行号越界`)
    riskIds.add(risk.id)
  }
  assert(record.sourceEvidence.length === 1, `${record.path} 源码证据数量错误`)
  assert(
    JSON.stringify(record.sourceEvidence[0].lines) ===
      JSON.stringify(deriveSourceEvidenceLines(extractedRecord, signals)),
    `${record.path} 源码证据不完整`,
  )
  assert(record.structure.declaredTypeCount === extractedRecord.declaredTypes.length, `${record.path} 类型计数错误`)
  assert(record.structure.fieldCount === extractedRecord.fields.length, `${record.path} 字段计数错误`)
  assert(record.structure.publicMethodCount === extractedRecord.publicMethods.length, `${record.path} 方法计数错误`)
  const annotationNames = [...new Set(extractedRecord.annotations.map((item) => item.name))].sort()
  assert(JSON.stringify(record.annotationProfile.names) === JSON.stringify(annotationNames), `${record.path} 注解画像错误`)
  const inboundCount = extractedRecord.codeGraph.internalInboundCandidates.reduce(
    (total, item) => total + item.occurrences,
    0,
  )
  const outboundCount = extractedRecord.codeGraph.internalOutboundCandidates.reduce(
    (total, item) => total + item.occurrences,
    0,
  )
  assert(record.usageEvidence.inboundOccurrenceCount === inboundCount, `${record.path} 入边计数错误`)
  assert(record.usageEvidence.outboundOccurrenceCount === outboundCount, `${record.path} 出边计数错误`)
}

/** 从完成态记录独立重建等待签核的候选分片。 */
function buildCandidateSignoffShards(manifest, records) {
  let offset = 0
  const shards = manifest.shards.map(({ fileName, fileCount }) => {
    const candidateRecords = records.slice(offset, offset + fileCount).map((record) => ({
      ...record,
      auditStatus: 'reviewing',
    }))
    offset += fileCount
    const content = `${candidateRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
    return { fileName, fileCount, sha256: sha256(content), decision: 'approved' }
  })
  assert(offset === records.length, '人工签核候选分片未覆盖全部记录')
  return shards
}

/** 校验人工签核与候选分片和冻结时间一致。 */
function validateSignoff(signoff, manifest, records) {
  assert(signoff.schemaVersion === 1, '人工签核 schemaVersion 错误')
  assert(signoff.snapshotId === manifest.snapshotId, '人工签核 snapshotId 错误')
  assert(signoff.analysisId === manifest.analysisId, '人工签核 analysisId 错误')
  assert(signoff.batchId === manifest.batchId, '人工签核 batchId 错误')
  assert(signoff.status === 'approved', '人工签核未批准')
  assert(signoff.reviewedAt === expectedReviewedAt, '人工签核时间错误')
  assert(signoff.summary.approvedFileCount === expectedBatchFileCount, '人工签核文件分母错误')
  assert(signoff.summary.approvedLoc === expectedBatchLoc, '人工签核 LOC 分母错误')
  assert(signoff.summary.approvedShardCount === manifest.shards.length, '人工签核分片数错误')
  const expectedShards = buildCandidateSignoffShards(manifest, records)
  assert(JSON.stringify(signoff.shards) === JSON.stringify(expectedShards), '人工签核未绑定当前分片')
  assert(manifest.manualReviewSignoff.sha256 === sha256(fs.readFileSync(signoffPath)), '签核文件哈希错误')
}

/** 校验 Phase 1C 第 7 批异步能力台账。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const manifest = readJson(manifestPath)
  const signoff = readJson(signoffPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const priorPaths = readPriorReviewedPaths()
  const expectedFiles = inventory.files.filter(
    (file) => isPhysicalBatchFile(file) && !priorPaths.has(file.path),
  )
  const records = readReviewRecords(manifest)
  assert(manifest.status === 'completed', '第 7 批 manifest 未完成')
  assert(manifest.reviewedAt === expectedReviewedAt, '第 7 批复核时间错误')
  assert(records.length === expectedBatchFileCount, '第 7 批文件分母错误')
  assert(records.reduce((total, record) => total + record.loc, 0) === expectedBatchLoc, '第 7 批 LOC 错误')
  assert(expectedFiles.length === records.length, '第 7 批物理分母与台账不一致')
  assert(JSON.stringify(records.map((record) => record.path)) === JSON.stringify(expectedFiles.map((file) => file.path)), '第 7 批路径或顺序不一致')
  const riskIds = new Set()
  records.forEach((record, index) => {
    const extractedRecord = extractedByPath.get(record.path)
    assert(extractedRecord, `${record.path} 缺少 Phase 1B 记录`)
    validateRecord(record, expectedFiles[index], extractedRecord, priorPaths, riskIds)
  })
  const expectedRiskIds = Array.from({ length: expectedRiskCandidateCount }, (_, index) =>
    `AI-${String(index + 1).padStart(4, '0')}`,
  )
  assert(JSON.stringify([...riskIds]) === JSON.stringify(expectedRiskIds), '风险编号不连续')
  assert(JSON.stringify(buildIndexRanges(records)) === JSON.stringify(expectedIndexRanges), '库存区间错误')
  assert(JSON.stringify(countBy(records, 'asyncRoot')) === JSON.stringify(expectedRootCounts), '根目录统计错误')
  assert(JSON.stringify(countBy(records, 'machineRoleCandidate')) === JSON.stringify(expectedMachineRoleCounts), '机器角色统计错误')
  assert(JSON.stringify(countBy(records, 'finalRole')) === JSON.stringify(expectedFinalRoleCounts), '最终角色统计错误')
  assert(JSON.stringify(countBy(records, 'asyncShape')) === JSON.stringify(expectedShapeCounts), '职责形态统计错误')
  assert(JSON.stringify(countRiskCategories(records)) === JSON.stringify(expectedRiskCategoryCounts), '风险类别统计错误')
  assert(JSON.stringify(manifest.summary.rootCounts) === JSON.stringify(expectedRootCounts), 'manifest 根目录统计错误')
  assert(JSON.stringify(manifest.summary.machineRoleCandidateCounts) === JSON.stringify(expectedMachineRoleCounts), 'manifest 机器角色错误')
  assert(JSON.stringify(manifest.summary.finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts), 'manifest 最终角色错误')
  assert(JSON.stringify(manifest.summary.asyncShapeCounts) === JSON.stringify(expectedShapeCounts), 'manifest 职责统计错误')
  assert(JSON.stringify(manifest.summary.signalFileCounts) === JSON.stringify(expectedSignalFileCounts), 'manifest 信号统计错误')
  assert(JSON.stringify(manifest.summary.riskCategoryCounts) === JSON.stringify(expectedRiskCategoryCounts), 'manifest 风险统计错误')
  assert(manifest.summary.declaredTypeCount === expectedDeclaredTypeCount, '声明类型总数错误')
  assert(manifest.summary.fieldCount === expectedFieldCount, '字段总数错误')
  assert(manifest.summary.publicMethodCount === expectedPublicMethodCount, '公开方法总数错误')
  assert(manifest.summary.inboundUsageOccurrenceCount === expectedInboundOccurrenceCount, '入边总数错误')
  assert(manifest.summary.outboundUsageOccurrenceCount === expectedOutboundOccurrenceCount, '出边总数错误')
  assert(manifest.summary.roleCorrectionCount === 113, '角色纠正数错误')
  assert(manifest.summary.riskCandidateCount === expectedRiskCandidateCount, '风险候选总数错误')
  assert(
    JSON.stringify(manifest.summary.currentAuditStatusCounts) ===
      JSON.stringify({ unreviewed: 317, reviewing: 0, reviewed: expectedReviewedTotal, blocked: 0 }),
    '累计审计状态错误',
  )
  validateSignoff(signoff, manifest, records)
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: manifest.batchId,
      reviewedFiles: records.length,
      reviewedLoc: expectedBatchLoc,
      riskCandidates: expectedRiskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
    }),
  )
}

main()
