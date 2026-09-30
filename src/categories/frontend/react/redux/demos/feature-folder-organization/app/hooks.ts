import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './store'

/** 创建绑定应用 AppDispatch 类型的 Hook。 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** 创建绑定应用 RootState 类型的 Hook。 */
export const useAppSelector = useSelector.withTypes<RootState>()
