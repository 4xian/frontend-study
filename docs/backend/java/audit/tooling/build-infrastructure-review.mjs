import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { infrastructureShapeDetails as shapeDetails } from './infrastructure-review-catalog.mjs'

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
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-infrastructure')
const outputDirectory = process.env.DZZZ_INFRASTRUCTURE_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_INFRASTRUCTURE_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const previouslyReviewedFileCount = 3119
const expectedBatchFileCount = 53
const expectedBatchLoc = 6175
const shardSize = 50
const priorReviewSources = [
  { kind: 'single', path: 'phase-1c-startup-config.json' },
  { kind: 'sharded', path: 'phase-1c-web-entry' },
  { kind: 'sharded', path: 'phase-1c-business-layer' },
  { kind: 'sharded', path: 'phase-1c-data-access' },
  { kind: 'sharded', path: 'phase-1c-data-model' },
  { kind: 'sharded', path: 'phase-1c-cross-cutting' },
  { kind: 'sharded', path: 'phase-1c-async-integration' },
]

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 解析命令行参数。 */
function parseArguments(argv) {
  const options = { check: false, prepare: false, sourceRepository: defaultSourceRepository }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--check') options.check = true
    else if (argument === '--prepare') options.prepare = true
    else if (argument === '--source-repo') {
      options.sourceRepository = argv[index + 1]
      index += 1
      if (!options.sourceRepository) throw new Error('--source-repo 缺少路径参数')
    } else throw new Error(`未知参数：${argument}`)
  }
  if (options.check && options.prepare) throw new Error('--check 与 --prepare 不能同时使用')
  return options
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

/** 读取前七批已复核路径，保证本批不重复领取。 */
function readPreviouslyReviewedPaths() {
  const reviewed = new Set()
  for (const source of priorReviewSources) {
    const sourcePath = path.join(auditDirectory, 'reviews', source.path)
    if (source.kind === 'single') {
      for (const record of readJson(sourcePath).records) reviewed.add(record.path)
      continue
    }
    const manifest = readJson(path.join(sourcePath, 'manifest.json'))
    for (const shard of manifest.shards) {
      const shardPath = path.join(sourcePath, shard.fileName)
      for (const line of fs.readFileSync(shardPath, 'utf8').trim().split('\n')) {
        reviewed.add(JSON.parse(line).path)
      }
    }
  }
  if (reviewed.size !== previouslyReviewedFileCount) {
    throw new Error(`前七批已复核路径应为 ${previouslyReviewedFileCount}，实际 ${reviewed.size}`)
  }
  return reviewed
}

/** 判断库存文件是否属于第 8 批基础设施物理范围。 */
function isPhysicalBatchFile(file) {
  return (
    /\/bdzz\/(?:cache|download|factories\/flv|rolling|shard|storage|upload)\/.*\.java$/.test(
      file.path,
    ) || /\/tdh\/platform\/component\/license\/lic(?:\/impl)?\/[^/]+\.java$/.test(file.path)
  )
}

