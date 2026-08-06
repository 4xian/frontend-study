import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const outputDirectory = process.env.DZZZ_REVIEW_RISK_DIRECTORY
  ? path.resolve(process.env.DZZZ_REVIEW_RISK_DIRECTORY)
  : auditDirectory
const signoffPath = process.env.DZZZ_REVIEW_RISK_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_REVIEW_RISK_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1d-review-risk-signoff.json')
const snapshotId = 'dzzz-app-20260803-179e722831ab'
const analysisId = 'dzzz-app-analysis-20260803-958d37cf1be1'
const batchId = 'phase-1d-review-risk'
const reviewedAt = '2026-08-04T13:33:17.000Z'
const previousManifestSha256 = '2ea5eea9d4fd4ce5242daaf7daba0d21c901c2a5c949bcac4d178f43ffea2324'
const previousInventorySha256 =
  '7ade12db21b935a1655f5f70544f486afa5a823074264144f89550103096e25b'
const canonicalInventorySha256 =
  '7a5a9d5745820f7ac8e9874419e8a45c9cc7b60723ee9f886e3a4336d7454815'
const sourceInventoryFileName = 'review-risk-source-inventory.jsonl'
const matrixJsonFileName = 'java-review-risk-matrix.json'
const matrixMarkdownFileName = 'java-review-risk-matrix.md'
const manifestFileName = 'phase-1d-review-risk-manifest.json'
const expectedArtifactHashes = {
  [sourceInventoryFileName]: '8db78db07fa0c1df3212b8ef26700c2a16370b2cd7d80cc3885cca0db0d8cb32',
  [matrixJsonFileName]: '0e1e484197fbaa55f806f385bc1f6a32d1783e8920bb64d1f88a3fe4f8dc4288',
  [matrixMarkdownFileName]: '933eeb555efda9c3f1da75481509e757300639ea810594f33df9fe96c18995d3',
}
const previousMatrixSpecs = [
  ['java-language-capability-matrix.json', 'b42122285a7e4680c9d5148b44effaa5838a8d2bfa62e1cb2c4f0175d727c076', 'java-language', 40],
  ['java-standard-library-capability-matrix.json', '3ee20550ba22602c462dcfdc619bccaa5e844ab2b8224ec657b194bc0136853d', 'java-standard-library', 112],
  ['java-framework-capability-matrix.json', '033362651a4b1a25abf3b16d6bd01449a6888464a949f92f5bc9b96893d7612a', 'java-framework-library', 235],
  ['java-engineering-pattern-capability-matrix.json', '8cd1619084b8b0f9dadb9ea8a3915eb8dcaa8064e2e2ea90d5d700020373dc3b', 'java-engineering-pattern', 200],
]

/** 建立独立于生成目录的预期风险定义。 */
function expectedPattern(riskId, name, recommendedStage, prerequisites, sourceIds) {
  return { riskId, name, recommendedStage, prerequisites, sourceIds }
}

