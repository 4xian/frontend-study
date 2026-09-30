import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import { createShoppingCartStore } from './app/store'
import { CartPanel } from './features/cart/CartPanel'

import './shopping-cart-state-center-demo.css'

/** 为购物车状态中心创建独立 store，并提供 React Redux 上下文。 */
function ShoppingCartStateCenterDemoRoot(): ReactElement {
  const [store] = useState(createShoppingCartStore)
  return (
    <Provider store={store}>
      <CartPanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册购物车状态中心组件。 */
export function createShoppingCartStateCenterDemo(): ComponentType {
  return ShoppingCartStateCenterDemoRoot
}
