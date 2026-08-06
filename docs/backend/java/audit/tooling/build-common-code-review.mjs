import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  commonCodeShapeDetails as shapeDetails,
  commonCodeShapeFiles,
} from './common-code-review-catalog.mjs'

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
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-common-code')
const outputDirectory = process.env.DZZZ_COMMON_CODE_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_COMMON_CODE_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const previouslyReviewedFileCount = 3172
const expectedBatchFileCount = 257
const expectedBatchLoc = 33715
const shardSize = 50
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
const shapeByFileName = new Map()
for (const [shape, fileNames] of Object.entries(commonCodeShapeFiles)) {
  for (const fileName of fileNames) {
    if (shapeByFileName.has(fileName)) throw new Error(`${fileName} 存在重复职责形态`)
    shapeByFileName.set(fileName, shape)
  }
}

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

/** 读取前八批已复核路径，保证本批不重复领取。 */
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
    throw new Error(`前八批已复核路径应为 ${previouslyReviewedFileCount}，实际 ${reviewed.size}`)
  }
  return reviewed
}

/** 判断库存文件是否属于第 9 批通用代码物理范围。 */
function isPhysicalBatchFile(file) {
  return (
    file.sourceSet === 'main' &&
    (/\/bdzz\/(?:constant|enums|util)\/.*\.java$/.test(file.path) ||
      compatibilityPaths.has(file.path))
  )
}

/** 从路径推导第 9 批展示根目录。 */
function getBatchRoot(filePath) {
  if (compatibilityPaths.has(filePath)) return 'compatibility'
  return filePath.match(/\/bdzz\/(constant|enums|util)\//)?.[1]
}

/** 根据文件名和顶层声明确定通用代码职责形态。 */
function getCommonCodeShape(filePath, extractedRecord) {
  const fileName = path.basename(filePath)
  const mapped = shapeByFileName.get(fileName)
  if (mapped) return mapped
  const topLevelTypes = extractedRecord.declaredTypes.filter((item) => item.owner === null)
  if (
    filePath.includes('/bdzz/enums/') &&
    topLevelTypes.length === 1 &&
    topLevelTypes[0].kind === 'enum'
  ) {
    return 'code-label-enum'
  }
  throw new Error(`${filePath} 缺少通用代码职责形态`)
}

/** 返回源码中匹配表达式的稳定有效行号。 */
function findLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return []
    pattern.lastIndex = 0
    return pattern.test(line) ? [index + 1] : []
  })
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

/** 返回日志调用中直接引用敏感凭据变量的行号。 */
function findCredentialLoggingLines(sourceLines) {
  return sourceLines.flatMap((line, index) => {
    if (!/\b(?:log|logger)\.(?:trace|debug|info|warn|error)\s*\(/i.test(line)) return []
    const codeOnly = line.replace(/"(?:\\.|[^"\\])*"/g, '')
    return /\b(?:accessKey(?:Id|Secret)?|password|passwd|pwd|secret|token|privateKey)\b/i.test(
      codeOnly,
    )
      ? [index + 1]
      : []
  })
}

