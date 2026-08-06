import type { ContentType, DomainId } from './types'

export interface ContentLocation {
  domain: DomainId
  technology: string
  module: string
  contentType: ContentType
  slug: string
}

export interface ModuleLocation {
  domain: DomainId
  technology: string
  module: string
}

export interface TechnologyLocation {
  domain: DomainId
  technology: string
}

/** 按领域和技术生成 Technology 总览路径。 */
export function buildTechnologyPath(location: TechnologyLocation): string {
  return `/${location.domain}/${location.technology}`
}

/** 按统一类别层级生成模块总览路径。 */
export function buildModulePath(location: ModuleLocation): string {
  return `${buildTechnologyPath(location)}/${location.module}`
}

/** 按统一类别层级生成不包含学习阶段的内容详情路径。 */
export function buildContentPath(location: ContentLocation): string {
  return `${buildModulePath(location)}/${location.contentType}/${location.slug}`
}
