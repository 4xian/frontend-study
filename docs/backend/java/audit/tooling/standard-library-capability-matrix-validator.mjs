import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_STANDARD_LIBRARY_NORMALIZATION_DIRECTORY
  ? path.resolve(process.env.DZZZ_STANDARD_LIBRARY_NORMALIZATION_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_STANDARD_LIBRARY_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_STANDARD_LIBRARY_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-standard-library-signoff.json')
const previousManifestPath = path.join(auditDirectory, 'phase-1d-java-language-manifest.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const sourceInventoryFileName = 'standard-library-capability-source-inventory.jsonl'
const matrixJsonFileName = 'java-standard-library-capability-matrix.json'
const matrixMarkdownFileName = 'java-standard-library-capability-matrix.md'
const manifestFileName = 'phase-1d-standard-library-manifest.json'
const snapshotId = 'dzzz-app-20260803-179e722831ab'
const analysisId = 'dzzz-app-analysis-20260803-958d37cf1be1'
const batchId = 'phase-1d-standard-library'
const batchName = 'Phase 1D 第 2 批：Java 标准库能力归一化'
const reviewedAt = '2026-08-04T10:31:59.000Z'
const previousSourceInventorySha256 =
  '7a5a9d5745820f7ac8e9874419e8a45c9cc7b60723ee9f886e3a4336d7454815'
const previousManifestSha256 =
  '985410a0589be896ddcb7e793e8782c506fafeb2fdfdeb19ae5f69612152ca94'
const sourceKindOrder = [
  'review-capability',
  'language-feature',
  'framework-usage',
  'review-risk',
]

const expectedCapabilities = [
  ['JAVA-STDLIB-001', 'java.base 核心标准库概览', 'basic', ['JAVA-LANG-001'], ['Java 标准库']],
  ['JAVA-STDLIB-002', 'String、字符串池与格式化', 'basic', [], ['字符串格式化', 'String', 'String.intern']],
  ['JAVA-STDLIB-003', 'Charset、StandardCharsets 与字符编码', 'basic', ['JAVA-STDLIB-002'], ['字符编码', 'UTF-8 解码']],
  ['JAVA-STDLIB-004', '正则表达式 Pattern 与 Matcher', 'basic', ['JAVA-STDLIB-002'], ['正则表达式', '正则校验']],
  ['JAVA-STDLIB-005', 'Collection、List、Set 与 Map', 'basic', ['JAVA-LANG-006'], ['集合', '集合边界', '集合查询', '集合可见性', '集合算法', 'Map']],
  ['JAVA-STDLIB-006', 'Iterator 删除与只读集合视图', 'intermediate', ['JAVA-STDLIB-005'], ['迭代器删除', '只读集合']],
  ['JAVA-STDLIB-007', 'Comparable 与自然顺序', 'intermediate', ['JAVA-LANG-003', 'JAVA-LANG-006'], ['Comparable']],
  ['JAVA-STDLIB-008', 'Stream 与 Collectors', 'intermediate', ['JAVA-LANG-008', 'JAVA-STDLIB-005'], ['集合聚合', '去重', 'Stream API', 'Stream/Collectors', ['language-feature', 'stream-api']]],
  ['JAVA-STDLIB-009', 'Optional', 'intermediate', ['JAVA-LANG-006'], [['language-feature', 'optional']]],
  ['JAVA-STDLIB-010', 'Date、Calendar 与传统日期格式化', 'basic', ['JAVA-STDLIB-002'], ['日期格式', '日期格式化', '日期校验', 'Date/Calendar']],
  ['JAVA-STDLIB-011', 'java.time 日期时间 API', 'intermediate', ['JAVA-STDLIB-010'], ['java.time']],
  ['JAVA-STDLIB-012', 'Locale、GMT 与时区', 'intermediate', ['JAVA-STDLIB-010'], ['GMT 时间', 'Locale']],
  ['JAVA-STDLIB-013', 'I/O 流、Reader 与 Writer', 'basic', ['JAVA-LANG-009'], ['流式 I/O', '输入流', '文件流', 'Java I/O', ['language-feature', 'io']]],
  ['JAVA-STDLIB-014', 'AutoCloseable 与资源关闭合同', 'intermediate', ['JAVA-LANG-014', 'JAVA-STDLIB-013'], ['I/O 资源所有权', '资源关闭', 'try-with-resources']],
  ['JAVA-STDLIB-015', 'File、Path、Files 与 NIO 文件系统', 'intermediate', ['JAVA-STDLIB-013'], ['临时文件', '路径校验', '文件 I/O', '文件路径', '文件系统路径', 'java.nio']],
  ['JAVA-STDLIB-016', 'RandomAccessFile、Channel 与字节偏移', 'advanced', ['JAVA-STDLIB-013', 'JAVA-STDLIB-015'], ['文件 tail', '字节偏移', 'Channel', 'RandomAccessFile']],
  ['JAVA-STDLIB-017', 'ZIP 压缩流', 'intermediate', ['JAVA-STDLIB-013', 'JAVA-STDLIB-014'], ['压缩']],
  ['JAVA-STDLIB-018', 'Process、ProcessBuilder 与 Runtime.exec', 'advanced', ['JAVA-STDLIB-013', 'JAVA-STDLIB-014'], ['进程 I/O', '进程调用', 'Runtime.exec']],
  ['JAVA-STDLIB-019', 'URL 编解码', 'basic', ['JAVA-STDLIB-002', 'JAVA-STDLIB-003'], ['URL 编码']],
  ['JAVA-STDLIB-020', '反射、动态实例化与注解读取', 'advanced', ['JAVA-LANG-007', 'JAVA-LANG-009'], ['动态实例化', '反射', '反射式调用', '反射与注解读取', ['language-feature', 'reflection']]],
  ['JAVA-STDLIB-021', 'Serializable 与原生对象序列化', 'advanced', ['JAVA-LANG-003', 'JAVA-LANG-009', 'JAVA-STDLIB-013'], ['反序列化', '序列化', '序列化边界', 'Serializable']],
  ['JAVA-STDLIB-022', 'Base64 编解码', 'basic', ['JAVA-STDLIB-003'], ['Base64']],
  ['JAVA-STDLIB-023', 'Executor、Future、Callable 与 CompletableFuture', 'advanced', ['JAVA-LANG-008', 'JAVA-LANG-009'], ['并发与执行器', '队列容量', '拒绝策略', '显式 Executor', '线程池', '线程池参数', '线程命名', '线程生命周期', 'Callable', 'CompletableFuture', 'ExecutorService', 'Future', 'FutureTask', 'ThreadPoolExecutor', ['language-feature', 'concurrency']]],
  ['JAVA-STDLIB-024', '并发集合与阻塞队列', 'advanced', ['JAVA-STDLIB-005'], ['并发 Map', '并发集合', '并发控制', '并发映射', '写时复制集合', '优先级队列', 'ConcurrentHashMap', 'PriorityBlockingQueue']],
  ['JAVA-STDLIB-025', '原子类型与原子计数', 'advanced', [], ['原子计数', 'AtomicInteger']],
  ['JAVA-STDLIB-026', 'ThreadLocal 上下文与清理', 'advanced', ['JAVA-STDLIB-023'], ['ThreadLocal', 'ThreadLocal 清理', 'ThreadLocal 上下文']],
  ['JAVA-STDLIB-027', 'JCA/JCE、Cipher 与密钥 API', 'advanced', ['JAVA-STDLIB-003', 'JAVA-STDLIB-013'], ['3DES', '密码学兼容', '密钥材料', 'AES', 'JCA/JCE', 'RSA']],
  ['JAVA-STDLIB-028', 'MessageDigest、Mac 与 Signature', 'advanced', ['JAVA-STDLIB-003', 'JAVA-STDLIB-027'], ['签名', '签名兼容', '摘要', 'HMAC', 'MessageDigest']],
  ['JAVA-STDLIB-029', 'ImageIO、BufferedImage 与 Java2D', 'intermediate', ['JAVA-STDLIB-013', 'JAVA-STDLIB-014'], ['图片 fixture', '图片合成', 'BufferedImage', 'ImageIO']],
  ['JAVA-STDLIB-030', 'System properties 与运行环境信息', 'intermediate', [], ['系统属性']],
  ['JAVA-STDLIB-031', 'JMX 与 JVM 指标读取', 'advanced', ['JAVA-STDLIB-030'], ['系统指标', 'JMX']],
  ['JAVA-STDLIB-032', 'UUID 与伪随机数', 'basic', [], ['Random', 'UUID']],
  ['JAVA-STDLIB-033', 'Throwable cause 异常链', 'basic', ['JAVA-LANG-009'], ['cause 保留']],
]

const excludedKeys = [
  '关键字匹配',
  '静态资源 URL 编码',
  '默认方法',
  'ReentrantLock',
  'SSL',
  'synchronized',
  'URLConnection',
  'volatile',
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
  return sourceDeclarations.map((source) =>
    Array.isArray(source) ? source : ['review-capability', source],
  )
}

/** 独立验证上一批身份并读取 866 个 pending 输入。 */
function readPreviousPendingInventory() {
  const manifestContent = fs.readFileSync(previousManifestPath, 'utf8')
  assert(sha256(manifestContent) === previousManifestSha256, '上一批 manifest 哈希错误')
  const manifest = JSON.parse(manifestContent)
  assert(manifest.batchId === 'phase-1d-java-language', '上一批身份错误')
  assert(manifest.status === 'completed' && manifest.gateStatus === 'not-passed', '上一批状态错误')
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, '上一批快照错误')
  assert(manifest.matrix.pendingSourceItemCount === 866, '上一批 pending 分母错误')
  assert(manifest.coverageBoundary.nextBatch === 'standard-library', '上一批后继批次错误')
  const sourceContent = fs.readFileSync(
    path.join(auditDirectory, manifest.sourceInventory.path),
    'utf8',
  )
  assert(sha256(sourceContent) === previousSourceInventorySha256, '上一批输入清单哈希错误')
  assert(manifest.sourceInventory.sha256 === previousSourceInventorySha256, '上一批未绑定输入清单')
  const allSources = parseJsonLines(sourceContent, manifest.sourceInventory.path)
  assert(allSources.length === 906, '上一批输入清单行数错误')
  assert(allSources.filter((source) => source.normalizationStatus === 'normalized').length === 40, '上一批 normalized 数错误')
  const pending = allSources.filter((source) => source.normalizationStatus === 'pending')
  assert(pending.length === 866, '上一批 pending 输入数错误')
  assert(pending.every((source) => source.capabilityId === null), '上一批 pending 能力 ID 非空')
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

/** 从独立能力合同建立 112 个唯一输入映射。 */
function buildAssignments(pendingInventory) {
  const pendingKeys = new Set(
    pendingInventory.map((source) => `${source.sourceKind}\u0000${source.key}`),
  )
  const assignments = new Map()
  const capabilityIds = new Set(expectedCapabilities.map(([capabilityId]) => capabilityId))
  assert(capabilityIds.size === 33, '独立能力 ID 不唯一')
  for (const [capabilityId, , , prerequisites, sourceDeclarations] of expectedCapabilities) {
    for (const [sourceKind, key] of normalizeExpectedSources(sourceDeclarations)) {
      const sourceKey = `${sourceKind}\u0000${key}`
      assert(pendingKeys.has(sourceKey), `独立合同引用不存在的输入：${sourceKind}/${key}`)
      assert(!assignments.has(sourceKey), `独立合同重复映射：${sourceKind}/${key}`)
      assignments.set(sourceKey, capabilityId)
    }
    for (const prerequisite of prerequisites) {
      assert(
        prerequisite.startsWith('JAVA-LANG-') || capabilityIds.has(prerequisite),
        `独立前置能力不存在：${capabilityId}/${prerequisite}`,
      )
    }
  }
  assert(assignments.size === 112, `独立映射数错误：${assignments.size}`)
  return assignments
}

/** 独立生成 866 条本批输入状态。 */
function buildSourceInventory(pendingInventory, assignments) {
  const inventory = pendingInventory.map((source) => {
    const capabilityId = assignments.get(`${source.sourceKind}\u0000${source.key}`) ?? null
    return {
      ...source,
      normalizationStatus: capabilityId ? 'normalized' : 'pending',
      capabilityId,
    }
  })
  assert(inventory.length === 866, '独立输入分母错误')
  assert(inventory.filter((source) => source.normalizationStatus === 'normalized').length === 112, '独立完成输入数错误')
  assert(inventory.filter((source) => source.normalizationStatus === 'pending').length === 754, '独立 pending 输入数错误')
  assert(
    inventory
      .filter((source) => source.sourceKind === 'framework-usage' || source.sourceKind === 'review-risk')
      .every((source) => source.normalizationStatus === 'pending'),
    '框架或风险输入被提前归一化',
  )
  for (const key of excludedKeys) {
    const source = inventory.find((item) => item.key === key)
    assert(source?.normalizationStatus === 'pending' && source.capabilityId === null, `排除项被错误归一化：${key}`)
  }
  for (const key of ['concurrency', 'io', 'optional', 'reflection', 'stream-api']) {
    const source = inventory.find(
      (item) => item.sourceKind === 'language-feature' && item.key === key,
    )
    assert(source?.normalizationStatus === 'normalized', `标准库语言信号未完成：${key}`)
  }
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
    const firstUnusedPath = source.observedFiles.find((filePath) => !selectedPaths.includes(filePath))
    if (firstUnusedPath) selectedPaths.push(firstUnusedPath)
  }
  const union = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
  for (const filePath of union) {
    if (selectedPaths.length >= 5) break
    if (!selectedPaths.includes(filePath)) selectedPaths.push(filePath)
  }
  return selectedPaths.map((filePath) => representativeSymbol(filePath, extractedByPath))
}

/** 独立建立 33 个规范标准库能力。 */
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
        kind: 'standard-library',
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
        modernBaseline: { java: '25 LTS' },
        legacyBaseline: { java: '8' },
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
  assert(JSON.stringify(counts) === JSON.stringify({
    'review-capability': 521,
    'language-feature': 5,
    'framework-usage': 21,
    'review-risk': 319,
  }), '独立来源分类计数错误')
  assert(JSON.stringify(fileAssignments) === JSON.stringify({
    'review-capability': 11713,
    'language-feature': 581,
    'framework-usage': 5300,
    'review-risk': 3152,
  }), '独立文件关联计数错误')
  return { counts, fileAssignments }
}

