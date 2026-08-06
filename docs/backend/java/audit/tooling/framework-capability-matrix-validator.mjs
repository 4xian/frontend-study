import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_FRAMEWORK_NORMALIZATION_DIRECTORY
  ? path.resolve(process.env.DZZZ_FRAMEWORK_NORMALIZATION_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_FRAMEWORK_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_FRAMEWORK_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-framework-signoff.json')
const previousManifestPath = path.join(auditDirectory, 'phase-1d-standard-library-manifest.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const sourceInventoryFileName = 'framework-capability-source-inventory.jsonl'
const matrixJsonFileName = 'java-framework-capability-matrix.json'
const matrixMarkdownFileName = 'java-framework-capability-matrix.md'
const manifestFileName = 'phase-1d-framework-manifest.json'
const snapshotId = 'dzzz-app-20260803-179e722831ab'
const analysisId = 'dzzz-app-analysis-20260803-958d37cf1be1'
const batchId = 'phase-1d-framework'
const batchName = 'Phase 1D 第 3 批：框架与第三方库能力归一化'
const reviewedAt = '2026-08-04T11:36:20.000Z'
const previousSourceInventorySha256 =
  'a9f55eb514c827e4cbf1316f79f031e677e03ea0fb6afe0aae7ffc075ba4aebe'
const previousManifestSha256 = '24b0c25cb19b4c765bdd36f04599391960251606a539a9c9c6a0de0235bf8784'
const sourceKindOrder = ['review-capability', 'language-feature', 'framework-usage', 'review-risk']

const expectedCapabilities = [
  [
    'JAVA-FRAMEWORK-001',
    'Spring Boot 启动、自动配置与外部化配置',
    'basic',
    ['JAVA-LANG-001'],
    [
      'framework-usage:spring-boot',
      '环境配置读取',
      '配置属性绑定',
      '外部化配置',
      '启动生命周期',
      '应用启动',
      '自动配置排除',
      '组件扫描',
      'Spring Boot 启动回调',
      'CommandLineRunner',
      'WAR 部署',
    ],
  ],
  [
    'JAVA-FRAMEWORK-002',
    'Spring Core、IoC、依赖注入与 Bean 生命周期',
    'intermediate',
    ['JAVA-LANG-007'],
    [
      'framework-usage:spring-core',
      '@Component stereotype',
      '@Service stereotype',
      '构造器注入',
      '容器桥接',
      '依赖获取边界',
      '依赖注入',
      'ApplicationContextAware',
      'Bean',
      'Bean 查找',
      'Bean 方法',
      'Bean 命名',
      'Bean 生命周期',
      'Bean 限定符',
      'Bean 注册',
      'Primary',
      'Assert',
      'Spring @Service',
      'Spring 依赖注入',
      'Spring 组件',
      'Spring Component',
      'Spring Service',
    ],
  ],
  [
    'JAVA-FRAMEWORK-003',
    'Spring 应用事件',
    'advanced',
    ['JAVA-FRAMEWORK-002'],
    [
      '发布与监听边界',
      '事件发布与监听',
      '事件发布语义',
      '事件载荷',
      'ApplicationEventPublisher',
      'ApplicationListener',
      'Spring ApplicationEvent',
    ],
  ],
  [
    'JAVA-FRAMEWORK-004',
    'Spring AOP 与 AspectJ',
    'advanced',
    ['JAVA-FRAMEWORK-002'],
    [
      'framework-usage:spring-aop',
      '代理匹配边界',
      '横切异常边界',
      'AOP JoinPoint',
      'AspectJ 切点表达式',
      'Spring AOP advice',
    ],
  ],
  [
    'JAVA-FRAMEWORK-005',
    'Spring 异步执行与任务调度',
    'advanced',
    ['JAVA-STDLIB-023', 'JAVA-FRAMEWORK-002'],
    [
      'framework-usage:spring-scheduling-async',
      '@Async',
      '@Scheduled',
      '固定频率/cron',
      '异步代理边界',
      '异步方法',
      '异步与重试启用',
    ],
  ],
  [
    'JAVA-FRAMEWORK-006',
    'Spring Retry',
    'advanced',
    ['JAVA-LANG-009', 'JAVA-FRAMEWORK-002'],
    ['framework-usage:spring-retry', '重试'],
  ],
  [
    'JAVA-FRAMEWORK-007',
    'Spring 声明式事务',
    'intermediate',
    ['JAVA-FRAMEWORK-002'],
    ['framework-usage:spring-transaction', '声明式事务', '事务边界', '事务代理边界', '事务管理器'],
  ],
  [
    'JAVA-FRAMEWORK-008',
    'Spring MVC 请求处理与扩展点',
    'intermediate',
    ['JAVA-FRAMEWORK-002'],
    [
      'framework-usage:spring-mvc',
      '404 响应',
      '多路径映射',
      '静态资源',
      '静态资源 URL 编码',
      '拦截器',
      '路径匹配',
      '视图控制器',
      '请求体反序列化',
      '请求映射',
      'Controller',
      'Controller 分层',
      'ControllerAdvice',
      'CORS',
      'ExceptionHandler',
      'HandlerInterceptor',
      'HTTP 错误映射',
      'MultipartFile',
      'MVC 生命周期',
      'RequestContextHolder',
      'Spring MVC',
      'WebMvcConfigurer',
    ],
  ],
  [
    'JAVA-FRAMEWORK-009',
    'Bean Validation 与 MVC 校验触发',
    'intermediate',
    ['JAVA-FRAMEWORK-008'],
    [
      'framework-usage:bean-validation',
      '级联校验 @Valid',
      '校验空值与类型语义',
      '自定义校验器',
      'Bean Validation',
      'Bean Validation 约束',
      'Spring MVC 参数校验触发',
    ],
  ],
  [
    'JAVA-FRAMEWORK-010',
    'Servlet API、Filter 与异步请求',
    'advanced',
    ['JAVA-FRAMEWORK-008'],
    [
      'framework-usage:servlet',
      '请求包装',
      'Filter 顺序',
      'Filter Bean',
      'FilterChain',
      'FilterRegistrationBean',
      'Servlet',
      'Servlet 初始化',
      'Servlet 会话',
      'Servlet 请求对象',
      'Servlet 请求响应边界',
      'Servlet 响应与下载',
      'Servlet AsyncContext',
      'Servlet Filter',
      'ServletContext',
      'ServletRegistrationBean',
    ],
  ],
  [
    'JAVA-FRAMEWORK-011',
    'WebSocket Endpoint 与 Spring 集成',
    'advanced',
    ['JAVA-FRAMEWORK-010'],
    [
      'framework-usage:spring-websocket',
      '两阶段 WebSocket 握手',
      '服务端推送',
      'ServerEndpointExporter',
      'WebSocket 生命周期',
      'WebSocket 推送',
      'WebSocket 心跳',
      'WebSocket 状态机',
      'WebSocket Endpoint 创建',
      'WebSocket/HTTP',
    ],
  ],
  [
    'JAVA-FRAMEWORK-012',
    'Spring Data Redis 与 RedisTemplate',
    'advanced',
    ['JAVA-FRAMEWORK-002'],
    ['framework-usage:spring-data-redis', '泛型 Bean', '键值序列化', 'RedisTemplate'],
  ],
  [
    'JAVA-FRAMEWORK-013',
    'Springfox Swagger 2',
    'intermediate',
    ['JAVA-FRAMEWORK-008'],
    [
      'framework-usage:swagger-2',
      '方法注解筛选',
      'API 文档配置',
      'Docket',
      'Swagger 2 模型描述',
      'Swagger 2 元数据',
    ],
  ],
  [
    'JAVA-FRAMEWORK-014',
    'MyBatis Mapper、XML 与扩展点',
    'intermediate',
    ['JAVA-LANG-006'],
    [
      'framework-usage:mybatis',
      '@Param 参数命名',
      '插件链',
      '注解 SQL',
      'Mapper 包扫描',
      'Mapper 扫描',
      'Mapper XML',
      'MyBatis',
      'MyBatis Interceptor',
      'MyBatis Mapper 代理',
      'MyBatis TypeHandler',
      'namespace 与 statement 绑定',
      'SqlSessionFactory',
      'JDBC 类型转换',
    ],
  ],
  [
    'JAVA-FRAMEWORK-015',
    'MyBatis-Plus CRUD 与映射',
    'intermediate',
    ['JAVA-FRAMEWORK-014'],
    [
      'framework-usage:mybatis-plus',
      '@TableField 字段映射',
      '@TableId 主键映射',
      '@TableName',
      '批量插入',
      '通用持久化服务',
      'MyBatis-Plus',
      'MyBatis-Plus 分页',
      'MyBatis-Plus 字段映射',
      'MyBatis-Plus BaseMapper 泛型',
      'MyBatis-Plus SQL 注入器',
      'ServiceImpl 泛型',
      'Java 与数据库类型映射',
    ],
  ],
  [
    'JAVA-FRAMEWORK-016',
    'Apache DBCP 数据源与连接池',
    'advanced',
    ['JAVA-FRAMEWORK-014'],
    ['数据源 Bean', '连接池', 'SQL 白名单'],
  ],
  [
    'JAVA-FRAMEWORK-017',
    'Lombok 注解代码生成',
    'intermediate',
    ['JAVA-LANG-003'],
    [
      'framework-usage:lombok',
      'Builder',
      'Builder 模式',
      'Lombok',
      'Lombok 代码生成',
      'Lombok 数据模型',
    ],
  ],
  [
    'JAVA-FRAMEWORK-018',
    'Jackson 映射与消息转换',
    'intermediate',
    ['JAVA-LANG-003'],
    ['framework-usage:jackson', 'Jackson 字段映射', '消息转换器'],
  ],
  [
    'JAVA-FRAMEWORK-019',
    'Fastjson 序列化与解析',
    'intermediate',
    ['JAVA-LANG-003'],
    [
      'framework-usage:fastjson',
      'Fastjson 字段映射',
      'JSON',
      'JSON 持久化',
      'JSON 解析',
      'JSON 类型处理',
      'JSON 路由',
      'JSON 状态',
    ],
  ],
  [
    'JAVA-FRAMEWORK-020',
    'JAXB XML 绑定与生成模型',
    'advanced',
    ['JAVA-LANG-007'],
    ['framework-usage:xml-jaxb', '生成代码边界', 'JAXB XML 绑定', 'XML 枚举映射'],
  ],
  [
    'JAVA-FRAMEWORK-021',
    'XStream XML 映射',
    'advanced',
    ['JAVA-LANG-003'],
    ['对象映射', 'XML', 'XStream', 'XStream XML 映射', 'XStream/XML'],
  ],
  [
    'JAVA-FRAMEWORK-022',
    'RestTemplate 与 Apache HttpClient',
    'advanced',
    ['JAVA-STDLIB-013'],
    [
      'framework-usage:http-client',
      '读取超时',
      '连接超时',
      '外部 HTTP 调用',
      'Apache HttpClient',
      'HTTP 客户端 Bean',
      'HTTP 客户端拦截器',
      'HTTP I/O',
      'RestTemplate',
      'SSL',
    ],
  ],
  [
    'JAVA-FRAMEWORK-023',
    'JUnit 4',
    'intermediate',
    ['JAVA-LANG-003'],
    ['framework-usage:junit', 'JUnit 4'],
  ],
  [
    'JAVA-FRAMEWORK-024',
    'Mockito',
    'intermediate',
    ['JAVA-FRAMEWORK-023'],
    ['framework-usage:mockito', 'Mockito'],
  ],
  [
    'JAVA-FRAMEWORK-025',
    'CXF、JAX-WS 与 SOAP',
    'advanced',
    ['JAVA-STDLIB-013'],
    [
      'CXF Bus',
      'CXF/Axis',
      'JAX-WS',
      'JAX-WS 服务合同',
      'SOAP',
      'SOAP/JAX-WS',
      'WSDL',
      'HTTP/SOAP 调用',
    ],
  ],
  [
    'JAVA-FRAMEWORK-026',
    'SLF4J 与 Logback',
    'intermediate',
    ['JAVA-LANG-009'],
    ['部署环境', '滚动策略', 'Logback', 'SLF4J'],
  ],
  [
    'JAVA-FRAMEWORK-027',
    'FTP 与 SFTP 客户端',
    'advanced',
    ['JAVA-STDLIB-013'],
    ['Apache Commons Net', 'FTP', 'SFTP'],
  ],
  [
    'JAVA-FRAMEWORK-028',
    'AWS S3 与 MOSS 对象存储 SDK',
    'advanced',
    ['JAVA-STDLIB-013'],
    ['分片上传', '临时 URL', '预签名 URL', 'AWS S3 SDK', '客户端生命周期'],
  ],
  [
    'JAVA-FRAMEWORK-029',
    'PDF 与 Office 文档库',
    'advanced',
    ['JAVA-STDLIB-013'],
    [
      '文档资源',
      'Office 转换',
      'PDF',
      'PDF fixture',
      'PDFBox',
      'PDFBox/iText/Aspose/Spire',
      'Aspose/Apache POI',
      'Word/RTF',
      'PDF 坐标',
      'HTML',
    ],
  ],
  ['JAVA-FRAMEWORK-030', 'FFmpeg 与 JavaCV', 'advanced', ['JAVA-STDLIB-018'], ['FFmpeg/JavaCV']],
  [
    'JAVA-FRAMEWORK-031',
    'ONNX Runtime 与 DJL',
    'advanced',
    ['JAVA-STDLIB-013'],
    ['图片推理', 'DJL', 'ONNX'],
  ],
  [
    'JAVA-FRAMEWORK-032',
    'Java JWT',
    'advanced',
    ['JAVA-STDLIB-028'],
    ['令牌签名', 'JWT', '声明校验'],
  ],
  ['JAVA-FRAMEWORK-033', '二维码编解码库', 'intermediate', ['JAVA-STDLIB-029'], ['二维码']],
  [
    'JAVA-FRAMEWORK-034',
    'SM2、SM3 与 Bouncy Castle',
    'advanced',
    ['JAVA-STDLIB-027', 'JAVA-STDLIB-028'],
    ['SM2', 'SM3'],
  ],
]

const engineeringPendingKeys = [
  '关键字匹配',
  '默认方法',
  'ReentrantLock',
  'synchronized',
  'URLConnection',
  'volatile',
  '派生配置',
  '配置数据建模',
  'BeanUtils',
  'Spring Order',
  '事务',
  '文档端点访问控制',
  'XML I/O',
  '超时',
  '外部 HTTP',
  'HTTP',
  'HTTP 调用',
  '连接与读取超时',
  '文档转换',
  '媒体流',
]

/** 断言独立校验合同成立。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 解析非空 JSON Lines。 */
function parseJsonLines(content, sourceName) {
  assert(content.trim().length > 0, `${sourceName} 为空`)
  return content.trim().split('\n').map(JSON.parse)
}

/** 把紧凑来源声明转换为完整来源键。 */
function normalizeExpectedSources(sourceDeclarations) {
  return sourceDeclarations.map((source) => {
    if (Array.isArray(source)) return source
    if (source.startsWith('framework-usage:')) {
      return ['framework-usage', source.slice('framework-usage:'.length)]
    }
    return ['review-capability', source]
  })
}

/** 独立验证上一批身份并读取 754 个 pending 输入。 */
function readPreviousPendingInventory() {
  const manifestContent = fs.readFileSync(previousManifestPath, 'utf8')
  assert(sha256(manifestContent) === previousManifestSha256, '上一批 manifest 哈希错误')
  const manifest = JSON.parse(manifestContent)
  assert(manifest.batchId === 'phase-1d-standard-library', '上一批身份错误')
  assert(manifest.status === 'completed' && manifest.gateStatus === 'not-passed', '上一批状态错误')
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, '上一批快照错误')
  assert(manifest.matrix.normalizedSourceItemCount === 112, '上一批完成输入数错误')
  assert(manifest.matrix.pendingSourceItemCount === 754, '上一批 pending 分母错误')
  assert(manifest.coverageBoundary.nextBatch === 'framework', '上一批后继批次错误')
  const sourceContent = fs.readFileSync(
    path.join(auditDirectory, manifest.sourceInventory.path),
    'utf8',
  )
  assert(sha256(sourceContent) === previousSourceInventorySha256, '上一批输入清单哈希错误')
  assert(manifest.sourceInventory.sha256 === previousSourceInventorySha256, '上一批未绑定输入清单')
  const allSources = parseJsonLines(sourceContent, manifest.sourceInventory.path)
  assert(allSources.length === 866, '上一批输入清单行数错误')
  assert(
    allSources.filter((source) => source.normalizationStatus === 'normalized').length === 112,
    '上一批 normalized 数错误',
  )
  const pending = allSources.filter((source) => source.normalizationStatus === 'pending')
  assert(pending.length === 754, '上一批 pending 输入数错误')
  assert(
    pending.every((source) => source.capabilityId === null),
    '上一批 pending 能力 ID 非空',
  )
  return pending
}

/** 独立读取七个提取分片。 */
function readExtractedRecords() {
  const manifest = readJson(extractionManifestPath)
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, '提取身份错误')
  const records = []
  for (const shard of manifest.shards) {
    const content = fs.readFileSync(path.join(auditDirectory, 'extracted', shard.fileName), 'utf8')
    assert(sha256(content) === shard.sha256, `${shard.fileName} 哈希错误`)
    records.push(...parseJsonLines(content, shard.fileName))
  }
  records.sort((left, right) => left.inventoryIndex - right.inventoryIndex)
  assert(records.length === 3436, '提取记录分母错误')
  assert(new Set(records.map((record) => record.path)).size === 3436, '提取路径不唯一')
  return records
}

