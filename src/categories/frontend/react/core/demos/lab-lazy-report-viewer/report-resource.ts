export type ReportId = 'enrollment' | 'runtime'

export type Report = Readonly<{
  id: ReportId
  title: string
  summary: string
  updatedAt: string
  metrics: readonly Readonly<{
    label: string
    value: string
  }>[]
}>

type ReportResource = Readonly<{
  report: Report
  promise: Promise<Report>
  resolve: (report: Report) => void
  reject: (error: Error) => void
}>

const reportFixtures: Record<ReportId, Report> = {
  enrollment: {
    id: 'enrollment',
    title: '课程报名质量报告',
    summary: '报名流程保持可用，校验失败集中在缺少先修课程与重复提交。',
    updatedAt: '2026-08-17 10:30',
    metrics: [
      { label: '有效报名', value: '286' },
      { label: '待补材料', value: '18' },
      { label: '重复提交', value: '7' },
    ],
  },
  runtime: {
    id: 'runtime',
    title: '前端运行稳定性报告',
    summary: '核心页面保持稳定，剩余异常主要来自按需模块与过期资源。',
    updatedAt: '2026-08-17 11:10',
    metrics: [
      { label: '正常会话', value: '1,248' },
      { label: '局部恢复', value: '31' },
      { label: '未恢复失败', value: '4' },
    ],
  },
}

const reportResources = new Map<string, ReportResource>()
let reportCreationCount = 0

/** 为一次读取尝试创建并缓存可手动完成的报告 Promise。 */
export function prepareReportResource(resourceKey: string, reportId: ReportId): Promise<Report> {
  const cachedResource = reportResources.get(resourceKey)
  if (cachedResource) return cachedResource.promise

  let resolveReport!: (report: Report) => void
  let rejectReport!: (error: Error) => void
  const promise = new Promise<Report>((resolve, reject) => {
    resolveReport = resolve
    rejectReport = reject
  })

  reportResources.set(resourceKey, {
    report: reportFixtures[reportId],
    promise,
    resolve: resolveReport,
    reject: rejectReport,
  })
  reportCreationCount += 1
  return promise
}

/** 返回 render 前已经准备好的同一份报告 Promise。 */
export function getReportPromise(resourceKey: string): Promise<Report> {
  const resource = reportResources.get(resourceKey)
  if (!resource) throw new Error('报告资源尚未准备')
  return resource.promise
}

/** 用当前资源绑定的固定报告数据兑现 Promise。 */
export function resolveReportResource(resourceKey: string): void {
  const resource = reportResources.get(resourceKey)
  if (!resource) return
  resource.resolve(resource.report)
}

/** 用固定错误拒绝当前报告 Promise。 */
export function rejectReportResource(resourceKey: string): void {
  reportResources.get(resourceKey)?.reject(new Error('报告数据读取失败'))
}

/** 返回当前实验创建过的报告 Promise 数量。 */
export function getReportCreationCount(): number {
  return reportCreationCount
}

/** 清空报告资源与计数，使下一条实验路径从冷启动开始。 */
export function resetReportResources(): void {
  reportResources.clear()
  reportCreationCount = 0
}
