import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import prettier from 'prettier'

import { courseCatalog } from './course-knowledge-path-catalog.mjs'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.dirname(toolingDirectory)
const batchMetadata = {
  schemaVersion: 1,
  batchId: 'phase-2-knowledge-path',
  batchName: 'Phase 2：知识点与学习路径冻结',
  snapshotId: 'dzzz-app-20260803-179e722831ab',
  analysisId: 'dzzz-app-analysis-20260803-958d37cf1be1',
  frozenAt: '2026-08-04T15:10:48.000Z',
  gateStatus: 'passed',
}
const phase1Specs = [
  [
    'java-language',
    'java-language-capability-matrix.json',
    'phase-1d-java-language-manifest.json',
    '985410a0589be896ddcb7e793e8782c506fafeb2fdfdeb19ae5f69612152ca94',
    'capabilities',
    'capabilityId',
    15,
  ],
  [
    'java-standard-library',
    'java-standard-library-capability-matrix.json',
    'phase-1d-standard-library-manifest.json',
    '24b0c25cb19b4c765bdd36f04599391960251606a539a9c9c6a0de0235bf8784',
    'capabilities',
    'capabilityId',
    33,
  ],
  [
    'java-framework-library',
    'java-framework-capability-matrix.json',
    'phase-1d-framework-manifest.json',
    'e17a2ce40b18e7f375d79027f12f631f60a3b1a890996340cd7be77677095588',
    'capabilities',
    'capabilityId',
    34,
  ],
  [
    'java-engineering-pattern',
    'java-engineering-pattern-capability-matrix.json',
    'phase-1d-engineering-pattern-manifest.json',
    '2ea5eea9d4fd4ce5242daaf7daba0d21c901c2a5c949bcac4d178f43ffea2324',
    'capabilities',
    'capabilityId',
    38,
  ],
  [
    'java-review-risk',
    'java-review-risk-matrix.json',
    'phase-1d-review-risk-manifest.json',
    '84022f0de7aed87245f8d0c01e80d63f1e7862f9dd751857100cba6e7b4aff46',
    'riskPatterns',
    'riskId',
    47,
  ],
]
const sourcePlanCatalog = {
  javaLanguage: [
    ['specification', 'Java Language Specification 当前稳定版与 Java 8 归档版'],
    ['official-reference', 'Dev.java Learn 与 OpenJDK 迁移资料'],
  ],
  javaApi: [
    ['api-doc', 'Java SE 当前稳定版与 Java SE 8 API'],
    ['official-reference', 'Dev.java 标准库学习资料'],
  ],
  build: [
    ['official-reference', 'Maven Guides、POM Reference 与版本兼容说明'],
    ['project-source', 'dzzz-app 与父 POM 的冻结构建事实'],
  ],
  http: [
    ['specification', 'HTTP 与 URI 相关 RFC'],
    ['official-reference', 'Spring Web 当前参考文档与 5.2.15 归档文档'],
  ],
  testing: [
    ['official-reference', 'JUnit 与 Mockito 当前官方文档'],
    ['official-test', '精确版本的官方测试与最小反馈环'],
  ],
  data: [
    ['api-doc', 'Java 数据、I/O 与序列化 API'],
    ['official-reference', 'Jackson、XML 组件与迁移目标的官方文档'],
  ],
  spring: [
    ['official-reference', 'Spring Boot 与 Spring Framework 当前参考文档'],
    ['official-reference', 'Spring Boot 2.3.12 与 Framework 5.2.15 归档文档'],
  ],
  validation: [
    ['specification', 'Jakarta Bean Validation 当前规范与 Bean Validation 2.0'],
    ['official-reference', 'Hibernate Validator 与 Spring MVC 校验文档'],
  ],
  persistence: [
    ['official-reference', 'MyBatis、MyBatis-Spring 与 MyBatis-Plus 官方文档'],
    ['project-source', '冻结 Mapper、XML、事务与分片证据'],
  ],
  logging: [
    ['official-reference', 'SLF4J 与 Logback 官方文档'],
    ['security-standard', 'OWASP 日志与错误处理安全要求'],
  ],
  concurrency: [
    ['api-doc', 'Java 并发 API 与内存模型相关规范'],
    ['official-reference', 'Spring 任务执行、调度、事件与重试文档'],
  ],
  integration: [
    ['official-reference', '对应客户端、协议和存储 SDK 的官方文档'],
    ['project-source', '冻结项目适配器与调用链证据'],
  ],
  security: [
    ['security-standard', 'Oracle Secure Coding、OWASP、CWE 与协议安全要求'],
    ['api-doc', 'JCA/JCE、签名、JWT 与精确加密库 API'],
  ],
  observability: [
    ['official-reference', 'Spring Boot Actuator、JFR、JMC 与 JMH 官方资料'],
    ['api-doc', 'JMX、Process 与运行环境 API'],
  ],
  legacy: [
    ['release-note', '现代基线与 Java 8、Spring Boot 2.3 的迁移说明'],
    ['official-reference', '旧组件归档文档与现代替代方案官方文档'],
  ],
  project: [
    ['project-source', 'Phase 1 冻结源码、人工台账与代表性静态调用链'],
    ['official-reference', 'Phase 4/5 实施时对应组件的精确官方文档'],
  ],
}
const projectPathCatalog = [
  {
    pathId: 'CALL-PATH-001',
    title: 'Web 请求、业务服务与数据访问链',
    projectCourseIds: ['backend.java.projects.dzzz-app.request-service-mapper-chain'],
    requiredCourseIds: [
      'backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries',
      'backend.java.learn.intermediate.layers-dto-and-service-boundaries',
      'backend.java.learn.intermediate.mybatis-and-mybatis-plus',
    ],
    steps: [
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/controller/hxhttp/HxHttpFeedBackController.java',
        24,
        'HxHttpFeedBackController.getPqTjSj',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/hxHttp/HxHttpFeedBackService.java',
        12,
        'HxHttpFeedBackService.getPqTjSj',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/hxHttp/HxHttpFeedBackServiceImpl.java',
        109,
        'HxHttpFeedBackServiceImpl.getPqTjSj',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/hxHttp/HxHttpFeedBackServiceImpl.java',
        128,
        'EajFtsyMapper.selectList 调用',
      ],
    ],
    verificationBoundary: '静态源码证明请求委派和 Mapper 调用关系，不证明数据库运行结果。',
  },
  {
    pathId: 'CALL-PATH-002',
    title: '参数校验与统一异常响应链',
    projectCourseIds: ['backend.java.projects.dzzz-app.validation-error-response-chain'],
    requiredCourseIds: [
      'backend.java.learn.intermediate.bean-validation-and-input-contracts',
      'backend.java.learn.intermediate.errors-results-and-logging',
      'backend.java.learn.advanced.secure-input-and-api-exposure',
    ],
    steps: [
      ['dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java', 84, 'DzzzAspect 参数校验切面'],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/util/ValidatorUtil.java',
        39,
        'ValidatorUtil.validator',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/aop/DzzzAspect.java',
        87,
        'ArgumentNotValidException 抛出点',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/exception/GloableExceptionHandler.java',
        49,
        'GloableExceptionHandler.handleArgumentNotValidException',
      ],
    ],
    verificationBoundary:
      '静态源码证明私有校验器、异常类型和处理器的连接，不把私有校验习惯提升为推荐实践。',
  },
  {
    pathId: 'CALL-PATH-003',
    title: '事务上传与外部副作用边界',
    projectCourseIds: ['backend.java.projects.dzzz-app.transactional-update-chain'],
    requiredCourseIds: [
      'backend.java.learn.intermediate.transactions-and-idempotency',
      'backend.java.learn.advanced.file-storage-and-archive-boundaries',
    ],
    steps: [
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        282,
        '@Transactional uploadDocCameraPic',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        305,
        'CommonUtil.base64ToFile 文件写入',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        306,
        'FileTypeUtils.checkFileType 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        349,
        'DzzzTsszclMapper.insert 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        364,
        'EajFileMapper.insert 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        372,
        'TaskExecutor.execute 异步副作用',
      ],
    ],
    verificationBoundary:
      '静态源码只证明事务注解和调用边界；数据库事务不能推出文件等外部副作用可回滚。',
  },
  {
    pathId: 'CALL-PATH-004',
    title: 'WebSocket 会话生命周期链',
    projectCourseIds: ['backend.java.projects.dzzz-app.websocket-session-chain'],
    requiredCourseIds: ['backend.java.learn.advanced.websocket-and-realtime-lifecycle'],
    steps: [
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java',
        83,
        'ClientChatWsServer.onOpen',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java',
        158,
        'ClientChatWsServer.onMessage',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java',
        239,
        'NbjlService.saveNbjl 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/config/websocket/server/ClientChatWsServer.java',
        120,
        'ClientChatWsServer.onClose',
      ],
    ],
    verificationBoundary:
      '静态源码证明连接、消息、持久化调用与关闭清理入口，不证明并发时序和慢客户端行为。',
  },
  {
    pathId: 'CALL-PATH-005',
    title: '定时上报与外部 HTTP 链',
    projectCourseIds: ['backend.java.projects.dzzz-app.scheduled-external-system-chain'],
    requiredCourseIds: [
      'backend.java.learn.advanced.events-async-scheduling-and-retry',
      'backend.java.learn.advanced.http-clients-and-integration-resilience',
    ],
    steps: [
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/HxDataReportController.java',
        26,
        'HxDataReportController.loadData',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java',
        150,
        'HxDataReportTask.reportData',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java',
        183,
        'HxDataReportTask.reportCourtInfo',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/timer/HxDataReportTask.java',
        231,
        'HxHttpDataReportHandler.callHxHttpTsXcInterface 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HxHttpDataReportHandler.java',
        492,
        'HxHttpDataReportHandler.callHxHttpTsXcInterface',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/HxHttpDataReportHandler.java',
        505,
        'RestTemplate.exchange 调用',
      ],
    ],
    verificationBoundary:
      '静态源码证明调度方法到 HTTP 客户端的调用，不证明网络成功、重试效果或运行时配置。',
  },
  {
    pathId: 'CALL-PATH-006',
    title: '文件存储策略与适配器链',
    projectCourseIds: ['backend.java.projects.dzzz-app.file-storage-transfer-chain'],
    requiredCourseIds: [
      'backend.java.learn.advanced.file-storage-and-archive-boundaries',
      'backend.java.learn.intermediate.service-design-patterns',
    ],
    steps: [
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java', 47, 'UploadUtil.upload'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/UploadUtil.java', 68, 'StorageMode.upload 调用'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/enums/StorageMode.java', 20, 'StorageMode 策略枚举'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/Uploader.java', 25, 'Uploader.upload'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/LocalUploader.java', 47, 'LocalUploader.upload'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/SftpUploader.java', 56, 'SftpUploader.upload'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/S3Uploader.java', 46, 'S3Uploader.upload'],
      ['dzzz-app/src/main/java/com/tdh/bdzz/upload/MossUploader.java', 43, 'MossUploader.upload'],
    ],
    verificationBoundary: '静态源码证明策略分派和适配器实现，不证明凭据、远端可用性或上传结果。',
  },
  {
    pathId: 'CALL-PATH-007',
    title: 'MyBatis-Plus 分片拦截链',
    projectCourseIds: ['backend.java.projects.dzzz-app.transactional-update-chain'],
    requiredCourseIds: [
      'backend.java.learn.advanced.database-sharding-and-sql-boundaries',
      'backend.java.learn.advanced.thread-context-and-cleanup',
    ],
    steps: [
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/config/MybatisPlusConfig.java',
        119,
        '注册 TableShardInterceptor',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        291,
        'TableShardContext.setShardData 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java',
        39,
        'TableShardContext.setShardData',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/service/impl/FileServiceImpl.java',
        364,
        'EajFileMapper.insert 调用',
      ],
      ['dzzz-app/src/main/java/com/tdh/bdzz/dao/EajFileMapper.java', 14, '@TableShard 声明'],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java',
        45,
        'TableShardInterceptor.intercept',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java',
        61,
        'IShardStrategy.generateTableName 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java',
        31,
        'AjbsShardStrategy.generateTableName',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/shard/AjbsShardStrategy.java',
        32,
        'TableShardContext.getShardData 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/context/TableShardContext.java',
        27,
        'TableShardContext.getShardData',
      ],
      ['dzzz-app/src/main/java/com/tdh/bdzz/shard/TableShardInterceptor.java', 79, 'SQL 表名改写'],
    ],
    verificationBoundary:
      '静态源码证明上下文写入、分片 Mapper、策略取值和 SQL 改写关系，不证明所有 SQL 都被正确改写。',
  },
  {
    pathId: 'CALL-PATH-008',
    title: '应用事件发布与处理器选择链',
    projectCourseIds: ['backend.java.projects.dzzz-app.scheduled-external-system-chain'],
    requiredCourseIds: [
      'backend.java.learn.advanced.events-async-scheduling-and-retry',
      'backend.java.learn.advanced.chains-registries-and-state-machines',
    ],
    steps: [
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/timer/service/TslxDataSyncService.java',
        347,
        'ApplicationEventPublisher.publishEvent',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java',
        37,
        'DataReportListener.onApplicationEvent',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/listener/DataReportListener.java',
        68,
        'DataReportHandlerFactory.getInstance 调用',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandlerFactory.java',
        21,
        'DataReportHandlerFactory.getInstance',
      ],
      [
        'dzzz-app/src/main/java/com/tdh/bdzz/handler/datareport/DataReportHandler.java',
        6,
        'DataReportHandler 合同',
      ],
    ],
    verificationBoundary:
      '静态源码不能单独证明事件 multicaster 的同步或异步模式；发布线程语义取决于运行时配置，监听器内部另有异步调度。',
  },
]
const outputFileNames = [
  'course-knowledge-path-source-inventory.jsonl',
  'course-coverage-matrix.json',
  'course-coverage-matrix.md',
  'architecture-and-call-paths.md',
  'project-example-register.md',
  'rejected-pattern-register.md',
  'reviews/phase-2-knowledge-path-signoff.json',
  'phase-2-knowledge-path-manifest.json',
]