/** 从独立能力合同建立 235 个唯一输入映射。 */
function buildAssignments(pendingInventory) {
  const pendingKeys = new Set(
    pendingInventory.map((source) => `${source.sourceKind}\u0000${source.key}`),
  )
  const assignments = new Map()
  const capabilityIds = new Set(expectedCapabilities.map(([capabilityId]) => capabilityId))
  assert(capabilityIds.size === 34, '独立能力 ID 不唯一')
  for (const [capabilityId, , , prerequisites, sourceDeclarations] of expectedCapabilities) {
    for (const [sourceKind, key] of normalizeExpectedSources(sourceDeclarations)) {
      const sourceKey = `${sourceKind}\u0000${key}`
      assert(pendingKeys.has(sourceKey), `独立合同引用不存在的输入：${sourceKind}/${key}`)
      assert(!assignments.has(sourceKey), `独立合同重复映射：${sourceKind}/${key}`)
      assignments.set(sourceKey, capabilityId)
    }
    for (const prerequisite of prerequisites) {
      assert(
        prerequisite.startsWith('JAVA-LANG-') ||
          prerequisite.startsWith('JAVA-STDLIB-') ||
          capabilityIds.has(prerequisite),
        `独立前置能力不存在：${capabilityId}/${prerequisite}`,
      )
    }
  }
  assert(assignments.size === 235, `独立映射数错误：${assignments.size}`)
  return assignments
}

