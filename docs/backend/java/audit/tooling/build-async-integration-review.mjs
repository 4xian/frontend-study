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
  'phase-1c-async-integration-signoff.json',
)
const signoffPath = process.env.DZZZ_ASYNC_INTEGRATION_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_ASYNC_INTEGRATION_SIGNOFF_PATH)
  : defaultSignoffPath
const defaultOutputDirectory = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-async-integration',
)
const outputDirectory = process.env.DZZZ_ASYNC_INTEGRATION_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_ASYNC_INTEGRATION_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const previouslyReviewedFileCount = 2928
const shardSize = 50
const batchRoots = ['handler', 'listener', 'timer', 'ws']
const expectedBatchFileCount = 191
const expectedBatchLoc = 29485
const priorReviewSources = [
  { kind: 'single', path: 'phase-1c-startup-config.json' },
  { kind: 'sharded', path: 'phase-1c-web-entry' },
  { kind: 'sharded', path: 'phase-1c-business-layer' },
  { kind: 'sharded', path: 'phase-1c-data-access' },
  { kind: 'sharded', path: 'phase-1c-data-model' },
  { kind: 'sharded', path: 'phase-1c-cross-cutting' },
]

const shapeDetails = {
  'mybatis-type-handler': {
    roleDetail: 'MyBatis 自定义类型处理器',
    responsibility: '在 JDBC 值与项目枚举或 JSON 对象之间执行持久化转换。',
    lifecycle: '由 MyBatis 创建或由 Spring 扫描；同一实例可能服务多个并发数据库调用。',
    capabilities: ['MyBatis TypeHandler', 'JDBC 类型转换', '泛型边界', 'JSON 持久化'],
  },
  'burn-handler-contract': {
    roleDetail: '刻录打印适配器合同',
    responsibility: '定义刻录打印任务提交、状态查询和取消等外部设备合同。',
    lifecycle: '接口本身无状态；运行时由 Spring 托管实现提供具体设备协作。',
    capabilities: ['接口合同', '外部设备集成', '多态'],
  },
  'burn-print-adapter': {
    roleDetail: '刻录打印设备适配器',
    responsibility: '调用刻录打印设备接口并维护外部任务标识的进程内映射。',
    lifecycle: 'Spring 单例组件；静态任务映射和外部客户端由并发调用共享。',
    capabilities: ['外部设备集成', 'HTTP 调用', '并发映射', '任务状态'],
  },
  'handler-factory': {
    roleDetail: '策略处理器注册表',
    responsibility: '收集同一处理器接口的 Spring Bean，并按类型键选择实现。',
    lifecycle: 'Spring 创建单例注册表并注入实现集合；映射随后被调用线程共享。',
    capabilities: ['策略模式', '工厂/注册表', 'ConcurrentHashMap', '依赖注入'],
  },
  'data-report-contract': {
    roleDetail: '数据上报处理器合同',
    responsibility: '定义庭审数据发布、开始、结束和外部接口调用合同。',
    lifecycle: '接口本身无状态；具体实现由 Spring 容器管理。',
    capabilities: ['接口合同', '数据上报', '多态'],
  },
  'data-report-adapter': {
    roleDetail: '数据上报外部适配器',
    responsibility: '把业务数据转换为外部平台请求，并处理上报响应。',
    lifecycle: 'Spring 单例组件；调用可能来自事件监听器、定时任务或业务请求。',
    capabilities: ['外部系统集成', 'HTTP/SOAP 调用', '数据转换', '错误边界'],
  },
  'voice-to-text-contract': {
    roleDetail: '语音转写处理器合同',
    responsibility: '定义语音转写会话、音频发送、结果读取和关闭合同。',
    lifecycle: '接口本身无状态；实现通常持有外部转写会话或连接。',
    capabilities: ['接口合同', '语音转写', '资源生命周期'],
  },
  'voice-to-text-adapter': {
    roleDetail: '语音转写外部适配器',
    responsibility: '适配厂商转写协议，并管理连接、音频流和回调结果。',
    lifecycle: 'Spring 单例组件；外部连接和可变会话状态必须按庭审或请求隔离。',
    capabilities: ['外部系统集成', 'WebSocket/HTTP', '流式数据', '资源关闭'],
  },
  'application-listener': {
    roleDetail: 'Spring 应用事件监听器',
    responsibility: '接收 Spring 应用事件并触发启动初始化、数据处理或消息发送。',
    lifecycle: 'Spring 单例监听器；默认与发布线程同步，显式 Future 才另行调度。',
    capabilities: ['ApplicationListener', '事件发布与监听', '线程边界'],
  },
  'task-business-model': {
    roleDetail: '任务业务传输模型',
    responsibility: '承载任务编排过程中的进度、文件或同步状态。',
    lifecycle: '随单次任务创建和传递；可变对象不应跨任务无保护共享。',
    capabilities: ['Java 数据模型', 'Lombok', '任务状态'],
  },
  'task-transfer-model': {
    roleDetail: '任务请求传输模型',
    responsibility: '承载定时同步或外部接口的请求与回调数据。',
    lifecycle: '随一次序列化、反序列化或任务调用创建。',
    capabilities: ['DTO 边界', 'Lombok', 'Swagger 2 元数据', '序列化'],
  },
  'task-exchange-model': {
    roleDetail: '任务外部交换模型',
    responsibility: '承载外部接口响应、XML 节点或同步结果。',
    lifecycle: '随一次外部数据交换创建，不拥有网络或文件资源。',
    capabilities: ['外部数据模型', 'Lombok', 'XStream/XML', '序列化边界'],
  },
  'task-enum': {
    roleDetail: '任务枚举合同',
    responsibility: '定义任务状态或外部节点类型的有限取值及编码映射。',
    lifecycle: '枚举常量在类加载后由整个进程共享。',
    capabilities: ['Java enum', '有限状态', '编码映射'],
  },
  'task-trigger': {
    roleDetail: '任务触发与编排组件',
    responsibility: '提供可被调度器、HTTP 适配器或其他组件触发的批处理入口。',
    lifecycle: 'Spring 单例组件；是否周期执行取决于启用的 @Scheduled 或外部调度配置。',
    capabilities: ['任务编排', 'Spring 组件', '调度边界', '批处理'],
  },
  'scheduled-task': {
    roleDetail: 'Spring 定时任务',
    responsibility: '按 @Scheduled 触发周期检查或文件处理。',
    lifecycle: '由 Spring 调度器反复调用；同一任务是否重入取决于调度器和执行时长。',
    capabilities: ['@Scheduled', '固定频率/cron', '任务重入'],
  },
  'data-sync-chain': {
    roleDetail: '数据同步处理链',
    responsibility: '按顺序组织同步处理器并传递任务上下文。',
    lifecycle: 'Spring 单例组件；处理器集合在初始化后由并发任务共享。',
    capabilities: ['责任链', '顺序执行', '任务上下文'],
  },
  'cleanup-contract': {
    roleDetail: '清理任务处理器合同',
    responsibility: '定义过期数据或本地资源清理入口。',
    lifecycle: '接口本身无状态；实现可同步或通过 @Async 代理调度。',
    capabilities: ['接口合同', '资源清理', '异步边界'],
  },
  'cleanup-handler': {
    roleDetail: '清理任务处理器',
    responsibility: '清理缓存、日志、业务数据或同步外部状态。',
    lifecycle: 'Spring 单例服务；部分公开方法通过指定线程池异步执行。',
    capabilities: ['资源清理', '@Async', '线程池', '幂等性'],
  },
  'file-process-contract': {
    roleDetail: '任务文件处理合同',
    responsibility: '定义任务文件识别、转换、保存和状态更新合同。',
    lifecycle: '接口或抽象基类本身不持有任务线程，具体实现由 Spring 管理。',
    capabilities: ['接口与抽象类', '文件处理', '事务边界'],
  },
  'file-process-handler': {
    roleDetail: '任务文件处理器',
    responsibility: '按业务文件类型执行下载、转换、保存和状态更新。',
    lifecycle: 'Spring 单例组件；每次调用处理一份任务上下文和对应文件资源。',
    capabilities: ['文件 I/O', '策略模式', '事务', '资源关闭'],
  },
  'data-sync-handler-contract': {
    roleDetail: '数据同步处理器合同',
    responsibility: '定义同步步骤的顺序、执行和链路衔接合同。',
    lifecycle: '接口本身无状态；Spring 按 Order 组织具体实现。',
    capabilities: ['责任链合同', '泛型', 'Spring Order'],
  },
  'data-sync-handler': {
    roleDetail: '数据同步处理器',
    responsibility: '执行卷宗、排期或文件数据的单个同步步骤。',
    lifecycle: 'Spring 单例组件；调用通常发生在任务编排线程内。',
    capabilities: ['数据同步', '外部 HTTP', 'MyBatis', '责任链'],
  },
  'task-service': {
    roleDetail: '任务领域服务',
    responsibility: '实现任务触发器所需的数据查询、外部调用、事务和批处理逻辑。',
    lifecycle: 'Spring 单例服务；事务、异步代理和阻塞调用边界必须分别确认。',
    capabilities: ['Spring Service', '事务', '批处理', '外部集成'],
  },
  'retransmission-endpoint': {
    roleDetail: '数据重传 SOAP 端点',
    responsibility: '校验重传请求并在指定线程池中异步上报数据和反馈结果。',
    lifecycle: 'WebService/Spring 管理实例；异步阶段使用 hxDataReportExecutor。',
    capabilities: ['JAX-WS', 'CompletableFuture', '显式 Executor', '结果回调'],
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

/** 读取前六批已复核路径，保证本批不重复领取。 */
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
    throw new Error(`前六批已复核路径应为 ${previouslyReviewedFileCount}，实际 ${reviewed.size}`)
  }
  return reviewed
}

