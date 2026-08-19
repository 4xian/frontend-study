import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import {
  createInitialWorkspaceState,
  workspaceReducer,
  type WorkspaceAction,
  type WorkspaceState,
} from './workspace-model'

const WorkspaceStateContext = createContext<WorkspaceState | null>(null)
const WorkspaceDispatchContext = createContext<Dispatch<WorkspaceAction> | null>(null)

/** 读取最近工作区 Provider 的 State，并显式暴露缺失边界。 */
export function useWorkspaceState(): WorkspaceState {
  const state = useContext(WorkspaceStateContext)
  if (state === null) throw new Error('useWorkspaceState 必须在 WorkspaceProvider 内使用')
  return state
}

/** 读取最近工作区 Provider 的 dispatch，并显式暴露缺失边界。 */
export function useWorkspaceDispatch(): Dispatch<WorkspaceAction> {
  const dispatch = useContext(WorkspaceDispatchContext)
  if (dispatch === null) {
    throw new Error('useWorkspaceDispatch 必须在 WorkspaceProvider 内使用')
  }
  return dispatch
}

/** 拥有工作区 reducer State，并向同一子树提供读取与更新通道。 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createInitialWorkspaceState)

  return (
    <WorkspaceStateContext value={state}>
      <WorkspaceDispatchContext value={dispatch}>{children}</WorkspaceDispatchContext>
    </WorkspaceStateContext>
  )
}
