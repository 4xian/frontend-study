import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { expectedInfrastructureContentSha256ByShape } from './infrastructure-review-content-contract.mjs'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultSignoffPath = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-infrastructure-signoff.json',
)
const signoffPath = process.env.DZZZ_INFRASTRUCTURE_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_INFRASTRUCTURE_SIGNOFF_PATH)
  : defaultSignoffPath
const defaultReviewDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-infrastructure')
const reviewDirectory = process.env.DZZZ_INFRASTRUCTURE_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_INFRASTRUCTURE_REVIEW_DIRECTORY)
  : defaultReviewDirectory
const reviewManifestPath = path.join(reviewDirectory, 'manifest.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'
const priorReviewSources = [
  { kind: 'single', path: 'phase-1c-startup-config.json', label: '启动与配置' },
  { kind: 'sharded', path: 'phase-1c-web-entry', label: 'Web 入口' },
  { kind: 'sharded', path: 'phase-1c-business-layer', label: '业务层' },
  { kind: 'sharded', path: 'phase-1c-data-access', label: '数据访问' },
  { kind: 'sharded', path: 'phase-1c-data-model', label: '数据模型' },
  { kind: 'sharded', path: 'phase-1c-cross-cutting', label: '横切能力' },
  { kind: 'sharded', path: 'phase-1c-async-integration', label: '异步能力' },
]

const expectedReviewedAt = '2026-08-04T05:45:32.000Z'
const expectedBatchFileCount = 53
const expectedBatchLoc = 6175
const expectedDeclaredTypeCount = 55
const expectedFieldCount = 165
const expectedPublicMethodCount = 272
const expectedPriorReviewedCount = 3119
const expectedReviewedTotal = 3172
const expectedInventoryIndexRanges = [
  [66, 83],
  [395, 401],
  [1126, 1128],
  [1752, 1753],
  [2092, 2101],
  [2271, 2281],
  [3426, 3427],
]
const expectedRoots = [
  'cache',
  'download',
  'media',
  'logging',
  'shard',
  'storage',
  'upload',
  'license',
]
const expectedRootCounts = {
  cache: 18,
  download: 7,
  license: 2,
  logging: 2,
  media: 3,
  shard: 5,
  storage: 5,
  upload: 11,
}
const expectedMachineRoleCounts = { infrastructure: 39, unclassified: 14 }
const expectedFinalRoleCounts = {
  'async-integration': 3,
  'data-access': 5,
  'data-model': 7,
  infrastructure: 38,
}
const expectedShapeCounts = {
  'download-adapter': 4,
  'download-contract': 1,
  'download-orchestrator': 1,
  'download-result-model': 1,
  'ftp-transfer-client': 1,
  'license-adapter': 1,
  'license-model': 1,
  'logback-file-appender': 1,
  'logback-rolling-policy': 1,
  'media-converter-contract': 1,
  'media-converter-worker': 2,
  'moss-object-storage-client': 1,
  'mybatis-table-shard-interceptor': 1,
  'nio-file-helper': 1,
  's3-object-storage-client': 1,
  'shard-data-contract': 1,
  'shard-data-reflection-adapter': 1,
  'startup-cache-loader': 18,
  'storage-transfer-model': 5,
  'table-shard-strategy': 1,
  'table-shard-strategy-contract': 1,
  'transfer-progress-callback': 1,
  'upload-adapter': 4,
  'upload-contract': 1,
  'upload-orchestrator': 1,
}
const expectedSignalFileCounts = {
  commandLineRunnerLines: 18,
  staticCollectionLines: 19,
  rawThreadLines: 2,
  blockingSleepLines: 2,
  reflectionLines: 1,
  sqlRewriteLines: 1,
  externalClientLines: 7,
  pathBoundaryLines: 11,
  legacyFileApiLines: 8,
}
const expectedRiskCategoryCounts = {
  'blocking-sleep': 2,
  'broad-catch': 12,
  'empty-catch': 2,
  'external-client-lifecycle': 3,
  'field-injection': 18,
  'file-path-boundary': 11,
  'in-memory-file-payload': 7,
  'in-memory-media-buffer': 2,
  'legacy-file-api': 8,
  'legacy-license-compatibility': 2,
  'legacy-misspelled-contract': 2,
  'license-missing-fail-open': 1,
  'license-validation-state': 1,
  'mutable-static-cache': 18,
  'raw-thread': 2,
  'reflection-based-shard-injection': 1,
  'sensitive-configuration-model': 1,
  'sensitive-integration-log': 4,
  'service-locator': 3,
  'shared-stream-subscriber-state': 2,
  'sneaky-throws-log-config': 2,
  'sql-rewrite-interceptor': 1,
  'startup-cache-load': 18,
  'stateful-ftp-client': 1,
  'success-state-overwrite': 1,
  'unimplemented-adapter-null-result': 1,
}
const expectedRiskCandidateCount = Object.values(expectedRiskCategoryCounts).reduce(
  (total, count) => total + count,
  0,
)

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

/** 读取一个完成态分片目录并独立校验分片哈希。 */
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
  assert(
    JSON.stringify(fs.readdirSync(directory).sort()) === JSON.stringify([...expectedFiles].sort()),
    `${label}目录包含未登记文件`,
  )
  return records
}

