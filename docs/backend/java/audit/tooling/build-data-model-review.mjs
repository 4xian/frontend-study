import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const manualSignoffPath = path.join(
  auditDirectory,
  'reviews',
  'phase-1c-data-model-signoff.json',
)
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-data-model')
const outputDirectory = process.env.DZZZ_DATA_MODEL_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_DATA_MODEL_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const shardSize = 50
const previouslyReviewedFileCount = 1234

const frameworkNames = {
  'bean-validation': 'Bean Validation',
  fastjson: 'Fastjson',
  jackson: 'Jackson',
  lombok: 'Lombok',
  'mybatis-plus': 'MyBatis-Plus',
  'spring-core': 'Spring Core',
  'spring-mvc': 'Spring MVC',
  'xml-jaxb': 'JAXB',
}

const validationImportPrefixes = [
  'javax.validation.constraints.',
  'jakarta.validation.constraints.',
  'org.hibernate.validator.constraints.',
]

const lombokAnnotationNames = new Set([
  'AllArgsConstructor',
  'Builder',
  'Data',
  'EqualsAndHashCode',
  'Getter',
  'NoArgsConstructor',
  'RequiredArgsConstructor',
  'Setter',
  'SuperBuilder',
  'ToString',
  'Value',
])

const swaggerAnnotationNames = new Set(['ApiModel', 'ApiModelProperty'])
const persistenceAnnotationNames = new Set(['TableField', 'TableId', 'TableName'])
const springComponentAnnotationNames = new Set([
  'Component',
  'Configuration',
  'Controller',
  'Repository',
  'RestController',
  'Service',
])
const sensitiveFieldName =
  /(?:password|passwd|pwd|pass|secret|privatekey|apikey|appkey|token|tokenid|authorization|credential|accesscode|sqm)$/i
const projectSensitiveFieldNames = new Set([
  'authorizekey',
  'clientkey',
  'cxmm',
  'directmodelconfig',
  'dlmm',
  'ftpmm',
  'hyzdmm',
  'mm',
  'modelconfig',
  'newkl',
  'platformmodelconfig',
  'roomkey',
  'vidyokey',
  'vidyowwkey',
  'xfsk',
  'yhkl',
  'yskl',
  'zdmm',
])
const accessorMethodName = /^(?:get|set|is|has)[A-Z]/
const ignoredMethodNames = new Set(['equals', 'hashCode', 'toString'])

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 统一使用正斜杠表示相对路径。 */
function normalizePath(filePath) {
  return filePath.split(path.sep).join('/')
}

/** 解析命令行参数。 */
function parseArguments(argv) {
  const options = { check: false, sourceRepository: defaultSourceRepository }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--check') {
      options.check = true
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
  return options
}

/** 递归列出目录中的文件并稳定排序。 */
function listFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    })
    .sort((left, right) => left.localeCompare(right))
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

/** 判断冻结文件是否属于 Phase 1C 第 5 批物理范围。 */
function isDataModelBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:bo|dto|eo|vo)\/.*\.java$/.test(
    file.path,
  )
}

/** 从物理路径提取 bo、dto、eo 或 vo 模型族。 */
function getModelFamily(filePath) {
  return filePath.match(/\/bdzz\/(bo|dto|eo|vo)\//)?.[1]
}

/** 返回类型和成员上的全部注解名。 */
function getAnnotationNames(extractedRecord) {
  return new Set(extractedRecord.annotations.map((annotation) => annotation.name))
}

/** 返回类型声明上的全部注解名。 */
function getTypeAnnotationNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter((annotation) => annotation.site === 'type')
      .map((annotation) => annotation.name),
  )
}

/** 从 import 精确识别 Bean Validation 约束注解名。 */
function getValidationConstraintNames(extractedRecord) {
  const importedConstraintNames = new Set(
    extractedRecord.imports
      .map((entry) => entry.name)
      .filter((name) => validationImportPrefixes.some((prefix) => name.startsWith(prefix)))
      .map((name) => name.split('.').at(-1)),
  )
  return [...new Set(
    extractedRecord.annotations
      .map((annotation) => annotation.name)
      .filter((name) => importedConstraintNames.has(name)),
  )].sort()
}

