import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const startupLedgerPath = path.join(auditDirectory, 'reviews', 'phase-1c-startup-config.json')
const webReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-web-entry')
const webManifestPath = path.join(webReviewDirectory, 'manifest.json')
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-business-layer')
const reviewDirectory = process.env.DZZZ_BUSINESS_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_BUSINESS_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const businessManifestPath = path.join(reviewDirectory, 'manifest.json')

const expectedMachineRoleCandidateCounts = { business: 338 }
const expectedFinalRoleCounts = { business: 338 }
const expectedServiceShapeCounts = {
  contract: 148,
  'managed-service': 182,
  'plain-support': 8,
}
const expectedRiskCategoryCounts = {
  'broad-catch': 85,
  'closeable-resource-boundary': 11,
  'field-injection': 155,
  'general-exception-contract': 137,
  'hard-coded-secret': 1,
  'http-client-lifecycle': 1,
  'interned-string-lock': 5,
  'manual-thread': 15,
  'null-return-contract': 29,
  'oversized-service': 36,
  'service-locator': 8,
  'static-request-context': 81,
  'synchronization-boundary': 9,
  'thread-local-lifecycle': 1,
  'transaction-side-effect-mix': 63,
  'transport-coupling': 74,
  'unmanaged-executor': 4,
}
const expectedBatchFileCount = 338
const expectedBatchLoc = 154161
const expectedRiskCandidateCount = 715
const expectedReviewedTotal = 522
const expectedBatchReviewedAt = '2026-08-03T22:52:01.000Z'
const expectedFirstInventoryIndex = 1754
const expectedLastInventoryIndex = 2091
const expectedShardFileCounts = [50, 50, 50, 50, 50, 50, 38]
const hardCodedSecretPath = 'dzzz-app/src/main/java/com/tdh/bdzz/service/HjptApiService.java'
const allowedServiceShapes = new Set(['contract', 'managed-service', 'plain-support'])

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 断言条件成立，否则抛出可定位的校验错误。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 读取 Phase 1B 全部分片并按路径建立索引。 */
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

