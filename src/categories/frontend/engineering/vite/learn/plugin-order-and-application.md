---
id: engineering.vite.learn.intermediate.plugin-order-and-application
type: lesson
title: Plugin interface、顺序、enforce 与 apply
summary: 让插件只在正确阶段、正确顺序运行，并保留 Rollup/Rolldown 兼容边界。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 38
prerequisites:
  - engineering.vite.learn.intermediate.config-merge-and-overrides
related:
  - engineering.vite.reference.plugin-api
tags:
  - Plugin API
  - enforce
  - apply
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能定义最小 Vite Plugin 并说明 name 的作用。
  - 能使用 enforce/apply 控制顺序和阶段。
sources:
  - title: Vite Plugin API
    url: https://vite.dev/guide/api-plugin
    sourceType: api-doc
---

# Plugin interface、顺序、enforce 与 apply

## 一、学习目标

- 预测 `pre`、普通、`post` 插件在 Vite core 插件前后的顺序。
- 限制 build-only 插件不进入 dev，反之亦然。

## 二、为什么需要

插件共享 resolve/load/transform 管线。顺序错误会让下游收到错误输入；阶段错误会在 dev 执行
需要完整 bundle 的 hook，或在 build 执行开发中间件。

## 三、核心概念

每个插件必须有稳定 `name`。`enforce: 'pre'|'post'` 调整相对顺序；`apply: 'serve'|'build'|fn`
决定阶段。通用 Rollup/Rolldown 插件只有满足 Vite 兼容条件才可直接复用。

## 四、分步使用

1. 写一个只记录 hook 的插件。
2. 增加 pre/normal/post 三个实例。
3. 分别运行 dev 和 build，记录实际顺序。
4. 给 build-only 插件加 `apply: 'build'` 并复跑。

## 五、创建并限定插件

插件工厂返回带唯一 `name` 的 `Plugin` 对象。下面同时登记 pre/normal/post 三个顺序探针，
再用 `apply: 'serve'` 和函数形式的 `apply` 分别限制开发与生产构建插件。

~~~~ts
// plugins/course.ts
import type { Plugin } from 'vite'

/** 创建一个可观察 transform 顺序的插件。 */
export function orderProbePlugin(label: string, enforce?: 'pre' | 'post'): Plugin {
  return {
    name: `course:order:${label}`,
    enforce,
    /** 记录目标模块通过插件的先后顺序。 */
    transform(_code, id) {
      if (!id.endsWith('.course.ts')) return null
      console.info(`[course-order] ${label}`)
      return null
    },
  }
}

/** 创建只在开发服务中注入诊断响应头的插件。 */
export function serveDiagnosticsPlugin(): Plugin {
  return {
    name: 'course:serve-diagnostics',
    apply: 'serve',
    /** 为开发服务响应增加可观察标记。 */
    configureServer(server) {
      server.middlewares.use((_request, response, next) => {
        response.setHeader('X-Course-Mode', 'serve')
        next()
      })
    },
  }
}

/** 创建只在 production build 生效的插件。 */
export function productionBuildPlugin(): Plugin {
  return {
    name: 'course:production-build',
    /** 仅允许插件进入 production build。 */
    apply(_config, env) {
      return env.command === 'build' && env.mode === 'production'
    },
    /** 记录生产构建插件确实进入当前配置。 */
    configResolved() {
      console.info('[course-stage] production build')
    },
  }
}

// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [
    orderProbePlugin('pre', 'pre'),
    serveDiagnosticsPlugin(),
    orderProbePlugin('normal'),
    productionBuildPlugin(),
    orderProbePlugin('post', 'post'),
  ],
})
~~~~

## 六、易错使用提示

:::pitfalls
### 错误：用数组位置代替 enforce 合同

**触发条件：** 假设插件写在数组最前面就一定先于 Vite core plugin。

**原因：** Vite 会按 enforce 和 core 阶段重新排序。

**后果：** transform 输入与预期不一致。

**错误示例：**

~~~~text
只靠 plugins: [myPlugin(), vue()] 表达所有顺序
~~~~

**正确写法：**

~~~~text
需要跨 core 顺序时显式设置 enforce，并用 hook 记录验证
~~~~

**验证方式：** 同一示例项目比较 serve/build 日志。
:::

## 七、工作原理与适用边界

1. Plugin API 明确 Vite plugin 顺序和条件应用。
2. 插件 interface 应由最少 hook 组成，避免一个插件承担无关阶段。
3. Rollup/Rolldown 兼容不代表所有 dev hook 都存在。

## 八、练习

:::exercise
### 练习目标

**要求：** 设计一个只在 build 注入版本号、只在 serve 注入诊断 header 的插件组合并写顺序断言。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 九、本节小结

- name 定身份，enforce 定顺序，apply 定阶段；两阶段都必须单独证明。

:::code-details{title="查看本节完整配置"}
~~~~ts
// plugins/course.ts
import type { Plugin } from 'vite'

/** 创建一个可观察 transform 顺序的插件。 */
export function orderProbePlugin(label: string, enforce?: 'pre' | 'post'): Plugin {
  return {
    name: `course:order:${label}`,
    enforce,
    /** 记录目标模块通过插件的先后顺序。 */
    transform(_code, id) {
      if (!id.endsWith('.course.ts')) return null
      console.info(`[course-order] ${label}`)
      return null
    },
  }
}

/** 创建只在开发服务中注入诊断响应头的插件。 */
export function serveDiagnosticsPlugin(): Plugin {
  return {
    name: 'course:serve-diagnostics',
    apply: 'serve',
    /** 为开发服务响应增加可观察标记。 */
    configureServer(server) {
      server.middlewares.use((_request, response, next) => {
        response.setHeader('X-Course-Mode', 'serve')
        next()
      })
    },
  }
}

/** 创建只在 production build 生效的插件。 */
export function productionBuildPlugin(): Plugin {
  return {
    name: 'course:production-build',
    /** 只允许插件进入 production build。 */
    apply(_config, env) {
      return env.command === 'build' && env.mode === 'production'
    },
    /** 记录生产构建插件确实进入当前配置。 */
    configResolved() {
      console.info('[course-stage] production build')
    },
  }
}

// vite.config.ts：数组只负责登记，enforce/apply 才是顺序和阶段合同
import { defineConfig } from 'vite'
import {
  orderProbePlugin,
  productionBuildPlugin,
  serveDiagnosticsPlugin,
} from './plugins/course'
export default defineConfig({
  plugins: [
    orderProbePlugin('pre', 'pre'),
    serveDiagnosticsPlugin(),
    orderProbePlugin('normal'),
    productionBuildPlugin(),
    orderProbePlugin('post', 'post'),
  ],
})

// dev 中检查 pre -> normal -> post 与 X-Course-Mode 响应头
// production build 中检查同样顺序与 course-stage 日志
~~~~
:::

## 十、参考资料

- [Plugin API](https://vite.dev/guide/api-plugin) - 插件 interface、顺序与 apply。
