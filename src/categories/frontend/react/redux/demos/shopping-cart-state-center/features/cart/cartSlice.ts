import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ShoppingCartRootState } from '../../app/store'
import { getProductById, type ProductId } from './products'

export type CouponCode = 'none' | 'SAVE10'

export type CartLine = {
  productId: ProductId
  quantity: number
}

type CartState = {
  lines: CartLine[]
  couponCode: CouponCode
}

const initialState: CartState = {
  lines: [
    { productId: 'keyboard', quantity: 1 },
    { productId: 'notebook', quantity: 2 },
  ],
  couponCode: 'none',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** 把商品加入购物车，已有条目只增加数量。 */
    productAdded: (state, action: PayloadAction<ProductId>) => {
      const line = state.lines.find((item) => item.productId === action.payload)
      if (line) {
        line.quantity += 1
        return
      }
      state.lines.push({ productId: action.payload, quantity: 1 })
    },
    /** 增加指定购物车条目的数量。 */
    quantityIncremented: (state, action: PayloadAction<ProductId>) => {
      const line = state.lines.find((item) => item.productId === action.payload)
      if (line) line.quantity += 1
    },
    /** 减少数量，并在数量降到零时移除条目。 */
    quantityDecremented: (state, action: PayloadAction<ProductId>) => {
      const line = state.lines.find((item) => item.productId === action.payload)
      if (!line) return
      if (line.quantity === 1) {
        state.lines = state.lines.filter((item) => item.productId !== action.payload)
        return
      }
      line.quantity -= 1
    },
    /** 移除指定购物车条目。 */
    productRemoved: (state, action: PayloadAction<ProductId>) => {
      state.lines = state.lines.filter((item) => item.productId !== action.payload)
    },
    /** 设置当前优惠码。 */
    couponChanged: (state, action: PayloadAction<CouponCode>) => {
      state.couponCode = action.payload
    },
    /** 清空购物车并移除优惠码。 */
    cartCleared: (state) => {
      state.lines = []
      state.couponCode = 'none'
    },
    /** 恢复购物车的初始快照。 */
    cartReset: () => initialState,
  },
})

/** 读取购物车中的原始条目。 */
export const selectCartLines = (state: ShoppingCartRootState) => state.cart.lines

/** 读取当前优惠码。 */
export const selectCouponCode = (state: ShoppingCartRootState) => state.cart.couponCode

/** 派生购物车商品总件数。 */
export const selectCartQuantity = (state: ShoppingCartRootState) =>
  state.cart.lines.reduce((total, line) => total + line.quantity, 0)

/** 派生购物车小计金额，单位为分。 */
export const selectCartSubtotal = (state: ShoppingCartRootState) =>
  state.cart.lines.reduce(
    (total, line) => total + getProductById(line.productId).priceCents * line.quantity,
    0,
  )

/** 派生当前优惠金额，单位为分。 */
export const selectCartDiscount = (state: ShoppingCartRootState) =>
  state.cart.couponCode === 'SAVE10' ? Math.round(selectCartSubtotal(state) * 0.1) : 0

/** 派生最终应付金额，单位为分。 */
export const selectCartPayable = (state: ShoppingCartRootState) =>
  selectCartSubtotal(state) - selectCartDiscount(state)

export const {
  productAdded,
  quantityIncremented,
  quantityDecremented,
  productRemoved,
  couponChanged,
  cartCleared,
  cartReset,
} = cartSlice.actions

export default cartSlice.reducer
