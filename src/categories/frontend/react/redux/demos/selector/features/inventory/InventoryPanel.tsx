import { useState, type ReactElement } from 'react'

import { useInventorySelector, useSelectorDispatch } from '../../app/hooks'
import { stockReceived, stockReserved, type InventoryItemId } from './inventorySlice'
import {
  selectInventoryItemById,
  selectInventoryItems,
  selectInventoryStatus,
  selectInventoryValueCents,
  selectLowStockCount,
  selectTotalUnits,
  type InventorySnapshot,
} from './selectors'

type InventoryPanelProps = {
  snapshot: InventorySnapshot
  snapshotVersion: number
  onCaptureSnapshot: () => void
}

/** 把整数分金额格式化为人民币文本。 */
function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amountInCents / 100)
}

/** 展示普通 Selector 在 Hooks、组合查询和命令式快照中的复用。 */
export function InventoryPanel({
  snapshot,
  snapshotVersion,
  onCaptureSnapshot,
}: InventoryPanelProps): ReactElement {
  const [selectedItemId, setSelectedItemId] = useState<InventoryItemId>('keyboard')
  const dispatch = useSelectorDispatch()
  const items = useInventorySelector(selectInventoryItems)
  const totalUnits = useInventorySelector(selectTotalUnits)
  const inventoryValueCents = useInventorySelector(selectInventoryValueCents)
  const lowStockCount = useInventorySelector(selectLowStockCount)
  const selectedItem = useInventorySelector((state) =>
    selectInventoryItemById(state, selectedItemId),
  )
  const selectedStatus = useInventorySelector((state) =>
    selectInventoryStatus(state, selectedItemId),
  )

  /** 选择要通过参数化 Selector 查询的商品。 */
  function selectItem(itemId: InventoryItemId): void {
    setSelectedItemId(itemId)
  }

  /** 为当前商品补充一件库存。 */
  function receiveSelectedItem(): void {
    dispatch(stockReceived({ id: selectedItemId, amount: 1 }))
  }

  /** 为当前商品预留一件库存。 */
  function reserveSelectedItem(): void {
    dispatch(stockReserved({ id: selectedItemId, amount: 1 }))
  }

  return (
    <section className="selector-workbench" aria-label="Selector 库存查询工作台">
      <header className="selector-workbench-header">
        <div>
          <span>features/inventory/selectors.ts</span>
          <h2>库存查询工作台</h2>
        </div>
        <strong>普通 Selector</strong>
      </header>

      <dl className="selector-metrics" aria-label="派生库存指标">
        <div>
          <dt>库存总件数</dt>
          <dd data-testid="selector-total-units">{totalUnits}</dd>
        </div>
        <div>
          <dt>库存总金额</dt>
          <dd data-testid="selector-inventory-value">{formatCurrency(inventoryValueCents)}</dd>
        </div>
        <div>
          <dt>低库存商品</dt>
          <dd data-testid="selector-low-stock-count">{lowStockCount}</dd>
        </div>
      </dl>

      <section className="selector-query" aria-labelledby="selector-query-title">
        <div className="selector-section-heading">
          <div>
            <span>额外参数：itemId</span>
            <h3 id="selector-query-title">查询单个商品</h3>
          </div>
          <output data-testid="selector-selected-status">{selectedStatus}</output>
        </div>

        <div className="selector-item-tabs" aria-label="选择库存商品">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedItemId === item.id}
              onClick={() => selectItem(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {selectedItem ? (
          <div className="selector-selected-item">
            <div>
              <strong>{selectedItem.name}</strong>
              <span>
                单价 {formatCurrency(selectedItem.priceCents)} · 阈值{' '}
                {selectedItem.lowStockThreshold} 件
              </span>
            </div>
            <b data-testid="selector-selected-quantity">{selectedItem.quantity} 件</b>
          </div>
        ) : null}

        <div className="selector-actions">
          <button type="button" data-testid="selector-reserve" onClick={reserveSelectedItem}>
            出库 1 件
          </button>
          <button type="button" data-testid="selector-receive" onClick={receiveSelectedItem}>
            入库 1 件
          </button>
        </div>
      </section>

      <section className="selector-snapshot" aria-labelledby="selector-snapshot-title">
        <div>
          <span>store.getState() + Selector</span>
          <h3 id="selector-snapshot-title">命令式查询快照 #{snapshotVersion}</h3>
          <p>
            {snapshot.totalUnits} 件 · {formatCurrency(snapshot.inventoryValueCents)} ·{' '}
            {snapshot.lowStockCount} 个低库存商品
          </p>
        </div>
        <button type="button" data-testid="selector-capture" onClick={onCaptureSnapshot}>
          读取当前快照
        </button>
      </section>
    </section>
  )
}
