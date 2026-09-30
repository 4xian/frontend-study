import { useDispatch, useSelector } from 'react-redux'

import type { SelectorDispatch, SelectorRootState } from './store'

/** 提供带 Demo dispatch 类型的 Hook。 */
export const useSelectorDispatch = useDispatch.withTypes<SelectorDispatch>()

/** 提供带 Demo RootState 类型的 Hook。 */
export const useInventorySelector = useSelector.withTypes<SelectorRootState>()
