import { useDispatch, useSelector, useStore } from 'react-redux'

import type { AppDispatch, AppStore, RootState } from './typed-hooks-store'

/** 创建带 AppDispatch 类型的组件派发 Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建带 RootState 类型的组件选择 Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()

/** 创建带 AppStore 类型的组件 store Hook。 */
export const useAppStore = useStore.withTypes<AppStore>()