/** 独立生成 754 条本批输入状态。 */
function buildSourceInventory(pendingInventory, assignments) {
  const inventory = pendingInventory.map((source) => {
    const capabilityId = assignments.get(`${source.sourceKind}\u0000${source.key}`) ?? null
    return {
      ...source,
      normalizationStatus: capabilityId ? 'normalized' : 'pending',
      capabilityId,
    }
  })
  assert(inventory.length === 754, '独立输入分母错误')
  assert(
    inventory.filter((source) => source.normalizationStatus === 'normalized').length === 235,
    '独立完成输入数错误',
  )
  assert(
    inventory.filter((source) => source.normalizationStatus === 'pending').length === 519,
    '独立 pending 输入数错误',
  )
  assert(
    inventory
      .filter((source) => source.sourceKind === 'framework-usage')
      .every((source) => source.normalizationStatus === 'normalized'),
    '框架信号没有全部归一化',
  )
  assert(
    inventory
      .filter((source) => source.sourceKind === 'review-risk')
      .every((source) => source.normalizationStatus === 'pending'),
    '风险说明被提前归一化',
  )
  for (const key of engineeringPendingKeys) {
    const source = inventory.find((item) => item.key === key)
    assert(
      source?.normalizationStatus === 'pending' && source.capabilityId === null,
      `工程或残留项被错误归一化：${key}`,
    )
  }
  assert(
    inventory.every((source) =>
      source.observedFiles.every((filePath) => filePath.startsWith('dzzz-app/')),
    ),
    '独立输入包含 dzzz-app 外路径',
  )
  return inventory
}

