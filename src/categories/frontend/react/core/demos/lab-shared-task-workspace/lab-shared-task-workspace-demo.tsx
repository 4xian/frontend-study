import {
  RestoreWorkspaceButton,
  TaskComposer,
  TaskDetails,
  TaskFilterBar,
  TaskList,
  WorkspaceHelp,
  WorkspaceShell,
  WorkspaceSummary,
} from './workspace-panels'
import { WorkspaceProvider } from './workspace-provider'
import './lab-shared-task-workspace-demo.css'

/** 组合局部帮助区和一个拥有共享任务 State 的 Provider 子树。 */
export default function LabSharedTaskWorkspaceDemo() {
  return (
    <section
      className="shared-task-workspace-demo"
      data-testid="shared-task-workspace-demo"
      aria-labelledby="shared-workspace-title"
    >
      <header className="shared-workspace-heading">
        <p>Project task workspace</p>
        <h2 id="shared-workspace-title">共享任务工作区</h2>
        <span>汇总、筛选、列表和详情围绕同一份任务事实协作。</span>
      </header>

      <WorkspaceHelp />

      <WorkspaceProvider>
        <WorkspaceShell>
          <WorkspaceSummary />
          <TaskComposer />
          <TaskFilterBar />
          <div className="shared-workspace-content">
            <TaskList />
            <TaskDetails />
          </div>
          <RestoreWorkspaceButton />
        </WorkspaceShell>
      </WorkspaceProvider>
    </section>
  )
}
