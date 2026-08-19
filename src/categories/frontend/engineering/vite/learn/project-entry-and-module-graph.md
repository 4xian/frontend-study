---
id: engineering.vite.learn.basics.project-entry-and-module-graph
type: lesson
title: 项目入口、index.html 与模块图
summary: 从 index.html 追踪到源码入口，并用模块图解释 Vite 的按需转换。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 32
prerequisites:
  - engineering.vite.learn.basics.problem-and-workflow
related:
  - engineering.vite.reference.javascript-api
tags:
  - index.html
  - 模块图
  - 入口
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能从 index.html 找到实际源码入口。
  - 能解释 import 关系如何进入 Vite module graph。
sources:
  - title: Vite Index HTML and Project Structure
    url: https://vite.dev/guide/
    sourceType: official-reference
  - title: Vite JavaScript API
    url: https://vite.dev/guide/api-javascript
    sourceType: api-doc
---

# 项目入口、index.html 与模块图

## 一、学习目标

- 找出入口 HTML、入口模块和第一个框架插件转换点。
- 用 importer/importee 关系解释一个模块为什么会被重新请求。

## 二、为什么需要

Vite 项目不是“先打包再打开页面”。开发服务器直接把 `index.html` 当作入口，浏览器继续请求模块，
所以入口错误、路径错误和循环依赖都能从请求链定位。

## 三、核心概念

`index.html` 是应用入口而不是静态模板旁观者。`<script type="module" src="/src/main.ts">` 连接
源码入口；每个 import 都成为 module graph 中的边，插件在请求进入浏览器前提供转换。

## 四、分步使用

1. 打开 `index.html`，确认脚本使用绝对项目路径。
2. 打开 `/src/main.ts`，沿 import 逐层追踪 Vue、样式和资源。
3. 在 DevTools Network 中按 Initiator 排序，验证请求链。
4. 修改一个叶子模块，观察只有相关模块被失效。

## 五、从 index.html 建立入口

Vite 的 HTML 是模块图的一部分。先创建根页面，并用 type="module" 指向源码入口：

~~~~html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>课程列表</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
~~~~

入口模块再导入业务模块和样式：

~~~~ts
// src/main.ts
import { renderCourses } from './courses'
import './styles/main.css'

renderCourses(document.querySelector<HTMLElement>('#app'))
~~~~

~~~~ts
// src/courses.ts
const courses = ['Vite 基础', '插件 API', '生产构建']

export function renderCourses(container: HTMLElement | null) {
  if (!container) return
  container.innerHTML = courses.map((course) => '<p>' + course + '</p>').join('')
}
~~~~

浏览器先请求 index.html，再请求 /src/main.ts。Vite 在返回 main.ts 前完成 TypeScript 转换，并根据 import
继续加载 courses.ts 和 CSS。修改 courses.ts 时，模块图让 Vite 只通知受影响的 importer。

## 六、多页面入口

多页面应用可以让多个 HTML 文件分别成为入口：

~~~~ts
// vite.config.ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
~~~~

完整配置只声明真实入口。普通单页应用不需要设置 input，根目录的 index.html 已经是默认入口。

## 七、易错使用提示

:::pitfalls
### 错误：把 src/main.ts 当成 HTML 入口

**触发条件：** 在 `vite.config.ts` 中用源码文件替换 root 入口而不保留 index.html。

**原因：** Vite 开发服务器从 HTML 入口建立浏览器加载链。

**后果：** HTML transform、插件注入和绝对路径解析行为被绕过。

**错误示例：**

~~~~text
删除 index.html，只把 src/main.ts 交给浏览器
~~~~

**正确写法：**

~~~~text
保留 index.html，并从 module script 指向源码入口
~~~~

**验证方式：** 直接请求 `/`，确认返回 HTML 后再请求入口模块。
:::

## 八、工作原理与适用边界

1. **官方事实：** Vite 把 root 下的 index.html 作为入口并支持 HTML transform。
2. **课程推导：** 调试应先看入口 HTML，再看 module graph，而不是只看最终 DOM。
3. **边界：** module graph 是开发期内部结构，不是浏览器可直接调用的稳定数据格式。

## 九、练习

:::exercise
### 练习目标

**要求：** 把一个页面的 import 链画成三层树，并标出哪个节点由 Vue 插件转换、哪个节点是浏览器原生模块。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十、本节小结

- HTML 入口决定请求起点，import 关系决定模块图，插件决定转换结果。

:::code-details{title="查看本节完整配置"}
~~~~text
// index.html：默认页面入口
<!doctype html>
<html lang="zh-CN">
  <head><meta charset="UTF-8"><title>课程列表</title></head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>

// src/main.ts：入口模块建立业务与样式依赖边
import { renderCourses } from './courses'
import './styles/main.css'
renderCourses(document.querySelector<HTMLElement>('#app'))

// src/courses.ts
const courses = ['Vite 基础', '插件 API', '生产构建']
/** 把课程列表渲染到入口容器。 */
export function renderCourses(container: HTMLElement | null): void {
  if (!container) return
  container.innerHTML = courses.map((course) => `<p>${course}</p>`).join('')
}

// admin/index.html：第二个 HTML 入口
<main id="admin"></main>
<script type="module" src="/src/admin.ts"></script>

// vite.config.ts：单页应用可省略 input，多页面应用才显式声明
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})

// Network 请求链：HTML -> 入口模块 -> 业务模块/CSS；修改叶子模块时沿 importer 失效
~~~~
:::

## 十一、参考资料

- [Getting Started](https://vite.dev/guide/) - 项目入口和脚本。
- [JavaScript API](https://vite.dev/guide/api-javascript) - module graph 与服务器 API。