/** 在输入合同不成立时立即终止生成。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 计算字符串或 Buffer 的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 解析命令行并返回运行模式。 */
function readMode() {
  const args = process.argv.slice(2)
  if (args.length === 0) return { mode: 'write', outputDirectory: auditDirectory }
  if (args.length === 1 && args[0] === '--check')
    return { mode: 'check', outputDirectory: auditDirectory }
  if (args.length === 2 && args[0] === '--output-dir') {
    return { mode: 'write', outputDirectory: path.resolve(args[1]) }
  }
  throw new Error('用法：node build-course-coverage-matrix.mjs [--check | --output-dir <目录>]')
}

/** 读取五份冻结矩阵并验证 Phase 1 manifest 身份。 */
function readPhase1Sources() {
  const sources = []
  const inputs = []
  for (const [
    sourceKind,
    matrixFile,
    manifestFile,
    manifestSha,
    recordsField,
    idField,
    count,
  ] of phase1Specs) {
    const manifestContent = fs.readFileSync(path.join(auditDirectory, manifestFile))
    assert(sha256(manifestContent) === manifestSha, `Phase 1 manifest 漂移：${manifestFile}`)
    const manifest = JSON.parse(manifestContent)
    assert(manifest.snapshotId === batchMetadata.snapshotId, `snapshotId 错误：${manifestFile}`)
    assert(manifest.analysisId === batchMetadata.analysisId, `analysisId 错误：${manifestFile}`)
    const matrixContent = fs.readFileSync(path.join(auditDirectory, matrixFile), 'utf8')
    assert(
      sha256(matrixContent) === manifest.matrix.jsonSha256,
      `Phase 1 矩阵哈希错误：${matrixFile}`,
    )
    const matrix = JSON.parse(matrixContent)
    assert(matrix.matrixKind === sourceKind, `Phase 1 矩阵类型错误：${matrixFile}`)
    assert(matrix[recordsField].length === count, `Phase 1 目录数量错误：${matrixFile}`)
    for (const record of matrix[recordsField]) {
      sources.push({ ...record, sourceId: record[idField], sourceKind })
    }
    inputs.push({
      manifestPath: manifestFile,
      manifestSha256: manifestSha,
      matrixPath: matrixFile,
      matrixSha256: sha256(matrixContent),
      itemCount: count,
    })
  }
  assert(sources.length === 167, `Phase 1 来源总数错误：${sources.length}`)
  assert(new Set(sources.map((source) => source.sourceId)).size === 167, 'Phase 1 sourceId 不唯一')
  return { sources, inputs }
}

