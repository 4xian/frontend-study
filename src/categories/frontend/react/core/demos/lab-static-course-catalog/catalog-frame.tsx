import type { ReactNode } from 'react'

type CatalogFrameProps = {
  title: string
  inspector: ReactNode
  children: ReactNode
}

/** 组合静态目录标题、主要内容与组件树观察区域。 */
export function CatalogFrame({ title, inspector, children }: CatalogFrameProps) {
  return (
    <article className="static-catalog-demo">
      <header className="static-catalog-heading">
        <p>静态数据组装</p>
        <h2>{title}</h2>
      </header>

      <div className="static-catalog-layout">
        <div className="static-catalog-main">{children}</div>
        <aside className="static-catalog-inspector" aria-label="组件树观察">
          {inspector}
        </aside>
      </div>
    </article>
  )
}
