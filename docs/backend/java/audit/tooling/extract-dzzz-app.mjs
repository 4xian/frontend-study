import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parse } from 'java-parser'

import { frameworkRules, modifierTokenNames, syntaxFeatureRules } from './audit-rules.mjs'
import { loadCodeGraph } from './codegraph-extractor.mjs'
import { validateRecords } from './record-validator.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const auditDirectory = path.resolve(scriptDirectory, '..')
const inventoryPath = path.join(auditDirectory, 'dzzz-app-file-inventory.json')
const outputDirectory = path.join(auditDirectory, 'extracted')
const shardSize = 500

/** 计算字节或文本的 SHA-256。 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** 读取并解析 JSON 文件。 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/** 将对象序列化为带结尾换行的稳定 JSON 文本。 */
function stringifyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

/** 解析命令行参数并拒绝未知选项。 */
function parseArguments(argv) {
  const options = { check: false, sourceRepository: null }
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

/** 返回 CST 节点对应的源码片段。 */
function getNodeText(source, node) {
  return source.slice(node.location.startOffset, node.location.endOffset + 1)
}

/** 压缩类型和签名中的空白，但不读取方法体或初始化表达式。 */
function compactSyntax(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s*([<>,()[\]&?])\s*/g, '$1')
    .replace(/\s*\.\s*/g, '.')
    .trim()
}

/** 递归遍历 CST，并携带祖先节点。 */
function walkCst(value, visitor, ancestors = []) {
  if (!value || typeof value !== 'object' || !value.name || !value.children) return
  visitor(value, ancestors)
  const nextAncestors = [...ancestors, value]
  for (const children of Object.values(value.children)) {
    for (const child of children) walkCst(child, visitor, nextAncestors)
  }
}

/** 收集指定语法规则对应的 CST 节点和祖先链。 */
function collectNodes(root, names) {
  const matches = []
  walkCst(root, (node, ancestors) => {
    if (names.has(node.name)) matches.push({ node, ancestors })
  })
  return matches
}

/** 收集 CST 节点中的词法 token，仅在最外层按源码位置排序。 */
function collectTokens(value, output = null) {
  const tokens = output ?? []
  if (!value || typeof value !== 'object') return tokens
  if (value.tokenType && Number.isInteger(value.startOffset)) {
    tokens.push(value)
    return tokens
  }
  if (!value.children) return tokens
  for (const children of Object.values(value.children)) {
    for (const child of children) collectTokens(child, tokens)
  }
  return output === null
    ? tokens.sort((left, right) => left.startOffset - right.startOffset)
    : tokens
}

/** 返回节点的第一个直接 CST 子节点。 */
function firstChildNode(node, childName) {
  return node.children?.[childName]?.find((child) => child.name) ?? null
}

/** 返回节点的全部直接 CST 子节点。 */
function childNodes(node, childName) {
  return (node.children?.[childName] ?? []).filter((child) => child.name)
}

/** 从修饰符节点中提取 Java 关键字。 */
function extractModifiers(modifierNodes) {
  const modifiers = new Set()
  for (const modifierNode of modifierNodes) {
    for (const token of collectTokens(modifierNode)) {
      if (modifierTokenNames.has(token.tokenType.name)) modifiers.add(token.image)
    }
  }
  return [...modifiers].sort()
}

/** 根据修饰符返回显式可见性。 */
function getVisibility(modifiers, fallback = 'package') {
  for (const visibility of ['public', 'protected', 'private']) {
    if (modifiers.includes(visibility)) return visibility
  }
  return fallback
}

/** 按顶层逗号拆分泛型或继承类型列表。 */
function splitTopLevel(value) {
  const parts = []
  let angleDepth = 0
  let arrayDepth = 0
  let start = 0
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]
    if (character === '<') angleDepth += 1
    else if (character === '>') angleDepth = Math.max(0, angleDepth - 1)
    else if (character === '[') arrayDepth += 1
    else if (character === ']') arrayDepth = Math.max(0, arrayDepth - 1)
    else if (character === ',' && angleDepth === 0 && arrayDepth === 0) {
      parts.push(compactSyntax(value.slice(start, index)))
      start = index + 1
    }
  }
  parts.push(compactSyntax(value.slice(start)))
  return parts.filter(Boolean)
}

/** 移除声明列表前的 Java 关键字。 */
function stripLeadingKeyword(value, keyword) {
  return compactSyntax(value.replace(new RegExp(`^${keyword}\\s+`), ''))
}

/** 找出偏移量所在的最内层类型。 */
function findContainingType(types, startOffset, excludedType = null) {
  return (
    types
      .filter(
        (type) =>
          type !== excludedType &&
          type._rangeStart <= startOffset &&
          type._rangeEnd >= startOffset,
      )
      .sort(
        (left, right) =>
          left._rangeEnd - left._rangeStart - (right._rangeEnd - right._rangeStart),
      )[0] ?? null
  )
}

