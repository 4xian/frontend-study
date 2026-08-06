import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { XMLParser } from 'fast-xml-parser'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const startupLedgerPath = path.join(auditDirectory, 'reviews', 'phase-1c-startup-config.json')
const webReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-web-entry')
const businessReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-business-layer')
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-data-access')
const reviewDirectory = process.env.DZZZ_DATA_ACCESS_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_DATA_ACCESS_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const manifestPath = path.join(reviewDirectory, 'manifest.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'
const mapperDirectory = 'dzzz-app/src/main/java/com/tdh/bdzz/dao'
const statementAnnotationNames = new Set(['Delete', 'Insert', 'Select', 'Update'])
const credentialFieldName = /^(?:ak|sk)$|(?:accesskey|password|passwd|pwd|secret|secretkey|token)$/i
const xmlParser = new XMLParser({
  allowBooleanAttributes: false,
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  processEntities: false,
})

const expectedMachineRoleCandidateCounts = { 'data-access': 134, 'persistence-model': 578 }
const expectedFinalRoleCounts = {
  'data-access': 134,
  'data-model': 450,
  'persistence-model': 128,
}
const expectedShapeCounts = {
  'generated-xml-model': 447,
  'managed-persistence-service': 2,
  'mapper-contract': 132,
  'persistence-model': 128,
  'support-data-model': 3,
}
const expectedMappingModeCounts = {
  'custom-sql-injector-contract': 1,
  'java-annotation-and-mapper-xml': 5,
  'java-annotation-sql': 26,
  'jaxb-generated-model': 447,
  'mapper-xml': 9,
  'mybatis-plus-base-mapper': 91,
  'mybatis-plus-entity': 128,
  'mybatis-plus-service-impl': 2,
  'plain-data-object': 3,
}
const expectedRiskCategoryCounts = {
  'credential-in-generated-to-string': 7,
  'mapper-xml-under-java-sources': 14,
  'oversized-mapper-contract': 4,
  'raw-page-type': 15,
  'raw-sql-substitution': 4,
  'untyped-map-result': 24,
  'xml-statement-without-declared-method': 2,
}
const expectedStatementBindingCounts = {
  declaredMethodCount: 160,
  annotationMappedMethodCount: 123,
  xmlMappedMethodCount: 36,
  customInjectorMethodCount: 1,
}
const expectedBatchFileCount = 712
const expectedBatchLoc = 38330
const expectedRiskCandidateCount = 70
const expectedReviewedTotal = 1234
const expectedReviewedAt = '2026-08-03T23:22:47.000Z'
const expectedShardFileCounts = [...Array(14).fill(50), 12]
const expectedMapperXmlSummary = {
  fileCount: 14,
  loc: 373,
  statementCount: 38,
  resultMapCount: 0,
  dynamicElementCounts: { foreach: 3, if: 22, set: 2, where: 2 },
}
const expectedGeneratedArtifactCounts = { class: 435, enum: 6, interface: 3, 'package-info': 3 }
const expectedPackageInfoPaths = [
  'dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/admin/package-info.java',
  'dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/client/package-info.java',
  'dzzz-app/src/main/java/com/tdh/bdzz/po/vidyo/replay/package-info.java',
]
const allowedShapes = new Set(Object.keys(expectedShapeCounts))

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 断言条件成立，否则抛出可定位的校验错误。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 将平台路径分隔符统一为仓库路径分隔符。 */
function normalizePath(filePath) {
  return filePath.split(path.sep).join('/')
}

/** 判断 Java 文件是否承载包级元数据。 */
function isPackageInfoFile(filePath) {
  return path.basename(filePath) === 'package-info.java'
}

/** 将单值或数组统一为数组。 */
function toArray(value) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** 递归列出目录中的全部文件。 */
function listFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    })
    .sort((left, right) => left.localeCompare(right))
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

