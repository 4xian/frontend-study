import { useRef, useState } from 'react'
import './callback-refs-demo.css'

type NodeRegistryItem = {
  id: string
  title: string
  summary: string
}

type IndexSnapshot = {
  count: number
  ids: string
  status: string
}

const candidateItems: NodeRegistryItem[] = [
  { id: 'focus-input', title: '聚焦输入框', summary: '对已提交节点执行聚焦命令。' },
  { id: 'scroll-target', title: '滚动到目标', summary: '按稳定 ID 取得当前滚动目标。' },
  { id: 'measure-panel', title: '读取几何', summary: '在用户事件中采样节点尺寸。' },
  { id: 'dynamic-index', title: '动态节点索引', summary: '登记数量会变化的宿主节点。' },
  { id: 'cleanup-check', title: '清理旧节点', summary: '移除条目时删除失效节点记录。' },
]

/** 展示 Callback Ref 如何让动态列表与 Map 节点索引保持一致。 */
export default function CallbackRefsDemo() {
  const itemNodesRef = useRef<Map<string, HTMLLIElement>>(new Map())
  const [items, setItems] = useState<NodeRegistryItem[]>(() => candidateItems.slice(0, 3))
  const [selectedId, setSelectedId] = useState(candidateItems[0]!.id)
  const [indexSnapshot, setIndexSnapshot] = useState<IndexSnapshot | null>(null)
  const [actionMessage, setActionMessage] = useState('等待检查当前节点索引')

  /** 为一个稳定条目 ID 创建成对登记与清理节点的 Callback Ref。 */
  function createItemRef(itemId: string) {
    return (node: HTMLLIElement | null) => {
      if (node === null) return

      const itemNodes = itemNodesRef.current
      itemNodes.set(itemId, node)

      return () => {
        itemNodes.delete(itemId)
      }
    }
  }

  /** 添加固定候选中的下一项，让 React 提交后触发节点登记。 */
  function handleAddNext() {
    const nextItem = candidateItems.find(
      (candidate) => !items.some((item) => item.id === candidate.id),
    )
    if (!nextItem) {
      setActionMessage('全部候选项都已加入')
      return
    }

    setItems([...items, nextItem])
    setSelectedId(nextItem.id)
    setIndexSnapshot(null)
    setActionMessage(`已添加 ${nextItem.title}，可检查提交后的节点索引`)
  }

  /** 移除当前选择，让对应 Callback Ref cleanup 删除旧节点记录。 */
  function handleRemoveSelected() {
    if (items.length === 1) {
      setActionMessage('至少保留一个观察项')
      return
    }

    const remainingItems = items.filter((item) => item.id !== selectedId)
    const selectedItem = items.find((item) => item.id === selectedId)
    setItems(remainingItems)
    setSelectedId(remainingItems[0]!.id)
    setIndexSnapshot(null)
    setActionMessage(`已移除 ${selectedItem?.title ?? selectedId}，可检查 cleanup 结果`)
  }

  /** 通过稳定 ID 取得当前宿主节点，并把它聚焦和滚动进观察区。 */
  function handleLocateSelected() {
    const node = itemNodesRef.current.get(selectedId)
    if (!node) {
      setActionMessage(`节点 ${selectedId} 尚未登记`)
      return
    }

    node.focus({ preventScroll: true })
    node.scrollIntoView({ behavior: 'auto', block: 'nearest' })
    setActionMessage(`已定位 ${node.dataset.itemId}`)
  }

  /** 在用户事件中读取 Map，并发布不含 DOM 节点的普通证据快照。 */
  function handleInspectIndex() {
    const itemNodes = itemNodesRef.current
    const registeredIds = candidateItems
      .filter((candidate) => itemNodes.has(candidate.id))
      .map((candidate) => candidate.id)
    const matchesCurrentDom =
      itemNodes.size === items.length &&
      items.every((item) => itemNodes.get(item.id)?.dataset.itemId === item.id)

    setIndexSnapshot({
      count: itemNodes.size,
      ids: registeredIds.join(' / '),
      status: matchesCurrentDom ? '与当前 DOM 一致' : '需要重新检查',
    })
    setActionMessage('已读取当前提交后的节点索引')
  }

  /** 恢复三个初始条目与默认选择，便于重复验证完整流程。 */
  function handleReset() {
    setItems(candidateItems.slice(0, 3))
    setSelectedId(candidateItems[0]!.id)
    setIndexSnapshot(null)
    setActionMessage('已恢复初始列表，可重新检查节点索引')
  }

  return (
    <section className="callback-refs-demo" data-testid="callback-refs-demo">
      <header className="callback-refs-demo-heading">
        <p>动态节点索引</p>
        <h2>让节点索引跟随列表提交结果</h2>
        <span>State 描述列表；Callback Ref 只登记和清理当前宿主节点。</span>
      </header>

      <div className="callback-refs-demo-toolbar" aria-label="动态节点操作">
        <label htmlFor="callback-refs-selection">当前目标</label>
        <select
          id="callback-refs-selection"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <div className="callback-refs-demo-actions">
          <button
            type="button"
            onClick={handleAddNext}
            disabled={items.length === candidateItems.length}
          >
            添加下一项
          </button>
          <button type="button" onClick={handleLocateSelected}>
            定位已选项
          </button>
          <button type="button" onClick={handleRemoveSelected} disabled={items.length === 1}>
            移除已选项
          </button>
          <button type="button" onClick={handleInspectIndex}>
            检查节点索引
          </button>
          <button type="button" onClick={handleReset}>
            恢复初始列表
          </button>
        </div>
      </div>

      <ul
        className="callback-refs-demo-list"
        data-testid="callback-refs-list"
        aria-label="当前 DOM 节点列表"
      >
        {items.map((item) => (
          <li
            key={item.id}
            ref={createItemRef(item.id)}
            className="callback-refs-demo-item"
            data-item-id={item.id}
            data-selected={item.id === selectedId ? 'true' : 'false'}
            tabIndex={-1}
          >
            <span>{item.id}</span>
            <strong>{item.title}</strong>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>

      <div className="callback-refs-demo-status" role="status" aria-live="polite">
        <div>
          <span>列表 State</span>
          <strong data-testid="callback-refs-item-count">{items.length} 项</strong>
        </div>
        <div>
          <span>节点 Map 快照</span>
          <strong data-testid="callback-refs-index-count">
            {indexSnapshot === null ? '尚未检查' : `${indexSnapshot.count} 项`}
          </strong>
        </div>
        <div>
          <span>一致性</span>
          <strong data-testid="callback-refs-index-status">
            {indexSnapshot?.status ?? '等待检查'}
          </strong>
        </div>
      </div>

      <p className="callback-refs-demo-evidence" data-testid="callback-refs-index-ids">
        {indexSnapshot?.ids ?? actionMessage}
      </p>
      <p className="callback-refs-demo-message" data-testid="callback-refs-action-message">
        {actionMessage}
      </p>
    </section>
  )
}