/** 生成按来源 ID 索引的统一清单。 */
function buildSourceInventory(sources) {
  return sources.map((source) => ({
    sourceId: source.sourceId,
    sourceKind: source.sourceKind,
    sourceName: source.name,
    projectEvidenceCount: source.observedFileCount,
    recommendedStage: source.recommendedStage,
    modernBaseline: source.modernBaseline,
    legacyBaseline: source.legacyBaseline,
    evidencePolicy: source.evidencePolicy ?? 'project-observed-capability',
    representativeSymbols: source.representativeSymbols,
    researchStatus: 'not-started',
    exampleStatus: 'not-started',
  }))
}

/** 返回稳定去重后的数组。 */
function unique(values) {
  return [...new Set(values)]
}

/** 汇总节点来源中的版本基线。 */
function collectBaselines(sources, sourceIds, field) {
  if (sourceIds.length === 0) {
    return field === 'modernBaseline'
      ? [{ policy: 'current-supported-stable-at-research-time' }]
      : [{ java: '8', springBoot: '2.3.12.RELEASE', role: 'legacy-supplement-only' }]
  }
  const baselines = new Map()
  for (const sourceId of sourceIds) {
    const baseline = sources.get(sourceId)[field]
    baselines.set(JSON.stringify(baseline), baseline)
  }
  return [...baselines.values()]
}