/** 判断冻结 Java 文件是否属于第 4 批物理范围。 */
function isExpectedBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:dao|po)\/.*\.java$/.test(file.path)
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  return Object.fromEntries(
    [
      ...records
        .reduce((counts, record) => {
          const value = record[field]
          counts.set(value, (counts.get(value) ?? 0) + 1)
          return counts
        }, new Map())
        .entries(),
    ].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 统计记录中的风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 返回类型上的全部注解名。 */
function getTypeAnnotationNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter((annotation) => annotation.site === 'type')
      .map((annotation) => annotation.name),
  )
}

/** 独立根据路径、声明和表注解计算数据访问形态。 */
function inferDataAccessShape(filePath, extractedRecord) {
  if (filePath.includes('/dao/')) {
    return extractedRecord.declaredTypes[0]?.kind === 'interface'
      ? 'mapper-contract'
      : 'managed-persistence-service'
  }
  if (/\/po\/vidyo\/(?:admin|client|replay)\//.test(filePath)) {
    return 'generated-xml-model'
  }
  return getTypeAnnotationNames(extractedRecord).has('TableName')
    ? 'persistence-model'
    : 'support-data-model'
}

/** 独立计算形态对应的最终角色。 */
function inferFinalRole(shape) {
  if (['mapper-contract', 'managed-persistence-service'].includes(shape)) return 'data-access'
  if (shape === 'persistence-model') return 'persistence-model'
  return 'data-model'
}

/** 返回 Mapper 方法对应的注解 SQL 方法名。 */
function getAnnotationStatementMethodNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter(
        (annotation) =>
          annotation.site === 'method' && statementAnnotationNames.has(annotation.name),
      )
      .map((annotation) => annotation.target.match(/#([^ (]+)\(/)?.[1])
      .filter(Boolean),
  )
}

/** 独立根据形态、注解、XML 和绑定结果计算映射模式。 */
function inferMappingMode(shape, record, annotationMethods, expectedXml, unresolvedMethods) {
  if (shape === 'managed-persistence-service') return 'mybatis-plus-service-impl'
  if (shape === 'persistence-model') return 'mybatis-plus-entity'
  if (shape === 'support-data-model') return 'plain-data-object'
  if (shape === 'generated-xml-model') return 'jaxb-generated-model'
  if (record.path.endsWith('/EasyBaseMapper.java')) return 'custom-sql-injector-contract'
  const hasAnnotations = annotationMethods.size > 0
  const hasXml = Boolean(expectedXml)
  if (hasAnnotations && hasXml) return 'java-annotation-and-mapper-xml'
  if (hasAnnotations) return 'java-annotation-sql'
  if (hasXml) return 'mapper-xml'
  if (unresolvedMethods.length > 0) return 'unresolved-custom-statements'
  return 'mybatis-plus-base-mapper'
}

/** 返回记录是否包含指定类别和来源的风险。 */
function hasRisk(record, category, sourcePath = undefined) {
  return record.riskCandidates.some(
    (risk) =>
      risk.category === category && (sourcePath === undefined || risk.sourcePath === sourcePath),
  )
}

/** 验证行号数组落在对应源码范围内。 */
function validateLines(lines, loc, label) {
  assert(Array.isArray(lines) && lines.length > 0, `${label} 缺少源码行号`)
  assert(
    lines.every((line) => Number.isInteger(line) && line >= 1 && line <= loc),
    `${label} 行号越界`,
  )
  assert(new Set(lines).size === lines.length, `${label} 存在重复行号`)
  assert(
    lines.every((line, index) => index === 0 || lines[index - 1] < line),
    `${label} 行号未升序`,
  )
}

/** 从实际 XML 读取根 namespace 与 statement 列表。 */
function parseActualMapperXml(mapping) {
  const filePath = path.join(sourceRepository, mapping.path)
  const sourceBuffer = fs.readFileSync(filePath)
  const sourceText = sourceBuffer.toString('utf8')
  const sourceLines = sourceText.split(/\r?\n/)
  const mapper = xmlParser.parse(sourceText).mapper
  assert(mapper && typeof mapper === 'object', `${mapping.path} 不是 Mapper XML`)
  const mapperLine = sourceLines.findIndex((line) => /<mapper\b/i.test(line)) + 1
  assert(mapperLine > 0, `${mapping.path} 无法定位 mapper 根元素`)
  const statements = ['select', 'insert', 'update', 'delete'].flatMap((kind) =>
    toArray(mapper[kind]).map((statement) => ({ id: statement?.['@_id'], kind })),
  )
  return {
    sourceSha256: sha256(sourceBuffer),
    loc: sourceText.match(/\n/g)?.length ?? 0,
    namespace: mapper['@_namespace'] ?? null,
    mapperLine,
    statements,
    resultMapCount: toArray(mapper.resultMap).length,
  }
}