/** 返回比最近命名类型更内层的匿名类或枚举常量类体。 */
function findAnonymousContainer(ancestors) {
  const namedTypeNames = new Set(['classDeclaration', 'interfaceDeclaration'])
  const anonymousTypeNames = new Set(['enumConstant', 'unqualifiedClassInstanceCreationExpression'])
  let namedTypeIndex = -1
  let anonymousTypeIndex = -1
  for (let index = 0; index < ancestors.length; index += 1) {
    if (namedTypeNames.has(ancestors[index].name)) namedTypeIndex = index
    if (anonymousTypeNames.has(ancestors[index].name)) anonymousTypeIndex = index
  }
  return anonymousTypeIndex > namedTypeIndex ? ancestors[anonymousTypeIndex] : null
}

/** 为匿名类和枚举常量类体生成不含源码表达式的稳定审计目标。 */
function getAnonymousTarget(types, container) {
  const owner = findContainingType(types, container.location.startOffset)?.qualifiedName ?? '<unknown>'
  if (container.name === 'enumConstant') {
    const constantName = container.children?.Identifier?.[0]?.image ?? '<unknown>'
    return `${owner}#${constantName}`
  }
  return `${owner}#<anonymous>@${container.location.startLine}`
}

/** 从 package 声明的直接标识符中提取包名，排除 package 注解。 */
function extractPackageName(cst) {
  const match = collectNodes(cst, new Set(['packageDeclaration']))[0]
  if (!match) return null
  const identifiers = match.node.children?.Identifier ?? []
  return identifiers.length > 0 ? identifiers.map((token) => token.image).join('.') : null
}

/** 提取普通 import、静态 import 和通配符信息。 */
function extractImports(source, cst) {
  return collectNodes(cst, new Set(['importDeclaration']))
    .map(({ node }) => {
      const declaration = compactSyntax(getNodeText(source, node))
      const isStatic = /^import static\s+/.test(declaration)
      const imported = declaration.replace(/^import\s+/, '').replace(/^static\s+/, '').replace(/;$/, '')
      const wildcard = imported.endsWith('.*')
      return {
        name: wildcard ? imported.slice(0, -2) : imported,
        static: isStatic,
        wildcard,
        line: node.location.startLine,
      }
    })
    .sort((left, right) => left.line - right.line || left.name.localeCompare(right.name))
}

/** 解析一种类型声明的种类和主体节点。 */
function getTypeDeclarationKind(declarationNode) {
  const candidates = [
    ['class', 'normalClassDeclaration'],
    ['enum', 'enumDeclaration'],
    ['record', 'recordDeclaration'],
    ['interface', 'normalInterfaceDeclaration'],
    ['annotation', 'annotationInterfaceDeclaration'],
  ]
  for (const [kind, childName] of candidates) {
    const kindNode = firstChildNode(declarationNode, childName)
    if (kindNode) return { kind, kindNode }
  }
  return null
}

/** 提取类、接口、枚举、注解和 record 声明。 */
function extractTypes(source, cst, packageName) {
  const declarations = collectNodes(cst, new Set(['classDeclaration', 'interfaceDeclaration']))
  const types = []
  for (const { node } of declarations) {
    const resolved = getTypeDeclarationKind(node)
    if (!resolved) continue
    const modifierName = node.name === 'interfaceDeclaration' ? 'interfaceModifier' : 'classModifier'
    const modifiers = extractModifiers(childNodes(node, modifierName))
    const nameNode = firstChildNode(resolved.kindNode, 'typeIdentifier')
    if (!nameNode) continue
    const typeParametersNode = firstChildNode(resolved.kindNode, 'typeParameters')
    const extendsNode =
      firstChildNode(resolved.kindNode, 'classExtends') ??
      firstChildNode(resolved.kindNode, 'interfaceExtends')
    const implementsNode = firstChildNode(resolved.kindNode, 'classImplements')
    const permitsNode =
      firstChildNode(resolved.kindNode, 'classPermits') ??
      firstChildNode(resolved.kindNode, 'interfacePermits')
    const fallbackVisibility = resolved.kind === 'annotation' ? 'package' : 'package'
    types.push({
      kind: resolved.kind,
      name: compactSyntax(getNodeText(source, nameNode)),
      qualifiedName: null,
      owner: null,
      visibility: getVisibility(modifiers, fallbackVisibility),
      modifiers,
      typeParameters: typeParametersNode
        ? compactSyntax(getNodeText(source, typeParametersNode))
        : null,
      extends: extendsNode
        ? splitTopLevel(stripLeadingKeyword(getNodeText(source, extendsNode), 'extends'))
        : [],
      implements: implementsNode
        ? splitTopLevel(stripLeadingKeyword(getNodeText(source, implementsNode), 'implements'))
        : [],
      permits: permitsNode
        ? splitTopLevel(stripLeadingKeyword(getNodeText(source, permitsNode), 'permits'))
        : [],
      enumConstants: [],
      line: resolved.kindNode.location.startLine,
      endLine: resolved.kindNode.location.endLine,
      _rangeStart: node.location.startOffset,
      _rangeEnd: node.location.endOffset,
    })
  }
  types.sort((left, right) => left._rangeStart - right._rangeStart)
  for (const type of types) {
    const owner = findContainingType(types, type._rangeStart, type)
    type.owner = owner?.qualifiedName ?? null
    type.qualifiedName = owner
      ? `${owner.qualifiedName}$${type.name}`
      : packageName
        ? `${packageName}.${type.name}`
        : type.name
  }
  const enumConstants = collectNodes(cst, new Set(['enumConstant']))
  for (const { node } of enumConstants) {
    const owner = findContainingType(types, node.location.startOffset)
    const identifier = node.children?.Identifier?.[0]?.image
    if (owner?.kind === 'enum' && identifier) owner.enumConstants.push(identifier)
  }
  return types
}