/** 从注解名识别显式序列化协议。 */
function getSerializationKinds(extractedRecord) {
  const annotationNames = getAnnotationNames(extractedRecord)
  const kinds = []
  if ([...annotationNames].some((name) => name.startsWith('Json'))) kinds.push('jackson')
  if ([...annotationNames].some((name) => name.startsWith('JSON'))) kinds.push('fastjson')
  if ([...annotationNames].some((name) => name.startsWith('XStream'))) kinds.push('xstream')
  if ([...annotationNames].some((name) => name.startsWith('Xml'))) kinds.push('jaxb')
  return kinds
}

/** 建立用于解析 Controller 参数类型的主类型名索引。 */
function buildPrimaryTypeIndex(batchRecords) {
  const index = new Map()
  for (const record of batchRecords) {
    const typeName = record.declaredTypes[0]?.name
    if (!typeName) continue
    if (!index.has(typeName)) index.set(typeName, [])
    index.get(typeName).push(record)
  }
  return index
}

/** 根据 Controller import 把同名模型参数解析到唯一文件。 */
function resolveValidatedType(typeName, controllerRecord, typeIndex) {
  const candidates = typeIndex.get(typeName) ?? []
  if (candidates.length <= 1) return candidates
  const normalImports = controllerRecord.imports.filter((entry) => !entry.static)
  const explicit = candidates.filter((candidate) =>
    normalImports.some(
      (entry) => !entry.wildcard && entry.name === `${candidate.packageName}.${typeName}`,
    ),
  )
  if (explicit.length === 1) return explicit
  const wildcard = candidates.filter((candidate) =>
    normalImports.some((entry) => entry.wildcard && entry.name === candidate.packageName),
  )
  return wildcard.length === 1 ? wildcard : []
}

/** 提取 Controller 中由 @Valid 或 @Validated 直接触发的模型参数。 */
function buildControllerValidationIndex(sourceRepository, extractedByPath, batchRecords) {
  const evidenceByPath = new Map(batchRecords.map((record) => [record.path, []]))
  const typeIndex = buildPrimaryTypeIndex(batchRecords)
  const controllerDirectory = path.join(
    sourceRepository,
    'dzzz-app/src/main/java/com/tdh/bdzz/controller',
  )
  const validationPattern = /@(Valid|Validated)\b(?:\s*\([^)]*\))?(?:\s*@[\w.]+(?:\s*\([^)]*\))?)*\s+(?:final\s+)?([\w.$]+(?:\s*<[^;()]+>)?(?:\[\])?)\s+[A-Za-z_$][\w$]*/g
  for (const controllerPath of listFiles(controllerDirectory).filter((filePath) => filePath.endsWith('.java'))) {
    const relativePath = normalizePath(path.relative(sourceRepository, controllerPath))
    const controllerRecord = extractedByPath.get(relativePath)
    if (!controllerRecord) continue
    const sourceText = fs.readFileSync(controllerPath, 'utf8')
    for (const match of sourceText.matchAll(validationPattern)) {
      const typeNames = [...match[2].matchAll(/[A-Z][A-Za-z0-9_$]*/g)].map((item) => item[0])
      const line = sourceText.slice(0, match.index).split('\n').length
      for (const typeName of typeNames) {
        for (const modelRecord of resolveValidatedType(typeName, controllerRecord, typeIndex)) {
          evidenceByPath.get(modelRecord.path).push({
            sourcePath: relativePath,
            line,
            trigger: `@${match[1]}`,
          })
        }
      }
    }
  }
  for (const [filePath, evidence] of evidenceByPath) {
    const unique = new Map(
      evidence.map((item) => [`${item.sourcePath}:${item.line}:${item.trigger}`, item]),
    )
    evidenceByPath.set(
      filePath,
      [...unique.values()].sort(
        (left, right) =>
          left.sourcePath.localeCompare(right.sourcePath) || left.line - right.line,
      ),
    )
  }
  return evidenceByPath
}

/** 构建校验、序列化、Lombok 和映射注解概况。 */
function buildAnnotationProfile(extractedRecord) {
  const annotationNames = getAnnotationNames(extractedRecord)
  const validationConstraintNames = getValidationConstraintNames(extractedRecord)
  return {
    lombok: [...annotationNames].filter((name) => lombokAnnotationNames.has(name)).sort(),
    validationConstraints: validationConstraintNames,
    nestedValidCount: extractedRecord.annotations.filter(
      (annotation) => annotation.name === 'Valid' && annotation.site === 'field',
    ).length,
    swagger2: [...annotationNames].filter((name) => swaggerAnnotationNames.has(name)).sort(),
    serialization: getSerializationKinds(extractedRecord),
    persistence: [...annotationNames]
      .filter((name) => persistenceAnnotationNames.has(name))
      .sort(),
  }
}

