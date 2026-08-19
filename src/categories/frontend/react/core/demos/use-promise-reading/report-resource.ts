export type Report = Readonly<{
  title: string
  summary: string
}>

type ReportResource = Readonly<{
  promise: Promise<Report>
  resolve: (report: Report) => void
  reject: (error: Error) => void
}>

const reportCache = new Map<string, ReportResource>()
let creationCount = 0

/** 为指定资源 key 创建一次本地 deferred Promise，并缓存其控制器。 */
export function prepareReportResource(resourceKey: string): Promise<Report> {
  const cachedResource = reportCache.get(resourceKey)
  if (cachedResource) return cachedResource.promise

  let resolveReport!: (report: Report) => void
  let rejectReport!: (error: Error) => void
  const promise = new Promise<Report>((resolve, reject) => {
    resolveReport = resolve
    rejectReport = reject
  })

  reportCache.set(resourceKey, {
    promise,
    resolve: resolveReport,
    reject: rejectReport,
  })
  creationCount += 1
  return promise
}

/** 返回 render 前已准备好的同一份 cached Promise。 */
export function getReportPromise(resourceKey: string): Promise<Report> {
  const resource = reportCache.get(resourceKey)
  if (!resource) throw new Error('报告资源尚未准备')
  return resource.promise
}

/** 用固定的本地报告兑现指定资源。 */
export function resolveReportResource(resourceKey: string): void {
  reportCache.get(resourceKey)?.resolve({
    title: 'React 课程发布报告',
    summary: '同一个 cached Promise 已由 use 读取并提交。',
  })
}

/** 用固定错误拒绝指定资源。 */
export function rejectReportResource(resourceKey: string): void {
  reportCache.get(resourceKey)?.reject(new Error('本地报告读取失败'))
}

/** 返回当前实验创建过的 Promise 数量。 */
export function getReportCreationCount(): number {
  return creationCount
}

/** 清空本课资源与计数，使下一条路径从 idle 冷启动。 */
export function resetReportResources(): void {
  reportCache.clear()
  creationCount = 0
}
