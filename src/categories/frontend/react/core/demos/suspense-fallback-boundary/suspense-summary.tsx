import { useEffect } from 'react'

type SuspenseSummaryProps = {
  onReveal: () => void
}

/** 渲染外层资源就绪后的工作区摘要。 */
export default function SuspenseSummary({ onReveal }: SuspenseSummaryProps) {
  useEffect(() => {
    onReveal()
  }, [onReveal])

  return (
    <section className="suspense-boundary-summary" data-testid="suspense-summary">
      <span>外层内容已 reveal</span>
      <strong>课程发布摘要</strong>
      <p>摘要已经就绪；检查器可以继续在自己的最近边界中等待。</p>
    </section>
  )
}
