import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const manualSignoffPath = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-data-model-signoff.json',
)
const startupLedgerPath = path.join(auditDirectory, 'reviews', 'phase-1c-startup-config.json')
const webReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-web-entry')
const businessReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-business-layer')
const dataAccessReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-data-access')
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-data-model')
const reviewDirectory = process.env.DZZZ_DATA_MODEL_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_DATA_MODEL_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const manifestPath = path.join(reviewDirectory, 'manifest.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'

const expectedReviewedAt = '2026-08-04T02:18:46.000Z'
const expectedBatchFileCount = 1654
const expectedBatchLoc = 58427
const expectedDeclaredTypeCount = 1680
const expectedFieldCount = 9832
const expectedPublicMethodCount = 1531
const expectedPreviouslyReviewedCount = 1234
const expectedReviewedTotal = 2888
const expectedShardFileCounts = [...Array(33).fill(50), 4]
const expectedInventoryIndexRanges = [
  [19, 65],
  [402, 684],
  [847, 1121],
  [2374, 3422],
]
const expectedModelFamilyCounts = { bo: 47, dto: 283, eo: 275, vo: 1049 }
const expectedMachineRoleCandidateCounts = { 'data-model': 1647, 'web-entry': 7 }
const expectedFinalRoleCounts = { 'data-model': 1654 }
const expectedModelShapeCounts = {
  'business-transfer-model': 47,
  'external-contract-model': 303,
  'query-filter-model': 7,
  'request-input-model': 495,
  'resource-wrapper-model': 8,
  'response-envelope-model': 16,
  'response-view-model': 578,
  'transfer-model': 200,
}
const expectedSignals = {
  lombokFileCount: 1608,
  validationConstraintFileCount: 455,
  directValidatedModelCount: 431,
  nestedValidFileCount: 23,
  swagger2FileCount: 118,
  serializationAnnotationFileCount: 50,
  persistenceAnnotationFileCount: 1,
  inheritedModelCount: 73,
  multipleTypeFileCount: 13,
}
const expectedRiskCategoryCounts = {
  'behaviorful-data-model': 24,
  'builder-on-inherited-model': 1,
  'constraint-without-direct-controller-trigger': 70,
  'logging-inside-model': 1,
  'lombok-data-inheritance': 53,
  'mixed-serialization-contract': 1,
  'multiple-types-in-one-file': 13,
  'non-static-member-model': 9,
  'persistence-annotation-in-transfer-model': 1,
  'provider-specific-validation-annotation': 456,
  'raw-collection-field': 1,
  'sensitive-field-boundary': 150,
  'sensitive-field-in-explicit-to-string': 3,
  'sensitive-field-in-generated-to-string': 142,
  'web-validation-coupling-in-model': 3,
}
const expectedRiskCandidateCount = Object.values(expectedRiskCategoryCounts).reduce(
  (total, count) => total + count,
  0,
)

const validationImportPrefixes = [
  'javax.validation.constraints.',
  'jakarta.validation.constraints.',
  'org.hibernate.validator.constraints.',
]
const lombokAnnotationNames = new Set([
  'AllArgsConstructor',
  'Builder',
  'Data',
  'EqualsAndHashCode',
  'Getter',
  'NoArgsConstructor',
  'RequiredArgsConstructor',
  'Setter',
  'SuperBuilder',
  'ToString',
  'Value',
])
const swaggerAnnotationNames = new Set(['ApiModel', 'ApiModelProperty'])
const persistenceAnnotationNames = new Set(['TableField', 'TableId', 'TableName'])
const springComponentAnnotationNames = new Set([
  'Component',
  'Configuration',
  'Controller',
  'Repository',
  'RestController',
  'Service',
])
const sensitiveFieldSuffixes = [
  'password',
  'passwd',
  'pwd',
  'pass',
  'secret',
  'privatekey',
  'apikey',
  'appkey',
  'token',
  'tokenid',
  'authorization',
  'credential',
  'accesscode',
  'sqm',
]
const knownProjectCredentialNames = new Set([
  'authorizekey', 'clientkey', 'cxmm', 'directmodelconfig', 'dlmm', 'ftpmm',
  'hyzdmm', 'mm', 'modelconfig', 'newkl', 'platformmodelconfig', 'roomkey',
  'vidyokey', 'vidyowwkey', 'xfsk', 'yhkl', 'yskl', 'zdmm',
])
const accessorMethodName = /^(?:get|set|is|has)[A-Z]/
const ignoredMethodNames = new Set(['equals', 'hashCode', 'toString'])

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 统一使用正斜杠表示相对路径。 */
function normalizePath(filePath) {
  return filePath.split(path.sep).join('/')
}

/** 递归列出目录中的文件并稳定排序。 */
function listFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    })
    .sort((left, right) => left.localeCompare(right))
}

/** 断言条件成立，否则给出可定位的校验错误。 */
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

