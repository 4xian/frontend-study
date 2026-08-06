import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const extractedShardPath = path.join(auditDirectory, 'extracted', 'dzzz-app-files-3001-3436.jsonl')
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-test')
const defaultSignoffPath = path.join(auditDirectory, 'reviews', 'phase-1c-test-signoff.json')
const sourceRepository = process.env.DZZZ_SOURCE_REPOSITORY ?? '/Users/jian/Desktop/work/TDH/dzzz'
const reviewedAt = '2026-08-04T08:25:57.000Z'
const priorReviewedFileCount = 3429
const shardFileName = 'records-0001-0007.jsonl'

const priorReviewSources = [
  { kind: 'single', path: 'phase-1c-startup-config.json' },
  { kind: 'sharded', path: 'phase-1c-web-entry' },
  { kind: 'sharded', path: 'phase-1c-business-layer' },
  { kind: 'sharded', path: 'phase-1c-data-access' },
  { kind: 'sharded', path: 'phase-1c-data-model' },
  { kind: 'sharded', path: 'phase-1c-cross-cutting' },
  { kind: 'sharded', path: 'phase-1c-async-integration' },
  { kind: 'sharded', path: 'phase-1c-infrastructure' },
  { kind: 'sharded', path: 'phase-1c-common-code' },
]

const reviewCatalog = {
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
  const options = { check: false, prepare: false }
  for (const argument of argv) {
    if (argument === '--check') options.check = true
    else if (argument === '--prepare') options.prepare = true
    else throw new Error(`未知参数：${argument}`)
  }
  if (options.check && options.prepare) throw new Error('--check 与 --prepare 不能同时使用')
  return options
}

/** 返回匹配指定规则的源码行号。 */
function findLines(sourceLines, pattern) {
  return sourceLines.flatMap((line, index) => (pattern.test(line) ? [index + 1] : []))
}

