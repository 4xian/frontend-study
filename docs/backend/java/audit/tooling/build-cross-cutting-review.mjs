import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultSignoffPath = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-cross-cutting-signoff.json',
)
const manualSignoffPath = process.env.DZZZ_CROSS_CUTTING_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_CROSS_CUTTING_SIGNOFF_PATH)
  : defaultSignoffPath
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-cross-cutting')
const outputDirectory = process.env.DZZZ_CROSS_CUTTING_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_CROSS_CUTTING_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const previouslyReviewedFileCount = 2888
const shardSize = 50
const batchRoots = ['annoation', 'aop', 'context', 'exception', 'validator']
const standardValidationNames = new Set([
  'Constraint.java',
  'Min.java',
  'NotBlank.java',
  'NotNull.java',
  'Size.java',
  'Valid.java',
])

const shapeDetails = {
  'annotation-contract': {
    roleDetail: '运行时自定义注解合同',
    responsibility: '声明方法、参数或字段上的横切元数据，由切面或自定义校验入口解释。',
    lifecycle: '注解元数据随类型加载；是否生效取决于运行时读取入口和目标位置。',
    capabilities: ['Java 注解元数据', '注解目标与保留策略', '横切合同设计'],
  },
  'annotation-validator': {
    roleDetail: '自定义注解校验器',
    responsibility: '解释项目私有约束并返回校验结果或错误消息。',
    lifecycle: '由 Bean Validation 或项目 ValidatorUtil 创建；实例复用边界必须由调用入口确认。',
    capabilities: ['自定义校验器', '校验空值与类型语义', '错误消息边界'],
  },
  'validation-contract': {
    roleDetail: '项目私有校验器接口',
    responsibility: '定义约束初始化、值校验和错误消息读取合同。',
    lifecycle: '接口本身无状态；具体实现的状态和实例生命周期由创建入口决定。',
    capabilities: ['泛型接口', '默认方法', '校验扩展点'],
  },
  'validation-result-model': {
    roleDetail: '项目私有校验结果模型',
    responsibility: '承载校验错误、错误数量和错误消息聚合结果。',
    lifecycle: '随一次项目私有校验调用创建和传递，不应跨请求共享。',
    capabilities: ['校验结果建模', '错误聚合', '数据输出边界'],
  },
  aspect: {
    roleDetail: 'Spring AOP 切面',
    responsibility: '在业务或 Controller 调用边界执行校验、分片、限流、日志或异常处理。',
    lifecycle: '由 Spring 作为单例组件管理；字段状态会被并发请求共享。',
    capabilities: ['Spring AOP advice', '反射与注解读取', '横切异常边界'],
  },
  'pointcut-declaration': {
    roleDetail: 'Spring AOP 切点声明',
    responsibility: '集中定义业务实现层方法的匹配表达式。',
    lifecycle: '作为 AOP 元数据被 Spring 解析，不承载请求状态。',
    capabilities: ['AspectJ 切点表达式', '代理匹配边界'],
  },
  'startup-hook': {
    roleDetail: '启动期初始化钩子',
    responsibility: '在 Spring Boot 启动后初始化外部文档处理上下文。',
    lifecycle: 'Spring 创建组件后由 CommandLineRunner 调用一次。',
    capabilities: ['Spring Boot 启动回调', '外部资源初始化'],
  },
  'application-context-bridge': {
    roleDetail: 'Spring ApplicationContext 静态桥接器',
    responsibility: '保存 Spring 容器引用并提供按名称或类型查找 Bean 的入口。',
    lifecycle: 'Spring 注入一次静态容器引用，随后被进程内调用者共享。',
    capabilities: ['ApplicationContextAware', 'Bean 查找', '依赖获取边界'],
  },
  'thread-context-holder': {
    roleDetail: '线程分片上下文持有者',
    responsibility: '在线程本地变量中保存当前调用的分表数据。',
    lifecycle: '值绑定工作线程，使用方必须在调用结束的 finally 路径清理。',
    capabilities: ['ThreadLocal', '线程上下文传播', '清理责任'],
  },
  'request-context-accessor': {
    roleDetail: '当前请求与会话上下文访问器',
    responsibility: '从 Spring RequestContextHolder 读取请求、会话和当前用户信息。',
    lifecycle: '仅在已绑定 Servlet 请求的线程内有效，不拥有请求或会话生命周期。',
    capabilities: ['RequestContextHolder', 'Servlet 会话', '当前用户边界'],
  },
  'application-event': {
    roleDetail: 'Spring 应用事件载体',
    responsibility: '把一次业务事件的来源和载荷交给 Spring 事件监听边界。',
    lifecycle: '每次发布创建一个事件对象；同步或异步执行取决于事件 multicaster 配置。',
    capabilities: ['Spring ApplicationEvent', '事件载荷', '发布与监听边界'],
  },
  'application-event-publisher': {
    roleDetail: 'Spring 应用事件发布器',
    responsibility: '封装 ApplicationEventPublisher 并发布项目事件。',
    lifecycle: '由 Spring 管理并在调用时把事件交给当前 multicaster。',
    capabilities: ['ApplicationEventPublisher', '事件发布语义'],
  },
  'exception-type': {
    roleDetail: '项目运行时异常类型',
    responsibility: '表达参数校验、业务处理或限流失败。',
    lifecycle: '在失败路径创建并沿调用栈传播，直到被明确处理。',
    capabilities: ['异常层级', 'cause 保留', '业务错误边界'],
  },
  'global-exception-handler': {
    roleDetail: 'Spring MVC 全局异常处理器',
    responsibility: '把 Controller 边界异常转换为项目响应对象。',
    lifecycle: '由 Spring 作为 ControllerAdvice 单例管理。',
    capabilities: ['ControllerAdvice', 'ExceptionHandler', 'HTTP 错误映射'],
  },
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
    if (argument === '--check') {
      options.check = true
      continue
    }
    if (argument === '--prepare') {
      options.prepare = true
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

/** 判断冻结文件是否属于 Phase 1C 第 6 批横切能力范围。 */
function isCrossCuttingBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:annoation|aop|context|exception|validator)\/.*\.java$/.test(
    file.path,
  )
}

