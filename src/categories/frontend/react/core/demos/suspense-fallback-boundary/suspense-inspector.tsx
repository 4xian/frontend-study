import { useEffect } from 'react'

type SuspenseInspectorProps = {
  onReveal: () => void
}

/** 渲染内层资源就绪后的课程检查器。 */
export default function SuspenseInspector({ onReveal }: SuspenseInspectorProps) {
  useEffect(() => {
    onReveal()
  }, [onReveal])

  return (
    <section className="suspense-boundary-inspector" data-testid="suspense-inspector">
      <span>内层内容已 reveal</span>
      <strong>3 项检查全部就绪</strong>
      <ul>
        <li>课程正文可读取</li>
        <li>Demo 交互可观察</li>
        <li>来源边界已确认</li>
      </ul>
    </section>
  )
}
