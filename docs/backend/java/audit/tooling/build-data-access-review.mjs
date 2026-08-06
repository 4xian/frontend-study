import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { XMLParser } from 'fast-xml-parser'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-data-access')
const outputDirectory = process.env.DZZZ_DATA_ACCESS_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_DATA_ACCESS_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const mapperDirectory = 'dzzz-app/src/main/java/com/tdh/bdzz/dao'
const shardSize = 50
const batchReviewedAt = '2026-08-03T23:22:47.000Z'
const previouslyReviewedFileCount = 522
const statementAnnotationNames = new Set(['Delete', 'Insert', 'Select', 'Update'])
const dynamicXmlElementNames = new Set([
  'bind',
  'choose',
  'foreach',
  'if',
  'include',
  'otherwise',
  'set',
  'trim',
  'when',
  'where',
])
const credentialFieldName = /^(?:ak|sk)$|(?:accesskey|password|passwd|pwd|secret|secretkey|token)$/i
const xmlParser = new XMLParser({
  allowBooleanAttributes: false,
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  processEntities: false,
})

const frameworkNames = {
  lombok: 'Lombok',
  mybatis: 'MyBatis',
  'mybatis-plus': 'MyBatis-Plus',
  'spring-core': 'Spring Core',
  'xml-jaxb': 'JAXB',
}

const ignoredDependencyTypes = new Set([
  'boolean',
  'byte',
  'byte[]',
  'char',
  'double',
  'float',
  'int',
  'Integer',
  'long',
  'Long',
  'Object',
  'String',
  'String[]',
  'void',
])

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本或字节内容的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 将平台路径分隔符统一为仓库路径分隔符。 */
function normalizePath(filePath) {
  return filePath.split(path.sep).join('/')
}

/** 判断 Java 文件是否承载包级元数据。 */
function isPackageInfoFile(filePath) {
  return path.basename(filePath) === 'package-info.java'
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

/** 判断冻结 Java 文件是否属于第 4 批物理范围。 */
function isDataAccessBatchFile(file) {
  return /^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/(?:dao|po)\/.*\.java$/.test(file.path)
}

/** 递归列出目录中的全部文件。 */
function listFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    })
    .sort((left, right) => left.localeCompare(right))
}

/** 将单值或数组统一为数组。 */
function toArray(value) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** 转义即将插入正则表达式的字面文本。 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 返回源码中匹配表达式的行号。 */
function findLines(lines, expression) {
  const matches = []
  lines.forEach((line, index) => {
    expression.lastIndex = 0
    if (expression.test(line)) matches.push(index + 1)
  })
  return matches
}

/** 返回 XML statement 元素的源码行号。 */
function findXmlStatementLine(lines, kind, id) {
  const expression = new RegExp(`<${kind}\\b[^>]*\\bid\\s*=\\s*["']${escapeRegExp(id)}["']`, 'i')
  return findLines(lines, expression)[0]
}

/** 递归统计 Mapper XML 中的动态 SQL 元素。 */
function countDynamicXmlElements(value, counts = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item) => countDynamicXmlElements(item, counts))
    return counts
  }
  if (!value || typeof value !== 'object') return counts
  for (const [key, child] of Object.entries(value)) {
    if (dynamicXmlElementNames.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + toArray(child).length)
    }
    countDynamicXmlElements(child, counts)
  }
  return counts
}

