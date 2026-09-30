import type { SelectorRootState } from '../../app/store'
import type { InventoryItemId } from './inventorySlice'

export type InventorySnapshot = {
  totalUnits: number
  inventoryValueCents: number
  lowStockCount: number
}

/** 读取库存 Feature 的原始商品数组。 */
export const selectInventoryItems = (state: SelectorRootState) => state.inventory.items

/** 组合原始字段 Selector，派生库存总件数。 */
export const selectTotalUnits = (state: SelectorRootState) =>
  selectInventoryItems(state).reduce((total, item) => total + item.quantity, 0)

/** 组合原始字段 Selector，派生库存总金额。 */
export const selectInventoryValueCents = (state: SelectorRootState) =>
  selectInventoryItems(state).reduce((total, item) => total + item.quantity * item.priceCents, 0)

/** 组合原始字段 Selector，派生低库存商品数量。 */
export const selectLowStockCount = (state: SelectorRootState) =>
  selectInventoryItems(state).filter((item) => item.quantity <= item.lowStockThreshold).length

/** 根据额外商品 ID 参数查询单个商品。 */
export function selectInventoryItemById(state: SelectorRootState, itemId: InventoryItemId) {
  return selectInventoryItems(state).find((item) => item.id === itemId)
}

/** 复用单商品 Selector，派生当前库存状态文本。 */
export function selectInventoryStatus(state: SelectorRootState, itemId: InventoryItemId): string {
  const item = selectInventoryItemById(state, itemId)
  if (!item) return '未找到商品'
  if (item.quantity === 0) return '缺货'
  if (item.quantity <= item.lowStockThreshold) return '库存偏低'
  return '库存充足'
}

/** 复用多个 Selector，读取一次命令式库存快照。 */
export function readInventorySnapshot(state: SelectorRootState): InventorySnapshot {
  return {
    totalUnits: selectTotalUnits(state),
    inventoryValueCents: selectInventoryValueCents(state),
    lowStockCount: selectLowStockCount(state),
  }
}