/** 从批次路径提取物理根目录。 */
function getBatchRoot(filePath) {
  return filePath.match(/\/bdzz\/(annoation|aop|context|exception|validator)\//)?.[1]
}

/** 根据精确源码职责确定横切能力形态。 */
function getCrossCuttingShape(filePath) {
  const fileName = path.basename(filePath)
  if (filePath.includes('/annoation/impl/')) return 'annotation-validator'
  if (filePath.includes('/annoation/')) return 'annotation-contract'
  if (filePath.includes('/aop/')) return fileName === 'PointCuts.java' ? 'pointcut-declaration' : 'aspect'
  if (filePath.includes('/context/event/')) {
    return fileName === 'EventPublisher.java' ? 'application-event-publisher' : 'application-event'
  }
  if (fileName === 'InitializeYjbjWord.java') return 'startup-hook'
  if (fileName === 'SpringContext.java') return 'application-context-bridge'
  if (fileName === 'TableShardContext.java') return 'thread-context-holder'
  if (fileName === 'WebAppContext.java') return 'request-context-accessor'
  if (filePath.includes('/exception/')) {
    return fileName === 'GloableExceptionHandler.java'
      ? 'global-exception-handler'
      : 'exception-type'
  }
  if (fileName === 'ConstraintValidator.java') return 'validation-contract'
  if (['Error.java', 'Result.java'].includes(fileName)) return 'validation-result-model'
  return 'annotation-validator'
}

/** 根据真实职责纠正最终角色。 */
function getFinalRole(shape) {
  return ['application-event', 'application-event-publisher'].includes(shape)
    ? 'async-integration'
    : 'cross-cutting'
}

/** 返回源码中匹配正则的稳定行号。 */
function findLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => (pattern.test(line) ? [index + 1] : []))
}