const expectedPatterns = [
  expectedPattern('JAVA-RISK-001', 'Web 入口职责过载', 'intermediate', ['JAVA-ENGINEERING-001', 'JAVA-FRAMEWORK-008'], ['RISK-0017','RISK-0033','RISK-0088','RISK-0097','RISK-0103','RISK-0136','RISK-0158','RISK-0183','RISK-0248','RISK-0260','RISK-0301']),
  expectedPattern('JAVA-RISK-002', '业务服务职责过载', 'intermediate', ['JAVA-ENGINEERING-001'], ['RISK-0003','RISK-0004','RISK-0007','RISK-0025','RISK-0034','RISK-0044','RISK-0068','RISK-0080','RISK-0085','RISK-0099','RISK-0100','RISK-0112','RISK-0126','RISK-0145','RISK-0174','RISK-0176','RISK-0182','RISK-0184','RISK-0185','RISK-0195','RISK-0197','RISK-0198','RISK-0201','RISK-0203','RISK-0205','RISK-0225','RISK-0226','RISK-0239','RISK-0243','RISK-0252','RISK-0255','RISK-0276','RISK-0282','RISK-0305','RISK-0307','RISK-0313']),
  expectedPattern('JAVA-RISK-003', '数据访问合同职责过载', 'advanced', ['JAVA-ENGINEERING-003', 'JAVA-FRAMEWORK-014'], ['RISK-0057','RISK-0151','RISK-0192','RISK-0292']),
  expectedPattern('JAVA-RISK-004', '层次边界与模型职责混合', 'intermediate', ['JAVA-ENGINEERING-001', 'JAVA-ENGINEERING-002'], ['RISK-0024','RISK-0026','RISK-0052','RISK-0070','RISK-0094','RISK-0122','RISK-0199','RISK-0219','RISK-0235','RISK-0295','RISK-0315','RISK-0316']),
  expectedPattern('JAVA-RISK-005', '隐式依赖与容器生命周期绕过', 'intermediate', ['JAVA-FRAMEWORK-002', 'JAVA-ENGINEERING-010'], ['RISK-0016','RISK-0039','RISK-0058','RISK-0075','RISK-0106','RISK-0114','RISK-0121','RISK-0148','RISK-0152','RISK-0172','RISK-0246','RISK-0266','RISK-0274']),
  expectedPattern('JAVA-RISK-006', '未生效、冗余或伪关闭配置', 'intermediate', ['JAVA-FRAMEWORK-001'], ['RISK-0083','RISK-0089','RISK-0098','RISK-0143','RISK-0187','RISK-0250','RISK-0254','RISK-0268','RISK-0294']),
  expectedPattern('JAVA-RISK-007', '空值、缺失与失败语义混淆', 'basic', ['JAVA-LANG-009', 'JAVA-STDLIB-009'], ['RISK-0027','RISK-0066','RISK-0067','RISK-0163','RISK-0177','RISK-0270','RISK-0289','RISK-0290']),
  expectedPattern('JAVA-RISK-008', '原始类型与非类型化合同', 'basic', ['JAVA-LANG-006'], ['RISK-0147','RISK-0164','RISK-0204','RISK-0214','RISK-0227','RISK-0285']),
  expectedPattern('JAVA-RISK-009', 'Bean Validation 约束未被触发', 'intermediate', ['JAVA-FRAMEWORK-009'], ['RISK-0018','RISK-0037']),
  expectedPattern('JAVA-RISK-010', '自定义校验器与非标准约束语义', 'intermediate', ['JAVA-LANG-007', 'JAVA-FRAMEWORK-009'], ['RISK-0005','RISK-0054','RISK-0154','RISK-0161','RISK-0273','RISK-0318']),
  expectedPattern('JAVA-RISK-011', '异常吞没、宽泛捕获与不透明传播', 'intermediate', ['JAVA-LANG-009', 'JAVA-STDLIB-033'], ['RISK-0011','RISK-0110','RISK-0117','RISK-0140','RISK-0144','RISK-0171','RISK-0211','RISK-0213','RISK-0221','RISK-0230','RISK-0233','RISK-0253','RISK-0304']),
  expectedPattern('JAVA-RISK-012', 'HTTP 错误状态、错误码与详情泄露', 'intermediate', ['JAVA-ENGINEERING-006', 'JAVA-FRAMEWORK-008'], ['RISK-0078','RISK-0149','RISK-0206','RISK-0234']),
  expectedPattern('JAVA-RISK-013', '切面扩大行为范围或改写控制流', 'advanced', ['JAVA-FRAMEWORK-004', 'JAVA-ENGINEERING-006'], ['RISK-0048','RISK-0061','RISK-0169']),
  expectedPattern('JAVA-RISK-014', '敏感数据进入日志与字符串化输出', 'intermediate', ['JAVA-FRAMEWORK-026', 'JAVA-ENGINEERING-026'], ['RISK-0010','RISK-0023','RISK-0038','RISK-0045','RISK-0063','RISK-0084','RISK-0128','RISK-0159','RISK-0167','RISK-0186','RISK-0224','RISK-0229','RISK-0249','RISK-0271','RISK-0277','RISK-0291','RISK-0297','RISK-0300']),
  expectedPattern('JAVA-RISK-015', '凭据模型、回显与生命周期过宽', 'advanced', ['JAVA-ENGINEERING-002', 'JAVA-ENGINEERING-026'], ['RISK-0065','RISK-0220','RISK-0231','RISK-0263','RISK-0275','RISK-0310']),
  expectedPattern('JAVA-RISK-016', '源码硬编码秘密与不可轮换凭据', 'intermediate', ['JAVA-ENGINEERING-021', 'JAVA-ENGINEERING-026'], ['RISK-0043','RISK-0119','RISK-0190','RISK-0223']),
  expectedPattern('JAVA-RISK-017', '匿名面、认证排除与认证绕过', 'advanced', ['JAVA-ENGINEERING-025'], ['RISK-0020','RISK-0028','RISK-0029','RISK-0090','RISK-0101']),
  expectedPattern('JAVA-RISK-018', '不可信身份输入与缺失资源授权', 'advanced', ['JAVA-ENGINEERING-025', 'JAVA-FRAMEWORK-011'], ['RISK-0008','RISK-0055','RISK-0060','RISK-0086','RISK-0142','RISK-0189','RISK-0210','RISK-0216','RISK-0217','RISK-0240','RISK-0242']),
  expectedPattern('JAVA-RISK-019', '令牌、签名与许可证校验未闭环或 fail-open', 'advanced', ['JAVA-ENGINEERING-026', 'JAVA-ENGINEERING-037'], ['RISK-0009','RISK-0014','RISK-0030','RISK-0053','RISK-0153','RISK-0207','RISK-0232','RISK-0251']),
  expectedPattern('JAVA-RISK-020', '弱密码学、不安全 TLS 与非安全随机数', 'advanced', ['JAVA-STDLIB-027', 'JAVA-STDLIB-028', 'JAVA-STDLIB-032'], ['RISK-0077','RISK-0129','RISK-0134','RISK-0317']),
  expectedPattern('JAVA-RISK-021', '不可信反序列化与旧序列化合同', 'advanced', ['JAVA-STDLIB-021', 'JAVA-FRAMEWORK-018', 'JAVA-FRAMEWORK-019'], ['RISK-0042','RISK-0095','RISK-0111','RISK-0139']),
  expectedPattern('JAVA-RISK-022', 'HTTP 方法、请求体与 Servlet 流合同不完整', 'intermediate', ['JAVA-FRAMEWORK-008', 'JAVA-FRAMEWORK-010'], ['RISK-0105','RISK-0113','RISK-0120','RISK-0124','RISK-0178']),
  expectedPattern('JAVA-RISK-023', '过滤链、黑名单与输入变异式安全控制', 'advanced', ['JAVA-FRAMEWORK-010', 'JAVA-ENGINEERING-027'], ['RISK-0135','RISK-0247','RISK-0261']),
  expectedPattern('JAVA-RISK-024', 'CORS、动态视图与 API 文档暴露边界', 'advanced', ['JAVA-FRAMEWORK-008', 'JAVA-FRAMEWORK-013'], ['RISK-0076','RISK-0109','RISK-0168','RISK-0238','RISK-0259','RISK-0299','RISK-0309']),
  expectedPattern('JAVA-RISK-025', '文件路径、上传与归档展开边界', 'advanced', ['JAVA-STDLIB-015', 'JAVA-STDLIB-017', 'JAVA-ENGINEERING-029'], ['RISK-0013','RISK-0073','RISK-0087','RISK-0194','RISK-0196','RISK-0209']),
  expectedPattern('JAVA-RISK-026', '无界整载荷缓冲与慢消费者背压', 'advanced', ['JAVA-STDLIB-013', 'JAVA-ENGINEERING-024'], ['RISK-0019','RISK-0049','RISK-0127','RISK-0278']),
  expectedPattern('JAVA-RISK-027', '可关闭资源所有权与异常路径清理', 'intermediate', ['JAVA-LANG-014', 'JAVA-STDLIB-014'], ['RISK-0082','RISK-0132','RISK-0244']),
  expectedPattern('JAVA-RISK-028', '网络客户端生命周期、超时与连接状态', 'advanced', ['JAVA-ENGINEERING-018', 'JAVA-ENGINEERING-023'], ['RISK-0116','RISK-0130','RISK-0157','RISK-0170','RISK-0173','RISK-0264','RISK-0319']),
  expectedPattern('JAVA-RISK-029', '启动关键路径、进程控制与 JVM 全局副作用', 'advanced', ['JAVA-FRAMEWORK-001', 'JAVA-STDLIB-018'], ['RISK-0006','RISK-0059','RISK-0079','RISK-0150','RISK-0162','RISK-0267']),
  expectedPattern('JAVA-RISK-030', '裸线程、临时执行器与拒绝策略失控', 'advanced', ['JAVA-STDLIB-023', 'JAVA-ENGINEERING-016'], ['RISK-0002','RISK-0036','RISK-0040','RISK-0071','RISK-0091','RISK-0133','RISK-0269','RISK-0281']),
  expectedPattern('JAVA-RISK-031', '异步事务、上下文与失败观测断裂', 'advanced', ['JAVA-FRAMEWORK-005', 'JAVA-FRAMEWORK-007'], ['RISK-0118','RISK-0215','RISK-0314']),
  expectedPattern('JAVA-RISK-032', '请求与 ThreadLocal 上下文清理和传播责任', 'advanced', ['JAVA-STDLIB-026', 'JAVA-ENGINEERING-017'], ['RISK-0096','RISK-0125','RISK-0193','RISK-0237','RISK-0293']),
  expectedPattern('JAVA-RISK-033', '进程级可变共享状态与测试复位', 'advanced', ['JAVA-ENGINEERING-014', 'JAVA-ENGINEERING-015'], ['RISK-0021','RISK-0047','RISK-0108','RISK-0156','RISK-0165','RISK-0188','RISK-0241','RISK-0280']),
  expectedPattern('JAVA-RISK-034', '非原子复合操作与非线程安全容器值', 'advanced', ['JAVA-STDLIB-024', 'JAVA-ENGINEERING-015'], ['RISK-0012','RISK-0022','RISK-0069','RISK-0107','RISK-0131','RISK-0155','RISK-0257','RISK-0287','RISK-0308']),
  expectedPattern('JAVA-RISK-035', '字符串池锁与仅进程内同步边界', 'advanced', ['JAVA-LANG-013', 'JAVA-STDLIB-002'], ['RISK-0015','RISK-0093','RISK-0138','RISK-0296']),
  expectedPattern('JAVA-RISK-036', '实时会话回收、幂等与慢客户端隔离', 'advanced', ['JAVA-FRAMEWORK-011', 'JAVA-ENGINEERING-028'], ['RISK-0001','RISK-0035','RISK-0141','RISK-0218','RISK-0222','RISK-0279']),
  expectedPattern('JAVA-RISK-037', '数据库事务包裹不可回滚外部副作用', 'advanced', ['JAVA-FRAMEWORK-007', 'JAVA-ENGINEERING-019'], ['RISK-0041']),
  expectedPattern('JAVA-RISK-038', '反射绕过类型合同与分片参数脆弱性', 'advanced', ['JAVA-STDLIB-020', 'JAVA-ENGINEERING-003'], ['RISK-0064','RISK-0102','RISK-0286']),
  expectedPattern('JAVA-RISK-039', 'SQL 文本改写、动态标识符与厂商耦合', 'advanced', ['JAVA-FRAMEWORK-014', 'JAVA-ENGINEERING-003'], ['RISK-0051','RISK-0081','RISK-0265']),
  expectedPattern('JAVA-RISK-040', 'Mapper XML 与 Java 合同和资源布局漂移', 'advanced', ['JAVA-FRAMEWORK-014'], ['RISK-0146','RISK-0306']),
  expectedPattern('JAVA-RISK-041', '旧 API、平台默认与历史命名兼容污染', 'intermediate', ['JAVA-ENGINEERING-034'], ['RISK-0046','RISK-0056','RISK-0072','RISK-0074','RISK-0115','RISK-0123','RISK-0137','RISK-0179','RISK-0200','RISK-0256','RISK-0258','RISK-0272']),
  expectedPattern('JAVA-RISK-042', '可变模型、Lombok 生成合同与继承构建', 'intermediate', ['JAVA-LANG-001', 'JAVA-FRAMEWORK-017'], ['RISK-0031','RISK-0175','RISK-0191','RISK-0245','RISK-0288','RISK-0312']),
  expectedPattern('JAVA-RISK-043', '事件发布线程、载荷可变性与监听副作用', 'advanced', ['JAVA-FRAMEWORK-003'], ['RISK-0092','RISK-0166','RISK-0212']),
  expectedPattern('JAVA-RISK-044', '无界缓存与限流器键空间回收', 'advanced', ['JAVA-ENGINEERING-020'], ['RISK-0181']),
  expectedPattern('JAVA-RISK-045', '配置、注释、setter 与结果状态背离', 'intermediate', ['JAVA-ENGINEERING-005', 'JAVA-ENGINEERING-021'], ['RISK-0062','RISK-0160','RISK-0208','RISK-0283','RISK-0302','RISK-0311']),
  expectedPattern('JAVA-RISK-046', '脆弱测试结构、粗粒度断言与共享 fixture', 'intermediate', ['JAVA-ENGINEERING-035'], ['RISK-0032','RISK-0050','RISK-0104','RISK-0202','RISK-0228','RISK-0236','RISK-0298','RISK-0303']),
  expectedPattern('JAVA-RISK-047', '阻塞等待与分散调度开关', 'advanced', ['JAVA-FRAMEWORK-005', 'JAVA-ENGINEERING-038'], ['RISK-0180','RISK-0262','RISK-0284']),
]