/** 从 catalog 建立课程节点、来源处置和稳定必要前置 ID。 */
function buildCourseModel(sourceInventory) {
  const sources = new Map(sourceInventory.map((source) => [source.sourceId, source]))
  const mappingBySource = new Map()
  const prerequisiteIds = new Map()
  let prerequisiteIndex = 1
  for (const node of courseCatalog) {
    if (
      (node.mappings ?? []).length === 0 &&
      (node.origin ?? []).includes('necessary-prerequisite')
    ) {
      prerequisiteIds.set(
        node.courseId,
        `JAVA-PREREQ-${String(prerequisiteIndex).padStart(3, '0')}`,
      )
      prerequisiteIndex += 1
    }
    for (const mapping of node.mappings ?? []) {
      assert(sources.has(mapping.sourceId), `catalog 包含未知来源：${mapping.sourceId}`)
      assert(!mappingBySource.has(mapping.sourceId), `catalog 重复处置：${mapping.sourceId}`)
      mappingBySource.set(mapping.sourceId, {
        ...mapping,
        targetCourseIds: [node.courseId],
        decisionReason: node.selectionReason,
      })
    }
  }
  assert(mappingBySource.size === 167, `catalog 只覆盖 ${mappingBySource.size}/167`)
  const sourceMappings = sourceInventory.map((source) => {
    const decision = mappingBySource.get(source.sourceId)
    return {
      sourceId: source.sourceId,
      sourceKind: source.sourceKind,
      sourceName: source.sourceName,
      disposition: decision.disposition,
      targetCourseIds: decision.targetCourseIds,
      decisionReason: decision.decisionReason,
      projectEvidenceCount: source.projectEvidenceCount,
      recommendedStage: source.recommendedStage,
      evidencePolicy: source.evidencePolicy,
      researchStatus: 'not-started',
      exampleStatus: 'not-started',
    }
  })
  const courseNodes = courseCatalog.map((node) => {
    const sourceCapabilityIds = unique([
      ...(node.mappings ?? []).map((item) => item.sourceId),
      ...(node.evidenceSourceIds ?? []),
    ])
    const origins = new Set(node.origin ?? [])
    if (sourceCapabilityIds.length > 0) origins.add('project-observed')
    if (sourceCapabilityIds.some((sourceId) => sourceId.startsWith('JAVA-RISK-')))
      origins.add('risk-correction')
    if (node.purpose === 'reference') origins.add('legacy-migration')
    const projectEvidence = sourceCapabilityIds.map((sourceId) => {
      const source = sources.get(sourceId)
      assert(source, `课程证据来源不存在：${sourceId}`)
      return {
        sourceId,
        evidencePolicy: source.evidencePolicy,
        projectEvidenceCount: source.projectEvidenceCount,
        representativeSymbols: source.representativeSymbols,
      }
    })
    return {
      courseId: node.courseId,
      title: node.title,
      purpose: node.purpose,
      collection: node.collection,
      level: node.level,
      depth: node.depth,
      sequence: node.sequence,
      prerequisites: node.prerequisites,
      related: node.related ?? [],
      sourceCapabilityIds,
      ...(prerequisiteIds.has(node.courseId)
        ? { necessaryPrerequisiteId: prerequisiteIds.get(node.courseId) }
        : {}),
      origin: [...origins],
      selectionReason: node.selectionReason,
      projectEvidence,
      modernBaseline: collectBaselines(sources, sourceCapabilityIds, 'modernBaseline'),
      legacyBaseline: collectBaselines(sources, sourceCapabilityIds, 'legacyBaseline'),
      sourcePlan: sourcePlanCatalog[node.sourcePlanKey].map(([sourceType, target]) => ({
        sourceType,
        target,
      })),
      researchStatus: 'not-started',
      exampleStatus: 'not-started',
      courseStatus: 'planned',
    }
  })
  return { sourceMappings, courseNodes }
}