/** 判断库存文件是否落在第 7 批物理目录。 */
function isPhysicalBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:handler|listener|timer|ws)\/.*\.java$/.test(
    file.path,
  )
}

/** 从路径提取第 7 批物理根目录。 */
function getBatchRoot(filePath) {
  return filePath.match(/\/bdzz\/(handler|listener|timer|ws)\//)?.[1]
}

/** 根据精确路径确定待核验的职责形态。 */
function getAsyncShape(filePath) {
  const fileName = path.basename(filePath)
  if (/\/handler\/(?:AbstractJsonTypeHandler|EnumTypeHandler|FastJsonTypeHandler)\.java$/.test(filePath)) {
    return 'mybatis-type-handler'
  }
  if (filePath.includes('/handler/burn/')) {
    if (fileName === 'BurnPrintHandler.java') return 'burn-handler-contract'
    if (fileName.endsWith('Factory.java')) return 'handler-factory'
    return 'burn-print-adapter'
  }
  if (filePath.includes('/handler/datareport/')) {
    if (fileName === 'DataReportHandler.java') return 'data-report-contract'
    if (fileName.endsWith('Factory.java')) return 'handler-factory'
    return 'data-report-adapter'
  }
  if (filePath.includes('/handler/voice2text/')) {
    if (fileName === 'Voice2TextHandler.java') return 'voice-to-text-contract'
    if (fileName.endsWith('Factory.java')) return 'handler-factory'
    return 'voice-to-text-adapter'
  }
  if (filePath.includes('/listener/')) return 'application-listener'
  if (filePath.includes('/timer/bo/')) return 'task-business-model'
  if (filePath.includes('/timer/dto/')) return 'task-transfer-model'
  if (filePath.includes('/timer/enums/')) return 'task-enum'
  if (filePath.includes('/timer/eo/')) return 'task-exchange-model'
  if (filePath.includes('/timer/trialInspect/')) return 'scheduled-task'
  if (filePath.includes('/timer/service/')) return 'task-service'
  if (filePath.includes('/timer/handler/clearExpireData/')) {
    return fileName === 'ClearExpireDataHandler.java' ? 'cleanup-contract' : 'cleanup-handler'
  }
  if (filePath.includes('/timer/handler/fileProcess/')) {
    if (fileName.endsWith('Factory.java')) return 'handler-factory'
    if (['AbstractFileProcessHandler.java', 'FileProcessHandler.java'].includes(fileName)) {
      return 'file-process-contract'
    }
    return 'file-process-handler'
  }
  if (fileName.endsWith('HandlerChain.java')) return 'data-sync-chain'
  if (filePath.includes('/timer/handler/jzDataSync/') && fileName === 'JzDataSyncHandler.java') {
    return 'data-sync-handler-contract'
  }
  if (filePath.includes('/timer/handler/')) return 'data-sync-handler'
  if (filePath.includes('/timer/')) return 'task-trigger'
  if (filePath.includes('/ws/')) return 'retransmission-endpoint'
  throw new Error(`${filePath} 缺少异步职责形态`)
}

/** 结合职责形态和源码声明证据推导最终语义角色。 */
function getFinalRole(shape, filePath, extractedRecord, sourceLines) {
  const topLevelTypes = extractedRecord.declaredTypes.filter((type) => type.owner === null)
  const annotationNames = new Set(extractedRecord.annotations.map((annotation) => annotation.name))
  const sourceText = sourceLines.join('\n')
  if (shape === 'mybatis-type-handler') {
    const extendsTypeHandler = topLevelTypes.some((type) =>
      type.extends.some((name) => /^(?:BaseTypeHandler|AbstractJsonTypeHandler)</.test(name)),
    )
    if (!extendsTypeHandler || !extractedRecord.frameworkUsages.some((usage) => usage.id === 'mybatis')) {
      throw new Error(`${filePath} 缺少 MyBatis TypeHandler 源码证据`)
    }
    return 'data-access'
  }
  if (shape.startsWith('burn-') || filePath.includes('/handler/burn/')) {
    const hasBurnContract = topLevelTypes.some(
      (type) =>
        (shape === 'burn-handler-contract' && type.kind === 'interface') ||
        (shape === 'burn-print-adapter' && type.implements.includes('BurnPrintHandler')) ||
        (shape === 'handler-factory' && type.name === 'BurnPrintHandlerFactory'),
    )
    if (!hasBurnContract) throw new Error(`${filePath} 缺少刻录打印基础设施源码证据`)
    return 'infrastructure'
  }
  if (['task-business-model', 'task-transfer-model', 'task-exchange-model'].includes(shape)) {
    const isDataCarrier =
      topLevelTypes.some((type) => type.kind === 'class') &&
      extractedRecord.fields.length > 0 &&
      !['Component', 'Service', 'Repository', 'Controller'].some((name) => annotationNames.has(name))
    if (!isDataCarrier) throw new Error(`${filePath} 缺少任务数据模型源码证据`)
    return 'data-model'
  }
  if (shape === 'task-enum') {
    if (!topLevelTypes.some((type) => type.kind === 'enum')) {
      throw new Error(`${filePath} 缺少枚举源码证据`)
    }
    return 'common'
  }
  const contractShapes = new Set([
    'cleanup-contract',
    'data-report-contract',
    'data-sync-handler-contract',
    'file-process-contract',
    'voice-to-text-contract',
  ])
  if (contractShapes.has(shape)) {
    const isContract = topLevelTypes.some(
      (type) => type.kind === 'interface' || type.modifiers.includes('abstract'),
    )
    if (!isContract) throw new Error(`${filePath} 缺少异步集成合同源码证据`)
    return 'async-integration'
  }
  if (shape === 'application-listener') {
    const implementsListener = topLevelTypes.some((type) =>
      type.implements.some((name) => name.startsWith('ApplicationListener<')),
    )
    if (!implementsListener) throw new Error(`${filePath} 缺少 ApplicationListener 源码证据`)
    return 'async-integration'
  }
  if (shape === 'retransmission-endpoint') {
    if (!annotationNames.has('WebService') || !/CompletableFuture\.(?:runAsync|supplyAsync)/.test(sourceText)) {
      throw new Error(`${filePath} 缺少重传端点异步源码证据`)
    }
    return 'async-integration'
  }
  if (!annotationNames.has('Component') && !annotationNames.has('Service')) {
    throw new Error(`${filePath} 缺少受管异步集成组件源码证据`)
  }
  return 'async-integration'
}

/** 返回源码中匹配表达式的稳定行号。 */
function findLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => (pattern.test(line) ? [index + 1] : []))
}