/** 提取字段或接口常量声明。 */
function extractFields(source, cst, types) {
  const fields = []
  const declarations = collectNodes(cst, new Set(['constantDeclaration', 'fieldDeclaration']))
  for (const { node } of declarations) {
    const modifierName = node.name === 'constantDeclaration' ? 'constantModifier' : 'fieldModifier'
    const modifiers = extractModifiers(childNodes(node, modifierName))
    if (node.name === 'constantDeclaration') {
      for (const implicitModifier of ['final', 'public', 'static']) {
        if (!modifiers.includes(implicitModifier)) modifiers.push(implicitModifier)
      }
      modifiers.sort()
    }
    const typeNode = firstChildNode(node, 'unannType')
    const declaratorList = firstChildNode(node, 'variableDeclaratorList')
    if (!typeNode || !declaratorList) continue
    const owner = findContainingType(types, node.location.startOffset)
    const typeName = compactSyntax(getNodeText(source, typeNode))
    for (const declarator of childNodes(declaratorList, 'variableDeclarator')) {
      const identifierNode = firstChildNode(declarator, 'variableDeclaratorId')
      const identifier = identifierNode?.children?.Identifier?.[0]?.image
      if (!identifier) continue
      const dimsNode = identifierNode ? firstChildNode(identifierNode, 'dims') : null
      fields.push({
        owner: owner?.qualifiedName ?? null,
        name: identifier,
        type: `${typeName}${dimsNode ? compactSyntax(getNodeText(source, dimsNode)) : ''}`,
        visibility: getVisibility(modifiers),
        modifiers: [...modifiers],
        line: declarator.location.startLine,
        _rangeStart: node.location.startOffset,
        _rangeEnd: node.location.endOffset,
      })
    }
  }
  return fields.sort((left, right) => left.line - right.line || left.name.localeCompare(right.name))
}

/** 提取方法或构造方法的参数类型。 */
function extractParameterTypes(source, declaratorNode) {
  const parameterList = firstChildNode(declaratorNode, 'formalParameterList')
  if (!parameterList) return []
  const parameters = collectNodes(parameterList, new Set(['formalParameter']))
  return parameters.map(({ node }) => {
    const regular = firstChildNode(node, 'variableParaRegularParameter')
    const variableArity = firstChildNode(node, 'variableArityParameter')
    const receiver = firstChildNode(node, 'receiverParameter')
    const parameter = regular ?? variableArity ?? receiver ?? node
    const typeNode = firstChildNode(parameter, 'unannType')
    const typeName = typeNode ? compactSyntax(getNodeText(source, typeNode)) : 'unknown'
    return variableArity ? `${typeName}...` : typeName
  })
}

/** 提取声明中的 throws 类型。 */
function extractThrows(source, declarationNode) {
  const throwsNode = collectNodes(declarationNode, new Set(['throws']))[0]?.node
  if (!throwsNode) return []
  return splitTopLevel(stripLeadingKeyword(getNodeText(source, throwsNode), 'throws'))
}

/** 根据结构化字段组装不含参数名和实现体的方法签名。 */
function buildSignature({ typeParameters, returnType, name, parameterTypes, throwsTypes }) {
  const prefix = [typeParameters, returnType].filter(Boolean).join(' ')
  const suffix = throwsTypes.length > 0 ? ` throws ${throwsTypes.join(', ')}` : ''
  return `${prefix ? `${prefix} ` : ''}${name}(${parameterTypes.join(', ')})${suffix}`
}

