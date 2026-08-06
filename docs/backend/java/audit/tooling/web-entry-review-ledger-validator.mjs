import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const startupLedgerPath = path.join(auditDirectory, 'reviews', 'phase-1c-startup-config.json')
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-web-entry')
const reviewDirectory = process.env.DZZZ_WEB_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_WEB_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const webManifestPath = path.join(reviewDirectory, 'manifest.json')

const expectedMachineRoleCandidateCounts = {
  'async-integration': 12,
  'web-entry': 138,
}
const expectedFinalRoleCounts = {
  'async-integration': 9,
  'cross-cutting': 3,
  'startup-config': 5,
  'web-entry': 133,
}
const expectedRoleCorrectionCount = 8
const expectedRiskCandidateCount = 490
const expectedBatchFileCount = 150
const expectedBatchLoc = 29713
const expectedReviewedTotal = 184
const expectedBatchReviewedAt = '2026-08-03T15:16:20.716Z'
const expectedInventoryIndexRanges = [
  [135, 260],
  [1129, 1140],
  [1144, 1146],
  [2115, 2123],
]
const allowedRoles = new Set([
  'async-integration',
  'cross-cutting',
  'startup-config',
  'web-entry',
])

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

/** 通过冻结库存索引独立判断文件是否属于第 2 批。 */
function isExpectedInventoryIndex(index) {
  return expectedInventoryIndexRanges.some(([first, last]) => index >= first && index <= last)
}

