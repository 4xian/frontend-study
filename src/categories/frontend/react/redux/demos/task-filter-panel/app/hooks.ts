import { useDispatch, useSelector } from 'react-redux'

import type { TaskFilterDispatch, TaskFilterRootState } from './store'

/** 创建任务筛选面板的预类型 dispatch Hook。 */
export const useTaskFilterDispatch = useDispatch.withTypes<TaskFilterDispatch>()

/** 创建任务筛选面板的预类型 selector Hook。 */
export const useTaskFilterSelector = useSelector.withTypes<TaskFilterRootState>()
