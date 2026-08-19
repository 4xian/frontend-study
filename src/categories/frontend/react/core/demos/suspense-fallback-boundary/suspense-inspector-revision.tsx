import { useEffect } from 'react'

type SuspenseInspectorRevisionProps = {
  onReveal: () => void
}

/** 渲染再次挂起结束后提交的新版检查器。 */
export default function SuspenseInspectorRevision({ onReveal }: SuspenseInspectorRevisionProps) {
  useEffect(() => {
    onReveal()
  }, [onReveal])

  return (
    <section className="suspense-boundary-inspector" data-testid="suspense-inspector-revision">
      <span>内层新版内容已 reveal</span>
      <strong>检查器已更新为第 2 版</strong>
      <ul>
        <li>摘要始终位于内层边界之外</li>
        <li>旧检查器在再次挂起时被 fallback 替换</li>
        <li>新版就绪后只提交内层检查器区域</li>
      </ul>
    </section>
  )
}
