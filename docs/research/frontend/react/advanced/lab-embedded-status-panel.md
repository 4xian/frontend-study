# React 嵌入式状态面板实战调研与范围冻结

## 1. 准入与目标

- 核验日期：2026-08-19。
- 权威路线：`docs/frontend/plans/react/React课程调整总计划.md`。
- 稳定 ID：`react.core.learn.advanced.lab-embedded-status-panel`。
- 课程标题：`实战：嵌入式状态面板`。
- 当前 live 状态：React Core Track 为 `73 available / 1 planned`，本课是唯一 planned 条目；正文、
  Demo、entry manifest 和 demo manifest 在调研开始前均不存在。
- 冻结范围：只组合外部 Store、受限命令句柄、提交后布局测量、Hydration 与宿主资源所有权。
- 不进入 RSC、Server Functions、Router、第三方状态库、数据请求库、React 私有调度或完整 SSR
  工程化。

## 2. 真实前置

本课不再重新教授各 API，而是要求学习者组合已经完成的公开合同：

1. `react.core.learn.advanced.use-sync-external-store-snapshot`
2. `react.core.learn.intermediate.use-imperative-handle`
3. `react.core.learn.intermediate.use-layout-effect`
4. `react.core.learn.advanced.hydrate-root-markup-identity`

相关但不是强制前置：

- `react.core.learn.basics.react-root-lifecycle`
- `react.core.learn.basics.ref-as-prop`
- `react.core.learn.advanced.use-insertion-effect`
- `react.core.learn.advanced.document-metadata-hoisting`

## 3. 官方事实矩阵

| 能力 | 一手事实 | 本课采用的保守合同 |
| --- | --- | --- |
| `useSyncExternalStore` | `subscribe` 注册变化通知并返回 cleanup；`getSnapshot` 返回缓存快照；变化按 `Object.is` 比较；SSR/Hydration 可提供 `getServerSnapshot` | Store 位于 React Root 外；快照不可变且同一版本复用引用；首次 hydration 的 server snapshot 与静态标记使用同一数据；卸载后 listener 归零 |
| `useImperativeHandle` | 可通过 Ref 暴露自定义 handle；依赖变化时重新创建；不要求把真实 DOM 节点交给父级 | 只公开 `focusPrimaryAction()` 与 `remeasure()`；不公开 `HTMLElement`、任意 selector 或通用 DOM 写接口；卸载后 `ref.current` 为 `null` |
| `useLayoutEffect` | 在浏览器重绘前执行；可以读取布局并立即安排一次更新；会阻塞 paint；服务端不执行 | 只测量已提交的面板节点；不在 render 中读布局；不用于数据请求、订阅或普通同步；测量结果只保存宽高和 revision |
| `hydrateRoot` | 目标容器必须已有 React-compatible HTML；首次客户端输出必须匹配；匹配时可复用节点并接管事件；`root.unmount()` 清理该 Root | 独立同源 Document 先提供静态面板；保存根节点和按钮对象；hydrate 后用对象身份、事件、零 recoverable error 证明接管；卸载只清空 Root 容器 |
| 宿主所有权 | React Root 只拥有传入容器内的 React 树；Document head 中宿主预置资源不属于该 Root | 静态宿主页拥有 `meta` 与 `style` 标记、外部 Store 和 iframe；React 拥有面板容器内节点、订阅和命令 handle；Root 卸载不能删除宿主资源 |

## 4. TypeScript 合同

### 4.1 外部 Store

```ts
type PanelSnapshot = Readonly<{
  revision: number
  status: 'healthy' | 'attention' | 'critical'
  activeServices: number
  label: string
  message: string
}>

type PanelStore = {
  getSnapshot: () => PanelSnapshot
  getServerSnapshot: () => PanelSnapshot
  subscribe: (listener: () => void) => () => void
  publishNext: () => void
}
```

冻结要求：

- 初始快照是模块/Store 实例内缓存对象，不在 `getSnapshot` 中临时创建。
- `getServerSnapshot` 返回与静态 HTML 相同的初始对象。
- 每次真实发布创建新冻结对象，再通知当前 listeners。
- 诊断计数不进入业务 snapshot，避免诊断自身触发 Reader 循环。

### 4.2 命令句柄

```ts
type StatusPanelHandle = {
  focusPrimaryAction: () => CommandEvidence
  remeasure: () => CommandEvidence
}
```

`CommandEvidence` 只返回字符串和数字证据，不返回 DOM 节点。父级不能取得内部 button Ref，不能绕过
组件语义修改 `innerHTML`、样式或任意属性。

### 4.3 测量结果

```ts
type PanelMeasurement = Readonly<{
  revision: number
  width: number
  height: number
}>
```

测量由组件内部的 `useLayoutEffect` 调用 `getBoundingClientRect()`；外部命令只增加测量请求 revision，
真正 DOM 读取仍由下一次提交后的 layout effect 完成。

## 5. 冻结场景