/** 添加一条包含有效源码行号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const uniqueLines = [...new Set(lines)].sort((left, right) => left - right)
  if (uniqueLines.length > 0) risks.push({ category, lines: uniqueLines, summary })
}

/** 独立登记当前源码中的横切边界风险候选。 */
function buildRisks(file, extractedRecord, sourceLines, shape) {
  const risks = []
  const sourceText = sourceLines.join('\n')
  const fileName = path.basename(file.path)
  addRisk(
    risks,
    'legacy-misspelled-contract',
    findLines(sourceLines, /annoation|Messgae|Gloable/),
    '包名或公开合同保留历史拼写错误；课程示例必须使用正确命名，并只在 legacy 补充中解释映射。',
  )
  if (
    extractedRecord.declaredTypes[0]?.kind === 'annotation' &&
    sourceText.includes('@Inherited') &&
    !/ElementType\.TYPE\b/.test(sourceText)
  ) {
    addRisk(
      risks,
      'ineffective-inherited-annotation',
      [
        ...findLines(sourceLines, /@Inherited/),
        ...findLines(sourceLines, /@Target/),
      ],
      '@Inherited 只影响类级注解继承，对当前字段、方法或参数目标不产生继承效果。',
    )
  }
  if (standardValidationNames.has(fileName)) {
    addRisk(
      risks,
      'custom-validation-name-collision',
      [extractedRecord.declaredTypes[0].line],
      '项目私有注解与 Jakarta Validation 标准名称重合，导入错误时会得到不同校验语义。',
    )
  }
  if (shape === 'annotation-validator') {
    addRisk(
      risks,
      'custom-validator-contract',
      [extractedRecord.declaredTypes[0].line],
      '项目私有校验器的空值、类型和错误消息语义必须由显式测试固定，不能当作标准约束教授。',
    )
  }
  if (['MinValidator.java', 'SizeValidator.java'].includes(fileName)) {
    addRisk(
      risks,
      'unsupported-validator-type-passes',
      findLines(sourceLines, /className|instanceof|return bl/),
      '校验器对非预期类型可能直接通过，调用方不能把类型错误当作已验证。',
    )
  }
  if (fileName === 'NotNullElementValidator.java') {
    addRisk(
      risks,
      'validator-array-assumption',
      findLines(sourceLines, /Object\[\] objects|\(Object\[\]\) object|for \(Object o : objects\)/),
      '实现假设输入一定是对象数组或集合；其他对象与基本类型数组需要单独定义行为。',
    )
  }
  if (fileName === 'Error.java') {
    addRisk(
      risks,
      'validation-error-prints-raw-value',
      findLines(sourceLines, /String toString|", value="/),
      '校验错误的 toString 会输出原始值，日志链路可能泄露业务或敏感输入。',
    )
  }
  if (fileName === 'PointCuts.java') {
    addRisk(
      risks,
      'broad-service-pointcut',
      findLines(sourceLines, /execution\(public \* com\.tdh\.bdzz\.service\.impl/),
      '切点覆盖全部业务实现公开方法，新增方法会自动进入校验和日志横切行为。',
    )
  }
  if (fileName === 'DzzzAspect.java') {
    addRisk(
      risks,
      'aspect-logs-arguments-or-results',
      findLines(sourceLines, /joinPoint\.getArgs\(\)|^\s*result\s*$/),
      '切面直接记录参数或返回对象，必须先建立字段级去敏与大小限制。',
    )
    addRisk(
      risks,
      'aspect-alters-exception-flow',
      findLines(sourceLines, /throw new BpException/),
      '切面重新包装异常会改变上层按类型处理的合同，必须保留 cause 并明确映射边界。',
    )
    addRisk(
      risks,
      'commented-context-cleanup',
      findLines(sourceLines, /\/\/.*cleanContext/),
      '分表或分库上下文清理被注释，线程复用时需要由可证明的 finally 边界负责清理。',
    )
    addRisk(
      risks,
      'reflection-driven-parameter-contract',
      findLines(sourceLines, /ReflectionCacheUtil/),
      '运行时依赖反射恢复方法参数与实例，重载、代理类型和构造要求需要独立验证。',
    )
  }
  if (fileName === 'AppAspect.java') {
    addRisk(
      risks,
      'aspect-alters-exception-flow',
      findLines(sourceLines, /catch \(Throwable|return null/),
      '环绕通知捕获 Throwable 后返回 null，会把失败改写为看似成功的空结果。',
    )
    addRisk(
      risks,
      'string-intern-monitor',
      findLines(sourceLines, /synchronized \(orgin\.intern\(\)\)/),
      '以外部来源字符串的 intern 对象作为锁会扩大共享锁和字符串池边界。',
    )
    addRisk(
      risks,
      'unbounded-rate-limiter-cache',
      findLines(sourceLines, /rateLimiterMap|\.put\(orgin/),
      '按调用方标识缓存限流器但没有回收边界，标识基数增长会长期占用内存。',
    )
  }
  if (fileName === 'SpringContext.java') {
    addRisk(
      risks,
      'static-service-locator',
      findLines(sourceLines, /static ApplicationContext|applicationContext\.getBean/),
      '静态 Bean 查找隐藏依赖并削弱隔离测试，应优先使用显式构造器注入。',
    )
  }
  if (fileName === 'TableShardContext.java') {
    addRisk(
      risks,
      'thread-local-cleanup-obligation',
      findLines(sourceLines, /ThreadLocal|\.remove\(\)/),
      'ThreadLocal 值必须在同一调用边界的 finally 中清理，不能只暴露可选 clean 方法。',
    )
    addRisk(
      risks,
      'raw-thread-local-type',
      findLines(sourceLines, /new ThreadLocal\(\)/),
      '原始类型实例化丢失泛型约束，现代写法应使用 new ThreadLocal<>()。',
    )
  }
  if (fileName === 'WebAppContext.java') {
    addRisk(
      risks,
      'ambient-request-session-context',
      findLines(sourceLines, /RequestContextHolder|getCurrentSession|getCurrentUser/),
      '静态读取当前请求和会话形成环境依赖，异步线程与无请求调用必须显式处理。',
    )
    addRisk(
      risks,
      'anonymous-user-fallback-object',
      findLines(sourceLines, /return new UserBean\(\)/),
      '无会话时返回空用户对象会混淆未登录与已登录但字段为空两种状态。',
    )
  }
  if (fileName === 'InitializeYjbjWord.java') {
    addRisk(
      risks,
      'startup-external-initialization',
      findLines(sourceLines, /void run|AsposeContext\.initContext/),
      '启动回调直接初始化外部组件；失败策略、幂等性和关闭责任需要明确。',
    )
  }
  if (shape === 'application-event' && extractedRecord.annotations.some((item) => item.name === 'Data')) {
    addRisk(
      risks,
      'mutable-application-event',
      extractedRecord.annotations.filter((item) => item.name === 'Data').map((item) => item.line),
      '事件使用 Lombok @Data 暴露可变载荷，发布后修改会让监听者观察到不稳定状态。',
    )
  }
  if (shape === 'application-event-publisher') {
    addRisk(
      risks,
      'event-publication-mode-not-local',
      findLines(sourceLines, /publishEvent/),
      '发布器本身不能证明同步或异步执行，课程必须结合 ApplicationEventMulticaster 配置说明。',
    )
  }
  if (shape === 'global-exception-handler') {
    addRisk(
      risks,
      'broad-global-exception-handler',
      findLines(sourceLines, /@ExceptionHandler\(Exception\.class\)/),
      '兜底处理 Exception 会覆盖大量错误类型，必须按稳定错误合同区分可预期与系统异常。',
    )
    if (!sourceText.includes('@ResponseStatus')) {
      addRisk(
        risks,
        'exception-response-without-http-status',
        findLines(sourceLines, /@ExceptionHandler/),
        '异常处理只返回响应体而未声明 HTTP 状态，客户端可能无法按协议区分失败。',
      )
    }
    addRisk(
      risks,
      'exception-message-in-response',
      findLines(sourceLines, /ResultEO\.fail\(e\.getMessage\(\)\)|append\(fieldError/),
      '直接返回异常或字段消息需要稳定错误码和去敏边界，不能暴露内部实现文本。',
    )
  }
  const mutableStaticFieldLines = extractedRecord.fields
    .filter(
      (field) => field.modifiers.includes('static') && !field.modifiers.includes('final'),
    )
    .map((field) => field.line)
  addRisk(
    risks,
    'mutable-static-context',
    mutableStaticFieldLines,
    '静态可变上下文由整个进程共享，初始化、并发可见性和测试复位责任需要明确。',
  )
  return risks
}

/** 把内部 CodeGraph 候选压缩为稳定的使用证据。 */
function buildUsageEvidence(extractedRecord) {
  /** 只保留单条候选中可复核且可稳定重建的字段。 */
  const normalizeCandidate = (candidate) => ({
    kind: candidate.kind,
    sourcePath: candidate.sourcePath,
    sourceSymbol: candidate.sourceSymbol,
    targetPath: candidate.targetPath,
    targetSymbol: candidate.targetSymbol,
    occurrences: candidate.occurrences,
    lines: candidate.lines,
  })
  const inbound = extractedRecord.codeGraph.internalInboundCandidates.map(normalizeCandidate)
  const outbound = extractedRecord.codeGraph.internalOutboundCandidates.map(normalizeCandidate)
  return {
    inbound,
    outbound,
    inboundOccurrenceCount: inbound.reduce((total, item) => total + item.occurrences, 0),
    outboundOccurrenceCount: outbound.reduce((total, item) => total + item.occurrences, 0),
  }
}

/** 收集与当前横切实现直接相关的依赖。 */
function buildDependencies(extractedRecord) {
  const dependencies = new Set(extractedRecord.frameworkUsages.map((usage) => usage.id))
  for (const imported of extractedRecord.imports) {
    if (/^(?:com\.tdh\.bdzz|javax\.|org\.aspectj|org\.springframework)/.test(imported.name)) {
      dependencies.add(imported.name)
    }
  }
  return [...dependencies].sort((left, right) => left.localeCompare(right))
}

/** 生成覆盖类型、字段、注解和公开方法的源码证据。 */
function buildSourceEvidence(extractedRecord) {
  const lines = [
    ...extractedRecord.declaredTypes.map((item) => item.line),
    ...extractedRecord.annotations.map((item) => item.line),
    ...extractedRecord.fields.map((item) => item.line),
    ...extractedRecord.publicMethods.flatMap((item) => [item.line, item.endLine]),
  ]
    .filter(Number.isInteger)
    .filter((line, index, values) => values.indexOf(line) === index)
    .sort((left, right) => left - right)
  return [{ lines, summary: '类型、字段、注解和公开方法共同证明该文件的横切职责与调用合同。' }]
}

/** 建立一条等待人工签核的第 6 批逐文件记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  const frozenLoc = sourceText.match(/\n/g)?.length ?? 0
  if (frozenLoc !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const shape = getCrossCuttingShape(file.path)
  const details = shapeDetails[shape]
  const usageEvidence = buildUsageEvidence(extractedRecord)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewing',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: getFinalRole(shape),
    crossCuttingRoot: getBatchRoot(file.path),
    crossCuttingShape: shape,
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
      targetLines: extractedRecord.annotations
        .filter((item) => item.name === 'Target')
        .map((item) => item.line),
      retentionLines: extractedRecord.annotations
        .filter((item) => item.name === 'Retention')
        .map((item) => item.line),
    },
    frameworkUsages: extractedRecord.frameworkUsages.map((usage) => usage.id).sort(),
    usageEvidence,
    dependencies: buildDependencies(extractedRecord),
    capabilityCandidates: details.capabilities,
    riskCandidates: buildRisks(file, extractedRecord, sourceLines, shape),
    sourceEvidence: buildSourceEvidence(extractedRecord),
  }
}

/** 为风险候选分配连续且唯一的 XC 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `XC-${String(sequence).padStart(4, '0')}`
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
    } else {
      current[1] = record.inventoryIndex
    }
  }
  return ranges
}

/** 校验人工签核完整绑定当前快照和逐文件分片。 */
function validateManualSignoff(signoff, shards, records, inventory, extractionManifest) {
  if (signoff.schemaVersion !== 1) throw new Error('横切能力人工签核 schemaVersion 不受支持')
  if (signoff.snapshotId !== inventory.snapshotId) throw new Error('横切能力人工签核 snapshotId 不一致')
  if (signoff.analysisId !== extractionManifest.analysisId) {
    throw new Error('横切能力人工签核 analysisId 不一致')
  }
  if (signoff.batchId !== 'phase-1c-cross-cutting' || signoff.status !== 'approved') {
    throw new Error('横切能力人工签核批次或状态不正确')
  }
  if (!signoff.reviewedBy || !signoff.reviewerType || !signoff.reviewedAt) {
    throw new Error('横切能力人工签核缺少复核身份或时间')
  }
  const expectedShards = shards.map(({ fileName, fileCount, sha256: hash }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision: 'approved',
  }))
  const actualShards = signoff.shards.map(({ fileName, fileCount, sha256: hash, decision }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision,
  }))
  if (JSON.stringify(actualShards) !== JSON.stringify(expectedShards)) {
    throw new Error('横切能力逐文件记录与人工签核分片不一致')
  }
  const approvedLoc = records.reduce((total, record) => total + record.loc, 0)
  if (
    signoff.summary.approvedFileCount !== records.length ||
    signoff.summary.approvedLoc !== approvedLoc ||
    signoff.summary.approvedShardCount !== shards.length
  ) {
    throw new Error('横切能力人工签核分母不一致')
  }
}

/** 生成一份供人工复核后落盘的签核草案。 */
function buildSignoffDraft(shards, records, inventory, extractionManifest) {
  return {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-cross-cutting',
    status: 'pending-manual-review',
    reviewedBy: 'Codex',
    reviewerType: 'agent-assisted-manual-review',
    reviewedAt: '<replace-after-review>',
    reviewMethod: '逐文件复核 40 个横切能力文件，并核对结构、职责、使用边、风险行号和角色纠正。',
    approvalContract: '只有人工确认的分片 SHA-256 才能把候选记录转为 reviewed。',
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
  const outputs = new Map()
  const shards = []
  for (let offset = 0; offset < records.length; offset += shardSize) {
    const shardRecords = records
      .slice(offset, offset + shardSize)
      .map((record) => ({ ...record, auditStatus: 'reviewed' }))
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
  if (manualSignoff) {
    validateManualSignoff(manualSignoff, shards, records, inventory, extractionManifest)
  }
  const reviewedFileCount = previouslyReviewedFileCount + (manualSignoff ? records.length : 0)
  const riskCandidateCount = records.reduce(
    (total, record) => total + record.riskCandidates.length,
    0,
  )
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-cross-cutting',
    status: manualSignoff ? 'completed' : 'review-candidate',
    reviewedAt: manualSignoff?.reviewedAt ?? null,
    manualReviewSignoff: manualSignoff
      ? {
          path: 'reviews/phase-1c-cross-cutting-signoff.json',
          sha256: sha256(fs.readFileSync(manualSignoffPath)),
          reviewedBy: manualSignoff.reviewedBy,
          reviewerType: manualSignoff.reviewerType,
          approvedShardCount: manualSignoff.shards.length,
        }
      : null,
    batchScope: {
      roots: batchRoots,
      javaInventoryIndexRanges: buildInventoryIndexRanges(records),
    },
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      roleBoundary: 'physical batch scope and final semantic role are recorded separately',
      eventBoundary: 'Spring event publication is not called asynchronous without multicaster evidence',
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
      rootCounts: countBy(records, 'crossCuttingRoot'),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      crossCuttingShapeCounts: countBy(records, 'crossCuttingShape'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      annotationTypeCount: records.filter(
        (record) => record.structure.primaryTypeKind === 'annotation',
      ).length,
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
        reviewed: reviewedFileCount,
        blocked: 0,
      },
    },
    shards,
  }
  outputs.set(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return { outputs, manifest, signoffDraft: buildSignoffDraft(shards, records, inventory, extractionManifest) }
}

/** 写入输出，或在 check 模式逐字节验证现有产物。 */
function emitOutputs(outputs, check) {
  if (!check) fs.mkdirSync(outputDirectory, { recursive: true })
  for (const [filePath, content] of outputs) {
    if (check) {
      if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
        throw new Error(`第 6 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
      continue
    }
    fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 6 批横切能力台账。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const files = inventory.files.filter(isCrossCuttingBatchFile)
  const records = files.map((file) => {
    const extractedRecord = extractedByPath.get(file.path)
    if (!extractedRecord) throw new Error(`${file.path} 缺少 Phase 1B 记录`)
    if (extractedRecord.inferredRole.primary !== 'cross-cutting') {
      throw new Error(`${file.path} 机器角色不是 cross-cutting`)
    }
    return buildReviewRecord(file, extractedRecord, options.sourceRepository)
  })
  assignRiskIds(records)
  const manualSignoff = options.prepare ? null : readJson(manualSignoffPath)
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
      crossCuttingShapeCounts: manifest.summary.crossCuttingShapeCounts,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
      signoffDraft: options.prepare ? signoffDraft : undefined,
    }),
  )
}

main()