/** 读取并验证指定 manifest 的全部 JSONL 分片。 */
function readShardedRecords(manifest, directory, label) {
  const records = []
  for (const shard of manifest.shards) {
    const shardPath = path.join(directory, shard.fileName)
    assert(fs.existsSync(shardPath), `缺少${label}台账分片：${shard.fileName}`)
    const content = fs.readFileSync(shardPath, 'utf8')
    assert(content.endsWith('\n'), `${shard.fileName} 缺少结尾换行`)
    assert(sha256(content) === shard.sha256, `${shard.fileName} SHA-256 不一致`)
    const lines = content.trim().split('\n')
    assert(lines.length === shard.fileCount, `${shard.fileName} 记录数不一致`)
    const shardRecords = lines.map((line) => JSON.parse(line))
    assert(
      shardRecords[0].inventoryIndex === shard.firstInventoryIndex,
      `${shard.fileName} 首索引不一致`,
    )
    assert(
      shardRecords.at(-1).inventoryIndex === shard.lastInventoryIndex,
      `${shard.fileName} 末索引不一致`,
    )
    assert(shardRecords[0].path === shard.firstPath, `${shard.fileName} 首路径不一致`)
    assert(shardRecords.at(-1).path === shard.lastPath, `${shard.fileName} 末路径不一致`)
    records.push(...shardRecords)
  }
  return records
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  return Object.fromEntries(
    [...records.reduce((counts, record) => {
      const value = record[field]
      counts.set(value, (counts.get(value) ?? 0) + 1)
      return counts
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 统计风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 验证行号数组落在对应冻结文件范围内。 */
function validateLines(lines, loc, label) {
  assert(Array.isArray(lines) && lines.length > 0, `${label} 缺少源码行号`)
  assert(lines.every((line) => Number.isInteger(line) && line >= 1 && line <= loc), `${label} 行号越界`)
  assert(new Set(lines).size === lines.length, `${label} 存在重复行号`)
  assert(lines.every((line, index) => index === 0 || lines[index - 1] < line), `${label} 行号未升序`)
}

/** 根据 Phase 1B 类型与 stereotype 独立计算服务形态。 */
function inferServiceShape(extractedRecord) {
  if (extractedRecord.declaredTypes[0]?.kind === 'interface') return 'contract'
  const typeAnnotations = new Set(
    extractedRecord.annotations
      .filter((annotation) => annotation.site === 'type')
      .map((annotation) => annotation.name),
  )
  if (typeAnnotations.has('Service') || typeAnnotations.has('Component')) return 'managed-service'
  return 'plain-support'
}

/** 判断记录是否含某类风险候选。 */
function hasRisk(record, category) {
  return record.riskCandidates.some((risk) => risk.category === category)
}

/** 判断公开方法是否声明顶层异常。 */
function declaresGeneralException(method) {
  return method.throws.some((typeName) => /(?:^|\.)(?:Exception|Throwable)$/.test(typeName))
}

/** 判断公开方法是否直接接收 Servlet 或上传类型。 */
function hasTransportCoupling(extractedRecord) {
  return extractedRecord.publicMethods.some((method) =>
    method.parameterTypes.some((typeName) =>
      /HttpServletRequest|HttpServletResponse|MultipartFile/.test(typeName),
    ),
  )
}

/** 验证一条业务层人工复核记录。 */
function validateRecord(record, inventoryFile, extractedRecord) {
  const label = `业务层复核记录 ${record.path ?? '<unknown>'}`
  assert(inventoryFile, `${label} 不在冻结清单中`)
  assert(extractedRecord, `${label} 缺少 Phase 1B 自动提取记录`)
  assert(record.inventoryIndex === inventoryFile.index, `${label} inventoryIndex 不一致`)
  assert(record.sourceSha256 === inventoryFile.sha256, `${label} sourceSha256 不一致`)
  assert(record.sourceSha256 === extractedRecord.sourceSha256, `${label} 与自动提取哈希不一致`)
  assert(record.loc === inventoryFile.loc, `${label} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${label} 状态不是 reviewed`)
  assert(record.machineRoleCandidate === extractedRecord.inferredRole.primary, `${label} 机器角色不一致`)
  assert(record.finalRole === 'business', `${label} 最终角色不是 business`)
  assert(allowedServiceShapes.has(record.serviceShape), `${label} serviceShape 不受支持`)
  assert(record.serviceShape === inferServiceShape(extractedRecord), `${label} serviceShape 与源码不一致`)
  for (const field of ['roleDetail', 'responsibility', 'lifecycle']) {
    assert(typeof record[field] === 'string' && record[field].trim(), `${label} 缺少 ${field}`)
  }
  for (const field of ['dependencies', 'capabilityCandidates', 'riskCandidates', 'sourceEvidence']) {
    assert(Array.isArray(record[field]), `${label} 的 ${field} 必须是数组`)
  }
  assert(record.dependencies.length > 0, `${label} 缺少主要依赖`)
  assert(record.capabilityCandidates.length > 0, `${label} 缺少能力候选`)
  assert(record.sourceEvidence.length > 0, `${label} 缺少源码证据`)

  if (record.serviceShape === 'contract') {
    assert(record.lifecycle.includes('本身不是 Spring Bean'), `${label} 没有说明接口不是 Spring Bean`)
  }
  if (record.serviceShape === 'managed-service') {
    assert(record.lifecycle.includes('Spring 通过'), `${label} 没有说明 Spring 托管生命周期`)
  }
  if (record.serviceShape === 'plain-support') {
    assert(record.lifecycle.includes('不会被组件扫描自动创建'), `${label} 没有说明普通类创建责任`)
  }

  const hasTransactional = extractedRecord.annotations.some(
    (annotation) => annotation.name === 'Transactional',
  )
  const hasAsync = extractedRecord.annotations.some((annotation) => annotation.name === 'Async')
  if (hasTransactional || hasAsync) {
    assert(record.lifecycle.includes('代理调用'), `${label} 没有说明代理生效边界`)
    assert(record.lifecycle.includes('自调用'), `${label} 没有说明类内自调用边界`)
  }
  if (hasTransactional) {
    assert(record.capabilityCandidates.includes('声明式事务'), `${label} 遗漏声明式事务能力`)
    assert(record.capabilityCandidates.includes('事务代理边界'), `${label} 遗漏事务代理边界能力`)
  }
  if (hasAsync) {
    assert(record.capabilityCandidates.includes('异步方法'), `${label} 遗漏异步方法能力`)
    assert(record.capabilityCandidates.includes('异步代理边界'), `${label} 遗漏异步代理边界能力`)
  }

  const hasFieldInjection = extractedRecord.annotations.some(
    (annotation) =>
      annotation.site === 'field' && ['Autowired', 'Resource'].includes(annotation.name),
  )
  assert(hasRisk(record, 'field-injection') === hasFieldInjection, `${label} 字段注入风险叠加不一致`)
  const hasGeneralException = extractedRecord.publicMethods.some(declaresGeneralException)
  assert(
    hasRisk(record, 'general-exception-contract') === hasGeneralException,
    `${label} 宽泛异常合同风险叠加不一致`,
  )
  assert(
    hasRisk(record, 'transport-coupling') === hasTransportCoupling(extractedRecord),
    `${label} 传输层耦合风险叠加不一致`,
  )
  const isOversizedService =
    extractedRecord.declaredTypes[0]?.kind !== 'interface' && record.loc > 1000
  assert(
    hasRisk(record, 'oversized-service') === isOversizedService,
    `${label} 超大业务类风险叠加不一致`,
  )

  const riskCategories = record.riskCandidates.map((risk) => risk.category)
  assert(new Set(riskCategories).size === riskCategories.length, `${label} 存在重复风险类别`)
  for (const risk of record.riskCandidates) {
    assert(typeof risk.id === 'string' && risk.id, `${label} 存在无 ID 风险候选`)
    assert(typeof risk.category === 'string' && risk.category, `${label} 存在无类别风险候选`)
    assert(typeof risk.summary === 'string' && risk.summary, `${label} 存在无摘要风险候选`)
    validateLines(risk.lines, record.loc, `${label} 风险 ${risk.id}`)
  }
  for (const evidence of record.sourceEvidence) {
    assert(typeof evidence.summary === 'string' && evidence.summary, `${label} 存在无摘要源码证据`)
    validateLines(evidence.lines, record.loc, `${label} 源码证据`)
  }
  const typeLine = extractedRecord.declaredTypes[0]?.line
  assert(
    record.sourceEvidence.some((evidence) => evidence.lines.includes(typeLine)),
    `${label} 源码证据没有覆盖类型声明`,
  )
}

/** 验证第 3 批物理分母、分片、逐文件结论和跨批次状态叠加。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const startupLedger = readJson(startupLedgerPath)
  const webManifest = readJson(webManifestPath)
  const businessManifest = readJson(businessManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const inventoryByPath = new Map(inventory.files.map((file) => [file.path, file]))
  const expectedFiles = inventory.files.filter(
    (file) =>
      file.index >= expectedFirstInventoryIndex && file.index <= expectedLastInventoryIndex,
  )
  const expectedPaths = expectedFiles.map((file) => file.path)
  const startupPaths = new Set(startupLedger.records.map((record) => record.path))
  const webPaths = new Set(
    readShardedRecords(webManifest, webReviewDirectory, 'Web 入口').map((record) => record.path),
  )
  const records = readShardedRecords(businessManifest, reviewDirectory, '业务层')
  const actualPaths = records.map((record) => record.path)
  const uniquePaths = new Set(actualPaths)

  assert(businessManifest.schemaVersion === 1, '业务层 manifest schemaVersion 必须为 1')
  assert(businessManifest.snapshotId === inventory.snapshotId, '业务层 manifest snapshotId 不一致')
  assert(businessManifest.analysisId === extractionManifest.analysisId, '业务层 manifest analysisId 不一致')
  assert(businessManifest.batchId === 'phase-1c-business-layer', '业务层 manifest batchId 不正确')
  assert(businessManifest.status === 'completed', '业务层批次未完成')
  assert(businessManifest.reviewedAt === expectedBatchReviewedAt, '业务层 reviewedAt 与冻结批次时间不一致')
  assert(businessManifest.shards.length === expectedShardFileCounts.length, '业务层分片数必须为 7')
  assert(
    JSON.stringify(businessManifest.shards.map((shard) => shard.fileCount)) ===
      JSON.stringify(expectedShardFileCounts),
    '业务层分片记录数不符合 50/50/50/50/50/50/38',
  )
  assert(records.length === expectedBatchFileCount, '业务层记录数不是 338')
  assert(records.length === expectedFiles.length, '业务层记录数与物理分母不一致')
  assert(uniquePaths.size === records.length, '业务层台账存在重复路径')
  assert(JSON.stringify(actualPaths) === JSON.stringify(expectedPaths), '业务层路径或顺序与冻结清单不一致')
  assert([...uniquePaths].every((filePath) => !startupPaths.has(filePath)), '业务层台账与第 1 批存在重叠')
  assert([...uniquePaths].every((filePath) => !webPaths.has(filePath)), '业务层台账与第 2 批存在重叠')

  for (const record of records) {
    validateRecord(record, inventoryByPath.get(record.path), extractedByPath.get(record.path))
  }

  const batchLoc = records.reduce((total, record) => total + record.loc, 0)
  const machineRoleCandidateCounts = countBy(records, 'machineRoleCandidate')
  const finalRoleCounts = countBy(records, 'finalRole')
  const serviceShapeCounts = countBy(records, 'serviceShape')
  const roleCorrectionCount = records.filter(
    (record) => record.machineRoleCandidate !== record.finalRole,
  ).length
  const risks = records.flatMap((record) => record.riskCandidates)
  const riskIds = risks.map((risk) => risk.id)
  const expectedRiskIds = Array.from(
    { length: expectedRiskCandidateCount },
    (_, index) => `BL-${String(index + 1).padStart(3, '0')}`,
  )
  const riskCategoryCounts = countRiskCategories(records)
  const currentAuditStatusCounts = {
    unreviewed: inventory.summary.total.fileCount - expectedReviewedTotal,
    reviewing: 0,
    reviewed: expectedReviewedTotal,
    blocked: 0,
  }
  const hardCodedSecretRecords = records.filter((record) => hasRisk(record, 'hard-coded-secret'))

  assert(batchLoc === expectedBatchLoc, '业务层批次 LOC 不是 154161')
  assert(businessManifest.summary.batchFileCount === records.length, '业务层文件汇总不一致')
  assert(businessManifest.summary.batchLoc === batchLoc, '业务层 LOC 汇总不一致')
  assert(
    JSON.stringify(machineRoleCandidateCounts) === JSON.stringify(expectedMachineRoleCandidateCounts),
    '业务层机器角色候选与冻结结论不一致',
  )
  assert(
    JSON.stringify(businessManifest.summary.machineRoleCandidateCounts) ===
      JSON.stringify(machineRoleCandidateCounts),
    '业务层 manifest 机器角色汇总不一致',
  )
  assert(
    JSON.stringify(finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts),
    '业务层最终角色与冻结结论不一致',
  )
  assert(
    JSON.stringify(businessManifest.summary.finalRoleCounts) === JSON.stringify(finalRoleCounts),
    '业务层 manifest 最终角色汇总不一致',
  )
  assert(
    JSON.stringify(serviceShapeCounts) === JSON.stringify(expectedServiceShapeCounts),
    '业务层服务形态与冻结结论不一致',
  )
  assert(
    JSON.stringify(businessManifest.summary.serviceShapeCounts) ===
      JSON.stringify(serviceShapeCounts),
    '业务层 manifest 服务形态汇总不一致',
  )
  assert(roleCorrectionCount === 0, '业务层角色纠正数不是 0')
  assert(businessManifest.summary.roleCorrectionCount === 0, '业务层 manifest 角色纠正数不一致')
  assert(JSON.stringify(riskIds) === JSON.stringify(expectedRiskIds), '业务层风险 ID 不连续或不唯一')
  assert(risks.length === expectedRiskCandidateCount, '业务层风险候选数不是 715')
  assert(businessManifest.summary.riskCandidateCount === risks.length, '业务层风险候选汇总不一致')
  assert(
    JSON.stringify(riskCategoryCounts) === JSON.stringify(expectedRiskCategoryCounts),
    '业务层风险类别与冻结结论不一致',
  )
  assert(
    JSON.stringify(businessManifest.summary.riskCategoryCounts) === JSON.stringify(riskCategoryCounts),
    '业务层 manifest 风险类别汇总不一致',
  )
  assert(
    hardCodedSecretRecords.length === 1 && hardCodedSecretRecords[0].path === hardCodedSecretPath,
    '硬编码秘密风险没有精确落在 HjptApiService',
  )
  assert(
    JSON.stringify(businessManifest.summary.currentAuditStatusCounts) ===
      JSON.stringify(currentAuditStatusCounts),
    '业务层当前状态叠加不一致',
  )
  assert(
    Object.values(currentAuditStatusCounts).reduce((total, count) => total + count, 0) ===
      inventory.summary.total.fileCount,
    '业务层当前状态没有覆盖冻结分母',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: businessManifest.batchId,
      snapshotId: businessManifest.snapshotId,
      reviewedFiles: records.length,
      batchLoc,
      riskCandidateCount: risks.length,
      roleCorrectionCount,
      currentAuditStatusCounts,
      machineRoleCandidateCounts,
      finalRoleCounts,
      serviceShapeCounts,
    }),
  )
}

main()
