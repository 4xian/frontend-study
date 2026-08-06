/** 收集记录中不应写入生成文件的字面量或多行源码片段。 */
function collectRestrictedContent(value, pointer, errors) {
  if (errors.length >= 20) return
  if (typeof value === 'string') {
    if (/["'`\r\n]/.test(value)) errors.push(`受限内容：${pointer}`)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRestrictedContent(item, `${pointer}/${index}`, errors))
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, item] of Object.entries(value)) {
    collectRestrictedContent(item, `${pointer}/${key}`, errors)
  }
}

/** 在写入或比较分片前验证单文件记录合同。 */
export function validateRecords(records, inventory) {
  const errors = []
  if (records.length !== inventory.files.length) {
    errors.push(`记录数不匹配：${records.length}/${inventory.files.length}`)
  }
  for (let index = 0; index < records.length && errors.length < 20; index += 1) {
    const record = records[index]
    const source = inventory.files[index]
    if (
      !source ||
      record.inventoryIndex !== source.index ||
      record.path !== source.path ||
      record.sourceSet !== source.sourceSet ||
      record.sourceSha256 !== source.sha256
    ) {
      errors.push(`清单身份不匹配：${record.path}`)
    }
    if (!record.packageName) errors.push(`缺少 package 名称：${record.path}`)
    for (const annotation of record.annotations) {
      if (annotation.site === 'package' && annotation.target !== record.packageName) {
        errors.push(`package 注解目标不匹配：${record.path}`)
      }
    }
    const typeStrings = [
      ...record.declaredTypes.flatMap((type) => [
        type.typeParameters,
        ...type.extends,
        ...type.implements,
        ...type.permits,
      ]),
      ...record.fields.map((field) => field.type),
      ...record.constructors.flatMap((constructor) => [
        ...constructor.parameterTypes,
        ...constructor.throws,
        constructor.signature,
      ]),
      ...record.publicMethods.flatMap((method) => [
        method.typeParameters,
        method.returnType,
        ...method.parameterTypes,
        ...method.throws,
        method.signature,
      ]),
    ].filter(Boolean)
    if (typeStrings.some((value) => /(?:^|<)unknown(?:>|$)/i.test(value))) {
      errors.push(`存在未知类型：${record.path}`)
    }
    const methodKeys = record.publicMethods.map((method) => `${method.owner}\u0000${method.signature}`)
    if (new Set(methodKeys).size !== methodKeys.length) {
      errors.push(`公开方法归属或签名重复：${record.path}`)
    }
    const enumOwners = new Set(
      record.declaredTypes.filter((type) => type.kind === 'enum').map((type) => type.qualifiedName),
    )
    if (
      record.constructors.some(
        (constructor) =>
          enumOwners.has(constructor.owner) && constructor.visibility !== 'private',
      )
    ) {
      errors.push(`枚举构造器可见性错误：${record.path}`)
    }
    collectRestrictedContent(record, record.path, errors)
  }
  if (errors.length > 0) throw new Error(errors.join('\n'))
}
