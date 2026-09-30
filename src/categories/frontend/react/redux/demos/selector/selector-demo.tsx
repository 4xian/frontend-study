import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider } from 'react-redux'

import { createSelectorStore } from './app/store'
import { InventoryPanel } from './features/inventory/InventoryPanel'
import { readInventorySnapshot } from './features/inventory/selectors'

import './selector-demo.css'

/** 创建隔离 store，并把命令式查询快照交给库存面板。 */
function SelectorDemoRoot(): ReactElement {
  const [store] = useState(createSelectorStore)
  const [snapshot, setSnapshot] = useState(() => readInventorySnapshot(store.getState()))
  const [snapshotVersion, setSnapshotVersion] = useState(1)

  /** 通过 store.getState 读取当前状态，并复用同一组 Selector。 */
  function captureSnapshot(): void {
    setSnapshot(readInventorySnapshot(store.getState()))
    setSnapshotVersion((currentVersion) => currentVersion + 1)
  }

  return (
    <Provider store={store}>
      <InventoryPanel
        snapshot={snapshot}
        snapshotVersion={snapshotVersion}
        onCaptureSnapshot={captureSnapshot}
      />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 Selector 库存查询工作台。 */
export function createSelectorDemo(): ComponentType {
  return SelectorDemoRoot
}
