import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const reviewDirectory = process.env.DZZZ_TEST_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_TEST_REVIEW_DIRECTORY)
  : path.join(auditDirectory, 'reviews', 'phase-1c-test')
const signoffPath = process.env.DZZZ_TEST_SIGNOFF_PATH
  ? path.resolve(process.env.DZZZ_TEST_SIGNOFF_PATH)
  : path.join(auditDirectory, 'reviews', 'phase-1c-test-signoff.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const extractedShardPath = path.join(auditDirectory, 'extracted', 'dzzz-app-files-3001-3436.jsonl')
const manifestPath = path.join(reviewDirectory, 'manifest.json')
const shardFileName = 'records-0001-0007.jsonl'
const shardPath = path.join(reviewDirectory, shardFileName)
const expectedReviewedAt = '2026-08-04T08:25:57.000Z'

const earlierLedgers = [
  ['single', 'phase-1c-startup-config.json'],
  ['sharded', 'phase-1c-web-entry'],
  ['sharded', 'phase-1c-business-layer'],
  ['sharded', 'phase-1c-data-access'],
  ['sharded', 'phase-1c-data-model'],
  ['sharded', 'phase-1c-cross-cutting'],
  ['sharded', 'phase-1c-async-integration'],
  ['sharded', 'phase-1c-infrastructure'],
  ['sharded', 'phase-1c-common-code'],
]

const expectedMetadata = {
  TsFileSignNewDragServiceImplTest: {
    shape: 'service-state-persistence-collaboration-regression',
    roleDetail: '签名预览、排版和持久化协作回归',
    responsibility: '用 Mockito、内存状态和临时 PDF 固定签名预览、自动排版与拖拽保存合同。',
    lifecycle: '每个测试使用新服务实例；TemporaryFolder 管理文件，@After 清理共享缓存。',
    fixtureMode: 'mocked-service-with-synthetic-pdf',
    capabilities: ['JUnit 4', 'Mockito', '服务协作测试', '临时文件', 'PDF fixture', '状态流转'],
    targets: [
      ['TsFileSignNewDragServiceImpl', 'getSignContentByPageNum', 'public', 'getSignContentByPageNum('],
      ['TsFileSignNewDragServiceImpl', 'saveSignDragResultByPageNum', 'public', 'saveSignDragResultByPageNum('],
      ['TsFileSignNewDragServiceImpl', 'fillPositionInfoIfNeed', 'private', '"fillPositionInfoIfNeed"'],
      ['TsFileSignNewDragServiceImpl', 'getSignPicByPageNum', 'private', '"getSignPicByPageNum"'],
      ['TsFileSignNewDragServiceImpl', 'buildPositionCandidateList', 'private', '"buildPositionCandidateList"'],
      ['ConvertPdf', 'calculateLastPageKeywordSignPosition', 'public', 'calculateLastPageKeywordSignPosition('],
    ],
  },
  TsAiTranscriptDiffServiceTest: {
    shape: 'text-diff-contract-test',
    roleDetail: '笔录文本差分合同测试',
    responsibility: '以纯内存字符串固定新增、删减和 HTML 段落关联输入的差分合同。',
    lifecycle: '测试类持有一个无外部资源的服务实例；每个用例只构造不可持久化的字符串输入。',
    fixtureMode: 'in-memory-text-contract',
    capabilities: ['JUnit 4', '纯函数式测试', '字符串差分', 'HTML 段落解析'],
    targets: [['TsAiTranscriptDiffService', 'buildInput', 'public', 'service.buildInput(']],
  },
  TsLegalReasoningResultParserTest: {
    shape: 'structured-result-parser-contract-test',
    roleDetail: '模型结构化结果解析合同测试',
    responsibility: '固定 JSON、Markdown 围栏、缺字段和非法内容到最终展示文本的解析结果。',
    lifecycle: '全部输入输出位于内存，不创建共享状态或外部资源。',
    fixtureMode: 'in-memory-parser-contract',
    capabilities: ['JUnit 4', 'JSON 解析', '失败回退', '字符串断言'],
    targets: [['TsLegalReasoningResultParser', 'parseFinalContent', 'public', 'parseFinalContent(']],
  },
  TscwhModelConfigTest: {
    shape: 'configuration-mapping-contract-test',
    roleDetail: '模型配置映射合同测试',
    responsibility: '固定两种对接配置的选择、三段格式校验和列表展示映射。',
    lifecycle: '每个用例新建记录和值对象；不启动 Spring 容器或外部模型客户端。',
    fixtureMode: 'in-memory-configuration-contract',
    capabilities: ['JUnit 4', '配置映射', '异常合同', '反射'],
    targets: [
      ['TscwhModelConfig', 'fromRecord', 'public', 'TscwhModelConfig.fromRecord('],
      ['TscwhServiceImpl', 'buildListVO', 'private', 'getDeclaredMethod("buildListVO"'],
    ],
  },
  TscwhRuntimePromptServiceTest: {
    shape: 'runtime-prompt-contract-test',
    roleDetail: '运行态提示词变量替换合同测试',
    responsibility: '固定多变量提示词模板中差分类型和问题文本的替换结果。',
    lifecycle: '单用例、纯内存输入输出，不调用持久化或外部模型。',
    fixtureMode: 'in-memory-prompt-contract',
    capabilities: ['JUnit 4', '模板变量', '字符串断言'],
    targets: [['TscwhRuntimePromptService', 'buildTestPrompt', 'public', 'service.buildTestPrompt(']],
  },
  KeywordSignatureMergeTest: {
    shape: 'pdf-image-composition-regression-test',
    roleDetail: 'PDF 与签名图片合成回归',
    responsibility: '使用自造 PDF 和图片固定关键词定位、自动排版、拖拽避让与最终合成合同。',
    lifecycle: 'TemporaryFolder 默认管理产物；可选系统属性允许把产物保留到指定目录进行人工检查。',
    fixtureMode: 'synthetic-pdf-image-regression',
    capabilities: ['JUnit 4', '临时文件', 'PDF fixture', '图片 fixture', '反射', '产物回归'],
    targets: [
      ['ConvertPdf', 'insertPicToPdfByLastPageKeyword', 'public', 'insertPicToPdfByLastPageKeyword('],
      ['ConvertPdf', 'getSignInfoByPageNum', 'public', 'getSignInfoByPageNum('],
      ['ConvertPdf', 'calculateLastPageKeywordSignPosition', 'public', 'calculateLastPageKeywordSignPosition('],
      ['ConvertPdf', 'resolveSignTopFix', 'private', '"resolveSignTopFix"'],
      ['ConvertPdf', 'scaleSignImage', 'private', '"scaleSignImage"'],
      ['TsblSjyServiceImpl', 'filterKeywordSignList', 'private', '"filterKeywordSignList"'],
      ['ConvertPdf', 'calculateKeywordSignY', 'private', '"calculateKeywordSignY"'],
    ],
  },
  PdfKeywordPositionUtilTest: {
    shape: 'pdf-keyword-position-regression-test',
    roleDetail: 'PDF 尾页关键词坐标回归',
    responsibility: '用临时 PDF 固定尾页、冒号和重复关键词的坐标选择规则。',
    lifecycle: 'TemporaryFolder 管理输入 PDF，测试结束后由 JUnit 规则清理。',
    fixtureMode: 'synthetic-pdf-position-regression',
    capabilities: ['JUnit 4', '临时文件', 'PDFBox', '坐标断言'],
    targets: [['PdfKeywordPositionUtil', 'findLastPageKeywordPosition', 'public', 'findLastPageKeywordPosition(']],
  },
}

const expectedRiskSummaries = {
  'legacy-junit4': '当前反馈环使用 JUnit 4；现代课程优先使用 JUnit Jupiter。',
  'private-reflection-coupling': '测试通过反射访问字段或私有方法，重构时会耦合实现细节。',
  'manual-mock-injection': '测试手工创建并反射注入 mock，依赖注入边界不够显式。',
  'oversized-test-fixture': '大型测试类聚合多种反馈环和 fixture，定位失败与维护成本较高。',
  'manual-resource-lifecycle': '文件或 PDF 资源依靠显式 close，异常路径的所有权需要单独核对。',
  'mutable-global-test-state': '测试读写进程级共享缓存，必须保证每个反馈环可靠复位。',
  'broad-expected-exception': '@Test(expected) 无法限定具体抛出位置，可能接受非目标语句的异常。',
  'optional-external-output-directory': '系统属性可把测试产物写到临时目录之外，运行者需要显式管理清理边界。',
  'coarse-artifact-assertion': '端到端 PDF 用例验证身份、存在性和页数，未直接断言最终图片像素或矩形。',
}

/** 在断言失败时中止校验。 */
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

/** 深比较结构化值。 */
function assertDeepEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}：${JSON.stringify(actual)}`)
}

/** 从源码中返回符合规则的行号。 */
function matchingLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => (pattern.test(line) ? [index + 1] : []))
}

/** 独立统计源码断言调用。 */
function assertionCount(source) {
  return [...source.matchAll(/\bassert(?:Equals|False|NotNull|Null|True)\s*\(/g)].length
}

/** 独立推导测试反馈环信号。 */
function deriveSignals(source, loc) {
  const lines = source.split('\n')
  return {
    testAnnotationLines: matchingLines(lines, /^\s*@Test(?:\s*\(|\s*$)/),
    lifecycleAnnotationLines: matchingLines(lines, /^\s*@(After|Before|Rule)\b/),
    assertionCount: assertionCount(source),
    temporaryFolderLines: matchingLines(lines, /\bTemporaryFolder\b/),
    mockCreationLines: matchingLines(lines, /\bmock\s*\(/),
    reflectionAccessLines: matchingLines(
      lines,
      /ReflectionTestUtils\.(?:invokeMethod|setField)|getDeclaredMethod\s*\(|setAccessible\s*\(|\.invoke\s*\(/,
    ),
    fileResourceLines: matchingLines(lines, /new\s+FileOutputStream\s*\(|new\s+PdfReader\s*\(|\.close\s*\(\)/),
    mutableGlobalStateLines: matchingLines(lines, /JzglConstant\.getWebYqmTsFileMap\s*\(\)/),
    expectedExceptionLines: matchingLines(lines, /@Test\s*\(\s*expected\s*=/),
    systemPropertyLines: matchingLines(lines, /System\.getProperty\s*\(/),
    oversizedFixture: loc >= 500,
  }
}

/** 添加独立推导的风险候选。 */
function pushRisk(risks, category, lines) {
  const uniqueLines = [...new Set(lines)].sort((left, right) => left - right)
  if (uniqueLines.length > 0) risks.push({ category, lines: uniqueLines })
}

/** 独立推导单文件风险类别和证据行。 */
function deriveRisks(typeName, sourceLines, signals) {
  const risks = []
  pushRisk(risks, 'legacy-junit4', matchingLines(sourceLines, /import\s+org\.junit\.Test;/))
  pushRisk(risks, 'private-reflection-coupling', signals.reflectionAccessLines)
  pushRisk(risks, 'manual-mock-injection', [
    ...signals.mockCreationLines,
    ...matchingLines(sourceLines, /ReflectionTestUtils\.setField/),
  ])
  pushRisk(
    risks,
    'oversized-test-fixture',
    signals.oversizedFixture ? matchingLines(sourceLines, /public\s+class\s+/) : [],
  )
  pushRisk(
    risks,
    'manual-resource-lifecycle',
    matchingLines(sourceLines, /new\s+FileOutputStream\s*\(|new\s+PdfReader\s*\(|\.close\s*\(\)/),
  )
  pushRisk(risks, 'mutable-global-test-state', signals.mutableGlobalStateLines)
  pushRisk(risks, 'broad-expected-exception', signals.expectedExceptionLines)
  pushRisk(risks, 'optional-external-output-directory', signals.systemPropertyLines)
  pushRisk(
    risks,
    'coarse-artifact-assertion',
    typeName === 'KeywordSignatureMergeTest'
      ? matchingLines(sourceLines, /targetPdf\.exists\s*\(|getNumberOfPages\s*\(\)|mergedQmidList\.size\s*\(\)/)
      : [],
  )
  return risks
}

/** 读取前九批路径并确认没有重复覆盖。 */
function readEarlierPaths() {
  const paths = []
  for (const [kind, relativePath] of earlierLedgers) {
    if (kind === 'single') {
      const ledger = readJson(path.join(auditDirectory, 'reviews', relativePath))
      paths.push(...ledger.records.map((record) => record.path))
      continue
    }
    const directory = path.join(auditDirectory, 'reviews', relativePath)
    const manifest = readJson(path.join(directory, 'manifest.json'))
    for (const shard of manifest.shards) {
      const records = fs.readFileSync(path.join(directory, shard.fileName), 'utf8').trim().split('\n')
      paths.push(...records.map((line) => JSON.parse(line).path))
    }
  }
  assert(paths.length === 3429, `前九批路径数应为 3429，实际为 ${paths.length}`)
  assert(new Set(paths).size === 3429, '前九批存在重复路径')
  return new Set(paths)
}

/** 按字段统计记录数量。 */
function countBy(records, field) {
  return Object.fromEntries(
    [...records.reduce((counts, record) => {
      counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
      return counts
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 汇总风险类别。 */
function countRisks(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 验证单条测试复核记录。 */
function validateRecord(record, inventoryFile, extractedRecord, expectedRiskIndex) {
  assert(record.inventoryIndex === inventoryFile.index, `库存索引不一致：${record.path}`)
  assert(record.path === inventoryFile.path, `库存路径不一致：${record.path}`)
  assert(record.auditStatus === 'reviewed', `完成态不是 reviewed：${record.path}`)
  assert(record.machineRoleCandidate === 'test' && record.finalRole === 'test', `测试角色错误：${record.path}`)
  const source = fs.readFileSync(path.join(sourceRepository, record.path), 'utf8')
  const sourceLines = source.split('\n')
  assert(sha256(source) === inventoryFile.sha256, `源码 SHA-256 漂移：${record.path}`)
  assert(record.sourceSha256 === inventoryFile.sha256 && record.loc === inventoryFile.loc, `源码身份错误：${record.path}`)
  const typeName = extractedRecord.declaredTypes[0]?.name
  const metadata = expectedMetadata[typeName]
  assert(metadata, `独立职责目录缺少 ${typeName}`)
  assert(record.testShape === metadata.shape, `测试形态错误：${record.path}`)
  assert(record.roleDetail === metadata.roleDetail, `角色说明错误：${record.path}`)
  assert(record.responsibility === metadata.responsibility, `职责说明错误：${record.path}`)
  assert(record.lifecycle === metadata.lifecycle, `生命周期说明错误：${record.path}`)
  assert(record.fixtureMode === metadata.fixtureMode, `fixture 模式错误：${record.path}`)
  assertDeepEqual(record.capabilityCandidates, metadata.capabilities, `能力候选错误：${record.path}`)

  const signals = deriveSignals(source, inventoryFile.loc)
  assertDeepEqual(record.testSignals, signals, `测试信号错误：${record.path}`)
  const expectedTestNames = extractedRecord.annotations
    .filter((annotation) => annotation.name === 'Test')
    .map((annotation) => annotation.target.split('#')[1].split('(')[0])
  assert(record.structure.declaredTypeCount === extractedRecord.declaredTypes.length, `类型数错误：${record.path}`)
  assert(record.structure.fieldCount === extractedRecord.fields.length, `字段数错误：${record.path}`)
  assert(record.structure.publicMethodCount === extractedRecord.publicMethods.length, `公开方法数错误：${record.path}`)
  assert(record.structure.testMethodCount === signals.testAnnotationLines.length, `测试方法数错误：${record.path}`)
  assertDeepEqual(record.structure.testMethodNames, expectedTestNames, `测试方法名错误：${record.path}`)

  const expectedTargets = metadata.targets.map(([owner, method, visibility, evidenceText]) => ({
    owner,
    method,
    visibility,
    evidenceLines: sourceLines.flatMap((line, index) => (line.includes(evidenceText) ? [index + 1] : [])),
  }))
  assert(expectedTargets.every((target) => target.evidenceLines.length > 0), `生产入口没有源码证据：${record.path}`)
  assertDeepEqual(record.productionTargets, expectedTargets, `生产入口错误：${record.path}`)

  const expectedFrameworks = [
    'junit4',
    ...(source.includes('org.mockito') ? ['mockito'] : []),
    ...(source.includes('ReflectionTestUtils') || source.includes('getDeclaredMethod(')
      ? ['reflection-test-access']
      : []),
    ...(source.includes('TemporaryFolder') ? ['temporary-folder'] : []),
  ]
  assertDeepEqual(record.frameworkUsages, expectedFrameworks, `测试框架证据错误：${record.path}`)

  const expectedRisks = deriveRisks(typeName, sourceLines, signals)
  assert(record.riskCandidates.length === expectedRisks.length, `风险候选数错误：${record.path}`)
  for (let index = 0; index < expectedRisks.length; index += 1) {
    const actualRisk = record.riskCandidates[index]
    const expectedRisk = expectedRisks[index]
    const expectedId = `TST-${String(expectedRiskIndex + index).padStart(4, '0')}`
    assert(actualRisk.id === expectedId, `风险编号错误：${record.path}`)
    assert(actualRisk.category === expectedRisk.category, `风险类别错误：${record.path}`)
    assertDeepEqual(actualRisk.lines, expectedRisk.lines, `风险行号错误：${record.path}`)
    assert(actualRisk.summary === expectedRiskSummaries[expectedRisk.category], `风险说明错误：${record.path}`)
  }
  const expectedEvidenceLines = [
    ...new Set([
      ...signals.testAnnotationLines,
      ...expectedTargets.flatMap((target) => target.evidenceLines),
    ]),
  ].sort((left, right) => left - right)
  assertDeepEqual(
    record.sourceEvidence,
    [
      {
        lines: expectedEvidenceLines,
        summary: '测试注解、断言、fixture 和真实生产入口共同证明该文件的反馈环职责。',
      },
    ],
    `源码证据错误：${record.path}`,
  )
  return expectedRiskIndex + expectedRisks.length
}

/** 验证 manifest、签核和累计状态。 */
function validateManifestAndSignoff(records, manifest, signoff, inventory, extractionManifest) {
  assert(manifest.schemaVersion === 1, 'manifest schemaVersion 错误')
  assert(manifest.snapshotId === inventory.snapshotId, 'manifest snapshotId 错误')
  assert(manifest.analysisId === extractionManifest.analysisId, 'manifest analysisId 错误')
  assert(manifest.batchId === 'phase-1c-test' && manifest.status === 'completed', 'manifest 批次状态错误')
  assert(manifest.reviewedAt === expectedReviewedAt, 'manifest reviewedAt 错误')
  assertDeepEqual(manifest.batchScope.javaInventoryIndexRanges, [[3430, 3436]], '库存区间错误')
  assert(manifest.batchScope.sourceSet === 'test' && manifest.batchScope.excludedReviewedPaths === 3429, '批次边界错误')
  assertDeepEqual(
    manifest.recordContract,
    {
      format: 'JSON Lines; one manually reviewed test file record per line',
      feedbackLoopBoundary: 'test framework, fixture, assertion, production target and resource ownership are separate evidence',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      coverageBoundary: '46 tests prove only their recorded contracts; they do not establish application-wide sufficiency',
      signoffBoundary: 'manual signoff binds the reviewing candidate shard before records become reviewed',
    },
    '记录合同错误',
  )

  const riskCategoryCounts = countRisks(records)
  const expectedSummary = {
    batchFileCount: 7,
    batchLoc: 1840,
    declaredTypeCount: 7,
    fieldCount: 7,
    publicMethodCount: 48,
    testMethodCount: 46,
    assertionCount: 148,
    sourceRootCounts: { service: 5, util: 2 },
    machineRoleCandidateCounts: { test: 7 },
    finalRoleCounts: { test: 7 },
    testShapeCounts: countBy(records, 'testShape'),
    frameworkFileCounts: { junit4: 7, mockito: 1, reflectionTestAccess: 3, temporaryFolder: 3 },
    productionTargetCount: 19,
    riskCandidateCount: 20,
    riskCategoryCounts,
    currentAuditStatusCounts: { unreviewed: 0, reviewing: 0, reviewed: 3436, blocked: 0 },
  }
  assertDeepEqual(manifest.summary, expectedSummary, 'manifest 汇总错误')
  assert(manifest.shards.length === 1, 'manifest 分片数错误')
  const shard = manifest.shards[0]
  assert(shard.fileName === shardFileName && shard.fileCount === 7, 'manifest 分片身份错误')
  assert(shard.firstInventoryIndex === 3430 && shard.lastInventoryIndex === 3436, 'manifest 分片索引错误')
  assert(shard.firstPath === records[0].path && shard.lastPath === records.at(-1).path, 'manifest 分片路径错误')
  assert(shard.sha256 === sha256(fs.readFileSync(shardPath)), '完成态分片哈希错误')

  assert(signoff.schemaVersion === 1 && signoff.batchId === 'phase-1c-test', '签核身份错误')
  assert(signoff.status === 'approved' && signoff.reviewedAt === expectedReviewedAt, '签核状态或时间错误')
  assert(signoff.reviewedBy === 'Codex' && signoff.reviewerType === 'agent-assisted-manual-review', '签核审查者错误')
  assert(
    signoff.reviewMethod ===
      '逐文件复核 7 个测试文件，核对 46 个测试方法、148 次断言、fixture、真实生产入口、反射和 mock 边界、资源生命周期、全局状态及风险证据。',
    '签核复核方法错误',
  )
  assert(
    signoff.approvalContract === '只有人工确认的 reviewing 候选分片 SHA-256 才能把记录转为 reviewed。',
    '签核批准合同错误',
  )
  assert(signoff.summary.approvedFileCount === 7 && signoff.summary.approvedLoc === 1840, '签核分母错误')
  assert(signoff.summary.approvedShardCount === 1 && signoff.shards.length === 1, '签核分片数错误')
  const candidateRecords = records.map((record) => ({ ...record, auditStatus: 'reviewing' }))
  const candidateContent = `${candidateRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
  assert(signoff.shards[0].sha256 === sha256(candidateContent), '签核未绑定 reviewing 候选分片')
  assert(signoff.shards[0].fileName === shardFileName && signoff.shards[0].decision === 'approved', '签核分片决策错误')
  const signoffBytes = `${JSON.stringify(signoff, null, 2)}\n`
  assert(manifest.manualReviewSignoff.sha256 === sha256(signoffBytes), 'manifest 未绑定当前签核文件')
  assertDeepEqual(
    manifest.manualReviewSignoff,
    {
      path: 'reviews/phase-1c-test-signoff.json',
      sha256: sha256(signoffBytes),
      reviewedBy: 'Codex',
      reviewerType: 'agent-assisted-manual-review',
      approvedShardCount: 1,
    },
    'manifest 人工签核引用错误',
  )
}

