import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-business-layer')
const outputDirectory = process.env.DZZZ_BUSINESS_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_BUSINESS_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const shardSize = 50
const batchReviewedAt = '2026-08-03T22:52:01.000Z'
const previouslyReviewedFileCount = 184

const frameworkNames = {
  'bean-validation': 'Bean Validation',
  fastjson: 'Fastjson',
  'http-client': 'HTTP Client',
  jackson: 'Jackson',
  lombok: 'Lombok',
  'mybatis-plus': 'MyBatis-Plus',
  servlet: 'Servlet API',
  'spring-boot': 'Spring Boot',
  'spring-core': 'Spring Core',
  'spring-retry': 'Spring Retry',
  'spring-scheduling-async': 'Spring Async',
  'spring-transaction': 'Spring Transaction',
  'spring-mvc': 'Spring MVC',
  'xml-jaxb': 'JAXB',
}

const ignoredDependencyTypes = new Set([
  'boolean',
  'byte',
  'byte[]',
  'char',
  'double',
  'float',
  'int',
  'Integer',
  'long',
  'Long',
  'Object',
  'String',
  'String[]',
  'void',
])

const specificRisks = {
  'dzzz-app/src/main/java/com/tdh/bdzz/service/HjptApiService.java': [
    [
      'hard-coded-secret',
      [33],
      '外部平台 APPKEY 硬编码在源码中，必须迁移到受控秘密存储并支持轮换。',
    ],
  ],
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
  const options = { check: false, sourceRepository: defaultSourceRepository }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--check') {
      options.check = true
      continue
    }
    if (argument === '--source-repo') {
      options.sourceRepository = argv[index + 1]
      index += 1
      if (!options.sourceRepository) throw new Error('--source-repo 缺少路径参数')
      continue
    }
    throw new Error(`未知参数：${argument}`)
  }
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

/** 判断冻结文件是否属于 Phase 1C 第 3 批物理范围。 */
function isBusinessLayerBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/service(?:\/.*)?\/[^/]+\.java$/.test(
    file.path,
  )
}

/** 判断记录是否使用指定框架。 */
function usesFramework(extractedRecord, frameworkId) {
  return extractedRecord.frameworkUsages.some((usage) => usage.id === frameworkId)
}

/** 判断记录是否包含指定 Java 语法信号。 */
function usesLanguageFeature(extractedRecord, featureId) {
  return extractedRecord.languageFeatures.some((feature) => feature.id === featureId)
}

/** 返回类型上的全部注解名。 */
function getTypeAnnotationNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter((annotation) => annotation.site === 'type')
      .map((annotation) => annotation.name),
  )
}

/** 根据声明种类和 Spring stereotype 确认服务形态。 */
function getServiceShape(extractedRecord) {
  if (extractedRecord.declaredTypes[0]?.kind === 'interface') return 'contract'
  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  if (typeAnnotations.has('Service') || typeAnnotations.has('Component')) return 'managed-service'
  return 'plain-support'
}

/** 提取公开方法名并保持源码顺序。 */
function getPublicMethodNames(extractedRecord) {
  return [...new Set(extractedRecord.publicMethods.map((method) => method.name))]
}

/** 生成可读的公开方法摘要。 */
function describeMethods(methodNames) {
  if (methodNames.length === 0) return '当前未声明显式公开方法'
  const visibleNames = methodNames.slice(0, 6).join('、')
  return methodNames.length === 1
    ? `公开 ${visibleNames} 这 1 个方法`
    : `公开 ${visibleNames} 等 ${methodNames.length} 个方法`
}

/** 根据服务形态生成简短、可核对的角色描述。 */
function buildRoleDetail(typeName, serviceShape, extractedRecord) {
  if (serviceShape === 'contract') return `${typeName} 业务服务合同`
  if (serviceShape === 'plain-support') return `${typeName} 普通 Java 业务支持类`
  if (usesFramework(extractedRecord, 'http-client')) return `${typeName} Spring 托管外部集成服务`
  return `${typeName} Spring 托管业务服务`
}

