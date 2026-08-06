import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { expectedCommonCodeContentSha256ByShape } from './common-code-review-content-contract.mjs'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultSignoffPath = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-common-code-signoff.json',
)
const signoffPath = process.env.DZZZ_COMMON_CODE_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_COMMON_CODE_SIGNOFF_PATH)
  : defaultSignoffPath
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-common-code')
const reviewDirectory = process.env.DZZZ_COMMON_CODE_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_COMMON_CODE_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const reviewManifestPath = path.join(reviewDirectory, 'manifest.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'
const expectedReviewedAt = '2026-08-04T08:08:37.000Z'
const expectedBatchFileCount = 257
const expectedBatchLoc = 33715
const expectedDeclaredTypeCount = 271
const expectedFieldCount = 708
const expectedPublicMethodCount = 1586
const expectedPriorReviewedCount = 3172
const expectedReviewedTotal = 3429
const expectedInventoryIndexRanges = [
  [117, 123],
  [685, 846],
  [2282, 2365],
  [3424, 3425],
  [3428, 3429],
]
const expectedRoots = ['constant', 'enums', 'util', 'compatibility']
const expectedRootCounts = { compatibility: 4, constant: 7, enums: 162, util: 84 }
const expectedMachineRoleCounts = { common: 255, 'data-model': 2 }
const expectedFinalRoleCounts = {
  'async-integration': 3,
  'business-layer': 5,
  common: 178,
  'cross-cutting': 1,
  'data-model': 10,
  infrastructure: 60,
}
const expectedShapeCounts = {
  'asymmetric-crypto-helper': 4,
  'async-audit-helper': 1,
  'authorization-header-helper': 2,
  'bean-mapping-helper': 2,
  'cache-facade': 1,
  'cache-key-builder': 1,
  'code-label-enum': 156,
  'concurrent-runtime-cache': 1,
  'configuration-facade': 1,
  'court-tree-helper': 1,
  'court-tree-model': 1,
  'date-time-helper': 2,
  'digest-signature-helper': 5,
  'document-conversion-model': 1,
  'document-conversion-orchestrator': 1,
  'domain-rule-helper': 3,
  'drag-position-model': 1,
  'embedded-crypto-material': 1,
  'enum-contract': 1,
  'error-model': 1,
  'external-service-adapter': 3,
  'file-type-inspector': 1,
  'general-purpose-helper': 1,
  'global-runtime-registry': 1,
  'handwriting-classifier': 1,
  'http-client-helper': 5,
  'identifier-generator': 3,
  'image-processing-helper': 6,
  'immutable-category-registry': 1,
  'json-marker-base': 1,
  'json-value-model': 1,
  'jwt-helper': 1,
  'legacy-video-config-singleton': 1,
  'lock-registry': 1,
  'login-data-model': 1,
  'login-request-model': 1,
  'metrics-calculator': 1,
  'multipart-file-adapter': 1,
  'office-conversion-helper': 2,
  'pdf-document-helper': 4,
  'pdf-keyword-helper': 1,
  'pdf-text-model': 2,
  'pdf-text-stripper': 1,
  'priority-executor': 1,
  'priority-future-task': 1,
  'qr-code-helper': 2,
  'reflection-cache-helper': 1,
  'region-rule-helper': 1,
  'simple-constant-holder': 4,
  'soap-client-helper': 2,
  'sql-blacklist-filter': 1,
  'static-rule-map': 1,
  'string-value-helper': 3,
  'symmetric-crypto-helper': 2,
  'system-monitor-helper': 1,
  'table-pagination-helper': 1,
  'validation-helper': 1,
  'word-document-helper': 5,
  'xml-mapping-helper': 2,
}
const expectedSignalFileCounts = {
  mutableEnumFieldLines: 126,
  enumSetterLines: 6,
  nullReturnLines: 98,
  mutableStaticStateLines: 27,
  broadCatchLines: 39,
  emptyCatchLines: 9,
  hardcodedSecretLines: 8,
  credentialLoggingLines: 1,
  weakCryptoLines: 9,
  insecureTlsLines: 1,
  legacyFileApiLines: 22,
  objectDeserializationLines: 1,
  reflectionLines: 9,
  rawConcurrencyLines: 3,
  processExecutionLines: 1,
  networkClientLines: 5,
  wholeBufferLines: 8,
  defaultCharsetLines: 11,
}
const expectedRiskCategoryCounts = {
  'broad-catch': 39,
  'credential-bearing-model': 2,
  'credential-logging': 1,
  'decompiled-compatibility-code': 4,
  'default-charset': 11,
  'empty-catch': 9,
  'enum-public-setter': 6,
  'external-client-lifecycle': 3,
  'hardcoded-secret': 8,
  'insecure-tls-validation': 1,
  'legacy-file-api': 22,
  'mutable-enum-state': 126,
  'mutable-static-state': 7,
  'network-client-lifecycle': 7,
  'non-cryptographic-random': 1,
  'nullable-enum-lookup': 76,
  'nullable-helper-contract': 22,
  'oversized-utility-surface': 3,
  'process-execution-boundary': 1,
  'raw-concurrency-lifecycle': 3,
  'reflection-contract': 9,
  'security-blacklist-filter': 1,
  'sensitive-configuration-facade': 1,
  'unbounded-archive-expansion': 1,
  'unsafe-object-deserialization': 1,
  'weak-crypto-compatibility': 9,
  'whole-payload-buffer': 4,
}
const expectedRiskCandidateCount = Object.values(expectedRiskCategoryCounts).reduce(
  (total, count) => total + count,
  0,
)
const expectedInboundUsageOccurrenceCount = 23796
const expectedOutboundUsageOccurrenceCount = 2436
const priorReviewSources = [
  { kind: 'single', path: 'phase-1c-startup-config.json' },
  { kind: 'sharded', path: 'phase-1c-web-entry' },
  { kind: 'sharded', path: 'phase-1c-business-layer' },
  { kind: 'sharded', path: 'phase-1c-data-access' },
  { kind: 'sharded', path: 'phase-1c-data-model' },
  { kind: 'sharded', path: 'phase-1c-cross-cutting' },
  { kind: 'sharded', path: 'phase-1c-async-integration' },
  { kind: 'sharded', path: 'phase-1c-infrastructure' },
]
const compatibilityPaths = new Set([
  'dzzz-app/src/main/java/com/tdh/util/FileTypeUtils.java',
  'dzzz-app/src/main/java/tdh/commons/security/web/utils/SqlFilterUtil.java',
  'dzzz-app/src/main/java/tdh/uim/client/vo/LoginData.java',
  'dzzz-app/src/main/java/tdh/uim/client/vo/LoginRequest.java',
])
const shapeGroups = {
  'simple-constant-holder': ['BlockChainConstant.java', 'Constant.java', 'ModifyType.java', 'YjbjConstant.java'],
  'embedded-crypto-material': ['EncryptConstant.java'],
  'global-runtime-registry': ['JzglConstant.java'],
  'concurrent-runtime-cache': ['TsAiRuntimeCache.java'],
  'cache-key-builder': ['TsblTextCacheKeyBuilder.java'],
  'immutable-category-registry': ['TuDmKzCategoryConstant.java'],
  'json-marker-base': ['AbstractJson.java'],
  'drag-position-model': ['DragPosition.java'],
  'enum-contract': ['IEnum.java'],
  'json-value-model': ['Jynr.java'],
  'legacy-video-config-singleton': ['VidyoDataCommon.java'],
  'symmetric-crypto-helper': ['AESUtils.java', 'DesCbcUtil.java'],
  'asymmetric-crypto-helper': ['JzRSAUtils.java', 'RSASignUtil.java', 'SM2Util.java', 'Sm2EncryptUtils.java'],
  'digest-signature-helper': ['HMacUtils.java', 'HtAsrUtils.java', 'SignatureUtil.java', 'Sm3Utils.java', 'TokenUtil.java'],
  'jwt-helper': ['JWTUtil.java'],
  'authorization-header-helper': ['GenAuthorization.java', 'WpsUtil.java'],
  'pdf-document-helper': ['AsposePdfUtils.java', 'PdfOperateUtils.java', 'PdfUtils.java', 'SpirePdfUtils.java'],
  'word-document-helper': ['AsposeUtil.java', 'WangEditorUtil.java', 'WordHtmlExportUtil.java', 'WordOperateUtils.java', 'WordUtils.java'],
  'office-conversion-helper': ['ConvertPdf.java', 'PptUtil.java'],
  'document-conversion-orchestrator': ['WordToPdfUtil.java'],
  'document-conversion-model': ['WordToPdfBO.java'],
  'pdf-text-model': ['PdfTextChar.java', 'PdfTextLine.java'],
  'pdf-text-stripper': ['PdfKeywordTextStripper.java'],
  'pdf-keyword-helper': ['PdfKeywordPositionUtil.java'],
  'image-processing-helper': ['DateImageGenerator.java', 'FingerprintMergeLayoutUtil.java', 'ImageMergerUtil.java', 'ImageRotation.java', 'ImageSizeUtil.java', 'ImageUtils.java'],
  'handwriting-classifier': ['HandwritingClassifier.java'],
  'qr-code-helper': ['TwoDimensionCode.java', 'TwoDimensionCodeImage.java'],
  'multipart-file-adapter': ['CustomMultipartFile.java'],
  'bean-mapping-helper': ['BeanUtil.java', 'FileProcessRequestUtil.java'],
  'reflection-cache-helper': ['ReflectionCacheUtil.java'],
  'general-purpose-helper': ['CommonUtil.java'],
  'string-value-helper': ['Num2CN.java', 'StringUtil.java', 'StringUtils.java'],
  'date-time-helper': ['CompareDateUtils.java', 'DateUtil.java'],
  'identifier-generator': ['CodeGenerator.java', 'UniqueIDGeneratorUtil.java', 'UniqueIdUtils.java'],
  'lock-registry': ['LockStringUtil.java'],
  'priority-future-task': ['ComparableFutureTask.java'],
  'priority-executor': ['ComparableThreadPoolExecutor.java'],
  'cache-facade': ['CacheUtil.java'],
  'region-rule-helper': ['DqUtils.java'],
  'table-pagination-helper': ['JzTabUtils.java'],
  'configuration-facade': ['TuDmKzUtil.java'],
  'domain-rule-helper': ['TsjdStageUtil.java', 'TstgUtil.java', 'Wslb09To15Util.java'],
  'soap-client-helper': ['CxfClientUtil.java', 'DynamicInvoker.java'],
  'http-client-helper': ['HttpClientUtil.java', 'HttpUtil.java', 'HttpsUtil.java', 'SSLClient.java', 'UrlDownLoadUtil.java'],
  'external-service-adapter': ['NlzxUtil.java', 'StzxUtil.java', 'ZnbaUtil.java'],
  'system-monitor-helper': ['SystemMonitorUtil.java'],
  'async-audit-helper': ['SystemLogUtil.java'],
  'validation-helper': ['ValidatorUtil.java'],
  'xml-mapping-helper': ['XmlToBeanConverter.java', 'XmlUtils.java'],
  'static-rule-map': ['SignKeywordRuleUtil.java'],
  'court-tree-helper': ['AiXntjCourtTreeHelper.java'],
  'court-tree-model': ['AiXntjCourtTreeNode.java'],
  'metrics-calculator': ['AiXntjMetricsCalculator.java'],
  'error-model': ['ErrorMessage.java'],
  'file-type-inspector': ['FileTypeUtils.java'],
  'sql-blacklist-filter': ['SqlFilterUtil.java'],
  'login-data-model': ['LoginData.java'],
  'login-request-model': ['LoginRequest.java'],
}
const shapeByFileName = new Map(
  Object.entries(shapeGroups).flatMap(([shape, fileNames]) =>
    fileNames.map((fileName) => [fileName, shape]),
  ),
)
const finalRoleGroups = {
  'async-integration': new Set(['async-audit-helper', 'priority-executor', 'priority-future-task']),
  'business-layer': new Set(['court-tree-helper', 'domain-rule-helper', 'metrics-calculator']),
  'cross-cutting': new Set(['sql-blacklist-filter']),
  'data-model': new Set([
    'court-tree-model',
    'document-conversion-model',
    'drag-position-model',
    'error-model',
    'json-marker-base',
    'json-value-model',
    'login-data-model',
    'login-request-model',
    'pdf-text-model',
  ]),
  infrastructure: new Set([
    'asymmetric-crypto-helper',
    'authorization-header-helper',
    'cache-facade',
    'concurrent-runtime-cache',
    'configuration-facade',
    'digest-signature-helper',
    'document-conversion-orchestrator',
    'embedded-crypto-material',
    'external-service-adapter',
    'file-type-inspector',
    'global-runtime-registry',
    'handwriting-classifier',
    'http-client-helper',
    'image-processing-helper',
    'jwt-helper',
    'legacy-video-config-singleton',
    'lock-registry',
    'multipart-file-adapter',
    'office-conversion-helper',
    'pdf-document-helper',
    'pdf-keyword-helper',
    'pdf-text-stripper',
    'qr-code-helper',
    'reflection-cache-helper',
    'soap-client-helper',
    'symmetric-crypto-helper',
    'system-monitor-helper',
    'word-document-helper',
    'xml-mapping-helper',
  ]),
}

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

/** 读取完成态分片并独立校验分片哈希。 */
function readShardedRecords(manifest, directory, label) {
  const records = []
  for (const shard of manifest.shards) {
    const shardPath = path.join(directory, shard.fileName)
    assert(fs.existsSync(shardPath), `${label} 缺少分片 ${shard.fileName}`)
    const content = fs.readFileSync(shardPath, 'utf8')
    assert(sha256(content) === shard.sha256, `${label} 分片 ${shard.fileName} SHA-256 不一致`)
    const shardRecords = content.trim().split('\n').map((line) => JSON.parse(line))
    assert(shardRecords.length === shard.fileCount, `${label} 分片 ${shard.fileName} 文件数不一致`)
    records.push(...shardRecords)
  }
  return records
}

/** 判断库存索引是否属于冻结的第 9 批区间。 */
function hasExpectedInventoryIndex(file) {
  return (
    file.sourceSet === 'main' &&
    expectedInventoryIndexRanges.some(([start, end]) => file.index >= start && file.index <= end)
  )
}

/** 从精确源码路径独立推导第 9 批物理根目录。 */
function deriveRoot(filePath) {
  if (compatibilityPaths.has(filePath)) return 'compatibility'
  const root = filePath.match(/\/bdzz\/(constant|enums|util)\//)?.[1]
  assert(root, `${filePath} 不属于冻结的通用代码物理根目录`)
  return root
}

/** 使用显式文件组独立推导通用代码职责形态。 */
function deriveShape(filePath, extractedRecord) {
  const mapped = shapeByFileName.get(path.basename(filePath))
  if (mapped) return mapped
  const topLevelTypes = extractedRecord.declaredTypes.filter((item) => item.owner === null)
  assert(
    filePath.includes('/bdzz/enums/') &&
      topLevelTypes.length === 1 &&
      topLevelTypes[0].kind === 'enum',
    `${filePath} 无法独立推导通用代码职责`,
  )
  return 'code-label-enum'
}

/** 从职责形态独立推导最终语义角色。 */
function deriveFinalRole(shape) {
  for (const [role, shapes] of Object.entries(finalRoleGroups)) {
    if (shapes.has(shape)) return role
  }
  return 'common'
}

/** 读取并校验一份冻结 Java 源码。 */
function readFrozenSource(file) {
  const sourceBuffer = fs.readFileSync(path.join(sourceRepository, file.path))
  assert(sha256(sourceBuffer) === file.sha256, `${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  assert((sourceText.match(/\n/g)?.length ?? 0) === file.loc, `${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  return { sourceText, sourceLines }
}

/** 返回源码中匹配表达式的稳定有效行号。 */
function scanLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return []
    pattern.lastIndex = 0
    return pattern.test(line) ? [index + 1] : []
  })
}

/** 返回空 catch 的源码行号。 */
function scanEmptyCatchLines(sourceLines) {
  const lines = []
  for (let index = 0; index < sourceLines.length; index += 1) {
    if (!/catch\s*\(/.test(sourceLines[index])) continue
    let next = index + 1
    while (next < sourceLines.length && sourceLines[next].trim() === '') next += 1
    if (sourceLines[next]?.trim() === '}') lines.push(index + 1)
  }
  return lines
}

/** 从冻结字段声明独立识别源码内嵌的敏感字面量。 */
function deriveHardcodedSecretLines(extractedRecord, sourceLines) {
  return extractedRecord.fields
    .filter((field) => {
      if (/(?:_NAME|_ID)$/i.test(field.name)) return false
      return /(?:secret|password|private_?key|^key$)/i.test(field.name)
    })
    .filter((field) => /=\s*"[^"\n]{6,}"/.test(sourceLines[field.line - 1] ?? ''))
    .map((field) => field.line)
    .sort((left, right) => left - right)
}

/** 从去除字符串字面量后的日志语句独立识别敏感变量输出。 */
function deriveCredentialLoggingLines(sourceLines) {
  const sensitiveIdentifier =
    /\b[A-Za-z_$][\w$]*(?:accessKey|secret|password|passwd|pwd|token|privateKey)[\w$]*\b/i
  return sourceLines.flatMap((line, index) => {
    const codeOnly = line.replace(/"(?:\\.|[^"\\])*"/g, '')
    if (!/\b[A-Za-z_$][\w$]*\.(?:trace|debug|info|warn|error)\s*\(/.test(codeOnly)) return []
    return sensitiveIdentifier.test(codeOnly) ? [index + 1] : []
  })
}

/** 独立提取通用代码执行与生命周期信号。 */
function deriveSignals(extractedRecord, sourceLines) {
  const enumOwners = new Set(
    extractedRecord.declaredTypes.filter((item) => item.kind === 'enum').map((item) => item.qualifiedName),
  )
  return {
    mutableEnumFieldLines: extractedRecord.fields
      .filter((field) => enumOwners.has(field.owner) && !field.modifiers.includes('final'))
      .map((field) => field.line)
      .sort((left, right) => left - right),
    enumSetterLines: extractedRecord.publicMethods
      .filter((method) => enumOwners.has(method.owner) && /^set[A-Z]/.test(method.name))
      .map((method) => method.line)
      .sort((left, right) => left - right),
    nullReturnLines: scanLines(sourceLines, /\breturn\s+null\s*;/),
    mutableStaticStateLines: extractedRecord.fields
      .filter(
        (field) =>
          field.modifiers.includes('static') &&
          (!field.modifiers.includes('final') || /(?:Map|List|Set|Collection|ExpiringMap)/.test(field.type)),
      )
      .map((field) => field.line)
      .sort((left, right) => left - right),
    broadCatchLines: scanLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/),
    emptyCatchLines: scanEmptyCatchLines(sourceLines),
    hardcodedSecretLines: deriveHardcodedSecretLines(extractedRecord, sourceLines),
    credentialLoggingLines: deriveCredentialLoggingLines(sourceLines),
    weakCryptoLines: scanLines(
      sourceLines,
      /(?:MD5|SHA-1|DESede|\bDES\b|RSA\/ECB\/PKCS1Padding)/i,
    ),
    insecureTlsLines: scanLines(
      sourceLines,
      /(?:X509TrustManager|ALLOW_ALL_HOSTNAME_VERIFIER|TrustAllStrategy|NoopHostnameVerifier)/,
    ),
    legacyFileApiLines: scanLines(
      sourceLines,
      /(?:new\s+File\s*\(|FileInputStream|FileOutputStream|FileReader|FileWriter|\.delete\s*\(|renameTo\s*\()/,
    ),
    objectDeserializationLines: scanLines(sourceLines, /(?:ObjectInputStream|\.readObject\s*\()/),
    reflectionLines: scanLines(
      sourceLines,
      /(?:Class\.forName|\.getDeclared(?:Field|Fields|Method|Methods)|\.getMethod\s*\(|\.invoke\s*\(|setAccessible\s*\()/,
    ),
    rawConcurrencyLines: scanLines(
      sourceLines,
      /(?:new\s+Thread\s*\(|Executors\.new|new\s+ThreadPoolExecutor\s*\(|extends\s+ThreadPoolExecutor)/,
    ),
    processExecutionLines: scanLines(
      sourceLines,
      /(?:Runtime\.getRuntime\(\)\.exec|new\s+ProcessBuilder\s*\()/,
    ),
    networkClientLines: scanLines(
      sourceLines,
      /(?:HttpClients\.|new\s+SSLClient\s*\(|new\s+RestTemplate\s*\(|new\s+OSSClient\s*\(|openConnection\s*\(|new\s+URL\s*\()/,
    ),
    wholeBufferLines: scanLines(
      sourceLines,
      /(?:ByteArrayOutputStream|IOUtils\.toByteArray|readAllBytes\s*\(|\.available\s*\(\))/,
    ),
    defaultCharsetLines: scanLines(
      sourceLines,
      /(?:\.getBytes\(\)|new\s+String\([^,;]+\)|new\s+FileReader\s*\(|new\s+FileWriter\s*\()/,
    ),
  }
}

/** 向独立风险结果追加一条非空证据。 */
function appendRisk(risks, category, lines) {
  const normalized = [...new Set(lines)].filter(Number.isInteger).sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized })
}

/** 根据当前源码独立复算风险类别和精确行号。 */
function deriveRisks(extractedRecord, sourceText, sourceLines, shape, signals) {
  const risks = []
  const topLine = extractedRecord.declaredTypes.find((item) => item.owner === null)?.line
  appendRisk(risks, 'broad-catch', signals.broadCatchLines)
  appendRisk(risks, 'empty-catch', signals.emptyCatchLines)
  appendRisk(risks, 'hardcoded-secret', signals.hardcodedSecretLines)
  appendRisk(risks, 'credential-logging', signals.credentialLoggingLines)
  appendRisk(risks, 'weak-crypto-compatibility', signals.weakCryptoLines)
  appendRisk(risks, 'insecure-tls-validation', signals.insecureTlsLines)
  appendRisk(risks, 'legacy-file-api', signals.legacyFileApiLines)
  appendRisk(risks, 'unsafe-object-deserialization', signals.objectDeserializationLines)
  appendRisk(risks, 'reflection-contract', signals.reflectionLines)
  appendRisk(risks, 'raw-concurrency-lifecycle', signals.rawConcurrencyLines)
  appendRisk(risks, 'process-execution-boundary', signals.processExecutionLines)
  appendRisk(risks, 'default-charset', signals.defaultCharsetLines)
  if (shape === 'code-label-enum' || shape === 'legacy-video-config-singleton') {
    appendRisk(risks, 'mutable-enum-state', signals.mutableEnumFieldLines)
    appendRisk(risks, 'enum-public-setter', signals.enumSetterLines)
    appendRisk(risks, 'nullable-enum-lookup', signals.nullReturnLines)
  } else appendRisk(risks, 'nullable-helper-contract', signals.nullReturnLines)
  if (
    [
      'global-runtime-registry',
      'concurrent-runtime-cache',
      'legacy-video-config-singleton',
      'reflection-cache-helper',
      'lock-registry',
      'cache-facade',
      'async-audit-helper',
      'sql-blacklist-filter',
    ].includes(shape)
  ) {
    appendRisk(risks, 'mutable-static-state', signals.mutableStaticStateLines)
  }
  if (shape === 'http-client-helper' || shape === 'soap-client-helper') {
    appendRisk(
      risks,
      'network-client-lifecycle',
      signals.networkClientLines.length > 0 ? signals.networkClientLines : [topLine],
    )
  }
  if (shape === 'external-service-adapter') {
    appendRisk(
      risks,
      'external-client-lifecycle',
      signals.networkClientLines.length > 0 ? signals.networkClientLines : [topLine],
    )
  }
  if (
    [
      'pdf-document-helper',
      'word-document-helper',
      'office-conversion-helper',
      'image-processing-helper',
      'qr-code-helper',
      'general-purpose-helper',
    ].includes(shape)
  ) {
    appendRisk(risks, 'whole-payload-buffer', signals.wholeBufferLines)
  }
  if (shape === 'general-purpose-helper' && /ZipInputStream/.test(sourceText)) {
    appendRisk(risks, 'unbounded-archive-expansion', [
      extractedRecord.publicMethods.find((method) => method.name === 'deCompress')?.line,
      ...scanLines(sourceLines, /ZipInputStream/),
    ])
  }
  if (shape === 'identifier-generator') {
    appendRisk(
      risks,
      'non-cryptographic-random',
      scanLines(sourceLines, /(?:new\s+Random\s*\(|Math\.random\s*\()/),
    )
  }
  if (shape === 'configuration-facade') {
    appendRisk(
      risks,
      'sensitive-configuration-facade',
      extractedRecord.publicMethods
        .filter((method) => /(?:Secret|Pwd|Password|Key|Token|Sqm)/i.test(method.name))
        .map((method) => method.line),
    )
  }
  if (shape === 'sql-blacklist-filter') {
    appendRisk(
      risks,
      'security-blacklist-filter',
      scanLines(sourceLines, /(?:scriptKeyWords|sqlPatternList|lowerCase\.contains|pattern\.matcher)/),
    )
  }
  if (shape === 'login-data-model' || shape === 'login-request-model') {
    appendRisk(
      risks,
      'credential-bearing-model',
      extractedRecord.fields
        .filter((field) => /(?:password|yhkl|jmkl|md5|sessionToken)/i.test(field.name))
        .map((field) => field.line),
    )
  }
  if (['general-purpose-helper', 'region-rule-helper', 'configuration-facade'].includes(shape)) {
    appendRisk(risks, 'oversized-utility-surface', [topLine])
  }
  if (/Source code recreated from a \.class file|JD-Core Version/.test(sourceText)) {
    appendRisk(risks, 'decompiled-compatibility-code', [topLine])
  }
  return risks
}

/** 独立压缩 Phase 1B 内部使用边。 */
function deriveUsageEvidence(extractedRecord) {
  /** 将内部关系候选投影为稳定的使用证据字段。 */
  const project = (candidate) => ({
    kind: candidate.kind,
    sourcePath: candidate.sourcePath,
    sourceSymbol: candidate.sourceSymbol,
    targetPath: candidate.targetPath,
    targetSymbol: candidate.targetSymbol,
    occurrences: candidate.occurrences,
    lines: candidate.lines,
  })
  const inbound = extractedRecord.codeGraph.internalInboundCandidates.map(project)
  const outbound = extractedRecord.codeGraph.internalOutboundCandidates.map(project)
  return {
    inbound,
    outbound,
    inboundOccurrenceCount: inbound.reduce((total, item) => total + item.occurrences, 0),
    outboundOccurrenceCount: outbound.reduce((total, item) => total + item.occurrences, 0),
  }
}

/** 独立计算框架、标准库和关键第三方依赖。 */
function deriveDependencies(extractedRecord) {
  const values = new Set(extractedRecord.frameworkUsages.map((usage) => usage.id))
  for (const imported of extractedRecord.imports) {
    if (
      /^(?:java\.(?:io|nio|net|security|time|util\.concurrent|lang\.reflect)|javax\.(?:crypto|servlet|xml)|org\.(?:springframework|apache|bouncycastle)|com\.(?:aspose|spire|aliyun)|ai\.djl)/.test(
        imported.name,
      )
    ) {
      values.add(imported.name)
    }
  }
  return [...values].sort((left, right) => left.localeCompare(right))
}

/** 独立计算源码证据应覆盖的行号。 */
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

/** 验证一组源码证据行号有效。 */
function validateLines(lines, loc, label) {
  assert(Array.isArray(lines) && lines.length > 0, `${label} 缺少源码行号`)
  assert(
    lines.every((line) => Number.isInteger(line) && line >= 1 && line <= loc),
    `${label} 行号越界`,
  )
}

/** 验证单条通用代码记录的身份、职责、信号和风险。 */
function validateRecord(record, file, extractedRecord) {
  const { sourceText, sourceLines } = readFrozenSource(file)
  const root = deriveRoot(file.path)
  const shape = deriveShape(file.path, extractedRecord)
  const role = deriveFinalRole(shape)
  const signals = deriveSignals(extractedRecord, sourceLines)
  const primaryType = extractedRecord.declaredTypes.find((item) => item.owner === null)
  assert(record.inventoryIndex === file.index, `${file.path} inventoryIndex 不一致`)
  assert(record.path === file.path, `${file.path} 路径不一致`)
  assert(record.sourceSha256 === file.sha256, `${file.path} 记录源码哈希不一致`)
  assert(record.loc === file.loc, `${file.path} 记录 LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${file.path} 未处于 reviewed`)
  assert(record.machineRoleCandidate === extractedRecord.inferredRole.primary, `${file.path} 机器角色不一致`)
  assert(record.commonCodeRoot === root, `${file.path} 物理根目录不一致`)
  assert(record.commonCodeShape === shape, `${file.path} 职责形态不一致`)
  assert(record.finalRole === role, `${file.path} 最终角色不一致`)
  const contentHash = sha256(
    JSON.stringify({
      roleDetail: record.roleDetail,
      responsibility: record.responsibility,
      lifecycle: record.lifecycle,
      capabilityCandidates: record.capabilityCandidates,
    }),
  )
  assert(
    contentHash === expectedCommonCodeContentSha256ByShape[shape],
    `${file.path} 职责内容语义不一致`,
  )
  const expectedStructure = {
    declaredTypeCount: extractedRecord.declaredTypes.length,
    fieldCount: extractedRecord.fields.length,
    publicMethodCount: extractedRecord.publicMethods.length,
    primaryTypeKind: primaryType?.kind,
    extends: primaryType?.extends ?? [],
    implements: primaryType?.implements ?? [],
  }
  assert(JSON.stringify(record.structure) === JSON.stringify(expectedStructure), `${file.path} 结构不一致`)
  const annotationNames = [...new Set(extractedRecord.annotations.map((item) => item.name))].sort()
  assert(
    JSON.stringify(record.annotationProfile) === JSON.stringify({ names: annotationNames }),
    `${file.path} 注解不一致`,
  )
  assert(JSON.stringify(record.commonCodeSignals) === JSON.stringify(signals), `${file.path} 信号不一致`)
  assert(
    JSON.stringify(record.frameworkUsages) ===
      JSON.stringify(extractedRecord.frameworkUsages.map((usage) => usage.id).sort()),
    `${file.path} 框架使用不一致`,
  )
  assert(
    JSON.stringify(record.usageEvidence) === JSON.stringify(deriveUsageEvidence(extractedRecord)),
    `${file.path} 使用边不一致`,
  )
  assert(
    JSON.stringify(record.dependencies) === JSON.stringify(deriveDependencies(extractedRecord)),
    `${file.path} 依赖不一致`,
  )
  const risks = deriveRisks(extractedRecord, sourceText, sourceLines, shape, signals)
  assert(record.riskCandidates.length === risks.length, `${file.path} 风险数量不一致`)
  for (let index = 0; index < risks.length; index += 1) {
    const actual = record.riskCandidates[index]
    const expected = risks[index]
    assert(actual.category === expected.category, `${file.path} 风险类别不一致`)
    assert(JSON.stringify(actual.lines) === JSON.stringify(expected.lines), `${file.path} 风险行号不一致`)
    assert(typeof actual.summary === 'string' && actual.summary.length > 0, `${file.path} 风险说明为空`)
    validateLines(actual.lines, file.loc, `${file.path} ${actual.category}`)
  }
  const evidenceLines = deriveSourceEvidenceLines(extractedRecord, signals)
  assert(record.sourceEvidence.length === 1, `${file.path} 源码证据数量不一致`)
  assert(
    JSON.stringify(record.sourceEvidence[0].lines) === JSON.stringify(evidenceLines),
    `${file.path} 源码证据不一致`,
  )
  assert(record.sourceEvidence[0].summary.length > 0, `${file.path} 源码证据说明为空`)
  validateLines(record.sourceEvidence[0].lines, file.loc, `${file.path} sourceEvidence`)
}

/** 统计记录指定字段的值。 */
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

/** 读取前八批 reviewed 路径并验证累计分母。 */
function readPriorReviewedPaths() {
  const reviewed = new Set()
  for (const source of priorReviewSources) {
    const sourcePath = path.join(auditDirectory, 'reviews', source.path)
    if (source.kind === 'single') {
      for (const record of readJson(sourcePath).records) reviewed.add(record.path)
      continue
    }
    const manifest = readJson(path.join(sourcePath, 'manifest.json'))
    for (const record of readShardedRecords(manifest, sourcePath, source.path)) {
      reviewed.add(record.path)
    }
  }
  assert(reviewed.size === expectedPriorReviewedCount, '前八批 reviewed 路径累计不一致')
  return reviewed
}

/** 从完成态记录重建签核前 reviewing 候选分片。 */
function rebuildCandidateShards(records) {
  const shards = []
  for (let offset = 0; offset < records.length; offset += 50) {
    const candidates = records.slice(offset, offset + 50).map((record) => ({
      ...record,
      auditStatus: 'reviewing',
    }))
    const fileName = `records-${String(offset + 1).padStart(4, '0')}-${String(offset + candidates.length).padStart(4, '0')}.jsonl`
    const content = `${candidates.map((record) => JSON.stringify(record)).join('\n')}\n`
    shards.push({ fileName, fileCount: candidates.length, sha256: sha256(content) })
  }
  return shards
}

/** 验证人工签核绑定当前候选分片和冻结身份。 */
function validateSignoff(signoff, manifest, records, inventory, extractionManifest) {
  assert(signoff.schemaVersion === 1, '通用代码签核 schemaVersion 不受支持')
  assert(signoff.snapshotId === inventory.snapshotId, '通用代码签核 snapshotId 不一致')
  assert(signoff.analysisId === extractionManifest.analysisId, '通用代码签核 analysisId 不一致')
  assert(signoff.batchId === 'phase-1c-common-code', '通用代码签核 batchId 不一致')
  assert(signoff.status === 'approved', '通用代码签核状态不是 approved')
  assert(signoff.reviewedAt === expectedReviewedAt, '通用代码签核 reviewedAt 不一致')
  assert(signoff.reviewedBy && signoff.reviewerType, '通用代码签核缺少复核身份')
  const expectedShards = rebuildCandidateShards(records).map((shard) => ({
    ...shard,
    decision: 'approved',
  }))
  assert(JSON.stringify(signoff.shards) === JSON.stringify(expectedShards), '通用代码签核分片绑定不一致')
  assert(signoff.summary.approvedFileCount === expectedBatchFileCount, '通用代码签核文件数不一致')
  assert(signoff.summary.approvedLoc === expectedBatchLoc, '通用代码签核 LOC 不一致')
  assert(signoff.summary.approvedShardCount === expectedShards.length, '通用代码签核分片数不一致')
  assert(manifest.manualReviewSignoff.sha256 === sha256(fs.readFileSync(signoffPath)), '签核文件哈希不一致')
  assert(manifest.manualReviewSignoff.reviewedBy === signoff.reviewedBy, '签核 reviewedBy 不一致')
  assert(manifest.manualReviewSignoff.reviewerType === signoff.reviewerType, '签核 reviewerType 不一致')
  assert(
    manifest.manualReviewSignoff.approvedShardCount === expectedShards.length,
    '签核 approvedShardCount 不一致',
  )
}

/** 独立构建完成态分片摘要。 */
function deriveCompletedShardSummaries(records) {
  const shards = []
  for (let offset = 0; offset < records.length; offset += 50) {
    const shardRecords = records.slice(offset, offset + 50)
    const fileName = `records-${String(offset + 1).padStart(4, '0')}-${String(offset + shardRecords.length).padStart(4, '0')}.jsonl`
    const content = fs.readFileSync(path.join(reviewDirectory, fileName), 'utf8')
    shards.push({
      fileName,
      fileCount: shardRecords.length,
      firstInventoryIndex: shardRecords[0].inventoryIndex,
      lastInventoryIndex: shardRecords.at(-1).inventoryIndex,
      firstPath: shardRecords[0].path,
      lastPath: shardRecords.at(-1).path,
      sha256: sha256(content),
    })
  }
  return shards
}

/** 验证 Phase 1C 第 9 批通用代码完成态台账。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const manifest = readJson(reviewManifestPath)
  const signoff = readJson(signoffPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const files = inventory.files.filter(hasExpectedInventoryIndex)
  assert(files.length === expectedBatchFileCount, '第 9 批独立库存文件数不一致')
  assert(files.reduce((total, file) => total + file.loc, 0) === expectedBatchLoc, '第 9 批独立 LOC 不一致')
  const records = readShardedRecords(manifest, reviewDirectory, 'phase-1c-common-code')
  assert(records.length === expectedBatchFileCount, '第 9 批完成态记录数不一致')
  const priorReviewedPaths = readPriorReviewedPaths()
  const seenPaths = new Set()
  let expectedRiskSequence = 0
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    const record = records[index]
    assert(!priorReviewedPaths.has(file.path), `${file.path} 与前八批重复`)
    assert(!seenPaths.has(file.path), `${file.path} 在第 9 批重复`)
    seenPaths.add(file.path)
    const extractedRecord = extractedByPath.get(file.path)
    assert(extractedRecord, `${file.path} 缺少 Phase 1B 记录`)
    validateRecord(record, file, extractedRecord)
    for (const risk of record.riskCandidates) {
      expectedRiskSequence += 1
      assert(
        risk.id === `CC-${String(expectedRiskSequence).padStart(4, '0')}`,
        `${file.path} 风险 ID 不连续`,
      )
    }
  }
  assert(expectedRiskSequence === expectedRiskCandidateCount, '第 9 批风险总数不一致')
  assert(manifest.schemaVersion === 1, '第 9 批 manifest schemaVersion 不受支持')
  assert(manifest.snapshotId === inventory.snapshotId, '第 9 批 manifest snapshotId 不一致')
  assert(manifest.analysisId === extractionManifest.analysisId, '第 9 批 manifest analysisId 不一致')
  assert(manifest.batchId === 'phase-1c-common-code', '第 9 批 manifest batchId 不一致')
  assert(manifest.status === 'completed', '第 9 批 manifest 未完成')
  assert(manifest.reviewedAt === expectedReviewedAt, '第 9 批 reviewedAt 不一致')
  assert(JSON.stringify(manifest.batchScope.roots) === JSON.stringify(expectedRoots), '第 9 批根目录不一致')
  assert(
    JSON.stringify(manifest.batchScope.javaInventoryIndexRanges) ===
      JSON.stringify(expectedInventoryIndexRanges),
    '第 9 批库存区间不一致',
  )
  assert(
    manifest.batchScope.excludedReviewedPaths === expectedPriorReviewedCount,
    '第 9 批排除路径数不一致',
  )
  const summary = manifest.summary
  assert(summary.batchFileCount === expectedBatchFileCount, '第 9 批 summary 文件数不一致')
  assert(summary.batchLoc === expectedBatchLoc, '第 9 批 summary LOC 不一致')
  assert(summary.declaredTypeCount === expectedDeclaredTypeCount, '第 9 批声明类型数不一致')
  assert(summary.fieldCount === expectedFieldCount, '第 9 批字段数不一致')
  assert(summary.publicMethodCount === expectedPublicMethodCount, '第 9 批公开方法数不一致')
  assert(JSON.stringify(summary.rootCounts) === JSON.stringify(expectedRootCounts), '第 9 批根目录计数不一致')
  assert(
    JSON.stringify(summary.machineRoleCandidateCounts) === JSON.stringify(expectedMachineRoleCounts),
    '第 9 批机器角色计数不一致',
  )
  assert(
    JSON.stringify(summary.finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts),
    '第 9 批最终角色计数不一致',
  )
  assert(JSON.stringify(summary.commonCodeShapeCounts) === JSON.stringify(expectedShapeCounts), '职责形态计数不一致')
  assert(summary.roleCorrectionCount === 77, '第 9 批角色纠正数不一致')
  assert(
    JSON.stringify(summary.signalFileCounts) === JSON.stringify(expectedSignalFileCounts),
    '第 9 批信号文件计数不一致',
  )
  assert(
    summary.inboundUsageOccurrenceCount === expectedInboundUsageOccurrenceCount &&
      summary.outboundUsageOccurrenceCount === expectedOutboundUsageOccurrenceCount,
    '第 9 批使用出现次数不一致',
  )
  assert(summary.riskCandidateCount === expectedRiskCandidateCount, '第 9 批风险候选总数不一致')
  assert(
    JSON.stringify(summary.riskCategoryCounts) === JSON.stringify(expectedRiskCategoryCounts),
    '第 9 批风险类别计数不一致',
  )
  assert(
    JSON.stringify(countRiskCategories(records)) === JSON.stringify(expectedRiskCategoryCounts),
    '第 9 批记录风险统计不一致',
  )
  assert(JSON.stringify(countBy(records, 'commonCodeRoot')) === JSON.stringify(expectedRootCounts), '记录根目录统计不一致')
  assert(JSON.stringify(countBy(records, 'finalRole')) === JSON.stringify(expectedFinalRoleCounts), '记录最终角色统计不一致')
  assert(
    JSON.stringify(summary.currentAuditStatusCounts) ===
      JSON.stringify({ unreviewed: 7, reviewing: 0, reviewed: expectedReviewedTotal, blocked: 0 }),
    '第 9 批累计审计状态不一致',
  )
  assert(
    JSON.stringify(manifest.shards) === JSON.stringify(deriveCompletedShardSummaries(records)),
    '第 9 批完成态分片摘要不一致',
  )
  validateSignoff(signoff, manifest, records, inventory, extractionManifest)
  assert(new Set([...priorReviewedPaths, ...seenPaths]).size === expectedReviewedTotal, '主代码累计 reviewed 分母不一致')
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: manifest.batchId,
      batchFileCount: records.length,
      batchLoc: expectedBatchLoc,
      riskCandidateCount: expectedRiskSequence,
      currentAuditStatusCounts: summary.currentAuditStatusCounts,
    }),
  )
}

main()