/** 读取 JSONL 分片，并验证分片自身的身份字段。 */
function readShardedRecords(manifest, directory, label) {
  const records = []
  for (const shard of manifest.shards) {
    const shardPath = path.join(directory, shard.fileName)
    assert(fs.existsSync(shardPath), `${label}缺少分片 ${shard.fileName}`)
    const content = fs.readFileSync(shardPath, 'utf8')
    assert(sha256(content) === shard.sha256, `${label}分片 ${shard.fileName} SHA-256 不一致`)
    const shardRecords = content.trim().split('\n').map((line) => JSON.parse(line))
    assert(shardRecords.length === shard.fileCount, `${label}分片 ${shard.fileName} 记录数不一致`)
    assert(
      shardRecords[0]?.inventoryIndex === shard.firstInventoryIndex,
      `${label}分片 ${shard.fileName} 首索引不一致`,
    )
    assert(
      shardRecords.at(-1)?.inventoryIndex === shard.lastInventoryIndex,
      `${label}分片 ${shard.fileName} 尾索引不一致`,
    )
    assert(
      shardRecords[0]?.path === shard.firstPath,
      `${label}分片 ${shard.fileName} 首路径不一致`,
    )
    assert(
      shardRecords.at(-1)?.path === shard.lastPath,
      `${label}分片 ${shard.fileName} 尾路径不一致`,
    )
    records.push(...shardRecords)
  }
  return records
}

/** 独立验证人工签核对当前 1654 条记录及其分片内容的完整绑定。 */
function validateManualSignoff(signoff, manifest, records, inventory, extractionManifest) {
  assert(signoff.schemaVersion === 1, '数据模型人工签核 schemaVersion 不受支持')
  assert(signoff.snapshotId === inventory.snapshotId, '数据模型人工签核 snapshotId 不一致')
  assert(signoff.analysisId === extractionManifest.analysisId, '数据模型人工签核 analysisId 不一致')
  assert(signoff.batchId === manifest.batchId, '数据模型人工签核 batchId 不一致')
  assert(signoff.status === 'approved', '数据模型人工签核状态不是 approved')
  assert(signoff.reviewedAt === manifest.reviewedAt, '数据模型人工签核时间不一致')
  assert(
    Array.isArray(signoff.reviewMethod) && signoff.reviewMethod.length > 0,
    '数据模型人工签核缺少复核方法',
  )
  const approvedShards = signoff.shards.map(({ fileName, fileCount, sha256, decision }) => ({
    fileName,
    fileCount,
    sha256,
    decision,
  }))
  const actualShards = manifest.shards.map(({ fileName, fileCount, sha256 }) => ({
    fileName,
    fileCount,
    sha256,
    decision: 'approved',
  }))
  assert(
    JSON.stringify(approvedShards) === JSON.stringify(actualShards),
    '数据模型记录分片未被人工签核完整绑定',
  )
  assert(signoff.summary.approvedFileCount === records.length, '数据模型人工签核文件数不一致')
  assert(
    signoff.summary.approvedLoc === records.reduce((total, record) => total + record.loc, 0),
    '数据模型人工签核 LOC 不一致',
  )
  assert(
    signoff.summary.approvedShardCount === manifest.shards.length,
    '数据模型人工签核分片数不一致',
  )
  assert(
    JSON.stringify(manifest.manualReviewSignoff) ===
      JSON.stringify({
        path: 'reviews/phase-1c-data-model-signoff.json',
        sha256: sha256(fs.readFileSync(manualSignoffPath)),
        reviewedBy: signoff.reviewedBy,
        reviewerType: signoff.reviewerType,
        approvedShardCount: signoff.shards.length,
      }),
    '数据模型 manifest 人工签核身份不一致',
  )
}

/** 判断冻结文件是否属于 Phase 1C 第 5 批物理范围。 */
function isExpectedBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:bo|dto|eo|vo)\/.*\.java$/.test(
    file.path,
  )
}

/** 从物理路径提取模型族。 */
function inferModelFamily(filePath) {
  return filePath.match(/\/bdzz\/(bo|dto|eo|vo)\//)?.[1]
}

/** 返回类型和成员上的全部注解名。 */
function getAnnotationNames(extractedRecord) {
  return new Set(extractedRecord.annotations.map((annotation) => annotation.name))
}

/** 返回类型声明上的全部注解名。 */
function getTypeAnnotationNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter((annotation) => annotation.site === 'type')
      .map((annotation) => annotation.name),
  )
}

/** 从 import 独立推导 Bean Validation 约束注解。 */
function inferValidationConstraintNames(extractedRecord) {
  const importedNames = new Set(
    extractedRecord.imports
      .map((entry) => entry.name)
      .filter((name) => validationImportPrefixes.some((prefix) => name.startsWith(prefix)))
      .map((name) => name.split('.').at(-1)),
  )
  return [...new Set(
    extractedRecord.annotations
      .map((annotation) => annotation.name)
      .filter((name) => importedNames.has(name)),
  )].sort()
}