/** 独立取得一个代表符号。 */
function representativeSymbol(filePath, extractedByPath) {
  const extracted = extractedByPath.get(filePath)
  assert(extracted, `代表文件不在提取记录：${filePath}`)
  const declaredType = extracted.declaredTypes?.find((type) => type.owner === null)
  return {
    symbol: declaredType?.qualifiedName ?? path.basename(filePath, '.java'),
    path: filePath,
  }
}

/** 独立选择最多五个代表符号。 */
function selectRepresentativeSymbols(sources, extractedByPath) {
  const selectedPaths = []
  for (const source of sources) {
    if (selectedPaths.length >= 5) break
    const firstUnusedPath = source.observedFiles.find(
      (filePath) => !selectedPaths.includes(filePath),
    )
    if (firstUnusedPath) selectedPaths.push(firstUnusedPath)
  }
  const union = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
  for (const filePath of union) {
    if (selectedPaths.length >= 5) break
    if (!selectedPaths.includes(filePath)) selectedPaths.push(filePath)
  }
  return selectedPaths.map((filePath) => representativeSymbol(filePath, extractedByPath))
}

/** 独立建立 34 个规范框架能力。 */
function buildCapabilities(sourceInventory, extractedRecords) {
  const sourceByKey = new Map(
    sourceInventory.map((source) => [`${source.sourceKind}\u0000${source.key}`, source]),
  )
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  return expectedCapabilities.map(
    ([capabilityId, name, recommendedStage, prerequisites, sourceDeclarations]) => {
      const sources = normalizeExpectedSources(sourceDeclarations).map(([sourceKind, key]) => {
        const source = sourceByKey.get(`${sourceKind}\u0000${key}`)
        assert(source?.capabilityId === capabilityId, `独立能力映射错位：${capabilityId}/${key}`)
        return source
      })
      const observedFiles = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
      return {
        capabilityId,
        name,
        kind: 'framework-library',
        observedFileCount: observedFiles.length,
        observedFiles,
        representativeSymbols: selectRepresentativeSymbols(sources, extractedByPath),
        normalizedFrom: sources.map((source) => ({
          sourceId: source.sourceId,
          sourceKind: source.sourceKind,
          key: source.key,
          label: source.label,
          observedFileCount: source.observedFileCount,
        })),
        modernBaseline: {
          java: '25 LTS',
          dependencyPolicy: 'current-supported-stable-at-research-time',
        },
        legacyBaseline: {
          java: '8',
          springBoot: '2.3.12.RELEASE',
          springFramework: '5.2.15.RELEASE',
          dependencyPolicy: 'frozen-dzzz-app-snapshot',
        },
        prerequisites,
        recommendedStage,
        exampleStatus: 'not-started',
        researchStatus: 'not-started',
        courseStatus: 'candidate',
      }
    },
  )
}

