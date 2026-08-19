---
id: engineering.vite.learn.advanced.security-and-migration
type: lesson
title: 安全边界、插件风险与 Vite 迁移策略
summary: 审计环境变量、文件访问、host、插件和版本迁移，不把开发便利当安全控制。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 44
prerequisites:
  - engineering.vite.learn.advanced.performance-source-maps
related:
  - engineering.vite.reference.config-server
  - engineering.vite.reference.build-rollup-boundary
  - engineering.vite.reference.cli-and-migration
tags:
  - 安全
  - 插件供应链
  - 迁移
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能审计 env 泄露、host/file access 和插件执行权限。
  - 能为旧版本到 Vite 8.2.1 的升级建立可回滚验证顺序。
sources:
  - title: Server Options Security Notes
    url: https://vite.dev/config/server-options
    sourceType: official-reference
  - title: Vite Migration Guides
    url: https://vite.dev/guide/migration
    sourceType: official-reference
  - title: Vite 8.2.1 Changelog
    url: https://github.com/vitejs/vite/blob/v8.2.1/packages/vite/CHANGELOG.md
    sourceType: release-note
---

# 安全边界、插件风险与 Vite 迁移策略

## 一、学习目标

- 对 envPrefix、allowedHosts、fs allow/deny、CORS/source map 做最小审计。
- 把插件视为构建进程内代码，评估来源、权限和升级变更。

## 二、为什么需要

Vite dev server 能读源码并执行插件；错误开放 host、文件系统或 env 会泄露信息。插件与 Node 进程同权，
拥有文件系统与网络访问能力。版本迁移必须从官方 changelog 和最小示例开始。

## 三、核心概念

envPrefix 只控制客户端暴露；allowedHosts 防 DNS rebinding；fs.deny 优先阻止敏感文件但不是所有插件
访问控制；插件可执行 Node 权限；迁移要以官方 8.2.1 的配置和插件合同为准。

## 四、分步使用

1. 扫描配置和 bundle 中公开 env。
2. 分别请求允许与拒绝的地址，确认 allowedHosts、fs.allow 和 fs.deny 的结果。
3. 盘点插件来源、版本和所用 hooks。
4. 读取对应 changelog，先运行最小示例再决定是否升级。

## 五、保护开发服务器

开发服务器默认只用于可信开发网络。需要监听外部地址时，限制允许的 Host，并保持文件系统访问边界：

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['dev.example.test'],
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.pem', '*.key'],
    },
    cors: {
      origin: 'https://dev.example.test',
    },
  },
})
~~~~

不要把 allowedHosts 设为 true，也不要把宽泛 CORS 当成解决连接问题的默认手段。

## 六、审查环境变量和插件

只有 VITE_ 前缀变量会暴露给客户端，但任何 define 值也会写进产物。提交配置前检查这些值不包含密钥。
Vite 插件在 Node 进程中执行，拥有读取文件和网络访问能力，只安装可信来源并锁定版本。

## 七、升级到 Vite 8.2.1

1. 阅读 Vite 8 与 8.2.1 migration guide、changelog 和 Node.js 要求。
2. 更新 Vite 与官方框架插件，删除已弃用配置。
3. 启动开发服务器，验证模块加载、代理、HMR 和自定义插件。
4. 执行生产构建与 preview，验证 base、动态 import、Worker、manifest 和 source map。
5. 使用 SSR 或 Library Mode 时分别验证对应入口和发布合同。

教程中的配置以 Vite 8.2.1 为准，不保留旧版本兼容分支。迁移完成后应把 package.json 和 lockfile
一起更新，保证团队使用同一版本。

## 八、易错使用提示

:::pitfalls
### 错误：把 allowedHosts 设置为 true

**触发条件：** 为方便远程访问而允许任意 Host。

**原因：** 任意域名可能解析到开发服务器的 loopback 地址，扩大 DNS rebinding 风险。

**后果：** 攻击者可读取开发服务器可访问的源码或响应。

**错误示例：**

~~~~text
server: { allowedHosts: true }
~~~~

**正确写法：**

~~~~text
只列出自己控制的明确主机名
~~~~

**验证方式：** 允许主机返回 200，未登记 Host 被拒绝。
:::

## 九、工作原理与适用边界

1. Server Options 明确 Host/CORS/fs 的安全说明。
2. Vite 配置不是 sandbox，插件需要供应链和最小权限审计。
3. 本课程直接按 Vite 8.2.1 编写，不混入旧版本差异说明。

## 十、练习

:::exercise
### 练习目标

**要求：** 为一个需要 LAN 调试的项目写安全配置和回归清单，禁止使用 `allowedHosts: true`。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 开发便利不等于安全控制；插件、文件、Host、env 和迁移都要有匹配证据。

:::code-details{title="查看本节完整配置"}
~~~~text
// package.json：锁定教程版本，插件也必须来自已审查来源
{
  "devDependencies": {
    "vite": "8.2.1",
    "@vitejs/plugin-vue": "6.0.8"
  }
}

// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  envPrefix: 'VITE_',
  server: {
    host: '0.0.0.0',
    allowedHosts: ['dev.example.test'],
    cors: { origin: 'https://dev.example.test' },
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.pem', '*.key'],
    },
  },
  build: {
    sourcemap: false,
  },
})

// 升级到 8.2.1 的可回滚顺序：
// 1. 核对 Node 要求、Vite 8 migration guide 与 8.2.1 changelog
// 2. 在单独变更中更新 Vite、官方框架插件与 lockfile，删除弃用配置
// 3. 验证模块请求、HMR、proxy、自定义插件和未登记 Host/敏感文件拒绝行为
// 4. 验证 build、preview、base、动态 import、Worker、manifest 与 source map
// 5. SSR 和 Library Mode 分别验证，不用 SPA 结果代替
// 6. 扫描 dist：不得出现服务端 token、私钥或不应公开的 define/env 字面量
// 配置不会隔离插件权限；插件仍以 Node 进程权限执行
~~~~
:::

## 十二、参考资料

- [Server Options](https://vite.dev/config/server-options) - Host、CORS 和 fs 安全说明。
- [Migration](https://vite.dev/guide/migration) - 迁移入口。
- [8.2.1 Changelog](https://github.com/vitejs/vite/blob/v8.2.1/packages/vite/CHANGELOG.md) - 官方版本差异。
