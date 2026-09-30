import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './state-ownership-store'

/** 创建绑定状态所有权 Demo store 的 dispatch Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建绑定状态所有权 Demo RootState 的 selector Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()
