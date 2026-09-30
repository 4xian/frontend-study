import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './redux-devtools-store'

/** 创建绑定 Redux DevTools Demo dispatch 类型的 Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建绑定 Redux DevTools Demo RootState 类型的 Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()
