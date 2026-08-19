---
id: engineering.vite.learn.advanced.performance-source-maps
type: lesson
title: 性能诊断、依赖优化、chunk 与 source map
summary: 用冷启动、请求、产物和 source map 证据定位问题，不凭主观流畅度下结论。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 42
prerequisites:
  - engineering.vite.learn.advanced.backend-integration-and-delivery
related:
  - engineering.vite.reference.config-build
  - engineering.vite.reference.config-dependency-optimization
tags:
  - 性能
  - source map
  - 构建分析
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能把慢问题归类为启动、转换、加载或生产执行。
  - 能选择 source map 可见性并验证错误映射。
sources:
  - title: Performance Guide
    url: https://vite.dev/guide/performance
    sourceType: official-reference
  - title: build.sourcemap
    url: https://vite.dev/config/build-options#build-sourcemap
    sourceType: official-reference
---

# 性能诊断、依赖优化、chunk 与 source map

## 一、学习目标

- 用计时和产物把问题分到 dev cold start、模块转换、网络加载或 production chunk。
- 选择 `false`、`true`、`hidden`、`inline` source map，并说明泄露边界。

## 二、为什么需要

“Vite 慢”可能来自插件、依赖发现、文件系统、浏览器请求或应用运行时。没有阶段和测量，调整
optimizeDeps/manualChunks 只是在移动成本。

## 三、核心概念

开发性能看启动、首个请求、转换和 HMR；生产性能看字节、请求和执行；source map 提升错误定位，但
公开部署可能泄露源码。教程统一使用 Vite 8.2.1；性能对比还要固定源码、依赖、机器和命令。

## 四、分步使用

1. 记录冷/热启动与首模块响应。
2. 开启 `DEBUG=vite:*` 定位插件/优化器阶段。
3. 解析 build manifest 和 chunk 字节。
4. 构建 hidden source map，验证错误栈可在受控服务映射。

## 五、先建立可比较基线

固定 Vite 版本、依赖锁文件、源码和命令，分别记录冷启动、热启动、生产构建和主要 chunk 大小：

~~~~sh
npx vite --debug
npx vite build --debug
~~~~

先从 --debug 日志和浏览器 Network 找到最慢阶段，再决定是依赖优化、转换、插件还是产物分块问题。

## 六、优化开发启动

只有依赖发现遗漏时才增加 `optimizeDeps.include`；自定义插件应先过滤 id。下面的插件只转换
`.course.ts` 文件，不会让所有模块都执行替换逻辑：

~~~~sh
npm install -D magic-string
~~~~

~~~~ts
// plugins/course-transform.ts
import MagicString from 'magic-string'
import type { Plugin } from 'vite'

/** 创建只处理课程源码的转换插件。 */
export function courseTransformPlugin(): Plugin {
  return {
    name: 'course:transform',

    /** 替换课程源码中的版本占位符。 */
    transform(code, id) {
      if (!id.endsWith('.course.ts')) return null

      const marker = '__COURSE_VERSION__'
      const markerIndex = code.indexOf(marker)
      if (markerIndex < 0) return null

      const transformed = new MagicString(code)
      transformed.overwrite(markerIndex, markerIndex + marker.length, JSON.stringify('8.2.1'))

      return {
        code: transformed.toString(),
        map: transformed.generateMap({ hires: true, source: id, includeContent: true }),
      }
    },
  }
}
~~~~

每个模块都运行 AST 转换会直接放大启动和 HMR 成本。

## 七、配置生产诊断

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  build: {
    manifest: true,
    sourcemap: mode === 'staging' ? 'hidden' : false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  },
}))
~~~~

hidden source map 不在 bundle 中写 sourceMappingURL，适合上传到错误监控平台但不公开给浏览器。source map
可能包含源码和路径，不能无条件部署到公开目录。

## 八、优化顺序

先删除不必要依赖和同步入口，再通过动态 import 建立功能边界，最后才考虑 manualChunks。
chunkSizeWarningLimit 只是告警阈值，提高它不会减少下载体积。

## 九、易错使用提示

:::pitfalls
### 错误：只凭一次 wall clock 宣称优化成功

**触发条件：** 单次 build 快 100ms 就提交策略。

**原因：** 文件缓存、CPU 调度和依赖缓存会造成方差。

**后果：** 不可重复，甚至在真实项目回退。

**错误示例：**

~~~~text
只记录一次 time vite build
~~~~

**正确写法：**

~~~~text
固定环境、多次测量、报告中位数并同时检查行为/产物
~~~~

**验证方式：** 报告包含命令、版本、样本和方差。
:::

## 十、工作原理与适用边界

1. Performance Guide 建议先定位插件、barrel、请求和解析成本。
2. source map 是诊断资产，也有泄露风险。
3. 教学示例用于建立测量流程，真实应用的性能结论仍需由生产数据证明。

## 十一、练习

:::exercise
### 练习目标

**要求：** 为“首次打开慢、HMR 快”设计三项测量，并说明哪些配置不应先改。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十二、本节小结

- 先分阶段测量，再改配置；source map 的可观测性和暴露范围必须一起决定。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装生成 source map 的转换工具
npm install -D magic-string

// plugins/course-transform.ts：先过滤 id，避免每个模块都执行转换
import MagicString from 'magic-string'
import type { Plugin } from 'vite'
/** 创建只处理课程源码的转换插件。 */
export function courseTransformPlugin(): Plugin {
  return {
    name: 'course:transform',
    /** 替换课程源码中的版本占位符。 */
    transform(code, id) {
      if (!id.endsWith('.course.ts')) return null

      const marker = '__COURSE_VERSION__'
      const markerIndex = code.indexOf(marker)
      if (markerIndex < 0) return null

      const transformed = new MagicString(code)
      transformed.overwrite(markerIndex, markerIndex + marker.length, JSON.stringify('8.2.1'))
      return {
        code: transformed.toString(),
        map: transformed.generateMap({ hires: true, source: id, includeContent: true }),
      }
    },
  }
}

// vite.config.ts：只有证据表明遗漏依赖时才保留 include
import { defineConfig } from 'vite'
import { courseTransformPlugin } from './plugins/course-transform'
export default defineConfig(({ mode }) => ({
  plugins: [courseTransformPlugin()],
  optimizeDeps: { include: ['lodash-es'] },
  build: {
    manifest: true,
    sourcemap: mode === 'staging' ? 'hidden' : false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  },
}))

// 固定源码、锁文件、Vite 版本和命令后多次记录冷/热启动与构建：
// npx vite --debug
// npx vite build --debug --mode staging
// 比较 Network、插件耗时、manifest、chunk 字节与 source map
// 优化顺序：删除无用依赖 -> 延迟入口 -> 插件过滤 -> 最后评估手工分块
// hidden source map 上传到受控诊断服务，不复制到公开静态目录
~~~~
:::

## 十三、参考资料

- [Performance](https://vite.dev/guide/performance) - 诊断建议。
- [build.sourcemap](https://vite.dev/config/build-options#build-sourcemap) - source map 选项。