/** 在合同不成立时立即终止独立验证。 */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** 计算文本的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 解析非空 JSONL 文本。 */
function parseJsonLines(content, sourceName) {
  assert(content.trim().length > 0, `${sourceName} 为空`)
  return content.trim().split('\n').map(JSON.parse)
}

/** 读取冻结提取记录并独立验证分片身份。 */
function readExtractedRecords() {
  const manifest = readJson(path.join(auditDirectory, 'extracted', 'manifest.json'))
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, '提取身份错误')
  const records = []
  for (const shard of manifest.shards) {
    const content = fs.readFileSync(path.join(auditDirectory, 'extracted', shard.fileName), 'utf8')
    assert(sha256(content) === shard.sha256, `提取分片哈希错误：${shard.fileName}`)
    records.push(...parseJsonLines(content, shard.fileName))
  }
  assert(records.length === 3436, '提取记录分母错误')
  assert(new Set(records.map((record) => record.path)).size === 3436, '提取路径不唯一')
  return records
}

/** 为独立验证稳定选择最多五个代表文件。 */
function expectedRepresentativePaths(sources) {
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
  return selectedPaths
}

/** 验证 319 条最终输入清单与上一批 pending 分母逐项一致。 */
function validateSourceInventory(actualInventory) {
  const previousContent = fs.readFileSync(
    path.join(auditDirectory, 'engineering-pattern-capability-source-inventory.jsonl'),
    'utf8',
  )
  assert(sha256(previousContent) === previousInventorySha256, '上一批输入清单哈希错误')
  const previousPending = parseJsonLines(previousContent, '上一批输入清单')
    .filter((source) => source.normalizationStatus === 'pending')
    .sort((left, right) => left.sourceId.localeCompare(right.sourceId))
  assert(previousPending.length === 319 && actualInventory.length === 319, '风险分母错误')
  const expectedAssignments = new Map()
  for (const pattern of expectedPatterns) {
    for (const sourceId of pattern.sourceIds) {
      assert(!expectedAssignments.has(sourceId), `独立目录重复映射：${sourceId}`)
      expectedAssignments.set(sourceId, pattern.riskId)
    }
  }
  assert(expectedAssignments.size === 319, '独立目录没有覆盖 319 条风险')
  for (let index = 0; index < previousPending.length; index += 1) {
    const previous = previousPending[index]
    const actual = actualInventory[index]
    assert(actual.sourceId === previous.sourceId, `输入清单顺序错误：${index + 1}`)
    assert(actual.riskId === expectedAssignments.get(actual.sourceId), `风险归属错误：${actual.sourceId}`)
    assert(actual.normalizationStatus === 'normalized', `风险仍为 pending：${actual.sourceId}`)
    const expectedSource = {
      ...previous,
      normalizationStatus: 'normalized',
      riskId: expectedAssignments.get(actual.sourceId),
    }
    assert(JSON.stringify(actual) === JSON.stringify(expectedSource), `风险来源字段漂移：${actual.sourceId}`)
  }
  return new Map(actualInventory.map((source) => [source.sourceId, source]))
}