/** 从路径推导第 8 批展示根目录。 */
function getBatchRoot(filePath) {
  if (filePath.includes('/factories/flv/')) return 'media'
  if (filePath.includes('/rolling/')) return 'logging'
  if (filePath.includes('/license/lic/')) return 'license'
  return filePath.match(/\/bdzz\/(cache|download|shard|storage|upload)\//)?.[1]
}

/** 根据精确路径确定基础设施职责形态。 */
function getInfrastructureShape(filePath) {
  const fileName = path.basename(filePath)
  if (filePath.includes('/cache/')) return 'startup-cache-loader'
  if (filePath.includes('/download/')) {
    if (fileName === 'DownloadResponse.java') return 'download-result-model'
    if (fileName === 'DownloadUtil.java') return 'download-orchestrator'
    if (fileName === 'Downloader.java') return 'download-contract'
    return 'download-adapter'
  }
  if (filePath.includes('/factories/flv/')) {
    return fileName === 'Converter.java' ? 'media-converter-contract' : 'media-converter-worker'
  }
  if (fileName === 'InnerProjectRollingFileAppender.java') return 'logback-file-appender'
  if (fileName === 'InnerProjectSizeAndTimeBasedRollingPolicy.java') {
    return 'logback-rolling-policy'
  }
  const shardShapes = {
    'AjbsShardStrategy.java': 'table-shard-strategy',
    'IShardStrategy.java': 'table-shard-strategy-contract',
    'IAutowiredShardData.java': 'shard-data-contract',
    'DefaultAutowiredShardData.java': 'shard-data-reflection-adapter',
    'TableShardInterceptor.java': 'mybatis-table-shard-interceptor',
  }
  if (filePath.includes('/shard/')) return shardShapes[fileName]
  const storageShapes = {
    'FtpWork.java': 'ftp-transfer-client',
    'MossClientUtil.java': 'moss-object-storage-client',
    'NioUtil.java': 'nio-file-helper',
    'S3Utils.java': 's3-object-storage-client',
    'StorageProcessListener.java': 'transfer-progress-callback',
  }
  if (filePath.includes('/storage/')) return storageShapes[fileName]
  if (filePath.includes('/upload/')) {
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
  if (fileName === 'License.java') return 'license-model'
  if (fileName === 'LicFactoryImpl.java') return 'license-adapter'
  throw new Error(`${filePath} 缺少基础设施职责形态`)
}

/** 结合源码声明验证职责形态并推导最终语义角色。 */
function getFinalRole(shape, filePath, extractedRecord, sourceLines) {
  const types = extractedRecord.declaredTypes.filter((type) => type.owner === null)
  const sourceText = sourceLines.join('\n')
  if (shape === 'startup-cache-loader') {
    if (!types.some((type) => type.implements.includes('CommandLineRunner'))) {
      throw new Error(`${filePath} 缺少 CommandLineRunner 缓存证据`)
    }
    return 'infrastructure'
  }
  if (shape === 'media-converter-contract' || shape === 'media-converter-worker') {
    const valid = types.some((type) =>
      shape === 'media-converter-contract'
        ? type.kind === 'interface'
        : type.extends.includes('Thread') && type.implements.includes('Converter'),
    )
    if (!valid) throw new Error(`${filePath} 缺少媒体线程合同证据`)
    return 'async-integration'
  }
  if (
    shape.startsWith('table-shard') ||
    shape.startsWith('shard-data') ||
    shape === 'mybatis-table-shard-interceptor'
  ) {
    if (!/Shard|StatementHandler|Interceptor/.test(sourceText)) {
      throw new Error(`${filePath} 缺少分表数据访问证据`)
    }
    return 'data-access'
  }
  if (['download-result-model', 'storage-transfer-model', 'license-model'].includes(shape)) {
    if (!types.some((type) => type.kind === 'class') || extractedRecord.fields.length === 0) {
      throw new Error(`${filePath} 缺少数据载体证据`)
    }
    return 'data-model'
  }
  if (shape.endsWith('-contract') && !types.some((type) => type.kind === 'interface')) {
    throw new Error(`${filePath} 缺少接口合同证据`)
  }
  return 'infrastructure'
}

/** 返回源码中匹配表达式的稳定行号。 */
function findLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => (pattern.test(line) ? [index + 1] : []))
}