/** 提取全部构造方法，但不读取构造方法体。 */
function extractConstructors(source, cst, types) {
  const constructors = []
  for (const { node } of collectNodes(cst, new Set(['constructorDeclaration']))) {
    const modifiers = extractModifiers(childNodes(node, 'constructorModifier'))
    const declarator = firstChildNode(node, 'constructorDeclarator')
    const nameNode = declarator ? firstChildNode(declarator, 'simpleTypeName') : null
    if (!declarator || !nameNode) continue
    const parameterTypes = extractParameterTypes(source, declarator)
    const throwsTypes = extractThrows(source, node)
    const owner = findContainingType(types, node.location.startOffset)
    const name = compactSyntax(getNodeText(source, nameNode))
    constructors.push({
      owner: owner?.qualifiedName ?? null,
      name,
      visibility: getVisibility(modifiers, owner?.kind === 'enum' ? 'private' : 'package'),
      modifiers,
      parameterTypes,
      throws: throwsTypes,
      signature: buildSignature({
        typeParameters: null,
        returnType: null,
        name,
        parameterTypes,
        throwsTypes,
      }),
      line: declarator.location.startLine,
      endLine: node.location.endLine,
      _rangeStart: node.location.startOffset,
      _rangeEnd: node.location.endOffset,
    })
  }
  return constructors.sort((left, right) => left.line - right.line || left.name.localeCompare(right.name))
}

/** 提取 class、interface 和 enum 中显式或隐式 public 方法。 */
function extractPublicMethods(source, cst, types) {
  const methods = []
  const declarations = collectNodes(
    cst,
    new Set(['interfaceMethodDeclaration', 'methodDeclaration']),
  )
  for (const { node, ancestors } of declarations) {
    if (findAnonymousContainer(ancestors)) continue
    const header = firstChildNode(node, 'methodHeader')
    const declarator = header ? firstChildNode(header, 'methodDeclarator') : null
    if (!header || !declarator) continue
    const owner = findContainingType(types, node.location.startOffset)
    const modifierName =
      node.name === 'interfaceMethodDeclaration' ? 'interfaceMethodModifier' : 'methodModifier'
    const modifiers = extractModifiers(childNodes(node, modifierName))
    const visibility = getVisibility(
      modifiers,
      owner?.kind === 'interface' || owner?.kind === 'annotation' ? 'public' : 'package',
    )
    if (visibility !== 'public') continue
    const name = declarator.children?.Identifier?.[0]?.image
    if (!name) continue
    const resultNode = firstChildNode(header, 'result')
    const typeParametersNode = firstChildNode(header, 'typeParameters')
    const parameterTypes = extractParameterTypes(source, declarator)
    const throwsTypes = extractThrows(source, header)
    const returnType = resultNode ? compactSyntax(getNodeText(source, resultNode)) : 'unknown'
    const typeParameters = typeParametersNode
      ? compactSyntax(getNodeText(source, typeParametersNode))
      : null
    methods.push({
      owner: owner?.qualifiedName ?? null,
      name,
      visibility,
      modifiers,
      typeParameters,
      returnType,
      parameterTypes,
      throws: throwsTypes,
      signature: buildSignature({
        typeParameters,
        returnType,
        name,
        parameterTypes,
        throwsTypes,
      }),
      line: header.location.startLine,
      endLine: node.location.endLine,
      _rangeStart: node.location.startOffset,
      _rangeEnd: node.location.endOffset,
    })
  }
  for (const { node } of collectNodes(cst, new Set(['annotationInterfaceElementDeclaration']))) {
    const owner = findContainingType(types, node.location.startOffset)
    const identifier = node.children?.Identifier?.[0]?.image
    const returnTypeNode = firstChildNode(node, 'unannType')
    if (!identifier || !returnTypeNode) continue
    const returnType = compactSyntax(getNodeText(source, returnTypeNode))
    methods.push({
      owner: owner?.qualifiedName ?? null,
      name: identifier,
      visibility: 'public',
      modifiers: ['abstract', 'public'],
      typeParameters: null,
      returnType,
      parameterTypes: [],
      throws: [],
      signature: buildSignature({
        typeParameters: null,
        returnType,
        name: identifier,
        parameterTypes: [],
        throwsTypes: [],
      }),
      line: node.location.startLine,
      endLine: node.location.endLine,
      _rangeStart: node.location.startOffset,
      _rangeEnd: node.location.endOffset,
    })
  }
  return methods.sort((left, right) => left.line - right.line || left.signature.localeCompare(right.signature))
}

/** 从祖先链末端寻找最近的指定规则节点。 */
function findNearestAncestor(ancestors, names) {
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    if (names.has(ancestors[index].name)) return ancestors[index]
  }
  return null
}

/** 返回声明所在类型的限定名。 */
function getOwnerName(types, declarationNode) {
  return findContainingType(types, declarationNode.location.startOffset)?.qualifiedName ?? '<unknown>'
}

/** 生成可区分重载的普通方法审计签名。 */
function getMethodTargetSignature(source, declarationNode) {
  const header = firstChildNode(declarationNode, 'methodHeader')
  const declarator = header ? firstChildNode(header, 'methodDeclarator') : null
  const name = declarator?.children?.Identifier?.[0]?.image ?? '<unknown>'
  const parameterTypes = declarator ? extractParameterTypes(source, declarator) : []
  return `${name}(${parameterTypes.join(', ')})`
}