/** 判断模型是否封装流、上传文件或 Spring Resource。 */
function isResourceWrapper(extractedRecord) {
  return extractedRecord.fields.some((field) =>
    /(?:^|[<, ?])(?:InputStream|MultipartFile|Resource|File)(?:$|[>, ?])/.test(field.type),
  )
}

/** 判断模型是否提供成功/失败结果封装工厂。 */
function isResponseEnvelope(extractedRecord) {
  return extractedRecord.publicMethods.some((method) =>
    ['data', 'error', 'fail', 'ok', 'success'].includes(method.name),
  )
}

/** 根据目录、真实约束和序列化信号确认主要模型形态。 */
function getModelShape(filePath, extractedRecord, profile, validationEvidence) {
  const family = getModelFamily(filePath)
  if (filePath.includes('/dto/filter/')) return 'query-filter-model'
  if (isResourceWrapper(extractedRecord)) return 'resource-wrapper-model'
  if (isResponseEnvelope(extractedRecord)) return 'response-envelope-model'
  if (family === 'bo') return 'business-transfer-model'
  if (family === 'eo' || profile.serialization.length > 0) return 'external-contract-model'
  if (profile.validationConstraints.length > 0 || validationEvidence.length > 0) {
    return 'request-input-model'
  }
  if (family === 'vo') return 'response-view-model'
  return 'transfer-model'
}

/** 生成可读的模型角色说明。 */
function buildRoleDetail(typeName, modelShape) {
  const labels = {
    'business-transfer-model': '业务层传输模型',
    'external-contract-model': '外部系统序列化合同',
    'query-filter-model': '查询与分页条件模型',
    'request-input-model': '请求输入模型',
    'resource-wrapper-model': '资源所有权包装模型',
    'response-envelope-model': '统一响应封装模型',
    'response-view-model': '响应视图模型',
    'transfer-model': '通用数据传输模型',
  }
  return `${typeName} ${labels[modelShape]}`
}

/** 按字段、类型声明和显式方法生成主要职责结论。 */
function buildResponsibility(typeName, modelShape, extractedRecord) {
  const fieldCount = extractedRecord.fields.length
  const declaredTypeCount = extractedRecord.declaredTypes.length
  const publicMethodCount = extractedRecord.publicMethods.length
  const nestedText = declaredTypeCount > 1 ? `，并在同一文件声明 ${declaredTypeCount - 1} 个成员类型` : ''
  const methodText = publicMethodCount > 0 ? `；另有 ${publicMethodCount} 个显式公开方法` : ''
  return `${typeName} 以 ${fieldCount} 个字段承载 ${modelShape} 数据${nestedText}${methodText}。`
}

/** 准确区分约束声明、直接触发和级联校验。 */
function buildBoundary(profile, validationEvidence) {
  const constraintCount = profile.validationConstraints.length
  if (validationEvidence.length > 0 && constraintCount > 0) {
    return `当前类型声明 ${constraintCount} 类 Bean Validation 约束，并在 ${new Set(validationEvidence.map((item) => item.sourcePath)).size} 个 Controller 中由 @Valid 或 @Validated 直接触发；对象字段只有标注 @Valid 才会级联校验。`
  }
  if (validationEvidence.length > 0) {
    return 'Controller 参数使用 @Valid 或 @Validated 触发校验，但当前类型没有直接声明约束；仍需结合父类约束和带 @Valid 的嵌套对象确认实际校验范围。'
  }
  if (constraintCount > 0) {
    return `当前类型声明 ${constraintCount} 类 Bean Validation 约束，但未在本批 Controller 参数中确认直接触发；约束可能由父对象级联或 Validator 手动触发，不能仅凭注解认定已经生效。`
  }
  return '当前类型未声明 Bean Validation 约束，也未在本批 Controller 参数中发现 @Valid 或 @Validated 直接触发证据。'
}

/** 根据所属包和 import 把字段类型解析到唯一的本批模型。 */
function resolveNestedModelType(typeName, ownerRecord, typeIndex) {
  const candidates = typeIndex.get(typeName) ?? []
  const imports = ownerRecord.imports.filter((entry) => !entry.static)
  const matches = candidates.filter(
    (candidate) =>
      candidate.packageName === ownerRecord.packageName ||
      imports.some(
        (entry) =>
          (!entry.wildcard && entry.name === `${candidate.packageName}.${typeName}`) ||
          (entry.wildcard && entry.name === candidate.packageName),
      ),
  )
  return matches.length === 1 ? matches[0] : undefined
}

