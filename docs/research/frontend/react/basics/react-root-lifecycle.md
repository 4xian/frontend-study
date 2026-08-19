# React Root 与页面入口

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.react-root-lifecycle`
- 标题：React Root 与页面入口
- 教学层级：本科范围的 React 基础课
- 核验日期：`2026-08-15`
- 文档基线：React 文档 `19.2`
- 运行时基线：React DOM `19.2.8`，固定提交
  `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`
- 类型核验：固定 `@types/react-dom@19.2.4`；该声明由 DefinitelyTyped 单独发布
- 研究状态：官方资料核验完成，可用于修订课程

本知识点只回答浏览器页面入口如何把 DOM 容器交给 React、Root 如何首次显示和后续更新内容，以及
Root 如何结束对容器的管理。主线是 `DOM container -> createRoot -> Root -> root.render`，并补充
局部页面的多个独立 Root、外部宿主销毁容器时的 `unmount` 顺序，以及客户端入口与 hydration 入口
的选择边界。

本知识点不展开 Strict Mode、render/commit、reconciliation、State/Props、Effect、Portal、错误边界、
完整 Root options、SSR 流程或 hydration 细节。

## 研究方法与证据边界

1. 按仓库搜索顺序先使用 Tavily 定位 React 文档、React 固定版本源码与发布物候选，再回到官方文档、
   DOM Standard、React DOM `v19.2.8` 固定提交和 npm 发布物核验关键结论。
2. 应用代码可以依赖的合同以 React `19.2` 公共文档为主；固定版本源码和测试用于核验当前版本的
   开发警告、首次 render、后续更新、卸载失效与容器标记，不把内部字段或实现顺序写成公共 API。
3. React DOM `19.2.8` 发布包没有 `types` 或 `typings` 字段。TypeScript 证据来自独立发布的
   `@types/react-dom@19.2.4`，不能表述成 React DOM 自带的第一方类型。
4. live 资产审计只读取本课程正文、同名 Demo、entry manifest 的本课程条目、demo manifest 的本课程
   条目和 Track 的本课程条目；本记录不修改这些资产，也不进入下一知识点。

## 官方来源卡

| ID | 官方直接来源 | 适用版本 | 本记录采用的结论 |
| --- | --- | --- | --- |
| `react-versions` | [React Versions](https://react.dev/versions) | React 文档 `19.2` | React 文档与 19.2 发布线的版本基线。 |
| `react-create-root` | [`createRoot`](https://react.dev/reference/react-dom/client/createRoot) | React DOM 文档 `19.2` | `createRoot`、`root.render`、`root.unmount` 的参数、返回值、首次显示、后续更新、多个 Root、宿主销毁与 SSR 入口边界。 |
| `react-create-element` | [`createElement`](https://react.dev/reference/react/createElement#what-is-a-react-element-exactly) | React 文档 `19.2` | 创建 React element 只得到 UI 描述，不会调用组件或创建 DOM。 |
| `react-hydrate-root` | [`hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot) | React DOM 文档 `19.2` | 已由 `react-dom/server` 生成 HTML 时使用 hydration；纯客户端空入口不反用 `hydrateRoot`。 |
| `react-dom-ref` | [React DOM `v19.2.8` tag ref](https://api.github.com/repos/facebook/react/git/ref/tags/v19.2.8) | React DOM `19.2.8` | 固定 tag 对应提交 `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。 |
| `react-root-source` | [`ReactDOMRoot.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/client/ReactDOMRoot.js) | React DOM `19.2.8` | Root 的 Flow 接口、创建、render、unmount、重复创建的开发警告、旧 Root 失效与容器标记解除。 |
| `react-root-tests` | [`ReactDOMRoot-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMRoot-test.js) | React DOM `19.2.8` | 首次 render 替换旧 HTML、同 Root 更新、重复创建警告、卸载后同容器重建，以及宿主错误清空 children 的边界。 |
| `react-container-source` | [`ReactDOMContainer.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactDOMContainer.js) | React DOM `19.2.8` | DOM 容器的固定版本运行时校验。 |
| `react-dom-npm` | [`react-dom@19.2.8` metadata](https://registry.npmjs.org/react-dom/19.2.8) | React DOM `19.2.8` | npm 发布物的版本、`gitHead` 与无内置 TypeScript 声明字段。 |
| `react-dom-types` | [`@types/react-dom@19.2.4` 发布物](https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.4.tgz) | React DOM types `19.2.4` | `Container`、`Root`、`createRoot` 的 TypeScript 公共类型面。 |
| `dom-get-element` | [`getElementById`](https://dom.spec.whatwg.org/#dom-nonelementparentnode-getelementbyid) | DOM Standard | 查询不到匹配元素时返回 `null`，页面入口必须处理这一分支。 |

## 一、页面入口的最小链路

```text
DOM container
  -> createRoot(container)
  -> Root { render, unmount }
  -> root.render(reactNode)
  -> React 在 container 内显示内容
```

`createRoot` 接受页面中已经存在的 DOM 容器并返回 Root。创建 Root 本身不会自动显示内容，入口还需要
调用 `root.render`。React element 也只是 UI 描述；写出 `<App />` 不等于组件已经显示到 DOM。
证据：`react-create-root`、`react-create-element`。

React 文档面向常规页面入口把参数称为 DOM element。固定 React DOM 源码和生态类型还允许
`Element | Document | DocumentFragment`，但初学入口应使用明确的页面元素，不需要展开 document 或
fragment 的特殊宿主场景。`getElementById` 可能返回 `null`，因此 TypeScript 代码必须在
`createRoot(container)` 前完成存在性判断。证据：`react-create-root`、`react-root-source`、
`react-dom-types`、`dom-get-element`。

```tsx
const container = document.getElementById('root')

if (!container) {
  throw new Error('缺少 #root 页面入口')
}

const root = createRoot(container)
root.render(<App />)
```

这段代码只建立入口责任：DOM 查询、Root 创建、首次显示。组件内容、Props、State 与副作用不进入本
知识点。

## 二、`root.render` 的公共合同

`root.render(reactNode)` 接受可显示的 React node，并返回 `undefined`。第一次调用时，React 会清除
Root 容器内部原有的 HTML，再显示传入内容；容器元素本身仍由外部页面持有。证据：
`react-create-root`、`react-root-tests`、`react-dom-types`。

在同一个 Root 上再次调用 `render` 表示更新，而不是创建第二个 Root。React 文档说明它会按需要更新
DOM。课程只需要讲“复用同一个 Root 更新”的入口规则，不展开 reconciliation 或 DOM 提交算法。
证据：`react-create-root`、`react-root-tests`。

两个常见误解应直接排除：

- `root.render` 的返回值不是 DOM node、组件实例、Root 或 Promise。
- `root.render` 只接收 React node；DOM 容器已经在 `createRoot` 时传入，不应再次作为第二参数传入。

证据：`react-create-root`、`react-dom-types`。

## 三、一个容器只维护一个存活 Root

完整由 React 构建的应用通常只有一个顶层 Root。React 局部嵌入既有页面时，可以让每个相互独立的
顶层 UI 区域使用各自的 DOM 容器和 Root；“多个 Root”指多个独立容器，不是对同一容器重复调用
`createRoot`。证据：`react-create-root`。

React DOM `19.2.8` 对已经拥有存活 Root 的容器再次调用 `createRoot` 时，会在开发环境写入错误日志，
要求调用已有 Root 的 `render` 来更新。它不是这里可依赖的同步异常合同，课程和 Demo 都不应把
`try/catch` 当作重复创建检测方式。证据：`react-root-source`、`react-root-tests`。

应用层规则可以收敛为：入口保存 Root 实例；首次进入时创建，后续显示变化复用该实例的 `render`。
不要在每次按钮点击、模块刷新或内容变化时重新创建 Root。

## 四、`root.unmount` 结束当前 Root

`root.unmount()` 会卸载当前 Root 内的组件，让 React 与该容器脱离，并移除这棵 React 树对应的事件
处理和状态。它不接收参数，返回 `undefined`。完整 React 应用通常不会手动卸载顶层 Root；这个 API
主要用于 React 嵌入其他宿主、而宿主拥有独立销毁生命周期的场景。证据：`react-create-root`、
`react-dom-types`。

卸载后必须区分“旧对象”和“旧容器”：

1. 旧 Root 对象永久失效，再调用它的 `render` 会抛出 `Cannot update an unmounted root.`。
2. 原 DOM 容器已经与旧 Root 脱离，可以传给新的 `createRoot`，得到一个新的 Root 对象。

这两项都是 React 公共文档明确说明的行为。React DOM `19.2.8` 当前实现会把 Root 的内部引用置空、
把内容更新为 `null` 并解除容器标记；这些步骤用于解释固定版本行为，不是应用可访问的 API。
证据：`react-create-root`、`react-root-source`、`react-root-tests`。

TypeScript 的 `Root` 接口只有 `render` 与 `unmount` 方法，不会因一次 `unmount()` 调用而把变量改成
“已卸载”类型。代码必须由宿主生命周期和引用管理避免复用旧 Root，不能依赖静态类型发现这个错误。
证据：`react-dom-types`。

## 五、外部宿主必须先协调卸载

如果非 React 系统可能移除 Root 容器或它的祖先，宿主应在移除流程中先调用 `root.unmount()`，再移除
对应 DOM。否则 React 无法知道容器已经从页面消失，组件也无法可靠清理订阅等全局资源。证据：
`react-create-root`。

顺序不能改写成“先清空 Root 容器的 `innerHTML`，再 unmount”。React DOM `19.2.8` 的固定测试表明，
宿主先破坏 React 管理的 children，随后卸载可能触发 DOM 移除错误。课程只需要给出所有权顺序，不
教学内部节点清理。证据：`react-root-tests`。

```text
宿主创建或取得容器
  -> createRoot
  -> render / update
  -> root.unmount
  -> 宿主移除容器
```

## 六、客户端入口与 hydration 入口

`createRoot` 适用于客户端新建 React UI。若容器中的 HTML 已由 `react-dom/server` 生成，官方明确要求
使用 `hydrateRoot`，而不是用 `createRoot` 重新接管。反过来，没有预生成 React HTML 的纯客户端入口
也不应使用 `hydrateRoot`。证据：`react-create-root`、`react-hydrate-root`。

本知识点只保留入口选择：

```text
客户端新建 React UI              -> createRoot + root.render
react-dom/server 已生成 React HTML -> hydrateRoot
```

SSR、streaming、markup identity、mismatch、hydration options 和恢复策略全部移到 hydration 专题。

## 七、公共合同与固定版本实现的分层

| 结论 | 证据层级 | 课程口径 |
| --- | --- | --- |
| `createRoot` 返回带 `render`、`unmount` 的 Root | React 公共文档与公开类型 | 可作为应用合同。 |
| 首次 render 清除容器内部原有 HTML | React 公共文档 | 可作为应用合同。 |
| 同 Root 后续 render 用于更新 | React 公共文档 | 可作为应用合同；不展开更新算法。 |
| `unmount` 后旧 Root 不可再次 render | React 公共文档 | 可作为应用合同。 |
| 卸载后同一 DOM 容器可创建新 Root | React 公共文档 | 可作为应用合同。 |
| 重复 `createRoot` 写入开发错误日志 | React DOM `19.2.8` 源码与测试 | 作为当前诊断行为；不写成同步抛错保证。 |
| unmount 把内部 Root 引用置空并解除容器标记 | React DOM `19.2.8` 源码 | 只用于解释，不进入业务 API。 |
| 先破坏 React children 再卸载可能触发 DOM 错误 | React DOM `19.2.8` 测试 | 支撑宿主顺序；不教学内部清理。 |

## 八、关键结论证据矩阵

| 关键结论 | 官方证据 |
| --- | --- |
| 页面入口必须先取得真实 DOM 容器，并处理查询结果可能为 `null` | `react-create-root`、`dom-get-element`、`react-dom-types` |
| 创建 Root 或 React element 本身不会显示内容，显示由 `root.render` 发起 | `react-create-root`、`react-create-element` |
| 首次 render 替换容器内部旧 HTML，后续 render 复用同一 Root 更新 | `react-create-root`、`react-root-tests` |
| 一个存活容器复用一个 Root；局部页面可为不同容器建立多个 Root | `react-create-root`、`react-root-source` |
| `unmount` 结束旧 Root；旧对象不能复用，但原容器可交给新 Root | `react-create-root`、`react-root-source`、`react-root-tests` |
| 外部宿主应先协调 unmount，再移除容器 | `react-create-root`、`react-root-tests` |
| 预生成 React HTML 使用 `hydrateRoot`，纯客户端入口使用 `createRoot` | `react-create-root`、`react-hydrate-root` |
| TypeScript 声明来自独立的 `@types/react-dom` 发布物 | `react-dom-npm`、`react-dom-types` |

## 九、2026-08-15 live 课程、Demo 与 manifest 审计

以下建议基于本次只读到的当前课程正文、同名 Demo、本课程 entry/demo manifest 条目和 Track 条目。
修订学习者内容时，不应把研究日期、固定提交、资产状态、验证命令或生产流程写进正文。

### 1. 保留

- 保留 `DOM container -> createRoot -> Root -> root.render` 作为全文主线，并明确创建 Root 与创建
  React element 都不等于内容已经显示。证据：`react-create-root`、`react-create-element`。
- 保留首次 render 清除容器内部旧 HTML、同 Root 后续 render 用于更新的对照。更新部分只保留结果，
  不解释 reconciliation 或 DOM 提交机制。证据：`react-create-root`、`react-root-tests`。
- 保留一个完整 React 应用通常一个 Root，以及局部嵌入页面可为不同 DOM 区域创建多个独立 Root 的
  场景。证据：`react-create-root`。
- 保留 `unmount`、旧 Root 失效、同一容器创建新 Root 三步边界，并继续让 Demo 捕获旧 Root 再
  `render` 的错误。证据：`react-create-root`、`react-root-source`。
- 保留外部宿主移除容器前先 `unmount` 的所有权顺序。证据：`react-create-root`、
  `react-root-tests`。
- 保留 hydration 的一行入口选择，但不扩展 SSR 或 hydration 过程。证据：`react-create-root`、
  `react-hydrate-root`。
- 保留现有 Demo ID
  `react.core.learn.basics.react-root-lifecycle.root-lifecycle-demo`、React runtime、同名 TSX source
  映射与现有五段生命周期演示；本次未发现需要新增 Demo 或改变登记关系的理由。

### 2. 补充

- 把课程与 Demo 的显示标题统一调整为“React Root 与页面入口”，让标题覆盖入口职责而不把正文误导
  成 React 内部生命周期课。
- 在最小入口示例中补充 DOM 查询的 `null` 分支，避免把 `getElementById` 结果未经判断传给
  `createRoot`。证据：`dom-get-element`、`react-dom-types`。
- 明确 `createRoot` 返回 Root 但不显示内容，`root.render` 返回 `undefined` 且只接收 React node。
  证据：`react-create-root`、`react-dom-types`。
- 把“同一容器不可重复创建存活 Root”写成应用规则，并把 React DOM `19.2.8` 的实际表现准确写成
  开发错误日志；不要描述为可捕获的同步异常。证据：`react-root-source`、`react-root-tests`。
- 在宿主销毁示例中固定 `root.unmount -> remove container` 顺序，不使用先清空 `innerHTML` 的示例。
  证据：`react-create-root`、`react-root-tests`。
- Demo 复用现有交互和状态机，只调整标题与解释文案；继续把旧 Root 错误捕获后显示在界面中，不向
  console 泄漏预期错误。

### 3. 删除

- 删除“上一课”“下一课”“本阶段”“第几课”等生产路线措辞；正文只描述当前知识点的前置概念和
  不展开边界。
- 删除完整 Root options 章节，以及 `identifierPrefix`、三个错误回调、Error Boundary 和错误上报
  策略的逐项教学；本课最多保留 `createRoot(container, options?)` 的签名形状。
- 删除 Portal API、跨 DOM 事件语义与浮层实现建议；它们不是“页面入口与 Root 所有权”的必要前提。
- 删除 Effect、`flushSync`、render/commit 时序、reconciliation、DOM 更新算法和 State 保留规则的
  展开；后续 render 只讲“复用同一 Root 更新”。
- 删除 TypeScript `7.0.2` fixture、临时目录、编译结果表、Gate/验收叙事，以及课程编号、批次、任务、
  字数或行数等生产信息。
- 删除把重复 `createRoot` 说成同步抛异常的表述；当前固定版本的证据是开发环境错误日志。

### 4. 移动

- Root options、`useId` 前缀、错误回调与 Error Boundary 移动到对应 API 或错误处理课程。
- Portal 的目标容器、事件传播与浮层组织移动到 Portal 课程。
- Effect 清理、订阅实现与组件卸载行为移动到 Effect 生命周期课程；本课只保留宿主必须调用
  `root.unmount` 的原因。
- State 保留、key identity、reconciliation、render/commit 与 DOM 提交移动到各自课程。
- SSR、streaming、markup identity、mismatch 与 hydration options 移动到 hydration 课程。
- React DOM 内部 `_internalRoot`、容器标记与同步 flush 顺序只保留在研究证据层，不进入学习者正文。

### 5. 合并

- 把“获取容器”“创建 Root”“首次 render”合并为一个页面入口示例，紧接着解释每一步的输入、输出
  和所有权，避免重复展示相同代码。
- 把“后续 render”“不可重复 createRoot”“多个局部 Root”合并为一节 Root 复用规则：同一容器复用
  现有 Root，不同独立容器才创建不同 Root。
- 把“unmount”“旧 Root 报错”“同容器新 Root”合并成一个连续的生命周期演示，保持现有 Demo 的
  五段可观察流程。
- 把 SSR、静态生成 HTML 与 hydration 的多段说明合并为一张两行入口选择表。
- 把公共合同与源码实现说明合并到同一对照表中，正文只保留公共合同，固定版本内部行为放在研究注释。

审计后的课程应让学习者准确回答六个问题：页面入口为什么必须先取得 DOM 容器、`createRoot` 返回
什么、首次与后续 `render` 有何区别、为什么同一容器要复用 Root、`unmount` 后旧 Root 与原容器各自
处于什么状态，以及什么时候应改用 `hydrateRoot`。其余内部机制与相邻 API 不进入本知识点。