/** 判断库存索引是否属于冻结的第 8 批区间。 */
function hasExpectedInventoryIndex(file) {
  return expectedInventoryIndexRanges.some(
    ([first, last]) => file.index >= first && file.index <= last,
  )
}

/** 从精确源码路径独立推导第 8 批物理根目录。 */
function deriveRoot(filePath) {
  if (filePath.includes('/factories/flv/')) return 'media'
  if (filePath.includes('/rolling/')) return 'logging'
  if (filePath.includes('/license/lic/')) return 'license'
  const root = filePath.match(/\/bdzz\/(cache|download|shard|storage|upload)\//)?.[1]
  if (!root) throw new Error(`${filePath} 不符合第 8 批物理路径`)
  return root
}

/** 使用显式文件组独立推导基础设施职责形态。 */
function deriveShape(filePath) {
  const fileName = path.basename(filePath)
  const root = deriveRoot(filePath)
  if (root === 'cache') return 'startup-cache-loader'
  if (root === 'download') {
    const shapes = {
      'DownloadResponse.java': 'download-result-model',
      'DownloadUtil.java': 'download-orchestrator',
      'Downloader.java': 'download-contract',
    }
    return shapes[fileName] ?? 'download-adapter'
  }
  if (root === 'media') {
    return fileName === 'Converter.java' ? 'media-converter-contract' : 'media-converter-worker'
  }
  if (root === 'logging') {
    return fileName === 'InnerProjectRollingFileAppender.java'
      ? 'logback-file-appender'
      : 'logback-rolling-policy'
  }
  if (root === 'shard') {
    const shapes = {
      'AjbsShardStrategy.java': 'table-shard-strategy',
      'DefaultAutowiredShardData.java': 'shard-data-reflection-adapter',
      'IAutowiredShardData.java': 'shard-data-contract',
      'IShardStrategy.java': 'table-shard-strategy-contract',
      'TableShardInterceptor.java': 'mybatis-table-shard-interceptor',
    }
    assert(shapes[fileName], `${filePath} 缺少独立分表职责映射`)
    return shapes[fileName]
  }
  if (root === 'storage') {
    const shapes = {
      'FtpWork.java': 'ftp-transfer-client',
      'MossClientUtil.java': 'moss-object-storage-client',
      'NioUtil.java': 'nio-file-helper',
      'S3Utils.java': 's3-object-storage-client',
      'StorageProcessListener.java': 'transfer-progress-callback',
    }
    assert(shapes[fileName], `${filePath} 缺少独立存储职责映射`)
    return shapes[fileName]
  }
  if (root === 'upload') {
    if (
      [
        'LocalFile.java',
        'OssServer.java',
        'RemoteFile.java',
        'StorageInfo.java',
        'UploadResponse.java',
      ].includes(fileName)
    ) {
      return 'storage-transfer-model'
    }
    if (fileName === 'Uploader.java') return 'upload-contract'
    if (fileName === 'UploadUtil.java') return 'upload-orchestrator'
    return 'upload-adapter'
  }
  return fileName === 'License.java' ? 'license-model' : 'license-adapter'
}

/** 结合源码声明独立推导最终语义角色。 */
function deriveFinalRole(shape, filePath, extractedRecord, sourceLines) {
  const topLevelTypes = extractedRecord.declaredTypes.filter((type) => type.owner === null)
  const sourceText = sourceLines.join('\n')
  if (shape === 'startup-cache-loader') {
    assert(
      topLevelTypes.some((type) => type.implements.includes('CommandLineRunner')),
      `${filePath} 缺少 CommandLineRunner 证据`,
    )
    return 'infrastructure'
  }
  if (shape === 'media-converter-contract') {
    assert(
      topLevelTypes.some((type) => type.kind === 'interface'),
      `${filePath} 不是媒体合同`,
    )
    return 'async-integration'
  }
  if (shape === 'media-converter-worker') {
    assert(
      topLevelTypes.some(
        (type) => type.extends.includes('Thread') && type.implements.includes('Converter'),
      ),
      `${filePath} 不是媒体工作线程`,
    )
    return 'async-integration'
  }
  if (
    shape.startsWith('table-shard') ||
    shape.startsWith('shard-data') ||
    shape === 'mybatis-table-shard-interceptor'
  ) {
    assert(/Shard|StatementHandler|Interceptor/.test(sourceText), `${filePath} 缺少分表证据`)
    return 'data-access'
  }
  if (['download-result-model', 'storage-transfer-model', 'license-model'].includes(shape)) {
    assert(
      topLevelTypes.some((type) => type.kind === 'class') && extractedRecord.fields.length > 0,
      `${filePath} 缺少模型字段证据`,
    )
    return 'data-model'
  }
  if (shape.endsWith('-contract')) {
    assert(
      topLevelTypes.some((type) => type.kind === 'interface'),
      `${filePath} 不是接口合同`,
    )
  }
  return 'infrastructure'
}

/** 读取并校验一份冻结 Java 源码。 */
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

/** 向独立风险结果追加一条非空证据。 */
function appendRisk(risks, category, lines) {
  const normalized = [...new Set(lines)].sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized })
}