/** 从注解独立推导序列化协议集合。 */
function inferSerializationKinds(extractedRecord) {
  const annotationNames = getAnnotationNames(extractedRecord)
  const kinds = []
  if ([...annotationNames].some((name) => name.startsWith('Json'))) kinds.push('jackson')
  if ([...annotationNames].some((name) => name.startsWith('JSON'))) kinds.push('fastjson')
  if ([...annotationNames].some((name) => name.startsWith('XStream'))) kinds.push('xstream')
  if ([...annotationNames].some((name) => name.startsWith('Xml'))) kinds.push('jaxb')
  return kinds
}

/** 独立重算单个模型的注解概况。 */
function inferAnnotationProfile(extractedRecord) {
  const annotationNames = getAnnotationNames(extractedRecord)
  return {
    lombok: [...annotationNames].filter((name) => lombokAnnotationNames.has(name)).sort(),
    validationConstraints: inferValidationConstraintNames(extractedRecord),
    nestedValidCount: extractedRecord.annotations.filter(
      (annotation) => annotation.name === 'Valid' && annotation.site === 'field',
    ).length,
    swagger2: [...annotationNames].filter((name) => swaggerAnnotationNames.has(name)).sort(),
    serialization: inferSerializationKinds(extractedRecord),
    persistence: [...annotationNames]
      .filter((name) => persistenceAnnotationNames.has(name))
      .sort(),
  }
}

/** 建立主类型名到数据模型记录的索引。 */
function buildPrimaryTypeIndex(batchRecords) {
  const index = new Map()
  for (const record of batchRecords) {
    const typeName = record.declaredTypes[0]?.name
    if (!typeName) continue
    if (!index.has(typeName)) index.set(typeName, [])
    index.get(typeName).push(record)
  }
  return index
}

/** 根据 Controller import 独立解析同名校验参数。 */
function resolveValidatedType(typeName, controllerRecord, typeIndex) {
  const candidates = typeIndex.get(typeName) ?? []
  if (candidates.length <= 1) return candidates
  const imports = controllerRecord.imports.filter((entry) => !entry.static)
  const explicit = candidates.filter((candidate) =>
    imports.some(
      (entry) => !entry.wildcard && entry.name === `${candidate.packageName}.${typeName}`,
    ),
  )
  if (explicit.length === 1) return explicit
  const wildcard = candidates.filter((candidate) =>
    imports.some((entry) => entry.wildcard && entry.name === candidate.packageName),
  )
  return wildcard.length === 1 ? wildcard : []
}

/** 从当前 Controller 源码独立重算直接校验触发证据。 */
function buildActualControllerValidationIndex(extractedByPath, batchRecords) {
  const evidenceByPath = new Map(batchRecords.map((record) => [record.path, []]))
  const typeIndex = buildPrimaryTypeIndex(batchRecords)
  const directory = path.join(
    sourceRepository,
    'dzzz-app/src/main/java/com/tdh/bdzz/controller',
  )
  const pattern = /@(Valid|Validated)\b(?:\s*\([^)]*\))?(?:\s*@[\w.]+(?:\s*\([^)]*\))?)*\s+(?:final\s+)?([\w.$]+(?:\s*<[^;()]+>)?(?:\[\])?)\s+[A-Za-z_$][\w$]*/g
  for (const controllerPath of listFiles(directory).filter((filePath) => filePath.endsWith('.java'))) {
    const relativePath = normalizePath(path.relative(sourceRepository, controllerPath))
    const controllerRecord = extractedByPath.get(relativePath)
    if (!controllerRecord) continue
    const sourceText = fs.readFileSync(controllerPath, 'utf8')
    for (const match of sourceText.matchAll(pattern)) {
      const typeNames = [...match[2].matchAll(/[A-Z][A-Za-z0-9_$]*/g)].map((item) => item[0])
      const line = sourceText.slice(0, match.index).split('\n').length
      for (const typeName of typeNames) {
        for (const modelRecord of resolveValidatedType(typeName, controllerRecord, typeIndex)) {
          evidenceByPath.get(modelRecord.path).push({
            sourcePath: relativePath,
            line,
            trigger: `@${match[1]}`,
          })
        }
      }
    }
  }
  for (const [filePath, evidence] of evidenceByPath) {
    const unique = new Map(
      evidence.map((item) => [`${item.sourcePath}:${item.line}:${item.trigger}`, item]),
    )
    evidenceByPath.set(
      filePath,
      [...unique.values()].sort(
        (left, right) =>
          left.sourcePath.localeCompare(right.sourcePath) || left.line - right.line,
      ),
    )
  }
  return evidenceByPath
}