/** 统计源码中的断言调用次数。 */
function countAssertions(source) {
  return [...source.matchAll(/\bassert(?:Equals|False|NotNull|Null|True)\s*\(/g)].length
}

/** 从源码独立提取测试反馈环信号。 */
function buildTestSignals(source, loc) {
  const sourceLines = source.split('\n')
  return {
    testAnnotationLines: findLines(sourceLines, /^\s*@Test(?:\s*\(|\s*$)/),
    lifecycleAnnotationLines: findLines(sourceLines, /^\s*@(After|Before|Rule)\b/),
    assertionCount: countAssertions(source),
    temporaryFolderLines: findLines(sourceLines, /\bTemporaryFolder\b/),
    mockCreationLines: findLines(sourceLines, /\bmock\s*\(/),
    reflectionAccessLines: findLines(
      sourceLines,
      /ReflectionTestUtils\.(?:invokeMethod|setField)|getDeclaredMethod\s*\(|setAccessible\s*\(|\.invoke\s*\(/,
    ),
    fileResourceLines: findLines(sourceLines, /new\s+FileOutputStream\s*\(|new\s+PdfReader\s*\(|\.close\s*\(\)/),
    mutableGlobalStateLines: findLines(sourceLines, /JzglConstant\.getWebYqmTsFileMap\s*\(\)/),
    expectedExceptionLines: findLines(sourceLines, /@Test\s*\(\s*expected\s*=/),
    systemPropertyLines: findLines(sourceLines, /System\.getProperty\s*\(/),
    oversizedFixture: loc >= 500,
  }
}

/** 根据人工复核目录构建真实生产入口证据。 */
function buildProductionTargets(catalog, sourceLines) {
  return catalog.targets.map(([owner, method, visibility, evidenceText]) => ({
    owner,
    method,
    visibility,
    evidenceLines: sourceLines.flatMap((line, index) =>
      line.includes(evidenceText) ? [index + 1] : [],
    ),
  }))
}

/** 添加一条文件级风险候选。 */
function addRisk(risks, category, lines, summary) {
  const normalized = [...new Set(lines)].sort((left, right) => left - right)
  if (normalized.length > 0) risks.push({ category, lines: normalized, summary })
}

/** 从测试信号生成人工确认的风险候选。 */
function buildRiskCandidates(fileName, sourceLines, signals) {
  const risks = []
  addRisk(risks, 'legacy-junit4', findLines(sourceLines, /import\s+org\.junit\.Test;/), '当前反馈环使用 JUnit 4；现代课程优先使用 JUnit Jupiter。')
  addRisk(risks, 'private-reflection-coupling', signals.reflectionAccessLines, '测试通过反射访问字段或私有方法，重构时会耦合实现细节。')
  addRisk(risks, 'manual-mock-injection', [...signals.mockCreationLines, ...findLines(sourceLines, /ReflectionTestUtils\.setField/)], '测试手工创建并反射注入 mock，依赖注入边界不够显式。')
  addRisk(risks, 'oversized-test-fixture', signals.oversizedFixture ? findLines(sourceLines, /public\s+class\s+/) : [], '大型测试类聚合多种反馈环和 fixture，定位失败与维护成本较高。')
  addRisk(risks, 'manual-resource-lifecycle', findLines(sourceLines, /new\s+FileOutputStream\s*\(|new\s+PdfReader\s*\(|\.close\s*\(\)/), '文件或 PDF 资源依靠显式 close，异常路径的所有权需要单独核对。')
  addRisk(risks, 'mutable-global-test-state', signals.mutableGlobalStateLines, '测试读写进程级共享缓存，必须保证每个反馈环可靠复位。')
  addRisk(risks, 'broad-expected-exception', signals.expectedExceptionLines, '@Test(expected) 无法限定具体抛出位置，可能接受非目标语句的异常。')
  addRisk(risks, 'optional-external-output-directory', signals.systemPropertyLines, '系统属性可把测试产物写到临时目录之外，运行者需要显式管理清理边界。')
  addRisk(
    risks,
    'coarse-artifact-assertion',
    fileName === 'KeywordSignatureMergeTest'
      ? findLines(sourceLines, /targetPdf\.exists\s*\(|getNumberOfPages\s*\(\)|mergedQmidList\.size\s*\(\)/)
      : [],
    '端到端 PDF 用例验证身份、存在性和页数，未直接断言最终图片像素或矩形。',
  )
  return risks
}

/** 读取前九批已复核路径并验证分母。 */
function readPriorReviewedPaths() {
  const reviewedPaths = []
  for (const source of priorReviewSources) {
    if (source.kind === 'single') {
      const ledger = readJson(path.join(auditDirectory, 'reviews', source.path))
      reviewedPaths.push(...ledger.records.map((record) => record.path))
      continue
    }
    const directory = path.join(auditDirectory, 'reviews', source.path)
    const manifest = readJson(path.join(directory, 'manifest.json'))
    for (const shard of manifest.shards) {
      const lines = fs.readFileSync(path.join(directory, shard.fileName), 'utf8').trim().split('\n')
      reviewedPaths.push(...lines.map((line) => JSON.parse(line).path))
    }
  }
  if (reviewedPaths.length !== priorReviewedFileCount) {
    throw new Error(`前九批已复核文件数异常：${reviewedPaths.length}`)
  }
  if (new Set(reviewedPaths).size !== reviewedPaths.length) throw new Error('前九批存在重复路径')
  return new Set(reviewedPaths)
}

/** 读取 Phase 1B 中第 10 批的 7 条结构记录。 */
function readExtractedTestRecords() {
  return fs
    .readFileSync(extractedShardPath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
    .filter((record) => record.inventoryIndex >= 3430)
}

/** 为单个冻结测试文件构建人工复核记录。 */
function buildRecord(file, extractedRecord, auditStatus) {
  const absolutePath = path.join(sourceRepository, file.path)
  const source = fs.readFileSync(absolutePath, 'utf8')
  const sourceLines = source.split('\n')
  const typeName = extractedRecord.declaredTypes[0]?.name
  const catalog = reviewCatalog[typeName]
  if (!catalog) throw new Error(`缺少测试职责目录：${file.path}`)
  const signals = buildTestSignals(source, file.loc)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus,
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: 'test',
    testShape: catalog.shape,
    roleDetail: catalog.roleDetail,
    responsibility: catalog.responsibility,
    lifecycle: catalog.lifecycle,
    fixtureMode: catalog.fixtureMode,
    structure: {
      declaredTypeCount: extractedRecord.declaredTypes.length,
      fieldCount: extractedRecord.fields.length,
      publicMethodCount: extractedRecord.publicMethods.length,
      testMethodCount: signals.testAnnotationLines.length,
      testMethodNames: extractedRecord.annotations
        .filter((annotation) => annotation.name === 'Test')
        .map((annotation) => annotation.target.split('#')[1].split('(')[0]),
    },
    testSignals: signals,
    frameworkUsages: [
      'junit4',
      ...(source.includes('org.mockito') ? ['mockito'] : []),
      ...(source.includes('ReflectionTestUtils') || source.includes('getDeclaredMethod(')
        ? ['reflection-test-access']
        : []),
      ...(source.includes('TemporaryFolder') ? ['temporary-folder'] : []),
    ],
    productionTargets: buildProductionTargets(catalog, sourceLines),
    capabilityCandidates: catalog.capabilities,
    riskCandidates: buildRiskCandidates(typeName, sourceLines, signals),
    sourceEvidence: [
      {
        lines: [...new Set([...signals.testAnnotationLines, ...catalog.targets.flatMap((target) =>
          sourceLines.flatMap((line, index) => (line.includes(target[3]) ? [index + 1] : [])),
        )])].sort((left, right) => left - right),
        summary: '测试注解、断言、fixture 和真实生产入口共同证明该文件的反馈环职责。',
      },
    ],
  }
}

/** 为风险候选分配批次内连续编号。 */
function assignRiskIds(records) {
  let riskIndex = 1
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      risk.id = `TST-${String(riskIndex).padStart(4, '0')}`
      riskIndex += 1
    }
  }
}

/** 按字段统计记录数量。 */
function countBy(records, field) {
  return Object.fromEntries(
    [...records.reduce((counts, record) => {
      const value = record[field]
      counts.set(value, (counts.get(value) ?? 0) + 1)
      return counts
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 汇总全部风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 将记录编码为稳定 JSONL 字节。 */
function serializeRecords(records) {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
}

/** 构建候选或完成态记录及其 manifest。 */
function buildArtifacts(auditStatus, signoff = null) {
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const priorPaths = readPriorReviewedPaths()
  const extractedRecords = readExtractedTestRecords()
  const extractedByPath = new Map(extractedRecords.map((record) => [record.path, record]))
  const batchFiles = inventory.files.filter((file) => file.index >= 3430)
  if (batchFiles.length !== 7 || batchFiles[0].index !== 3430 || batchFiles[6].index !== 3436) {
    throw new Error('第 10 批库存分母不是 3430..3436 的 7 个文件')
  }
  if (batchFiles.some((file) => file.sourceSet !== 'test')) throw new Error('第 10 批包含非测试源码')
  if (batchFiles.some((file) => priorPaths.has(file.path))) throw new Error('第 10 批与前九批路径重叠')

  const records = batchFiles.map((file) => {
    const absolutePath = path.join(sourceRepository, file.path)
    const source = fs.readFileSync(absolutePath)
    if (sha256(source) !== file.sha256) throw new Error(`源码 SHA-256 漂移：${file.path}`)
    return buildRecord(file, extractedByPath.get(file.path), auditStatus)
  })
  assignRiskIds(records)
  const recordsContent = serializeRecords(records)
  const riskCategoryCounts = countRiskCategories(records)
  const riskCandidateCount = Object.values(riskCategoryCounts).reduce((total, count) => total + count, 0)
  const summary = {
    batchFileCount: records.length,
    batchLoc: records.reduce((total, record) => total + record.loc, 0),
    declaredTypeCount: records.reduce((total, record) => total + record.structure.declaredTypeCount, 0),
    fieldCount: records.reduce((total, record) => total + record.structure.fieldCount, 0),
    publicMethodCount: records.reduce((total, record) => total + record.structure.publicMethodCount, 0),
    testMethodCount: records.reduce((total, record) => total + record.structure.testMethodCount, 0),
    assertionCount: records.reduce((total, record) => total + record.testSignals.assertionCount, 0),
    sourceRootCounts: { service: 5, util: 2 },
    machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
    finalRoleCounts: countBy(records, 'finalRole'),
    testShapeCounts: countBy(records, 'testShape'),
    frameworkFileCounts: {
      junit4: 7,
      mockito: records.filter((record) => record.frameworkUsages.includes('mockito')).length,
      reflectionTestAccess: records.filter((record) => record.frameworkUsages.includes('reflection-test-access')).length,
      temporaryFolder: records.filter((record) => record.frameworkUsages.includes('temporary-folder')).length,
    },
    productionTargetCount: records.reduce((total, record) => total + record.productionTargets.length, 0),
    riskCandidateCount,
    riskCategoryCounts,
    currentAuditStatusCounts: {
      unreviewed: 0,
      reviewing: auditStatus === 'reviewing' ? 7 : 0,
      reviewed: priorReviewedFileCount + (auditStatus === 'reviewed' ? 7 : 0),
      blocked: 0,
    },
  }
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-test',
    status: auditStatus === 'reviewed' ? 'completed' : 'awaiting-signoff',
    reviewedAt,
    ...(signoff
      ? {
          manualReviewSignoff: {
            path: 'reviews/phase-1c-test-signoff.json',
            sha256: sha256(`${JSON.stringify(signoff, null, 2)}\n`),
            reviewedBy: signoff.reviewedBy,
            reviewerType: signoff.reviewerType,
            approvedShardCount: signoff.shards.length,
          },
        }
      : {}),
    batchScope: {
      sourceSet: 'test',
      javaInventoryIndexRanges: [[3430, 3436]],
      excludedReviewedPaths: priorReviewedFileCount,
    },
    recordContract: {
      format: 'JSON Lines; one manually reviewed test file record per line',
      feedbackLoopBoundary: 'test framework, fixture, assertion, production target and resource ownership are separate evidence',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      coverageBoundary: '46 tests prove only their recorded contracts; they do not establish application-wide sufficiency',
      signoffBoundary: 'manual signoff binds the reviewing candidate shard before records become reviewed',
    },
    summary,
    shards: [
      {
        fileName: shardFileName,
        fileCount: records.length,
        firstInventoryIndex: records[0].inventoryIndex,
        lastInventoryIndex: records.at(-1).inventoryIndex,
        firstPath: records[0].path,
        lastPath: records.at(-1).path,
        sha256: sha256(recordsContent),
      },
    ],
  }
  return { recordsContent, manifest }
}

/** 校验人工签核是否绑定当前 reviewing 候选。 */
function validateSignoff(signoff, candidateArtifacts) {
  if (signoff.status !== 'approved' || signoff.batchId !== 'phase-1c-test') {
    throw new Error('第 10 批人工签核状态或批次错误')
  }
  if (signoff.reviewedAt !== reviewedAt || signoff.shards.length !== 1) {
    throw new Error('第 10 批人工签核时间或分片数错误')
  }
  const approvedShard = signoff.shards[0]
  const candidateShard = candidateArtifacts.manifest.shards[0]
  if (
    approvedShard.fileName !== candidateShard.fileName ||
    approvedShard.fileCount !== candidateShard.fileCount ||
    approvedShard.sha256 !== candidateShard.sha256 ||
    approvedShard.decision !== 'approved'
  ) {
    throw new Error('人工签核未绑定当前 reviewing 候选分片')
  }
}

/** 将生成产物写入目标目录。 */
function writeArtifacts(outputDirectory, artifacts) {
  fs.mkdirSync(outputDirectory, { recursive: true })
  fs.writeFileSync(path.join(outputDirectory, shardFileName), artifacts.recordsContent)
  fs.writeFileSync(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(artifacts.manifest, null, 2)}\n`)
}

/** 比较生成结果与正式产物是否逐字节一致。 */
function checkArtifacts(outputDirectory, artifacts) {
  const expectedRecords = fs.readFileSync(path.join(outputDirectory, shardFileName), 'utf8')
  const expectedManifest = fs.readFileSync(path.join(outputDirectory, 'manifest.json'), 'utf8')
  if (expectedRecords !== artifacts.recordsContent) throw new Error(`${shardFileName} 与重建结果不一致`)
  if (expectedManifest !== `${JSON.stringify(artifacts.manifest, null, 2)}\n`) {
    throw new Error('manifest.json 与重建结果不一致')
  }
}

/** 执行候选准备、正式生成或只读检查。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const outputDirectory = process.env.DZZZ_TEST_REVIEW_DIRECTORY
    ? path.resolve(process.env.DZZZ_TEST_REVIEW_DIRECTORY)
    : defaultOutputDirectory
  if (options.prepare) {
    if (outputDirectory === defaultOutputDirectory) throw new Error('--prepare 必须指定独立输出目录')
    const candidateArtifacts = buildArtifacts('reviewing')
    writeArtifacts(outputDirectory, candidateArtifacts)
    console.log(JSON.stringify({ status: 'PASS', mode: 'prepare', ...candidateArtifacts.manifest.summary }))
    return
  }

  const signoffPath = process.env.DZZZ_TEST_SIGNOFF_PATH
    ? path.resolve(process.env.DZZZ_TEST_SIGNOFF_PATH)
    : defaultSignoffPath
  const signoff = readJson(signoffPath)
  const candidateArtifacts = buildArtifacts('reviewing')
  validateSignoff(signoff, candidateArtifacts)
  const completedArtifacts = buildArtifacts('reviewed', signoff)
  if (options.check) checkArtifacts(outputDirectory, completedArtifacts)
  else writeArtifacts(outputDirectory, completedArtifacts)
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.check ? 'check' : 'write',
      batchId: 'phase-1c-test',
      ...completedArtifacts.manifest.summary,
    }),
  )
}

main()
