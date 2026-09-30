import { configureStore } from '@reduxjs/toolkit'

import cartReducer from '../features/cart/cartSlice'

/** 创建购物车状态中心使用的 Redux store。 */
export function createShoppingCartStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
  })
}

export type ShoppingCartStore = ReturnType<typeof createShoppingCartStore>
export type ShoppingCartRootState = ReturnType<ShoppingCartStore['getState']>
export type ShoppingCartDispatch = ShoppingCartStore['dispatch']
