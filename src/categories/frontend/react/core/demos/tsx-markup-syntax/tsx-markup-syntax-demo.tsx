import './tsx-markup-syntax-demo.css'

/** 展示 TSX 的闭合、嵌套、Fragment、注释与文本标记规则。 */
export default function TsxMarkupSyntaxDemo() {
  return (
    <>
      <article className="react-tsx-markup-card">
        {/* jsx-comment-not-visible：这条注释不会成为页面文字。 */}
        <header>
          <p className="react-tsx-markup-kicker">React Core</p>
          <h3>TSX 标记观察区</h3>
          <p>这里的标签都显式闭合，并按打开顺序反向关闭。</p>
        </header>

        <ul>
          <li>
            <strong>空元素：</strong>
            <code>&lt;br /&gt;</code>
          </li>
          <li>
            <strong>文字 entity：</strong>
            <code>&lt;section&gt;</code> 会显示尖括号
          </li>
          <li>
            <strong>JSX 注释：</strong>源码中的注释不会进入这段文字
          </li>
        </ul>

        <footer>
          <span>通过</span>
          <strong>标记具有共同外层边界</strong>
        </footer>
      </article>

      <aside className="react-tsx-markup-note">
        外层 Fragment 让观察区与这条说明保持同级，没有增加包装节点。
      </aside>
    </>
  )
}