/** 验证矩阵中 47 个风险模式、全部来源、文件并集和代表符号。 */
function validateRiskPatterns(matrix, sourceById, extractedRecords) {
  assert(matrix.riskPatterns.length === 47, '规范风险数量错误')
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  for (let index = 0; index < expectedPatterns.length; index += 1) {
    const expected = expectedPatterns[index]
    const actual = matrix.riskPatterns[index]
    assert(actual.riskId === expected.riskId && actual.name === expected.name, `风险身份错误：${expected.riskId}`)
    assert(actual.kind === 'review-risk-pattern', `风险类型错误：${expected.riskId}`)
    assert(actual.evidencePolicy === 'project-risk-evidence-only', `风险证据政策错误：${expected.riskId}`)
    assert(actual.recommendedStage === expected.recommendedStage, `风险阶段错误：${expected.riskId}`)
    assert(JSON.stringify(actual.prerequisites) === JSON.stringify(expected.prerequisites), `风险前置能力错误：${expected.riskId}`)
    assert(JSON.stringify(actual.normalizedFrom.map((source) => source.sourceId)) === JSON.stringify(expected.sourceIds), `风险来源映射错误：${expected.riskId}`)
    const sources = expected.sourceIds.map((sourceId) => sourceById.get(sourceId))
    assert(sources.every(Boolean), `风险来源缺失：${expected.riskId}`)
    const observedFiles = [...new Set(sources.flatMap((source) => source.observedFiles))].sort()
    assert(JSON.stringify(actual.observedFiles) === JSON.stringify(observedFiles), `风险文件并集错误：${expected.riskId}`)
    assert(actual.observedFileCount === observedFiles.length, `风险文件计数错误：${expected.riskId}`)
    const representativePaths = expectedRepresentativePaths(sources)
    assert(JSON.stringify(actual.representativeSymbols.map((symbol) => symbol.path)) === JSON.stringify(representativePaths), `代表符号路径错误：${expected.riskId}`)
    for (const symbol of actual.representativeSymbols) {
      const extracted = extractedByPath.get(symbol.path)
      assert(extracted, `代表符号不在冻结提取中：${symbol.path}`)
      const declaredType = extracted.declaredTypes?.find((type) => type.owner === null)
      assert(symbol.symbol === (declaredType?.qualifiedName ?? path.basename(symbol.path, '.java')), `代表符号名称错误：${symbol.path}`)
    }
    assert(actual.modernBaseline.java === '25 LTS', `现代基线错误：${expected.riskId}`)
    assert(actual.legacyBaseline.java === '8' && actual.legacyBaseline.springBoot === '2.3.12.RELEASE', `旧版基线错误：${expected.riskId}`)
    assert(actual.researchStatus === 'not-started' && actual.exampleStatus === 'not-started' && actual.courseStatus === 'candidate', `风险课程状态错误：${expected.riskId}`)
  }
}