/** 为静态调用链绑定冻结库存中的源码哈希。 */
function buildProjectPaths(courseNodes) {
  const inventory = readJson(path.join(auditDirectory, 'dzzz-app-file-inventory.json'))
  assert(inventory.snapshotId === batchMetadata.snapshotId, '文件库存 snapshotId 错误')
  const files = new Map(inventory.files.map((file) => [file.path, file]))
  const courseIds = new Set(courseNodes.map((node) => node.courseId))
  return projectPathCatalog.map((callPath) => ({
    ...callPath,
    projectCourseIds: callPath.projectCourseIds.map((courseId) => {
      assert(courseIds.has(courseId), `调用链项目节点不存在：${courseId}`)
      return courseId
    }),
    requiredCourseIds: callPath.requiredCourseIds.map((courseId) => {
      assert(courseIds.has(courseId), `调用链课程不存在：${courseId}`)
      return courseId
    }),
    steps: callPath.steps.map(([sourcePath, line, symbol]) => {
      const file = files.get(sourcePath)
      assert(file && sourcePath.startsWith('dzzz-app/'), `调用链证据越界：${sourcePath}`)
      return { path: sourcePath, line, symbol, sourceSha256: file.sha256 }
    }),
    verificationStatus: 'static-source-verified',
  }))
}