场景是“宿主控制台嵌入一块 React 状态面板”。宿主先提供可阅读的静态 HTML，并拥有全局样式、元数据、
外部状态源和挂载容器。React 脚本加载后只接管面板容器。

组件关系：

```text
学习站 React Demo 外壳
  └─ iframe / 独立同源 Document（宿主所有）
       ├─ <meta data-host-resource>（宿主所有）
       ├─ <style data-host-resource>（宿主所有）
       ├─ PanelStore（React Root 外，宿主所有）
       └─ #embedded-status-root
            └─ StatusPanel（hydrateRoot 所有）
                 ├─ useSyncExternalStore
                 ├─ useImperativeHandle
                 └─ useLayoutEffect
```

独立 Document 的目的不是模拟网络或完整服务器，而是同时满足三点：

1. 静态标记在调用 `hydrateRoot` 前已经由浏览器解析。
2. 面板资源与学习站主 Document 隔离，便于明确 ownerDocument。
3. 可以验证 Root 卸载与宿主 Document 销毁是两个不同生命周期动作。

## 6. 状态序列与可观察结果

| 阶段 | 操作 | 必须观察到的结果 |
| --- | --- | --- |
| 静态宿主 | iframe load | 面板静态文字为 healthy/3；listener 0；host meta/style 各 1；保存静态根节点和主按钮对象 |
| Hydration | 点击“接管静态面板” | recoverable error 0；根节点和按钮身份均保留；listener 1；handle 可用；首次 layout measurement 为正数 |
| Store 更新 | 点击“发布下一状态” | 快照 revision 增加；面板状态按 healthy -> attention -> critical -> healthy 循环；DOM 跟随外部 snapshot；listener 保持 1 |
| 受限聚焦 | 点击“聚焦面板主按钮” | iframe `activeElement` 是内部主按钮；公开 key 仅两个；handle 不是 DOM 节点 |
| 重新测量 | 点击“重新测量” | measurement revision 增加；宽高来自已提交节点且为正数；不暴露节点 |
| Root 卸载 | 点击“卸载 React Root” | 容器子节点 0；listener 0；handle 不可用；host meta/style 仍各 1；Store 快照仍存在 |
| 同 Document 观察 | Root 卸载后查看 | 宿主 Document 和资源仍存在；不能把 Root cleanup 等同于销毁宿主 |
| 新 Document | 点击刷新图标 | iframe 生成新 Document；状态、节点身份、计数和资源回到静态初始值 |

## 7. 首帧标记合同

静态 HTML 与 `StatusPanel` 首次 render 必须逐项一致：

- 相同的 element 类型、嵌套顺序和文字。
- 相同的 `class` / `className`、`data-testid`、`role` 与按钮属性。
- 初始业务快照固定为 revision 0、healthy、3 个 active services 和固定消息。
- 测量区首次显示“等待首次提交后测量”；layout effect 只能在 hydrate 提交后改写它。
- 静态按钮没有 React handler；hydrate 后同一按钮对象才执行 React State 更新。

不使用 `suppressHydrationWarning`，不依赖 React 修补 mismatch，不在 hydrate 前用脚本重写容器。

## 8. 所有权账本

| 资源 | 创建者 | 清理者 | Root 卸载后的预期 |
| --- | --- | --- | --- |
| iframe Document | Demo 外壳 | Demo 外壳或浏览器导航 | 继续存在，直到重建或离页 |
| host meta/style | 静态宿主页 | 宿主 Document | 保留 |
| PanelStore | Demo 外壳 | Demo 外壳 | 快照保留，listener 归零 |
| hydration Root | Demo 交互 | Demo 交互/离页 cleanup | 已卸载，不可复用 |
| 面板 DOM | hydration Root | `root.unmount()` | 清空 |
| Store listener | `useSyncExternalStore` | Hook cleanup | 归零 |
| command handle | `useImperativeHandle` | React ref cleanup | `ref.current === null` |
| layout measurement | 面板组件 | 面板组件 State 生命周期 | 随面板卸载消失，外壳只保留最后证据 |

## 9. 实现文件冻结

只新增以下课程资产：

- `src/categories/frontend/react/core/learn/lab-embedded-status-panel.md`
- `src/categories/frontend/react/core/demos/lab-embedded-status-panel/embedded-status-store.ts`
- `src/categories/frontend/react/core/demos/lab-embedded-status-panel/embedded-status-panel.tsx`
- `src/categories/frontend/react/core/demos/lab-embedded-status-panel/embedded-status-host.html`
- `src/categories/frontend/react/core/demos/lab-embedded-status-panel/lab-embedded-status-panel-demo.tsx`
- `src/categories/frontend/react/core/demos/lab-embedded-status-panel/lab-embedded-status-panel-demo.css`

只修改以下登记/路线文件：

- `src/categories/frontend/react/core/entry-manifest.ts`
- `src/categories/frontend/react/core/demo-manifest.ts`
- `src/categories/frontend/react/core/react-core-track.ts`
- `docs/frontend/plans/react/React课程调整总计划.md`