/** 返回 catch 后首个有效语句为空块的行号。 */
function findEmptyCatchLines(sourceLines) {
  const lines = []
  for (let index = 0; index < sourceLines.length; index += 1) {
    if (!/catch\s*\(/.test(sourceLines[index])) continue
    let next = index + 1
    while (next < sourceLines.length && sourceLines[next].trim() === '') next += 1
    if (sourceLines[next]?.trim() === '}') lines.push(index + 1)
  }
  return lines
}

/** 添加一条包含有效源码行号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const normalized = [...new Set(lines)].sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized, summary })
}

/** 从冻结源码提取基础设施执行和资源信号。 */
function buildInfrastructureSignals(sourceLines) {
  return {
    commandLineRunnerLines: findLines(sourceLines, /implements\s+CommandLineRunner/),
    staticCollectionLines: findLines(sourceLines, /\bstatic\b.*\b(?:Map|List|Set)\s*</),
    rawThreadLines: findLines(sourceLines, /extends\s+Thread\b/),
    blockingSleepLines: findLines(sourceLines, /Thread\.sleep\s*\(/),
    reflectionLines: findLines(sourceLines, /(?:getMethod|invokeMethod)\s*\(/),
    sqlRewriteLines: findLines(sourceLines, /\.replaceAll\s*\(\s*tableName\b/),
    externalClientLines: findLines(
      sourceLines,
      /(?:SftpClientFactory\.buildClient|MossClientUtil\.buildClient|connectObjStorageForHttp\s*\(|new\s+(?:FTPClient|MOSSClient)\s*\()/,
    ),
    pathBoundaryLines: findLines(
      sourceLines,
      /(?:localPath|remotePath|getLocalPath|getRemotePath)/,
    ),
    legacyFileApiLines: findLines(
      sourceLines,
      /(?:new\s+File\s*\(|FileInputStream|FileOutputStream|renameTo\s*\(|\.delete\s*\()/,
    ),
  }
}

/** 根据源码证据建立文件级风险候选。 */
function buildRisks(extractedRecord, sourceLines, shape, signals) {
  const risks = []
  const sourceText = sourceLines.join('\n')
  addRisk(
    risks,
    'field-injection',
    findLines(sourceLines, /@(Autowired|Resource)\b/),
    '字段注入隐藏必需依赖；现代示例使用构造器注入。',
  )
  addRisk(
    risks,
    'startup-cache-load',
    signals.commandLineRunnerLines,
    '启动回调直接加载缓存，会把数据库或文件失败带入应用就绪关键路径。',
  )
  if (shape === 'startup-cache-loader') {
    addRisk(
      risks,
      'mutable-static-cache',
      signals.staticCollectionLines,
      '静态可变集合由整个进程共享；刷新原子性、并发可见性和测试复位必须明确。',
    )
  }
  addRisk(
    risks,
    'broad-catch',
    findLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/),
    '宽泛捕获合并了不同失败语义；恢复或转换前应区分可处理异常。',
  )
  addRisk(
    risks,
    'empty-catch',
    findEmptyCatchLines(sourceLines),
    '空 catch 会丢失媒体编码失败，至少应记录、传播或终止当前任务。',
  )
  addRisk(
    risks,
    'raw-thread',
    signals.rawThreadLines,
    '直接继承 Thread 绕过受管执行器；容量、取消、命名和关闭责任不可见。',
  )
  addRisk(
    risks,
    'blocking-sleep',
    signals.blockingSleepLines,
    '工作线程中的 sleep 占用线程且不能表达可取消调度。',
  )
  if (shape === 'media-converter-worker') {
    addRisk(
      risks,
      'shared-stream-subscriber-state',
      extractedRecord.fields
        .filter((field) => /^(?:List<AsyncContext>|Map<String,Converter>)/.test(field.type))
        .map((field) => field.line),
      '媒体线程共享可变订阅者和注册表；并发增删与响应完成必须使用明确所有权。',
    )
  }
  addRisk(
    risks,
    'file-path-boundary',
    signals.pathBoundaryLines,
    '本地或远程路径跨越调用边界；现代实现必须限定根目录并验证规范化后的目标。',
  )
  const memoryLines =
    shape === 'media-converter-worker'
      ? []
      : [
          ...extractedRecord.fields
            .filter((field) => field.type === 'byte[]')
            .map((field) => field.line),
          ...findLines(
            sourceLines,
            /(?:new\s+ByteArrayOutputStream|readFileToByteArray|\bbyte\[\]\s+\w+\s*=.*downloadFile\s*\(|\.toByteArray\s*\(\))/,
          ),
        ]
  if (shape === 'media-converter-worker') {
    const mediaBufferLines = [
      ...extractedRecord.fields
        .filter((field) => /ByteArrayOutputStream|byte\[\]/.test(field.type))
        .map((field) => field.line),
      ...findLines(sourceLines, /(?:new\s+ByteArrayOutputStream|\.toByteArray\s*\(\))/),
    ]
    addRisk(
      risks,
      'in-memory-media-buffer',
      mediaBufferLines,
      '媒体分片通过可增长内存缓冲区转发；现代实现必须限制单次缓冲大小并定义慢订阅者背压。',
    )
  }
  addRisk(
    risks,
    'in-memory-file-payload',
    memoryLines,
    '文件内容整体驻留内存；课程必须说明大小上限，并优先使用有界流式传输。',
  )
  if (shape === 'storage-transfer-model') {
    addRisk(
      risks,
      'sensitive-configuration-model',
      extractedRecord.fields
        .filter((field) => /(?:secret|accesskey|securityToken)/i.test(field.name))
        .map((field) => field.line),
      '配置模型包含访问密钥或令牌，禁止整体日志输出并应缩短生命周期。',
    )
  }
  const sensitiveLogLines = findLines(
    sourceLines,
    /(?:passwd:|mossServer=|MOSS服务器信息|tuMossServer=|generatePresignedUrl:|Analysis signature|lic\.toString\(\))/,
  )
  addRisk(
    risks,
    'sensitive-integration-log',
    sensitiveLogLines,
    '日志可能包含密码、存储配置、预签名 URL 或许可证签名，必须去敏。',
  )
  if (['s3-object-storage-client', 'upload-adapter', 'download-adapter'].includes(shape)) {
    const opens = signals.externalClientLines
    const closes = findLines(sourceLines, /(?:shutdown|shutDown|disconnect|close)\s*\(/)
    if (opens.length > 0 && closes.length === 0) {
      addRisk(
        risks,
        'external-client-lifecycle',
        opens,
        '外部客户端被创建但当前文件没有可见关闭；所有权和连接回收需要显式合同。',
      )
    }
  }
  if (shape === 'ftp-transfer-client') {
    addRisk(
      risks,
      'stateful-ftp-client',
      extractedRecord.fields
        .filter((field) => field.type === 'FTPClient')
        .map((field) => field.line),
      'Spring 组件持有可变 FTPClient；并发调用和返回流会共享连接状态。',
    )
  }
  addRisk(
    risks,
    'reflection-based-shard-injection',
    signals.reflectionLines,
    '反射提取分表键缺少编译期约束；方法签名、返回类型和失败行为需验证。',
  )
  addRisk(
    risks,
    'sql-rewrite-interceptor',
    signals.sqlRewriteLines,
    '用正则替换 SQL 表名可能误命中别名或文本；现代实现应使用受控解析与白名单表名。',
  )
  addRisk(
    risks,
    'sneaky-throws-log-config',
    findLines(sourceLines, /@SneakyThrows\b/),
    '日志配置 setter 隐藏受检异常；配置失败应保留可诊断边界。',
  )
  addRisk(
    risks,
    'legacy-file-api',
    signals.legacyFileApiLines,
    '旧 File API 的路径与资源语义分散；现代示例优先使用 Path、Files 和 try-with-resources。',
  )
  addRisk(
    risks,
    'service-locator',
    findLines(sourceLines, /ApplicationContextProvider\.getBean\s*\(/),
    '运行时从容器取 Bean 隐藏依赖；现代示例使用显式构造器依赖。',
  )
  if (path.basename(extractedRecord.path) === 'LocalUploader.java') {
    addRisk(
      risks,
      'success-state-overwrite',
      findLines(sourceLines, /uploadResponse\.setSuccess\((?:false|true)\)/),
      '空文件分支先标记失败，后续又无条件覆盖为成功，结果合同需要单出口验证。',
    )
  }
  if (path.basename(extractedRecord.path) === 'LocalDownloader.java') {
    addRisk(
      risks,
      'unimplemented-adapter-null-result',
      findLines(sourceLines, /return\s+null\s*;/),
      '策略合同的本地下载实现直接返回 null；现代实现必须返回明确结果或抛出有语义的异常。',
    )
  }
  addRisk(
    risks,
    'legacy-misspelled-contract',
    findLines(sourceLines, /\bisSucess\b/),
    '公开结果方法保留历史拼写；现代示例使用正确命名并只在 legacy 映射。',
  )
  if (['license-model', 'license-adapter'].includes(shape)) {
    addRisk(
      risks,
      'legacy-license-compatibility',
      findLines(sourceLines, /(?:DESHelper|RSAHelper|Base64Helper)/),
      '许可证密码学是项目兼容合同；现代课程不把解密式旧协议作为新设计推荐。',
    )
  }
  if (shape === 'license-model' && /if\s*\(days\s*<\s*0L\)/.test(sourceText)) {
    addRisk(
      risks,
      'license-validation-state',
      findLines(sourceLines, /(?:if\s*\(days\s*<\s*0L\)|user\.setState\()/),
      '过期和签名失败后的状态转换需要单独验证；不能把旧实现直接作为正确授权示例。',
    )
  }
  if (shape === 'license-adapter') {
    const missingLicenseRunLines = [
      ...findLines(sourceLines, /if\s*\(lic\s*==\s*null\s*\)/),
      ...findLines(sourceLines, /return\s+RunStatusEnums\.RUN\.getCode\(\)/).slice(0, 1),
    ]
    addRisk(
      risks,
      'license-missing-fail-open',
      missingLicenseRunLines,
      '许可证缺失时直接进入运行态属于 fail-open；现代授权边界应在缺少可信授权时拒绝受保护能力。',
    )
  }
  return risks
}

/** 压缩 Phase 1B 内部关系为稳定的使用证据。 */
function buildUsageEvidence(extractedRecord) {
  /** 把一条 CodeGraph 候选压缩为稳定字段。 */
  const normalize = (candidate) => ({
    kind: candidate.kind,
    sourcePath: candidate.sourcePath,
    sourceSymbol: candidate.sourceSymbol,
    targetPath: candidate.targetPath,
    targetSymbol: candidate.targetSymbol,
    occurrences: candidate.occurrences,
    lines: candidate.lines,
  })
  const inbound = extractedRecord.codeGraph.internalInboundCandidates.map(normalize)
  const outbound = extractedRecord.codeGraph.internalOutboundCandidates.map(normalize)
  return {
    inbound,
    outbound,
    inboundOccurrenceCount: inbound.reduce((total, item) => total + item.occurrences, 0),
    outboundOccurrenceCount: outbound.reduce((total, item) => total + item.occurrences, 0),
  }
}

/** 收集当前文件的框架和关键基础设施依赖。 */
function buildDependencies(extractedRecord) {
  const dependencies = new Set(extractedRecord.frameworkUsages.map((usage) => usage.id))
  for (const imported of extractedRecord.imports) {
    if (
      /^(?:java\.io|java\.nio|javax\.servlet|ch\.qos\.logback|org\.apache\.ibatis|org\.springframework|org\.bytedeco|com\.amazonaws|com\.macrosan|tdh\.sftp|org\.apache\.commons\.net)/.test(
        imported.name,
      )
    ) {
      dependencies.add(imported.name)
    }
  }
  return [...dependencies].sort((left, right) => left.localeCompare(right))
}

/** 生成覆盖结构、注解、字段、方法和基础设施信号的源码证据。 */
function buildSourceEvidence(extractedRecord, signals) {
  const lines = [
    ...extractedRecord.declaredTypes.map((item) => item.line),
    ...extractedRecord.annotations.map((item) => item.line),
    ...extractedRecord.fields.map((item) => item.line),
    ...extractedRecord.publicMethods.flatMap((item) => [item.line, item.endLine]),
    ...Object.values(signals).flat(),
  ]
    .filter(Number.isInteger)
    .filter((line, index, values) => values.indexOf(line) === index)
    .sort((left, right) => left - right)
  return [
    { lines, summary: '当前源码结构、执行信号、资源边界和调用证据共同证明该文件的真实职责。' },
  ]
}

/** 建立一条等待人工签核的第 8 批逐文件记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository) {
  const sourceBuffer = fs.readFileSync(path.join(sourceRepository, file.path))
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  if ((sourceText.match(/\n/g)?.length ?? 0) !== file.loc)
    throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const shape = getInfrastructureShape(file.path)
  const details = shapeDetails[shape]
  if (!details) throw new Error(`${file.path} 缺少职责说明`)
  const signals = buildInfrastructureSignals(sourceLines)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewing',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: getFinalRole(shape, file.path, extractedRecord, sourceLines),
    infrastructureRoot: getBatchRoot(file.path),
    infrastructureShape: shape,
    roleDetail: details.roleDetail,
    responsibility: details.responsibility,
    lifecycle: details.lifecycle,
    structure: {
      declaredTypeCount: extractedRecord.declaredTypes.length,
      fieldCount: extractedRecord.fields.length,
      publicMethodCount: extractedRecord.publicMethods.length,
      primaryTypeKind: extractedRecord.declaredTypes[0]?.kind,
      extends: extractedRecord.declaredTypes[0]?.extends ?? [],
      implements: extractedRecord.declaredTypes[0]?.implements ?? [],
    },
    annotationProfile: {
      names: [...new Set(extractedRecord.annotations.map((item) => item.name))].sort(),
    },
    infrastructureSignals: signals,
    frameworkUsages: extractedRecord.frameworkUsages.map((usage) => usage.id).sort(),
    usageEvidence: buildUsageEvidence(extractedRecord),
    dependencies: buildDependencies(extractedRecord),
    capabilityCandidates: details.capabilities,
    riskCandidates: buildRisks(extractedRecord, sourceLines, shape, signals),
    sourceEvidence: buildSourceEvidence(extractedRecord, signals),
  }
}

/** 为风险候选分配连续且唯一的 IN 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `IN-${String(sequence).padStart(4, '0')}`
    }
  }
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  const counts = new Map()
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 统计全部风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 把库存索引压缩为连续区间。 */
function buildInventoryIndexRanges(records) {
  const ranges = []
  for (const record of records) {
    const current = ranges.at(-1)
    if (!current || record.inventoryIndex !== current[1] + 1) {
      ranges.push([record.inventoryIndex, record.inventoryIndex])
    } else current[1] = record.inventoryIndex
  }
  return ranges
}

/** 校验人工签核完整绑定当前快照和候选分片。 */
function validateManualSignoff(signoff, shards, records, inventory, extractionManifest) {
  if (signoff.schemaVersion !== 1) throw new Error('基础设施人工签核 schemaVersion 不受支持')
  if (signoff.snapshotId !== inventory.snapshotId)
    throw new Error('基础设施人工签核 snapshotId 不一致')
  if (signoff.analysisId !== extractionManifest.analysisId)
    throw new Error('基础设施人工签核 analysisId 不一致')
  if (signoff.batchId !== 'phase-1c-infrastructure' || signoff.status !== 'approved') {
    throw new Error('基础设施人工签核批次或状态不正确')
  }
  if (!signoff.reviewedBy || !signoff.reviewerType || !signoff.reviewedAt) {
    throw new Error('基础设施人工签核缺少复核身份或时间')
  }
  const expected = shards.map(({ fileName, fileCount, sha256: hash }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision: 'approved',
  }))
  if (JSON.stringify(signoff.shards) !== JSON.stringify(expected)) {
    throw new Error('基础设施逐文件记录与人工签核分片不一致')
  }
  if (
    signoff.summary.approvedFileCount !== records.length ||
    signoff.summary.approvedLoc !== records.reduce((total, record) => total + record.loc, 0) ||
    signoff.summary.approvedShardCount !== shards.length
  ) {
    throw new Error('基础设施人工签核分母不一致')
  }
}

/** 生成一份供人工复核后落盘的签核草案。 */
function buildSignoffDraft(shards, records, inventory, extractionManifest) {
  return {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-infrastructure',
    status: 'pending-manual-review',
    reviewedBy: 'Codex',
    reviewerType: 'agent-assisted-manual-review',
    reviewedAt: '<replace-after-review>',
    reviewMethod:
      '逐文件复核 53 个基础设施物理范围文件，并核对职责、资源信号、使用边、风险行号和角色纠正。',
    approvalContract: '只有人工确认的 reviewing 候选分片 SHA-256 才能把记录转为 reviewed。',
    summary: {
      approvedFileCount: records.length,
      approvedLoc: records.reduce((total, record) => total + record.loc, 0),
      approvedShardCount: shards.length,
    },
    shards: shards.map(({ fileName, fileCount, sha256: hash }) => ({
      fileName,
      fileCount,
      sha256: hash,
      decision: 'approved',
    })),
  }
}

/** 按指定审计状态生成稳定 JSONL 分片。 */
function buildShardOutputs(records, auditStatus) {
  const outputs = new Map()
  const shards = []
  for (let offset = 0; offset < records.length; offset += shardSize) {
    const shardRecords = records.slice(offset, offset + shardSize).map((record) => ({
      ...record,
      auditStatus,
    }))
    const fileName = `records-${String(offset + 1).padStart(4, '0')}-${String(offset + shardRecords.length).padStart(4, '0')}.jsonl`
    const content = `${shardRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
    outputs.set(path.join(outputDirectory, fileName), content)
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
  return { outputs, shards }
}

/** 生成 JSONL 分片和批次 manifest 的稳定文本。 */
function buildOutputs(records, inventory, extractionManifest, manualSignoff) {
  const candidate = buildShardOutputs(records, 'reviewing')
  if (manualSignoff) {
    validateManualSignoff(manualSignoff, candidate.shards, records, inventory, extractionManifest)
  }
  const { outputs, shards } = manualSignoff ? buildShardOutputs(records, 'reviewed') : candidate
  const riskCandidateCount = records.reduce(
    (total, record) => total + record.riskCandidates.length,
    0,
  )
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-infrastructure',
    status: manualSignoff ? 'completed' : 'review-candidate',
    reviewedAt: manualSignoff?.reviewedAt ?? null,
    manualReviewSignoff: manualSignoff
      ? {
          path: 'reviews/phase-1c-infrastructure-signoff.json',
          sha256: sha256(fs.readFileSync(signoffPath)),
          reviewedBy: manualSignoff.reviewedBy,
          reviewerType: manualSignoff.reviewerType,
          approvedShardCount: manualSignoff.shards.length,
        }
      : null,
    batchScope: {
      roots: ['cache', 'download', 'media', 'logging', 'shard', 'storage', 'upload', 'license'],
      javaInventoryIndexRanges: buildInventoryIndexRanges(records),
      excludedReviewedPaths: previouslyReviewedFileCount,
    },
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus:
        'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      roleBoundary: 'physical infrastructure scope and final semantic role are recorded separately',
      resourceBoundary:
        'file, client, stream, cache, thread, SQL rewrite, and credential lifecycles require source evidence',
      signoffBoundary:
        'manual signoff binds reviewing candidate shard hashes before completed output promotes records to reviewed',
    },
    summary: {
      batchFileCount: records.length,
      batchLoc: records.reduce((total, record) => total + record.loc, 0),
      declaredTypeCount: records.reduce(
        (total, record) => total + record.structure.declaredTypeCount,
        0,
      ),
      fieldCount: records.reduce((total, record) => total + record.structure.fieldCount, 0),
      publicMethodCount: records.reduce(
        (total, record) => total + record.structure.publicMethodCount,
        0,
      ),
      rootCounts: countBy(records, 'infrastructureRoot'),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      infrastructureShapeCounts: countBy(records, 'infrastructureShape'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      signalFileCounts: Object.fromEntries(
        Object.keys(records[0].infrastructureSignals).map((signal) => [
          signal,
          records.filter((record) => record.infrastructureSignals[signal].length > 0).length,
        ]),
      ),
      inboundUsageOccurrenceCount: records.reduce(
        (total, record) => total + record.usageEvidence.inboundOccurrenceCount,
        0,
      ),
      outboundUsageOccurrenceCount: records.reduce(
        (total, record) => total + record.usageEvidence.outboundOccurrenceCount,
        0,
      ),
      riskCandidateCount,
      riskCategoryCounts: countRiskCategories(records),
      currentAuditStatusCounts: {
        unreviewed:
          inventory.summary.total.fileCount - previouslyReviewedFileCount - records.length,
        reviewing: manualSignoff ? 0 : records.length,
        reviewed: previouslyReviewedFileCount + (manualSignoff ? records.length : 0),
        blocked: 0,
      },
    },
    shards,
  }
  outputs.set(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return {
    outputs,
    manifest,
    signoffDraft: buildSignoffDraft(candidate.shards, records, inventory, extractionManifest),
  }
}

/** 写入输出，或在 check 模式逐字节验证现有产物。 */
function emitOutputs(outputs, check) {
  if (!check) fs.mkdirSync(outputDirectory, { recursive: true })
  for (const [filePath, content] of outputs) {
    if (check) {
      if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
        throw new Error(`第 8 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
    } else fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 8 批基础设施台账。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const previouslyReviewedPaths = readPreviouslyReviewedPaths()
  const files = inventory.files.filter(
    (file) => isPhysicalBatchFile(file) && !previouslyReviewedPaths.has(file.path),
  )
  const batchLoc = files.reduce((total, file) => total + file.loc, 0)
  if (files.length !== expectedBatchFileCount || batchLoc !== expectedBatchLoc) {
    throw new Error(`第 8 批冻结分母漂移：files=${files.length}, LOC=${batchLoc}`)
  }
  const records = files.map((file) => {
    const extractedRecord = extractedByPath.get(file.path)
    if (!extractedRecord) throw new Error(`${file.path} 缺少 Phase 1B 记录`)
    return buildReviewRecord(file, extractedRecord, options.sourceRepository)
  })
  assignRiskIds(records)
  const manualSignoff = options.prepare ? null : readJson(signoffPath)
  const { outputs, manifest, signoffDraft } = buildOutputs(
    records,
    inventory,
    extractionManifest,
    manualSignoff,
  )
  emitOutputs(outputs, options.check)
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.prepare ? 'prepare' : options.check ? 'check' : 'write',
      batchId: manifest.batchId,
      batchFileCount: manifest.summary.batchFileCount,
      batchLoc: manifest.summary.batchLoc,
      infrastructureShapeCounts: manifest.summary.infrastructureShapeCounts,
      finalRoleCounts: manifest.summary.finalRoleCounts,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
      signoffDraft: options.prepare ? signoffDraft : undefined,
    }),
  )
}

main()
