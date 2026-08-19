type ReportViewerModule = typeof import('./lazy-report-panel')

type ModuleGate = Readonly<{
  promise: Promise<void>
  resolve: () => void
  reject: (error: Error) => void
}>

const moduleGates = new Map<string, ModuleGate>()
let moduleLoaderCallCount = 0

/** 创建一次可由控制区手动完成的模块加载门。 */
function createModuleGate(): ModuleGate {
  let resolveModule!: () => void
  let rejectModule!: (error: Error) => void
  const promise = new Promise<void>((resolve, reject) => {
    resolveModule = resolve
    rejectModule = reject
  })

  return {
    promise,
    resolve: resolveModule,
    reject: rejectModule,
  }
}

/** 为新的 lazy 类型准备独立的模块加载门。 */
export function prepareReportModule(moduleKey: string): void {
  if (!moduleGates.has(moduleKey)) moduleGates.set(moduleKey, createModuleGate())
}

/** 等待手动加载门后执行真实动态导入，并记录 lazy loader 调用。 */
export function loadReportModule(moduleKey: string): Promise<ReportViewerModule> {
  prepareReportModule(moduleKey)
  moduleLoaderCallCount += 1
  return moduleGates.get(moduleKey)!.promise.then(() => import('./lazy-report-panel'))
}

/** 允许当前 lazy loader 继续完成动态导入。 */
export function resolveReportModule(moduleKey: string): void {
  moduleGates.get(moduleKey)?.resolve()
}

/** 拒绝当前 lazy loader，交给最近的 Error Boundary。 */
export function rejectReportModule(moduleKey: string): void {
  moduleGates.get(moduleKey)?.reject(new Error('报告查看器代码加载失败'))
}

/** 返回实验内累计调用 lazy loader 的次数。 */
export function getModuleLoaderCallCount(): number {
  return moduleLoaderCallCount
}

/** 清空模块门和计数，使下一条实验路径使用全新 lazy 身份。 */
export function resetReportModules(): void {
  moduleGates.clear()
  moduleLoaderCallCount = 0
}