/** 验证一条第 4 批人工复核记录。 */
function validateRecord(record, inventoryFile, extractedRecord, xmlByNamespace, sourceLocByPath) {
  const label = `数据访问复核记录 ${record.path ?? '<unknown>'}`
  assert(inventoryFile, `${label} 不在冻结清单中`)
  assert(extractedRecord, `${label} 缺少 Phase 1B 自动提取记录`)
  assert(record.inventoryIndex === inventoryFile.index, `${label} inventoryIndex 不一致`)
  assert(record.sourceSha256 === inventoryFile.sha256, `${label} sourceSha256 不一致`)
  assert(record.sourceSha256 === extractedRecord.sourceSha256, `${label} 与自动提取哈希不一致`)
  assert(record.loc === inventoryFile.loc, `${label} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${label} 状态不是 reviewed`)
  assert(
    record.machineRoleCandidate === extractedRecord.inferredRole.primary,
    `${label} 机器角色不一致`,
  )
  assert(allowedShapes.has(record.dataAccessShape), `${label} dataAccessShape 不受支持`)
  const inferredShape = inferDataAccessShape(record.path, extractedRecord)
  assert(record.dataAccessShape === inferredShape, `${label} dataAccessShape 与源码不一致`)
  assert(record.finalRole === inferFinalRole(inferredShape), `${label} 最终角色不一致`)
  for (const field of ['mappingMode', 'roleDetail', 'responsibility', 'lifecycle']) {
    assert(typeof record[field] === 'string' && record[field].trim(), `${label} 缺少 ${field}`)
  }
  for (const field of [
    'dependencies',
    'capabilityCandidates',
    'riskCandidates',
    'sourceEvidence',
  ]) {
    assert(Array.isArray(record[field]), `${label} 的 ${field} 必须是数组`)
  }
  assert(record.dependencies.length > 0, `${label} 缺少主要依赖`)
  assert(record.capabilityCandidates.length > 0, `${label} 缺少能力候选`)
  assert(record.sourceEvidence.length > 0, `${label} 缺少源码证据`)

  if (inferredShape === 'mapper-contract') {
    assert(record.lifecycle.includes('MyBatis 创建代理'), `${label} 没有说明 Mapper 代理`)
    assert(record.lifecycle.includes('Spring Bean'), `${label} 没有说明 Mapper Bean 生命周期`)
  }
  if (inferredShape === 'managed-persistence-service') {
    assert(record.lifecycle.includes('Spring 通过 @Service'), `${label} 没有说明 Service 生命周期`)
  }
  if (['persistence-model', 'support-data-model'].includes(inferredShape)) {
    assert(record.lifecycle.includes('不是 Spring Bean'), `${label} 没有说明普通对象生命周期`)
  }
  if (inferredShape === 'generated-xml-model') {
    assert(record.lifecycle.includes('重新生成'), `${label} 没有说明生成代码维护边界`)
  }
  if (isPackageInfoFile(record.path)) {
    const firstLine = fs
      .readFileSync(path.join(sourceRepository, record.path), 'utf8')
      .split(/\r?\n/, 1)[0]
    const javaEvidence = record.sourceEvidence.find(
      (evidence) => evidence.sourcePath === record.path,
    )
    assert(firstLine.includes('XmlSchema'), `${label} 第 1 行不是包级 XmlSchema 注解`)
    assert(
      record.roleDetail === 'package-info.java 包级 XML Schema 元数据',
      `${label} 没有按包级元数据说明角色`,
    )
    assert(
      record.responsibility ===
        '该 package-info.java 声明生成包的 XML Schema 命名空间，不定义可实例化的数据类型。',
      `${label} 没有准确说明包级元数据职责`,
    )
    assert(record.lifecycle.includes('包级元数据'), `${label} 没有说明包级元数据生命周期`)
    assert(javaEvidence, `${label} 缺少当前 package-info.java 的源码证据`)
    assert(JSON.stringify(javaEvidence.lines) === JSON.stringify([1]), `${label} 引用了伪类型声明`)
    assert(javaEvidence.summary.includes('包级 @XmlSchema'), `${label} 证据没有说明包级注解`)
  }

  const qualifiedName = extractedRecord.declaredTypes[0]?.qualifiedName
  const expectedXml = qualifiedName ? (xmlByNamespace.get(qualifiedName) ?? null) : null
  assert(
    JSON.stringify(record.mapperXml) === JSON.stringify(expectedXml),
    `${label} Mapper XML 绑定不一致`,
  )

  const annotationMethods = getAnnotationStatementMethodNames(extractedRecord)
  const xmlMethods = new Set(expectedXml?.statements.map((statement) => statement.id) ?? [])
  const customMethods = new Set(
    record.path.endsWith('/EasyBaseMapper.java') ? ['insertBatchSomeColumn'] : [],
  )
  const declaredMethods =
    inferredShape === 'mapper-contract'
      ? extractedRecord.publicMethods.map((method) => method.name)
      : []
  const unresolvedMethods = declaredMethods.filter(
    (methodName) =>
      !annotationMethods.has(methodName) &&
      !xmlMethods.has(methodName) &&
      !customMethods.has(methodName),
  )
  const declaredMethodNames = new Set(declaredMethods)
  const xmlStatementsWithoutDeclaredMethod = [...xmlMethods].filter(
    (methodName) => !declaredMethodNames.has(methodName),
  )
  assert(
    JSON.stringify(record.statementBindings.unresolvedMethods) ===
      JSON.stringify(unresolvedMethods),
    `${label} 未解析方法列表不一致`,
  )
  assert(
    JSON.stringify(record.statementBindings.xmlStatementsWithoutDeclaredMethod) ===
      JSON.stringify(xmlStatementsWithoutDeclaredMethod),
    `${label} XML 遗留 statement 列表不一致`,
  )
  const expectedBindingCounts = {
    declaredMethodCount: declaredMethods.length,
    annotationMappedMethodCount: declaredMethods.filter((methodName) =>
      annotationMethods.has(methodName),
    ).length,
    xmlMappedMethodCount: declaredMethods.filter((methodName) => xmlMethods.has(methodName)).length,
    customInjectorMethodCount: declaredMethods.filter((methodName) => customMethods.has(methodName))
      .length,
  }
  for (const [field, count] of Object.entries(expectedBindingCounts)) {
    assert(record.statementBindings[field] === count, `${label} ${field} 不一致`)
  }
  assert(
    record.mappingMode ===
      inferMappingMode(inferredShape, record, annotationMethods, expectedXml, unresolvedMethods),
    `${label} mappingMode 与源码绑定不一致`,
  )

  const hasRawSubstitution =
    inferredShape === 'mapper-contract' &&
    /\$\{/.test(fs.readFileSync(path.join(sourceRepository, record.path), 'utf8'))
  assert(
    hasRisk(record, 'raw-sql-substitution', record.path) === hasRawSubstitution,
    `${label} Java 原始 SQL 替换风险叠加不一致`,
  )
  const hasUntypedMapResult =
    inferredShape === 'mapper-contract' &&
    extractedRecord.publicMethods.some((method) => /(?:^|<|,)Map</.test(method.returnType))
  assert(
    hasRisk(record, 'untyped-map-result') === hasUntypedMapResult,
    `${label} Map 结果风险叠加不一致`,
  )
  const hasRawPageType =
    inferredShape === 'mapper-contract' &&
    extractedRecord.publicMethods.some((method) =>
      method.parameterTypes.some((typeName) => typeName === 'Page'),
    )
  assert(
    hasRisk(record, 'raw-page-type') === hasRawPageType,
    `${label} 原始 Page 类型风险叠加不一致`,
  )
  assert(
    hasRisk(record, 'oversized-mapper-contract') ===
      (inferredShape === 'mapper-contract' && record.loc > 200),
    `${label} 超大 Mapper 风险叠加不一致`,
  )
  const mapperXmlLocationRisks = record.riskCandidates.filter(
    (risk) => risk.category === 'mapper-xml-under-java-sources',
  )
  assert(
    mapperXmlLocationRisks.length === (expectedXml ? 1 : 0),
    `${label} Mapper XML 目录风险叠加不一致`,
  )
  if (expectedXml) {
    assert(
      mapperXmlLocationRisks[0].sourcePath === expectedXml.path,
      `${label} Mapper XML 目录风险来源不一致`,
    )
    assert(
      JSON.stringify(mapperXmlLocationRisks[0].lines) === JSON.stringify([expectedXml.mapperLine]),
      `${label} Mapper XML 目录风险行号不一致`,
    )
  }
  assert(
    hasRisk(record, 'unresolved-statement-binding') === unresolvedMethods.length > 0,
    `${label} 未解析 statement 风险叠加不一致`,
  )
  assert(
    hasRisk(record, 'xml-statement-without-declared-method') ===
      xmlStatementsWithoutDeclaredMethod.length > 0,
    `${label} XML 遗留 statement 风险叠加不一致`,
  )
  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  const hasCredentialToString =
    ['persistence-model', 'support-data-model'].includes(inferredShape) &&
    (typeAnnotations.has('Data') || typeAnnotations.has('ToString')) &&
    extractedRecord.fields.some((field) => credentialFieldName.test(field.name))
  assert(
    hasRisk(record, 'credential-in-generated-to-string') === hasCredentialToString,
    `${label} 凭据 toString 风险叠加不一致`,
  )

  for (const risk of record.riskCandidates) {
    assert(typeof risk.id === 'string' && risk.id, `${label} 存在无 ID 风险候选`)
    assert(typeof risk.category === 'string' && risk.category, `${label} 存在无类别风险候选`)
    assert(typeof risk.summary === 'string' && risk.summary, `${label} 存在无摘要风险候选`)
    assert(sourceLocByPath.has(risk.sourcePath), `${label} 风险 ${risk.id} 来源不受支持`)
    validateLines(risk.lines, sourceLocByPath.get(risk.sourcePath), `${label} 风险 ${risk.id}`)
  }
  for (const evidence of record.sourceEvidence) {
    assert(typeof evidence.summary === 'string' && evidence.summary, `${label} 存在无摘要源码证据`)
    assert(sourceLocByPath.has(evidence.sourcePath), `${label} 源码证据来源不受支持`)
    validateLines(evidence.lines, sourceLocByPath.get(evidence.sourcePath), `${label} 源码证据`)
  }
  assert(
    record.sourceEvidence.some((evidence) => evidence.sourcePath === record.path),
    `${label} 源码证据没有覆盖当前 Java 文件`,
  )
}

/** 验证第 4 批数据访问台账、XML 证据和累计状态。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const manifest = readJson(manifestPath)
  const records = readShardedRecords(manifest, reviewDirectory, '数据访问')

  assert(manifest.schemaVersion === 1, '数据访问 manifest schemaVersion 不受支持')
  assert(manifest.snapshotId === inventory.snapshotId, '数据访问 manifest snapshotId 不一致')
  assert(
    manifest.analysisId === extractionManifest.analysisId,
    '数据访问 manifest analysisId 不一致',
  )
  assert(manifest.batchId === 'phase-1c-data-access', '数据访问 manifest batchId 不一致')
  assert(manifest.status === 'completed', '数据访问批次状态不是 completed')
  assert(manifest.reviewedAt === expectedReviewedAt, '数据访问 reviewedAt 不一致')
  assert(
    JSON.stringify(manifest.batchScope.javaInventoryIndexRanges) ===
      JSON.stringify([
        [261, 394],
        [1174, 1751],
      ]),
    '数据访问库存索引范围不一致',
  )
  assert(manifest.batchScope.mapperXmlRoot === mapperDirectory, 'Mapper XML 根目录不一致')

  const actualXmlPaths = listFiles(path.join(sourceRepository, mapperDirectory))
    .filter((filePath) => filePath.endsWith('.xml'))
    .map((filePath) => normalizePath(path.relative(sourceRepository, filePath)))
  const manifestXmlPaths = manifest.mapperXmlSummary.files.map((mapping) => mapping.path)
  assert(
    JSON.stringify(actualXmlPaths) === JSON.stringify(manifestXmlPaths),
    'Mapper XML 文件集合不一致',
  )
  const xmlByNamespace = new Map()
  const sourceLocByPath = new Map(inventory.files.map((file) => [file.path, file.loc]))
  for (const mapping of manifest.mapperXmlSummary.files) {
    const actual = parseActualMapperXml(mapping)
    assert(mapping.sourceSha256 === actual.sourceSha256, `${mapping.path} SHA-256 不一致`)
    assert(mapping.loc === actual.loc, `${mapping.path} LOC 不一致`)
    assert(mapping.namespace === actual.namespace, `${mapping.path} namespace 不一致`)
    assert(mapping.mapperLine === actual.mapperLine, `${mapping.path} mapper 根元素行号不一致`)
    assert(
      JSON.stringify(mapping.statements.map(({ id, kind }) => ({ id, kind }))) ===
        JSON.stringify(actual.statements),
      `${mapping.path} statement 集合不一致`,
    )
    assert(
      mapping.resultMaps.length === actual.resultMapCount,
      `${mapping.path} resultMap 数量不一致`,
    )
    assert(
      !xmlByNamespace.has(mapping.namespace),
      `Mapper XML namespace 重复：${mapping.namespace}`,
    )
    xmlByNamespace.set(mapping.namespace, mapping)
    sourceLocByPath.set(mapping.path, mapping.loc)
  }
  const mapperSummaryComparable = {
    fileCount: manifest.mapperXmlSummary.fileCount,
    loc: manifest.mapperXmlSummary.loc,
    statementCount: manifest.mapperXmlSummary.statementCount,
    resultMapCount: manifest.mapperXmlSummary.resultMapCount,
    dynamicElementCounts: manifest.mapperXmlSummary.dynamicElementCounts,
  }
  assert(
    JSON.stringify(mapperSummaryComparable) === JSON.stringify(expectedMapperXmlSummary),
    'Mapper XML 汇总不一致',
  )

  const expectedFiles = inventory.files.filter(isExpectedBatchFile)
  assert(records.length === expectedBatchFileCount, '数据访问记录数不等于 712')
  assert(records.length === expectedFiles.length, '数据访问记录数没有覆盖完整物理范围')
  assert(
    JSON.stringify(records.map((record) => record.path)) ===
      JSON.stringify(expectedFiles.map((file) => file.path)),
    '数据访问路径集合或顺序不一致',
  )
  assert(new Set(records.map((record) => record.path)).size === records.length, '数据访问路径重复')
  const inventoryByPath = new Map(inventory.files.map((file) => [file.path, file]))
  for (const record of records) {
    validateRecord(
      record,
      inventoryByPath.get(record.path),
      extractedByPath.get(record.path),
      xmlByNamespace,
      sourceLocByPath,
    )
  }

  const packageInfoPaths = records
    .filter((record) => isPackageInfoFile(record.path))
    .map((record) => record.path)
  assert(
    JSON.stringify(packageInfoPaths) === JSON.stringify(expectedPackageInfoPaths),
    'package-info.java 文件集合不一致',
  )
  const generatedArtifactCounts = countBy(
    records
      .filter((record) => record.dataAccessShape === 'generated-xml-model')
      .map((record) => ({
        artifactKind: isPackageInfoFile(record.path)
          ? 'package-info'
          : extractedByPath.get(record.path)?.declaredTypes[0]?.kind,
      })),
    'artifactKind',
  )
  assert(
    JSON.stringify(generatedArtifactCounts) === JSON.stringify(expectedGeneratedArtifactCounts),
    '生成 XML 模型的 Java 产物类型统计不一致',
  )

  assert(
    JSON.stringify(manifest.shards.map((shard) => shard.fileCount)) ===
      JSON.stringify(expectedShardFileCounts),
    '数据访问分片大小不一致',
  )
  assert(manifest.summary.batchFileCount === expectedBatchFileCount, 'manifest 文件数不一致')
  assert(manifest.summary.batchLoc === expectedBatchLoc, 'manifest LOC 不一致')
  assert(
    records.reduce((total, record) => total + record.loc, 0) === expectedBatchLoc,
    '记录 LOC 汇总不一致',
  )
  assert(
    JSON.stringify(countBy(records, 'machineRoleCandidate')) ===
      JSON.stringify(expectedMachineRoleCandidateCounts),
    '机器角色汇总不一致',
  )
  assert(
    JSON.stringify(countBy(records, 'finalRole')) === JSON.stringify(expectedFinalRoleCounts),
    '最终角色汇总不一致',
  )
  assert(
    JSON.stringify(countBy(records, 'dataAccessShape')) === JSON.stringify(expectedShapeCounts),
    '数据访问形态汇总不一致',
  )
  assert(
    JSON.stringify(countBy(records, 'mappingMode')) === JSON.stringify(expectedMappingModeCounts),
    '映射模式汇总不一致',
  )
  assert(manifest.summary.roleCorrectionCount === 450, '角色纠正数不一致')
  assert(
    JSON.stringify(manifest.summary.statementBindingCounts) ===
      JSON.stringify(expectedStatementBindingCounts),
    'statement 绑定汇总不一致',
  )
  assert(manifest.summary.unresolvedMethodCount === 0, '仍有未解析 Java Mapper 方法')
  assert(
    manifest.summary.xmlStatementWithoutDeclaredMethodCount === 2,
    'XML 遗留 statement 数量不一致',
  )
  assert(manifest.summary.riskCandidateCount === expectedRiskCandidateCount, '风险候选数不一致')
  assert(
    JSON.stringify(countRiskCategories(records)) === JSON.stringify(expectedRiskCategoryCounts),
    '风险候选类别汇总不一致',
  )
  const riskIds = records.flatMap((record) => record.riskCandidates.map((risk) => risk.id))
  assert(riskIds.length === expectedRiskCandidateCount, '风险 ID 数量不一致')
  assert(new Set(riskIds).size === riskIds.length, '风险 ID 重复')
  riskIds.forEach((riskId, index) => {
    assert(riskId === `DA-${String(index + 1).padStart(3, '0')}`, `风险 ID 不连续：${riskId}`)
  })

  const startupPaths = readJson(startupLedgerPath).records.map((record) => record.path)
  const webManifest = readJson(path.join(webReviewDirectory, 'manifest.json'))
  const businessManifest = readJson(path.join(businessReviewDirectory, 'manifest.json'))
  const priorPaths = [
    ...startupPaths,
    ...readShardedRecords(webManifest, webReviewDirectory, 'Web 入口').map((record) => record.path),
    ...readShardedRecords(businessManifest, businessReviewDirectory, '业务层').map(
      (record) => record.path,
    ),
  ]
  const currentPathSet = new Set(records.map((record) => record.path))
  assert(new Set(priorPaths).size === priorPaths.length, '前三批台账路径存在重叠')
  assert(
    priorPaths.every((filePath) => !currentPathSet.has(filePath)),
    '第 4 批与前三批路径重叠',
  )
  assert(priorPaths.length + records.length === expectedReviewedTotal, '累计 reviewed 数不一致')
  assert(
    JSON.stringify(manifest.summary.currentAuditStatusCounts) ===
      JSON.stringify({ unreviewed: 2202, reviewing: 0, reviewed: 1234, blocked: 0 }),
    '累计审计状态不一致',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: manifest.batchId,
      snapshotId: manifest.snapshotId,
      reviewedFiles: records.length,
      batchLoc: manifest.summary.batchLoc,
      mapperXmlFiles: manifest.mapperXmlSummary.fileCount,
      mapperStatements: manifest.mapperXmlSummary.statementCount,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      roleCorrectionCount: manifest.summary.roleCorrectionCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
      dataAccessShapeCounts: manifest.summary.dataAccessShapeCounts,
    }),
  )
}

main()