/** 按指定字段生成稳定计数。 */
function countBy(records, field) {
  return Object.fromEntries(
    [...Map.groupBy(records, (record) => record[field]).entries()].map(([key, values]) => [
      key,
      values.length,
    ]),
  )
}

/** 构建矩阵统计和依赖边。 */
function buildStatistics(sourceMappings, courseNodes, projectCallPaths) {
  const dependencyEdges = courseNodes.flatMap((node) =>
    node.prerequisites.map((prerequisite) => ({ prerequisite, courseId: node.courseId })),
  )
  const necessaryPrerequisites = courseNodes.filter((node) => node.necessaryPrerequisiteId)
  return {
    dependencyEdges,
    statistics: {
      sourceItemCount: sourceMappings.length,
      dispositionCounts: countBy(sourceMappings, 'disposition'),
      courseNodeCount: courseNodes.length,
      purposeCounts: countBy(courseNodes, 'purpose'),
      collectionCounts: countBy(courseNodes, 'collection'),
      necessaryPrerequisiteCount: necessaryPrerequisites.length,
      dependencyEdgeCount: dependencyEdges.length,
      representativeProjectCallPathCount: projectCallPaths.length,
      gateStatus: batchMetadata.gateStatus,
    },
  }
}

/** 转义 Markdown 表格单元格。 */
function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

/** 将版本基线压缩为目录中的可读文本。 */
function baselineText(baselines) {
  return baselines
    .map((baseline) =>
      Object.entries(baseline)
        .map(([key, value]) => `${key}=${value}`)
        .join(', '),
    )
    .join('；')
}

/** 构建面向用户的完整课程目录。 */
function buildCourseMarkdown(matrix) {
  const sections = [
    ['basics', '基础课程'],
    ['intermediate', '中级课程'],
    ['advanced', '高级课程'],
    ['catalog', '参考'],
    ['dzzz-app', '项目实战候选'],
  ]
  const lines = [
    '# `dzzz-app` Java 课程覆盖矩阵',
    '',
    `> 冻结快照：\`${matrix.snapshotId}\`<br>`,
    `> Phase 2 状态：\`completed\`<br>`,
    `> Gate 2：\`${matrix.gateStatus}\``,
    '',
    '本目录冻结知识点、顺序、来源映射和 Phase 4 来源计划，不表示研究正文、课程正文或项目示例已经开始。现代实践位于主线；Java 8、Spring Boot 2.3.12.RELEASE 仅作为 legacy 补充。',
    '',
    '## 覆盖摘要',
    '',
    `- Phase 1 来源：${matrix.statistics.sourceItemCount}/167，唯一处置 ${matrix.statistics.sourceItemCount} 项。`,
    `- 课程节点：${matrix.statistics.courseNodeCount}；必要前置：${matrix.statistics.necessaryPrerequisiteCount}。`,
    `- 依赖边：${matrix.statistics.dependencyEdgeCount}；代表性静态调用链：${matrix.statistics.representativeProjectCallPathCount}。`,
    `- disposition：${Object.entries(matrix.statistics.dispositionCounts)
      .map(([key, value]) => `${key}=${value}`)
      .join('，')}。`,
    '',
  ]
  for (const [collection, title] of sections) {
    lines.push(
      `## ${title}`,
      '',
      '| 顺序 | 稳定 ID | 标题 | 类型 | 前置 | 来源能力 | 现代 / legacy 基线 | 状态 |',
      '| ---: | --- | --- | --- | --- | --- | --- | --- |',
    )
    for (const node of matrix.courseNodes.filter((item) => item.collection === collection)) {
      const baselines = `${baselineText(node.modernBaseline)} / ${baselineText(node.legacyBaseline)}`
      lines.push(
        `| ${node.sequence} | \`${node.courseId}\` | ${cell(node.title)} | ${node.depth} | ${node.prerequisites.map((item) => `\`${item}\``).join('<br>') || '-'} | ${node.sourceCapabilityIds.map((item) => `\`${item}\``).join('<br>') || `\`${node.necessaryPrerequisiteId}\``} | ${cell(baselines)} | ${node.courseStatus} |`,
      )
    }
    lines.push('')
  }
  lines.push(
    '## Gate 2 Stop Boundary',
    '',
    'Gate 2 已由用户明确确认为 `passed`，仅授权进入 Phase 3 平台能力实施；不得进入 Phase 4 的逐知识点研究、课程正文或项目示例实施。',
    '',
  )
  return lines.join('\n')
}

/** 构建静态架构与调用链文档。 */
function buildArchitectureMarkdown(matrix) {
  const lines = [
    '# `dzzz-app` 代表性架构与调用链',
    '',
    '> 所有链路都限制在冻结 `dzzz-app/` 路径。它们是静态源码证据，不冒充运行时验证。',
    '',
  ]
  for (const callPath of matrix.projectCallPaths) {
    lines.push(
      `## ${callPath.pathId} ${callPath.title}`,
      '',
      `- 状态：\`${callPath.verificationStatus}\``,
      `- 所需课程：${callPath.requiredCourseIds.map((item) => `\`${item}\``).join('、')}`,
      `- 项目候选：${callPath.projectCourseIds.map((item) => `\`${item}\``).join('、')}`,
      '- 静态步骤：',
    )
    callPath.steps.forEach((step, index) =>
      lines.push(
        `  ${index + 1}. \`${step.path}:${step.line}\` -> \`${step.symbol}\`（SHA-256 \`${step.sourceSha256}\`）`,
      ),
    )
    lines.push(`- 边界：${callPath.verificationBoundary}`, '')
  }
  return lines.join('\n')
}