/** 独立统计输入分母和文件关联。 */
function summarizeSources(sourceInventory) {
  const counts = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      sourceInventory.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  const fileAssignments = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      sourceInventory
        .filter((source) => source.sourceKind === sourceKind)
        .reduce((total, source) => total + source.observedFileCount, 0),
    ]),
  )
  assert(
    JSON.stringify(counts) ===
      JSON.stringify({
        'review-capability': 414,
        'language-feature': 0,
        'framework-usage': 21,
        'review-risk': 319,
      }),
    '独立来源分类计数错误',
  )
  assert(
    JSON.stringify(fileAssignments) ===
      JSON.stringify({
        'review-capability': 11019,
        'language-feature': 0,
        'framework-usage': 5300,
        'review-risk': 3152,
      }),
    '独立文件关联计数错误',
  )
  return { counts, fileAssignments }
}

/** 将阶段代码转换为中文。 */
function stageLabel(stage) {
  return { basic: '基础', intermediate: '中级', advanced: '高级' }[stage]
}

/** 独立生成 Markdown 摘要。 */
function buildMarkdown(matrix, sourceCounts) {
  const lines = [
    '# `dzzz-app` Java 框架与第三方库能力矩阵',
    '',
    `> 批次：${batchName}`,
    `> 源码快照：\`${snapshotId}\``,
    `> 自动分析：\`${analysisId}\``,
    '> 状态：框架批次已归一化，研究与课程正文尚未开始',
    '',
    '## 1. 本批边界',
    '',
    `本批输入严格来自上一批的 ${matrix.summary.rawSourceItemCount} 个 \`pending\` 输入：`,
    '',
    `- 文件级能力候选：${sourceCounts['review-capability']} 个；`,
    `- 剩余 Java 语言信号：${sourceCounts['language-feature']} 个；`,
    `- 框架使用信号：${sourceCounts['framework-usage']} 个；`,
    `- 唯一风险说明：${sourceCounts['review-risk']} 个。`,
    '',
    `本批把 ${matrix.summary.normalizedSourceItemCount} 个有直接 import、注解或配置 API 证据的输入合并为 ${matrix.summary.capabilityCount} 个框架与第三方库能力。`,
    `其余 ${matrix.summary.pendingSourceItemCount} 个输入继续保持 \`pending\`。`,
    '业务流程、设计模式、通用集成概念、风险说明和名实不符的残留候选均未提前归一化。',
    '',
    '## 2. 规范能力',
    '',
  ]
  for (const capability of matrix.capabilities) {
    lines.push(
      `### ${capability.capabilityId} ${capability.name}`,
      '',
      `- 类型：\`${capability.kind}\`；推荐阶段：${stageLabel(capability.recommendedStage)}。`,
      `- 项目证据：${capability.observedFileCount} 个文件；原始输入：${capability.normalizedFrom.length} 个。`,
      `- 现代基线：Java ${capability.modernBaseline.java}；项目补充：Java ${capability.legacyBaseline.java}。`,
      `- 前置能力：${capability.prerequisites.length > 0 ? capability.prerequisites.map((id) => `\`${id}\``).join('、') : '本批内无'}。`,
      `- 状态：研究 \`${capability.researchStatus}\`，示例 \`${capability.exampleStatus}\`，课程 \`${capability.courseStatus}\`。`,
      `- 合并来源：${capability.normalizedFrom.map((source) => `\`${source.sourceKind}:${source.label}\``).join('、')}。`,
      '- 代表符号：',
      ...capability.representativeSymbols.map(
        (symbol) => `  - \`${symbol.symbol}\`：\`${symbol.path}\``,
      ),
      '',
    )
  }
  lines.push(
    '## 3. 已验证边界决定',
    '',
    '- 21 个自动框架信号已全部归一化；319 个风险说明全部保持 `pending`。',
    '- `RedisConfig` 是有效配置类；`SSL` 归入 Apache HttpClient，静态资源 URL 编码归入 Spring MVC。',
    '- `Builder 模式` 的 395 个冻结证据文件均直接使用 Lombok `@Builder`，因此只在本批归入 Lombok，不提前讲设计模式。',
    '- `事务`、`超时`、`外部 HTTP`、`HTTP 调用`、`文档转换`、`XML I/O` 和`媒体流`是混合或间接场景，继续留给工程模式批次。',
    '- `派生配置`、`配置数据建模`、`BeanUtils`、`Spring Order` 和文档端点访问控制没有形成单一直接框架证据，继续保持 `pending`。',
    '- `URLConnection`、名实不符的 `ReentrantLock` 以及纯 `synchronized`、`volatile`、默认方法不伪装成框架能力。',
    '',
    '## 4. 当前边界',
    '',
    '- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。',
    '- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。',
    '- 具体框架合同、迁移差异、易错点、替代方案和开发技巧必须在 Phase 2 后逐项在线核验。',
    '- 本批不处理工程模式、风险反例、项目示例、课程正文或前端平台。',
    '- Phase 1D 尚未完成，Gate 1 仍未通过。',
    '',
    '下一批只能继续处理工程模式能力归一化，不能开始风险反例、课程正文、菜单或 Markdown adapter。',
  )
  return lines.join('\n')
}

