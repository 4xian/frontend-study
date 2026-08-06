import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const manifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const ledgerPath = path.join(auditDirectory, 'reviews', 'phase-1c-startup-config.json')
const expectedMachineRoleCandidateCounts = {
  'async-integration': 14,
  'startup-config': 20,
}
const expectedFinalRoleCounts = {
  'async-integration': 12,
  'cross-cutting': 2,
  'data-access': 1,
  'data-model': 2,
  infrastructure: 1,
  'startup-config': 15,
  'web-entry': 1,
}
const expectedRoleCorrectionCount = 9
const expectedRiskCandidateCount = 86
const allowedRoles = new Set([
  'async-integration',
  'cross-cutting',
  'data-access',
  'data-model',
  'infrastructure',
  'startup-config',
  'web-entry',
])

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 读取 Phase 1B 的全部 JSONL 记录，并按源码路径建立索引。 */
function readExtractedRecords(manifest) {
  const records = new Map()
  for (const shard of manifest.shards) {
    const shardPath = path.join(auditDirectory, 'extracted', shard.fileName)
    const lines = fs.readFileSync(shardPath, 'utf8').trim().split('\n')
    for (const line of lines) {
      const record = JSON.parse(line)
      records.set(record.path, record)
    }
  }
  return records
}

/** 统计字符串字段出现次数。 */
function countBy(records, field) {
  return Object.fromEntries(
    [...records.reduce((counts, record) => {
      const value = record[field]
      counts.set(value, (counts.get(value) ?? 0) + 1)
      return counts
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 断言条件成立，否则给出可定位的校验错误。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 验证行号数组落在对应冻结文件范围内。 */
function validateLines(lines, loc, label) {
  assert(Array.isArray(lines) && lines.length > 0, `${label} 缺少源码行号`)
  assert(lines.every((line) => Number.isInteger(line) && line >= 1 && line <= loc), `${label} 行号越界`)
}

/** 验证单条人工复核记录与冻结清单和自动提取记录一致。 */
function validateRecord(record, inventoryFile, extractedRecord) {
  const label = `复核记录 ${record.path ?? '<unknown>'}`
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
  for (const risk of record.riskCandidates) {
    assert(typeof risk.id === 'string' && risk.id, `${label} 存在无 ID 风险候选`)
    assert(typeof risk.summary === 'string' && risk.summary, `${label} 存在无摘要风险候选`)
    validateLines(risk.lines, record.loc, `${label} 风险 ${risk.id}`)
  }
  for (const evidence of record.sourceEvidence) {
    assert(typeof evidence.summary === 'string' && evidence.summary, `${label} 存在无摘要源码证据`)
    validateLines(evidence.lines, record.loc, `${label} 源码证据`)
  }
}

/** 验证 Phase 1C 第 1 批的物理分母、状态叠加和逐文件结论。 */
function main() {
  const inventory = readJson(inventoryPath)
  const manifest = readJson(manifestPath)
  const ledger = readJson(ledgerPath)
  const extractedByPath = readExtractedRecords(manifest)
  const inventoryByPath = new Map(inventory.files.map((file) => [file.path, file]))
  const expectedFiles = inventory.files.filter(
    (file) =>
      file.path === 'dzzz-app/src/main/java/com/tdh/DzzzAreaApplication.java' ||
      file.path.startsWith('dzzz-app/src/main/java/com/tdh/bdzz/config/'),
  )
  const expectedPaths = new Set(expectedFiles.map((file) => file.path))
  const actualPaths = new Set(ledger.records.map((record) => record.path))
  const expectedLoc = expectedFiles.reduce((total, file) => total + file.loc, 0)

  assert(ledger.schemaVersion === 1, '复核台账 schemaVersion 必须为 1')
  assert(ledger.snapshotId === inventory.snapshotId, '复核台账 snapshotId 与冻结清单不一致')
  assert(ledger.analysisId === manifest.analysisId, '复核台账 analysisId 与自动提取不一致')
  assert(ledger.batchId === 'phase-1c-startup-config', '复核台账 batchId 不正确')
  assert(ledger.status === 'completed', '复核台账批次未完成')
  assert(ledger.records.length === expectedFiles.length, '复核记录数与物理分母不一致')
  assert(actualPaths.size === ledger.records.length, '复核台账存在重复路径')
  assert([...expectedPaths].every((filePath) => actualPaths.has(filePath)), '复核台账缺少目标文件')
  assert([...actualPaths].every((filePath) => expectedPaths.has(filePath)), '复核台账包含批次外文件')
  assert(ledger.summary.batchFileCount === expectedFiles.length, '批次文件汇总不一致')
  assert(ledger.summary.batchLoc === expectedLoc, '批次 LOC 汇总不一致')

  for (const record of ledger.records) {
    validateRecord(record, inventoryByPath.get(record.path), extractedByPath.get(record.path))
  }

  const machineRoleCandidateCounts = countBy(ledger.records, 'machineRoleCandidate')
  const finalRoleCounts = countBy(ledger.records, 'finalRole')
  const roleCorrectionCount = ledger.records.filter(
    (record) => record.machineRoleCandidate !== record.finalRole,
  ).length
  const riskCandidateIds = ledger.records.flatMap((record) =>
    record.riskCandidates.map((risk) => risk.id),
  )
  const expectedRiskCandidateIds = Array.from(
    { length: expectedRiskCandidateCount },
    (_, index) => `SC-${String(index + 1).padStart(3, '0')}`,
  )
  assert(
    JSON.stringify(machineRoleCandidateCounts) ===
      JSON.stringify(expectedMachineRoleCandidateCounts),
    '机器角色候选汇总与批次结论不一致',
  )
  assert(
    JSON.stringify(ledger.summary.machineRoleCandidateCounts) ===
      JSON.stringify(machineRoleCandidateCounts),
    '台账中的机器角色候选汇总不一致',
  )
  assert(
    JSON.stringify(finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts),
    '最终角色汇总与批次结论不一致',
  )
  assert(JSON.stringify(ledger.summary.finalRoleCounts) === JSON.stringify(finalRoleCounts), '最终角色汇总不一致')
  assert(roleCorrectionCount === expectedRoleCorrectionCount, '角色纠正数与批次结论不一致')
  assert(ledger.summary.roleCorrectionCount === roleCorrectionCount, '台账中的角色纠正数不一致')
  assert(
    JSON.stringify(riskCandidateIds) === JSON.stringify(expectedRiskCandidateIds),
    '风险候选 ID 必须从 SC-001 至 SC-086 连续且唯一',
  )
  assert(ledger.summary.riskCandidateCount === riskCandidateIds.length, '台账中的风险候选数不一致')
  assert(ledger.summary.currentAuditStatusCounts.reviewed === expectedFiles.length, '当前 reviewed 汇总不一致')
  assert(
    ledger.summary.currentAuditStatusCounts.unreviewed === inventory.summary.total.fileCount - expectedFiles.length,
    '当前 unreviewed 汇总不一致',
  )
  assert(ledger.summary.currentAuditStatusCounts.reviewing === 0, '当前 reviewing 汇总不一致')
  assert(ledger.summary.currentAuditStatusCounts.blocked === 0, '当前 blocked 汇总不一致')
  assert(
    Object.values(ledger.summary.currentAuditStatusCounts).reduce((total, count) => total + count, 0) ===
      inventory.summary.total.fileCount,
    '当前状态汇总没有覆盖冻结分母',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: ledger.batchId,
      snapshotId: ledger.snapshotId,
      reviewedFiles: ledger.records.length,
      batchLoc: expectedLoc,
      riskCandidateCount: riskCandidateIds.length,
      roleCorrectionCount,
      currentAuditStatusCounts: ledger.summary.currentAuditStatusCounts,
      machineRoleCandidateCounts,
      finalRoleCounts,
    }),
  )
}

main()
