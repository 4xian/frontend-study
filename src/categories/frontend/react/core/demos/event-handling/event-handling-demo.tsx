import type { MouseEvent, ReactNode } from 'react'
import './event-handling-demo.css'

type EventActionProps = {
  children: ReactNode
  mode: 'normal' | 'stop'
  onActivate: () => void
}

/** 取得事件节点的演示名称。 */
function describeNode(node: EventTarget): string {
  return node instanceof HTMLElement ? (node.dataset.node ?? node.tagName.toLowerCase()) : 'unknown'
}

/** 把领域动作 prop 明确连接到内部按钮。 */
function EventAction({ children, mode, onActivate }: EventActionProps) {
  /** 展示目标信息，并按按钮合同决定是否停止传播。 */
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (mode === 'stop') {
      event.stopPropagation()
    }

    window.alert(
      [
        '2. target：按钮 handler',
        `target：${describeNode(event.target)}`,
        `currentTarget：${describeNode(event.currentTarget)}`,
        `继续冒泡：${mode === 'normal' ? '是' : '否'}`,
      ].join('\n'),
    )
    onActivate()
  }

  return (
    <button
      className="event-handling-demo-action"
      data-mode={mode}
      data-node={`${mode}-button`}
      type="button"
      onClick={handleClick}
    >
      <span data-node={`${mode}-label`}>{children}</span>
    </button>
  )
}

/** 展示事件目标、传播顺序与默认行为的独立控制。 */
export default function EventHandlingDemo() {
  /** 展示父级 capture 先于目标 handler 执行。 */
  function handleCapture(event: MouseEvent<HTMLElement>) {
    window.alert(
      [
        '1. capture：父级面板',
        `target：${describeNode(event.target)}`,
        `currentTarget：${describeNode(event.currentTarget)}`,
      ].join('\n'),
    )
  }

  /** 展示未被停止的 click 到达父级 bubble。 */
  function handleBubble(event: MouseEvent<HTMLElement>) {
    window.alert(
      ['3. bubble：父级面板', `defaultPrevented：${String(event.defaultPrevented)}`].join('\n'),
    )
  }

  /** 执行允许冒泡的领域动作。 */
  function handleNormalAction() {
    console.info('执行普通课程动作')
  }

  /** 执行与父级 click 隔离的领域动作。 */
  function handleStoppedAction() {
    console.info('执行隔离课程动作')
  }

  /** 阻止链接默认导航，但保留正常冒泡。 */
  function handlePreview(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    window.alert(
      [
        '2. target：预览链接 handler',
        `target：${describeNode(event.target)}`,
        `currentTarget：${describeNode(event.currentTarget)}`,
        `defaultPrevented：${String(event.defaultPrevented)}`,
        '继续冒泡：是',
      ].join('\n'),
    )
  }

  return (
    <section className="event-handling-demo" aria-labelledby="event-handling-demo-title">
      <header className="event-handling-demo-heading">
        <p>Event path</p>
        <h2 id="event-handling-demo-title">观察传播与默认行为</h2>
      </header>

      <p className="event-handling-demo-intro">
        每个对话框显示当前阶段。点击按钮内部文字，可以比较 target 与 currentTarget。
      </p>

      <div
        className="event-handling-demo-stage"
        data-node="父级面板"
        onClick={handleBubble}
        onClickCapture={handleCapture}
      >
        <div className="event-handling-demo-actions">
          <EventAction mode="normal" onActivate={handleNormalAction}>
            普通传播
          </EventAction>
          <EventAction mode="stop" onActivate={handleStoppedAction}>
            阻止冒泡
          </EventAction>
          <a
            className="event-handling-demo-link"
            data-node="预览链接"
            href="#event-preview-destination"
            onClick={handlePreview}
          >
            <span data-node="preview-label">阻止默认导航</span>
          </a>
        </div>
      </div>

      <ul className="event-handling-demo-notes">
        <li>普通传播：capture → target → bubble。</li>
        <li>阻止冒泡：capture → target，之后停止。</li>
        <li>阻止默认导航：地址不变，事件仍进入 bubble。</li>
      </ul>
    </section>
  )
}