/** 独立验证签核精确绑定三份正式产物。 */
function validateSignoff(signoff, artifactHashes, summary) {
  assert(signoff.schemaVersion === 1, '签核 schemaVersion 错误')
  assert(signoff.snapshotId === snapshotId && signoff.analysisId === analysisId, '签核快照错误')
  assert(signoff.batchId === batchId && signoff.status === 'approved', '签核状态错误')
  assert(signoff.reviewedAt === reviewedAt, '签核时间错误')
  assert(signoff.reviewedBy === 'Codex', '签核审查者错误')
  assert(signoff.reviewerType === 'agent-assisted-manual-review', '签核审查类型错误')
  const expectedSummary = {
    rawSourceItemCount: 754,
    normalizedSourceItemCount: 235,
    pendingSourceItemCount: 519,
    capabilityCount: 34,
    normalizedObservedFileCount: 3085,
    representativeSymbolCount: 137,
  }
  assert(JSON.stringify(signoff.summary) === JSON.stringify(expectedSummary), '签核摘要错误')
  for (const [key, value] of Object.entries(expectedSummary)) {
    assert(summary[key] === value, `矩阵摘要错误：${key}`)
  }
  assert(
    JSON.stringify(summary.pendingBySourceKind) ===
      JSON.stringify({
        'review-capability': 200,
        'language-feature': 0,
        'framework-usage': 0,
        'review-risk': 319,
      }),
    '矩阵 pending 分类错误',
  )
  assert(signoff.artifacts.length === 3, '签核产物数错误')
  assert(
    JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(Object.keys(artifactHashes).sort()),
    '签核产物路径集合错误',
  )
  for (const artifact of signoff.artifacts) {
    assert(artifactHashes[artifact.path] === artifact.sha256, `签核哈希错误：${artifact.path}`)
  }
}