/** 根据接口、实现关系和公开方法生成主要职责结论。 */
function buildResponsibility(typeName, serviceShape, extractedRecord) {
  const methodDescription = describeMethods(getPublicMethodNames(extractedRecord))
  const implementedTypes = extractedRecord.declaredTypes[0]?.implements ?? []
  if (serviceShape === 'contract') {
    return `${typeName} ${methodDescription}，定义调用方与实现之间的业务合同；接口本身不负责组件创建。`
  }
  if (serviceShape === 'plain-support') {
    return `${typeName} ${methodDescription}，提供回调、规则、上下文或配置解析等普通 Java 支持能力。`
  }
  const implementationText = implementedTypes.length > 0
    ? `实现 ${implementedTypes.slice(0, 3).join('、')}，并`
    : ''
  const integrationText = usesFramework(extractedRecord, 'http-client')
    ? '，同时封装外部 HTTP 协作'
    : ''
  return `${typeName} ${implementationText}${methodDescription}，编排业务协作者${integrationText}。`
}

/** 生成准确区分接口、托管组件和普通类的生命周期说明。 */
function buildLifecycle(serviceShape, extractedRecord) {
  if (serviceShape === 'contract') {
    return '这是 Java 接口合同，本身不是 Spring Bean；只有实现类被注册后，调用方才能注入实现并经由可能存在的 Spring 代理调用。'
  }
  if (serviceShape === 'plain-support') {
    return '这是未声明 @Service 或 @Component 的普通 Java 类，不会被组件扫描自动创建；生命周期由直接构造、静态调用或显式 @Bean 注册的调用方负责。'
  }
  const hasTransactional = extractedRecord.annotations.some(
    (annotation) => annotation.name === 'Transactional',
  )
  const hasAsync = extractedRecord.annotations.some((annotation) => annotation.name === 'Async')
  const proxyFeatures = []
  if (hasTransactional) proxyFeatures.push('@Transactional')
  if (hasAsync) proxyFeatures.push('@Async')
  if (proxyFeatures.length > 0) {
    return `Spring 通过组件扫描创建该服务；${proxyFeatures.join(' 和 ')} 只在符合条件的代理调用上生效，类内自调用不会自动跨越代理边界。`
  }
  return 'Spring 通过 @Service 或 @Component 组件扫描创建该服务，并按容器管理的依赖注入与单例生命周期提供给调用方。'
}

/** 判断类型是否值得作为主要依赖展示。 */
function isRelevantDependency(typeName) {
  if (!typeName || ignoredDependencyTypes.has(typeName)) return false
  if (/^[A-Z]$/.test(typeName)) return false
  return !/^(?:List|Map|Set|Collection|Optional|Page|IPage)(?:<.*>)?$/.test(typeName)
}

/** 汇总主要框架、协作者、实现合同和方法边界类型。 */
function buildDependencies(extractedRecord) {
  const signatureTypes = extractedRecord.publicMethods.flatMap((method) => [
    method.returnType,
    ...method.parameterTypes,
  ])
  const dependencies = [
    ...extractedRecord.frameworkUsages.map((usage) => frameworkNames[usage.id] ?? usage.id),
    ...extractedRecord.fields.map((field) => field.type),
    ...(extractedRecord.declaredTypes[0]?.extends ?? []),
    ...(extractedRecord.declaredTypes[0]?.implements ?? []),
    ...signatureTypes,
  ].filter(isRelevantDependency)
  return [...new Set(dependencies)].slice(0, 12)
}