/** 生成可区分重载的构造方法审计签名。 */
function getConstructorTargetSignature(source, declarationNode) {
  const declarator = firstChildNode(declarationNode, 'constructorDeclarator')
  const nameNode = declarator ? firstChildNode(declarator, 'simpleTypeName') : null
  const name = nameNode ? compactSyntax(getNodeText(source, nameNode)) : '<unknown>'
  const parameterTypes = declarator ? extractParameterTypes(source, declarator) : []
  return `${name}(${parameterTypes.join(', ')})`
}

/** 根据 CST 祖先链判定注解的真实声明位置。 */
function resolveAnnotationTarget(source, ancestors, types, packageName) {
  const context = ancestors.at(-1)?.name ?? null
  const outerAnnotation = findNearestAncestor(ancestors, new Set(['annotation']))
  if (outerAnnotation) {
    const outerIndex = ancestors.lastIndexOf(outerAnnotation)
    const outerTarget = resolveAnnotationTarget(
      source,
      ancestors.slice(0, outerIndex),
      types,
      packageName,
    )
    return { site: 'annotation-argument', target: outerTarget.target }
  }
  const typeDeclaration = findNearestAncestor(
    ancestors,
    new Set(['classDeclaration', 'interfaceDeclaration']),
  )
  const methodDeclaration = findNearestAncestor(
    ancestors,
    new Set(['interfaceMethodDeclaration', 'methodDeclaration']),
  )
  const fieldDeclaration = findNearestAncestor(
    ancestors,
    new Set(['constantDeclaration', 'fieldDeclaration']),
  )
  const constructorDeclaration = findNearestAncestor(
    ancestors,
    new Set(['constructorDeclaration']),
  )
  const parameterDeclaration = findNearestAncestor(
    ancestors,
    new Set(['formalParameter', 'receiverParameter', 'variableArityParameter']),
  )
  const anonymousContainer = findAnonymousContainer(ancestors)
  const type = typeDeclaration
    ? findContainingType(types, typeDeclaration.location.startOffset)
    : null
  if (['classModifier', 'interfaceModifier'].includes(context) && type) {
    return { site: 'type', target: type.qualifiedName }
  }
  if (['methodModifier', 'interfaceMethodModifier'].includes(context) && methodDeclaration) {
    if (anonymousContainer) {
      const site =
        anonymousContainer.name === 'enumConstant' ? 'enum-constant-method' : 'anonymous-method'
      return {
        site,
        target: `${getAnonymousTarget(types, anonymousContainer)}.${getMethodTargetSignature(source, methodDeclaration)}`,
      }
    }
    return {
      site: 'method',
      target: `${getOwnerName(types, methodDeclaration)}#${getMethodTargetSignature(source, methodDeclaration)}`,
    }
  }
  if (['fieldModifier', 'constantModifier'].includes(context) && fieldDeclaration) {
    const names = collectNodes(fieldDeclaration, new Set(['variableDeclaratorId']))
      .map(({ node }) => node.children?.Identifier?.[0]?.image)
      .filter(Boolean)
    return {
      site: 'field',
      target: `${getOwnerName(types, fieldDeclaration)}#${names.join(',') || '<unknown>'}`,
    }
  }
  if (context === 'constructorModifier' && constructorDeclaration) {
    return {
      site: 'constructor',
      target: `${getOwnerName(types, constructorDeclaration)}#${getConstructorTargetSignature(source, constructorDeclaration)}`,
    }
  }
  if (parameterDeclaration) {
    if (anonymousContainer && methodDeclaration) {
      const site =
        anonymousContainer.name === 'enumConstant'
          ? 'enum-constant-method-parameter'
          : 'anonymous-method-parameter'
      return {
        site,
        target: `${getAnonymousTarget(types, anonymousContainer)}.${getMethodTargetSignature(source, methodDeclaration)}`,
      }
    }
    if (constructorDeclaration) {
      return {
        site: 'parameter',
        target: `${getOwnerName(types, constructorDeclaration)}#${getConstructorTargetSignature(source, constructorDeclaration)}`,
      }
    }
    return {
      site: 'parameter',
      target: methodDeclaration
        ? `${getOwnerName(types, methodDeclaration)}#${getMethodTargetSignature(source, methodDeclaration)}`
        : type?.qualifiedName ?? null,
    }
  }
  if (context === 'packageModifier') return { site: 'package', target: packageName }
  if (context === 'enumConstantModifier') {
    return {
      site: 'enum-constant',
      target: anonymousContainer ? getAnonymousTarget(types, anonymousContainer) : type?.qualifiedName ?? null,
    }
  }
  if (context === 'recordComponentModifier') {
    return { site: 'record-component', target: type?.qualifiedName ?? null }
  }
  return { site: 'type-use-or-local', target: null }
}