/** 构建 Phase 5 项目候选登记。 */
function buildProjectRegister(matrix) {
  const projectNodes = matrix.courseNodes.filter((node) => node.purpose === 'projects')
  const lines = [
    '# `dzzz-app` 项目示例候选登记',
    '',
    '> Phase 2 只登记候选链和去敏边界，不编写或运行示例。所有条目当前均为 `not-started`。',
    '',
  ]
  for (const node of projectNodes) {
    const callPaths = matrix.projectCallPaths.filter((callPath) =>
      callPath.projectCourseIds.includes(node.courseId),
    )
    const evidenceEntries = unique([
      ...callPaths.flatMap((callPath) =>
        callPath.steps.map((step) => `  - \`${step.path}\` -> \`${step.symbol}\``),
      ),
      ...node.projectEvidence.flatMap((evidence) =>
        evidence.representativeSymbols.map(
          (symbol) => `  - \`${symbol.path}\` -> \`${symbol.symbol}\``,
        ),
      ),
    ])
    lines.push(
      `## ${node.courseId}`,
      '',
      `- 标题：${node.title}`,
      '- 项目证据（相对路径 -> 稳定符号）：',
      ...evidenceEntries,
      `- 所需课程：${node.prerequisites.map((item) => `\`${item}\``).join('、')}`,
      '- 去敏要求：删除业务标识、地址、凭据、人员与案件数据，仅保留最小结构和可验证合同。',
      '- 旧写法风险：项目代码只作为问题与边界证据，必须按对应风险课程纠正，不能直接复制为推荐实现。',
      '- 预期改写状态：Phase 5 重新设计最小现代实现，保留 legacy 差异说明。',
      '- 当前状态：`not-started`',
      '',
    )
  }
  return lines.join('\n')
}

/** 构建拒绝项与风险纠错登记。 */
function buildRejectedRegister(matrix) {
  const rejected = matrix.sourceMappings.filter((mapping) => mapping.disposition === 'rejected')
  const risks = matrix.sourceMappings.filter((mapping) => mapping.sourceKind === 'java-review-risk')
  const lines = [
    '# 拒绝模式与风险纠错登记',
    '',
    '## 完全拒绝项',
    '',
    rejected.length === 0
      ? '本批没有为了凑统计制造 `rejected`；167 个规范来源均可在受限深度下进入课程、参考或项目候选。'
      : '',
    '',
    '## 合并纠正的高风险旧写法',
    '',
    '> 以下来源的 `evidencePolicy` 必须保持 `project-risk-evidence-only`。它们只证明需要纠错或验证，不构成推荐依据。',
    '',
  ]
  for (const risk of risks) {
    lines.push(
      `### ${risk.sourceId} ${risk.sourceName}`,
      '',
      `- 处置：\`${risk.disposition}\` -> ${risk.targetCourseIds.map((item) => `\`${item}\``).join('、')}`,
      `- 原因：${risk.decisionReason}`,
      '- 后果：若把该项目风险直接复制为推荐实践，会保留已审计的安全、可靠性或可维护性问题。',
      `- 未来归属：作为 ${risk.targetCourseIds.map((item) => `\`${item}\``).join('、')} 的易错点、验证边界或安全边界。`,
      `- 证据政策：\`${risk.evidencePolicy}\``,
      '',
    )
  }
  return lines.join('\n')
}

/** 使用仓库格式化规则生成稳定的 JSON 或 Markdown 字节。 */
async function formatArtifact(content, parser) {
  return prettier.format(content, { parser, printWidth: 100 })
}