/** 解析并冻结一份 Mapper XML 的结构与哈希。 */
function buildXmlMapping(filePath, sourceRepository) {
  const sourceBuffer = fs.readFileSync(filePath)
  const sourceText = sourceBuffer.toString('utf8')
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const parsed = xmlParser.parse(sourceText)
  const mapper = parsed.mapper
  if (!mapper || typeof mapper !== 'object') {
    throw new Error(`${filePath} 不是 MyBatis Mapper XML`)
  }
  const statements = ['select', 'insert', 'update', 'delete'].flatMap((kind) =>
    toArray(mapper[kind]).map((statement) => {
      const id = statement?.['@_id']
      if (typeof id !== 'string' || !id) throw new Error(`${filePath} 的 ${kind} 缺少 id`)
      const line = findXmlStatementLine(sourceLines, kind, id)
      if (!line) throw new Error(`${filePath} 无法定位 statement ${id}`)
      return {
        id,
        kind,
        line,
        parameterType: statement['@_parameterType'] ?? null,
        resultType: statement['@_resultType'] ?? null,
      }
    }),
  )
  const resultMaps = toArray(mapper.resultMap).map((resultMap) => ({
    id: resultMap?.['@_id'] ?? null,
    type: resultMap?.['@_type'] ?? null,
  }))
  const dynamicElementCounts = Object.fromEntries(
    [...countDynamicXmlElements(mapper).entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  )
  return {
    path: normalizePath(path.relative(sourceRepository, filePath)),
    sourceSha256: sha256(sourceBuffer),
    loc: sourceText.match(/\n/g)?.length ?? 0,
    namespace: mapper['@_namespace'] ?? null,
    mapperLine: findLines(sourceLines, /<mapper\b/i)[0] ?? 1,
    statements,
    resultMaps,
    dynamicElementCounts,
    rawSubstitutionLines: findLines(sourceLines, /\$\{/),
    selectStarLines: findLines(sourceLines, /\bselect\s+\*/i),
  }
}

/** 发现并解析第 4 批全部 Mapper XML。 */
function buildXmlMappings(sourceRepository) {
  const directory = path.join(sourceRepository, mapperDirectory)
  return listFiles(directory)
    .filter((filePath) => filePath.endsWith('.xml'))
    .map((filePath) => buildXmlMapping(filePath, sourceRepository))
}

/** 返回类型上的全部注解名。 */
function getTypeAnnotationNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter((annotation) => annotation.site === 'type')
      .map((annotation) => annotation.name),
  )
}

/** 根据真实声明和映射注解确认数据访问形态。 */
function getDataAccessShape(filePath, extractedRecord) {
  if (filePath.includes('/dao/')) {
    return extractedRecord.declaredTypes[0]?.kind === 'interface'
      ? 'mapper-contract'
      : 'managed-persistence-service'
  }
  if (/\/po\/vidyo\/(?:admin|client|replay)\//.test(filePath)) {
    return 'generated-xml-model'
  }
  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  return typeAnnotations.has('TableName') ? 'persistence-model' : 'support-data-model'
}

/** 返回人工确认后的主角色。 */
function getFinalRole(dataAccessShape) {
  if (['mapper-contract', 'managed-persistence-service'].includes(dataAccessShape)) {
    return 'data-access'
  }
  if (dataAccessShape === 'persistence-model') return 'persistence-model'
  return 'data-model'
}

