# Demo 与交互规范

> 版本：v1.0  
> 状态：生效

## 1. 创建条件

Demo 只用于展示可观察行为，例如状态变化、更新时序、生命周期、缓存、错误传播、配置结果或资源
清理。纯类型推导、编译错误、tree-shaking、SSR、部署和性能结论必须使用匹配的编译、构建、服务端
或测量 fixture，不能用静态浏览器卡片冒充验证。

每课通常只有一个聚焦 Demo。Reference 仅在交互明显提升理解时增加 Demo，不追求条目数量与 Demo
一一对应。

## 2. 身份与同源

交互 ID 使用完整限定名称：

```text
engineering.typescript.learn.basics.narrowing.control-flow-demo
engineering.vite.learn.intermediate.hmr.state-preservation-demo
react.core.learn.basics.state.counter-demo
```

registry 按完整 ID 解析运行模块和 `?raw` 源码，禁止按 basename 查找。运行组件和代码展示必须来自
同一个源文件；复制一份“好看的展示代码”会破坏真实性。

## 3. 行为设计

- 初始状态确定，不依赖随机数、外网请求或脆弱计时。
- 每个控件只改变与知识点有关的状态，结果立即可读。
- 提供必要的重置路径，重复操作和重新挂载结果可预测。
- 资源、订阅、timer、listener 和 React root 在卸载时清理。
- 错误演示必须隔离，不能污染宿主控制台或让页面失去导航能力。
- 性能演示使用可观察计数或正式测量，不根据肉眼流畅度下结论。

新增方法上方必须写规范中文注释，说明它承担的业务或演示职责；不要用注释逐行复述代码。

## 4. 布局与动效

Demo 使用 flex、正常文档流和 margin，禁止 CSS Grid 与 `gap`。固定格式区域使用明确宽度、
`min/max` 或 `aspect-ratio`，避免文字、hover 或状态变化导致布局跳动。卡片圆角不超过 8px，除非
现有设计 token 明确要求其他值。

交互反馈可以明显，但必须解释状态变化。支持 `prefers-reduced-motion`，避免持续循环和无意义弹跳；
动画期间不能锁定点击、键盘或导航。

## 5. 可访问性与验证

- 原生按钮、输入、选择和状态语义优先，不用可点击 `div`。
- 键盘顺序、焦点环、可读名称和禁用状态正确。
- 触控目标舒适，390px 与 200% 文本下无横向溢出和遮挡。
- reduced motion 下功能与信息完整。
- Vue/React 同 basename Demo 切换不串组件或源码。
- React Adapter 重复进入和离开不产生重复 root warning，并在 Vue 页面不提前加载 runtime。
