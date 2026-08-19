export const resourceHintsMessageSource = 'react-resource-hints-demo'

export const resourceHintsFixturePath =
  '/src/categories/frontend/react/core/demos/resource-hints/resource-hints-fixture.html'

export const resourceHintClassicUrl = '/react-course-fixtures/resource-hint-classic.js'
export const resourceHintModuleUrl = '/react-course-fixtures/resource-hint-module.js'
export const resourceHintStyleUrl = '/react-course-fixtures/resource-hint-style.css'

export type ResourceHintAction =
  | 'declare-connections'
  | 'preload-resources'
  | 'preinit-resources'
  | 'repeat-resources'
  | 'unmount-root'
  | 'remount-root'

export type ResourceHintStage =
  | 'loading'
  | 'ready'
  | 'connections'
  | 'preloaded'
  | 'preinitializing'
  | 'preinitialized'
  | 'repeated'
  | 'root-unmounted'
  | 'root-remounted'

export type ResourceHintRootState = 'loading' | 'mounted' | 'unmounted' | 'remounted'

export type ResourceHintSnapshot = Readonly<{
  stage: ResourceHintStage
  rootState: ResourceHintRootState
  dnsCount: number
  preconnectCount: number
  classicPreloadCount: number
  modulePreloadCount: number
  classicScriptCount: number
  moduleScriptCount: number
  stylesheetCount: number
  classicRuns: number
  moduleRuns: number
  styleApplied: boolean
  firstFetchPriority: string
  firstCrossOrigin: string
  headEntries: readonly string[]
}>

export type ResourceHintCommandMessage = Readonly<{
  source: typeof resourceHintsMessageSource
  type: 'command'
  action: ResourceHintAction
}>

export type ResourceHintSnapshotMessage = Readonly<{
  source: typeof resourceHintsMessageSource
  type: 'snapshot'
  snapshot: ResourceHintSnapshot
}>

/** 判断跨 realm 消息是否为资源提示 fixture 发出的状态快照。 */
export function isResourceHintSnapshotMessage(
  value: unknown,
): value is ResourceHintSnapshotMessage {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ResourceHintSnapshotMessage>
  return (
    candidate.source === resourceHintsMessageSource &&
    candidate.type === 'snapshot' &&
    Boolean(candidate.snapshot)
  )
}