/** 独立验证五批 906 个 sourceId 的全局零重叠全覆盖。 */
function validateGlobalCoverage(matrix) {
  const canonicalContent = fs.readFileSync(
    path.join(auditDirectory, 'capability-normalization-source-inventory.jsonl'),
    'utf8',
  )
  assert(sha256(canonicalContent) === canonicalInventorySha256, '初始清单哈希错误')
  const canonicalIds = parseJsonLines(canonicalContent, '初始清单')
    .map((source) => source.sourceId)
    .sort()
  assert(canonicalIds.length === 906 && new Set(canonicalIds).size === 906, '初始清单身份错误')
  const normalizedIds = []
  const batchCounts = []
  for (const [fileName, expectedHash, matrixKind, expectedCount] of previousMatrixSpecs) {
    const content = fs.readFileSync(path.join(auditDirectory, fileName), 'utf8')
    assert(sha256(content) === expectedHash, `前序矩阵哈希错误：${fileName}`)
    const previousMatrix = JSON.parse(content)
    assert(previousMatrix.matrixKind === matrixKind, `前序矩阵类型错误：${fileName}`)
    const ids = previousMatrix.capabilities.flatMap((item) => item.normalizedFrom.map((source) => source.sourceId))
    assert(ids.length === expectedCount, `前序矩阵计数错误：${fileName}`)
    normalizedIds.push(...ids)
    batchCounts.push(ids.length)
  }
  const riskIds = matrix.riskPatterns.flatMap((item) => item.normalizedFrom.map((source) => source.sourceId))
  normalizedIds.push(...riskIds)
  batchCounts.push(riskIds.length)
  assert(JSON.stringify(batchCounts) === JSON.stringify([40, 112, 235, 200, 319]), '五批计数错误')
  assert(normalizedIds.length === 906 && new Set(normalizedIds).size === 906, '全局映射重复或计数错误')
  assert(JSON.stringify([...normalizedIds].sort()) === JSON.stringify(canonicalIds), '全局映射遗漏或越界')
  const expectedGlobal = {
    canonicalSourceItemCount: 906,
    normalizedSourceItemCount: 906,
    pendingSourceItemCount: 0,
    batchNormalizedSourceItemCounts: [40, 112, 235, 200, 319],
    normalizedCatalogItemCount: 167,
    duplicateSourceAssignmentCount: 0,
    missingSourceItemCount: 0,
    extraSourceItemCount: 0,
  }
  assert(JSON.stringify(matrix.globalNormalization) === JSON.stringify(expectedGlobal), '全局摘要错误')
  return expectedGlobal
}

