import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_ENGINEERING_NORMALIZATION_DIRECTORY
  ? path.resolve(process.env.DZZZ_ENGINEERING_NORMALIZATION_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_ENGINEERING_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_ENGINEERING_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-engineering-pattern-signoff.json')
const previousManifestPath = path.join(auditDirectory, 'phase-1d-framework-manifest.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const sourceInventoryFileName = 'engineering-pattern-capability-source-inventory.jsonl'
const matrixJsonFileName = 'java-engineering-pattern-capability-matrix.json'
const matrixMarkdownFileName = 'java-engineering-pattern-capability-matrix.md'
const manifestFileName = 'phase-1d-engineering-pattern-manifest.json'
const snapshotId = 'dzzz-app-20260803-179e722831ab'
const analysisId = 'dzzz-app-analysis-20260803-958d37cf1be1'
const batchId = 'phase-1d-engineering-pattern'
const reviewedAt = '2026-08-04T12:44:02.000Z'
const previousSourceInventorySha256 =
  'c253c494c4858d366568c5579bd69e4e2141191c5116c895d616d1b4490c1947'
const previousManifestSha256 = 'e17a2ce40b18e7f375d79027f12f631f60a3b1a890996340cd7be77677095588'
const expectedArtifactHashes = {
  [sourceInventoryFileName]: '7ade12db21b935a1655f5f70544f486afa5a823074264144f89550103096e25b',
  [matrixJsonFileName]: '8cd1619084b8b0f9dadb9ea8a3915eb8dcaa8064e2e2ea90d5d700020373dc3b',
  [matrixMarkdownFileName]: '92d3bcf5ad6ef3ad43e70b9e1576fc75198eaa173df79f6cf8838c0080b628a7',
}

const expectedCapabilities = [
  [
    'JAVA-ENGINEERING-001',
    '分层架构与业务编排',
    'intermediate',
    ['JAVA-FRAMEWORK-002', 'JAVA-FRAMEWORK-008'],
    ['端点业务编排', '服务分层', '横切合同设计', 'Service 分层'],
  ],
  [
    'JAVA-ENGINEERING-002',
    '请求、响应与 DTO 模型边界',
    'intermediate',
    ['JAVA-LANG-001', 'JAVA-LANG-006'],
    [
      '查询条件对象',
      '对象边界',
      '泛型响应封装',
      '前端数据结构',
      '请求模型边界',
      '响应视图模型',
      '业务层对象边界',
      'DTO 边界',
      'DTO 数据传输',
      'Java 数据模型',
      'JavaBean',
    ],
  ],
  [
    'JAVA-ENGINEERING-003',
    '持久化、分片与数据访问边界',
    'advanced',
    ['JAVA-FRAMEWORK-014', 'JAVA-FRAMEWORK-015'],
    ['表分片', '持久化对象', '多数据库选择', 'SQL 改写'],
  ],
  [
    'JAVA-ENGINEERING-004',
    '外部系统数据合同与协议模型',
    'advanced',
    ['JAVA-LANG-001', 'JAVA-FRAMEWORK-018'],
    ['外部数据模型', '外部系统数据合同', '协议字段'],
  ],
  [
    'JAVA-ENGINEERING-005',
    '结果对象与结果合同',
    'intermediate',
    ['JAVA-LANG-001', 'JAVA-LANG-006'],
    ['结果对象', '结果合同', '结果状态', '校验结果建模'],
  ],
  [
    'JAVA-ENGINEERING-006',
    '异常、错误与消息边界',
    'intermediate',
    ['JAVA-LANG-009', 'JAVA-STDLIB-033'],
    ['错误边界', '错误合同', '错误聚合', '错误消息边界', '业务错误边界', '异常边界'],
  ],
  [
    'JAVA-ENGINEERING-007',
    '策略模式与业务路由',
    'intermediate',
    ['JAVA-LANG-003', 'JAVA-LANG-005'],
    ['按业务类型建组', '策略模式', '地区差异', '角色路由'],
  ],
  [
    'JAVA-ENGINEERING-008',
    '模板方法与默认扩展点',
    'intermediate',
    ['JAVA-LANG-003', 'JAVA-LANG-004'],
    ['模板方法', '默认方法'],
  ],
  [
    'JAVA-ENGINEERING-009',
    '责任链、顺序与排序合同',
    'advanced',
    ['JAVA-LANG-003'],
    ['顺序执行', '责任链', '责任链合同', 'Spring Order'],
  ],
  [
    'JAVA-ENGINEERING-010',
    '工厂、注册表与服务定位边界',
    'advanced',
    ['JAVA-LANG-003', 'JAVA-FRAMEWORK-002'],
    ['服务定位', '服务定位器', '服务定位器反例', '工厂/注册表'],
  ],
  ['JAVA-ENGINEERING-011', '适配器与端口隔离', 'intermediate', ['JAVA-LANG-003'], ['适配器']],
  [
    'JAVA-ENGINEERING-012',
    '回调与进度通知',
    'intermediate',
    ['JAVA-LANG-003', 'JAVA-LANG-008'],
    ['传输进度', '回调', '结果回调', '最后连接回调'],
  ],
  [
    'JAVA-ENGINEERING-013',
    '有限状态与状态流转',
    'advanced',
    ['JAVA-LANG-005'],
    ['会话状态恢复', '连接状态', '异步状态', '有限状态', '状态流转'],
  ],
  [
    'JAVA-ENGINEERING-014',
    '共享状态、静态初始化与可变性',
    'advanced',
    ['JAVA-LANG-002', 'JAVA-LANG-015'],
    [
      '不可重新赋值字段',
      '单例',
      '进程内状态',
      '静态初始化',
      '静态初始化块',
      '静态门面',
      '可变属性',
      '全局可见性',
      '全局状态',
    ],
  ],
  [
    'JAVA-ENGINEERING-015',
    '锁、可见性与并发状态保护',
    'advanced',
    ['JAVA-LANG-013', 'JAVA-STDLIB-024', 'JAVA-STDLIB-025'],
    ['双重检查锁', '同步块与锁', 'ReentrantLock', 'synchronized', 'volatile'],
  ],
  [
    'JAVA-ENGINEERING-016',
    '异步执行与线程边界',
    'advanced',
    ['JAVA-STDLIB-023', 'JAVA-FRAMEWORK-005'],
    ['线程边界', '异步边界', '异步响应'],
  ],
  [
    'JAVA-ENGINEERING-017',
    '请求、用户与线程上下文传播',
    'advanced',
    ['JAVA-STDLIB-026'],
    ['当前用户边界', '请求上下文', '上下文传递', '线程上下文', '线程上下文传播', '用户上下文'],
  ],
  [
    'JAVA-ENGINEERING-018',
    '资源生命周期、清理与优雅关闭',
    'advanced',
    ['JAVA-LANG-014', 'JAVA-STDLIB-014'],
    [
      '清理生命周期',
      '清理责任',
      '外部资源初始化',
      '优雅关闭',
      '资源管理',
      '资源清理',
      '资源生命周期',
    ],
  ],
  [
    'JAVA-ENGINEERING-019',
    '幂等、事务与失败回退',
    'advanced',
    ['JAVA-FRAMEWORK-006', 'JAVA-FRAMEWORK-007'],
    ['幂等性', '失败回退', '事务'],
  ],
  [
    'JAVA-ENGINEERING-020',
    '进程内缓存与缓存失效',
    'advanced',
    ['JAVA-STDLIB-005', 'JAVA-STDLIB-024'],
    ['过期 Map', '缓存键', '缓存清理', '进程内缓存', '元数据缓存'],
  ],
  [
    'JAVA-ENGINEERING-021',
    '配置读取、建模与派生配置',
    'intermediate',
    ['JAVA-FRAMEWORK-001'],
    ['派生配置', '配置读取', '配置数据建模', '配置映射', '视频平台配置'],
  ],
  [
    'JAVA-ENGINEERING-022',
    '外部系统集成与设备适配',
    'advanced',
    ['JAVA-ENGINEERING-011'],
    ['外部 API', '外部集成', '外部设备集成', '外部系统集成'],
  ],
  [
    'JAVA-ENGINEERING-023',
    'HTTP 调用、超时与头部合同',
    'advanced',
    ['JAVA-FRAMEWORK-022', 'JAVA-STDLIB-019'],
    ['超时', '连接与读取超时', '外部 HTTP', 'HTTP', 'HTTP 调用', 'HTTP headers', 'URLConnection'],
  ],
  [
    'JAVA-ENGINEERING-024',
    '流式数据、同步与转换管线',
    'advanced',
    ['JAVA-STDLIB-013'],
    ['流式数据', '数据上报', '数据输出边界', '数据同步', '完整行边界'],
  ],
  [
    'JAVA-ENGINEERING-025',
    '认证、授权与匿名访问边界',
    'advanced',
    ['JAVA-FRAMEWORK-008', 'JAVA-FRAMEWORK-010'],
    ['匿名入口', '权限过滤', '认证', '认证请求', '认证数据', '文档端点访问控制'],
  ],
  [
    'JAVA-ENGINEERING-026',
    '凭据、签名与敏感数据处理',
    'advanced',
    ['JAVA-STDLIB-027', 'JAVA-STDLIB-028'],
    ['敏感配置', '敏感数据', '敏感字段处理', '凭据解密', '凭据跨域规则', '请求签名'],
  ],
  [
    'JAVA-ENGINEERING-027',
    '输入过滤、校验扩展与审计',
    'advanced',
    ['JAVA-FRAMEWORK-009', 'JAVA-FRAMEWORK-026'],
    ['安全过滤', '关键字匹配', '审计日志', '校验扩展点', 'HTML 转义'],
  ],
  [
    'JAVA-ENGINEERING-028',
    '实时会话、广播与心跳',
    'advanced',
    ['JAVA-FRAMEWORK-011'],
    ['房间广播', '分组广播', '广播', '会话超时', '会话分组', '会话清理', '消息缓冲区', '心跳'],
  ],
  [
    'JAVA-ENGINEERING-029',
    '文件、二进制载荷与存储边界',
    'advanced',
    ['JAVA-STDLIB-015', 'JAVA-FRAMEWORK-028'],
    ['对象存储', '二进制载荷', '路径构造', '文件处理', '文件魔数', '文件上传', '文件下载'],
  ],
  [
    'JAVA-ENGINEERING-030',
    '文档、媒体与 XML 处理管线',
    'advanced',
    ['JAVA-STDLIB-013', 'JAVA-FRAMEWORK-029', 'JAVA-FRAMEWORK-030'],
    ['媒体流', '文本位置', '文档转换', '语音转写', 'XML I/O'],
  ],
  [
    'JAVA-ENGINEERING-031',
    '对象映射与值转换',
    'intermediate',
    ['JAVA-LANG-001', 'JAVA-STDLIB-003'],
    [
      '编码映射',
      '查找方法',
      '代码映射',
      '对象转换',
      '分类映射',
      '类型映射',
      '数据转换',
      '值转换',
      '转换参数',
      'BeanUtils',
    ],
  ],
  [
    'JAVA-ENGINEERING-032',
    '领域规则、树结构与坐标值对象',
    'intermediate',
    ['JAVA-LANG-001', 'JAVA-STDLIB-005'],
    [
      '比例',
      '法院代码',
      '领域规则',
      '平均值',
      '树结构',
      '条件判断',
      '坐标',
      '坐标布局',
      '坐标换算合同',
    ],
  ],
  [
    'JAVA-ENGINEERING-033',
    '分页参数与标识符生成',
    'intermediate',
    ['JAVA-STDLIB-032', 'JAVA-FRAMEWORK-015'],
    ['分页', '分页参数边界', '雪花算法'],
  ],
  [
    'JAVA-ENGINEERING-034',
    '兼容性合同与 legacy 隔离',
    'advanced',
    ['JAVA-LANG-003'],
    ['兼容合同', '业务兼容', 'legacy 兼容'],
  ],
  [
    'JAVA-ENGINEERING-035',
    '回归测试与可观测断言',
    'intermediate',
    ['JAVA-FRAMEWORK-023'],
    [
      '产物回归',
      '纯函数式测试',
      '服务协作测试',
      '模板变量',
      '字符串差分',
      '字符串断言',
      '坐标断言',
      'HTML 段落解析',
    ],
  ],
  [
    'JAVA-ENGINEERING-036',
    'API 参数与命名合同',
    'intermediate',
    ['JAVA-FRAMEWORK-008'],
    ['多路径参数', '路径参数', '命名约定'],
  ],
  [
    'JAVA-ENGINEERING-037',
    '许可证模型与基础设施适配',
    'advanced',
    ['JAVA-ENGINEERING-011'],
    ['许可证模型', '许可证适配'],
  ],
  [
    'JAVA-ENGINEERING-038',
    '任务调度、上下文与执行状态',
    'advanced',
    ['JAVA-STDLIB-023', 'JAVA-FRAMEWORK-005'],
    [
      '调度边界',
      '后台轮询',
      '批处理',
      '任务编排',
      '任务结果',
      '任务上下文',
      '任务适配器',
      '任务优先级',
      '任务重入',
      '任务状态',
    ],
  ],
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

/** 读取并验证上一批 519 个 pending 输入。 */
function readPreviousPendingInventory() {
  const manifestContent = fs.readFileSync(previousManifestPath, 'utf8')
  assert(sha256(manifestContent) === previousManifestSha256, '上一批 manifest 哈希错误')
  const manifest = JSON.parse(manifestContent)
  assert(manifest.batchId === 'phase-1d-framework', '上一批身份错误')
  assert(manifest.status === 'completed' && manifest.gateStatus === 'not-passed', '上一批状态错误')
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, '上一批快照错误')
  assert(manifest.sourceInventory.itemCount === 754, '上一批输入分母错误')
  assert(manifest.matrix.normalizedSourceItemCount === 235, '上一批完成输入数错误')
  assert(manifest.matrix.pendingSourceItemCount === 519, '上一批 pending 分母错误')
  assert(manifest.coverageBoundary.nextBatch === 'engineering-pattern', '上一批后继批次错误')

  const sourceContent = fs.readFileSync(
    path.join(auditDirectory, manifest.sourceInventory.path),
    'utf8',
  )
  assert(sha256(sourceContent) === previousSourceInventorySha256, '上一批输入清单哈希错误')
  assert(manifest.sourceInventory.sha256 === previousSourceInventorySha256, '上一批未绑定输入清单')
  const allSources = parseJsonLines(sourceContent, manifest.sourceInventory.path)
  assert(allSources.length === 754, '上一批输入清单行数错误')
  assert(
    new Set(allSources.map((source) => source.sourceId)).size === 754,
    '上一批 sourceId 不唯一',
  )
  const pending = allSources.filter((source) => source.normalizationStatus === 'pending')
  assert(pending.length === 519, `上一批 pending 输入数错误：${pending.length}`)
  assert(
    pending.every((source) => source.capabilityId === null),
    '上一批 pending 已有能力 ID',
  )
  assert(
    pending.filter((source) => source.sourceKind === 'review-capability').length === 200,
    '工程模式候选分母错误',
  )
  assert(
    pending.filter((source) => source.sourceKind === 'review-risk').length === 319,
    '风险说明分母错误',
  )
  return pending
}

/** 读取冻结的七个自动提取分片。 */
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
  assert(records.length === 3436, `提取记录数错误：${records.length}`)
  assert(new Set(records.map((record) => record.path)).size === 3436, '提取路径不唯一')
  return records
}

/** 从独立能力合同建立 200 个唯一来源映射。 */
function buildExpectedAssignments(pendingInventory) {
  const pendingKeys = new Set(
    pendingInventory.map((source) => `${source.sourceKind}\u0000${source.key}`),
  )
  const assignments = new Map()
  const capabilityIds = expectedCapabilities.map(([capabilityId]) => capabilityId)
  assert(
    JSON.stringify(capabilityIds) ===
      JSON.stringify(
        Array.from(
          { length: 38 },
          (_, index) => `JAVA-ENGINEERING-${String(index + 1).padStart(3, '0')}`,
        ),
      ),
    '独立能力 ID 序列错误',
  )
  const engineeringIds = new Set(capabilityIds)
  for (const [capabilityId, , , prerequisites, sourceKeys] of expectedCapabilities) {
    for (const key of sourceKeys) {
      const sourceKey = `review-capability\u0000${key}`
      assert(pendingKeys.has(sourceKey), `独立合同引用不存在的工程候选：${key}`)
      assert(!assignments.has(sourceKey), `独立合同重复映射：${key}`)
      assignments.set(sourceKey, capabilityId)
    }
    for (const prerequisite of prerequisites) {
      assert(
        prerequisite.startsWith('JAVA-LANG-') ||
          prerequisite.startsWith('JAVA-STDLIB-') ||
          prerequisite.startsWith('JAVA-FRAMEWORK-') ||
          engineeringIds.has(prerequisite),
        `独立前置能力不存在：${capabilityId}/${prerequisite}`,
      )
    }
  }
  assert(assignments.size === 200, `独立工程候选映射数错误：${assignments.size}`)
  return assignments
}

/** 由上一批输入独立推导本批 519 条期望状态。 */
function buildExpectedSourceInventory(pendingInventory, assignments) {
  const inventory = pendingInventory.map((source) => {
    const capabilityId = assignments.get(`${source.sourceKind}\u0000${source.key}`) ?? null
    return {
      ...source,
      normalizationStatus: capabilityId ? 'normalized' : 'pending',
      capabilityId,
    }
  })
  assert(inventory.length === 519, '独立输入分母错误')
  assert(
    inventory.filter((source) => source.normalizationStatus === 'normalized').length === 200,
    '独立完成输入数错误',
  )
  assert(
    inventory.filter((source) => source.normalizationStatus === 'pending').length === 319,
    '独立 pending 输入数错误',
  )
  assert(
    inventory
      .filter((source) => source.sourceKind === 'review-capability')
      .every((source) => source.normalizationStatus === 'normalized'),
    '工程候选没有全部归一化',
  )
  assert(
    inventory
      .filter((source) => source.sourceKind === 'review-risk')
      .every((source) => source.normalizationStatus === 'pending' && source.capabilityId === null),
    '风险说明被提前归一化',
  )
  assert(
    inventory.every((source) =>
      source.observedFiles.every((filePath) => filePath.startsWith('dzzz-app/')),
    ),
    '独立输入包含 dzzz-app 外路径',
  )
  return inventory
}

/** 从冻结提取记录取得一个代表符号。 */
function representativeSymbol(filePath, extractedByPath) {
  const extracted = extractedByPath.get(filePath)
  assert(extracted, `代表文件不在冻结提取记录中：${filePath}`)
  const declaredType = extracted.declaredTypes?.find((type) => type.owner === null)
  return {
    symbol: declaredType?.qualifiedName ?? path.basename(filePath, '.java'),
    path: filePath,
  }
}

/** 按来源优先、路径补足的独立规则选择最多五个代表符号。 */
function selectRepresentativeSymbols(sources, extractedByPath) {
  const selectedPaths = []
  for (const source of sources) {
    const candidate = source.observedFiles.find((filePath) => !selectedPaths.includes(filePath))
    if (candidate) selectedPaths.push(candidate)
    if (selectedPaths.length === 5) break
  }
  const allPaths = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
  for (const filePath of allPaths) {
    if (selectedPaths.length === 5) break
    if (!selectedPaths.includes(filePath)) selectedPaths.push(filePath)
  }
  return selectedPaths.map((filePath) => representativeSymbol(filePath, extractedByPath))
}

/** 从独立合同建立 38 个期望能力对象。 */
function buildExpectedCapabilities(sourceInventory, extractedRecords) {
  const sourceByKey = new Map(
    sourceInventory.map((source) => [`${source.sourceKind}\u0000${source.key}`, source]),
  )
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  return expectedCapabilities.map(
    ([capabilityId, name, recommendedStage, prerequisites, sourceKeys]) => {
      const sources = sourceKeys.map((key) => {
        const source = sourceByKey.get(`review-capability\u0000${key}`)
        assert(source?.capabilityId === capabilityId, `独立能力映射错位：${capabilityId}/${key}`)
        return source
      })
      const observedFiles = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
      return {
        capabilityId,
        name,
        kind: 'engineering-pattern',
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

/** 验证人工签核固定绑定三份候选产物。 */
function validateSignoff(signoff, artifactContents) {
  assert(signoff.schemaVersion === 1, '签核 schemaVersion 错误')
  assert(signoff.snapshotId === snapshotId && signoff.analysisId === analysisId, '签核快照错误')
  assert(signoff.batchId === batchId && signoff.status === 'approved', '签核状态错误')
  assert(signoff.reviewedAt === reviewedAt, '签核时间错误')
  assert(signoff.reviewedBy === 'Codex', '签核审查者错误')
  assert(signoff.reviewerType === 'agent-assisted-manual-review', '签核审查类型错误')
  const expectedSummary = {
    rawSourceItemCount: 519,
    normalizedSourceItemCount: 200,
    pendingSourceItemCount: 319,
    capabilityCount: 38,
    normalizedObservedFileCount: 2742,
    representativeSymbolCount: 179,
  }
  assert(JSON.stringify(signoff.summary) === JSON.stringify(expectedSummary), '签核摘要错误')
  assert(signoff.artifacts.length === 3, '签核产物数错误')
  assert(
    JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) ===
      JSON.stringify(Object.keys(expectedArtifactHashes).sort()),
    '签核产物路径集合错误',
  )
  for (const artifact of signoff.artifacts) {
    assert(
      artifact.sha256 === expectedArtifactHashes[artifact.path],
      `签核固定哈希错误：${artifact.path}`,
    )
    assert(
      sha256(artifactContents[artifact.path]) === artifact.sha256,
      `签核当前哈希错误：${artifact.path}`,
    )
  }
}

/** 验证结构化矩阵完全符合独立能力合同。 */
function validateMatrix(matrix, expectedCapabilityItems) {
  assert(matrix.schemaVersion === 1, '矩阵 schemaVersion 错误')
  assert(matrix.snapshotId === snapshotId && matrix.analysisId === analysisId, '矩阵快照错误')
  assert(matrix.batchId === batchId && matrix.reviewedAt === reviewedAt, '矩阵批次身份错误')
  assert(matrix.matrixKind === 'java-engineering-pattern', '矩阵类型错误')
  assert(
    JSON.stringify(matrix.inputLineage) ===
      JSON.stringify({
        previousBatchId: 'phase-1d-framework',
        previousManifestSha256,
        previousSourceInventorySha256,
        previousPendingSourceItemCount: 519,
      }),
    '矩阵输入血缘错误',
  )
  const expectedSummary = {
    rawSourceItemCount: 519,
    normalizedSourceItemCount: 200,
    pendingSourceItemCount: 319,
    pendingBySourceKind: {
      'review-capability': 0,
      'language-feature': 0,
      'framework-usage': 0,
      'review-risk': 319,
    },
    capabilityCount: 38,
    normalizedObservedFileCount: 2742,
    representativeSymbolCount: 179,
  }
  assert(JSON.stringify(matrix.summary) === JSON.stringify(expectedSummary), '矩阵摘要错误')
  assert(
    JSON.stringify(matrix.capabilities) === JSON.stringify(expectedCapabilityItems),
    '矩阵能力内容不符合独立合同',
  )
  const normalizedObservedFiles = new Set(
    expectedCapabilityItems.flatMap((capability) => capability.observedFiles),
  )
  assert(normalizedObservedFiles.size === 2742, '独立唯一证据文件数错误')
  assert(
    expectedCapabilityItems.reduce(
      (total, capability) => total + capability.representativeSymbols.length,
      0,
    ) === 179,
    '独立代表符号数错误',
  )
}

/** 验证 Markdown 摘要保留本批的关键边界语义。 */
function validateMarkdown(markdown) {
  assert(markdown.startsWith('# `dzzz-app` Java 工程模式能力矩阵\n'), 'Markdown 标题错误')
  assert(
    [...markdown.matchAll(/^### JAVA-ENGINEERING-\d{3} /gm)].length === 38,
    'Markdown 能力标题数错误',
  )
  for (const [capabilityId, name] of expectedCapabilities) {
    assert(markdown.includes(`### ${capabilityId} ${name}\n`), `Markdown 缺少能力：${capabilityId}`)
  }
  assert(markdown.includes('200 个文件级工程候选已全部归一化'), 'Markdown 缺少完成边界')
  assert(markdown.includes('319 个风险说明全部保持 `pending`'), 'Markdown 缺少风险保留边界')
  assert(markdown.includes('Gate 1 仍未通过'), 'Markdown 错误声明 Gate 1')
  assert(markdown.includes('下一批只能继续处理风险反例归一化'), 'Markdown 后继批次错误')
  assert(markdown.includes('不认可项目旧写法'), 'Markdown 缺少旧写法纠正边界')
}

/** 验证 manifest 对正式产物、签核和后继批次的绑定。 */
function validateManifest(manifest, artifactContents, signoff) {
  assert(manifest.schemaVersion === 1, 'manifest schemaVersion 错误')
  assert(
    manifest.snapshotId === snapshotId && manifest.analysisId === analysisId,
    'manifest 快照错误',
  )
  assert(manifest.batchId === batchId && manifest.status === 'completed', 'manifest 批次状态错误')
  assert(
    manifest.reviewedAt === reviewedAt && manifest.gateStatus === 'not-passed',
    'manifest Gate 状态错误',
  )
  assert(
    JSON.stringify(manifest.previousBatch) ===
      JSON.stringify({
        previousBatchId: 'phase-1d-framework',
        previousManifestSha256,
        previousSourceInventorySha256,
        previousPendingSourceItemCount: 519,
      }),
    'manifest 上一批血缘错误',
  )
  assert(
    JSON.stringify(manifest.sourceInventory) ===
      JSON.stringify({
        path: sourceInventoryFileName,
        sha256: expectedArtifactHashes[sourceInventoryFileName],
        itemCount: 519,
        observedFileAssignments: 6665,
        sourceKindCounts: {
          'review-capability': 200,
          'language-feature': 0,
          'framework-usage': 0,
          'review-risk': 319,
        },
        sourceKindFileAssignments: {
          'review-capability': 3513,
          'language-feature': 0,
          'framework-usage': 0,
          'review-risk': 3152,
        },
      }),
    'manifest 输入清单摘要错误',
  )
  assert(manifest.matrix.jsonPath === matrixJsonFileName, 'manifest 矩阵 JSON 路径错误')
  assert(
    manifest.matrix.jsonSha256 === expectedArtifactHashes[matrixJsonFileName],
    'manifest 矩阵 JSON 哈希错误',
  )
  assert(manifest.matrix.markdownPath === matrixMarkdownFileName, 'manifest Markdown 路径错误')
  assert(
    manifest.matrix.markdownSha256 === expectedArtifactHashes[matrixMarkdownFileName],
    'manifest Markdown 哈希错误',
  )
  assert(
    JSON.stringify({
      rawSourceItemCount: manifest.matrix.rawSourceItemCount,
      normalizedSourceItemCount: manifest.matrix.normalizedSourceItemCount,
      pendingSourceItemCount: manifest.matrix.pendingSourceItemCount,
      pendingBySourceKind: manifest.matrix.pendingBySourceKind,
      capabilityCount: manifest.matrix.capabilityCount,
      normalizedObservedFileCount: manifest.matrix.normalizedObservedFileCount,
      representativeSymbolCount: manifest.matrix.representativeSymbolCount,
    }) ===
      JSON.stringify({
        rawSourceItemCount: 519,
        normalizedSourceItemCount: 200,
        pendingSourceItemCount: 319,
        pendingBySourceKind: {
          'review-capability': 0,
          'language-feature': 0,
          'framework-usage': 0,
          'review-risk': 319,
        },
        capabilityCount: 38,
        normalizedObservedFileCount: 2742,
        representativeSymbolCount: 179,
      }),
    'manifest 矩阵摘要错误',
  )
  assert(
    JSON.stringify(manifest.manualReviewSignoff) ===
      JSON.stringify({
        path: 'reviews/phase-1d-engineering-pattern-signoff.json',
        sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
        reviewedBy: 'Codex',
        reviewerType: 'agent-assisted-manual-review',
      }),
    'manifest 签核绑定错误',
  )
  assert(
    JSON.stringify(manifest.coverageBoundary) ===
      JSON.stringify({
        normalizedKinds: ['engineering-pattern'],
        pendingKinds: ['review-risk'],
        nextBatch: 'review-risk',
        courseAuthoringStarted: false,
      }),
    'manifest 覆盖边界错误',
  )
  for (const [fileName, expectedHash] of Object.entries(expectedArtifactHashes)) {
    assert(sha256(artifactContents[fileName]) === expectedHash, `正式产物哈希错误：${fileName}`)
  }
}

/** 对正式产物执行独立来源、语义与边界校验。 */
function main() {
  for (const fileName of [
    sourceInventoryFileName,
    matrixJsonFileName,
    matrixMarkdownFileName,
    manifestFileName,
  ]) {
    assert(
      fs.existsSync(path.join(outputDirectory, fileName)),
      `工程模式正式产物尚不存在：${fileName}`,
    )
  }
  const artifactContents = Object.fromEntries(
    [sourceInventoryFileName, matrixJsonFileName, matrixMarkdownFileName].map((fileName) => [
      fileName,
      fs.readFileSync(path.join(outputDirectory, fileName), 'utf8'),
    ]),
  )
  const signoff = readJson(signoffPath)
  validateSignoff(signoff, artifactContents)

  const previousPending = readPreviousPendingInventory()
  const assignments = buildExpectedAssignments(previousPending)
  const expectedSourceInventory = buildExpectedSourceInventory(previousPending, assignments)
  const actualSourceInventory = parseJsonLines(
    artifactContents[sourceInventoryFileName],
    sourceInventoryFileName,
  )
  assert(
    JSON.stringify(actualSourceInventory) === JSON.stringify(expectedSourceInventory),
    '正式输入清单不符合独立来源映射',
  )

  const expectedCapabilityItems = buildExpectedCapabilities(
    expectedSourceInventory,
    readExtractedRecords(),
  )
  const matrix = JSON.parse(artifactContents[matrixJsonFileName])
  validateMatrix(matrix, expectedCapabilityItems)
  validateMarkdown(artifactContents[matrixMarkdownFileName])
  validateManifest(
    readJson(path.join(outputDirectory, manifestFileName)),
    artifactContents,
    signoff,
  )

  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId,
      sourceItemCount: 519,
      normalizedSourceItemCount: 200,
      pendingSourceItemCount: 319,
      capabilityCount: 38,
      gateStatus: 'not-passed',
      nextBatch: 'review-risk',
    }),
  )
}

main()