/** 判断模型是否封装流、上传文件或 Spring Resource。 */
function isResourceWrapper(extractedRecord) {
  return extractedRecord.fields.some((field) =>
    /(?:^|[<, ?])(?:InputStream|MultipartFile|Resource|File)(?:$|[>, ?])/.test(field.type),
  )
}

/** 判断模型是否提供成功/失败响应工厂。 */
function isResponseEnvelope(extractedRecord) {
  return extractedRecord.publicMethods.some((method) =>
    ['data', 'error', 'fail', 'ok', 'success'].includes(method.name),
  )
}

/** 独立推导数据模型的主要形态。 */
function inferModelShape(filePath, extractedRecord, profile, validationEvidence) {
  const family = inferModelFamily(filePath)
  if (filePath.includes('/dto/filter/')) return 'query-filter-model'
  if (isResourceWrapper(extractedRecord)) return 'resource-wrapper-model'
  if (isResponseEnvelope(extractedRecord)) return 'response-envelope-model'
  if (family === 'bo') return 'business-transfer-model'
  if (family === 'eo' || profile.serialization.length > 0) return 'external-contract-model'
  if (profile.validationConstraints.length > 0 || validationEvidence.length > 0) {
    return 'request-input-model'
  }
  if (family === 'vo') return 'response-view-model'
  return 'transfer-model'
}

/** 从字段类型、所属包和 import 独立解析带校验约束的嵌套模型。 */
function inferNestedConstraintTargets(field, ownerRecord, typeIndex) {
  const imports = ownerRecord.imports.filter((entry) => !entry.static)
  return [...field.type.matchAll(/[A-Z][A-Za-z0-9_$]*/g)].flatMap((match) => {
    const typeName = match[0]
    const candidates = (typeIndex.get(typeName) ?? []).filter(
      (candidate) =>
        candidate.packageName === ownerRecord.packageName ||
        imports.some(
          (entry) =>
            (!entry.wildcard && entry.name === `${candidate.packageName}.${typeName}`) ||
            (entry.wildcard && entry.name === candidate.packageName),
        ),
    )
    if (candidates.length !== 1) return []
    return inferValidationConstraintNames(candidates[0]).length > 0 ? candidates : []
  })
}

/** 返回字段上指定注解的源码行号。 */
function getFieldAnnotationLines(extractedRecord, field, annotationName) {
  return extractedRecord.annotations
    .filter(
      (annotation) =>
        annotation.site === 'field' &&
        annotation.name === annotationName &&
        annotation.target?.endsWith(`#${field.name}`),
    )
    .map((annotation) => annotation.line)
}

/** 使用独立词表识别密码、令牌、密钥和项目旧缩写字段。 */
function inferSensitiveFields(extractedRecord) {
  return extractedRecord.fields.filter((field) => {
    const normalizedName = field.name.replaceAll('_', '').toLowerCase()
    return (
      sensitiveFieldSuffixes.some((suffix) => normalizedName.endsWith(suffix)) ||
      knownProjectCredentialNames.has(normalizedName)
    )
  })
}

/** 返回不是访问器或 Object 覆盖的显式模型方法。 */
function getBehaviorMethods(extractedRecord) {
  return extractedRecord.publicMethods.filter(
    (method) => !accessorMethodName.test(method.name) && !ignoredMethodNames.has(method.name),
  )
}

/** 独立定位显式 toString 中被引用的敏感字段。 */
function findSensitiveToStringLines(extractedRecord, sourceLines, sensitiveFields) {
  const lines = []
  for (const method of extractedRecord.publicMethods.filter((item) => item.name === 'toString')) {
    const body = sourceLines.slice(method.line - 1, method.endLine).join('\n')
    if (sensitiveFields.some((field) => new RegExp(`\\b${field.name}\\b`).test(body))) {
      lines.push(method.line)
    }
  }
  return lines
}

/** 向独立风险集合添加一个带排序行号的类别。 */
function addExpectedRisk(risks, category, lines) {
  const validLines = [...new Set(lines)].filter(Number.isInteger).sort((left, right) => left - right)
  if (validLines.length > 0) risks.set(category, validLines)
}