/** 判断字段是否引用当前已声明校验约束、但不会自动级联的模型。 */
function isConstrainedNestedModelField(field, ownerRecord, typeIndex) {
  return [...field.type.matchAll(/[A-Z][A-Za-z0-9_$]*/g)].some((match) => {
    const target = resolveNestedModelType(match[0], ownerRecord, typeIndex)
    return target && getValidationConstraintNames(target).length > 0
  })
}

/** 返回字段上指定注解的源码行号。 */
function getFieldAnnotationLines(extractedRecord, field, annotationName) {
  return extractedRecord.annotations
    .filter(
      (annotation) =>
        annotation.site === 'field' &&
        annotation.name === annotationName &&
        annotation.target?.endsWith(`#${field.name}`),
    )
    .map((annotation) => annotation.line)
}

/** 根据英文凭据后缀和已人工确认的项目旧字段名识别敏感字段。 */
function isSensitiveField(field) {
  const normalizedName = field.name.replaceAll('_', '').toLowerCase()
  return sensitiveFieldName.test(normalizedName) || projectSensitiveFieldNames.has(normalizedName)
}

/** 汇总主要框架、字段类型和继承合同。 */
function buildDependencies(extractedRecord) {
  const dependencies = [
    ...extractedRecord.frameworkUsages.map((usage) => frameworkNames[usage.id] ?? usage.id),
    ...extractedRecord.declaredTypes.flatMap((type) => [...type.extends, ...type.implements]),
    ...extractedRecord.fields.map((field) => field.type),
  ]
    .filter(Boolean)
    .filter((value) => !/^(?:boolean|byte|char|double|float|int|long|short|void)$/.test(value))
  return [...new Set(dependencies)].slice(0, 14)
}

/** 根据模型形态和真实注解生成课程能力候选。 */
function buildCapabilityCandidates(modelShape, extractedRecord, profile, validationEvidence) {
  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  const capabilities = ['Java 类与字段封装']
  const shapeCapabilities = {
    'business-transfer-model': ['业务层对象边界'],
    'external-contract-model': ['外部系统数据合同'],
    'query-filter-model': ['查询条件对象', '分页参数边界'],
    'request-input-model': ['请求模型边界'],
    'resource-wrapper-model': ['I/O 资源所有权'],
    'response-envelope-model': ['泛型响应封装'],
    'response-view-model': ['响应视图模型'],
    'transfer-model': ['DTO 数据传输'],
  }
  capabilities.push(...shapeCapabilities[modelShape])
  if (profile.lombok.length > 0) capabilities.push('Lombok 代码生成')
  if (typeAnnotations.has('Builder') || typeAnnotations.has('SuperBuilder')) capabilities.push('Builder 模式')
  if (profile.validationConstraints.length > 0) capabilities.push('Bean Validation 约束')
  if (profile.nestedValidCount > 0) capabilities.push('级联校验 @Valid')
  if (validationEvidence.length > 0) capabilities.push('Spring MVC 参数校验触发')
  if (profile.swagger2.length > 0) capabilities.push('Swagger 2 模型描述')
  if (profile.serialization.includes('jackson')) capabilities.push('Jackson 字段映射')
  if (profile.serialization.includes('fastjson')) capabilities.push('Fastjson 字段映射')
  if (profile.serialization.includes('xstream')) capabilities.push('XStream XML 映射')
  if (profile.serialization.includes('jaxb')) capabilities.push('JAXB XML 映射')
  if (profile.persistence.length > 0) capabilities.push('MyBatis-Plus 字段映射')
  if (extractedRecord.declaredTypes[0]?.extends.length > 0) capabilities.push('模型继承')
  if (extractedRecord.declaredTypes.length > 1) capabilities.push('成员类')
  if (extractedRecord.declaredTypes[0]?.typeParameters) capabilities.push('Java 泛型')
  if (extractedRecord.declaredTypes[0]?.implements.some((name) => name.includes('Serializable'))) {
    capabilities.push('Serializable')
  }
  return [...new Set(capabilities)]
}

/** 添加一条尚未编号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const validLines = [...new Set(lines)].filter(Number.isInteger).sort((left, right) => left - right)
  if (validLines.length === 0) return
  risks.push({ category, lines: validLines, summary })
}

/** 返回模型中不是访问器或 Object 覆盖的显式方法。 */
function getBehaviorMethods(extractedRecord) {
  return extractedRecord.publicMethods.filter(
    (method) => !accessorMethodName.test(method.name) && !ignoredMethodNames.has(method.name),
  )
}