/** 根据服务形态、框架和 Java 语法生成能力候选。 */
function buildCapabilityCandidates(serviceShape, extractedRecord, sourceLines) {
  const annotationNames = new Set(extractedRecord.annotations.map((annotation) => annotation.name))
  const parameterTypes = extractedRecord.publicMethods.flatMap((method) => method.parameterTypes)
  const capabilities = []
  if (serviceShape === 'contract') capabilities.push('接口合同', '多态与实现替换', '服务分层')
  if (serviceShape === 'managed-service') capabilities.push('组件扫描', '依赖注入', 'Service 分层')
  if (serviceShape === 'plain-support') capabilities.push('普通类生命周期', '显式对象创建')
  if (annotationNames.has('Service')) capabilities.push('@Service stereotype')
  if (annotationNames.has('Component')) capabilities.push('@Component stereotype')
  const hasRequiredConstructorDependency = extractedRecord.fields.some(
    (field) => field.modifiers.includes('final') || field.annotations?.includes('NonNull'),
  )
  if (annotationNames.has('RequiredArgsConstructor') && hasRequiredConstructorDependency) {
    capabilities.push('构造器注入')
  }
  if (annotationNames.has('Autowired') || annotationNames.has('Resource')) capabilities.push('Spring 依赖注入')
  if (annotationNames.has('Transactional')) capabilities.push('声明式事务', '事务代理边界')
  if (annotationNames.has('Async')) capabilities.push('异步方法', '异步代理边界')
  if (usesFramework(extractedRecord, 'spring-retry')) capabilities.push('重试')
  if (usesFramework(extractedRecord, 'http-client')) capabilities.push('外部 HTTP 调用')
  if (usesFramework(extractedRecord, 'mybatis-plus')) capabilities.push('MyBatis-Plus')
  if (usesLanguageFeature(extractedRecord, 'io')) capabilities.push('Java I/O', '资源管理')
  if (usesLanguageFeature(extractedRecord, 'try-with-resources')) capabilities.push('try-with-resources')
  if (usesLanguageFeature(extractedRecord, 'concurrency')) capabilities.push('并发与执行器')
  if (usesLanguageFeature(extractedRecord, 'synchronized-block')) capabilities.push('同步块与锁')
  if (usesLanguageFeature(extractedRecord, 'lambda')) capabilities.push('Lambda')
  if (usesLanguageFeature(extractedRecord, 'stream-api')) capabilities.push('Stream API')
  if (parameterTypes.some((type) => /HttpServletRequest|HttpServletResponse/.test(type))) {
    capabilities.push('Servlet 请求响应边界')
  }
  if (parameterTypes.some((type) => type.includes('MultipartFile'))) capabilities.push('文件上传')
  if (usesFramework(extractedRecord, 'bean-validation')) capabilities.push('Bean Validation')
  if (sourceLines.some((line) => /\bThreadLocal\s*</.test(line))) capabilities.push('ThreadLocal 上下文')
  return [...new Set(capabilities)]
}

/** 收集源码中匹配正则的行号。 */
function findLines(lines, expression) {
  const matches = []
  lines.forEach((line, index) => {
    expression.lastIndex = 0
    if (expression.test(line)) matches.push(index + 1)
  })
  return matches
}

/** 添加一条尚未编号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const validLines = [...new Set(lines)].sort((left, right) => left - right)
  if (validLines.length === 0) return
  risks.push({ category, lines: validLines, summary })
}

/** 判断公开方法是否声明顶层异常。 */
function declaresGeneralException(method) {
  return method.throws.some((typeName) => /(?:^|\.)(?:Exception|Throwable)$/.test(typeName))
}

/** 返回直接暴露 Servlet 或上传类型的公开方法行号。 */
function findTransportCouplingLines(extractedRecord) {
  return extractedRecord.publicMethods
    .filter((method) =>
      method.parameterTypes.some((typeName) =>
        /HttpServletRequest|HttpServletResponse|MultipartFile/.test(typeName),
      ),
    )
    .map((method) => method.line)
}

