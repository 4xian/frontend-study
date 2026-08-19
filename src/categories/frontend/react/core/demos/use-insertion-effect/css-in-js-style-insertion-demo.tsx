import './css-in-js-style-insertion-demo.css'
import { useInsertionEffect, useState } from 'react'

type StyleMode = 'neutral' | 'accent'

const styleRules: Record<StyleMode, string> = {
  neutral: `
.css-in-js-style-insertion-demo-card {
  padding: 20px;
  border: 2px solid #82918d;
  background: #f1f5f4;
  color: #243330;
}
`,
  accent: `
.css-in-js-style-insertion-demo-card {
  padding: 28px;
  border: 4px solid #b54d2c;
  background: #fff0e8;
  color: #572619;
}
`,
}

/** 演示 CSS-in-JS 库如何在布局 Effect 前插入并替换运行时样式。 */
export default function CssInJsStyleInsertionDemo() {
  const [styleMode, setStyleMode] = useState<StyleMode>('neutral')

  useInsertionEffect(
    /** 为当前模式插入唯一课程样式，并在模式变化或卸载时清理本次节点。 */
    () => {
      const styleElement = document.createElement('style')
      styleElement.dataset.courseStyle = 'react-use-insertion-effect'
      styleElement.textContent = styleRules[styleMode]
      document.head.appendChild(styleElement)

      /** 只移除当前插入 Effect 创建的样式节点。 */
      function removeInsertedStyle() {
        styleElement.remove()
      }

      return removeInsertedStyle
    },
    [styleMode],
  )

  /** 在事件数据流中切换规则来源，不在插入 Effect 内更新 State。 */
  function handleStyleModeChange() {
    setStyleMode(styleMode === 'neutral' ? 'accent' : 'neutral')
  }

  return (
    <section
      className="css-in-js-style-insertion-demo"
      aria-labelledby="style-insertion-title"
      data-style-mode={styleMode}
      data-testid="css-in-js-style-insertion-demo"
    >
      <header className="css-in-js-style-insertion-demo-header">
        <div>
          <p>CSS-in-JS 样式资源</p>
          <h3 id="style-insertion-title">布局读取前完成样式插入</h3>
        </div>
        <span data-testid="style-mode">{styleMode === 'neutral' ? '中性模式' : '强调模式'}</span>
      </header>

      <div className="css-in-js-style-insertion-demo-card" data-testid="runtime-style-card">
        <strong>运行时规则预览</strong>
        <p>背景、边框和内边距来自插入 Effect 管理的 style 节点。</p>
      </div>

      <div className="css-in-js-style-insertion-demo-status" role="status" aria-live="polite">
        <span>当前规则</span>
        <output>{styleMode}</output>
        <p>样式节点已由插入 Effect 管理。</p>
      </div>

      <div className="css-in-js-style-insertion-demo-controls">
        <button type="button" data-testid="style-mode-button" onClick={handleStyleModeChange}>
          {styleMode === 'neutral' ? '切换到强调模式' : '恢复中性模式'}
        </button>
      </div>
    </section>
  )
}