/** 判断显式 toString 方法体是否引用敏感字段。 */
function findSensitiveToStringLines(extractedRecord, sourceLines, sensitiveFields) {
  const lines = []
  for (const method of extractedRecord.publicMethods.filter((item) => item.name === 'toString')) {
    const body = sourceLines.slice(method.line - 1, method.endLine).join('\n')
    if (sensitiveFields.some((field) => new RegExp(`\\b${field.name}\\b`).test(body))) {
      lines.push(method.line)
    }
  }
  return lines
}

/** 依据逐文件源码信号生成数据模型风险候选。 */
function buildRisks(extractedRecord, sourceLines, profile, validationEvidence, typeIndex) {
  const risks = []
  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  const constraintLines = extractedRecord.annotations
    .filter((annotation) => profile.validationConstraints.includes(annotation.name))
    .map((annotation) => annotation.line)
  if (constraintLines.length > 0 && validationEvidence.length === 0) {
    addRisk(
      risks,
      'constraint-without-direct-controller-trigger',
      constraintLines,
      '模型声明了校验约束，但当前 Controller 参数中没有直接 @Valid/@Validated 触发证据；需继续核对父对象级联或手动 Validator 调用。',
    )
  }

  const nestedFieldsWithoutValid = validationEvidence.length === 0
    ? []
    : extractedRecord.fields.filter(
        (field) =>
            isConstrainedNestedModelField(field, extractedRecord, typeIndex) &&
          getFieldAnnotationLines(extractedRecord, field, 'Valid').length === 0,
      )
  addRisk(
    risks,
    'nested-model-without-valid',
    nestedFieldsWithoutValid.map((field) => field.line),
    '该请求模型包含其他模型字段但没有 @Valid，父对象校验不会自动级联到嵌套对象约束。',
  )

  const legacyConstraintImports = extractedRecord.imports
    .filter((entry) => entry.name.startsWith('org.hibernate.validator.constraints.'))
    .map((entry) => entry.line)
  addRisk(
    risks,
    'provider-specific-validation-annotation',
    legacyConstraintImports,
    '代码使用 Hibernate Validator 旧的提供方专属约束；现代示例应使用 Jakarta Validation 标准约束。',
  )

  const sensitiveFields = extractedRecord.fields.filter(isSensitiveField)
  addRisk(
    risks,
    'sensitive-field-boundary',
    sensitiveFields.map((field) => field.line),
    '模型承载密码、令牌或应用密钥字段，禁止整体记录、回显或进入异常消息，并应明确最短生命周期。',
  )
  if (typeAnnotations.has('Data') || typeAnnotations.has('ToString')) {
    addRisk(
      risks,
      'sensitive-field-in-generated-to-string',
      sensitiveFields.map((field) => field.line),
      'Lombok 自动生成的 toString 可能输出敏感字段，必须显式排除或避免记录整个对象。',
    )
  }
  addRisk(
    risks,
    'sensitive-field-in-explicit-to-string',
    findSensitiveToStringLines(extractedRecord, sourceLines, sensitiveFields),
    '显式 toString 引用了敏感字段，日志和异常路径可能泄露凭据。',
  )

  if (extractedRecord.declaredTypes.length > 1) {
    addRisk(
      risks,
      'multiple-types-in-one-file',
      extractedRecord.declaredTypes.slice(1).map((type) => type.line),
      '同一文件声明多个模型类型会增加序列化、构造和复用边界的理解成本；现代示例优先使用独立类型或明确的静态成员类型。',
    )
  }
  addRisk(
    risks,
    'non-static-member-model',
    extractedRecord.declaredTypes
      .slice(1)
      .filter((type) => type.owner && !type.modifiers.includes('static'))
      .map((type) => type.line),
    '非 static 成员模型隐式持有外部实例引用，不适合作为独立序列化数据合同。',
  )

  const behaviorMethods = getBehaviorMethods(extractedRecord)
  addRisk(
    risks,
    'behaviorful-data-model',
    behaviorMethods.map((method) => method.line),
    '数据模型包含显式工厂或行为方法；需确认它只维护构造不变量，没有吸收服务编排、I/O 或外部副作用。',
  )

  addRisk(
    risks,
    'raw-collection-field',
    extractedRecord.fields
      .filter((field) => /^(?:Collection|List|Map|Set)$/.test(field.type))
      .map((field) => field.line),
    '集合字段缺少泛型参数，读取方需要不安全强制转换并失去元素类型合同。',
  )

  if (profile.persistence.length > 0) {
    addRisk(
      risks,
      'persistence-annotation-in-transfer-model',
      extractedRecord.annotations
        .filter((annotation) => persistenceAnnotationNames.has(annotation.name))
        .map((annotation) => annotation.line),
      'DTO/VO/BO/EO 模型包含持久化映射注解，传输合同与数据库字段策略发生耦合。',
    )
  }

  if (profile.serialization.length > 1) {
    addRisk(
      risks,
      'mixed-serialization-contract',
      extractedRecord.annotations
        .filter((annotation) => /^(?:Json|JSON|XStream|Xml)/.test(annotation.name))
        .map((annotation) => annotation.line),
      '同一模型混用多套序列化注解，字段命名、忽略规则和兼容策略可能产生分歧。',
    )
  }

  const componentAnnotations = extractedRecord.annotations.filter((annotation) =>
    springComponentAnnotationNames.has(annotation.name),
  )
  addRisk(
    risks,
    'spring-component-model',
    componentAnnotations.map((annotation) => annotation.line),
    '数据模型同时声明 Spring 组件角色，实例生命周期与数据生命周期混在同一类型。',
  )

  const loggingLines = []
  sourceLines.forEach((line, index) => {
    if (/@Slf4j\b|\b(?:log|logger)\.(?:debug|error|info|trace|warn)\s*\(/.test(line)) {
      loggingLines.push(index + 1)
    }
  })
  addRisk(
    risks,
    'logging-inside-model',
    loggingLines,
    '数据模型内部包含日志职责，容易记录完整对象或敏感字段，并使纯数据合同依赖日志框架。',
  )

  addRisk(
    risks,
    'web-validation-coupling-in-model',
    extractedRecord.publicMethods
      .filter((method) => method.parameterTypes.some((type) => type.includes('BindingResult')))
      .map((method) => method.line),
    '响应模型方法直接依赖 Spring BindingResult，Web 校验错误转换与数据合同发生耦合。',
  )

  const primaryType = extractedRecord.declaredTypes[0]
  if (primaryType?.extends.length > 0 && typeAnnotations.has('Data')) {
    addRisk(
      risks,
      'lombok-data-inheritance',
      extractedRecord.annotations
        .filter((annotation) => annotation.site === 'type' && annotation.name === 'Data')
        .map((annotation) => annotation.line),
      '继承模型使用 @Data 自动生成 equals/hashCode/toString，必须明确父类字段是否参与相等性和输出。',
    )
  }
  if (
    primaryType?.extends.length > 0 &&
    (typeAnnotations.has('Builder') || typeAnnotations.has('SuperBuilder'))
  ) {
    addRisk(
      risks,
      'builder-on-inherited-model',
      extractedRecord.annotations
        .filter(
          (annotation) =>
            annotation.site === 'type' && ['Builder', 'SuperBuilder'].includes(annotation.name),
        )
        .map((annotation) => annotation.line),
      '继承模型的 Builder 必须验证父类字段是否进入构建合同；普通 @Builder 不会自动覆盖继承字段。',
    )
  }

  return risks
}

/** 生成覆盖类型、字段、注解和显式方法的源码证据。 */
function buildSourceEvidence(extractedRecord) {
  const rawLines = [
    ...extractedRecord.declaredTypes.map((type) => type.line),
    ...extractedRecord.annotations.map((annotation) => annotation.line),
    ...extractedRecord.fields.map((field) => field.line),
    ...extractedRecord.publicMethods.flatMap((method) => [method.line, method.endLine]),
  ].filter(Number.isInteger)
  const uniqueLines = [...new Set(rawLines)].sort((left, right) => left - right)
  const lines = uniqueLines.length <= 80
    ? uniqueLines
    : [...uniqueLines.slice(0, 40), ...uniqueLines.slice(-40)]
  return [
    {
      lines,
      summary: '类型声明、模型注解、字段和显式公开方法共同证明该文件的数据边界与实现信号。',
    },
  ]
}

/** 建立一条等待独立人工签核的数据模型复核候选记录。 */
function buildReviewRecord(
  file,
  extractedRecord,
  sourceRepository,
  validationEvidence,
  typeIndex,
) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  const frozenLoc = sourceText.match(/\n/g)?.length ?? 0
  if (frozenLoc !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const typeName = extractedRecord.declaredTypes[0]?.name ?? path.basename(file.path, '.java')
  const profile = buildAnnotationProfile(extractedRecord)
  const modelShape = getModelShape(file.path, extractedRecord, profile, validationEvidence)
  const dependencies = buildDependencies(extractedRecord)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewing',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: 'data-model',
    modelFamily: getModelFamily(file.path),
    modelShape,
    roleDetail: buildRoleDetail(typeName, modelShape),
    responsibility: buildResponsibility(typeName, modelShape, extractedRecord),
    boundary: buildBoundary(profile, validationEvidence),
    structure: {
      declaredTypeCount: extractedRecord.declaredTypes.length,
      fieldCount: extractedRecord.fields.length,
      publicMethodCount: extractedRecord.publicMethods.length,
      extends: extractedRecord.declaredTypes[0]?.extends ?? [],
      implements: extractedRecord.declaredTypes[0]?.implements ?? [],
    },
    annotationProfile: profile,
    controllerValidationEvidence: validationEvidence,
    dependencies: dependencies.length > 0 ? dependencies : ['Java 标准库'],
    capabilityCandidates: buildCapabilityCandidates(
      modelShape,
      extractedRecord,
      profile,
      validationEvidence,
    ),
    riskCandidates: buildRisks(
      extractedRecord,
      sourceLines,
      profile,
      validationEvidence,
      typeIndex,
    ),
    sourceEvidence: buildSourceEvidence(extractedRecord),
  }
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  return Object.fromEntries(
    [...records.reduce((counts, record) => {
      const value = record[field]
      counts.set(value, (counts.get(value) ?? 0) + 1)
      return counts
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 统计全部风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

/** 统计注解和结构覆盖情况。 */
function buildSignalSummary(records) {
  return {
    lombokFileCount: records.filter((record) => record.annotationProfile.lombok.length > 0).length,
    validationConstraintFileCount: records.filter(
      (record) => record.annotationProfile.validationConstraints.length > 0,
    ).length,
    directValidatedModelCount: records.filter(
      (record) => record.controllerValidationEvidence.length > 0,
    ).length,
    nestedValidFileCount: records.filter(
      (record) => record.annotationProfile.nestedValidCount > 0,
    ).length,
    swagger2FileCount: records.filter((record) => record.annotationProfile.swagger2.length > 0).length,
    serializationAnnotationFileCount: records.filter(
      (record) => record.annotationProfile.serialization.length > 0,
    ).length,
    persistenceAnnotationFileCount: records.filter(
      (record) => record.annotationProfile.persistence.length > 0,
    ).length,
    inheritedModelCount: records.filter((record) => record.structure.extends.length > 0).length,
    multipleTypeFileCount: records.filter((record) => record.structure.declaredTypeCount > 1).length,
  }
}

/** 为全部风险候选分配连续且唯一的 DM 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `DM-${String(sequence).padStart(4, '0')}`
    }
  }
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

/** 校验人工签核完整绑定当前快照和全部逐文件记录分片。 */
function validateManualSignoff(signoff, shards, records, inventory, extractionManifest) {
  if (signoff.schemaVersion !== 1) throw new Error('数据模型人工签核 schemaVersion 不受支持')
  if (signoff.snapshotId !== inventory.snapshotId) throw new Error('数据模型人工签核 snapshotId 不一致')
  if (signoff.analysisId !== extractionManifest.analysisId) {
    throw new Error('数据模型人工签核 analysisId 不一致')
  }
  if (signoff.batchId !== 'phase-1c-data-model' || signoff.status !== 'approved') {
    throw new Error('数据模型人工签核批次或状态不正确')
  }
  if (!signoff.reviewedBy || !signoff.reviewerType || !signoff.reviewedAt) {
    throw new Error('数据模型人工签核缺少复核身份或时间')
  }
  const approvedShards = signoff.shards.map(({ fileName, fileCount, sha256, decision }) => ({
    fileName,
    fileCount,
    sha256,
    decision,
  }))
  const actualShards = shards.map(({ fileName, fileCount, sha256 }) => ({
    fileName,
    fileCount,
    sha256,
    decision: 'approved',
  }))
  if (JSON.stringify(approvedShards) !== JSON.stringify(actualShards)) {
    throw new Error('数据模型逐文件记录与人工签核分片不一致')
  }
  const approvedFileCount = signoff.shards.reduce((total, shard) => total + shard.fileCount, 0)
  const approvedLoc = records.reduce((total, record) => total + record.loc, 0)
  if (
    signoff.summary.approvedFileCount !== approvedFileCount ||
    approvedFileCount !== records.length ||
    signoff.summary.approvedLoc !== approvedLoc ||
    signoff.summary.approvedShardCount !== shards.length
  ) {
    throw new Error('数据模型人工签核分母不一致')
  }
}

/** 生成 JSONL 分片和批次 manifest 的稳定文本。 */
function buildOutputs(records, inventory, extractionManifest, manualSignoff) {
  const outputs = new Map()
  const shards = []
  for (let offset = 0; offset < records.length; offset += shardSize) {
    const shardRecords = records.slice(offset, offset + shardSize)
    const approvedRecords = shardRecords.map((record) => ({ ...record, auditStatus: 'reviewed' }))
    const fileName = `records-${String(offset + 1).padStart(4, '0')}-${String(offset + shardRecords.length).padStart(4, '0')}.jsonl`
    const content = `${approvedRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
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
  validateManualSignoff(manualSignoff, shards, records, inventory, extractionManifest)
  const riskCandidateCount = records.reduce(
    (total, record) => total + record.riskCandidates.length,
    0,
  )
  const reviewedFileCount = previouslyReviewedFileCount + records.length
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-data-model',
    status: 'completed',
    reviewedAt: manualSignoff.reviewedAt,
    manualReviewSignoff: {
      path: 'reviews/phase-1c-data-model-signoff.json',
      sha256: sha256(fs.readFileSync(manualSignoffPath)),
      reviewedBy: manualSignoff.reviewedBy,
      reviewerType: manualSignoff.reviewerType,
      approvedShardCount: manualSignoff.shards.length,
    },
    batchScope: {
      roots: ['bo', 'dto', 'eo', 'vo'],
      javaInventoryIndexRanges: buildInventoryIndexRanges(records),
    },
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      modelShape:
        'business-transfer-model | external-contract-model | query-filter-model | request-input-model | resource-wrapper-model | response-envelope-model | response-view-model | transfer-model',
      validationBoundary:
        'constraint declaration and @Valid/@Validated trigger evidence are recorded separately',
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
      modelFamilyCounts: countBy(records, 'modelFamily'),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      modelShapeCounts: countBy(records, 'modelShape'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      signals: buildSignalSummary(records),
      riskCandidateCount,
      riskCategoryCounts: countRiskCategories(records),
      currentAuditStatusCounts: {
        unreviewed: inventory.summary.total.fileCount - reviewedFileCount,
        reviewing: 0,
        reviewed: reviewedFileCount,
        blocked: 0,
      },
    },
    shards,
  }
  outputs.set(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return outputs
}

/** 写入输出，或在 check 模式逐字节验证现有产物。 */
function emitOutputs(outputs, check) {
  if (!check) fs.mkdirSync(outputDirectory, { recursive: true })
  for (const [filePath, content] of outputs) {
    if (check) {
      if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
        throw new Error(`第 5 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
      continue
    }
    fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 5 批数据模型台账。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const manualSignoff = readJson(manualSignoffPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const files = inventory.files.filter(isDataModelBatchFile)
  const extractedRecords = files.map((file) => {
    const record = extractedByPath.get(file.path)
    if (!record) throw new Error(`${file.path} 缺少 Phase 1B 记录`)
    return record
  })
  const validationByPath = buildControllerValidationIndex(
    options.sourceRepository,
    extractedByPath,
    extractedRecords,
  )
  const typeIndex = buildPrimaryTypeIndex(extractedRecords)
  const records = files.map((file, index) =>
    buildReviewRecord(
      file,
      extractedRecords[index],
      options.sourceRepository,
      validationByPath.get(file.path),
      typeIndex,
    ),
  )
  assignRiskIds(records)
  const outputs = buildOutputs(records, inventory, extractionManifest, manualSignoff)
  emitOutputs(outputs, options.check)
  const manifest = JSON.parse(outputs.get(outputManifestPath))
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.check ? 'check' : 'write',
      batchId: manifest.batchId,
      batchFileCount: manifest.summary.batchFileCount,
      batchLoc: manifest.summary.batchLoc,
      modelShapeCounts: manifest.summary.modelShapeCounts,
      signalSummary: manifest.summary.signals,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
    }),
  )
}

main()
