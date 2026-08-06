import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import { targetRelationshipKinds } from './audit-rules.mjs'

const javaIdentifier = String.raw`[\p{ID_Start}_$][\p{ID_Continue}$]*`
const qualifiedSymbolPattern = new RegExp(`^(?:${javaIdentifier}\\.)*${javaIdentifier}$`, 'u')
const functionReferencePattern = new RegExp(
  `^(?:${javaIdentifier}\\.)*${javaIdentifier}::(?:${javaIdentifier}|new)$`,
  'u',
)
const typeReferencePattern = /^(?=.{1,500}$)[\p{L}\p{N}_$?.<>,[\]& ]+$/u

/** 去除 CodeGraph 符号中由跨行源码格式引入的无意义空白。 */
function normalizeGraphSymbol(value) {
  return value.replace(/\s+/g, '')
}

/** 只允许不含表达式、参数和值的 unresolved 符号进入审计产物。 */
function isSafeUnresolvedReference(kind, value) {
  if (kind === 'function_ref') return functionReferencePattern.test(value)
  if (kind === 'extends' || kind === 'implements') return typeReferencePattern.test(value)
  return qualifiedSymbolPattern.test(value)
}

/** 将重复 CodeGraph 关系聚合为带行号和出现次数的候选。 */
function addGroupedRelationship(groupsByPath, filePath, key, value, line) {
  if (!groupsByPath.has(filePath)) groupsByPath.set(filePath, new Map())
  const groups = groupsByPath.get(filePath)
  if (!groups.has(key)) groups.set(key, { ...value, _lines: new Set(), occurrences: 0 })
  const group = groups.get(key)
  group.occurrences += 1
  if (Number.isInteger(line)) group._lines.add(line)
}

/** 将关系分组转换为可序列化、稳定排序的数组。 */
function finalizeGroupedRelationships(groups) {
  if (!groups) return []
  return [...groups.values()]
    .map((group) => {
      const { _lines, ...value } = group
      return { ...value, lines: [..._lines].sort((left, right) => left - right) }
    })
    .sort((left, right) =>
      [left.kind, left.sourcePath ?? '', left.sourceSymbol, left.targetPath ?? '', left.targetSymbol]
        .join('\u0000')
        .localeCompare(
          [
            right.kind,
            right.sourcePath ?? '',
            right.sourceSymbol,
            right.targetPath ?? '',
            right.targetSymbol,
          ].join('\u0000'),
        ),
    )
}

/** 递增文件级冻结清单外关系排除计数。 */
function incrementNonInventoryCount(countsByPath, filePath, direction, kind) {
  if (!countsByPath.has(filePath)) countsByPath.set(filePath, { inbound: {}, outbound: {} })
  const directionCounts = countsByPath.get(filePath)[direction]
  directionCounts[kind] = (directionCounts[kind] ?? 0) + 1
}

