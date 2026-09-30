import { useDispatch, useSelector } from 'react-redux'

import type { ShoppingCartDispatch, ShoppingCartRootState } from './store'

/** 创建购物车状态中心的预类型 dispatch Hook。 */
export const useShoppingCartDispatch = useDispatch.withTypes<ShoppingCartDispatch>()

/** 创建购物车状态中心的预类型 selector Hook。 */
export const useShoppingCartSelector = useSelector.withTypes<ShoppingCartRootState>()
