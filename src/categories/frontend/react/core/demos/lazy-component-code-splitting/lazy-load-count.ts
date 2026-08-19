let lazyPanelLoadCallCount = 0

/** 记录一次真实动态导入，并返回按需面板模块 Promise。 */
export function loadLazyCoursePanel() {
  lazyPanelLoadCallCount += 1
  return import('./lazy-course-panel')
}

/** 读取当前 lazy 面板 loader 的累计调用次数。 */
export function getLazyPanelLoadCallCount(): number {
  return lazyPanelLoadCallCount
}