/** 独立提取基础设施执行与资源信号。 */
function deriveSignals(sourceLines) {
  return {
    commandLineRunnerLines: scanLines(sourceLines, /implements\s+CommandLineRunner/),
    staticCollectionLines: scanLines(sourceLines, /\bstatic\b.*\b(?:Map|List|Set)\s*</),
    rawThreadLines: scanLines(sourceLines, /extends\s+Thread\b/),
    blockingSleepLines: scanLines(sourceLines, /Thread\.sleep\s*\(/),
    reflectionLines: scanLines(sourceLines, /(?:getMethod|invokeMethod)\s*\(/),
    sqlRewriteLines: scanLines(sourceLines, /\.replaceAll\s*\(\s*tableName\b/),
    externalClientLines: scanLines(
      sourceLines,
      /(?:SftpClientFactory\.buildClient|MossClientUtil\.buildClient|connectObjStorageForHttp\s*\(|new\s+(?:FTPClient|MOSSClient)\s*\()/,
    ),
    pathBoundaryLines: scanLines(
      sourceLines,
      /(?:localPath|remotePath|getLocalPath|getRemotePath)/,
    ),
    legacyFileApiLines: scanLines(
      sourceLines,
      /(?:new\s+File\s*\(|FileInputStream|FileOutputStream|renameTo\s*\(|\.delete\s*\()/,
    ),
  }
}

/** 根据当前源码独立复算风险类别和精确行号。 */
function deriveRisks(extractedRecord, sourceLines, shape, signals) {
  const risks = []
  const sourceText = sourceLines.join('\n')
  const fileName = path.basename(extractedRecord.path)
  appendRisk(risks, 'field-injection', scanLines(sourceLines, /@(Autowired|Resource)\b/))
  appendRisk(risks, 'startup-cache-load', signals.commandLineRunnerLines)
  if (shape === 'startup-cache-loader') {
    appendRisk(risks, 'mutable-static-cache', signals.staticCollectionLines)
  }
  appendRisk(risks, 'broad-catch', scanLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/))
  appendRisk(risks, 'empty-catch', scanEmptyCatchLines(sourceLines))
  appendRisk(risks, 'raw-thread', signals.rawThreadLines)
  appendRisk(risks, 'blocking-sleep', signals.blockingSleepLines)
  if (shape === 'media-converter-worker') {
    appendRisk(
      risks,
      'shared-stream-subscriber-state',
      extractedRecord.fields
        .filter((field) => /^(?:List<AsyncContext>|Map<String,Converter>)/.test(field.type))
        .map((field) => field.line),
    )
  }
  appendRisk(risks, 'file-path-boundary', signals.pathBoundaryLines)
  const memoryLines =
    shape === 'media-converter-worker'
      ? []
      : [
          ...extractedRecord.fields
            .filter((field) => field.type === 'byte[]')
            .map((field) => field.line),
          ...scanLines(
            sourceLines,
            /(?:new\s+ByteArrayOutputStream|readFileToByteArray|\bbyte\[\]\s+\w+\s*=.*downloadFile\s*\(|\.toByteArray\s*\(\))/,
          ),
        ]
  if (shape === 'media-converter-worker') {
    appendRisk(risks, 'in-memory-media-buffer', [
      ...extractedRecord.fields
        .filter((field) => /ByteArrayOutputStream|byte\[\]/.test(field.type))
        .map((field) => field.line),
      ...scanLines(sourceLines, /(?:new\s+ByteArrayOutputStream|\.toByteArray\s*\(\))/),
    ])
  }
  appendRisk(risks, 'in-memory-file-payload', memoryLines)
  if (shape === 'storage-transfer-model') {
    appendRisk(
      risks,
      'sensitive-configuration-model',
      extractedRecord.fields
        .filter((field) => /(?:secret|accesskey|securityToken)/i.test(field.name))
        .map((field) => field.line),
    )
  }
  appendRisk(
    risks,
    'sensitive-integration-log',
    scanLines(
      sourceLines,
      /(?:passwd:|mossServer=|MOSS服务器信息|tuMossServer=|generatePresignedUrl:|Analysis signature|lic\.toString\(\))/,
    ),
  )
  if (
    ['s3-object-storage-client', 'upload-adapter', 'download-adapter'].includes(shape) &&
    signals.externalClientLines.length > 0 &&
    scanLines(sourceLines, /(?:shutdown|shutDown|disconnect|close)\s*\(/).length === 0
  ) {
    appendRisk(risks, 'external-client-lifecycle', signals.externalClientLines)
  }
  if (shape === 'ftp-transfer-client') {
    appendRisk(
      risks,
      'stateful-ftp-client',
      extractedRecord.fields
        .filter((field) => field.type === 'FTPClient')
        .map((field) => field.line),
    )
  }
  appendRisk(risks, 'reflection-based-shard-injection', signals.reflectionLines)
  appendRisk(risks, 'sql-rewrite-interceptor', signals.sqlRewriteLines)
  appendRisk(risks, 'sneaky-throws-log-config', scanLines(sourceLines, /@SneakyThrows\b/))
  appendRisk(risks, 'legacy-file-api', signals.legacyFileApiLines)
  appendRisk(
    risks,
    'service-locator',
    scanLines(sourceLines, /ApplicationContextProvider\.getBean\s*\(/),
  )
  if (fileName === 'LocalUploader.java') {
    appendRisk(
      risks,
      'success-state-overwrite',
      scanLines(sourceLines, /uploadResponse\.setSuccess\((?:false|true)\)/),
    )
  }
  if (fileName === 'LocalDownloader.java') {
    appendRisk(
      risks,
      'unimplemented-adapter-null-result',
      scanLines(sourceLines, /return\s+null\s*;/),
    )
  }
  appendRisk(risks, 'legacy-misspelled-contract', scanLines(sourceLines, /\bisSucess\b/))
  if (['license-model', 'license-adapter'].includes(shape)) {
    appendRisk(
      risks,
      'legacy-license-compatibility',
      scanLines(sourceLines, /(?:DESHelper|RSAHelper|Base64Helper)/),
    )
  }
  if (shape === 'license-model' && /if\s*\(days\s*<\s*0L\)/.test(sourceText)) {
    appendRisk(
      risks,
      'license-validation-state',
      scanLines(sourceLines, /(?:if\s*\(days\s*<\s*0L\)|user\.setState\()/),
    )
  }
  if (shape === 'license-adapter') {
    appendRisk(risks, 'license-missing-fail-open', [
      ...scanLines(sourceLines, /if\s*\(lic\s*==\s*null\s*\)/),
      ...scanLines(sourceLines, /return\s+RunStatusEnums\.RUN\.getCode\(\)/).slice(0, 1),
    ])
  }
  return risks
}

/** 独立压缩 Phase 1B 内部使用边。 */
function deriveUsageEvidence(extractedRecord) {
  /** 只投影台账合同允许的稳定候选字段。 */
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

/** 独立计算关键基础设施依赖。 */
function deriveDependencies(extractedRecord) {
  const values = new Set(extractedRecord.frameworkUsages.map((usage) => usage.id))
  for (const imported of extractedRecord.imports) {
    if (
      /^(?:java\.io|java\.nio|javax\.servlet|ch\.qos\.logback|org\.apache\.ibatis|org\.springframework|org\.bytedeco|com\.amazonaws|com\.macrosan|tdh\.sftp|org\.apache\.commons\.net)/.test(
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

/** 验证单条基础设施记录的身份、职责、信号和风险。 */
function validateRecord(record, file, extractedRecord) {
  const label = `基础设施记录 ${record.path ?? '<unknown>'}`
  assert(file, `${label} 不在冻结物理范围`)
  assert(extractedRecord, `${label} 缺少 Phase 1B 记录`)
  const sourceLines = readFrozenSource(file)
  const expectedShape = deriveShape(file.path)
  const expectedSignals = deriveSignals(sourceLines)
  const expectedRisks = deriveRisks(extractedRecord, sourceLines, expectedShape, expectedSignals)

  assert(record.inventoryIndex === file.index, `${label} inventoryIndex 不一致`)
  assert(record.sourceSha256 === file.sha256, `${label} sourceSha256 不一致`)
  assert(record.sourceSha256 === extractedRecord.sourceSha256, `${label} Phase 1B 哈希不一致`)
  assert(record.loc === file.loc, `${label} LOC 不一致`)
  assert(record.auditStatus === 'reviewed', `${label} 状态不是 reviewed`)
  assert(
    record.machineRoleCandidate === extractedRecord.inferredRole.primary,
    `${label} 机器角色已漂移`,
  )
  assert(record.infrastructureRoot === deriveRoot(file.path), `${label} 根目录不一致`)
  assert(record.infrastructureShape === expectedShape, `${label} 职责形态不一致`)
  assert(
    record.finalRole === deriveFinalRole(expectedShape, file.path, extractedRecord, sourceLines),
    `${label} 最终角色不一致`,
  )
  const contentSha256 = sha256(
    JSON.stringify([
      record.infrastructureShape,
      record.roleDetail,
      record.responsibility,
      record.lifecycle,
      record.capabilityCandidates,
    ]),
  )
  assert(
    contentSha256 === expectedInfrastructureContentSha256ByShape[expectedShape],
    `${label} 职责内容不一致`,
  )
  assert(
    record.structure.declaredTypeCount === extractedRecord.declaredTypes.length,
    `${label} 类型数不一致`,
  )
  assert(record.structure.fieldCount === extractedRecord.fields.length, `${label} 字段数不一致`)
  assert(
    record.structure.publicMethodCount === extractedRecord.publicMethods.length,
    `${label} 公开方法数不一致`,
  )
  assert(
    record.structure.primaryTypeKind === extractedRecord.declaredTypes[0]?.kind,
    `${label} 类型种类不一致`,
  )
  assert(
    JSON.stringify(record.structure.extends) ===
      JSON.stringify(extractedRecord.declaredTypes[0]?.extends ?? []),
    `${label} extends 不一致`,
  )
  assert(
    JSON.stringify(record.structure.implements) ===
      JSON.stringify(extractedRecord.declaredTypes[0]?.implements ?? []),
    `${label} implements 不一致`,
  )
  const expectedAnnotations = [
    ...new Set(extractedRecord.annotations.map((item) => item.name)),
  ].sort()
  assert(
    JSON.stringify(record.annotationProfile.names) === JSON.stringify(expectedAnnotations),
    `${label} 注解清单不一致`,
  )
  assert(
    JSON.stringify(record.infrastructureSignals) === JSON.stringify(expectedSignals),
    `${label} 基础设施信号不一致`,
  )
  assert(
    JSON.stringify(record.frameworkUsages) ===
      JSON.stringify(extractedRecord.frameworkUsages.map((usage) => usage.id).sort()),
    `${label} 框架信号不一致`,
  )
  assert(
    JSON.stringify(record.usageEvidence) === JSON.stringify(deriveUsageEvidence(extractedRecord)),
    `${label} 使用边不一致`,
  )
  assert(
    JSON.stringify(record.dependencies) === JSON.stringify(deriveDependencies(extractedRecord)),
    `${label} 依赖清单不一致`,
  )
  const actualRisks = record.riskCandidates.map(({ category, lines }) => ({ category, lines }))
  assert(
    JSON.stringify(actualRisks) === JSON.stringify(expectedRisks),
    `${label} 风险类别或行号不一致`,
  )
  for (const risk of record.riskCandidates) {
    assert(typeof risk.summary === 'string' && risk.summary.trim(), `${label} 风险缺少摘要`)
    validateLines(risk.lines, record.loc, `${label} 风险 ${risk.category}`)
  }
  const expectedEvidenceLines = deriveSourceEvidenceLines(extractedRecord, expectedSignals)
  assert(record.sourceEvidence.length === 1, `${label} 源码证据数量不一致`)
  assert(
    JSON.stringify(record.sourceEvidence[0].lines) === JSON.stringify(expectedEvidenceLines),
    `${label} 源码证据行不一致`,
  )
  assert(
    typeof record.sourceEvidence[0].summary === 'string' && record.sourceEvidence[0].summary.trim(),
    `${label} 源码证据缺少摘要`,
  )
  validateLines(record.sourceEvidence[0].lines, record.loc, `${label} 源码证据`)
}

/** 统计记录指定字段的值。 */
function countBy(records, field) {
  const counts = new Map()
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 独立统计风险类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 读取前七批 reviewed 路径并验证累计分母。 */
function readPriorReviewedPaths() {
  const paths = []
  for (const source of priorReviewSources) {
    const sourcePath = path.join(auditDirectory, 'reviews', source.path)
    if (source.kind === 'single') {
      const ledger = readJson(sourcePath)
      paths.push(...ledger.records.map((record) => record.path))
      continue
    }
    const manifest = readJson(path.join(sourcePath, 'manifest.json'))
    paths.push(
      ...readShardedRecords(manifest, sourcePath, `${source.label} `).map((record) => record.path),
    )
  }
  assert(paths.length === expectedPriorReviewedCount, '前七批 reviewed 数量不是 3119')
  assert(new Set(paths).size === paths.length, '前七批 reviewed 路径存在重叠')
  return new Set(paths)
}

/** 从完成态记录重建签核前 reviewing 候选分片。 */
function rebuildCandidateShards(records) {
  const shards = []
  for (let offset = 0; offset < records.length; offset += 50) {
    const shardRecords = records.slice(offset, offset + 50).map((record) => ({
      ...record,
      auditStatus: 'reviewing',
    }))
    const fileName = `records-${String(offset + 1).padStart(4, '0')}-${String(offset + shardRecords.length).padStart(4, '0')}.jsonl`
    const content = `${shardRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
    shards.push({
      fileName,
      fileCount: shardRecords.length,
      sha256: sha256(content),
      decision: 'approved',
    })
  }
  return shards
}

/** 验证人工签核绑定当前候选分片和冻结身份。 */
function validateSignoff(signoff, manifest, records, inventory, extractionManifest) {
  assert(signoff.schemaVersion === 1, '基础设施签核 schemaVersion 不受支持')
  assert(signoff.snapshotId === inventory.snapshotId, '基础设施签核 snapshotId 不一致')
  assert(signoff.analysisId === extractionManifest.analysisId, '基础设施签核 analysisId 不一致')
  assert(signoff.batchId === 'phase-1c-infrastructure', '基础设施签核 batchId 不一致')
  assert(signoff.status === 'approved', '基础设施人工签核未批准')
  assert(signoff.reviewedAt === expectedReviewedAt, '基础设施签核 reviewedAt 不一致')
  assert(signoff.summary.approvedFileCount === expectedBatchFileCount, '基础设施签核文件分母不一致')
  assert(signoff.summary.approvedLoc === expectedBatchLoc, '基础设施签核 LOC 分母不一致')
  assert(signoff.summary.approvedShardCount === 2, '基础设施签核分片数不一致')
  assert(
    JSON.stringify(signoff.shards) === JSON.stringify(rebuildCandidateShards(records)),
    '基础设施签核未绑定当前 reviewing 候选分片',
  )
  assert(
    manifest.manualReviewSignoff.sha256 === sha256(fs.readFileSync(signoffPath)),
    '基础设施签核文件 SHA-256 不一致',
  )
  assert(
    manifest.manualReviewSignoff.path === 'reviews/phase-1c-infrastructure-signoff.json',
    '基础设施签核路径不一致',
  )
  assert(
    manifest.manualReviewSignoff.reviewedBy === signoff.reviewedBy &&
      manifest.manualReviewSignoff.reviewerType === signoff.reviewerType &&
      manifest.manualReviewSignoff.approvedShardCount === signoff.shards.length,
    '基础设施签核身份摘要不一致',
  )
}

/** 独立构建完成态分片摘要。 */
function deriveCompletedShardSummaries(records) {
  const shards = []
  for (let offset = 0; offset < records.length; offset += 50) {
    const shardRecords = records.slice(offset, offset + 50)
    const content = `${shardRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
    shards.push({
      fileName: `records-${String(offset + 1).padStart(4, '0')}-${String(offset + shardRecords.length).padStart(4, '0')}.jsonl`,
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

/** 验证 Phase 1C 第 8 批基础设施完成态台账。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const signoff = readJson(signoffPath)
  const manifest = readJson(reviewManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const expectedFiles = inventory.files.filter(hasExpectedInventoryIndex)
  const records = readShardedRecords(manifest, reviewDirectory, '基础设施 ')

  assert(manifest.schemaVersion === 1, '基础设施 manifest schemaVersion 不受支持')
  assert(manifest.snapshotId === inventory.snapshotId, '基础设施 manifest snapshotId 不一致')
  assert(
    manifest.analysisId === extractionManifest.analysisId,
    '基础设施 manifest analysisId 不一致',
  )
  assert(manifest.batchId === 'phase-1c-infrastructure', '基础设施 manifest batchId 不一致')
  assert(manifest.status === 'completed', '基础设施批次状态不是 completed')
  assert(manifest.reviewedAt === expectedReviewedAt, '基础设施 manifest reviewedAt 不一致')
  assert(
    JSON.stringify(manifest.batchScope.roots) === JSON.stringify(expectedRoots),
    '基础设施根目录不一致',
  )
  assert(
    JSON.stringify(manifest.batchScope.javaInventoryIndexRanges) ===
      JSON.stringify(expectedInventoryIndexRanges),
    '基础设施库存索引区间不一致',
  )
  assert(
    manifest.batchScope.excludedReviewedPaths === expectedPriorReviewedCount,
    '基础设施前置排除分母不一致',
  )
  assert(records.length === expectedBatchFileCount, '基础设施记录数不是 53')
  assert(expectedFiles.length === expectedBatchFileCount, '基础设施冻结索引分母不是 53')
  assert(
    JSON.stringify(records.map((record) => record.path)) ===
      JSON.stringify(expectedFiles.map((file) => file.path)),
    '基础设施路径集合或顺序不一致',
  )
  assert(new Set(records.map((record) => record.path)).size === records.length, '基础设施路径重复')
  assert(
    JSON.stringify(manifest.shards) === JSON.stringify(deriveCompletedShardSummaries(records)),
    '基础设施完成态分片摘要不一致',
  )

  const priorPaths = readPriorReviewedPaths()
  assert(
    records.every((record) => !priorPaths.has(record.path)),
    '基础设施与前七批路径重叠',
  )
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
  const rootCounts = countBy(records, 'infrastructureRoot')
  const machineRoleCandidateCounts = countBy(records, 'machineRoleCandidate')
  const finalRoleCounts = countBy(records, 'finalRole')
  const infrastructureShapeCounts = countBy(records, 'infrastructureShape')
  const roleCorrectionCount = records.filter(
    (record) => record.machineRoleCandidate !== record.finalRole,
  ).length
  const signalFileCounts = Object.fromEntries(
    Object.keys(expectedSignalFileCounts).map((signal) => [
      signal,
      records.filter((record) => record.infrastructureSignals[signal].length > 0).length,
    ]),
  )
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

  assert(batchLoc === expectedBatchLoc, '基础设施 LOC 不是 6175')
  assert(declaredTypeCount === expectedDeclaredTypeCount, '基础设施类型数不是 55')
  assert(fieldCount === expectedFieldCount, '基础设施字段数不是 165')
  assert(publicMethodCount === expectedPublicMethodCount, '基础设施公开方法数不是 272')
  assert(
    JSON.stringify(rootCounts) === JSON.stringify(expectedRootCounts),
    '基础设施根目录汇总不一致',
  )
  assert(
    JSON.stringify(machineRoleCandidateCounts) === JSON.stringify(expectedMachineRoleCounts),
    '基础设施机器角色汇总不一致',
  )
  assert(
    JSON.stringify(finalRoleCounts) === JSON.stringify(expectedFinalRoleCounts),
    '基础设施最终角色汇总不一致',
  )
  assert(
    JSON.stringify(infrastructureShapeCounts) === JSON.stringify(expectedShapeCounts),
    '基础设施职责形态汇总不一致',
  )
  assert(roleCorrectionCount === 24, '基础设施角色纠正数不是 24')
  assert(
    JSON.stringify(signalFileCounts) === JSON.stringify(expectedSignalFileCounts),
    '基础设施信号文件数不一致',
  )
  assert(inboundUsageOccurrenceCount === 2696, '基础设施入站使用出现次数不是 2696')
  assert(outboundUsageOccurrenceCount === 959, '基础设施出站使用出现次数不是 959')
  assert(risks.length === expectedRiskCandidateCount, '基础设施风险候选数不是 126')
  assert(
    JSON.stringify(riskCategoryCounts) === JSON.stringify(expectedRiskCategoryCounts),
    '基础设施风险类别汇总不一致',
  )
  assert(
    JSON.stringify(risks.map((risk) => risk.id)) ===
      JSON.stringify(
        Array.from(
          { length: expectedRiskCandidateCount },
          (_, index) => `IN-${String(index + 1).padStart(4, '0')}`,
        ),
      ),
    '基础设施风险 ID 必须连续且唯一',
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
    infrastructureShapeCounts,
    roleCorrectionCount,
    signalFileCounts,
    inboundUsageOccurrenceCount,
    outboundUsageOccurrenceCount,
    riskCandidateCount: risks.length,
    riskCategoryCounts,
    currentAuditStatusCounts,
  }
  assert(
    JSON.stringify(manifest.summary) === JSON.stringify(expectedSummary),
    '基础设施 manifest summary 不一致',
  )
  assert(
    Object.values(currentAuditStatusCounts).reduce((total, count) => total + count, 0) ===
      inventory.summary.total.fileCount,
    '前八批累计状态没有覆盖冻结分母',
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: manifest.batchId,
      reviewedFiles: records.length,
      batchLoc,
      infrastructureShapeCounts,
      riskCandidateCount: risks.length,
      roleCorrectionCount,
      currentAuditStatusCounts,
    }),
  )
}

main()