/** 构建全部确定性正式产物内容。 */
async function buildArtifacts() {
  const { sources, inputs } = readPhase1Sources()
  const sourceInventory = buildSourceInventory(sources)
  const sourceInventoryContent = `${sourceInventory.map((source) => JSON.stringify(source)).join('\n')}\n`
  const { sourceMappings, courseNodes } = buildCourseModel(sourceInventory)
  const projectCallPaths = buildProjectPaths(courseNodes)
  const { dependencyEdges, statistics } = buildStatistics(
    sourceMappings,
    courseNodes,
    projectCallPaths,
  )
  const matrix = {
    ...batchMetadata,
    status: 'completed',
    matrixKind: 'course-knowledge-path',
    phase1Inputs: inputs,
    statistics,
    sourceMappings,
    courseNodes,
    dependencyEdges,
    projectCallPaths,
  }
  const artifactContents = {
    'course-knowledge-path-source-inventory.jsonl': sourceInventoryContent,
    'course-coverage-matrix.json': await formatArtifact(JSON.stringify(matrix), 'json'),
    'course-coverage-matrix.md': await formatArtifact(buildCourseMarkdown(matrix), 'markdown'),
    'architecture-and-call-paths.md': await formatArtifact(
      buildArchitectureMarkdown(matrix),
      'markdown',
    ),
    'project-example-register.md': await formatArtifact(buildProjectRegister(matrix), 'markdown'),
    'rejected-pattern-register.md': await formatArtifact(buildRejectedRegister(matrix), 'markdown'),
  }
  const signoff = {
    schemaVersion: 1,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    status: 'completed',
    gateStatus: batchMetadata.gateStatus,
    reviewedAt: batchMetadata.frozenAt,
    reviewedBy: 'Codex',
    reviewerType: 'agent-assisted-manual-course-design',
    reviewMethod:
      '逐项确认 167 个 Phase 1 规范目录项的唯一处置、64 个课程节点、必要前置、依赖图、风险边界和八条代表性静态调用链。',
    approvalBoundary:
      '用户已通过 Phase 3 执行请求明确确认冻结目录；本签核仅授权 Phase 3 平台能力，不授权进入 Phase 4。',
    phase1Inputs: inputs,
    summary: statistics,
    artifacts: Object.entries(artifactContents).map(([artifactPath, content]) => ({
      path: artifactPath,
      sha256: sha256(content),
    })),
  }
  const signoffContent = await formatArtifact(JSON.stringify(signoff), 'json')
  artifactContents['reviews/phase-2-knowledge-path-signoff.json'] = signoffContent
  const manifest = {
    schemaVersion: 1,
    snapshotId: batchMetadata.snapshotId,
    analysisId: batchMetadata.analysisId,
    batchId: batchMetadata.batchId,
    status: 'completed',
    gateStatus: batchMetadata.gateStatus,
    frozenAt: batchMetadata.frozenAt,
    phase1Inputs: inputs,
    sourceInventory: {
      path: 'course-knowledge-path-source-inventory.jsonl',
      sha256: sha256(sourceInventoryContent),
      itemCount: 167,
    },
    artifacts: Object.entries(artifactContents)
      .filter(([artifactPath]) => artifactPath !== 'course-knowledge-path-source-inventory.jsonl')
      .map(([artifactPath, content]) => ({ path: artifactPath, sha256: sha256(content) })),
    manualDecisionSignoff: {
      path: 'reviews/phase-2-knowledge-path-signoff.json',
      sha256: sha256(signoffContent),
      gateStatus: batchMetadata.gateStatus,
    },
    stopBoundary: 'Gate 2 已通过；仅授权 Phase 3，不得进入 Phase 4 的逐知识点研究、课程正文或项目示例。',
  }
  artifactContents['phase-2-knowledge-path-manifest.json'] = await formatArtifact(
    JSON.stringify(manifest),
    'json',
  )
  return { artifactContents, statistics }
}

/** 写入或逐字节检查正式产物。 */
function emitArtifacts(mode, outputDirectory, artifactContents) {
  for (const fileName of outputFileNames) {
    const targetPath = path.join(outputDirectory, fileName)
    const content = artifactContents[fileName]
    assert(content !== undefined, `缺少生成内容：${fileName}`)
    if (mode === 'check') {
      assert(fs.existsSync(targetPath), `正式产物不存在：${fileName}`)
      assert(
        fs.readFileSync(targetPath, 'utf8') === content,
        `正式产物不是确定性生成结果：${fileName}`,
      )
      continue
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, content)
  }
}

/** 执行 Phase 2 生成或只读确定性检查。 */
async function main() {
  const { mode, outputDirectory } = readMode()
  const { artifactContents, statistics } = await buildArtifacts()
  emitArtifacts(mode, outputDirectory, artifactContents)
  console.log(JSON.stringify({ status: 'PASS', mode, outputDirectory, ...statistics }))
}

await main()