/** 验证人工签核绑定当前三份正式产物。 */
function validateSignoff(signoff, artifactContents, matrixSummary) {
  assert(signoff.schemaVersion === 1, '签核 schemaVersion 错误')
  assert(signoff.snapshotId === snapshotId && signoff.analysisId === analysisId, '签核身份错误')
  assert(signoff.batchId === batchId && signoff.status === 'approved', '签核批次状态错误')
  assert(signoff.reviewedAt === reviewedAt, '签核时间错误')
  assert(signoff.reviewedBy === 'Codex' && signoff.reviewerType === 'agent-assisted-manual-review', '签核审查者错误')
  assert(JSON.stringify(signoff.summary) === JSON.stringify(matrixSummary), '签核摘要错误')
  assert(signoff.artifacts.length === 3, '签核产物数错误')
  for (const artifact of signoff.artifacts) {
    assert(artifact.sha256 === sha256(artifactContents[artifact.path]), `签核产物哈希错误：${artifact.path}`)
  }
  assert(JSON.stringify(signoff.artifacts.map((artifact) => artifact.path).sort()) === JSON.stringify(Object.keys(expectedArtifactHashes).sort()), '签核产物路径错误')
}

/** 验证 manifest 的完成状态、统计、哈希和 Phase 2 边界。 */
function validateManifest(manifest, signoff, globalNormalization) {
  assert(manifest.schemaVersion === 1, 'manifest schemaVersion 错误')
  assert(manifest.snapshotId === snapshotId && manifest.analysisId === analysisId, 'manifest 身份错误')
  assert(manifest.batchId === batchId && manifest.status === 'completed', 'manifest 批次状态错误')
  assert(manifest.reviewedAt === reviewedAt && manifest.gateStatus === 'passed', 'Gate 1 状态错误')
  assert(manifest.previousBatch.previousBatchId === 'phase-1d-engineering-pattern', '上一批身份错误')
  assert(manifest.previousBatch.previousManifestSha256 === previousManifestSha256, '上一批 manifest 引用错误')
  assert(manifest.previousBatch.previousSourceInventorySha256 === previousInventorySha256, '上一批输入引用错误')
  assert(manifest.previousBatch.previousPendingSourceItemCount === 319, '上一批分母错误')
  assert(manifest.sourceInventory.path === sourceInventoryFileName, '输入清单路径错误')
  assert(manifest.sourceInventory.sha256 === expectedArtifactHashes[sourceInventoryFileName], '输入清单哈希错误')
  assert(manifest.sourceInventory.itemCount === 319 && manifest.sourceInventory.observedFileAssignments === 3152, '输入清单统计错误')
  assert(manifest.matrix.jsonSha256 === expectedArtifactHashes[matrixJsonFileName], '矩阵 JSON 哈希错误')
  assert(manifest.matrix.markdownSha256 === expectedArtifactHashes[matrixMarkdownFileName], '矩阵 Markdown 哈希错误')
  assert(JSON.stringify(manifest.globalNormalization) === JSON.stringify(globalNormalization), 'manifest 全局摘要错误')
  assert(manifest.manualReviewSignoff.path === 'reviews/phase-1d-review-risk-signoff.json', '签核路径错误')
  assert(manifest.manualReviewSignoff.sha256 === sha256(`${JSON.stringify(signoff, null, 2)}\n`), '签核哈希错误')
  assert(JSON.stringify(manifest.coverageBoundary) === JSON.stringify({ normalizedKinds: ['review-risk-pattern'], pendingKinds: [], nextPhase: 'phase-2-knowledge-path', courseAuthoringStarted: false }), 'Phase 1D 关闭边界错误')
}