/** 从冻结声明与源码提取通用代码执行和生命周期信号。 */
function buildCommonCodeSignals(extractedRecord, sourceLines) {
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
    nullReturnLines: findLines(sourceLines, /\breturn\s+null\s*;/),
    mutableStaticStateLines: extractedRecord.fields
      .filter(
        (field) =>
          field.modifiers.includes('static') &&
          (!field.modifiers.includes('final') || /(?:Map|List|Set|Collection|ExpiringMap)/.test(field.type)),
      )
      .map((field) => field.line)
      .sort((left, right) => left - right),
    broadCatchLines: findLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/),
    emptyCatchLines: findEmptyCatchLines(sourceLines),
    hardcodedSecretLines: findLines(
      sourceLines,
      /\b(?:RSA_PRIVATE_KEY|VIDYO_PASSWORD|TEMPDESSECRETKEY|SECRET|privateKey|KEY|key)\b\s*=\s*"[^"\n]{6,}"/,
    ),
    credentialLoggingLines: findCredentialLoggingLines(sourceLines),
    weakCryptoLines: findLines(
      sourceLines,
      /(?:MD5|SHA-1|DESede|\bDES\b|RSA\/ECB\/PKCS1Padding)/i,
    ),
    insecureTlsLines: findLines(
      sourceLines,
      /(?:X509TrustManager|ALLOW_ALL_HOSTNAME_VERIFIER|TrustAllStrategy|NoopHostnameVerifier)/,
    ),
    legacyFileApiLines: findLines(
      sourceLines,
      /(?:new\s+File\s*\(|FileInputStream|FileOutputStream|FileReader|FileWriter|\.delete\s*\(|renameTo\s*\()/,
    ),
    objectDeserializationLines: findLines(sourceLines, /(?:ObjectInputStream|\.readObject\s*\()/),
    reflectionLines: findLines(
      sourceLines,
      /(?:Class\.forName|\.getDeclared(?:Field|Fields|Method|Methods)|\.getMethod\s*\(|\.invoke\s*\(|setAccessible\s*\()/,
    ),
    rawConcurrencyLines: findLines(
      sourceLines,
      /(?:new\s+Thread\s*\(|Executors\.new|new\s+ThreadPoolExecutor\s*\(|extends\s+ThreadPoolExecutor)/,
    ),
    processExecutionLines: findLines(
      sourceLines,
      /(?:Runtime\.getRuntime\(\)\.exec|new\s+ProcessBuilder\s*\()/,
    ),
    networkClientLines: findLines(
      sourceLines,
      /(?:HttpClients\.|new\s+SSLClient\s*\(|new\s+RestTemplate\s*\(|new\s+OSSClient\s*\(|openConnection\s*\(|new\s+URL\s*\()/,
    ),
    wholeBufferLines: findLines(
      sourceLines,
      /(?:ByteArrayOutputStream|IOUtils\.toByteArray|readAllBytes\s*\(|\.available\s*\(\))/,
    ),
    defaultCharsetLines: findLines(
      sourceLines,
      /(?:\.getBytes\(\)|new\s+String\([^,;]+\)|new\s+FileReader\s*\(|new\s+FileWriter\s*\()/,
    ),
  }
}

/** 添加一条包含有效源码行号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const normalized = [...new Set(lines)].filter(Number.isInteger).sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized, summary })
}

/** 根据源码证据建立第 9 批文件级风险候选。 */
function buildRisks(extractedRecord, sourceLines, shape, signals) {
  const risks = []
  const sourceText = sourceLines.join('\n')
  const topLine = extractedRecord.declaredTypes.find((item) => item.owner === null)?.line
  addRisk(
    risks,
    'broad-catch',
    signals.broadCatchLines,
    '宽泛捕获合并了不同失败语义；现代示例应捕获可处理异常并保留 cause。',
  )
  addRisk(
    risks,
    'empty-catch',
    signals.emptyCatchLines,
    '空 catch 丢失失败信息；必须传播、转换或记录可定位上下文。',
  )
  addRisk(
    risks,
    'hardcoded-secret',
    signals.hardcodedSecretLines,
    '源码内嵌私钥、签名密钥或密码无法安全轮换；现代示例必须使用受控密钥来源。',
  )
  addRisk(
    risks,
    'credential-logging',
    signals.credentialLoggingLines,
    '日志直接输出访问密钥、口令或令牌会扩大泄露面；现代示例只记录脱敏标识和必要诊断上下文。',
  )
  addRisk(
    risks,
    'weak-crypto-compatibility',
    signals.weakCryptoLines,
    'MD5、SHA-1、DES/3DES 或 RSA PKCS#1 v1.5 只作为兼容证据，不进入现代推荐方案。',
  )
  addRisk(
    risks,
    'insecure-tls-validation',
    signals.insecureTlsLines,
    '信任全部证书或主机名会失去服务端身份校验；现代客户端必须使用可信证书链和主机名校验。',
  )
  addRisk(
    risks,
    'legacy-file-api',
    signals.legacyFileApiLines,
    '旧 File API 和手工流生命周期分散了路径、关闭与异常责任；现代示例优先 Path、Files 和 try-with-resources。',
  )
  addRisk(
    risks,
    'unsafe-object-deserialization',
    signals.objectDeserializationLines,
    'Java 原生反序列化会实例化输入流中的对象；不能用于不可信输入，推荐显式数据格式和类型白名单。',
  )
  addRisk(
    risks,
    'reflection-contract',
    signals.reflectionLines,
    '反射绕过编译期合同并扩大失败面；推荐示例先使用类型化接口，必要反射需限制目标与缓存边界。',
  )
  addRisk(
    risks,
    'raw-concurrency-lifecycle',
    signals.rawConcurrencyLines,
    '裸线程或自行创建的执行器需要明确队列、拒绝、取消、关闭和上下文传播合同。',
  )
  addRisk(
    risks,
    'process-execution-boundary',
    signals.processExecutionLines,
    '启动系统进程涉及命令输入、超时、输出消费、退出码和进程清理边界。',
  )
  addRisk(
    risks,
    'default-charset',
    signals.defaultCharsetLines,
    '依赖平台默认字符集会产生环境差异；现代示例显式使用 StandardCharsets。',
  )
  if (shape === 'code-label-enum' || shape === 'legacy-video-config-singleton') {
    addRisk(
      risks,
      'mutable-enum-state',
      signals.mutableEnumFieldLines,
      '枚举实例由 JVM 全局复用；实例字段应为 private final，不能在运行期改变。',
    )
    addRisk(
      risks,
      'enum-public-setter',
      signals.enumSetterLines,
      '公开 setter 会改变全局枚举单例；现代枚举只在构造时赋值。',
    )
    addRisk(
      risks,
      'nullable-enum-lookup',
      signals.nullReturnLines,
      '枚举查找返回 null 会把失败延后；推荐明确异常、Optional 或受控 UNKNOWN 值。',
    )
  } else {
    addRisk(
      risks,
      'nullable-helper-contract',
      signals.nullReturnLines,
      '助手方法返回 null 的缺失或失败语义不明确；现代合同应区分可选结果和执行失败。',
    )
  }
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
    addRisk(
      risks,
      'mutable-static-state',
      signals.mutableStaticStateLines,
      '静态可变状态由整个进程共享；并发可见性、原子更新、容量、清理和测试复位必须显式定义。',
    )
  }
  if (shape === 'http-client-helper' || shape === 'soap-client-helper') {
    addRisk(
      risks,
      'network-client-lifecycle',
      signals.networkClientLines.length > 0 ? signals.networkClientLines : [topLine],
      '网络助手需统一定义连接池、超时、响应关闭、重试和取消，不能由每个静态方法自行决定。',
    )
  }
  if (shape === 'external-service-adapter') {
    addRisk(
      risks,
      'external-client-lifecycle',
      signals.networkClientLines.length > 0 ? signals.networkClientLines : [topLine],
      '外部客户端和响应必须限定所有权、关闭、超时、重试与幂等边界。',
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
    addRisk(
      risks,
      'whole-payload-buffer',
      signals.wholeBufferLines,
      '整份文档、图片或响应进入内存时必须限制输入大小并优先流式处理。',
    )
  }
  if (shape === 'general-purpose-helper' && /ZipInputStream/.test(sourceText)) {
    const decompressLine = extractedRecord.publicMethods.find(
      (method) => method.name === 'deCompress',
    )?.line
    addRisk(
      risks,
      'unbounded-archive-expansion',
      [decompressLine, ...findLines(sourceLines, /ZipInputStream/)],
      '压缩输入直接展开到内存且没有条目或总量上限，现代示例必须限制展开大小。',
    )
  }
  if (shape === 'identifier-generator') {
    addRisk(
      risks,
      'non-cryptographic-random',
      findLines(sourceLines, /(?:new\s+Random\s*\(|Math\.random\s*\()/),
      'Random 或 Math.random 不适合验证码、令牌和安全标识；安全用途使用 SecureRandom。',
    )
  }
  if (shape === 'configuration-facade') {
    const sensitiveMethods = extractedRecord.publicMethods
      .filter((method) => /(?:Secret|Pwd|Password|Key|Token|Sqm)/i.test(method.name))
      .map((method) => method.line)
    addRisk(
      risks,
      'sensitive-configuration-facade',
      sensitiveMethods,
      '通用静态门面暴露大量密钥和令牌配置；现代设计应类型化、最小授权并避免日志泄露。',
    )
  }
  if (shape === 'sql-blacklist-filter') {
    addRisk(
      risks,
      'security-blacklist-filter',
      findLines(sourceLines, /(?:scriptKeyWords|sqlPatternList|lowerCase\.contains|pattern\.matcher)/),
      '关键字黑名单不能替代参数绑定和上下文输出编码，只能作为补充检测层。',
    )
  }
  if (shape === 'login-data-model' || shape === 'login-request-model') {
    const sensitiveFields = extractedRecord.fields
      .filter((field) => /(?:password|yhkl|jmkl|md5|sessionToken)/i.test(field.name))
      .map((field) => field.line)
    addRisk(
      risks,
      'credential-bearing-model',
      sensitiveFields,
      '认证模型承载口令、派生值或令牌；不得进入普通日志、缓存或无边界序列化。',
    )
  }
  if (['general-purpose-helper', 'region-rule-helper', 'configuration-facade'].includes(shape)) {
    addRisk(
      risks,
      'oversized-utility-surface',
      [topLine],
      '单类聚合大量不相关或高变化能力，课程示例应按清晰职责和依赖边界拆分。',
    )
  }
  if (/Source code recreated from a \.class file|JD-Core Version/.test(sourceText)) {
    addRisk(
      risks,
      'decompiled-compatibility-code',
      [topLine],
      '反编译兼容源码只用于解释现状；现代示例不复制其原始类型、命名或生命周期设计。',
    )
  }
  return risks
}

/** 压缩 Phase 1B 内部关系为稳定的使用证据。 */
function buildUsageEvidence(extractedRecord) {
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

/** 收集当前文件的框架、标准库和关键第三方依赖。 */
function buildDependencies(extractedRecord) {
  const dependencies = new Set(extractedRecord.frameworkUsages.map((usage) => usage.id))
  for (const imported of extractedRecord.imports) {
    if (
      /^(?:java\.(?:io|nio|net|security|time|util\.concurrent|lang\.reflect)|javax\.(?:crypto|servlet|xml)|org\.(?:springframework|apache|bouncycastle)|com\.(?:aspose|spire|aliyun)|ai\.djl)/.test(
        imported.name,
      )
    ) {
      dependencies.add(imported.name)
    }
  }
  return [...dependencies].sort((left, right) => left.localeCompare(right))
}

/** 生成覆盖结构、字段、方法和通用代码信号的源码证据。 */
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
    { lines, summary: '当前源码结构、执行信号、生命周期和调用证据共同证明该文件的真实职责。' },
  ]
}

/** 建立一条等待人工签核的第 9 批逐文件记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository) {
  const sourceBuffer = fs.readFileSync(path.join(sourceRepository, file.path))
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  if ((sourceText.match(/\n/g)?.length ?? 0) !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const shape = getCommonCodeShape(file.path, extractedRecord)
  const details = shapeDetails[shape]
  if (!details) throw new Error(`${file.path} 缺少职责说明`)
  const signals = buildCommonCodeSignals(extractedRecord, sourceLines)
  const primaryType = extractedRecord.declaredTypes.find((item) => item.owner === null)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewing',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: details.finalRole,
    commonCodeRoot: getBatchRoot(file.path),
    commonCodeShape: shape,
    roleDetail: details.roleDetail,
    responsibility: details.responsibility,
    lifecycle: details.lifecycle,
    structure: {
      declaredTypeCount: extractedRecord.declaredTypes.length,
      fieldCount: extractedRecord.fields.length,
      publicMethodCount: extractedRecord.publicMethods.length,
      primaryTypeKind: primaryType?.kind,
      extends: primaryType?.extends ?? [],
      implements: primaryType?.implements ?? [],
    },
    annotationProfile: {
      names: [...new Set(extractedRecord.annotations.map((item) => item.name))].sort(),
    },
    commonCodeSignals: signals,
    frameworkUsages: extractedRecord.frameworkUsages.map((usage) => usage.id).sort(),
    usageEvidence: buildUsageEvidence(extractedRecord),
    dependencies: buildDependencies(extractedRecord),
    capabilityCandidates: details.capabilities,
    riskCandidates: buildRisks(extractedRecord, sourceLines, shape, signals),
    sourceEvidence: buildSourceEvidence(extractedRecord, signals),
  }
}

/** 为风险候选分配连续且唯一的 CC 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `CC-${String(sequence).padStart(4, '0')}`
    }
  }
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  const counts = new Map()
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 统计全部风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
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

/** 校验人工签核完整绑定当前快照和候选分片。 */
function validateManualSignoff(signoff, shards, records, inventory, extractionManifest) {
  if (signoff.schemaVersion !== 1) throw new Error('通用代码人工签核 schemaVersion 不受支持')
  if (signoff.snapshotId !== inventory.snapshotId) throw new Error('通用代码人工签核 snapshotId 不一致')
  if (signoff.analysisId !== extractionManifest.analysisId)
    throw new Error('通用代码人工签核 analysisId 不一致')
  if (signoff.batchId !== 'phase-1c-common-code' || signoff.status !== 'approved') {
    throw new Error('通用代码人工签核批次或状态不正确')
  }
  if (!signoff.reviewedBy || !signoff.reviewerType || !signoff.reviewedAt) {
    throw new Error('通用代码人工签核缺少复核身份或时间')
  }
  const expected = shards.map(({ fileName, fileCount, sha256: hash }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision: 'approved',
  }))
  if (JSON.stringify(signoff.shards) !== JSON.stringify(expected)) {
    throw new Error('通用代码逐文件记录与人工签核分片不一致')
  }
  const approvedLoc = records.reduce((total, record) => total + record.loc, 0)
  if (
    signoff.summary.approvedFileCount !== records.length ||
    signoff.summary.approvedLoc !== approvedLoc ||
    signoff.summary.approvedShardCount !== shards.length
  ) {
    throw new Error('通用代码人工签核分母不一致')
  }
}

/** 生成一份供人工复核后落盘的签核草案。 */
function buildSignoffDraft(shards, records, inventory, extractionManifest) {
  return {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-common-code',
    status: 'pending-manual-review',
    reviewedBy: 'Codex',
    reviewerType: 'agent-assisted-manual-review',
    reviewedAt: '<replace-after-review>',
    reviewMethod:
      '逐文件复核 257 个通用代码物理范围文件，并核对职责、生命周期、使用边、风险行号和角色纠正。',
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
    batchId: 'phase-1c-common-code',
    status: manualSignoff ? 'completed' : 'review-candidate',
    reviewedAt: manualSignoff?.reviewedAt ?? null,
    manualReviewSignoff: manualSignoff
      ? {
          path: 'reviews/phase-1c-common-code-signoff.json',
          sha256: sha256(fs.readFileSync(signoffPath)),
          reviewedBy: manualSignoff.reviewedBy,
          reviewerType: manualSignoff.reviewerType,
          approvedShardCount: manualSignoff.shards.length,
        }
      : null,
    batchScope: {
      roots: ['constant', 'enums', 'util', 'compatibility'],
      javaInventoryIndexRanges: buildInventoryIndexRanges(records),
      excludedReviewedPaths: previouslyReviewedFileCount,
    },
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      roleBoundary: 'physical common-code scope and final semantic role are recorded separately',
      lifecycleBoundary:
        'enum, static state, secret, thread, client, file, document, process, reflection and model lifecycles require source evidence',
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
      rootCounts: countBy(records, 'commonCodeRoot'),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      commonCodeShapeCounts: countBy(records, 'commonCodeShape'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      signalFileCounts: Object.fromEntries(
        Object.keys(records[0].commonCodeSignals).map((signal) => [
          signal,
          records.filter((record) => record.commonCodeSignals[signal].length > 0).length,
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
        unreviewed: inventory.summary.total.fileCount - previouslyReviewedFileCount - records.length,
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
        throw new Error(`第 9 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
    } else fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 9 批通用代码台账。 */
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
    throw new Error(`第 9 批冻结分母漂移：files=${files.length}, LOC=${batchLoc}`)
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
      commonCodeShapeCounts: manifest.summary.commonCodeShapeCounts,
      finalRoleCounts: manifest.summary.finalRoleCounts,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
      signoffDraft: options.prepare ? signoffDraft : undefined,
    }),
  )
}

main()
