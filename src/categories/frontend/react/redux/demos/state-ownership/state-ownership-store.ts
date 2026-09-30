import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type WorkflowPhase = 'idle' | 'working' | 'review'

type WorkspaceState = {
  phase: WorkflowPhase
  committedNote: string
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: { phase: 'idle', committedNote: '尚未提交备注' } as WorkspaceState,
  reducers: {
    /** 更新全局工作流阶段。 */
    phaseChanged: (state, action: PayloadAction<WorkflowPhase>) => {
      state.phase = action.payload
    },
    /** 将局部草稿写入已提交业务状态。 */
    noteCommitted: (state, action: PayloadAction<string>) => {
      state.committedNote = action.payload.trim() || '（空备注）'
    },
    /** 恢复工作区的初始业务状态。 */
    reset: (state) => {
      state.phase = 'idle'
      state.committedNote = '尚未提交备注'
    },
  },
})

const store = configureStore({
  reducer: {
    workspace: workspaceSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const { phaseChanged, noteCommitted, reset } = workspaceSlice.actions

/** 读取工作区当前阶段。 */
export const selectPhase = (state: RootState) => state.workspace.phase

/** 读取工作区已提交备注。 */
export const selectCommittedNote = (state: RootState) => state.workspace.committedNote
export { store }
