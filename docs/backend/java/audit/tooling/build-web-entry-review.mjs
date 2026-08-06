import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(toolingDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const extractionManifestPath = path.join(auditDirectory, 'extracted', 'manifest.json')
const defaultOutputDirectory = path.join(auditDirectory, 'reviews', 'phase-1c-web-entry')
const outputDirectory = process.env.DZZZ_WEB_REVIEW_DIRECTORY
  ? path.resolve(process.env.DZZZ_WEB_REVIEW_DIRECTORY)
  : defaultOutputDirectory
const outputManifestPath = path.join(outputDirectory, 'manifest.json')
const defaultSourceRepository = '/Users/jian/Desktop/work/TDH/dzzz'
const shardSize = 50
const batchReviewedAt = '2026-08-03T15:16:20.716Z'

const frameworkNames = {
  'bean-validation': 'Bean Validation',
  fastjson: 'Fastjson',
  jackson: 'Jackson',
  lombok: 'Lombok',
  'mybatis-plus': 'MyBatis-Plus',
  mybatis: 'MyBatis',
  servlet: 'Servlet API',
  'spring-boot': 'Spring Boot',
  'spring-core': 'Spring Core',
  'spring-mvc': 'Spring MVC',
  'swagger-2': 'Swagger 2',
}

const ignoredDependencyTypes = new Set([
  'boolean',
  'byte[]',
  'int',
  'long',
  'Logger',
  'Map<String,String[]>',
  'Pattern',
  'String',
])

const specificRisks = {
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/DmxCallBackController.java': [
    ['empty-web-entry', [13, 14, 15], '只声明了 Controller 和基路径，没有任何处理方法，不能把占位类当成可用回调接口。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/FybController.java': [
    ['sensitive-log', [42], '账号密码登录日志把口令字段作为用户标识输出，必须按秘密字段处理。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/GenTokenController.java': [
    ['sensitive-log', [82, 93], '生成 token 的完整入参与返回对象进入日志，可能暴露身份信息或令牌。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/LoginController.java': [
    ['sensitive-log', [145], '修改密码请求对象被完整序列化到日志，可能暴露旧密码和新密码。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/TokenController.java': [
    ['hard-coded-secret', [42, 49, 56, 63, 67], '多个客户端共享密钥硬编码在源码中，不能作为现代令牌颁发示例。'],
    ['anonymous-token-endpoint', [113, 115, 116], '令牌颁发入口匿名开放，必须依赖独立且可轮换的客户端认证和限流。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/TsFileSignController.java': [
    ['hard-coded-secret', [740], '调用令牌接口时再次硬编码客户端密钥，扩大秘密复制与泄露面。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/ViewController.java': [
    ['dynamic-view-name', [31, 32, 44, 45], '路径变量参与视图名选择，课程示例应使用明确白名单，避免任意模板名解析。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/appFront/FrontLoginController.java': [
    ['sensitive-log', [64], '登录请求对象被完整写入日志，需显式排除口令和身份凭据。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsSignatureController.java': [
    ['trusted-identity-header', [37, 41, 55, 59], '直接把 username 请求头当作签名操作身份，必须由可信认证上下文提供主体。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/controller/PdfjsStampController.java': [
    ['disabled-upload-route', [38, 39], '上传方法的映射被注释，当前不是可达 HTTP 入口，不能按已启用能力教学。'],
    ['trusted-identity-header', [40, 54, 66, 71], '直接把 username 请求头当作邮戳操作身份，必须由可信认证上下文提供主体。'],
    ['unrestricted-method-mapping', [64, 65], '删除操作未限制 HTTP method，现代接口应使用 DeleteMapping 或显式 DELETE。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilter.java': [
    ['hard-coded-path', [55, 56], '请求记录目录硬编码为 Windows 路径，缺少外部化配置和跨平台语义。'],
    ['resource-lifecycle', [83], 'Files.walk 返回的 Stream 没有显式关闭，可能长期占用目录句柄。'],
    ['request-body-read', [128, 129, 130, 131, 132], '按 Content-Length 分配并单次读取请求体，不能保证读满，也不覆盖分块传输。'],
    ['duplicate-filter-chain', [163, 164, 165, 166], '下游抛出异常后再次调用 filterChain，可能让同一请求重复执行业务。'],
    ['finally-side-effect', [167, 168, 169], 'finally 中日志和文件写入可能覆盖原始请求异常，并把请求结构持久化到本地。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/filter/AccessFilterConfig.java': [
    ['inactive-configuration', [13, 15, 16], 'Configuration 被注释，内部 Bean 方法不会被组件扫描自动执行。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/filter/BodyRequestWrapper.java': [
    ['servlet-input-contract', [31, 40, 45, 50], 'ServletInputStream 始终报告未完成且未就绪，也未实现异步 ReadListener 合同。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/filter/DesFilter.java': [
    ['client-controlled-decryption', [73, 78, 120, 121], '是否解密由客户端 encryFlag 控制，不能替代传输层安全和服务端认证。'],
    ['legacy-crypto', [94, 126], '请求参数与请求体使用旧 3DES 兼容流程，课程只能作为迁移反例。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/filter/TokenLoginFilter.java': [
    ['sensitive-log', [91, 103, 137, 153], '日志输出完整 token、解析身份、数据库口令和完整登录结果。'],
    ['weak-token-checksum', [114, 115, 116], '校验值只由用户名与时间做 MD5，没有服务端秘密，不能证明请求来源。'],
    ['unused-expiry-check', [243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255], '时间窗口校验方法存在但主登录流程没有调用，令牌新鲜度未形成闭环。'],
    ['authentication-bypass', [127, 128, 133, 136, 142], '登录服务被显式设置为不校验口令，并允许请求参数触发模拟登录路径。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/filter/XssHttpServletRequestWrapper.java': [
    ['servlet-input-contract', [99, 104, 109, 114], 'ServletInputStream 始终报告未完成且未就绪，也未实现异步 ReadListener 合同。'],
    ['input-mutation-xss', [145, 162, 166, 170, 174, 178, 183], '通过替换输入字符处理 XSS 会改变业务数据，不能替代按输出上下文编码。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/handler/LoginHandler.java': [
    ['path-authentication-bypass', [73, 74, 75], '只要 servletPath 包含 commaction 就跳过认证，范围大于精确路由白名单。'],
    ['sensitive-log', [96, 101], 'JWT 校验失败时把完整 Authorization token 写入错误日志。'],
    ['swallowed-exception', [164, 182, 183, 184], 'postHandle 静默吞掉异常，使令牌注入和视图准备失败不可诊断。'],
    ['token-in-view-model', [176, 177, 178, 179], '生成的 token 被放入视图模型，需防止模板、页面源码和前端日志泄露。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/handler/StackHandler.java': [
    ['inactive-security-control', [24, 26, 39, 40], '名为漏洞修复的拦截器当前无条件放行，没有实际安全控制。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/handler/ThreadHandler.java': [
    ['async-context-gap', [15, 74, 75, 76], '线程上下文只在 MVC 请求完成时清理，异步线程仍需在自身 finally 中清理。'],
  ],
  'dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/HxDataReportController.java': [
    ['null-task-result', [33, 34], '任务业务方法直接返回 null，破坏任务适配器的结果合同。'],
  ],
}

/** 读取并解析 UTF-8 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 计算文本的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
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

/** 判断冻结文件是否属于 Phase 1C 第 2 批物理范围。 */
function isWebEntryBatchFile(file) {
  const filePath = file.path
  if (filePath.startsWith('dzzz-app/src/main/java/com/tdh/bdzz/controller/')) return true
  if (/^dzzz-app\/src\/main\/java\/com\/tdh\/bdzz\/filter\/[^/]+\.java$/.test(filePath)) return true
  if (
    [
      'dzzz-app/src/main/java/com/tdh/bdzz/handler/LoginHandler.java',
      'dzzz-app/src/main/java/com/tdh/bdzz/handler/StackHandler.java',
      'dzzz-app/src/main/java/com/tdh/bdzz/handler/ThreadHandler.java',
    ].includes(filePath)
  ) {
    return true
  }
  return filePath.startsWith('dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/')
}

/** 返回人工复核后的主角色。 */
function getFinalRole(filePath) {
  if (filePath.includes('/timer/controller/')) return 'async-integration'
  if (filePath.includes('/handler/')) return 'cross-cutting'
  if (filePath.endsWith('FilterConfig.java')) return 'startup-config'
  return 'web-entry'
}

/** 从注解目标中提取处理方法名。 */
function getHandlerMethodNames(extractedRecord) {
  return [
    ...new Set(
      extractedRecord.annotations
        .filter(
          (annotation) =>
            annotation.site === 'method' &&
            ['DeleteMapping', 'GetMapping', 'PatchMapping', 'PostMapping', 'PutMapping', 'RequestMapping'].includes(
              annotation.name,
            ),
        )
        .map((annotation) => annotation.target.split('#')[1]?.split('(')[0])
        .filter(Boolean),
    ),
  ]
}

/** 根据文件职责生成简短、可核对的角色描述。 */
function buildRoleDetail(filePath, typeName) {
  if (filePath.includes('/timer/controller/')) return `${typeName} 任务 HTTP 适配器`
  if (filePath.endsWith('FilterConfig.java')) return `${typeName} Filter 注册配置`
  if (filePath.includes('/filter/')) return `${typeName} Servlet 请求管线组件`
  if (filePath.includes('/handler/')) return `${typeName} MVC 横切拦截器`
  return `${typeName} HTTP 接口适配器`
}

/** 根据处理方法和依赖生成主要职责结论。 */
function buildResponsibility(filePath, typeName, methods, dependencies) {
  if (filePath.includes('/timer/controller/')) {
    const taskDependency = dependencies.find((dependency) => dependency.endsWith('Task')) ?? typeName
    return `把任务框架请求适配到 ${taskDependency}，负责参数装载、业务执行和任务结果返回。`
  }
  if (filePath.endsWith('/AccessFilterConfig.java')) {
    return '保留 AccessFilter 的注册定义，但配置类当前未激活，不会由 Spring 创建或注册。'
  }
  if (filePath.endsWith('FilterConfig.java')) {
    return `创建并注册 ${typeName.replace(/Config$/, '')}，确定 URL 范围和 Filter 顺序。`
  }
  if (filePath.includes('/filter/')) return `在 Servlet Filter 链中读取、包装或转换 HTTP 请求后继续下游处理。`
  if (filePath.includes('/handler/')) return `在 Spring MVC 请求生命周期中执行认证、安全检查或线程上下文清理。`
  if (methods.length === 0) return `声明 ${typeName} 的 Web 基路径，当前没有已映射的处理方法。`
  const visibleMethods = methods.slice(0, 6).join('、')
  const methodDescription = methods.length === 1
    ? `${visibleMethods} 处理方法`
    : `${visibleMethods} 等 ${methods.length} 个处理方法`
  return `接收与 ${methodDescription} 对应的 HTTP 请求，并把业务处理委派给应用服务。`
}

/** 生成 Spring 或 Servlet 生命周期说明。 */
function buildLifecycle(filePath) {
  if (filePath.includes('/timer/controller/')) {
    return 'Spring 创建 Controller 后，任务框架通过继承的适配器入口分派请求，再调用 loadData 和 doBusiness。'
  }
  if (filePath.endsWith('/AccessFilterConfig.java')) {
    return '当前不会进入 Spring 配置处理；只有恢复配置类激活后，才会创建 FilterRegistrationBean 并注册到 Servlet 容器。'
  }
  if (filePath.endsWith('FilterConfig.java')) return 'Spring 配置处理阶段创建 FilterRegistrationBean 并注册到 Servlet 容器。'
  if (filePath.includes('/filter/')) return 'Servlet 容器按注册顺序调用 init、doFilter 和 destroy，请求包装只在当前 Filter 链生效。'
  if (filePath.includes('/handler/')) return 'DispatcherServlet 在处理方法前后调用 HandlerInterceptor，并在请求完成时执行清理。'
  return 'Spring 扫描 Controller，DispatcherServlet 根据类型与方法映射绑定请求、调用处理方法并写出响应。'
}

/** 汇总主要依赖，保留框架与注入的业务协作者。 */
function buildDependencies(extractedRecord) {
  const dependencies = [
    ...extractedRecord.frameworkUsages.map((usage) => frameworkNames[usage.id] ?? usage.id),
    ...extractedRecord.fields.map((field) => field.type),
  ].filter((value) => !ignoredDependencyTypes.has(value))
  return [...new Set(dependencies)].slice(0, 12)
}

/** 根据已确认的注解和参数形态生成能力候选。 */
function buildCapabilityCandidates(filePath, extractedRecord) {
  const annotationNames = new Set(extractedRecord.annotations.map((annotation) => annotation.name))
  const parameterTypes = extractedRecord.publicMethods.flatMap((method) => method.parameterTypes)
  const capabilities = []
  if (filePath.includes('/timer/controller/')) capabilities.push('任务适配器', '模板方法', '任务结果')
  else if (filePath.endsWith('FilterConfig.java')) capabilities.push('FilterRegistrationBean', 'Bean 注册', 'Filter 顺序')
  else if (filePath.includes('/filter/')) capabilities.push('Servlet Filter', '请求包装', 'FilterChain')
  else if (filePath.includes('/handler/')) capabilities.push('HandlerInterceptor', 'MVC 生命周期')
  else capabilities.push('Spring MVC', '请求映射', 'Controller 分层')
  if (annotationNames.has('RequestBody')) capabilities.push('请求体反序列化')
  if (annotationNames.has('Valid') || annotationNames.has('Validated')) capabilities.push('Bean Validation')
  if (annotationNames.has('NoLoginAuthRequired')) capabilities.push('匿名入口')
  if (parameterTypes.some((type) => type.includes('MultipartFile'))) capabilities.push('文件上传')
  if (parameterTypes.some((type) => type.includes('HttpServletRequest'))) capabilities.push('Servlet 请求对象')
  if (parameterTypes.some((type) => type.includes('HttpServletResponse'))) capabilities.push('Servlet 响应与下载')
  if (extractedRecord.languageFeatures.some((feature) => feature.id === 'catch-clause')) capabilities.push('异常边界')
  return [...new Set(capabilities)]
}

/** 从源码中读取一条可能跨行的注解文本。 */
function readAnnotationText(lines, lineNumber) {
  let text = ''
  for (let offset = 0; offset < 8 && lineNumber - 1 + offset < lines.length; offset += 1) {
    text += lines[lineNumber - 1 + offset].trim()
    if (text.includes(')') || !text.includes('(')) break
  }
  return text
}

/** 收集源码中匹配正则的行号。 */
function findLines(lines, expression) {
  const matches = []
  lines.forEach((line, index) => {
    expression.lastIndex = 0
    if (expression.test(line)) matches.push(index + 1)
  })
  return matches
}

/** 添加一条尚未编号的风险候选。 */
function addRisk(risks, category, lines, summary) {
  const validLines = [...new Set(lines)].sort((left, right) => left - right)
  if (validLines.length === 0) return
  risks.push({ category, lines: validLines, summary })
}

/** 依据逐文件源码复核信号生成通用风险候选。 */
function buildGenericRisks(file, extractedRecord, sourceLines) {
  const risks = []
  const fieldInjectionLines = extractedRecord.annotations
    .filter(
      (annotation) =>
        annotation.site === 'field' && ['Autowired', 'Resource'].includes(annotation.name),
    )
    .map((annotation) => annotation.line)
  addRisk(risks, 'field-injection', fieldInjectionLines, '字段注入隐藏必需依赖，现代示例应使用构造器注入。')

  const anonymousLines = extractedRecord.annotations
    .filter((annotation) => annotation.name === 'NoLoginAuthRequired')
    .map((annotation) => annotation.line)
  addRisk(risks, 'anonymous-access', anonymousLines, '匿名放行扩大认证例外面，必须逐入口确认业务必要性、授权替代和滥用防护。')

  const unrestrictedMappingLines = extractedRecord.annotations
    .filter(
      (annotation) =>
        annotation.site === 'method' &&
        annotation.name === 'RequestMapping' &&
        !readAnnotationText(sourceLines, annotation.line).includes('method'),
    )
    .map((annotation) => annotation.line)
  addRisk(risks, 'unrestricted-method-mapping', unrestrictedMappingLines, '方法级 RequestMapping 未限制 HTTP method，现代接口应使用语义明确的专用映射。')

  const annotationsByTarget = new Map()
  for (const annotation of extractedRecord.annotations) {
    const names = annotationsByTarget.get(annotation.target) ?? new Set()
    names.add(annotation.name)
    annotationsByTarget.set(annotation.target, names)
  }
  const missingValidationLines = extractedRecord.annotations
    .filter((annotation) => {
      if (annotation.name !== 'RequestBody') return false
      const names = annotationsByTarget.get(annotation.target) ?? new Set()
      return !names.has('Valid') && !names.has('Validated')
    })
    .map((annotation) => annotation.line)
  addRisk(risks, 'missing-request-validation', missingValidationLines, '请求体没有触发 Bean Validation；若 DTO 声明约束，当前入口不会自动校验。')

  addRisk(
    risks,
    'broad-catch',
    findLines(sourceLines, /catch\s*\(\s*(?:Exception|Throwable)\b/),
    'Controller 或管线组件广泛捕获顶层异常，容易混淆可恢复错误、编程错误和统一异常处理职责。',
  )
  addRisk(
    risks,
    'general-exception-contract',
    findLines(sourceLines, /\bthrows\s+(?:[\w.,<>?\s]+,\s*)?(?:Exception|Throwable)\b/),
    '处理方法声明宽泛 Exception 或 Throwable，接口异常合同不明确。',
  )
  addRisk(
    risks,
    'exception-detail-response',
    findLines(sourceLines, /(?:return|set\w*\s*\(|ResponseEntity)[^;]*\b\w+\.getMessage\(\)/),
    '把底层异常消息直接写入客户端响应，可能泄露实现细节且造成不稳定错误合同。',
  )
  addRisk(
    risks,
    'file-upload-boundary',
    findLines(sourceLines, /\bMultipartFile(?:\[\])?\b/),
    '文件上传入口需要在服务端同时约束大小、类型、文件名、存储路径和恶意内容，不能只依赖客户端。',
  )
  if (file.loc > 500) {
    addRisk(
      risks,
      'oversized-controller',
      [extractedRecord.declaredTypes[0]?.line ?? 1],
      `该 Controller 达到 ${file.loc} LOC，HTTP 适配、校验和业务编排边界过重。`,
    )
  }
  return risks
}

/** 合并人工确认的文件专属风险候选。 */
function appendSpecificRisks(filePath, risks) {
  for (const [category, lines, summary] of specificRisks[filePath] ?? []) {
    addRisk(risks, category, lines, summary)
  }
  return risks
}

/** 生成能追溯角色和入口覆盖的源码证据。 */
function buildSourceEvidence(extractedRecord) {
  const mappingLines = extractedRecord.annotations
    .filter(
      (annotation) =>
        ['Controller', 'RestController', 'RequestMapping', 'GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping'].includes(
          annotation.name,
        ),
    )
    .map((annotation) => annotation.line)
  const implementationLines = extractedRecord.publicMethods.flatMap((method) => [method.line, method.endLine])
  const lines = [
    extractedRecord.declaredTypes[0]?.line,
    ...mappingLines,
    ...implementationLines,
  ].filter(Number.isInteger)
  const uniqueLines = [...new Set(lines)].sort((left, right) => left - right)
  const selectedLines = uniqueLines.length <= 80
    ? uniqueLines
    : [...uniqueLines.slice(0, 40), ...uniqueLines.slice(-40)]
  return [
    {
      lines: selectedLines,
      summary: '类型声明、可用的请求映射和公开方法边界共同证明该文件的当前职责和主要实现。',
    },
  ]
}

/** 建立一条人工复核台账记录。 */
function buildReviewRecord(file, extractedRecord, sourceRepository) {
  const sourcePath = path.join(sourceRepository, file.path)
  const sourceLines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
  if (sourceLines.at(-1) === '') sourceLines.pop()
  if (sourceLines.length !== file.loc) throw new Error(`${file.path} LOC 已漂移`)
  const typeName = extractedRecord.declaredTypes[0]?.name ?? path.basename(file.path, '.java')
  const methods = getHandlerMethodNames(extractedRecord)
  const dependencies = buildDependencies(extractedRecord)
  const risks = appendSpecificRisks(
    file.path,
    buildGenericRisks(file, extractedRecord, sourceLines),
  )
  return {
    inventoryIndex: file.index,
    path: file.path,
    sourceSha256: file.sha256,
    loc: file.loc,
    auditStatus: 'reviewed',
    machineRoleCandidate: extractedRecord.inferredRole.primary,
    finalRole: getFinalRole(file.path),
    roleDetail: buildRoleDetail(file.path, typeName),
    responsibility: buildResponsibility(file.path, typeName, methods, dependencies),
    lifecycle: buildLifecycle(file.path),
    dependencies: dependencies.length > 0 ? dependencies : ['Java 标准库'],
    capabilityCandidates: buildCapabilityCandidates(file.path, extractedRecord),
    riskCandidates: risks,
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

/** 为全部风险候选分配连续且唯一的 WE 编号。 */
function assignRiskIds(records) {
  let sequence = 0
  for (const record of records) {
    for (const risk of record.riskCandidates) {
      sequence += 1
      risk.id = `WE-${String(sequence).padStart(3, '0')}`
    }
  }
}

/** 生成 JSONL 分片和批次 manifest 的稳定文本。 */
function buildOutputs(records, inventory, extractionManifest, generatedAt) {
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
  const riskCandidateCount = records.reduce(
    (total, record) => total + record.riskCandidates.length,
    0,
  )
  const manifest = {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    analysisId: extractionManifest.analysisId,
    batchId: 'phase-1c-web-entry',
    status: 'completed',
    reviewedAt: generatedAt,
    recordContract: {
      format: 'JSON Lines; one manually reviewed file record per line',
      riskStatus: 'candidate for later capability or rejected-pattern normalization; not a defect verdict',
    },
    summary: {
      batchFileCount: records.length,
      batchLoc: records.reduce((total, record) => total + record.loc, 0),
      machineRoleCandidateCounts: countBy(records, 'machineRoleCandidate'),
      finalRoleCounts: countBy(records, 'finalRole'),
      roleCorrectionCount: records.filter(
        (record) => record.machineRoleCandidate !== record.finalRole,
      ).length,
      riskCandidateCount,
      riskCategoryCounts: countRiskCategories(records),
      currentAuditStatusCounts: {
        unreviewed: inventory.summary.total.fileCount - 34 - records.length,
        reviewing: 0,
        reviewed: 34 + records.length,
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
        throw new Error(`第 2 批复核产物不一致：${path.relative(auditDirectory, filePath)}`)
      }
      continue
    }
    fs.writeFileSync(filePath, content)
  }
}

/** 生成或校验 Phase 1C 第 2 批 Web 入口台账。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const extractionManifest = readJson(extractionManifestPath)
  const extractedByPath = readExtractedRecords(extractionManifest)
  const files = inventory.files.filter(isWebEntryBatchFile)
  const records = files.map((file) => {
    const extractedRecord = extractedByPath.get(file.path)
    if (!extractedRecord) throw new Error(`${file.path} 缺少 Phase 1B 记录`)
    return buildReviewRecord(file, extractedRecord, options.sourceRepository)
  })
  assignRiskIds(records)
  const outputs = buildOutputs(records, inventory, extractionManifest, batchReviewedAt)
  emitOutputs(outputs, options.check)
  const manifest = JSON.parse(outputs.get(outputManifestPath))
  console.log(
    JSON.stringify({
      status: 'PASS',
      mode: options.check ? 'check' : 'write',
      batchId: manifest.batchId,
      batchFileCount: manifest.summary.batchFileCount,
      batchLoc: manifest.summary.batchLoc,
      riskCandidateCount: manifest.summary.riskCandidateCount,
      currentAuditStatusCounts: manifest.summary.currentAuditStatusCounts,
    }),
  )
}

main()