/** 从当前源码独立重算全部数据模型风险类别与行号。 */
function inferRisks(extractedRecord, sourceLines, profile, validationEvidence, typeIndex) {
  const risks = new Map()
  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  const constraintLines = extractedRecord.annotations
    .filter((annotation) => profile.validationConstraints.includes(annotation.name))
    .map((annotation) => annotation.line)
  if (constraintLines.length > 0 && validationEvidence.length === 0) {
    addExpectedRisk(risks, 'constraint-without-direct-controller-trigger', constraintLines)
  }

  if (validationEvidence.length > 0) {
    addExpectedRisk(
      risks,
      'nested-model-without-valid',
      extractedRecord.fields
        .filter(
          (field) =>
            inferNestedConstraintTargets(field, extractedRecord, typeIndex).length > 0 &&
            getFieldAnnotationLines(extractedRecord, field, 'Valid').length === 0,
        )
        .map((field) => field.line),
    )
  }

  addExpectedRisk(
    risks,
    'provider-specific-validation-annotation',
    extractedRecord.imports
      .filter((entry) => entry.name.startsWith('org.hibernate.validator.constraints.'))
      .map((entry) => entry.line),
  )

  const sensitiveFields = inferSensitiveFields(extractedRecord)
  addExpectedRisk(
    risks,
    'sensitive-field-boundary',
    sensitiveFields.map((field) => field.line),
  )
  if (typeAnnotations.has('Data') || typeAnnotations.has('ToString')) {
    addExpectedRisk(
      risks,
      'sensitive-field-in-generated-to-string',
      sensitiveFields.map((field) => field.line),
    )
  }
  addExpectedRisk(
    risks,
    'sensitive-field-in-explicit-to-string',
    findSensitiveToStringLines(extractedRecord, sourceLines, sensitiveFields),
  )

  if (extractedRecord.declaredTypes.length > 1) {
    addExpectedRisk(
      risks,
      'multiple-types-in-one-file',
      extractedRecord.declaredTypes.slice(1).map((type) => type.line),
    )
  }
  addExpectedRisk(
    risks,
    'non-static-member-model',
    extractedRecord.declaredTypes
      .slice(1)
      .filter((type) => type.owner && !type.modifiers.includes('static'))
      .map((type) => type.line),
  )
  addExpectedRisk(
    risks,
    'behaviorful-data-model',
    getBehaviorMethods(extractedRecord).map((method) => method.line),
  )
  addExpectedRisk(
    risks,
    'raw-collection-field',
    extractedRecord.fields
      .filter((field) => /^(?:Collection|List|Map|Set)$/.test(field.type))
      .map((field) => field.line),
  )
  addExpectedRisk(
    risks,
    'persistence-annotation-in-transfer-model',
    extractedRecord.annotations
      .filter((annotation) => persistenceAnnotationNames.has(annotation.name))
      .map((annotation) => annotation.line),
  )
  if (profile.serialization.length > 1) {
    addExpectedRisk(
      risks,
      'mixed-serialization-contract',
      extractedRecord.annotations
        .filter((annotation) => /^(?:Json|JSON|XStream|Xml)/.test(annotation.name))
        .map((annotation) => annotation.line),
    )
  }
  addExpectedRisk(
    risks,
    'spring-component-model',
    extractedRecord.annotations
      .filter((annotation) => springComponentAnnotationNames.has(annotation.name))
      .map((annotation) => annotation.line),
  )
  const loggingLines = []
  sourceLines.forEach((line, index) => {
    if (/@Slf4j\b|\b(?:log|logger)\.(?:debug|error|info|trace|warn)\s*\(/.test(line)) {
      loggingLines.push(index + 1)
    }
  })
  addExpectedRisk(risks, 'logging-inside-model', loggingLines)
  addExpectedRisk(
    risks,
    'web-validation-coupling-in-model',
    extractedRecord.publicMethods
      .filter((method) => method.parameterTypes.some((type) => type.includes('BindingResult')))
      .map((method) => method.line),
  )

  const primaryType = extractedRecord.declaredTypes[0]
  if (primaryType?.extends.length > 0 && typeAnnotations.has('Data')) {
    addExpectedRisk(
      risks,
      'lombok-data-inheritance',
      extractedRecord.annotations
        .filter((annotation) => annotation.site === 'type' && annotation.name === 'Data')
        .map((annotation) => annotation.line),
    )
  }
  if (
    primaryType?.extends.length > 0 &&
    (typeAnnotations.has('Builder') || typeAnnotations.has('SuperBuilder'))
  ) {
    addExpectedRisk(
      risks,
      'builder-on-inherited-model',
      extractedRecord.annotations
        .filter(
          (annotation) =>
            annotation.site === 'type' && ['Builder', 'SuperBuilder'].includes(annotation.name),
        )
        .map((annotation) => annotation.line),
    )
  }
  return risks
}

/** 验证行号数组已排序、唯一且位于对应源码范围。 */
function validateLines(lines, loc, label) {
  assert(Array.isArray(lines) && lines.length > 0, `${label} 缺少源码行号`)
  assert(lines.every((line) => Number.isInteger(line) && line >= 1 && line <= loc), `${label} 行号越界`)
  assert(new Set(lines).size === lines.length, `${label} 行号重复`)
  assert([...lines].sort((left, right) => left - right).every((line, index) => line === lines[index]), `${label} 行号未排序`)
}

/** 验证字符串数组至少包含一项。 */
function validateNonEmptyStringArray(value, label) {
  assert(Array.isArray(value) && value.length > 0, `${label} 必须是非空数组`)
  assert(value.every((item) => typeof item === 'string' && item.trim()), `${label} 含空值`)
}

/** 验证单条数据模型记录与当前源码和独立推导结果一致。 */
function validateRecord(
  record,
  inventoryFile,
  extractedRecord,
  actualValidationEvidence,
  typeIndex,
  inventoryByPath,
) {
  const label = `数据模型复核记录 ${record.path ?? '<unknown>'}`
  assert(inventoryFile, `${label} 不在冻结清单中`)
  assert(extractedRecord, `${label} 缺少 Phase 1B 自动提取记录`)
  const sourcePath = path.join(sourceRepository, record.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  const sourceText = sourceBuffer.toString('utf8')
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  assert(sha256(sourceBuffer) === inventoryFile.sha256, `${label} 当前源码 SHA-256 已漂移`)
  const frozenLoc = sourceText.match(/\n/g)?.length ?? 0
  assert(frozenLoc === inventoryFile.loc, `${label} 当前源码 LOC 已漂移`)
  assert(record.inventoryIndex === inventoryFile.index, `${label} inventoryIndex 不一致`)
  assert(record.sourceSha256 === inventoryFile.sha256, `${label} sourceSha256 不一致`)
  assert(record.sourceSha256 === extractedRecord.sourceSha256, `${label} 与自动提取哈希不一致`)
  assert(record.loc === inventoryFile.loc, `${label} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${label} 状态不是 reviewed`)
  assert(record.machineRoleCandidate === extractedRecord.inferredRole.primary, `${label} 机器角色不一致`)
  assert(record.finalRole === 'data-model', `${label} 最终角色不是 data-model`)
  assert(record.modelFamily === inferModelFamily(record.path), `${label} modelFamily 不一致`)

  const profile = inferAnnotationProfile(extractedRecord)
  assert(
    JSON.stringify(record.annotationProfile) === JSON.stringify(profile),
    `${label} annotationProfile 与源码不一致`,
  )
  assert(
    JSON.stringify(record.controllerValidationEvidence) ===
      JSON.stringify(actualValidationEvidence),
    `${label} Controller 校验触发证据不一致`,
  )
  const modelShape = inferModelShape(record.path, extractedRecord, profile, actualValidationEvidence)
  assert(record.modelShape === modelShape, `${label} modelShape 与源码不一致`)
  assert(typeof record.roleDetail === 'string' && record.roleDetail.trim(), `${label} 缺少 roleDetail`)
  assert(
    typeof record.responsibility === 'string' && record.responsibility.trim(),
    `${label} 缺少 responsibility`,
  )
  assert(typeof record.boundary === 'string' && record.boundary.trim(), `${label} 缺少 boundary`)
  if (actualValidationEvidence.length > 0) {
    assert(record.boundary.includes('@Valid'), `${label} 没有说明直接校验触发`)
  }
  if (profile.validationConstraints.length > 0 && actualValidationEvidence.length === 0) {
    assert(record.boundary.includes('不能仅凭注解认定'), `${label} 没有说明约束声明不等于生效`)
  }

  const primaryType = extractedRecord.declaredTypes[0]
  const expectedStructure = {
    declaredTypeCount: extractedRecord.declaredTypes.length,
    fieldCount: extractedRecord.fields.length,
    publicMethodCount: extractedRecord.publicMethods.length,
    extends: primaryType?.extends ?? [],
    implements: primaryType?.implements ?? [],
  }
  assert(JSON.stringify(record.structure) === JSON.stringify(expectedStructure), `${label} structure 不一致`)
  validateNonEmptyStringArray(record.dependencies, `${label} dependencies`)
  validateNonEmptyStringArray(record.capabilityCandidates, `${label} capabilityCandidates`)
  assert(record.capabilityCandidates.includes('Java 类与字段封装'), `${label} 遗漏基础模型能力`)
  if (profile.validationConstraints.length > 0) {
    assert(record.capabilityCandidates.includes('Bean Validation 约束'), `${label} 遗漏校验能力`)
  }
  if (actualValidationEvidence.length > 0) {
    assert(
      record.capabilityCandidates.includes('Spring MVC 参数校验触发'),
      `${label} 遗漏 MVC 校验触发能力`,
    )
  }

  for (const evidence of actualValidationEvidence) {
    const sourceFile = inventoryByPath.get(evidence.sourcePath)
    assert(sourceFile, `${label} Controller 证据不在冻结清单中`)
    assert(evidence.line >= 1 && evidence.line <= sourceFile.loc, `${label} Controller 证据行号越界`)
  }

  const expectedRisks = inferRisks(
    extractedRecord,
    sourceLines,
    profile,
    actualValidationEvidence,
    typeIndex,
  )
  const actualRiskMap = new Map(record.riskCandidates.map((risk) => [risk.category, risk]))
  assert(actualRiskMap.size === record.riskCandidates.length, `${label} 存在重复风险类别`)
  assert(
    JSON.stringify([...actualRiskMap.keys()].sort()) === JSON.stringify([...expectedRisks.keys()].sort()),
    `${label} 风险类别与源码不一致`,
  )
  for (const [category, expectedLines] of expectedRisks) {
    const risk = actualRiskMap.get(category)
    assert(typeof risk.id === 'string' && risk.id, `${label} 风险 ${category} 缺少 ID`)
    assert(typeof risk.summary === 'string' && risk.summary.trim(), `${label} 风险 ${category} 缺少摘要`)
    validateLines(risk.lines, record.loc, `${label} 风险 ${category}`)
    assert(
      JSON.stringify(risk.lines) === JSON.stringify(expectedLines),
      `${label} 风险 ${category} 行号与源码不一致`,
    )
  }

  assert(Array.isArray(record.sourceEvidence) && record.sourceEvidence.length > 0, `${label} 缺少源码证据`)
  for (const evidence of record.sourceEvidence) {
    assert(typeof evidence.summary === 'string' && evidence.summary.trim(), `${label} 源码证据缺少摘要`)
    validateLines(evidence.lines, record.loc, `${label} 源码证据`)
  }
  assert(
    record.sourceEvidence.some((evidence) => evidence.lines.includes(primaryType?.line)),
    `${label} 源码证据没有覆盖主类型声明`,
  )
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

/** 统计风险类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 独立统计注解和结构信号。 */
function buildSignalSummary(records) {
  return {
    lombokFileCount: records.filter((record) => record.annotationProfile.lombok.length > 0).length,
    validationConstraintFileCount: records.filter(
      (record) => record.annotationProfile.validationConstraints.length > 0,
    ).length,
    directValidatedModelCount: records.filter(
      (record) => record.controllerValidationEvidence.length > 0,
    ).length,
    nestedValidFileCount: records.filter(
      (record) => record.annotationProfile.nestedValidCount > 0,
    ).length,
    swagger2FileCount: records.filter((record) => record.annotationProfile.swagger2.length > 0).length,
    serializationAnnotationFileCount: records.filter(
      (record) => record.annotationProfile.serialization.length > 0,
    ).length,
    persistenceAnnotationFileCount: records.filter(
      (record) => record.annotationProfile.persistence.length > 0,
    ).length,
    inheritedModelCount: records.filter((record) => record.structure.extends.length > 0).length,
    multipleTypeFileCount: records.filter((record) => record.structure.declaredTypeCount > 1).length,
  }
}

/** 读取前四批全部 reviewed 路径并确认累计分母。 */
function readPreviouslyReviewedPaths() {
  const startup = readJson(startupLedgerPath).records.map((record) => record.path)
  const reviews = [
    [webReviewDirectory, 'Web 入口'],
    [businessReviewDirectory, '业务层'],
    [dataAccessReviewDirectory, '数据访问'],
  ].flatMap(([directory, label]) => {
    const manifest = readJson(path.join(directory, 'manifest.json'))
    return readShardedRecords(manifest, directory, `${label} `).map((record) => record.path)
  })
  const paths = [...startup, ...reviews]
  assert(paths.length === expectedPreviouslyReviewedCount, '前四批 reviewed 数量不是 1234')
  assert(new Set(paths).size === paths.length, '前四批 reviewed 路径存在重叠')
  return new Set(paths)
}

/** 验证第 5 批数据模型台账、独立语义和累计状态。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const manualSignoff = readJson(manualSignoffPath)
  const manifest = readJson(manifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const inventoryByPath = new Map(inventory.files.map((file) => [file.path, file]))
  const expectedFiles = inventory.files.filter(isExpectedBatchFile)
  const extractedRecords = expectedFiles.map((file) => extractedByPath.get(file.path))
  const validationByPath = buildActualControllerValidationIndex(extractedByPath, extractedRecords)
  const typeIndex = buildPrimaryTypeIndex(extractedRecords)
  const records = readShardedRecords(manifest, reviewDirectory, '数据模型 ')

  assert(manifest.schemaVersion === 1, '数据模型 manifest schemaVersion 不受支持')
  assert(manifest.snapshotId === inventory.snapshotId, '数据模型 manifest snapshotId 不一致')
  assert(manifest.analysisId === extractionManifest.analysisId, '数据模型 manifest analysisId 不一致')
  assert(manifest.batchId === 'phase-1c-data-model', '数据模型 manifest batchId 不一致')
  assert(manifest.status === 'completed', '数据模型批次状态不是 completed')
  assert(manifest.reviewedAt === expectedReviewedAt, '数据模型 reviewedAt 不一致')
  validateManualSignoff(manualSignoff, manifest, records, inventory, extractionManifest)
  assert(
    JSON.stringify(manifest.batchScope.roots) === JSON.stringify(['bo', 'dto', 'eo', 'vo']),
    '数据模型物理根目录不一致',
  )
  assert(
    JSON.stringify(manifest.batchScope.javaInventoryIndexRanges) ===
      JSON.stringify(expectedInventoryIndexRanges),
    '数据模型库存索引区间不一致',
  )
  assert(manifest.shards.length === expectedShardFileCounts.length, '数据模型分片数不是 34')
  assert(
    JSON.stringify(manifest.shards.map((shard) => shard.fileCount)) ===
      JSON.stringify(expectedShardFileCounts),
    '数据模型分片记录数不符合 33*50+4',
  )
  assert(records.length === expectedBatchFileCount, '数据模型记录数不是 1654')
  assert(records.length === expectedFiles.length, '数据模型没有覆盖完整物理分母')
  assert(
    JSON.stringify(records.map((record) => record.path)) ===
      JSON.stringify(expectedFiles.map((file) => file.path)),
    '数据模型路径集合或顺序不一致',
  )
  assert(new Set(records.map((record) => record.path)).size === records.length, '数据模型路径重复')

  const previouslyReviewedPaths = readPreviouslyReviewedPaths()
  assert(
    records.every((record) => !previouslyReviewedPaths.has(record.path)),
    '数据模型与前四批路径发生重叠',
  )

  for (const record of records) {
    validateRecord(
      record,
      inventoryByPath.get(record.path),
      extractedByPath.get(record.path),
      validationByPath.get(record.path),
      typeIndex,
      inventoryByPath,
    )
  }

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
  const modelFamilyCounts = countBy(records, 'modelFamily')
  const machineRoleCandidateCounts = countBy(records, 'machineRoleCandidate')
  const finalRoleCounts = countBy(records, 'finalRole')
  const modelShapeCounts = countBy(records, 'modelShape')
  const roleCorrectionCount = records.filter(
    (record) => record.machineRoleCandidate !== record.finalRole,
  ).length
  const signals = buildSignalSummary(records)
  const risks = records.flatMap((record) => record.riskCandidates)
  const riskCategoryCounts = countRiskCategories(records)
  const expectedRiskIds = Array.from(
    { length: expectedRiskCandidateCount },
    (_, index) => `DM-${String(index + 1).padStart(4, '0')}`,
  )
  const currentAuditStatusCounts = {
    unreviewed: inventory.summary.total.fileCount - expectedReviewedTotal,
    reviewing: 0,
    reviewed: expectedReviewedTotal,
    blocked: 0,
  }

  assert(batchLoc === expectedBatchLoc, '数据模型批次 LOC 不是 58427')
  assert(declaredTypeCount === expectedDeclaredTypeCount, '数据模型类型声明数不是 1680')
  assert(fieldCount === expectedFieldCount, '数据模型字段数不是 9832')
  assert(publicMethodCount === expectedPublicMethodCount, '数据模型公开方法数不是 1531')
  assert(JSON.stringify(modelFamilyCounts) === JSON.stringify(expectedModelFamilyCounts), '模型族汇总不一致')
  assert(
    JSON.stringify(machineRoleCandidateCounts) ===
      JSON.stringify(expectedMachineRoleCandidateCounts),
    '机器角色汇总不一致',
  )
  assert(JSON.stringify(finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts), '最终角色汇总不一致')
  assert(JSON.stringify(modelShapeCounts) === JSON.stringify(expectedModelShapeCounts), '模型形态汇总不一致')
  assert(roleCorrectionCount === 7, '角色纠正数不是 7')
  assert(JSON.stringify(signals) === JSON.stringify(expectedSignals), '模型信号汇总不一致')
  assert(risks.length === expectedRiskCandidateCount, '风险候选数不一致')
  assert(
    JSON.stringify(risks.map((risk) => risk.id)) === JSON.stringify(expectedRiskIds),
    '风险 ID 必须连续且唯一',
  )
  assert(
    JSON.stringify(riskCategoryCounts) === JSON.stringify(expectedRiskCategoryCounts),
    '风险类别汇总不一致',
  )

  const expectedSummary = {
    batchFileCount: records.length,
    batchLoc,
    declaredTypeCount,
    fieldCount,
    publicMethodCount,
    modelFamilyCounts,
    machineRoleCandidateCounts,
    finalRoleCounts,
    modelShapeCounts,
    roleCorrectionCount,
    signals,
    riskCandidateCount: risks.length,
    riskCategoryCounts,
    currentAuditStatusCounts,
  }
  assert(
    JSON.stringify(manifest.summary) === JSON.stringify(expectedSummary),
    '数据模型 manifest summary 与独立统计不一致',
  )
  assert(
    Object.values(currentAuditStatusCounts).reduce((total, count) => total + count, 0) ===
      inventory.summary.total.fileCount,
    '累计状态没有覆盖冻结分母',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: manifest.batchId,
      reviewedFiles: records.length,
      batchLoc,
      modelShapeCounts,
      signalSummary: signals,
      riskCandidateCount: risks.length,
      roleCorrectionCount,
      currentAuditStatusCounts,
    }),
  )
}

main()