/** 读取并验证所有 Web 入口 JSONL 分片。 */
function readWebRecords(webManifest) {
  const records = []
  for (const shard of webManifest.shards) {
    const shardPath = path.join(reviewDirectory, shard.fileName)
    assert(fs.existsSync(shardPath), `缺少 Web 入口台账分片：${shard.fileName}`)
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
}

/** 验证单条 Web 入口人工复核记录。 */
function validateRecord(record, inventoryFile, extractedRecord) {
  const label = `Web 入口复核记录 ${record.path ?? '<unknown>'}`
  assert(inventoryFile, `${label} 不在冻结清单中`)
  assert(extractedRecord, `${label} 缺少 Phase 1B 自动提取记录`)
  assert(record.inventoryIndex === inventoryFile.index, `${label} inventoryIndex 不一致`)
  assert(record.sourceSha256 === inventoryFile.sha256, `${label} sourceSha256 不一致`)
  assert(record.sourceSha256 === extractedRecord.sourceSha256, `${label} 与自动提取哈希不一致`)
  assert(record.loc === inventoryFile.loc, `${label} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${label} 状态不是 reviewed`)
  assert(record.machineRoleCandidate === extractedRecord.inferredRole.primary, `${label} 机器角色不一致`)
  assert(allowedRoles.has(record.finalRole), `${label} 最终角色不受支持`)
  for (const field of ['roleDetail', 'responsibility', 'lifecycle']) {
    assert(typeof record[field] === 'string' && record[field].trim(), `${label} 缺少 ${field}`)
  }
  for (const field of ['dependencies', 'capabilityCandidates', 'riskCandidates', 'sourceEvidence']) {
    assert(Array.isArray(record[field]), `${label} 的 ${field} 必须是数组`)
  }
  assert(record.dependencies.length > 0, `${label} 缺少主要依赖`)
  assert(record.capabilityCandidates.length > 0, `${label} 缺少能力候选`)
  assert(record.sourceEvidence.length > 0, `${label} 缺少源码证据`)
  if (record.riskCandidates.some((risk) => risk.category === 'inactive-configuration')) {
    assert(record.responsibility.includes('当前未激活'), `${label} 未在职责中说明配置当前未激活`)
    assert(
      record.lifecycle.includes('当前不会进入 Spring 配置处理'),
      `${label} 未在生命周期中说明配置当前不生效`,
    )
  }
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
}

/** 验证第 2 批物理分母、分片、逐文件结论和跨批次状态叠加。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const startupLedger = readJson(startupLedgerPath)
  const webManifest = readJson(webManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const inventoryByPath = new Map(inventory.files.map((file) => [file.path, file]))
  const expectedFiles = inventory.files.filter((file) => isExpectedInventoryIndex(file.index))
  const expectedPaths = expectedFiles.map((file) => file.path)
  const startupPaths = new Set(startupLedger.records.map((record) => record.path))
  const records = readWebRecords(webManifest)
  const actualPaths = records.map((record) => record.path)
  const uniquePaths = new Set(actualPaths)

  assert(webManifest.schemaVersion === 1, 'Web 入口 manifest schemaVersion 必须为 1')
  assert(webManifest.snapshotId === inventory.snapshotId, 'Web 入口 manifest snapshotId 不一致')
  assert(webManifest.analysisId === extractionManifest.analysisId, 'Web 入口 manifest analysisId 不一致')
  assert(webManifest.batchId === 'phase-1c-web-entry', 'Web 入口 manifest batchId 不正确')
  assert(webManifest.status === 'completed', 'Web 入口批次未完成')
  assert(webManifest.reviewedAt === expectedBatchReviewedAt, 'Web 入口 reviewedAt 与冻结批次时间不一致')
  assert(webManifest.shards.length === 3, 'Web 入口分片数必须为 3')
  assert(records.length === expectedBatchFileCount, 'Web 入口记录数不是 150')
  assert(records.length === expectedFiles.length, 'Web 入口记录数与物理分母不一致')
  assert(uniquePaths.size === records.length, 'Web 入口台账存在重复路径')
  assert(JSON.stringify(actualPaths) === JSON.stringify(expectedPaths), 'Web 入口路径或顺序与冻结清单不一致')
  assert([...uniquePaths].every((filePath) => !startupPaths.has(filePath)), 'Web 入口台账与第 1 批存在重叠')

  for (const record of records) {
    validateRecord(record, inventoryByPath.get(record.path), extractedByPath.get(record.path))
  }

  const batchLoc = records.reduce((total, record) => total + record.loc, 0)
  const machineRoleCandidateCounts = countBy(records, 'machineRoleCandidate')
  const finalRoleCounts = countBy(records, 'finalRole')
  const roleCorrectionCount = records.filter(
    (record) => record.machineRoleCandidate !== record.finalRole,
  ).length
  const risks = records.flatMap((record) => record.riskCandidates)
  const riskIds = risks.map((risk) => risk.id)
  const expectedRiskIds = Array.from(
    { length: expectedRiskCandidateCount },
    (_, index) => `WE-${String(index + 1).padStart(3, '0')}`,
  )
  const riskCategoryCounts = countRiskCategories(records)
  const currentAuditStatusCounts = {
    unreviewed: inventory.summary.total.fileCount - expectedReviewedTotal,
    reviewing: 0,
    reviewed: expectedReviewedTotal,
    blocked: 0,
  }

  assert(batchLoc === expectedBatchLoc, 'Web 入口批次 LOC 不是 29713')
  assert(webManifest.summary.batchFileCount === records.length, 'Web 入口文件汇总不一致')
  assert(webManifest.summary.batchLoc === batchLoc, 'Web 入口 LOC 汇总不一致')
  assert(
    JSON.stringify(machineRoleCandidateCounts) === JSON.stringify(expectedMachineRoleCandidateCounts),
    'Web 入口机器角色候选与冻结结论不一致',
  )
  assert(
    JSON.stringify(webManifest.summary.machineRoleCandidateCounts) ===
      JSON.stringify(machineRoleCandidateCounts),
    'Web 入口 manifest 机器角色汇总不一致',
  )
  assert(
    JSON.stringify(finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts),
    'Web 入口最终角色与冻结结论不一致',
  )
  assert(
    JSON.stringify(webManifest.summary.finalRoleCounts) === JSON.stringify(finalRoleCounts),
    'Web 入口 manifest 最终角色汇总不一致',
  )
  assert(roleCorrectionCount === expectedRoleCorrectionCount, 'Web 入口角色纠正数不是 8')
  assert(webManifest.summary.roleCorrectionCount === roleCorrectionCount, 'Web 入口 manifest 角色纠正数不一致')
  assert(JSON.stringify(riskIds) === JSON.stringify(expectedRiskIds), 'Web 入口风险 ID 不连续或不唯一')
  assert(webManifest.summary.riskCandidateCount === risks.length, 'Web 入口风险候选汇总不一致')
  assert(
    JSON.stringify(webManifest.summary.riskCategoryCounts) === JSON.stringify(riskCategoryCounts),
    'Web 入口风险类别汇总不一致',
  )
  assert(
    JSON.stringify(webManifest.summary.currentAuditStatusCounts) ===
      JSON.stringify(currentAuditStatusCounts),
    'Web 入口当前状态叠加不一致',
  )
  assert(
    Object.values(currentAuditStatusCounts).reduce((total, count) => total + count, 0) ===
      inventory.summary.total.fileCount,
    'Web 入口当前状态没有覆盖冻结分母',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: webManifest.batchId,
      snapshotId: webManifest.snapshotId,
      reviewedFiles: records.length,
      batchLoc,
      riskCandidateCount: risks.length,
      roleCorrectionCount,
      currentAuditStatusCounts,
      machineRoleCandidateCounts,
      finalRoleCounts,
    }),
  )
}

main()