/** 添加一条包含有效源码行号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const normalized = [...new Set(lines)].sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized, summary })
}

/** 从冻结源码提取异步、调度和并发信号。 */
function buildAsyncSignals(sourceLines) {
  return {
    scheduledLines: findLines(sourceLines, /@Scheduled\b/),
    asyncLines: findLines(sourceLines, /@Async\b/),
    postConstructLines: findLines(sourceLines, /@PostConstruct\b/),
    applicationListenerLines: findLines(sourceLines, /implements ApplicationListener</),
    completableFutureLines: findLines(sourceLines, /CompletableFuture\.(?:runAsync|supplyAsync)/),
    rawThreadLines: findLines(sourceLines, /new Thread\s*\(/),
    blockingSleepLines: findLines(sourceLines, /Thread\.sleep\s*\(/),
    concurrentMapLines: findLines(sourceLines, /\bnew\s+ConcurrentHashMap\s*</),
  }
}

/** 根据冻结源码登记第 7 批风险候选。 */
function buildRisks(file, extractedRecord, sourceLines, shape, signals) {
  const risks = []
  const sourceText = sourceLines.join('\n')
  addRisk(
    risks,
    'field-injection',
    findLines(sourceLines, /@(Autowired|Resource)\b/),
    '字段注入隐藏必需依赖；现代示例应使用构造器注入并显式表达可选依赖。',
  )
  addRisk(
    risks,
    'raw-thread',
    signals.rawThreadLines,
    '直接创建裸线程绕过应用线程池的容量、命名、关闭、上下文和异常治理。',
  )
  addRisk(
    risks,
    'blocking-sleep',
    signals.blockingSleepLines,
    '工作线程内 sleep 会占用执行器容量；重试和限速应使用有界、可观测的调度策略。',
  )
  const hasExplicitFutureExecutor = /\},\s*[A-Za-z_$][\w$]*\s*\)\s*(?:\.|;)/.test(sourceText)
  const defaultFutureLines = hasExplicitFutureExecutor ? [] : signals.completableFutureLines
  addRisk(
    risks,
    'default-completable-future-executor',
    defaultFutureLines,
    '未显式传入 Executor 的 CompletableFuture 使用公共池，容量和上下文边界不受应用配置控制。',
  )
  if (signals.completableFutureLines.length > 0 && !/\.exceptionally\s*\(|\.handle\s*\(|\.whenComplete\s*\(/.test(sourceText)) {
    addRisk(
      risks,
      'unobserved-future-failure',
      signals.completableFutureLines,
      '异步链没有完成阶段错误处理；调用返回后发生的失败可能只留在未观察的 Future 中。',
    )
  }
  addRisk(
    risks,
    'startup-external-work',
    signals.postConstructLines,
    '@PostConstruct 中执行外部初始化会进入 Bean 创建关键路径，必须明确超时、失败和幂等策略。',
  )
  if (signals.asyncLines.length > 0 && extractedRecord.annotations.some((item) => item.name === 'Transactional')) {
    addRisk(
      risks,
      'async-transaction-boundary',
      [...signals.asyncLines, ...findLines(sourceLines, /@Transactional\b/)],
      '@Async 与事务分别依赖 Spring 代理；事务不会自动跨线程传播，必须按入口方法确认边界。',
    )
  }
  if (signals.scheduledLines.length > 0 && findLines(sourceLines, /@EnableScheduling\b/).length > 0) {
    addRisk(
      risks,
      'local-scheduling-enable',
      [...signals.scheduledLines, ...findLines(sourceLines, /@EnableScheduling\b/)],
      '在任务类局部启用调度会分散基础设施开关；现代配置应在集中配置边界启用。',
    )
  }
  addRisk(
    risks,
    'mutable-static-state',
    extractedRecord.fields
      .filter((field) => field.modifiers.includes('static') && !field.modifiers.includes('final'))
      .map((field) => field.line),
    '静态可变状态被整个进程共享，需要证明原子复合操作、回收和测试复位责任。',
  )
  if (shape === 'handler-factory') {
    addRisk(
      risks,
      'mutable-handler-registry',
      signals.concurrentMapLines,
      'ConcurrentHashMap 只保证单次映射操作安全，注册时机、重复键和未知键策略仍需显式定义。',
    )
  }
  if (shape === 'mybatis-type-handler') {
    addRisk(
      risks,
      'legacy-fastjson-persistence',
      findLines(sourceLines, /JSON\.(?:parseObject|toJSONString)|FastJson/),
      '持久化格式绑定旧 Fastjson；课程只保留兼容说明，现代示例使用受控 Jackson 类型。',
    )
  }
  if (shape === 'voice-to-text-adapter') {
    addRisk(
      risks,
      'shared-session-state',
      extractedRecord.fields
        .filter(
          (field) =>
            !field.modifiers.includes('final') &&
            /^(?:Map|List|Set)<|(?:Session|Socket|Buffer|Channel)/.test(field.type),
        )
        .map((field) => field.line),
      '单例适配器包含可变字段；若字段保存会话或结果，不同庭审并发调用可能互相覆盖。',
    )
  }
  if (['task-business-model', 'task-transfer-model', 'task-exchange-model'].includes(shape)) {
    addRisk(
      risks,
      'mutable-task-model',
      extractedRecord.annotations.filter((item) => item.name === 'Data').map((item) => item.line),
      'Lombok @Data 生成全量可变访问器；跨线程传递前应构造完成并避免后续修改。',
    )
    addRisk(
      risks,
      'sensitive-model-field',
      extractedRecord.fields
        .filter((field) => /(password|passwd|pwd|token|secret|key|sfz|zjhm)/i.test(field.name))
        .map((field) => field.line),
      '模型包含身份、令牌或密钥类字段，禁止整体日志输出并应缩短生命周期。',
    )
  }
  if (shape === 'application-listener' && signals.completableFutureLines.length === 0) {
    addRisk(
      risks,
      'synchronous-event-listener',
      signals.applicationListenerLines,
      'ApplicationListener 默认在发布线程同步执行；不能因位于 listener 包就宣称异步。',
    )
  }
  addRisk(
    risks,
    'broad-catch',
    findLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/),
    '宽泛捕获会合并不同失败语义；恢复、重试或转换前应区分可处理异常。',
  )
  addRisk(
    risks,
    'legacy-misspelled-contract',
    findLines(sourceLines, /DatsSync|Messgae/),
    '公开类型或合同保留历史拼写；课程现代示例使用正确命名，只在 legacy 补充中映射。',
  )
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

/** 收集当前文件的框架和关键并发依赖。 */
function buildDependencies(extractedRecord) {
  const dependencies = new Set(extractedRecord.frameworkUsages.map((usage) => usage.id))
  for (const imported of extractedRecord.imports) {
    if (/^(?:java\.util\.concurrent|javax\.annotation|javax\.jws|org\.apache\.ibatis|org\.springframework\.(?:context|scheduling|stereotype|transaction))/.test(imported.name)) {
      dependencies.add(imported.name)
    }
  }
  return [...dependencies].sort((left, right) => left.localeCompare(right))
}

/** 生成覆盖声明、注解、字段、方法和异步信号的源码证据。 */
function buildSourceEvidence(extractedRecord, signals) {
  const lines = [
    ...extractedRecord.declaredTypes.map((item) => item.line),
    ...extractedRecord.annotations.map((item) => item.line),
    ...extractedRecord.fields.map((item) => item.line),
    ...extractedRecord.publicMethods.flatMap((item) => [item.line, item.endLine]),
    ...Object.values(signals).flatMap((value) => (Array.isArray(value) ? value : [])),
  ]
    .filter(Number.isInteger)
    .filter((line, index, values) => values.indexOf(line) === index)
    .sort((left, right) => left - right)
  return [{ lines, summary: '声明、注解、字段、公开方法和执行信号共同证明该文件的真实职责与线程边界。' }]
}

/** 建立一条等待人工签核的第 7 批逐文件记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  if ((sourceText.match(/\n/g)?.length ?? 0) !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const shape = getAsyncShape(file.path)
  const details = shapeDetails[shape]
  const signals = buildAsyncSignals(sourceLines)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewing',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: getFinalRole(shape, file.path, extractedRecord, sourceLines),
    asyncRoot: getBatchRoot(file.path),
    asyncShape: shape,
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
    asyncSignals: signals,
    frameworkUsages: extractedRecord.frameworkUsages.map((usage) => usage.id).sort(),
    usageEvidence: buildUsageEvidence(extractedRecord),
    dependencies: buildDependencies(extractedRecord),
    capabilityCandidates: details.capabilities,
    riskCandidates: buildRisks(file, extractedRecord, sourceLines, shape, signals),
    sourceEvidence: buildSourceEvidence(extractedRecord, signals),
  }
}

/** 为风险候选分配连续且唯一的 AI 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `AI-${String(sequence).padStart(4, '0')}`
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

/** 校验人工签核完整绑定当前快照和逐文件分片。 */
function validateManualSignoff(signoff, shards, records, inventory, extractionManifest) {
  if (signoff.schemaVersion !== 1) throw new Error('异步能力人工签核 schemaVersion 不受支持')
  if (signoff.snapshotId !== inventory.snapshotId) throw new Error('异步能力人工签核 snapshotId 不一致')
  if (signoff.analysisId !== extractionManifest.analysisId) throw new Error('异步能力人工签核 analysisId 不一致')
  if (signoff.batchId !== 'phase-1c-async-integration' || signoff.status !== 'approved') {
    throw new Error('异步能力人工签核批次或状态不正确')
  }
  if (!signoff.reviewedBy || !signoff.reviewerType || !signoff.reviewedAt) {
    throw new Error('异步能力人工签核缺少复核身份或时间')
  }
  const expected = shards.map(({ fileName, fileCount, sha256: hash }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision: 'approved',
  }))
  const actual = signoff.shards.map(({ fileName, fileCount, sha256: hash, decision }) => ({
    fileName,
    fileCount,
    sha256: hash,
    decision,
  }))
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('异步能力逐文件记录与人工签核分片不一致')
  }
  if (
    signoff.summary.approvedFileCount !== records.length ||
    signoff.summary.approvedLoc !== records.reduce((total, record) => total + record.loc, 0) ||
    signoff.summary.approvedShardCount !== shards.length
  ) {
    throw new Error('异步能力人工签核分母不一致')
  }
}

/** 生成一份供人工复核后落盘的签核草案。 */
function buildSignoffDraft(shards, records, inventory, extractionManifest) {
  return {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-async-integration',
    status: 'pending-manual-review',
    reviewedBy: 'Codex',
    reviewerType: 'agent-assisted-manual-review',
    reviewedAt: '<replace-after-review>',
    reviewMethod: '逐文件复核 191 个异步能力物理范围文件，并核对职责、执行信号、使用边、风险行号和角色纠正。',
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
  const reviewedFileCount = previouslyReviewedFileCount + (manualSignoff ? records.length : 0)
  const riskCandidateCount = records.reduce((total, record) => total + record.riskCandidates.length, 0)
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-async-integration',
    status: manualSignoff ? 'completed' : 'review-candidate',
    reviewedAt: manualSignoff?.reviewedAt ?? null,
    manualReviewSignoff: manualSignoff
      ? {
          path: 'reviews/phase-1c-async-integration-signoff.json',
          sha256: sha256(fs.readFileSync(signoffPath)),
          reviewedBy: manualSignoff.reviewedBy,
          reviewerType: manualSignoff.reviewerType,
          approvedShardCount: manualSignoff.shards.length,
        }
      : null,
    batchScope: {
      roots: batchRoots,
      javaInventoryIndexRanges: buildInventoryIndexRanges(records),
      excludedReviewedPaths: previouslyReviewedFileCount,
    },
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      roleBoundary: 'physical batch scope and final semantic role are recorded separately',
      schedulingBoundary: 'package name, ApplicationListener, task naming, and event publication do not independently prove asynchronous execution',
      signoffBoundary: 'manual signoff binds reviewing candidate shard hashes before completed output promotes records to reviewed',
    },
    summary: {
      batchFileCount: records.length,
      batchLoc: records.reduce((total, record) => total + record.loc, 0),
      declaredTypeCount: records.reduce((total, record) => total + record.structure.declaredTypeCount, 0),
      fieldCount: records.reduce((total, record) => total + record.structure.fieldCount, 0),
      publicMethodCount: records.reduce((total, record) => total + record.structure.publicMethodCount, 0),
      rootCounts: countBy(records, 'asyncRoot'),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      asyncShapeCounts: countBy(records, 'asyncShape'),
      roleCorrectionCount: records.filter((record) => record.machineRoleCandidate !== record.finalRole).length,
      signalFileCounts: Object.fromEntries(
        Object.keys(records[0].asyncSignals).map((signal) => [
          signal,
          records.filter((record) => record.asyncSignals[signal].length > 0).length,
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
        reviewed: reviewedFileCount,
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
        throw new Error(`第 7 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
    } else fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 7 批异步能力台账。 */
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
    throw new Error(`第 7 批冻结分母漂移：files=${files.length}, LOC=${batchLoc}`)
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
      asyncShapeCounts: manifest.summary.asyncShapeCounts,
      finalRoleCounts: manifest.summary.finalRoleCounts,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
      signoffDraft: options.prepare ? signoffDraft : undefined,
    }),
  )
}

main()
