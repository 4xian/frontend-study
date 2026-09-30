import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type InventoryItemId = 'keyboard' | 'notebook' | 'lamp'

export type InventoryItem = {
  id: InventoryItemId
  name: string
  quantity: number
  priceCents: number
  lowStockThreshold: number
}

type InventoryState = {
  items: InventoryItem[]
}

type StockPayload = {
  id: InventoryItemId
  amount: number
}

const initialState: InventoryState = {
  items: [
    {
      id: 'keyboard',
      name: '机械键盘',
      quantity: 6,
      priceCents: 39900,
      lowStockThreshold: 3,
    },
    {
      id: 'notebook',
      name: '方格笔记本',
      quantity: 2,
      priceCents: 3900,
      lowStockThreshold: 4,
    },
    {
      id: 'lamp',
      name: '桌面阅读灯',
      quantity: 1,
      priceCents: 24900,
      lowStockThreshold: 2,
    },
  ],
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    /** 增加指定商品的库存数量。 */
    stockReceived: (state, action: PayloadAction<StockPayload>) => {
      const item = state.items.find((currentItem) => currentItem.id === action.payload.id)
      if (item) item.quantity += action.payload.amount
    },
    /** 扣减指定商品的库存数量，但不低于零。 */
    stockReserved: (state, action: PayloadAction<StockPayload>) => {
      const item = state.items.find((currentItem) => currentItem.id === action.payload.id)
      if (item) item.quantity = Math.max(0, item.quantity - action.payload.amount)
    },
  },
})

export const { stockReceived, stockReserved } = inventorySlice.actions
export default inventorySlice.reducer
