import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import { createTaskFilterStore } from './app/store'
import { TasksPanel } from './features/tasks/TasksPanel'

import './task-filter-panel-demo.css'

/** 为任务筛选面板创建独立 store，并提供 React Redux 上下文。 */
function TaskFilterPanelDemoRoot(): ReactElement {
  const [store] = useState(createTaskFilterStore)
  return (
    <Provider store={store}>
      <TasksPanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册任务筛选面板组件。 */
export function createTaskFilterPanelDemo(): ComponentType {
  return TaskFilterPanelDemoRoot
}