不修改共享 React adapter、Markdown parser、进度迁移、Vite 多入口或其他课程。

## 10. 易错候选

1. `getSnapshot` 每次创建新对象，导致无限重渲染或无意义更新。
2. 静态 HTML 与 `getServerSnapshot` 的首帧数据不同，产生 hydration mismatch。
3. 在 render 中读取 `getBoundingClientRect()`，把 DOM 读取放到未提交阶段。
4. 用 `useEffect` 做首帧必须生效的布局修正，产生可见跳动。
5. 让命令句柄直接返回内部 DOM 节点，破坏封装。
6. 让命令方法绕过 State/Store 任意改写 DOM，下一次 render 覆盖结果。
7. Root 卸载时连同宿主的 head 资源一起删除，混淆所有权。
8. Root 卸载后继续调用旧 handle 或旧 Root。
9. 在组件 render 中创建 Store，导致订阅源和 snapshot 身份不断更换。
10. 用固定 timeout 或 render 次数证明 hydration、订阅或测量完成。

## 11. 练习候选

1. 为 Store 增加第四个确定状态，并保持不可变快照与循环顺序。
2. 预测同一快照重复通知时组件是否必须重渲染，并用提交证据验证。
3. 将暴露 DOM 的 Ref 改成只含两个命令的 handle。
4. 增加一项提交后高度测量，并解释为什么不能在 render 中读取。
5. 故意让静态状态文字与首次 snapshot 不同，观察 recoverable error 后修复。
6. 写出离页时的资源清理表，区分 React 所有、宿主所有和浏览器所有。

## 12. 验证矩阵

### 12.1 静态与结构

- frontmatter、唯一 H1、连续根级 H2/H3、objectives、recap、sources、pitfalls、exercise 通过解析。
- learner body 不含课号、计划、路线、任务、批次、Gate、复审、完成度、命令、哈希或验收叙事。
- CSS 不含 Grid、`gap`、负字距；按钮、面板和固定观察区在状态切换时不改变外壳布局。
- 新增前端方法均有中文职责注释。
- 正文 Demo ID、demo manifest、entry manifest 与 Track 完全一致。

### 12.2 行为

- 静态 -> hydrate -> store update -> focus -> remeasure -> unmount -> new Document 全序列可重复。
- hydration recoverable error 为 0，静态节点身份保持。
- listener 为 `0 -> 1 -> 0`，公开 handle key 固定且卸载后为空。
- measurement revision 单调增加，宽高为有限正数。
- host meta/style 在 Root 卸载后仍为 `1/1`，学习站主 Document 没有新增对应标记。
- 离页后没有重复 Root、未卸载 Root 或订阅泄漏警告。

### 12.3 页面与命令

- 定向 Prettier、限定 diff-check、类型检查、lint、空测试和生产构建通过。
- 生产构建验证桌面、390px、390px + 32px 根字号，无横向溢出、裁切或遮挡。
- console error/warning、pageerror、失败请求和 4xx/5xx 为零。
- 源码面板展示五个真实运行文件，字符、字节与 SHA-256 同磁盘拼接结果一致。

## 13. 一手来源

- [React `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) - subscribe、
  snapshot 缓存、`Object.is` 与 `getServerSnapshot`/hydration 合同，React 19.2。
- [React `useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) - 自定义 handle、
  依赖与 Ref 合同，React 19.2。
- [React `useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect) - paint 前布局测量、
  阻塞成本与服务端边界，React 19.2。
- [React DOM `hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot) - 既有 HTML、
  首帧一致性、错误回调、Root 更新与卸载，React DOM 19.2。
- [React v19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js) -
  `useSyncExternalStore`、layout effect 与 imperative handle 的固定实现旁证。
- [React v19.2.8 `ReactDOMRoot.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/client/ReactDOMRoot.js) -
  hydration Root 创建与卸载的固定实现旁证。
- [React v19.2.8 `useSyncExternalStore` tests](https://github.com/facebook/react/blob/v19.2.8/packages/use-sync-external-store/src/__tests__/useSyncExternalStoreShared-test.js) -
  快照缓存、订阅与 hydration 行为的官方测试。
- [React v19.2.8 hydration tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js) -
  匹配节点复用、事件接管与 Root 生命周期的官方测试。
- [WHATWG iframe `srcdoc`](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-srcdoc) -
  iframe 内独立 Document 的标准语义。
- [MDN `Document.activeElement`](https://developer.mozilla.org/docs/Web/API/Document/activeElement) -
  owner Document 内焦点验证语义。

## 14. 结论

本课应做成一个独立、确定、可重建的宿主集成状态机。React 只负责 Root 内的声明式 UI、Store 订阅、
有限命令和提交后测量；宿主负责 Document、外部 Store 与 head 资源。所有结论通过真实 DOM 身份、
snapshot revision、listener 数、handle 形状、measurement revision 和资源计数验证，不依赖随机数、
网络、固定延时、render 次数或内部调度细节。
