import { configureStore } from '@reduxjs/toolkit'

import inventoryReducer from '../features/inventory/inventorySlice'

/** 创建隔离的 Selector Demo store。 */
export function createSelectorStore() {
  return configureStore({
    reducer: {
      inventory: inventoryReducer,
    },
  })
}

export type SelectorStore = ReturnType<typeof createSelectorStore>
export type SelectorRootState = ReturnType<SelectorStore['getState']>
export type SelectorDispatch = SelectorStore['dispatch']