/** 验证 CodeGraph 文件身份，并提取限定在 dzzz-app 的关系候选。 */
export function loadCodeGraph(repositoryRoot, inventory) {
  const databasePath = path.join(repositoryRoot, '.codegraph', 'codegraph.db')
  if (!fs.existsSync(databasePath)) throw new Error(`缺少 CodeGraph 数据库：${databasePath}`)
  const database = new DatabaseSync(databasePath, { readOnly: true })
  const inventoryByPath = new Map(inventory.files.map((file) => [file.path, file]))
  const graphFiles = database
    .prepare(
      `select path, content_hash, size, language, node_count, errors
       from files where path like ? and language = 'java'`,
    )
    .all(`${inventory.target.moduleRoot}/%`)
  const graphFilesByPath = new Map(graphFiles.map((file) => [file.path, file]))
  const identityErrors = []
  for (const file of inventory.files) {
    const graphFile = graphFilesByPath.get(file.path)
    if (!graphFile) identityErrors.push(`CodeGraph 缺少文件：${file.path}`)
    else if (graphFile.content_hash !== file.sha256 || graphFile.size !== file.sizeBytes) {
      identityErrors.push(`CodeGraph 文件身份不匹配：${file.path}`)
    } else if (graphFile.errors && graphFile.errors !== '[]') {
      identityErrors.push(`CodeGraph 文件存在解析错误：${file.path}`)
    }
  }
  const foreignGraphFiles = graphFiles.filter((file) => !inventoryByPath.has(file.path))
  if (foreignGraphFiles.length > 0) {
    identityErrors.push(`CodeGraph 的 dzzz-app Java 文件比冻结清单多 ${foreignGraphFiles.length} 个`)
  }
  if (identityErrors.length > 0) throw new Error(identityErrors.slice(0, 20).join('\n'))

  const outboundGroups = new Map()
  const inboundGroups = new Map()
  const unresolvedGroups = new Map()
  const nonInventoryCounts = new Map()
  const relationshipKinds = [...targetRelationshipKinds].sort()
  const relationshipKindPlaceholders = relationshipKinds.map(() => '?').join(', ')
  const relationshipRows = database
    .prepare(
      `select e.kind, e.line,
              source.file_path source_path, source.qualified_name source_symbol,
              target.file_path target_path, target.qualified_name target_symbol
       from edges e
       join nodes source on source.id = e.source
       join nodes target on target.id = e.target
       where (source.file_path like ? or target.file_path like ?)
         and e.kind in (${relationshipKindPlaceholders})`,
    )
    .iterate(
      `${inventory.target.moduleRoot}/%`,
      `${inventory.target.moduleRoot}/%`,
      ...relationshipKinds,
    )
  let internalCandidateCount = 0
  let nonInventoryExcludedCount = 0
  for (const row of relationshipRows) {
    const sourceIncluded = inventoryByPath.has(row.source_path)
    const targetIncluded = inventoryByPath.has(row.target_path)
    const sourceSymbol = normalizeGraphSymbol(row.source_symbol)
    const targetSymbol = normalizeGraphSymbol(row.target_symbol)
    if (sourceIncluded && targetIncluded) {
      internalCandidateCount += 1
      addGroupedRelationship(
        outboundGroups,
        row.source_path,
        [row.kind, sourceSymbol, row.target_path, targetSymbol].join('\u0000'),
        {
          kind: row.kind,
          sourceSymbol,
          targetPath: row.target_path,
          targetSymbol,
        },
        row.line,
      )
      addGroupedRelationship(
        inboundGroups,
        row.target_path,
        [row.kind, row.source_path, sourceSymbol, targetSymbol].join('\u0000'),
        {
          kind: row.kind,
          sourcePath: row.source_path,
          sourceSymbol,
          targetSymbol,
        },
        row.line,
      )
      continue
    }
    if (sourceIncluded) {
      nonInventoryExcludedCount += 1
      incrementNonInventoryCount(nonInventoryCounts, row.source_path, 'outbound', row.kind)
    }
    if (targetIncluded) {
      nonInventoryExcludedCount += 1
      incrementNonInventoryCount(nonInventoryCounts, row.target_path, 'inbound', row.kind)
    }
  }

  let unresolvedOccurrenceCount = 0
  let unsafeUnresolvedExcludedCount = 0
  const unresolvedRows = database
    .prepare(
      `select unresolved.file_path, unresolved.reference_kind, unresolved.reference_name,
              unresolved.line, unresolved.status, source.qualified_name source_symbol
       from unresolved_refs unresolved
       join nodes source on source.id = unresolved.from_node_id
       where unresolved.file_path like ?`,
    )
    .iterate(`${inventory.target.moduleRoot}/%`)
  for (const row of unresolvedRows) {
    if (!inventoryByPath.has(row.file_path) || !targetRelationshipKinds.has(row.reference_kind)) continue
    if (!isSafeUnresolvedReference(row.reference_kind, row.reference_name)) {
      unsafeUnresolvedExcludedCount += 1
      continue
    }
    unresolvedOccurrenceCount += 1
    const sourceSymbol = normalizeGraphSymbol(row.source_symbol)
    addGroupedRelationship(
      unresolvedGroups,
      row.file_path,
      [row.reference_kind, sourceSymbol, row.reference_name, row.status].join('\u0000'),
      {
        kind: row.reference_kind,
        sourceSymbol,
        reference: row.reference_name,
        status: row.status,
        targetSymbol: row.reference_name,
      },
      row.line,
    )
  }

  const metadataRows = database.prepare('select key, value from project_metadata').all()
  const metadata = Object.fromEntries(metadataRows.map((row) => [row.key, row.value]))
  database.close()
  return {
    byPath: new Map(
      inventory.files.map((file) => [
        file.path,
        {
          internalOutboundCandidates: finalizeGroupedRelationships(outboundGroups.get(file.path)),
          internalInboundCandidates: finalizeGroupedRelationships(inboundGroups.get(file.path)),
          unresolvedOutboundCandidates: finalizeGroupedRelationships(
            unresolvedGroups.get(file.path),
          ).map(({ targetSymbol: _targetSymbol, ...relationship }) => relationship),
          excludedNonInventoryCandidates: nonInventoryCounts.get(file.path) ?? {
            inbound: {},
            outbound: {},
          },
        },
      ]),
    ),
    summary: {
      database: '.codegraph/codegraph.db',
      indexedWithVersion: metadata.indexed_with_version ?? null,
      extractionVersion: metadata.indexed_with_extraction_version ?? null,
      verifiedFileCount: inventory.files.length,
      internalCandidateOccurrences: internalCandidateCount,
      unresolvedCandidateOccurrences: unresolvedOccurrenceCount,
      unsafeUnresolvedCandidateOccurrencesExcluded: unsafeUnresolvedExcludedCount,
      nonInventoryCandidateOccurrencesExcluded: nonInventoryExcludedCount,
      relationshipKinds,
    },
  }
}