/** 提取注解名称、行号和作用声明，不保留注解参数值。 */
function extractAnnotations(source, cst, types, packageName) {
  return collectNodes(cst, new Set(['annotation']))
    .map(({ node, ancestors }) => {
      const typeNameNode = firstChildNode(node, 'typeName')
      const target = resolveAnnotationTarget(source, ancestors, types, packageName)
      return {
        name: typeNameNode ? compactSyntax(getNodeText(source, typeNameNode)) : '<unknown>',
        site: target.site,
        target: target.target,
        context: ancestors.at(-1)?.name ?? null,
        line: node.location.startLine,
      }
    })
    .sort((left, right) => left.line - right.line || left.name.localeCompare(right.name))
}

/** 统计需要进入课程候选分析的 Java 语法和标准库能力。 */
function extractLanguageFeatures(cst, imports) {
  const nodeCounts = new Map()
  walkCst(cst, (node) => nodeCounts.set(node.name, (nodeCounts.get(node.name) ?? 0) + 1))
  const features = []
  for (const [id, nodeName] of syntaxFeatureRules) {
    const count = nodeCounts.get(nodeName) ?? 0
    if (count > 0) features.push({ id, count, evidence: 'cst' })
  }
  const anonymousClassBodyCount = [
    ...collectNodes(cst, new Set(['enumConstant'])),
    ...collectNodes(cst, new Set(['unqualifiedClassInstanceCreationExpression'])),
  ].filter(({ node }) => firstChildNode(node, 'classBody')).length
  if (anonymousClassBodyCount > 0) {
    features.push({ id: 'anonymous-class-body', count: anonymousClassBodyCount, evidence: 'cst' })
  }
  const importNames = imports.map((entry) => entry.name)
  const tokens = collectTokens(cst)
  const invokesStream = tokens.some(
    (token, index) =>
      ['stream', 'parallelStream'].includes(token.image) &&
      tokens[index - 1]?.tokenType.name === 'Dot' &&
      tokens[index + 1]?.tokenType.name === 'LBrace',
  )
  const semanticRules = [
    ['concurrency', importNames.some((name) => name.startsWith('java.util.concurrent'))],
    ['io', importNames.some((name) => name.startsWith('java.io') || name.startsWith('java.nio'))],
    ['optional', importNames.some((name) => name === 'java.util.Optional')],
    ['reflection', importNames.some((name) => name.startsWith('java.lang.reflect'))],
    [
      'stream-api',
      importNames.some((name) => name.startsWith('java.util.stream')) || invokesStream,
    ],
  ]
  for (const [id, present] of semanticRules) {
    if (present) features.push({ id, count: 1, evidence: 'import-or-call' })
  }
  return features.sort((left, right) => left.id.localeCompare(right.id))
}

/** 根据 import 和注解名称识别框架使用证据。 */
function extractFrameworkUsages(imports, annotations) {
  const annotationNames = annotations.map((annotation) => annotation.name.split('.').at(-1))
  const usages = []
  for (const rule of frameworkRules) {
    const matchedImports = imports
      .map((entry) => entry.name)
      .filter((name) => rule.importPrefixes.some((prefix) => name.startsWith(prefix)))
    const matchedAnnotations = annotationNames.filter((name) => rule.annotations.includes(name))
    if (matchedImports.length === 0 && matchedAnnotations.length === 0) continue
    usages.push({
      id: rule.id,
      imports: [...new Set(matchedImports)].sort(),
      annotations: [...new Set(matchedAnnotations)].sort(),
    })
  }
  return usages.sort((left, right) => left.id.localeCompare(right.id))
}

