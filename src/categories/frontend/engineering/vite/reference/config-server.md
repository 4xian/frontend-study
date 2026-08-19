---
id: engineering.vite.reference.config-server
type: reference
title: Vite Server Options
summary: 查阅开发服务器监听、代理、HMR、文件系统访问与 source map 等稳定配置及安全边界。
domain: frontend
technology: engineering
module: vite
group: configuration
signature: |-
  export default defineConfig({ server: { host, port, proxy, hmr, fs } })
related:
  - engineering.vite.learn.basics.dev-server-browser-loading
  - engineering.vite.learn.intermediate.proxy-and-cross-origin
  - engineering.vite.learn.advanced.security-and-migration
tags:
  - Vite
  - Server Options
  - 开发服务器
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Server Options
    url: https://vite.dev/config/server-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - serverhost
  - serverallowedhosts
  - serverport
  - serverstrictport
  - serverhttps
  - serveropen
  - serverproxy
  - servercors
  - serverheaders
  - serverhmr
  - serverws
  - serverforwardconsole
  - serverwarmup
  - serverwatch
  - servermiddlewaremode
  - serverfsstrict
  - serverfsallow
  - serverfsdeny
  - serverorigin
  - serversourcemapignorelist
---

# Vite Server Options

## 一、server.host

默认只监听 loopback 地址。设为 `0.0.0.0` 或 `true` 会扩大网络暴露面；局域网访问还需同时检查防火墙、DNS 与允许主机。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
})
~~~~

## 二、server.allowedHosts

限制 dev server 接受的 Host。不要设为 `true`，否则可能把源码暴露给 DNS rebinding 攻击；仅列出实际开发域名。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: ['dev.example.test'],
  },
})
~~~~

## 三、server.port

指定首选端口，端口被占用时默认尝试下一个。需要稳定自动化地址时与 `strictPort` 一起使用。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
  },
})
~~~~

## 四、server.strictPort

端口不可用时立即退出，避免脚本悄悄连接到旧进程或错误端口。自动化流程应显式开启。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    strictPort: true,
  },
})
~~~~

## 五、server.https

为开发服务器启用 TLS，证书和密钥仍由调用方提供。自签名证书只适合本地验证，不等于生产证书链证据。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    https: false,
  },
})
~~~~

## 六、server.open

启动后打开浏览器或指定路径；自动化命令不应依赖该副作用。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: false,
  },
})
~~~~

## 七、server.proxy

按路径或正则把请求转发到独立后端，可配置 rewrite 与事件钩子。它只解决开发期转发，生产反向代理必须单独部署。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } },
  },
})
~~~~

## 八、server.cors

默认只允许本地来源。设为 `true` 会允许任意网站读取开发服务器内容，应使用明确 origin 列表。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    cors: { origin: 'https://dev.example.test' },
  },
})
~~~~

## 九、server.headers

为开发响应增加 HTTP headers，适合检查 CSP/缓存等客户端行为。生产服务器仍需独立配置并验证。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    headers: { 'X-Content-Type-Options': 'nosniff' },
  },
})
~~~~

## 十、server.hmr

控制 HMR 客户端、overlay 与连接信息。Vite 8.2.1 已将旧 WebSocket 子字段迁往 `server.ws`，不能继续推荐旧写法。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: { overlay: true },
  },
})
~~~~

## 十一、server.ws

配置 WebSocket host、port、path 或自定义 server。反向代理下应以浏览器实际连接地址和握手结果验证。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    ws: { path: '/vite-hmr' },
  },
})
~~~~

## 十二、server.forwardConsole

把浏览器 console 转发给开发服务器 logger，适合框架诊断。转发输出可能包含用户数据，CI 留存前应做敏感信息审计。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    forwardConsole: true,
  },
})
~~~~

## 十三、server.warmup

预先转换确定会被访问的文件，减少首次请求等待。列表过大会拖慢启动，只应来自真实路由和模块请求证据。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    warmup: { clientFiles: ['./src/main.ts'] },
  },
})
~~~~