/** 将阶段代码转换为中文。 */
function stageLabel(stage) {
  return { basic: '基础', intermediate: '中级', advanced: '高级' }[stage]
}

/** 独立生成 Markdown 摘要。 */
function buildMarkdown(matrix, sourceCounts) {
  const lines = [
    '# `dzzz-app` Java 标准库能力矩阵',
    '',
    `> 批次：${batchName}`,
    `> 源码快照：\`${snapshotId}\``,
    `> 自动分析：\`${analysisId}\``,
    '> 状态：标准库批次已归一化，研究与课程正文尚未开始',
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
    `本批把 ${matrix.summary.normalizedSourceItemCount} 个明确的 JDK API 输入合并为 ${matrix.summary.capabilityCount} 个标准库能力。`,
    `其余 ${matrix.summary.pendingSourceItemCount} 个输入继续保持 \`pending\`。`,
    '所有 Spring、Servlet、JDBC/MyBatis、第三方库、工程模式和风险说明均未提前归一化。',
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
    '## 3. 已验证排除项',
    '',
    '- `URLConnection` 候选没有实际使用该 JDK 类型，本批保持 `pending`。',
    '- `SSL` 与“静态资源 URL 编码”实际属于 Spring/Apache HTTP 能力，本批保持 `pending`。',
    '- `ReentrantLock` 候选对应文件实际使用 `ConcurrentHashMap`，不伪造锁 API 能力。',
    '- 纯 `synchronized`、`volatile`、默认方法等语言残留不回填已经关闭的语言批次。',
    '- `try-with-resources` 复核输入只用于 `AutoCloseable` 资源合同，不重复建立语言能力。',
    '',
    '## 4. 当前边界',
    '',
    '- `modernBaseline` 与 `legacyBaseline` 只冻结版本线，不表示知识点研究已经完成。',
    '- `courseStatus=candidate` 只表示进入能力矩阵，不表示已经选择为独立课程。',
    '- 具体 API 合同、易错点、替代方案和开发技巧必须在 Phase 2 后逐项在线核验。',
    '- 本批不处理框架、工程模式、风险反例、项目示例、课程正文或前端平台。',
    '- Phase 1D 尚未完成，Gate 1 仍未通过。',
    '',
    '下一批只能继续处理框架能力归一化，不能开始课程正文、菜单或 Markdown adapter。',
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
    rawSourceItemCount: 866,
    normalizedSourceItemCount: 112,
    pendingSourceItemCount: 754,
    capabilityCount: 33,
    normalizedObservedFileCount: 580,
    representativeSymbolCount: 123,
  }
  assert(JSON.stringify(signoff.summary) === JSON.stringify(expectedSummary), '签核摘要错误')
  assert(summary.normalizedObservedFileCount === 580, '矩阵唯一证据文件数错误')
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
  const pendingSources = sourceInventory.filter((source) => source.normalizationStatus === 'pending')
  const pendingBySourceKind = Object.fromEntries(
    sourceKindOrder.map((sourceKind) => [
      sourceKind,
      pendingSources.filter((source) => source.sourceKind === sourceKind).length,
    ]),
  )
  assert(JSON.stringify(pendingBySourceKind) === JSON.stringify({
    'review-capability': 414,
    'language-feature': 0,
    'framework-usage': 21,
    'review-risk': 319,
  }), 'pending 分类计数错误')
  const matrix = {
    schemaVersion: 1,
    snapshotId,
    analysisId,
    batchId,
    reviewedAt,
    matrixKind: 'java-standard-library',
    inputLineage: {
      previousBatchId: 'phase-1d-java-language',
      previousManifestSha256,
      previousSourceInventorySha256,
      previousPendingSourceItemCount: 866,
    },
    summary: {
      rawSourceItemCount: 866,
      normalizedSourceItemCount: 112,
      pendingSourceItemCount: 754,
      pendingBySourceKind,
      capabilityCount: 33,
      normalizedObservedFileCount: 580,
      representativeSymbolCount: 123,
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
      itemCount: 866,
      observedFileAssignments: 20746,
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
      path: 'reviews/phase-1d-standard-library-signoff.json',
      sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
      reviewedBy: signoff.reviewedBy,
      reviewerType: signoff.reviewerType,
    },
    coverageBoundary: {
      normalizedKinds: ['standard-library'],
      pendingKinds: ['framework', 'engineering-pattern', 'review-risk', 'residual-or-invalid'],
      nextBatch: 'framework',
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
      sourceItemCount: 866,
      normalizedSourceItemCount: 112,
      pendingSourceItemCount: 754,
      capabilityCount: 33,
      gateStatus: 'not-passed',
      nextBatch: 'framework',
    }),
  )
}

main()
