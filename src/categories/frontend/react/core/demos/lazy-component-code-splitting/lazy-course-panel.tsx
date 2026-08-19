/** @jsxImportSource react */

import { useState } from 'react'

import { getLazyPanelLoadCallCount } from './lazy-load-count'

/** 渲染按需加载的课程面板，并保存只属于当前挂载实例的局部版本。 */
export default function LazyCoursePanel() {
  const [localRevision, setLocalRevision] = useState(0)

  return (
    <article className="lazy-split-demo-panel" data-testid="lazy-course-panel">
      <span>独立动态模块已就绪</span>
      <strong>进阶报告面板</strong>
      <dl>
        <div>
          <dt>loader 调用</dt>
          <dd>
            <output data-testid="lazy-loader-count">{getLazyPanelLoadCallCount()}</output> 次
          </dd>
        </div>
        <div>
          <dt>局部版本</dt>
          <dd>
            <output data-testid="lazy-local-revision">{localRevision}</output>
          </dd>
        </div>
      </dl>
      <button type="button" onClick={() => setLocalRevision((revision) => revision + 1)}>
        修改局部版本
      </button>
    </article>
  )
}
