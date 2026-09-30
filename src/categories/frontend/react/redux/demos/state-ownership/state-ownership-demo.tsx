import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import {
  noteCommitted,
  phaseChanged,
  reset,
  selectCommittedNote,
  selectPhase,
  store,
  type WorkflowPhase,
} from './state-ownership-store'
import { useAppDispatch, useAppSelector } from './state-ownership-hooks'

import './state-ownership-demo.css'

const phaseLabels: Record<WorkflowPhase, string> = {
  idle: '待处理',
  working: '处理中',
  review: '待复核',
}

/** 显示跨组件共享的 Redux 工作流状态。 */
function WorkspaceStatusPanel(): ReactElement {
  const phase = useAppSelector(selectPhase)
  const note = useAppSelector(selectCommittedNote)

  return (
    <section className="state-ownership-panel" data-testid="state-ownership-global-panel">
      <div className="state-ownership-panel-heading">
        <span>Redux 共享状态</span>
        <strong>工作区业务事实</strong>
      </div>
      <dl className="state-ownership-values">
        <div>
          <dt>当前阶段</dt>
          <dd data-testid="state-ownership-phase">{phaseLabels[phase]}</dd>
        </div>
        <div>
          <dt>已提交备注</dt>
          <dd data-testid="state-ownership-committed-note">{note}</dd>
        </div>
      </dl>
    </section>
  )
}

/** 显示摘要组件读取的共享 Redux 工作流状态。 */
function WorkspaceSummaryPanel(): ReactElement {
  const phase = useAppSelector(selectPhase)
  const note = useAppSelector(selectCommittedNote)

  return (
    <section
      className="state-ownership-panel state-ownership-summary"
      data-testid="state-ownership-summary-panel"
    >
      <div className="state-ownership-panel-heading">
        <span>Redux 摘要读取</span>
        <strong>跨组件同步结果</strong>
      </div>
      <dl className="state-ownership-values">
        <div>
          <dt>阶段摘要</dt>
          <dd data-testid="state-ownership-summary-phase">{phaseLabels[phase]}</dd>
        </div>
        <div>
          <dt>备注摘要</dt>
          <dd data-testid="state-ownership-summary-note">{note}</dd>
        </div>
      </dl>
    </section>
  )
}

/** 提供共享阶段控制与恢复操作。 */
function WorkspaceControls(): ReactElement {
  const dispatch = useAppDispatch()

  /** 切换 Redux 工作流阶段。 */
  function changePhase(phase: WorkflowPhase): void {
    dispatch(phaseChanged(phase))
  }

  return (
    <div className="state-ownership-controls" aria-label="Redux 阶段控制">
      <button type="button" onClick={() => changePhase('idle')}>
        待处理
      </button>
      <button type="button" onClick={() => changePhase('working')}>
        处理中
      </button>
      <button type="button" onClick={() => changePhase('review')}>
        待复核
      </button>
      <button type="button" onClick={() => dispatch(reset())}>
        恢复初始状态
      </button>
    </div>
  )
}

/** 保存局部草稿，并在提交时写入 Redux。 */
function LocalDraftPanel(): ReactElement {
  const [draft, setDraft] = useState('')
  const dispatch = useAppDispatch()

  /** 提交局部草稿并清空输入框。 */
  function submitDraft(): void {
    dispatch(noteCommitted(draft))
    setDraft('')
  }

  return (
    <section
      className="state-ownership-panel state-ownership-local"
      data-testid="state-ownership-local-panel"
    >
      <div className="state-ownership-panel-heading">
        <span>组件局部状态</span>
        <strong>编辑中的备注草稿</strong>
      </div>
      <label htmlFor="state-ownership-draft">输入草稿</label>
      <textarea
        id="state-ownership-draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="先在组件内编辑，再决定是否提交"
        rows={3}
      />
      <div className="state-ownership-local-footer">
        <span data-testid="state-ownership-draft-count">草稿字符数：{draft.length}</span>
        <button type="button" onClick={submitDraft}>
          提交到 Redux
        </button>
      </div>
    </section>
  )
}

/** 解释 Demo 中各类状态的所有者。 */
function OwnershipLegend(): ReactElement {
  return (
    <aside className="state-ownership-legend" aria-label="状态所有权说明">
      <strong>所有权判断</strong>
      <ul>
        <li>
          <b>Redux</b>
          <span>跨组件共享的客户端业务事实</span>
        </li>
        <li>
          <b>组件</b>
          <span>只在当前组件存在的短暂草稿</span>
        </li>
        <li>
          <b>派生</b>
          <span>由现有值计算出的字符数或标签</span>
        </li>
        <li>
          <b>URL / 服务端</b>
          <span>保留各自的数据来源和生命周期</span>
        </li>
      </ul>
    </aside>
  )
}

/** 创建稳定 store 并组合状态所有权观察面板。 */
function StateOwnershipDemoRoot(): ReactElement {
  return (
    <Provider store={store}>
      <section className="state-ownership-demo" data-testid="state-ownership-demo">
        <header className="state-ownership-heading">
          <span>Redux Toolkit + React Redux</span>
          <h2>状态所有权观察器</h2>
          <p>阶段和已提交备注属于共享业务状态，编辑中的草稿属于当前组件。</p>
        </header>
        <WorkspaceControls />
        <div className="state-ownership-panels">
          <WorkspaceStatusPanel />
          <WorkspaceSummaryPanel />
          <LocalDraftPanel />
        </div>
        <OwnershipLegend />
      </section>
    </Provider>
  )
}

/** 为课程页面注册状态所有权 Demo。 */
export function createStateOwnershipDemo(): ComponentType {
  return StateOwnershipDemoRoot
}
