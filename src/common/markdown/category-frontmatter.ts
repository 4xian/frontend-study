import { parseDocument } from 'yaml'
import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const kebabId = nonEmptyString.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const stableId = nonEmptyString.regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/)
const httpUrl = z.url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
  message: '只允许 HTTP(S) URL',
})
const sourceType = z.enum([
  'specification',
  'api-doc',
  'official-reference',
  'release-note',
  'source-code',
  'official-test',
  'security-standard',
  'static-analysis',
  'engineering-reference',
  'project-source',
])
const source = z.strictObject({
  id: kebabId.optional(),
  title: nonEmptyString,
  url: httpUrl,
  sourceType: sourceType.optional(),
  appliesTo: nonEmptyString.optional(),
  claims: z.array(nonEmptyString).optional(),
})
const projectEvidence = z.strictObject({
  file: nonEmptyString,
  symbol: nonEmptyString,
  usage: z.enum(['observed', 'adapted', 'corrected', 'rejected']),
})
const commonShape = {
  id: stableId,
  title: nonEmptyString,
  summary: nonEmptyString,
  domain: z.enum(['frontend', 'backend', 'network']),
  technology: kebabId,
  module: kebabId,
  related: z.array(stableId),
  tags: z.array(nonEmptyString).min(1),
  appliesTo: nonEmptyString,
  verifiedAt: nonEmptyString,
  sources: z.array(source).min(1),
  modernBaseline: z.record(nonEmptyString, nonEmptyString).optional(),
  legacyBaseline: z.record(nonEmptyString, nonEmptyString).optional(),
  projectEvidence: z.array(projectEvidence).optional(),
}
const lessonSchema = z.strictObject({
  ...commonShape,
  type: z.literal('lesson'),
  stage: kebabId,
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.int().positive(),
  prerequisites: z.array(stableId),
  objectives: z.array(nonEmptyString).min(1),
  recap: z.array(nonEmptyString).optional(),
})
const referenceSchema = z.strictObject({
  ...commonShape,
  type: z.literal('reference'),
  group: kebabId,
  signature: nonEmptyString,
  anchors: z.array(nonEmptyString),
})

export const categoryFrontmatterSchema = z.discriminatedUnion('type', [
  lessonSchema,
  referenceSchema,
])

export type CategoryFrontmatter = z.infer<typeof categoryFrontmatterSchema>

/** 严格解析并校验类别 Markdown 的 YAML frontmatter。 */
export function parseCategoryFrontmatter(value: string, sourcePath: string): CategoryFrontmatter {
  const document = parseDocument(value, {
    version: '1.2',
    schema: 'core',
    strict: true,
    stringKeys: true,
    uniqueKeys: true,
    merge: false,
    resolveKnownTags: false,
  })
  if (document.errors.length > 0 || document.warnings.length > 0) {
    const messages = [...document.errors, ...document.warnings].map((item) => item.message)
    throw new Error(`[${sourcePath}] frontmatter YAML 无效：${messages.join('；')}`)
  }

  let rawValue: unknown
  try {
    rawValue = document.toJS({ maxAliasCount: 0 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[${sourcePath}] frontmatter YAML 无效：${message}`)
  }
  const result = categoryFrontmatterSchema.safeParse(rawValue)
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('；')
    throw new Error(`[${sourcePath}] frontmatter 校验失败：${details}`)
  }
  return result.data
}
