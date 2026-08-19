import { createElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'

import './jsx-runtime-and-react-element-demo.css'

const jsxElement = (
  <section className="react-element-output" data-origin="jsx">
    <strong>JSX element</strong>
    <span>同一份 UI 描述</span>
  </section>
)

const factoryElement = createElement(
  'section',
  { className: 'react-element-output', 'data-origin': 'createElement' },
  createElement('strong', null, 'createElement'),
  createElement('span', null, '同一份 UI 描述'),
)

const nodeSamples: Array<{ label: string; value: ReactNode }> = [
  { label: 'React element', value: <em key="element">element</em> },
  { label: 'string node', value: '课程' },
  { label: 'number node', value: 3 },
  { label: 'array node', value: [<span key="first">A</span>, <span key="second">B</span>] },
]

/** 把公开的 element type 转换为适合教学展示的文本。 */
function getTypeLabel(element: ReactElement): string {
  return typeof element.type === 'string' ? element.type : '非字符串 element type'
}

/** 展示 JSX、factory、React element、React node 与 DOM node 的边界。 */
export default function JsxRuntimeAndReactElementDemo() {
  return (
    <article className="react-element-demo" data-testid="react-element-demo">
      <header>
        <p>automatic JSX runtime</p>
        <h3>先创建描述，再由 React 渲染</h3>
      </header>

      <div className="react-element-compare" aria-label="JSX 与 createElement 对照">
        {jsxElement}
        {factoryElement}
      </div>

      <dl className="react-element-facts">
        <div>
          <dt>JSX element type</dt>
          <dd>{getTypeLabel(jsxElement)}</dd>
        </div>
        <div>
          <dt>创建时是 HTMLElement</dt>
          <dd data-testid="react-element-is-dom">{String(jsxElement instanceof HTMLElement)}</dd>
        </div>
        <div>
          <dt>开发环境 element / props 浅冻结</dt>
          <dd data-testid="react-element-frozen">
            {String(Object.isFrozen(jsxElement))} / {String(Object.isFrozen(jsxElement.props))}
          </dd>
        </div>
      </dl>

      <table>
        <caption>React node 与 React element 不是同一集合</caption>
        <thead>
          <tr>
            <th scope="col">值</th>
            <th scope="col">isValidElement</th>
          </tr>
        </thead>
        <tbody>
          {nodeSamples.map((sample) => (
            <tr key={sample.label}>
              <th scope="row">{sample.label}</th>
              <td>{String(isValidElement(sample.value))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  )
}
