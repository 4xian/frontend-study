import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './multiple-slices-root-state-store'

/** 创建绑定多 Slice store dispatch 类型的 Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建绑定多 Slice RootState 类型的 Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()