/** 按目录与关键注解生成待人工复核的文件角色候选。 */
function inferRole(filePath, annotations) {
  const annotationNames = new Set(annotations.map((annotation) => annotation.name.split('.').at(-1)))
  const rules = [
    ['test', /\/src\/test\//, 'source-set:test'],
    ['startup-config', /\/DzzzAreaApplication\.java$/, 'startup-class'],
    ['async-integration', /\/(websocket|timer|listener|handler)\//, 'path:async'],
    ['web-entry', /\/(controller|filter|interceptor)\//, 'path:web-entry'],
    ['business', /\/service\//, 'path:service'],
    ['data-access', /\/(dao|mapper)\//, 'path:data-access'],
    ['persistence-model', /\/po\//, 'path:po'],
    ['data-model', /\/(dto|vo|bo|eo)\//, 'path:data-model'],
    ['cross-cutting', /\/(aop|annoation|annotation|exception|context|validator)\//, 'path:cross-cutting'],
    ['infrastructure', /\/(cache|upload|storage|shard)\//, 'path:infrastructure'],
    ['startup-config', /\/config\//, 'path:config'],
    ['common', /\/(util|utils|enums|enum|constant|constants)\//, 'path:common'],
  ]
  for (const [primary, pattern, rule] of rules) {
    if (pattern.test(filePath)) return { primary, rule, status: 'candidate-needs-review' }
  }
  const annotationRules = [
    ['startup-config', ['Configuration', 'SpringBootApplication']],
    ['web-entry', ['Controller', 'RestController']],
    ['business', ['Service']],
    ['data-access', ['Mapper']],
    ['cross-cutting', ['Aspect']],
    ['async-integration', ['ServerEndpoint']],
  ]
  for (const [primary, names] of annotationRules) {
    const match = names.find((name) => annotationNames.has(name))
    if (match) return { primary, rule: `annotation:${match}`, status: 'candidate-needs-review' }
  }
  return { primary: 'unclassified', rule: 'no-rule-match', status: 'candidate-needs-review' }
}

/** 移除只用于注解归属计算的内部范围字段。 */
function removeInternalRanges(values) {
  return values.map((value) => {
    const { _rangeStart, _rangeEnd, ...publicValue } = value
    return publicValue
  })
}

/** 对一个冻结 Java 文件执行结构化自动提取。 */
function analyzeFile(repositoryRoot, inventory, file, codeGraph) {
  const absolutePath = path.join(repositoryRoot, file.path)
  const bytes = fs.readFileSync(absolutePath)
  if (bytes.length !== file.sizeBytes || sha256(bytes) !== file.sha256) {
    throw new Error(`源码快照已漂移：${file.path}`)
  }
  const source = bytes.toString('utf8')
  const cst = parse(source)
  const packageName = extractPackageName(cst)
  const imports = extractImports(source, cst)
  const types = extractTypes(source, cst, packageName)
  const fields = extractFields(source, cst, types)
  const constructors = extractConstructors(source, cst, types)
  const publicMethods = extractPublicMethods(source, cst, types)
  const annotations = extractAnnotations(source, cst, types, packageName)
  const frameworkUsages = extractFrameworkUsages(imports, annotations)
  return {
    schemaVersion: 1,
    snapshotId: inventory.snapshotId,
    inventoryIndex: file.index,
    path: file.path,
    sourceSet: file.sourceSet,
    sourceSha256: file.sha256,
    extractionStatus: 'parsed-needs-review',
    packageName,
    imports,
    declaredTypes: removeInternalRanges(types),
    fields: removeInternalRanges(fields),
    constructors: removeInternalRanges(constructors),
    publicMethods: removeInternalRanges(publicMethods),
    annotations,
    languageFeatures: extractLanguageFeatures(cst, imports),
    frameworkUsages,
    inferredRole: inferRole(file.path, annotations),
    codeGraph,
  }
}

/** 递增普通对象中的统计值。 */
function incrementCount(counts, key, amount = 1) {
  counts[key] = (counts[key] ?? 0) + amount
}

/** 汇总全部自动提取记录的覆盖和能力计数。 */
function summarizeRecords(records, inventory, graphSummary) {
  const summary = {
    files: { main: 0, test: 0, total: records.length },
    extractionStatusCounts: {},
    declarations: {
      types: 0,
      fields: 0,
      constructors: 0,
      publicMethods: 0,
      annotations: 0,
    },
    typeKinds: {},
    roleCandidates: {},
    languageFeatureFiles: {},
    languageFeatureOccurrences: {},
    frameworkUsageFiles: {},
    codeGraph: graphSummary,
    auditStatusCounts: inventory.summary.auditStatusCounts,
  }
  for (const record of records) {
    incrementCount(summary.files, record.sourceSet)
    incrementCount(summary.extractionStatusCounts, record.extractionStatus)
    summary.declarations.types += record.declaredTypes.length
    summary.declarations.fields += record.fields.length
    summary.declarations.constructors += record.constructors.length
    summary.declarations.publicMethods += record.publicMethods.length
    summary.declarations.annotations += record.annotations.length
    for (const type of record.declaredTypes) incrementCount(summary.typeKinds, type.kind)
    incrementCount(summary.roleCandidates, record.inferredRole.primary)
    for (const feature of record.languageFeatures) {
      incrementCount(summary.languageFeatureFiles, feature.id)
      incrementCount(summary.languageFeatureOccurrences, feature.id, feature.count)
    }
    for (const usage of record.frameworkUsages) incrementCount(summary.frameworkUsageFiles, usage.id)
  }
  return summary
}

/** 把记录按固定上限转换为一行一条记录的 JSONL 分片。 */
function createShards(records) {
  const shards = []
  for (let start = 0; start < records.length; start += shardSize) {
    const shardRecords = records.slice(start, start + shardSize)
    const firstIndex = shardRecords[0].inventoryIndex
    const lastIndex = shardRecords.at(-1).inventoryIndex
    const fileName = `dzzz-app-files-${String(firstIndex).padStart(4, '0')}-${String(lastIndex).padStart(4, '0')}.jsonl`
    const content = `${shardRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
    shards.push({
      fileName,
      content,
      fileCount: shardRecords.length,
      firstIndex,
      lastIndex,
      firstPath: shardRecords[0].path,
      lastPath: shardRecords.at(-1).path,
      sha256: sha256(content),
    })
  }
  return shards
}

/** 创建描述分片身份、覆盖统计和工具版本的 manifest。 */
function createManifest(inventory, records, shards, graphSummary) {
  const shardManifest = shards.map(({ content: _content, ...shard }) => shard)
  const contentManifest = `${shardManifest
    .map((shard) => [shard.fileName, shard.fileCount, shard.sha256].join('\t'))
    .join('\n')}\n`
  const analysisContentSha256 = sha256(contentManifest)
  const snapshotDate = inventory.snapshotId.split('-')[2]
  return {
    schemaVersion: 1,
    analysisId: `dzzz-app-analysis-${snapshotDate}-${analysisContentSha256.slice(0, 12)}`,
    snapshotId: inventory.snapshotId,
    sourceManifestSha256: inventory.summary.sourceManifestSha256,
    generatedAt: inventory.generatedAt,
    generator: {
      path: 'docs/backend/java/audit/tooling/extract-dzzz-app.mjs',
      javaParser: '3.0.1',
      minimumNode: '24',
      shardSize,
    },
    recordContract: {
      format: 'JSON Lines; one file record per line',
      status: 'automatic extraction only; every record and CodeGraph edge is a review candidate',
      sensitiveValues: 'method bodies, field initializers, literals, and annotation arguments are excluded',
    },
    summary: summarizeRecords(records, inventory, graphSummary),
    analysisContentSha256,
    shards: shardManifest,
  }
}

/** 比较期望生成文件与磁盘内容，不执行写入。 */
function checkGeneratedFiles(manifestContent, shards) {
  const errors = []
  const expectedFiles = new Map([
    ['manifest.json', manifestContent],
    ...shards.map((shard) => [shard.fileName, shard.content]),
  ])
  for (const [fileName, expectedContent] of expectedFiles) {
    const filePath = path.join(outputDirectory, fileName)
    if (!fs.existsSync(filePath)) errors.push(`缺少生成文件：${fileName}`)
    else if (fs.readFileSync(filePath, 'utf8') !== expectedContent) {
      errors.push(`生成文件已漂移：${fileName}`)
    }
  }
  const existingGeneratedFiles = fs.existsSync(outputDirectory)
    ? fs
        .readdirSync(outputDirectory)
        .filter((fileName) => fileName === 'manifest.json' || /^dzzz-app-files-\d+-\d+\.jsonl$/.test(fileName))
    : []
  for (const fileName of existingGeneratedFiles) {
    if (!expectedFiles.has(fileName)) errors.push(`存在过期生成文件：${fileName}`)
  }
  if (errors.length > 0) throw new Error(errors.join('\n'))
}

/** 原子写入当前生成文件，并只清理同命名规则的过期分片。 */
function writeGeneratedFiles(manifestContent, shards) {
  fs.mkdirSync(outputDirectory, { recursive: true })
  const generatedFiles = [
    { fileName: 'manifest.json', content: manifestContent },
    ...shards.map((shard) => ({ fileName: shard.fileName, content: shard.content })),
  ]
  const expectedNames = new Set(generatedFiles.map((file) => file.fileName))
  for (const file of generatedFiles) {
    const destination = path.join(outputDirectory, file.fileName)
    const temporary = `${destination}.tmp-${process.pid}`
    fs.writeFileSync(temporary, file.content)
    fs.renameSync(temporary, destination)
  }
  for (const fileName of fs.readdirSync(outputDirectory)) {
    if (/^dzzz-app-files-\d+-\d+\.jsonl$/.test(fileName) && !expectedNames.has(fileName)) {
      fs.unlinkSync(path.join(outputDirectory, fileName))
    }
  }
}

/** 执行 Phase 1B 全量自动提取或只读一致性检查。 */
function main() {
  const options = parseArguments(process.argv.slice(2))
  const inventory = readJson(inventoryPath)
  const repositoryRoot = path.resolve(
    options.sourceRepository ?? inventory.target.repositoryRoot,
  )
  const graph = loadCodeGraph(repositoryRoot, inventory)
  const records = inventory.files.map((file, index) => {
    const record = analyzeFile(repositoryRoot, inventory, file, graph.byPath.get(file.path))
    if ((index + 1) % 500 === 0) process.stderr.write(`已解析 ${index + 1}/${inventory.files.length}\n`)
    return record
  })
  validateRecords(records, inventory)
  const shards = createShards(records)
  const manifest = createManifest(inventory, records, shards, graph.summary)
  const manifestContent = stringifyJson(manifest)
  if (options.check) checkGeneratedFiles(manifestContent, shards)
  else writeGeneratedFiles(manifestContent, shards)
  process.stdout.write(
    `${JSON.stringify(
      {
        result: 'PASS',
        mode: options.check ? 'check' : 'write',
        snapshotId: inventory.snapshotId,
        analysisId: manifest.analysisId,
        files: records.length,
        shards: shards.length,
        analysisContentSha256: manifest.analysisContentSha256,
        summary: manifest.summary,
      },
      null,
      2,
    )}\n`,
  )
}

main()