## 十四、server.watch

传递文件监听配置；容器或网络文件系统可能需要 polling，但会增加 CPU 使用。先确认漏事件再调整。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    watch: { ignored: ['**/dist/**'] },
  },
})
~~~~

## 十五、server.middlewareMode

只暴露 Connect 中间件，不自行监听 HTTP 端口。宿主服务器负责请求顺序、错误处理与关闭生命周期。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    middlewareMode: false,
  },
})
~~~~

## 十六、server.fs.strict

限制工作区根外文件访问。保持默认严格模式，只有明确的共享目录才通过 allow 扩展。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    fs: {
      strict: true,
    },
  },
})
~~~~

## 十七、server.fs.allow

允许额外文件系统目录；配置后会取代自动工作区根搜索。使用绝对、最小目录并验证越界请求仍返回拒绝。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: ['/absolute/path/to/shared'],
    },
  },
})
~~~~

## 十八、server.fs.deny

用 glob 拒绝敏感文件，优先级高于 allow。默认规则不是秘密管理方案，仍不得把凭据放入可服务目录。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    fs: {
      deny: ['.env', '.env.*', '*.pem', '*.key'],
    },
  },
})
~~~~

## 十九、server.origin

覆盖开发期生成资源 URL 的 origin，常用于代理后的真实外部地址。值必须与浏览器可达协议、host 和端口一致。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    origin: 'https://dev.example.test',
  },
})
~~~~

## 二十、server.sourcemapIgnoreList

决定哪些源文件在 DevTools 中默认忽略。它只影响调试显示，不会从 source map 中删除源码。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules'),
  },
})
~~~~

## 二十一、完整配置示例

下面的配置把本页选项集中写在一起。实际项目应只保留确实需要的选项，并根据部署地址、依赖和入口调整值。

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['dev.example.test'],
    port: 5173,
    strictPort: true,
    https: false,
    open: false,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } },
    cors: { origin: 'https://dev.example.test' },
    headers: { 'X-Content-Type-Options': 'nosniff' },
    hmr: { overlay: true },
    ws: { path: '/vite-hmr' },
    forwardConsole: true,
    warmup: { clientFiles: ['./src/main.ts'] },
    watch: { ignored: ['**/dist/**'] },
    middlewareMode: false,
    fs: {
      strict: true,
      allow: ['/absolute/path/to/shared'],
      deny: ['.env', '.env.*', '*.pem', '*.key'],
    },
    origin: 'https://dev.example.test',
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules'),
  },
})
~~~~

## 二十二、易错使用提示

:::pitfalls
### 错误：为省事开放所有 Host

**触发条件：** 为解决局域网或代理访问问题，把 `server.allowedHosts` 设置为 `true`。

**原因：** 任意 Host 会绕过 Vite 的 Host 校验，扩大 DNS rebinding 读取开发服务器内容的风险。

**后果：** 同一网络或恶意网页可能借错误 Host 访问本地源码与开发接口。

**错误示例：**

```ts
export default { server: { allowedHosts: true } }
```

**正确写法：**

```ts
export default { server: { allowedHosts: ['dev.example.test'] } }
```

**验证方式：** 对允许 Host 断言成功，并对未登记 Host 断言请求被拒绝。
:::

## 二十三、工作原理与适用边界

1. 官方事实：Server Options 分别控制监听、Host、文件系统、代理、HMR、WebSocket 与 middleware mode。
2. 课程推导：可访问性问题应按监听地址、Host 与代理逐层定位，不应一次性放宽全部边界。
3. 适用边界：本页描述开发服务器；生产反向代理、防火墙和证书仍由部署环境独立配置。

## 二十四、参考资料

- [Vite 8.2.1 Server Options](https://vite.dev/config/server-options) - 支持开发服务器配置、安全默认与版本边界。
