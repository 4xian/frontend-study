import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.dirname(toolingDirectory)
const snapshotId = 'dzzz-app-20260803-179e722831ab'
const analysisId = 'dzzz-app-analysis-20260803-958d37cf1be1'
const batchId = 'phase-2-knowledge-path'
const gateStatus = 'passed'
const sourceRepository = path.resolve(
  process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz',
)
const manifestSha256 = '89378a4fcd620c433f879c7a492104721cde7d6f07fa51936b78b2cb6dadfb7b'
const expectedCounts = [15, 33, 34, 38, 47]
const allowedDispositions = new Set(['lesson', 'reference', 'merged', 'project-only', 'rejected'])
const allowedPurposes = new Set(['learn', 'reference', 'projects'])
const allowedOrigins = new Set([
  'project-observed',
  'necessary-prerequisite',
  'legacy-migration',
  'risk-correction',
])
const phase1Specs = [
  [
    'java-language',
    'java-language-capability-matrix.json',
    'phase-1d-java-language-manifest.json',
    '985410a0589be896ddcb7e793e8782c506fafeb2fdfdeb19ae5f69612152ca94',
    'capabilities',
    'capabilityId',
  ],
  [
    'java-standard-library',
    'java-standard-library-capability-matrix.json',
    'phase-1d-standard-library-manifest.json',
    '24b0c25cb19b4c765bdd36f04599391960251606a539a9c9c6a0de0235bf8784',
    'capabilities',
    'capabilityId',
  ],
  [
    'java-framework-library',
    'java-framework-capability-matrix.json',
    'phase-1d-framework-manifest.json',
    'e17a2ce40b18e7f375d79027f12f631f60a3b1a890996340cd7be77677095588',
    'capabilities',
    'capabilityId',
  ],
  [
    'java-engineering-pattern',
    'java-engineering-pattern-capability-matrix.json',
    'phase-1d-engineering-pattern-manifest.json',
    '2ea5eea9d4fd4ce5242daaf7daba0d21c901c2a5c949bcac4d178f43ffea2324',
    'capabilities',
    'capabilityId',
  ],
  [
    'java-review-risk',
    'java-review-risk-matrix.json',
    'phase-1d-review-risk-manifest.json',
    '84022f0de7aed87245f8d0c01e80d63f1e7862f9dd751857100cba6e7b4aff46',
    'riskPatterns',
    'riskId',
  ],
]
const phase2ArtifactNames = [
  'course-knowledge-path-source-inventory.jsonl',
  'course-coverage-matrix.json',
  'course-coverage-matrix.md',
  'architecture-and-call-paths.md',
  'project-example-register.md',
  'rejected-pattern-register.md',
  'reviews/phase-2-knowledge-path-signoff.json',
]
/** 构建 validator 自有合同使用的冻结 Java 源码路径。 */
const sourcePath = (relativePath) => `dzzz-app/src/main/java/com/tdh/bdzz/${relativePath}`
const hxFeedbackController = sourcePath('controller/hxhttp/HxHttpFeedBackController.java')
const hxFeedbackService = sourcePath('service/hxHttp/HxHttpFeedBackService.java')
const hxFeedbackServiceImpl = sourcePath('service/impl/hxHttp/HxHttpFeedBackServiceImpl.java')
const dzzzAspect = sourcePath('aop/DzzzAspect.java')
const validatorUtil = sourcePath('util/ValidatorUtil.java')
const exceptionHandler = sourcePath('exception/GloableExceptionHandler.java')
const fileService = sourcePath('service/impl/FileServiceImpl.java')
const chatWebSocket = sourcePath('config/websocket/server/ClientChatWsServer.java')
const reportController = sourcePath('timer/controller/HxDataReportController.java')
const reportTask = sourcePath('timer/HxDataReportTask.java')
const httpReportHandler = sourcePath('handler/datareport/HxHttpDataReportHandler.java')
const uploadUtil = sourcePath('upload/UploadUtil.java')
const storageMode = sourcePath('enums/StorageMode.java')
const uploader = sourcePath('upload/Uploader.java')
const localUploader = sourcePath('upload/LocalUploader.java')
const sftpUploader = sourcePath('upload/SftpUploader.java')
const s3Uploader = sourcePath('upload/S3Uploader.java')
const mossUploader = sourcePath('upload/MossUploader.java')
const mybatisConfig = sourcePath('config/MybatisPlusConfig.java')
const shardContext = sourcePath('context/TableShardContext.java')
const eajFileMapper = sourcePath('dao/EajFileMapper.java')
const shardInterceptor = sourcePath('shard/TableShardInterceptor.java')
const shardStrategy = sourcePath('shard/AjbsShardStrategy.java')
const dataSyncService = sourcePath('timer/service/TslxDataSyncService.java')
const dataReportListener = sourcePath('listener/DataReportListener.java')
const dataReportHandlerFactory = sourcePath('handler/datareport/DataReportHandlerFactory.java')
const dataReportHandler = sourcePath('handler/datareport/DataReportHandler.java')
// prettier-ignore
const projectCallPathSourceContracts = [
  { pathId: 'CALL-PATH-001',
    steps: [
      [hxFeedbackController, 24, 'HxHttpFeedBackController.getPqTjSj', /public\s+CommResultVO\s+getPqTjSj\s*\(/],
      [hxFeedbackService, 12, 'HxHttpFeedBackService.getPqTjSj', /CommResultVO\s+getPqTjSj\s*\(/],
      [hxFeedbackServiceImpl, 109, 'HxHttpFeedBackServiceImpl.getPqTjSj', /public\s+CommResultVO\s+getPqTjSj\s*\(/],
      [hxFeedbackServiceImpl, 128, 'EajFtsyMapper.selectList 调用', /eajFtsyMapper\.selectList\s*\(/],
    ],
    relations: [
      [0, 1, 'Controller 委派 Service', [[hxFeedbackController, 24, 25, /getPqTjSj[\s\S]*hxHttpFeedBackService\.getPqTjSj/]]],
      [1, 2, '实现类实现 Service 合同', [[hxFeedbackServiceImpl, 52, 52, /implements\s+HxHttpFeedBackService/]]],
      [2, 3, 'Service 实现调用 Mapper', [[hxFeedbackServiceImpl, 109, 128, /getPqTjSj[\s\S]*eajFtsyMapper\.selectList/]]],
    ], },
  { pathId: 'CALL-PATH-002',
    steps: [
      [dzzzAspect, 84, 'DzzzAspect 参数校验切面', /ValidatorUtil\.validator\s*\(/],
      [validatorUtil, 39, 'ValidatorUtil.validator', /public\s+static\s+Result\s+validator\s*\(/],
      [dzzzAspect, 87, 'ArgumentNotValidException 抛出点', /throw\s+new\s+ArgumentNotValidException\s*\(/],
      [exceptionHandler, 49, 'GloableExceptionHandler.handleArgumentNotValidException', /public\s+ResultEO\s+handleArgumentNotValidException\s*\(/],
    ],
    relations: [
      [0, 1, '切面调用校验器', [[dzzzAspect, 84, 84, /ValidatorUtil\.validator\s*\(/]]],
      [1, 2, '校验失败抛出专用异常', [[dzzzAspect, 84, 87, /ValidatorUtil\.validator[\s\S]*re\.isHasError\(\)[\s\S]*throw\s+new\s+ArgumentNotValidException/]]],
      [2, 3, '统一异常处理器接收专用异常', [[exceptionHandler, 47, 49, /@ExceptionHandler\(ArgumentNotValidException\.class\)[\s\S]*handleArgumentNotValidException/]]],
    ], },
  { pathId: 'CALL-PATH-003',
    steps: [
      [fileService, 282, '@Transactional uploadDocCameraPic', /@Transactional\s*\(/, [282, 283, /@Transactional[\s\S]*uploadDocCameraPic\s*\(/]],
      [fileService, 305, 'CommonUtil.base64ToFile 文件写入', /CommonUtil\.base64ToFile\s*\(/],
      [fileService, 306, 'FileTypeUtils.checkFileType 调用', /FileTypeUtils\.checkFileType\s*\(/],
      [fileService, 349, 'DzzzTsszclMapper.insert 调用', /dzzzTsszclMapper\.insert\s*\(/],
      [fileService, 364, 'EajFileMapper.insert 调用', /eajFileMapper\.insert\s*\(/],
      [fileService, 372, 'TaskExecutor.execute 异步副作用', /baseTaskExecutor\.execute\s*\(/],
    ],
    relations: [
      [0, 1, '事务方法执行文件写入', [[fileService, 282, 305, /@Transactional[\s\S]*uploadDocCameraPic[\s\S]*for\s*\(String\s+img64\s*:\s*imgs64\)[\s\S]*CommonUtil\.base64ToFile/]]],
      [1, 2, '文件写入后检查文件类型', [[fileService, 305, 306, /base64ToFile[\s\S]*checkFileType/]]],
      [2, 3, '文件检查后写入材料记录', [[fileService, 306, 349, /checkFileType[\s\S]*dzzzTsszclMapper\.insert/]]],
      [3, 4, '材料记录后写入文件记录', [[fileService, 349, 364, /dzzzTsszclMapper\.insert[\s\S]*eajFileMapper\.insert/]]],
      [4, 5, '数据库写入后提交异步副作用', [[fileService, 364, 372, /eajFileMapper\.insert[\s\S]*baseTaskExecutor\.execute/]]],
    ], },
  { pathId: 'CALL-PATH-004',
    steps: [
      [chatWebSocket, 83, 'ClientChatWsServer.onOpen', /public\s+void\s+onOpen\s*\(/, [82, 83, /@OnOpen[\s\S]*onOpen\s*\(/]],
      [chatWebSocket, 158, 'ClientChatWsServer.onMessage', /public\s+void\s+onMessage\s*\(/, [157, 158, /@OnMessage[\s\S]*onMessage\s*\(/]],
      [chatWebSocket, 239, 'NbjlService.saveNbjl 调用', /nbjlService\.saveNbjl\s*\(/],
      [chatWebSocket, 120, 'ClientChatWsServer.onClose', /public\s+void\s+onClose\s*\(/, [119, 120, /@OnClose[\s\S]*onClose\s*\(/]],
    ],
    relations: [
      [0, 1, '同一端点声明打开与消息回调', [[chatWebSocket, 82, 158, /@OnOpen[\s\S]*onOpen[\s\S]*@OnClose[\s\S]*onClose[\s\S]*@OnMessage[\s\S]*onMessage/]]],
      [1, 2, '消息回调保存内部交流记录', [[chatWebSocket, 158, 239, /onMessage[\s\S]*nbjlService\.saveNbjl/]]],
      [2, 3, '同一端点由关闭回调清理会话', [[chatWebSocket, 119, 149, /@OnClose[\s\S]*onClose[\s\S]*sessionMap\.remove/]]],
    ], },
  { pathId: 'CALL-PATH-005',
    steps: [
      [reportController, 26, 'HxDataReportController.loadData', /public\s+FrameTaskParam\s+loadData\s*\(/],
      [reportTask, 150, 'HxDataReportTask.reportData', /public\s+void\s+reportData\s*\(/],
      [reportTask, 183, 'HxDataReportTask.reportCourtInfo', /public\s+void\s+reportCourtInfo\s*\(/],
      [reportTask, 231, 'HxHttpDataReportHandler.callHxHttpTsXcInterface 调用', /hxHttpDataReportHandler\.callHxHttpTsXcInterface\s*\(/],
      [httpReportHandler, 492, 'HxHttpDataReportHandler.callHxHttpTsXcInterface', /public\s+<T>\s+void\s+callHxHttpTsXcInterface\s*\(/],
      [httpReportHandler, 505, 'RestTemplate.exchange 调用', /restTemplate\.exchange\s*\(/],
    ],
    relations: [
      [0, 1, '任务入口调用上报任务', [[reportController, 26, 28, /loadData[\s\S]*hxDataReportTask\.reportData/]]],
      [1, 2, '上报任务调用法庭信息步骤', [[reportTask, 150, 157, /reportData[\s\S]*reportCourtInfo\s*\(/]]],
      [2, 3, '法庭信息步骤调用 HTTP handler', [[reportTask, 183, 231, /reportCourtInfo[\s\S]*hxHttpDataReportHandler\.callHxHttpTsXcInterface/]]],
      [3, 4, '调用点绑定 handler 方法', [[reportTask, 231, 231, /hxHttpDataReportHandler\.callHxHttpTsXcInterface\s*\(/]]],
      [4, 5, 'handler 方法调用 RestTemplate', [[httpReportHandler, 492, 505, /callHxHttpTsXcInterface[\s\S]*restTemplate\.exchange/]]],
    ], },
  { pathId: 'CALL-PATH-006',
    steps: [
      [uploadUtil, 47, 'UploadUtil.upload', /public\s+UploadResponse\s+upload\s*\(/],
      [uploadUtil, 68, 'StorageMode.upload 调用', /storageMode\.upload\s*\(/],
      [storageMode, 20, 'StorageMode 策略枚举', /public\s+enum\s+StorageMode\s+implements\s+Uploader/],
      [uploader, 25, 'Uploader.upload', /UploadResponse\s+upload\s*\(/],
      [localUploader, 47, 'LocalUploader.upload', /public\s+UploadResponse\s+upload\s*\(/],
      [sftpUploader, 56, 'SftpUploader.upload', /public\s+UploadResponse\s+upload\s*\(/],
      [s3Uploader, 46, 'S3Uploader.upload', /public\s+UploadResponse\s+upload\s*\(/],
      [mossUploader, 43, 'MossUploader.upload', /public\s+UploadResponse\s+upload\s*\(/],
    ],
    relations: [
      [0, 1, '上传入口经 uploadSingle 调用存储策略', [[uploadUtil, 47, 68, /upload[\s\S]*uploadSingle\(\)[\s\S]*storageMode\.upload/]]],
      [1, 2, '调用接收者为 StorageMode', [[uploadUtil, 58, 68, /\bStorageMode\s+storageMode[\s\S]*\bstorageMode\.upload/]]],
      [2, 3, 'StorageMode 实现 Uploader 合同', [[storageMode, 20, 20, /\bStorageMode\s+implements\s+Uploader\b/]]],
      [3, 4, 'LOCAL 分支委派 LocalUploader', [[storageMode, 24, 27, /\bLOCAL\b[\s\S]*\bLocalUploader\.getInstance\(\)\.upload/], [localUploader, 24, 24, /\bLocalUploader\s+implements\s+Uploader\b/]]],
      [4, 5, 'LOCAL 与 SFTP 为并列策略分支', [[storageMode, 24, 42, /\bLocalUploader\.getInstance\(\)\.upload[\s\S]*\bSftpUploader\.getInstance\(\)\.upload/]]],
      [5, 6, 'SFTP 与 S3 为并列策略分支', [[storageMode, 38, 69, /\bSftpUploader\.getInstance\(\)\.upload[\s\S]*\bS3Uploader\.getInstance\(\)\.upload/]]],
      [6, 7, 'S3 与 MOSS 为并列策略分支', [[storageMode, 66, 84, /\bS3Uploader\.getInstance\(\)\.upload[\s\S]*\bMossUploader\.getInstance\(\)\.upload/]]],
      [3, 5, 'SftpUploader 实现 Uploader', [[sftpUploader, 33, 33, /\bSftpUploader\s+implements\s+Uploader\b/]]],
      [3, 6, 'S3Uploader 实现 Uploader', [[s3Uploader, 31, 31, /\bS3Uploader\s+implements\s+Uploader\b/]]],
      [3, 7, 'MossUploader 实现 Uploader', [[mossUploader, 28, 28, /\bMossUploader\s+implements\s+Uploader\b/]]],
    ], },
  { pathId: 'CALL-PATH-007',
    steps: [
      [mybatisConfig, 119, '注册 TableShardInterceptor', /new\s+TableShardInterceptor\s*\(/],
      [fileService, 291, 'TableShardContext.setShardData 调用', /TableShardContext\.setShardData\s*\(/],
      [shardContext, 39, 'TableShardContext.setShardData', /public\s+static\s+void\s+setShardData\s*\(/],
      [fileService, 364, 'EajFileMapper.insert 调用', /eajFileMapper\.insert\s*\(/],
      [eajFileMapper, 14, '@TableShard 声明', /@TableShard\s*\(/],
      [shardInterceptor, 45, 'TableShardInterceptor.intercept', /public\s+Object\s+intercept\s*\(/],
      [shardInterceptor, 61, 'IShardStrategy.generateTableName 调用', /strategy\.generateTableName\s*\(/],
      [shardStrategy, 31, 'AjbsShardStrategy.generateTableName', /public\s+String\s+generateTableName\s*\(/],
      [shardStrategy, 32, 'TableShardContext.getShardData 调用', /TableShardContext\.getShardData\s*\(/],
      [shardContext, 27, 'TableShardContext.getShardData', /public\s+static\s+String\s+getShardData\s*\(/],
      [shardInterceptor, 79, 'SQL 表名改写', /sql\s*=\s*sql\.replaceAll\s*\(/],
    ],
    relations: [
      [0, 1, '插件注册与分片上下文写入均存在', [[mybatisConfig, 119, 119, /new\s+TableShardInterceptor/], [fileService, 291, 291, /TableShardContext\.setShardData/]]],
      [1, 2, '业务方法调用上下文写入 API', [[fileService, 291, 291, /TableShardContext\.setShardData\s*\(/]]],
      [2, 3, '同一业务方法先写上下文再调用 Mapper', [[fileService, 291, 364, /TableShardContext\.setShardData[\s\S]*eajFileMapper\.insert/]]],
      [3, 4, 'Mapper 调用目标声明分片注解', [[fileService, 103, 103, /EajFileMapper\s+eajFileMapper/], [eajFileMapper, 14, 15, /@TableShard[\s\S]*interface\s+EajFileMapper/]]],
      [4, 5, '拦截器读取 Mapper 的 TableShard 注解', [[shardInterceptor, 45, 55, /intercept[\s\S]*getAnnotation\(TableShard\.class\)/]]],
      [5, 6, '拦截器调用分片策略', [[shardInterceptor, 45, 61, /intercept[\s\S]*strategy\.generateTableName/]]],
      [6, 7, '策略实现实现 IShardStrategy', [[shardStrategy, 20, 31, /AjbsShardStrategy\s+implements\s+IShardStrategy[\s\S]*generateTableName/]]],
      [7, 8, '策略实现读取分片上下文', [[shardStrategy, 31, 32, /generateTableName[\s\S]*TableShardContext\.getShardData/]]],
      [8, 9, '调用点绑定上下文读取 API', [[shardStrategy, 32, 32, /TableShardContext\.getShardData\s*\(/]]],
      [9, 10, '上下文值参与表名生成并驱动 SQL 改写', [[shardStrategy, 32, 39, /TableShardContext\.getShardData[\s\S]*tableName\s*\+=/], [shardInterceptor, 61, 79, /generateTableName[\s\S]*sql\.replaceAll/]]],
    ], },
  { pathId: 'CALL-PATH-008',
    steps: [
      [dataSyncService, 347, 'ApplicationEventPublisher.publishEvent', /applicationEventPublisher\.publishEvent\s*\(/],
      [dataReportListener, 37, 'DataReportListener.onApplicationEvent', /public\s+void\s+onApplicationEvent\s*\(/],
      [dataReportListener, 68, 'DataReportHandlerFactory.getInstance 调用', /dataReportHandlerFactory\.getInstance\s*\(/],
      [dataReportHandlerFactory, 21, 'DataReportHandlerFactory.getInstance', /public\s+DataReportHandler\s+getInstance\s*\(/],
      [dataReportHandler, 6, 'DataReportHandler 合同', /public\s+interface\s+DataReportHandler/],
    ],
    relations: [
      [0, 1, '发布的 DataReportEvent 由监听器接收', [[dataSyncService, 347, 347, /publishEvent\(new\s+DataReportEvent/], [dataReportListener, 26, 26, /implements\s+ApplicationListener<DataReportEvent>/]]],
      [1, 2, '监听器选择数据上报处理器', [[dataReportListener, 37, 68, /onApplicationEvent[\s\S]*dataReportHandlerFactory\.getInstance/]]],
      [2, 3, '调用点绑定 handler factory 方法', [[dataReportListener, 68, 68, /dataReportHandlerFactory\.getInstance\s*\(/]]],
      [3, 4, 'factory 从 DataReportHandler 注册表返回合同实现', [[dataReportHandlerFactory, 13, 40, /Map<String,\s*DataReportHandler>[\s\S]*return\s+handlerMap\.get/], [dataReportHandler, 6, 6, /interface\s+DataReportHandler/]]],
      [1, 4, '监听器通过 DataReportHandler 合同分派操作', [[dataReportListener, 68, 103, /DataReportHandler\s+dataReportHandler[\s\S]*dataReportHandler\.(?:deleteTrial|updateTrial|trialPublish|startTrial)/]]],
    ], },
]

/** 在独立验证合同不成立时立即终止。 */
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

/** 解析非空 JSON Lines 文本。 */
function parseJsonLines(content, sourceName) {
  assert(content.trim().length > 0, `${sourceName} 为空`)
  return content
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
}

/** 解析可选的 Phase 2 产物目录。 */
function readArtifactDirectory() {
  const args = process.argv.slice(2)
  if (args.length === 0) return auditDirectory
  assert(
    args.length === 2 && args[0] === '--artifact-dir',
    '用法：node course-coverage-matrix-validator.mjs [--artifact-dir <目录>]',
  )
  return path.resolve(args[1])
}

/** 独立读取五份 Phase 1 矩阵并复算 167 个规范来源。 */
function readPhase1Sources() {
  const sources = []
  const inputs = []
  for (let index = 0; index < phase1Specs.length; index += 1) {
    const [sourceKind, matrixFile, manifestFile, manifestSha, recordsField, idField] =
      phase1Specs[index]
    const manifestContent = fs.readFileSync(path.join(auditDirectory, manifestFile))
    assert(sha256(manifestContent) === manifestSha, `Phase 1 manifest 漂移：${manifestFile}`)
    const manifest = JSON.parse(manifestContent)
    assert(
      manifest.snapshotId === snapshotId && manifest.analysisId === analysisId,
      `Phase 1 manifest 身份错误：${manifestFile}`,
    )
    const matrixContent = fs.readFileSync(path.join(auditDirectory, matrixFile), 'utf8')
    assert(
      sha256(matrixContent) === manifest.matrix.jsonSha256,
      `Phase 1 矩阵哈希错误：${matrixFile}`,
    )
    const matrix = JSON.parse(matrixContent)
    assert(matrix.matrixKind === sourceKind, `Phase 1 矩阵类型错误：${matrixFile}`)
    assert(
      matrix[recordsField].length === expectedCounts[index],
      `Phase 1 目录数量错误：${matrixFile}`,
    )
    for (const record of matrix[recordsField])
      sources.push({ ...record, sourceId: record[idField], sourceKind })
    inputs.push({
      manifestPath: manifestFile,
      manifestSha256: manifestSha,
      matrixPath: matrixFile,
      matrixSha256: sha256(matrixContent),
      itemCount: expectedCounts[index],
    })
  }
  assert(
    JSON.stringify(expectedCounts) === JSON.stringify([15, 33, 34, 38, 47]),
    'Phase 1 分批计数错误',
  )
  assert(
    sources.length === 167 && new Set(sources.map((source) => source.sourceId)).size === 167,
    'Phase 1 来源不是 167 个唯一 ID',
  )
  return { sources, inputs }
}

/** 验证 Phase 2 来源清单逐项忠实派生自 Phase 1。 */
function validateSourceInventory(content, phase1Sources) {
  const inventory = parseJsonLines(content, 'course-knowledge-path-source-inventory.jsonl')
  assert(inventory.length === 167, `Phase 2 来源清单数量错误：${inventory.length}`)
  assert(
    new Set(inventory.map((source) => source.sourceId)).size === 167,
    'Phase 2 来源清单 sourceId 重复',
  )
  for (let index = 0; index < phase1Sources.length; index += 1) {
    const expected = phase1Sources[index]
    const actual = inventory[index]
    assert(
      actual.sourceId === expected.sourceId,
      `Phase 2 来源顺序或 ID 错误：${expected.sourceId}`,
    )
    assert(
      actual.sourceKind === expected.sourceKind && actual.sourceName === expected.name,
      `Phase 2 来源身份错误：${expected.sourceId}`,
    )
    assert(
      actual.projectEvidenceCount === expected.observedFileCount,
      `项目证据计数错误：${expected.sourceId}`,
    )
    assert(
      JSON.stringify(actual.representativeSymbols) ===
        JSON.stringify(expected.representativeSymbols),
      `来源代表符号错误：${expected.sourceId}`,
    )
    assert(
      actual.recommendedStage === expected.recommendedStage,
      `建议阶段错误：${expected.sourceId}`,
    )
    assert(
      JSON.stringify(actual.modernBaseline) === JSON.stringify(expected.modernBaseline),
      `现代基线错误：${expected.sourceId}`,
    )
    assert(
      JSON.stringify(actual.legacyBaseline) === JSON.stringify(expected.legacyBaseline),
      `legacy 基线错误：${expected.sourceId}`,
    )
    const expectedPolicy = expected.evidencePolicy ?? 'project-observed-capability'
    assert(actual.evidencePolicy === expectedPolicy, `证据政策错误：${expected.sourceId}`)
    assert(
      actual.researchStatus === 'not-started' && actual.exampleStatus === 'not-started',
      `来源状态越过 Phase 2：${expected.sourceId}`,
    )
  }
  return inventory
}

/** 验证 167 个来源都有且只有一个合法处置。 */
function validateSourceMappings(matrix, phase1Sources, courseById) {
  const mappings = matrix.sourceMappings
  const expectedById = new Map(phase1Sources.map((source) => [source.sourceId, source]))
  assert(mappings.length === 167, `sourceMappings 数量错误：${mappings.length}`)
  assert(
    new Set(mappings.map((mapping) => mapping.sourceId)).size === 167,
    'sourceMappings sourceId 重复',
  )
  assert(
    JSON.stringify(mappings.map((mapping) => mapping.sourceId).sort()) ===
      JSON.stringify([...expectedById.keys()].sort()),
    'sourceMappings 存在遗漏或额外 sourceId',
  )
  for (const mapping of mappings) {
    const source = expectedById.get(mapping.sourceId)
    assert(
      mapping.sourceKind === source.sourceKind && mapping.sourceName === source.name,
      `来源映射身份错误：${mapping.sourceId}`,
    )
    assert(allowedDispositions.has(mapping.disposition), `非法 disposition：${mapping.sourceId}`)
    assert(mapping.decisionReason.trim().length > 0, `处置理由为空：${mapping.sourceId}`)
    assert(
      mapping.projectEvidenceCount === source.observedFileCount,
      `处置证据计数错误：${mapping.sourceId}`,
    )
    assert(
      mapping.recommendedStage === source.recommendedStage,
      `处置阶段错误：${mapping.sourceId}`,
    )
    assert(
      mapping.researchStatus === 'not-started' && mapping.exampleStatus === 'not-started',
      `处置状态越过 Phase 2：${mapping.sourceId}`,
    )
    if (mapping.disposition === 'rejected') {
      assert(mapping.targetCourseIds.length === 0, `rejected 仍有课程目标：${mapping.sourceId}`)
    } else {
      assert(mapping.targetCourseIds.length === 1, `来源没有唯一课程目标：${mapping.sourceId}`)
      assert(courseById.has(mapping.targetCourseIds[0]), `来源目标课程不存在：${mapping.sourceId}`)
    }
    const target = courseById.get(mapping.targetCourseIds[0])
    if (target) {
      assert(
        target.sourceCapabilityIds.includes(mapping.sourceId),
        `来源映射与目标课程证据不一致：${mapping.sourceId}`,
      )
    }
    if (mapping.disposition === 'lesson')
      assert(target.depth === 'lesson', `lesson 深度错误：${mapping.sourceId}`)
    if (mapping.disposition === 'reference')
      assert(target.depth === 'reference', `reference 深度错误：${mapping.sourceId}`)
    if (mapping.disposition === 'project-only')
      assert(target.depth === 'project', `project-only 深度错误：${mapping.sourceId}`)
    if (mapping.disposition === 'merged')
      assert(target.depth === 'lesson', `merged 未指向主课程：${mapping.sourceId}`)
    if (mapping.sourceKind === 'java-review-risk') {
      assert(
        mapping.evidencePolicy === 'project-risk-evidence-only',
        `风险证据政策被提升：${mapping.sourceId}`,
      )
      assert(mapping.disposition === 'merged', `风险项不是合并纠错：${mapping.sourceId}`)
      assert(target.origin.includes('risk-correction'), `风险目标没有纠错来源：${mapping.sourceId}`)
    }
  }
}

/** 检测 prerequisite 图中的重复边、自环和环。 */
function validateDag(courseNodes, courseById) {
  const visiting = new Set()
  const visited = new Set()

  /** 深度优先检查一个节点的全部前置课程。 */
  const visit = (node) => {
    assert(!visiting.has(node.courseId), `依赖图存在环：${node.courseId}`)
    if (visited.has(node.courseId)) return
    visiting.add(node.courseId)
    for (const prerequisiteId of node.prerequisites) visit(courseById.get(prerequisiteId))
    visiting.delete(node.courseId)
    visited.add(node.courseId)
  }
  for (const node of courseNodes) visit(node)
}

/** 判断课程是否能沿前置关系回溯到指定起点。 */
function reachesCourse(node, targetId, courseById, visited = new Set()) {
  if (node.courseId === targetId) return true
  if (visited.has(node.courseId)) return false
  visited.add(node.courseId)
  return node.prerequisites.some((prerequisiteId) =>
    reachesCourse(courseById.get(prerequisiteId), targetId, courseById, visited),
  )
}

/** 验证课程节点合同、必要前置、顺序和阶段单调。 */
function validateCourseNodes(matrix, phase1Sources) {
  const nodes = matrix.courseNodes
  const courseById = new Map(nodes.map((node) => [node.courseId, node]))
  const sourceById = new Map(phase1Sources.map((source) => [source.sourceId, source]))
  const sourceIds = new Set(sourceById.keys())
  const sequenceRanges = {
    basics: [100, 299],
    intermediate: [300, 499],
    advanced: [500, 699],
    catalog: [700, 799],
    'dzzz-app': [800, 899],
  }
  assert(nodes.length > 0 && courseById.size === nodes.length, 'courseId 不唯一或课程为空')
  assert(new Set(nodes.map((node) => node.sequence)).size === nodes.length, '课程 sequence 不唯一')
  for (const node of nodes) {
    assert(
      /^backend\.java\.(learn|reference|projects)\.[a-z0-9-]+\.[a-z0-9-]+$/.test(node.courseId),
      `courseId 格式错误：${node.courseId}`,
    )
    assert(allowedPurposes.has(node.purpose), `purpose 错误：${node.courseId}`)
    assert(
      node.courseId.split('.')[2] === node.purpose,
      `courseId 与 purpose 不一致：${node.courseId}`,
    )
    assert(
      (node.purpose === 'learn' &&
        ['basics', 'intermediate', 'advanced'].includes(node.collection)) ||
        (node.purpose === 'reference' && node.collection === 'catalog') ||
        (node.purpose === 'projects' && node.collection === 'dzzz-app'),
      `purpose 与 collection 不一致：${node.courseId}`,
    )
    const [minimumSequence, maximumSequence] = sequenceRanges[node.collection]
    assert(
      node.sequence >= minimumSequence && node.sequence <= maximumSequence,
      `sequence 越出阶段范围：${node.courseId}`,
    )
    const expectedDepth =
      node.purpose === 'learn' ? 'lesson' : node.purpose === 'reference' ? 'reference' : 'project'
    assert(node.depth === expectedDepth, `depth 与 purpose 不一致：${node.courseId}`)
    assert(
      node.origin.length > 0 && node.origin.every((origin) => allowedOrigins.has(origin)),
      `origin 错误：${node.courseId}`,
    )
    assert(node.selectionReason.trim().length > 0, `selectionReason 为空：${node.courseId}`)
    assert(
      node.researchStatus === 'not-started' &&
        node.exampleStatus === 'not-started' &&
        node.courseStatus === 'planned',
      `课程状态越过 Phase 2：${node.courseId}`,
    )
    assert(
      node.modernBaseline.length > 0 &&
        node.legacyBaseline.length > 0 &&
        node.sourcePlan.length > 0,
      `基线或来源计划缺失：${node.courseId}`,
    )
    assert(
      new Set(node.prerequisites).size === node.prerequisites.length,
      `重复 prerequisite：${node.courseId}`,
    )
    assert(new Set(node.related).size === node.related.length, `重复 related：${node.courseId}`)
    assert(
      node.sourceCapabilityIds.every((sourceId) => sourceIds.has(sourceId)),
      `课程包含未知来源：${node.courseId}`,
    )
    assert(
      node.sourceCapabilityIds.length > 0 || node.necessaryPrerequisiteId,
      `课程没有来源或必要前置身份：${node.courseId}`,
    )
    assert(
      new Set(node.projectEvidence.map((evidence) => evidence.sourceId)).size ===
        node.projectEvidence.length,
      `课程项目证据 sourceId 重复：${node.courseId}`,
    )
    assert(
      JSON.stringify(node.projectEvidence.map((evidence) => evidence.sourceId).sort()) ===
        JSON.stringify([...node.sourceCapabilityIds].sort()),
      `课程项目证据没有完整对应来源：${node.courseId}`,
    )
    for (const prerequisiteId of node.prerequisites) {
      const prerequisite = courseById.get(prerequisiteId)
      assert(prerequisite, `prerequisite 不存在：${node.courseId} -> ${prerequisiteId}`)
      assert(prerequisiteId !== node.courseId, `课程自依赖：${node.courseId}`)
      assert(prerequisite.sequence < node.sequence, `前置顺序不早于课程：${node.courseId}`)
      assert(
        node.purpose !== 'learn' || prerequisite.purpose === 'learn',
        `主线依赖参考或项目节点：${node.courseId}`,
      )
      if (node.collection === 'basics')
        assert(prerequisite.collection === 'basics', `基础课程依赖更高阶段：${node.courseId}`)
      if (node.collection === 'intermediate')
        assert(prerequisite.collection !== 'advanced', `中级课程依赖高级课程：${node.courseId}`)
    }
    for (const relatedId of node.related)
      assert(courseById.has(relatedId), `related 不存在：${node.courseId} -> ${relatedId}`)
    if (node.necessaryPrerequisiteId) {
      assert(
        /^JAVA-PREREQ-\d{3}$/.test(node.necessaryPrerequisiteId),
        `必要前置 ID 错误：${node.courseId}`,
      )
      assert(
        node.origin.includes('necessary-prerequisite'),
        `必要前置 origin 缺失：${node.courseId}`,
      )
      assert(
        node.sourceCapabilityIds.length === 0 && node.projectEvidence.length === 0,
        `必要前置伪造项目证据：${node.courseId}`,
      )
      assert(
        nodes.some((consumer) => consumer.prerequisites.includes(node.courseId)),
        `必要前置没有消费者：${node.courseId}`,
      )
    }
    for (const evidence of node.projectEvidence) {
      const source = sourceById.get(evidence.sourceId)
      const expectedPolicy = source.evidencePolicy ?? 'project-observed-capability'
      assert(
        evidence.evidencePolicy === expectedPolicy &&
          evidence.projectEvidenceCount === source.observedFileCount &&
          JSON.stringify(evidence.representativeSymbols) ===
            JSON.stringify(source.representativeSymbols),
        `课程项目证据与 Phase 1 不一致：${node.courseId}/${evidence.sourceId}`,
      )
    }
  }
  assert(
    new Set(
      nodes
        .filter((node) => node.necessaryPrerequisiteId)
        .map((node) => node.necessaryPrerequisiteId),
    ).size === nodes.filter((node) => node.necessaryPrerequisiteId).length,
    '必要前置 ID 不唯一',
  )
  validateDag(nodes, courseById)
  const rootId = 'backend.java.learn.basics.development-environment-and-runtime'
  assert(courseById.has(rootId), '零基础起点不存在')
  for (const node of nodes.filter((item) => item.collection === 'advanced')) {
    assert(
      reachesCourse(node, rootId, courseById),
      `高级课程无法回溯到零基础起点：${node.courseId}`,
    )
  }
  return courseById
}

/** 读取一份冻结项目源码，并确认其真实字节仍与库存哈希一致。 */
function readFrozenProjectSource(sourcePath, files, sourceCache) {
  if (sourceCache.has(sourcePath)) return sourceCache.get(sourcePath)
  const file = files.get(sourcePath)
  assert(file, `冻结源码不在库存中：${sourcePath}`)
  const sourceFilePath = path.join(sourceRepository, sourcePath)
  assert(fs.existsSync(sourceFilePath), `冻结源码不存在：${sourceFilePath}`)
  const content = fs.readFileSync(sourceFilePath)
  assert(sha256(content) === file.sha256, `冻结源码 SHA 漂移：${sourcePath}`)
  const source = { content, lines: content.toString('utf8').split(/\r?\n/) }
  sourceCache.set(sourcePath, source)
  return source
}

/** 验证指定源码行区间包含独立合同要求的语义证据。 */
function validateSourceEvidence(
  sourcePath,
  startLine,
  endLine,
  pattern,
  files,
  sourceCache,
  message,
) {
  const source = readFrozenProjectSource(sourcePath, files, sourceCache)
  assert(
    Number.isInteger(startLine) &&
      Number.isInteger(endLine) &&
      startLine > 0 &&
      startLine <= endLine &&
      endLine <= source.lines.length,
    `调用链源码范围错误：${sourcePath}:${startLine}-${endLine}`,
  )
  pattern.lastIndex = 0
  assert(pattern.test(source.lines.slice(startLine - 1, endLine).join('\n')), message)
}

/** 验证调用链步骤及相邻关系满足 validator 自有的冻结源码合同。 */
function validateProjectPathSourceContract(callPath, contract, files, sourceCache) {
  assert(callPath.steps.length === contract.steps.length, `调用链步骤数量错误：${callPath.pathId}`)
  for (let index = 0; index < contract.steps.length; index += 1) {
    const step = callPath.steps[index]
    const [expectedPath, expectedLine, expectedSymbol, linePattern, rangeContract] =
      contract.steps[index]
    assert(step.path === expectedPath, `调用链步骤路径错误：${callPath.pathId}/${index + 1}`)
    assert(step.line === expectedLine, `调用链步骤声明行错误：${callPath.pathId}/${index + 1}`)
    assert(
      step.symbol === expectedSymbol,
      `调用链步骤 symbol 错误：${callPath.pathId}/${index + 1}`,
    )
    assert(step.sourceSha256 === files.get(step.path)?.sha256, `调用链源码 SHA 错误：${step.path}`)
    validateSourceEvidence(
      step.path,
      step.line,
      step.line,
      linePattern,
      files,
      sourceCache,
      `调用链 symbol 未位于冻结源码行：${callPath.pathId}/${step.symbol}`,
    )
    if (rangeContract) {
      const [startLine, endLine, rangePattern] = rangeContract
      validateSourceEvidence(
        step.path,
        startLine,
        endLine,
        rangePattern,
        files,
        sourceCache,
        `调用链 symbol 上下文错误：${callPath.pathId}/${step.symbol}`,
      )
    }
  }
  const relationPairs = new Set(contract.relations.map(([from, to]) => `${from}->${to}`))
  for (let index = 0; index < callPath.steps.length - 1; index += 1)
    assert(
      relationPairs.has(`${index}->${index + 1}`),
      `调用链缺少相邻关系合同：${callPath.pathId}/${index + 1}`,
    )
  for (const [from, to, description, evidenceEntries] of contract.relations) {
    assert(callPath.steps[from] && callPath.steps[to], `调用链关系索引错误：${callPath.pathId}`)
    for (const [sourcePath, startLine, endLine, pattern] of evidenceEntries) {
      assert(
        contract.steps.some(([expectedPath]) => expectedPath === sourcePath),
        `调用链关系证据越出合同：${callPath.pathId}/${sourcePath}`,
      )
      validateSourceEvidence(
        sourcePath,
        startLine,
        endLine,
        pattern,
        files,
        sourceCache,
        `调用链关系不成立：${callPath.pathId}/${description}`,
      )
    }
  }
}

/** 验证八条调用链严格绑定冻结 dzzz-app 源码。 */
function validateProjectPaths(matrix, courseById) {
  const inventory = readJson(path.join(auditDirectory, 'dzzz-app-file-inventory.json'))
  assert(inventory.snapshotId === snapshotId, '文件库存 snapshotId 错误')
  const files = new Map(inventory.files.map((file) => [file.path, file]))
  const sourceCache = new Map()
  const contracts = new Map(
    projectCallPathSourceContracts.map((contract) => [contract.pathId, contract]),
  )
  assert(contracts.size === 8, '独立调用链源码合同不是 8 个唯一 ID')
  assert(
    matrix.projectCallPaths.length === 8,
    `代表性调用链数量错误：${matrix.projectCallPaths.length}`,
  )
  assert(
    new Set(matrix.projectCallPaths.map((callPath) => callPath.pathId)).size === 8,
    '调用链 ID 不唯一',
  )
  assert(
    matrix.projectCallPaths.every((callPath) => contracts.has(callPath.pathId)),
    '调用链存在未知或缺失的独立源码合同',
  )
  for (const callPath of matrix.projectCallPaths) {
    const contract = contracts.get(callPath.pathId)
    assert(
      callPath.verificationStatus === 'static-source-verified',
      `调用链状态错误：${callPath.pathId}`,
    )
    assert(
      callPath.verificationBoundary.includes('静态源码'),
      `调用链缺少静态边界：${callPath.pathId}`,
    )
    assert(
      callPath.projectCourseIds.length > 0 &&
        callPath.projectCourseIds.every(
          (courseId) => courseById.get(courseId)?.purpose === 'projects',
        ),
      `调用链项目节点错误：${callPath.pathId}`,
    )
    assert(
      callPath.requiredCourseIds.length > 0 &&
        callPath.requiredCourseIds.every((courseId) => courseById.has(courseId)),
      `调用链所需课程错误：${callPath.pathId}`,
    )
    for (const projectCourseId of callPath.projectCourseIds) {
      const projectNode = courseById.get(projectCourseId)
      assert(
        callPath.requiredCourseIds.every((courseId) =>
          projectNode.prerequisites.includes(courseId),
        ),
        `项目节点缺少调用链所需课程：${callPath.pathId}/${projectCourseId}`,
      )
    }
    validateProjectPathSourceContract(callPath, contract, files, sourceCache)
  }
  const callPath007 = matrix.projectCallPaths.find((item) => item.pathId === 'CALL-PATH-007')
  assert(
    JSON.stringify(callPath007.projectCourseIds) ===
      JSON.stringify(['backend.java.projects.dzzz-app.transactional-update-chain']),
    'CALL-PATH-007 项目候选与分片证据不一致',
  )
}

/** 验证矩阵摘要和依赖边均由正式节点复算得到。 */
function validateStatistics(matrix) {
  /** 按字段复算一组记录的稳定计数。 */
  const countBy = (records, field) =>
    Object.fromEntries(
      [...Map.groupBy(records, (record) => record[field]).entries()].map(([key, values]) => [
        key,
        values.length,
      ]),
    )
  const edges = matrix.courseNodes.flatMap((node) =>
    node.prerequisites.map((prerequisite) => ({ prerequisite, courseId: node.courseId })),
  )
  const expected = {
    sourceItemCount: 167,
    dispositionCounts: countBy(matrix.sourceMappings, 'disposition'),
    courseNodeCount: matrix.courseNodes.length,
    purposeCounts: countBy(matrix.courseNodes, 'purpose'),
    collectionCounts: countBy(matrix.courseNodes, 'collection'),
    necessaryPrerequisiteCount: matrix.courseNodes.filter((node) => node.necessaryPrerequisiteId)
      .length,
    dependencyEdgeCount: edges.length,
    representativeProjectCallPathCount: matrix.projectCallPaths.length,
    gateStatus,
  }
  assert(JSON.stringify(matrix.statistics) === JSON.stringify(expected), '矩阵统计不可复算')
  assert(
    JSON.stringify(matrix.dependencyEdges) === JSON.stringify(edges),
    '依赖边与 prerequisites 不一致',
  )
  return expected
}

/** 验证 Markdown 目录和三个登记文档覆盖所有正式身份。 */
function validateMarkdownArtifacts(matrix, contents) {
  const courseMarkdown = contents['course-coverage-matrix.md']
  const architecture = contents['architecture-and-call-paths.md']
  const projects = contents['project-example-register.md']
  const rejected = contents['rejected-pattern-register.md']
  assert(
    courseMarkdown.includes('Gate 2 已由用户明确确认为 `passed`') &&
      courseMarkdown.includes('不得进入 Phase 4'),
    '课程目录 Gate 边界错误',
  )
  for (const node of matrix.courseNodes)
    assert(courseMarkdown.includes(node.courseId), `Markdown 目录缺少课程：${node.courseId}`)
  for (const callPath of matrix.projectCallPaths)
    assert(architecture.includes(callPath.pathId), `调用链文档缺少：${callPath.pathId}`)
  for (const node of matrix.courseNodes.filter((item) => item.purpose === 'projects'))
    assert(projects.includes(node.courseId), `项目登记缺少：${node.courseId}`)
  for (const node of matrix.courseNodes.filter((item) => item.purpose === 'projects')) {
    const evidenceSymbols = node.projectEvidence.flatMap(
      (evidence) => evidence.representativeSymbols,
    )
    for (const evidence of evidenceSymbols)
      assert(
        projects.includes(`\`${evidence.path}\` -> \`${evidence.symbol}\``),
        `项目登记缺少稳定符号：${evidence.symbol}`,
      )
  }
  for (const callPath of matrix.projectCallPaths)
    for (const step of callPath.steps)
      assert(
        projects.includes(`\`${step.path}\` -> \`${step.symbol}\``),
        `项目登记缺少调用链符号：${callPath.pathId}/${step.symbol}`,
      )
  for (const mapping of matrix.sourceMappings.filter(
    (item) => item.sourceKind === 'java-review-risk',
  ))
    assert(rejected.includes(mapping.sourceId), `风险登记缺少：${mapping.sourceId}`)
  assert(rejected.includes('project-risk-evidence-only'), '风险登记缺少非推荐证据政策')
}

/** 验证 signoff 和 manifest 对全部输入输出的 SHA 绑定。 */
function validateHashes(artifactDirectory, contents, phase1Inputs, matrixStatistics, matrix) {
  const signoff = JSON.parse(contents['reviews/phase-2-knowledge-path-signoff.json'])
  assert(
    signoff.snapshotId === snapshotId &&
      signoff.analysisId === analysisId &&
      signoff.batchId === batchId,
    'signoff 身份错误',
  )
  assert(
    signoff.status === 'completed' && signoff.gateStatus === gateStatus,
    'signoff Gate 状态错误',
  )
  assert(
    JSON.stringify(signoff.phase1Inputs) === JSON.stringify(phase1Inputs),
    'signoff Phase 1 输入绑定错误',
  )
  assert(JSON.stringify(signoff.summary) === JSON.stringify(matrixStatistics), 'signoff 摘要错误')
  assert(signoff.reviewedAt === matrix.frozenAt, 'signoff reviewedAt 与矩阵 frozenAt 不一致')
  assert(
    signoff.approvalBoundary.includes('用户已通过 Phase 3 执行请求明确确认') &&
      signoff.approvalBoundary.includes('不授权进入 Phase 4'),
    'signoff 缺少用户确认或 Phase 4 边界',
  )
  const expectedSignoffPaths = phase2ArtifactNames.filter(
    (fileName) => fileName !== 'reviews/phase-2-knowledge-path-signoff.json',
  )
  assert(
    JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(expectedSignoffPaths.sort()),
    'signoff 产物路径集合错误',
  )
  for (const artifact of signoff.artifacts) {
    assert(contents[artifact.path] !== undefined, `signoff 引用未知产物：${artifact.path}`)
    assert(
      artifact.sha256 === sha256(contents[artifact.path]),
      `signoff SHA 错误：${artifact.path}`,
    )
  }
  const manifestContent = fs.readFileSync(
    path.join(artifactDirectory, 'phase-2-knowledge-path-manifest.json'),
    'utf8',
  )
  assert(sha256(manifestContent) === manifestSha256, 'Phase 2 manifest SHA 漂移')
  const manifest = JSON.parse(manifestContent)
  assert(
    manifest.snapshotId === snapshotId &&
      manifest.analysisId === analysisId &&
      manifest.batchId === batchId,
    'manifest 身份错误',
  )
  assert(
    manifest.status === 'completed' && manifest.gateStatus === gateStatus,
    'manifest Gate 状态错误',
  )
  assert(manifest.frozenAt === matrix.frozenAt, 'manifest frozenAt 与矩阵 frozenAt 不一致')
  assert(
    JSON.stringify(manifest.phase1Inputs) === JSON.stringify(phase1Inputs),
    'manifest Phase 1 输入绑定错误',
  )
  assert(
    manifest.sourceInventory.path === 'course-knowledge-path-source-inventory.jsonl',
    'manifest 来源清单路径错误',
  )
  assert(
    manifest.sourceInventory.itemCount === 167 &&
      manifest.sourceInventory.sha256 === sha256(contents[manifest.sourceInventory.path]),
    'manifest 来源清单绑定错误',
  )
  for (const artifact of manifest.artifacts) {
    assert(contents[artifact.path] !== undefined, `manifest 引用未知产物：${artifact.path}`)
    assert(
      artifact.sha256 === sha256(contents[artifact.path]),
      `manifest SHA 错误：${artifact.path}`,
    )
  }
  const expectedManifestPaths = phase2ArtifactNames.filter(
    (fileName) => fileName !== 'course-knowledge-path-source-inventory.jsonl',
  )
  assert(
    JSON.stringify(manifest.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(expectedManifestPaths.sort()),
    'manifest 产物路径集合错误',
  )
  assert(
    manifest.manualDecisionSignoff.path === 'reviews/phase-2-knowledge-path-signoff.json',
    'manifest signoff 路径错误',
  )
  assert(
    manifest.manualDecisionSignoff.sha256 === sha256(contents[manifest.manualDecisionSignoff.path]),
    'manifest signoff SHA 错误',
  )
  assert(
    manifest.manualDecisionSignoff.gateStatus === gateStatus &&
      manifest.stopBoundary.includes('不得进入 Phase 4'),
    'manifest Stop Boundary 错误',
  )
}

/** 执行不导入 catalog 的完整独立验证。 */
function main() {
  const artifactDirectory = readArtifactDirectory()
  const contents = Object.fromEntries(
    phase2ArtifactNames.map((fileName) => [
      fileName,
      fs.readFileSync(path.join(artifactDirectory, fileName), 'utf8'),
    ]),
  )
  const { sources, inputs } = readPhase1Sources()
  validateSourceInventory(contents['course-knowledge-path-source-inventory.jsonl'], sources)
  const matrix = JSON.parse(contents['course-coverage-matrix.json'])
  assert(
    matrix.schemaVersion === 1 &&
      matrix.snapshotId === snapshotId &&
      matrix.analysisId === analysisId,
    '矩阵冻结身份错误',
  )
  assert(
    matrix.batchId === batchId &&
      matrix.matrixKind === 'course-knowledge-path' &&
      matrix.status === 'completed',
    '矩阵批次身份错误',
  )
  assert(matrix.gateStatus === gateStatus, 'Gate 2 未记录为 passed')
  assert(
    JSON.stringify(matrix.phase1Inputs) === JSON.stringify(inputs),
    '矩阵 Phase 1 输入绑定错误',
  )
  const courseById = validateCourseNodes(matrix, sources)
  validateSourceMappings(matrix, sources, courseById)
  validateProjectPaths(matrix, courseById)
  const statistics = validateStatistics(matrix)
  validateMarkdownArtifacts(matrix, contents)
  validateHashes(artifactDirectory, contents, inputs, statistics, matrix)
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId,
      sourceItemCount: 167,
      courseNodeCount: matrix.courseNodes.length,
      necessaryPrerequisiteCount: statistics.necessaryPrerequisiteCount,
      dependencyEdgeCount: statistics.dependencyEdgeCount,
      representativeProjectCallPathCount: 8,
      gateStatus,
    }),
  )
}

main()