/** 返回公开方法对应的 statement 注解方法名。 */
function getAnnotationStatementMethodNames(extractedRecord) {
  return new Set(
    extractedRecord.annotations
      .filter(
        (annotation) =>
          annotation.site === 'method' && statementAnnotationNames.has(annotation.name),
      )
      .map((annotation) => annotation.target.match(/#([^ (]+)\(/)?.[1])
      .filter(Boolean),
  )
}

/** 根据 Java 与 XML 证据计算显式方法绑定。 */
function buildStatementBindings(dataAccessShape, extractedRecord, xmlMapping) {
  if (dataAccessShape !== 'mapper-contract') {
    return {
      declaredMethodCount: 0,
      annotationMappedMethodCount: 0,
      xmlMappedMethodCount: 0,
      customInjectorMethodCount: 0,
      unresolvedMethods: [],
      xmlStatementsWithoutDeclaredMethod: [],
    }
  }
  const annotationMethods = getAnnotationStatementMethodNames(extractedRecord)
  const xmlMethods = new Set(xmlMapping?.statements.map((statement) => statement.id) ?? [])
  const methodNames = extractedRecord.publicMethods.map((method) => method.name)
  const customInjectorMethods = new Set(
    extractedRecord.path.endsWith('/EasyBaseMapper.java') ? ['insertBatchSomeColumn'] : [],
  )
  const bindings = methodNames.map((methodName) => {
    const sources = []
    if (annotationMethods.has(methodName)) sources.push('java-annotation')
    if (xmlMethods.has(methodName)) sources.push('mapper-xml')
    if (customInjectorMethods.has(methodName)) sources.push('mybatis-plus-sql-injector')
    return { methodName, sources }
  })
  const declaredMethodNames = new Set(methodNames)
  return {
    declaredMethodCount: bindings.length,
    annotationMappedMethodCount: bindings.filter((binding) =>
      binding.sources.includes('java-annotation'),
    ).length,
    xmlMappedMethodCount: bindings.filter((binding) => binding.sources.includes('mapper-xml'))
      .length,
    customInjectorMethodCount: bindings.filter((binding) =>
      binding.sources.includes('mybatis-plus-sql-injector'),
    ).length,
    unresolvedMethods: bindings
      .filter((binding) => binding.sources.length === 0)
      .map((binding) => binding.methodName),
    xmlStatementsWithoutDeclaredMethod: (xmlMapping?.statements ?? [])
      .filter((statement) => !declaredMethodNames.has(statement.id))
      .map((statement) => statement.id),
  }
}

/** 根据数据访问形态和 SQL 位置生成映射模式。 */
function getMappingMode(dataAccessShape, extractedRecord, xmlMapping, statementBindings) {
  if (dataAccessShape === 'managed-persistence-service') return 'mybatis-plus-service-impl'
  if (dataAccessShape === 'persistence-model') return 'mybatis-plus-entity'
  if (dataAccessShape === 'support-data-model') return 'plain-data-object'
  if (dataAccessShape === 'generated-xml-model') return 'jaxb-generated-model'
  if (extractedRecord.path.endsWith('/EasyBaseMapper.java')) return 'custom-sql-injector-contract'
  const hasAnnotations = statementBindings.annotationMappedMethodCount > 0
  const hasXml = Boolean(xmlMapping)
  if (hasAnnotations && hasXml) return 'java-annotation-and-mapper-xml'
  if (hasAnnotations) return 'java-annotation-sql'
  if (hasXml) return 'mapper-xml'
  if (statementBindings.unresolvedMethods.length > 0) return 'unresolved-custom-statements'
  return 'mybatis-plus-base-mapper'
}

/** 从 Mapper 或 ServiceImpl 泛型中提取主要映射类型。 */
function getMappedType(extractedRecord) {
  const parentTypes = extractedRecord.declaredTypes[0]?.extends ?? []
  for (const parentType of parentTypes) {
    const serviceMatch = parentType.match(/^ServiceImpl<[^,]+,(.+)>$/)
    if (serviceMatch) return serviceMatch[1]
    const mapperMatch = parentType.match(/^(?:Easy)?BaseMapper<(.+)>$/)
    if (mapperMatch) return mapperMatch[1]
  }
  return null
}

/** 判断类型是否值得作为主要依赖展示。 */
function isRelevantDependency(typeName) {
  if (!typeName || ignoredDependencyTypes.has(typeName)) return false
  if (/^[A-Z]$/.test(typeName)) return false
  return !/^(?:List|Map|Set|Collection)(?:<.*>)?$/.test(typeName)
}

/** 汇总框架、泛型父类型、字段和方法边界依赖。 */
function buildDependencies(extractedRecord) {
  const signatureTypes = extractedRecord.publicMethods.flatMap((method) => [
    method.returnType,
    ...method.parameterTypes,
  ])
  const dependencies = [
    ...extractedRecord.frameworkUsages.map((usage) => frameworkNames[usage.id] ?? usage.id),
    ...(extractedRecord.declaredTypes[0]?.extends ?? []),
    ...extractedRecord.fields.map((field) => field.type),
    ...signatureTypes,
  ].filter(isRelevantDependency)
  return [...new Set(dependencies)].slice(0, 12)
}

/** 生成可核对的角色说明。 */
function buildRoleDetail(typeName, dataAccessShape) {
  if (typeName === 'package-info') return 'package-info.java 包级 XML Schema 元数据'
  const descriptions = {
    'generated-xml-model': `${typeName} JAXB/JAX-WS 生成模型`,
    'managed-persistence-service': `${typeName} Spring 托管的 MyBatis-Plus 持久化服务`,
    'mapper-contract': `${typeName} MyBatis Mapper 接口合同`,
    'persistence-model': `${typeName} MyBatis-Plus 持久化模型`,
    'support-data-model': `${typeName} 普通存储连接数据模型`,
  }
  return descriptions[dataAccessShape]
}

/** 生成主要职责说明。 */
function buildResponsibility(typeName, dataAccessShape, extractedRecord, xmlMapping) {
  if (dataAccessShape === 'mapper-contract') {
    const methodCount = extractedRecord.publicMethods.length
    const xmlText = xmlMapping ? `，并由 ${xmlMapping.path} 提供部分 statement` : ''
    return `${typeName} 声明 ${methodCount} 个显式数据访问方法${xmlText}；继承的 BaseMapper 方法由 MyBatis-Plus 注入。`
  }
  if (dataAccessShape === 'managed-persistence-service') {
    return `${typeName} 继承 ServiceImpl，复用指定 Mapper 与实体类型的通用持久化操作。`
  }
  if (dataAccessShape === 'persistence-model') {
    return `${typeName} 通过表、主键或字段注解描述 Java 字段与数据库列之间的映射。`
  }
  if (dataAccessShape === 'support-data-model') {
    return `${typeName} 承载存储连接或调用参数，不声明数据库表映射，不能仅因位于 po 目录而视为实体。`
  }
  if (typeName === 'package-info') {
    return '该 package-info.java 声明生成包的 XML Schema 命名空间，不定义可实例化的数据类型。'
  }
  return `${typeName} 承载外部 Vidyo SOAP/XML 合同数据，属于生成的传输模型而不是数据库实体。`
}

/** 生成准确区分代理、实体和生成模型的生命周期说明。 */
function buildLifecycle(dataAccessShape) {
  if (dataAccessShape === 'mapper-contract') {
    return '这是 Java 接口而不是手写实现；MapperScannerConfigurer 扫描 com.tdh.bdzz.dao 后，由 MyBatis 创建代理并注册为 Spring Bean。'
  }
  if (dataAccessShape === 'managed-persistence-service') {
    return 'Spring 通过 @Service 创建该对象；通用持久化方法由继承的 ServiceImpl 提供，并通过注入的 Mapper 代理执行。'
  }
  if (dataAccessShape === 'persistence-model') {
    return '这是普通持久化对象，不是 Spring Bean；业务代码或 MyBatis 创建实例，并按映射元数据读写字段。'
  }
  if (dataAccessShape === 'support-data-model') {
    return '这是普通数据对象，不是 Spring Bean，也没有表映射；调用方直接创建并传递实例。'
  }
  return '这是 JAXB/JAX-WS 生成的普通类型或包级元数据，不是 Spring Bean；应由生成流程维护，协议变化时重新生成而不是手工扩展。'
}

/** 依据形态、注解、SQL 与泛型生成后续能力候选。 */
function buildCapabilityCandidates(
  dataAccessShape,
  extractedRecord,
  xmlMapping,
  statementBindings,
) {
  const annotationNames = new Set(extractedRecord.annotations.map((annotation) => annotation.name))
  const capabilities = []
  if (dataAccessShape === 'mapper-contract') {
    capabilities.push('Java 接口', 'MyBatis Mapper 代理', 'Mapper 包扫描')
    if (getMappedType(extractedRecord)) capabilities.push('MyBatis-Plus BaseMapper 泛型')
    if (statementBindings.annotationMappedMethodCount > 0) capabilities.push('注解 SQL')
    if (xmlMapping) capabilities.push('Mapper XML', 'namespace 与 statement 绑定')
    if (annotationNames.has('Param')) capabilities.push('@Param 参数命名')
    if (
      extractedRecord.publicMethods.some((method) =>
        /(?:^|<|,)I?Page(?:<|,|>|$)/.test(method.returnType),
      )
    ) {
      capabilities.push('MyBatis-Plus 分页')
    }
  }
  if (dataAccessShape === 'managed-persistence-service') {
    capabilities.push('Spring @Service', 'ServiceImpl 泛型', '通用持久化服务')
  }
  if (dataAccessShape === 'persistence-model') {
    capabilities.push('持久化对象', '@TableName', 'Java 与数据库类型映射')
    if (annotationNames.has('TableId')) capabilities.push('@TableId 主键映射')
    if (annotationNames.has('TableField')) capabilities.push('@TableField 字段映射')
    if (extractedRecord.frameworkUsages.some((usage) => usage.id === 'lombok')) {
      capabilities.push('Lombok 数据模型')
    }
  }
  if (dataAccessShape === 'support-data-model') {
    capabilities.push('普通 Java 数据对象', '对象边界', '敏感字段处理')
  }
  if (dataAccessShape === 'generated-xml-model') {
    capabilities.push('生成代码边界', 'JAXB XML 绑定')
    if (annotationNames.has('WebService')) capabilities.push('JAX-WS 服务合同')
    if (annotationNames.has('XmlEnum')) capabilities.push('XML 枚举映射')
  }
  return [...new Set(capabilities)]
}

/** 添加一条带精确证据来源的风险候选。 */
function addRisk(risks, category, sourcePath, lines, summary) {
  const validLines = [...new Set(lines)].sort((left, right) => left - right)
  if (validLines.length === 0) return
  risks.push({ category, sourcePath, lines: validLines, summary })
}

/** 生成 Java 与 Mapper XML 中可验证的数据访问风险候选。 */
function buildRisks(file, extractedRecord, sourceLines, dataAccessShape, xmlMapping, bindings) {
  const risks = []
  if (dataAccessShape === 'mapper-contract') {
    addRisk(
      risks,
      'raw-sql-substitution',
      file.path,
      findLines(sourceLines, /\$\{/),
      'SQL 使用 ${...} 进行原始文本替换；动态表名或列名必须来自严格白名单，普通值必须使用参数绑定。',
    )
    addRisk(
      risks,
      'untyped-map-result',
      file.path,
      extractedRecord.publicMethods
        .filter((method) => /(?:^|<|,)Map</.test(method.returnType))
        .map((method) => method.line),
      '公开 Mapper 方法返回 Map 投影，字段名和类型缺少编译期合同；稳定查询应使用明确投影类型。',
    )
    addRisk(
      risks,
      'raw-page-type',
      file.path,
      extractedRecord.publicMethods
        .filter((method) => method.parameterTypes.some((typeName) => typeName === 'Page'))
        .map((method) => method.line),
      '分页参数使用原始 Page 类型，丢失记录类型信息；现代示例应使用带泛型的分页合同。',
    )
    if (file.loc > 200) {
      addRisk(
        risks,
        'oversized-mapper-contract',
        file.path,
        [extractedRecord.declaredTypes[0]?.line ?? 1],
        `该 Mapper 接口达到 ${file.loc} LOC，查询职责和投影边界需要按用例拆分。`,
      )
    }
    if (xmlMapping) {
      addRisk(
        risks,
        'mapper-xml-under-java-sources',
        xmlMapping.path,
        [xmlMapping.mapperLine],
        'Mapper XML 与 Java 源码同目录并依赖 Maven 额外复制规则；现代布局应放在资源目录并显式验证打包结果。',
      )
      addRisk(
        risks,
        'raw-sql-substitution',
        xmlMapping.path,
        xmlMapping.rawSubstitutionLines,
        'Mapper XML 使用 ${...} 原始替换，必须限制为经过白名单验证的标识符。',
      )
      addRisk(
        risks,
        'select-star',
        xmlMapping.path,
        xmlMapping.selectStarLines,
        '查询使用 SELECT *，结果合同会随表结构变化；稳定映射应显式列出所需列。',
      )
      const orphanLines = xmlMapping.statements
        .filter((statement) => bindings.xmlStatementsWithoutDeclaredMethod.includes(statement.id))
        .map((statement) => statement.line)
      addRisk(
        risks,
        'xml-statement-without-declared-method',
        xmlMapping.path,
        orphanLines,
        'Mapper XML statement id 没有对应的当前 Java 接口方法，需确认是否为遗留映射。',
      )
    }
    addRisk(
      risks,
      'select-star',
      file.path,
      findLines(sourceLines, /\bselect\s+\*/i),
      '注解查询使用 SELECT *，结果合同会随表结构变化；稳定映射应显式列出所需列。',
    )
    addRisk(
      risks,
      'unresolved-statement-binding',
      file.path,
      extractedRecord.publicMethods
        .filter((method) => bindings.unresolvedMethods.includes(method.name))
        .map((method) => method.line),
      '自定义 Mapper 方法没有找到注解 SQL、同 namespace XML statement 或已确认的 SQL Injector 绑定。',
    )
    const methodCounts = new Map()
    for (const method of extractedRecord.publicMethods) {
      methodCounts.set(method.name, (methodCounts.get(method.name) ?? 0) + 1)
    }
    addRisk(
      risks,
      'overloaded-mapper-method',
      file.path,
      extractedRecord.publicMethods
        .filter((method) => (methodCounts.get(method.name) ?? 0) > 1)
        .map((method) => method.line),
      'Mapper 接口存在同名重载方法，而 MyBatis statement id 只按方法名绑定，需改为唯一方法名。',
    )
  }

  const typeAnnotations = getTypeAnnotationNames(extractedRecord)
  if (['persistence-model', 'support-data-model'].includes(dataAccessShape)) {
    const exposesToString = typeAnnotations.has('Data') || typeAnnotations.has('ToString')
    addRisk(
      risks,
      'credential-in-generated-to-string',
      file.path,
      exposesToString
        ? extractedRecord.fields
            .filter((field) => credentialFieldName.test(field.name))
            .map((field) => field.line)
        : [],
      'Lombok 生成的 toString 可能输出密码或访问凭据；应排除敏感字段并禁止记录凭据对象。',
    )
  }
  return risks
}

/** 生成覆盖类型、映射注解、方法与 XML statement 的源码证据。 */
function buildSourceEvidence(file, extractedRecord, dataAccessShape, xmlMapping) {
  if (isPackageInfoFile(file.path)) {
    return [
      {
        sourcePath: file.path,
        lines: [1],
        summary: '第 1 行包级 @XmlSchema 注解证明该文件声明生成包的 XML Schema 元数据。',
      },
    ]
  }
  const annotationLines = extractedRecord.annotations
    .filter((annotation) =>
      [
        'Delete',
        'Insert',
        'Mapper',
        'Param',
        'Select',
        'Service',
        'TableField',
        'TableId',
        'TableName',
        'Update',
        'WebService',
        'XmlRootElement',
        'XmlSchema',
        'XmlType',
        'javax.xml.bind.annotation.XmlSchema',
      ].includes(annotation.name),
    )
    .map((annotation) => annotation.line)
  const methodLines = extractedRecord.publicMethods.flatMap((method) => [
    method.line,
    method.endLine,
  ])
  const javaLines = [
    extractedRecord.declaredTypes[0]?.line,
    ...annotationLines,
    ...methodLines,
  ].filter(Number.isInteger)
  if (javaLines.length === 0) javaLines.push(1)
  const uniqueJavaLines = [...new Set(javaLines)].sort((left, right) => left - right)
  const selectedJavaLines =
    uniqueJavaLines.length <= 80
      ? uniqueJavaLines
      : [...uniqueJavaLines.slice(0, 40), ...uniqueJavaLines.slice(-40)]
  const evidence = [
    {
      sourcePath: file.path,
      lines: selectedJavaLines,
      summary: `类型、注解和公开方法共同证明该文件属于 ${dataAccessShape} 形态。`,
    },
  ]
  if (xmlMapping) {
    evidence.push({
      sourcePath: xmlMapping.path,
      lines: [
        ...new Set([
          xmlMapping.mapperLine,
          ...xmlMapping.statements.map((statement) => statement.line),
        ]),
      ].sort((left, right) => left - right),
      summary: 'mapper 根元素、namespace 和 statement id 共同证明 XML 与 Java Mapper 的绑定。',
    })
  }
  return evidence
}

/** 建立一条数据访问人工复核台账记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository, xmlByNamespace) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceBuffer = fs.readFileSync(sourcePath)
  if (sha256(sourceBuffer) !== file.sha256) throw new Error(`${file.path} SHA-256 已漂移`)
  const sourceText = sourceBuffer.toString('utf8')
  const frozenLoc = sourceText.match(/\n/g)?.length ?? 0
  if (frozenLoc !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const sourceLines = sourceText.split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  const typeName = isPackageInfoFile(file.path)
    ? 'package-info'
    : (extractedRecord.declaredTypes[0]?.name ?? path.basename(file.path, '.java'))
  const qualifiedName = extractedRecord.declaredTypes[0]?.qualifiedName
  const xmlMapping = qualifiedName ? (xmlByNamespace.get(qualifiedName) ?? null) : null
  const dataAccessShape = getDataAccessShape(file.path, extractedRecord)
  const statementBindings = buildStatementBindings(dataAccessShape, extractedRecord, xmlMapping)
  const dependencies = buildDependencies(extractedRecord)
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewed',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: getFinalRole(dataAccessShape),
    dataAccessShape,
    mappingMode: getMappingMode(dataAccessShape, extractedRecord, xmlMapping, statementBindings),
    mappedType: getMappedType(extractedRecord),
    roleDetail: buildRoleDetail(typeName, dataAccessShape),
    responsibility: buildResponsibility(typeName, dataAccessShape, extractedRecord, xmlMapping),
    lifecycle: buildLifecycle(dataAccessShape),
    dependencies: dependencies.length > 0 ? dependencies : ['Java 标准库'],
    capabilityCandidates: buildCapabilityCandidates(
      dataAccessShape,
      extractedRecord,
      xmlMapping,
      statementBindings,
    ),
    statementBindings,
    mapperXml: xmlMapping,
    riskCandidates: buildRisks(
      file,
      extractedRecord,
      sourceLines,
      dataAccessShape,
      xmlMapping,
      statementBindings,
    ),
    sourceEvidence: buildSourceEvidence(file, extractedRecord, dataAccessShape, xmlMapping),
  }
}

/** 统计记录中指定字段的值。 */
function countBy(records, field) {
  return Object.fromEntries(
    [
      ...records
        .reduce((counts, record) => {
          const value = record[field]
          counts.set(value, (counts.get(value) ?? 0) + 1)
          return counts
        }, new Map())
        .entries(),
    ].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 统计全部风险候选类别。 */
function countRiskCategories(records) {
  const counts = new Map()
  for (const risk of records.flatMap((record) => record.riskCandidates)) {
    counts.set(risk.category, (counts.get(risk.category) ?? 0) + 1)
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 汇总全部 Mapper 方法绑定计数。 */
function sumStatementBindings(records) {
  const fields = [
    'declaredMethodCount',
    'annotationMappedMethodCount',
    'xmlMappedMethodCount',
    'customInjectorMethodCount',
  ]
  return Object.fromEntries(
    fields.map((field) => [
      field,
      records.reduce((total, record) => total + record.statementBindings[field], 0),
    ]),
  )
}

/** 汇总 Mapper XML 动态元素计数。 */
function sumDynamicXmlElements(xmlMappings) {
  const counts = new Map()
  for (const mapping of xmlMappings) {
    for (const [name, count] of Object.entries(mapping.dynamicElementCounts)) {
      counts.set(name, (counts.get(name) ?? 0) + count)
    }
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )
}

/** 为全部风险候选分配连续且唯一的 DA 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `DA-${String(sequence).padStart(3, '0')}`
    }
  }
}

/** 生成 JSONL 分片和批次 manifest 的稳定文本。 */
function buildOutputs(records, xmlMappings, inventory, extractionManifest, generatedAt) {
  const outputs = new Map()
  const shards = []
  for (let offset = 0; offset < records.length; offset += shardSize) {
    const shardRecords = records.slice(offset, offset + shardSize)
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
  const reviewedFileCount = previouslyReviewedFileCount + records.length
  const riskCandidateCount = records.reduce(
    (total, record) => total + record.riskCandidates.length,
    0,
  )
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-data-access',
    status: 'completed',
    reviewedAt: generatedAt,
    recordContract: {
      format: 'JSON Lines; one manually reviewed Java file record per line',
      riskStatus:
        'candidate for later capability or rejected-pattern normalization; not a defect verdict',
      dataAccessShape:
        'mapper-contract | managed-persistence-service | persistence-model | support-data-model | generated-xml-model',
      mapperXml:
        'Mapper XML is supporting evidence outside the 3436 Java-file denominator; each file is hashed and bound by namespace',
    },
    batchScope: {
      javaInventoryIndexRanges: [
        [261, 394],
        [1174, 1751],
      ],
      mapperXmlRoot: mapperDirectory,
    },
    mapperXmlSummary: {
      fileCount: xmlMappings.length,
      loc: xmlMappings.reduce((total, mapping) => total + mapping.loc, 0),
      statementCount: xmlMappings.reduce((total, mapping) => total + mapping.statements.length, 0),
      resultMapCount: xmlMappings.reduce((total, mapping) => total + mapping.resultMaps.length, 0),
      dynamicElementCounts: sumDynamicXmlElements(xmlMappings),
      files: xmlMappings,
    },
    summary: {
      batchFileCount: records.length,
      batchLoc: records.reduce((total, record) => total + record.loc, 0),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      dataAccessShapeCounts: countBy(records, 'dataAccessShape'),
      mappingModeCounts: countBy(records, 'mappingMode'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      statementBindingCounts: sumStatementBindings(records),
      unresolvedMethodCount: records.reduce(
        (total, record) => total + record.statementBindings.unresolvedMethods.length,
        0,
      ),
      xmlStatementWithoutDeclaredMethodCount: records.reduce(
        (total, record) =>
          total + record.statementBindings.xmlStatementsWithoutDeclaredMethod.length,
        0,
      ),
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
        throw new Error(`第 4 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
      continue
    }
    fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 4 批数据访问台账。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const xmlMappings = buildXmlMappings(options.sourceRepository)
  const xmlByNamespace = new Map()
  for (const mapping of xmlMappings) {
    if (!mapping.namespace) throw new Error(`${mapping.path} 缺少 mapper namespace`)
    if (xmlByNamespace.has(mapping.namespace)) {
      throw new Error(`Mapper XML namespace 重复：${mapping.namespace}`)
    }
    xmlByNamespace.set(mapping.namespace, mapping)
  }
  const files = inventory.files.filter(isDataAccessBatchFile)
  const records = files.map((file) => {
    const extractedRecord = extractedByPath.get(file.path)
    if (!extractedRecord) throw new Error(`${file.path} 缺少 Phase 1B 记录`)
    return buildReviewRecord(file, extractedRecord, options.sourceRepository, xmlByNamespace)
  })
  const mapperQualifiedNames = new Set(
    records
      .filter((record) => record.dataAccessShape === 'mapper-contract')
      .map((record) => extractedByPath.get(record.path)?.declaredTypes[0]?.qualifiedName)
      .filter(Boolean),
  )
  for (const namespace of xmlByNamespace.keys()) {
    if (!mapperQualifiedNames.has(namespace)) {
      throw new Error(`Mapper XML namespace 没有对应的 Java Mapper：${namespace}`)
    }
  }
  assignRiskIds(records)
  const outputs = buildOutputs(records, xmlMappings, inventory, extractionManifest, batchReviewedAt)
  emitOutputs(outputs, options.check)
  const manifest = JSON.parse(outputs.get(outputManifestPath))
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.check ? 'check' : 'write',
      batchId: manifest.batchId,
      batchFileCount: manifest.summary.batchFileCount,
      batchLoc: manifest.summary.batchLoc,
      mapperXmlFileCount: manifest.mapperXmlSummary.fileCount,
      dataAccessShapeCounts: manifest.summary.dataAccessShapeCounts,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
    }),
  )
}

main()