/** 执行不依赖生成 catalog 的完整独立验证。 */
function main() {
  assert(process.argv.length === 2, 'validator 不接受命令行参数')
  const previousManifestContent = fs.readFileSync(
    path.join(auditDirectory, 'phase-1d-engineering-pattern-manifest.json'),
    'utf8',
  )
  assert(sha256(previousManifestContent) === previousManifestSha256, '上一批 manifest 哈希错误')
  const previousManifest = JSON.parse(previousManifestContent)
  assert(previousManifest.status === 'completed' && previousManifest.gateStatus === 'not-passed', '上一批状态错误')

  const artifactContents = Object.fromEntries(
    Object.keys(expectedArtifactHashes).map((fileName) => [
      fileName,
      fs.readFileSync(path.join(outputDirectory, fileName), 'utf8'),
    ]),
  )
  for (const [fileName, expectedHash] of Object.entries(expectedArtifactHashes)) {
    assert(sha256(artifactContents[fileName]) === expectedHash, `正式产物哈希错误：${fileName}`)
  }
  const sourceInventory = parseJsonLines(artifactContents[sourceInventoryFileName], sourceInventoryFileName)
  const matrix = JSON.parse(artifactContents[matrixJsonFileName])
  assert(matrix.schemaVersion === 1 && matrix.snapshotId === snapshotId && matrix.analysisId === analysisId, '矩阵身份错误')
  assert(matrix.batchId === batchId && matrix.reviewedAt === reviewedAt && matrix.matrixKind === 'java-review-risk', '矩阵批次错误')
  const expectedSummary = {
    rawSourceItemCount: 319,
    normalizedSourceItemCount: 319,
    pendingSourceItemCount: 0,
    pendingBySourceKind: { 'review-capability': 0, 'language-feature': 0, 'framework-usage': 0, 'review-risk': 0 },
    riskPatternCount: 47,
    normalizedObservedFileCount: 1568,
    representativeSymbolCount: 225,
  }
  assert(JSON.stringify(matrix.summary) === JSON.stringify(expectedSummary), '矩阵摘要错误')
  const sourceById = validateSourceInventory(sourceInventory)
  validateRiskPatterns(matrix, sourceById, readExtractedRecords())
  const globalNormalization = validateGlobalCoverage(matrix)
  const markdown = artifactContents[matrixMarkdownFileName]
  assert(markdown.includes('项目旧写法不因进入矩阵而被认可'), 'Markdown 缺少非推荐边界')
  assert(markdown.includes('Gate 1 通过只允许进入 Phase 2'), 'Markdown 缺少 Gate 1 边界')
  for (const pattern of expectedPatterns) {
    assert(markdown.includes(`### ${pattern.riskId} ${pattern.name}`), `Markdown 缺少风险：${pattern.riskId}`)
  }
  const signoff = readJson(signoffPath)
  validateSignoff(signoff, artifactContents, expectedSummary)
  const manifest = readJson(path.join(outputDirectory, manifestFileName))
  validateManifest(manifest, signoff, globalNormalization)
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId,
      sourceItemCount: 319,
      riskPatternCount: 47,
      globalNormalizedSourceItemCount: 906,
      gateStatus: 'passed',
      nextPhase: 'phase-2-knowledge-path',
    }),
  )
}

main()