/** 依据逐文件源码复核信号生成通用风险候选。 */
function buildGenericRisks(file, extractedRecord, sourceLines, serviceShape) {
  const risks = []
  const fieldInjectionLines = extractedRecord.annotations
    .filter(
      (annotation) =>
        annotation.site === 'field' && ['Autowired', 'Resource'].includes(annotation.name),
    )
    .map((annotation) => annotation.line)
  addRisk(risks, 'field-injection', fieldInjectionLines, '字段注入隐藏必需依赖，现代示例应使用构造器注入。')

  addRisk(
    risks,
    'broad-catch',
    findLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/),
    '业务服务捕获顶层异常，需区分可恢复失败、编程错误和统一异常边界。',
  )
  addRisk(
    risks,
    'general-exception-contract',
    extractedRecord.publicMethods.filter(declaresGeneralException).map((method) => method.line),
    '公开业务方法声明宽泛 Exception 或 Throwable，调用合同和恢复策略不明确。',
  )
  if (serviceShape !== 'contract' && file.loc > 1000) {
    addRisk(
      risks,
      'oversized-service',
      [extractedRecord.declaredTypes[0]?.line ?? 1],
      `该业务类达到 ${file.loc} LOC，事务、外部协作和领域编排边界需要继续拆分。`,
    )
  }
  addRisk(
    risks,
    'transport-coupling',
    findTransportCouplingLines(extractedRecord),
    '业务合同或实现直接接收 Servlet/MultipartFile 类型，使传输层与业务层边界耦合。',
  )
  addRisk(
    risks,
    'static-request-context',
    findLines(sourceLines, /\bWebAppContext\./),
    '业务服务静态读取当前请求或用户上下文，隐藏输入并增加异步传播与测试难度。',
  )
  addRisk(
    risks,
    'service-locator',
    findLines(sourceLines, /\bSpringContext\.getBean\s*\(/),
    '运行时通过 Service Locator 获取 Bean，隐藏依赖并绕过构造器合同。',
  )
  addRisk(
    risks,
    'manual-thread',
    findLines(sourceLines, /\bnew\s+Thread\s*\(/),
    '业务方法直接创建线程，缺少统一线程池容量、上下文传播、关闭和失败观测。',
  )
  addRisk(
    risks,
    'unmanaged-executor',
    findLines(
      sourceLines,
      /\bExecutors\.(?:newSingleThreadExecutor|newFixedThreadPool|newCachedThreadPool|newScheduledThreadPool|newWorkStealingPool)\s*\(/,
    ),
    '业务方法临时创建 Executor，需由容器统一管理容量、命名、拒绝策略和关闭。',
  )
  addRisk(
    risks,
    'synchronization-boundary',
    findLines(sourceLines, /\bsynchronized\s*\(/),
    '进程内同步块只能约束当前 JVM，需核对锁粒度、阻塞时长和集群一致性需求。',
  )
  addRisk(
    risks,
    'interned-string-lock',
    findLines(sourceLines, /\bsynchronized\s*\([^)]*\.intern\(\)/),
    '使用 String.intern() 作为业务锁会共享全局字符串池，存在不可控锁碰撞和内存生命周期。',
  )
  addRisk(
    risks,
    'closeable-resource-boundary',
    findLines(
      sourceLines,
      /\bnew\s+(?:FileInputStream|FileOutputStream|BufferedInputStream|BufferedOutputStream|ObjectInputStream|ObjectOutputStream|FileReader|FileWriter)\s*\(/,
    ),
    '代码直接创建可关闭 I/O 资源，需逐调用点确认 try-with-resources 或明确所有权转移。',
  )
  addRisk(
    risks,
    'http-client-lifecycle',
    findLines(sourceLines, /\bHttpClients\.createDefault\s*\(/),
    '代码直接创建 CloseableHttpClient，需确认连接池复用、超时配置和关闭责任。',
  )
  addRisk(
    risks,
    'null-return-contract',
    findLines(sourceLines, /\breturn\s+null\s*;/),
    '代码用 null 表达缺失或失败，需逐方法确认是否应使用空集合、Optional、明确结果或异常合同。',
  )
  addRisk(
    risks,
    'thread-local-lifecycle',
    findLines(sourceLines, /\b(?:new\s+)?ThreadLocal\s*</),
    'ThreadLocal 上下文必须在 finally 中清理，并在异步边界显式复制或重新建立。',
  )

  const transactionalLines = extractedRecord.annotations
    .filter((annotation) => annotation.name === 'Transactional')
    .map((annotation) => annotation.line)
  const sideEffectMix =
    usesFramework(extractedRecord, 'http-client') ||
    usesLanguageFeature(extractedRecord, 'io') ||
    usesLanguageFeature(extractedRecord, 'concurrency')
  if (transactionalLines.length > 0 && sideEffectMix) {
    addRisk(
      risks,
      'transaction-side-effect-mix',
      transactionalLines,
      '同一业务类同时出现事务与 HTTP、I/O 或并发信号，需逐方法确认数据库事务没有包住不可回滚的外部副作用或长等待。',
    )
  }
  return risks
}

/** 合并人工确认的文件专属风险候选。 */
function appendSpecificRisks(filePath, risks) {
  for (const [category, lines, summary] of specificRisks[filePath] ?? []) {
    addRisk(risks, category, lines, summary)
  }
  return risks
}

/** 生成能追溯类型形态、公开合同和代理能力的源码证据。 */
function buildSourceEvidence(extractedRecord, serviceShape) {
  const lifecycleAnnotationLines = extractedRecord.annotations
    .filter((annotation) =>
      ['Async', 'Autowired', 'Component', 'RequiredArgsConstructor', 'Resource', 'Service', 'Transactional'].includes(
        annotation.name,
      ),
    )
    .map((annotation) => annotation.line)
  const methodLines = extractedRecord.publicMethods.flatMap((method) => [method.line, method.endLine])
  const lines = [
    extractedRecord.declaredTypes[0]?.line,
    ...lifecycleAnnotationLines,
    ...methodLines,
  ].filter(Number.isInteger)
  const uniqueLines = [...new Set(lines)].sort((left, right) => left - right)
  const selectedLines = uniqueLines.length <= 80
    ? uniqueLines
    : [...uniqueLines.slice(0, 40), ...uniqueLines.slice(-40)]
  const summary = serviceShape === 'contract'
    ? '接口声明和公开方法边界共同证明该文件只定义业务合同，不提供容器托管实现。'
    : '类型声明、组件与代理注解、公开方法边界共同证明该文件的服务形态和主要实现。'
  return [{ lines: selectedLines, summary }]
}

/** 建立一条业务层人工复核台账记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  const frozenLoc = sourceText.match(/\n/g)?.length ?? 0
  if (frozenLoc !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const typeName = extractedRecord.declaredTypes[0]?.name ?? path.basename(file.path, '.java')
  const serviceShape = getServiceShape(extractedRecord)
  const dependencies = buildDependencies(extractedRecord)
  const risks = appendSpecificRisks(
    file.path,
    buildGenericRisks(file, extractedRecord, sourceLines, serviceShape),
  )
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewed',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: 'business',
    serviceShape,
    roleDetail: buildRoleDetail(typeName, serviceShape, extractedRecord),
    responsibility: buildResponsibility(typeName, serviceShape, extractedRecord),
    lifecycle: buildLifecycle(serviceShape, extractedRecord),
    dependencies: dependencies.length > 0 ? dependencies : ['Java 标准库'],
    capabilityCandidates: buildCapabilityCandidates(serviceShape, extractedRecord, sourceLines),
    riskCandidates: risks,
    sourceEvidence: buildSourceEvidence(extractedRecord, serviceShape),
  }
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

/** 统计全部风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 为全部风险候选分配连续且唯一的 BL 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `BL-${String(sequence).padStart(3, '0')}`
    }
  }
}

/** 生成 JSONL 分片和批次 manifest 的稳定文本。 */
function buildOutputs(records, inventory, extractionManifest, generatedAt) {
  const outputs = new Map()
  const shards = []
  for (let offset = 0; offset < records.length; offset += shardSize) {
    const shardRecords = records.slice(offset, offset + shardSize)
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
  const riskCandidateCount = records.reduce(
    (total, record) => total + record.riskCandidates.length,
    0,
  )
  const reviewedFileCount = previouslyReviewedFileCount + records.length
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-business-layer',
    status: 'completed',
    reviewedAt: generatedAt,
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      serviceShape: 'contract | managed-service | plain-support',
    },
    summary: {
      batchFileCount: records.length,
      batchLoc: records.reduce((total, record) => total + record.loc, 0),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      serviceShapeCounts: countBy(records, 'serviceShape'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      riskCandidateCount,
      riskCategoryCounts: countRiskCategories(records),
      currentAuditStatusCounts: {
        unreviewed: inventory.summary.total.fileCount - reviewedFileCount,
        reviewing: 0,
        reviewed: reviewedFileCount,
        blocked: 0,
      },
    },
    shards,
  }
  outputs.set(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return outputs
}

/** 写入输出，或在 check 模式逐字节验证现有产物。 */
function emitOutputs(outputs, check) {
  if (!check) fs.mkdirSync(outputDirectory, { recursive: true })
  for (const [filePath, content] of outputs) {
    if (check) {
      if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
        throw new Error(`第 3 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
      continue
    }
    fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 3 批业务层台账。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const files = inventory.files.filter(isBusinessLayerBatchFile)
  const records = files.map((file) => {
    const extractedRecord = extractedByPath.get(file.path)
    if (!extractedRecord) throw new Error(`${file.path} 缺少 Phase 1B 记录`)
    return buildReviewRecord(file, extractedRecord, options.sourceRepository)
  })
  assignRiskIds(records)
  const outputs = buildOutputs(records, inventory, extractionManifest, batchReviewedAt)
  emitOutputs(outputs, options.check)
  const manifest = JSON.parse(outputs.get(outputManifestPath))
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.check ? 'check' : 'write',
      batchId: manifest.batchId,
      batchFileCount: manifest.summary.batchFileCount,
      batchLoc: manifest.summary.batchLoc,
      serviceShapeCounts: manifest.summary.serviceShapeCounts,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
    }),
  )
}

main()