/** 执行独立的第 10 批台账验证。 */
function main() {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const manifest = readJson(manifestPath)
  const signoff = readJson(signoffPath)
  const earlierPaths = readEarlierPaths()
  const inventoryFiles = inventory.files.filter((file) => file.index >= 3430)
  assert(inventoryFiles.length === 7, '冻结库存中的测试文件数不是 7')
  assert(inventoryFiles.every((file) => file.sourceSet === 'test'), '冻结测试范围包含非 test 文件')
  assert(inventoryFiles.every((file) => !earlierPaths.has(file.path)), '第 10 批与前九批路径重叠')
  const extractedRecords = fs
    .readFileSync(extractedShardPath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
    .filter((record) => record.inventoryIndex >= 3430)
  const records = fs.readFileSync(shardPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
  assert(records.length === 7 && extractedRecords.length === 7, '第 10 批记录分母不是 7')

  let expectedRiskIndex = 1
  for (let index = 0; index < records.length; index += 1) {
    expectedRiskIndex = validateRecord(records[index], inventoryFiles[index], extractedRecords[index], expectedRiskIndex)
  }
  assert(expectedRiskIndex === 21, `风险候选总数不是 20：${expectedRiskIndex - 1}`)
  validateManifestAndSignoff(records, manifest, signoff, inventory, extractionManifest)
  console.log(
    JSON.stringify({
      status: 'PASS',
      batchId: 'phase-1c-test',
      snapshotId: inventory.snapshotId,
      reviewedFiles: 7,
      batchLoc: 1840,
      testMethodCount: 46,
      assertionCount: 148,
      riskCandidateCount: 20,
      currentAuditStatusCounts: { unreviewed: 0, reviewing: 0, reviewed: 3436, blocked: 0 },
    }),
  )
}

main()