/** 独立重建矩阵、Markdown 与 manifest。 */
function buildExpectedArtifacts(signoff) {
  const pendingInventory = readPreviousPendingInventory()
  const extractedRecords = readExtractedRecords()
  const assignments = buildAssignments(pendingInventory)
  const sourceInventory = buildSourceInventory(pendingInventory, assignments)
  const sourceSummary = summarizeSources(sourceInventory)
  const capabilities = buildCapabilities(sourceInventory, extractedRecords)
  const pendingSources = sourceInventory.filter(
    (source) => source.normalizationStatus === 'pending',
  )
  const pendingBySourceKind = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      pendingSources.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  assert(
    JSON.stringify(pendingBySourceKind) ===
      JSON.stringify({
        'review-capability': 200,
        'language-feature': 0,
        'framework-usage': 0,
        'review-risk': 319,
      }),
    'pending 分类计数错误',
  )
  const matrix = {
    schemaVersion: 1,
    snapshotId,
    analysisId,
    batchId,
    reviewedAt,
    matrixKind: 'java-framework-library',
    inputLineage: {
      previousBatchId: 'phase-1d-standard-library',
      previousManifestSha256,
      previousSourceInventorySha256,
      previousPendingSourceItemCount: 754,
    },
    summary: {
      rawSourceItemCount: 754,
      normalizedSourceItemCount: 235,
      pendingSourceItemCount: 519,
      pendingBySourceKind,
      capabilityCount: 34,
      normalizedObservedFileCount: 3085,
      representativeSymbolCount: 137,
    },
    capabilities,
  }
  const sourceInventoryContent = `${sourceInventory.map((source) => JSON.stringify(source)).join('\n')}\n`
  const matrixJsonContent = `${JSON.stringify(matrix, null, 2)}\n`
  const matrixMarkdownContent = `${buildMarkdown(matrix, sourceSummary.counts)}\n`
  const artifactHashes = {
    [sourceInventoryFileName]: sha256(sourceInventoryContent),
    [matrixJsonFileName]: sha256(matrixJsonContent),
    [matrixMarkdownFileName]: sha256(matrixMarkdownContent),
  }
  validateSignoff(signoff, artifactHashes, matrix.summary)
  const manifest = {
    schemaVersion: 1,
    snapshotId,
    analysisId,
    batchId,
    status: 'completed',
    reviewedAt,
    gateStatus: 'not-passed',
    previousBatch: matrix.inputLineage,
    sourceInventory: {
      path: sourceInventoryFileName,
      sha256: artifactHashes[sourceInventoryFileName],
      itemCount: 754,
      observedFileAssignments: 19471,
      sourceKindCounts: sourceSummary.counts,
      sourceKindFileAssignments: sourceSummary.fileAssignments,
    },
    matrix: {
      jsonPath: matrixJsonFileName,
      jsonSha256: artifactHashes[matrixJsonFileName],
      markdownPath: matrixMarkdownFileName,
      markdownSha256: artifactHashes[matrixMarkdownFileName],
      ...matrix.summary,
    },
    manualReviewSignoff: {
      path: 'reviews/phase-1d-framework-signoff.json',
      sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
      reviewedBy: signoff.reviewedBy,
      reviewerType: signoff.reviewerType,
    },
    coverageBoundary: {
      normalizedKinds: ['framework-library'],
      pendingKinds: ['engineering-pattern', 'review-risk', 'residual-or-invalid'],
      nextBatch: 'engineering-pattern',
      courseAuthoringStarted: false,
    },
  }
  return {
    sourceInventoryContent,
    matrixJsonContent,
    matrixMarkdownContent,
    manifestContent: `${JSON.stringify(manifest, null, 2)}\n`,
  }
}

/** 对正式产物执行独立逐字节校验。 */
function main() {
  assert(fs.existsSync(path.join(outputDirectory, matrixJsonFileName)), '框架能力正式产物尚不存在')
  const signoff = readJson(signoffPath)
  const expected = buildExpectedArtifacts(signoff)
  const artifacts = [
    [sourceInventoryFileName, expected.sourceInventoryContent],
    [matrixJsonFileName, expected.matrixJsonContent],
    [matrixMarkdownFileName, expected.matrixMarkdownContent],
    [manifestFileName, expected.manifestContent],
  ]
  for (const [fileName, expectedContent] of artifacts) {
    const actualContent = fs.readFileSync(path.join(outputDirectory, fileName), 'utf8')
    assert(actualContent === expectedContent, `独立重建不一致：${fileName}`)
  }
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId,
      sourceItemCount: 754,
      normalizedSourceItemCount: 235,
      pendingSourceItemCount: 519,
      capabilityCount: 34,
      gateStatus: 'not-passed',
      nextBatch: 'engineering-pattern',
    }),
  )
}

main()
