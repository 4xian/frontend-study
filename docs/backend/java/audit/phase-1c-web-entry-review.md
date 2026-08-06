# `dzzz-app` Phase 1C Web 入口复核

> 批次：Phase 1C 第 2 批<br>
> 源码快照：`dzzz-app-20260803-179e722831ab`<br>
> 自动分析：`dzzz-app-analysis-20260803-958d37cf1be1`<br>
> 状态：已完成，150/150 个文件、29713/29713 LOC<br>
> 结构化事实源：[phase-1c-web-entry/manifest.json](./reviews/phase-1c-web-entry/manifest.json)

## 1. 本批边界

本批使用冻结清单中的物理路径和显式类名单作为分母，不使用可能跨模块误判的目录名搜索结果：

```text
dzzz-app/src/main/java/com/tdh/bdzz/controller/**/*.java
dzzz-app/src/main/java/com/tdh/bdzz/filter/*.java
dzzz-app/src/main/java/com/tdh/bdzz/handler/LoginHandler.java
dzzz-app/src/main/java/com/tdh/bdzz/handler/StackHandler.java
dzzz-app/src/main/java/com/tdh/bdzz/handler/ThreadHandler.java
dzzz-app/src/main/java/com/tdh/bdzz/timer/controller/**/*.java
```

对应库存索引为 `135..260`、`1129..1140`、`1144..1146`、`2115..2123`，共 150 个文件、
29713 LOC，与第 1 批 34 个路径零重叠。

`timer/controller` 的 9 个类同时具有 `@Controller`、类级 `@RequestMapping` 和
`AbstractFrameTaskAdapter`，是任务框架的真实 HTTP 适配器，因此在 Web 入口批次读取完整源码，再
保留其人工最终角色 `async-integration`。

明确排除：

- `dto/filter` 中的查询条件数据模型；
- JAXB 的 `Filter` 数据模型；
- 不实现 MVC `HandlerInterceptor` 的 `TableShardInterceptor`；
- 第 1 批已复核的 `HeaderRequestInterceptor` 和 `SwaggerAccessBlockController`；
- `dzzz-quartz`、`dzzz-net`、`dzzzLicenseTool` 及其他 Maven 模块的同名代码。

## 2. 复核方法

1. 先运行 Phase 1A、Phase 1B 和第 1 批全量只读检查，确认 3436 个文件及既有台账未漂移。
2. 按仓库规则优先使用 CodeGraph 查询 Web 装配关系；结果再次混入其他 Maven 模块的同名类，故不
   采纳为本批正式证据。
3. 回到冻结库存索引、`dzzz-app` 限定路径、全部文件源码和精确 `rg` 查询，逐文件核对类型注解、
   映射方法、依赖、主要委派、参数边界、响应、异常和管线行为。
4. 把每个文件的人工角色、职责、生命周期、能力候选、风险候选和带行号证据写入 3 个 JSONL
   分片，每个分片 50 条记录。
5. 用独立校验器验证路径、顺序、SHA-256、LOC、风险行号、角色汇总、跨批次零重叠和累计状态。

风险项 `WE-001` 至 `WE-490` 是后续能力或拒绝模式归一化的输入，不是 490 个已经定性的独立缺陷。
同一模式在不同文件中的重复证据仍分别保留，Phase 2 才会把它们合并为一个知识点候选。

## 3. 当前状态叠加

Phase 1A 和 Phase 1B 保留生成时的历史状态。当前状态由两个已完成的 Phase 1C 台账按唯一路径
覆盖：

| 状态 | 主代码 | 测试 | 总数 |
| --- | ---: | ---: | ---: |
| `unreviewed` | 3245 | 7 | 3252 |
| `reviewing` | 0 | 0 | 0 |
| `reviewed` | 184 | 0 | 184 |
| `blocked` | 0 | 0 | 0 |

累计人工复核为 184/3436；Phase 1 Gate 尚未通过。

## 4. 人工角色结果

| 最终角色 | 文件数 | 说明 |
| --- | ---: | --- |
| `web-entry` | 133 | 主 Controller，以及直接参与请求读取、包装和转换的 Servlet Filter/Wrapper |
| `startup-config` | 5 | FilterRegistrationBean 与 Filter Bean 注册配置 |
| `cross-cutting` | 3 | 登录、安全占位与线程上下文 MVC Interceptor |
| `async-integration` | 9 | 基于 AbstractFrameTaskAdapter 的任务 HTTP 适配器 |

机器候选为 `web-entry=138`、`async-integration=12`，共有 8 个角色需要纠正：

| 索引 | 文件 | 机器候选 | 最终角色 |
| ---: | --- | --- | --- |
| 1130 | `AccessFilterConfig.java` | `web-entry` | `startup-config` |
| 1132 | `CryptoParamEncodeFilterConfig.java` | `web-entry` | `startup-config` |
| 1133 | `DesCryptoFilterConfig.java` | `web-entry` | `startup-config` |
| 1136 | `TokenFilterConfig.java` | `web-entry` | `startup-config` |
| 1139 | `XssFilterConfig.java` | `web-entry` | `startup-config` |
| 1144 | `LoginHandler.java` | `async-integration` | `cross-cutting` |
| 1145 | `StackHandler.java` | `async-integration` | `cross-cutting` |
| 1146 | `ThreadHandler.java` | `async-integration` | `cross-cutting` |

## 5. HTTP 表面事实

### 5.1 映射与处理方法

| 信号 | 数量 | 解释边界 |
| --- | ---: | --- |
| public 方法 | 1439 | 包含处理方法和少量公开辅助方法，不包含包可见处理方法 |
| 方法级映射 | 1376 | Spring 映射注解作用于方法的次数 |
| `@PostMapping` | 1173 | 类型和方法注解总出现数，本批均为方法级 |
| `@GetMapping` | 67 | 类型和方法注解总出现数，本批均为方法级 |
| `@RequestMapping` | 268 | 同时包含 150 个类型级基路径和 118 个方法级映射 |
| 未限制 method 的方法映射 | 118 | 分布在 27 个文件 |

项目明显偏向 POST，并保留大量旧式方法级 `@RequestMapping`。现代课程应先使用
`@GetMapping`、`@PostMapping`、`@PutMapping` 和 `@DeleteMapping` 表达明确语义，再补充旧版
`@RequestMapping(method = ...)`；不能把不限制 method 的写法作为推荐用法。

### 5.2 参数、校验与 Servlet 耦合

| 信号 | 数量 |
| --- | ---: |
| `@RequestBody` | 1142 次 |
| `@Valid` / `@Validated` | 601 次 |
| 至少一个请求体未触发校验的文件 | 83 个，涉及 542 个请求体参数位置 |
| 含 `NoLoginAuthRequired` 的文件 | 18 个，共 70 处 |
| 公开方法直接接收 `HttpServletRequest` | 42 个文件 |
| 公开方法直接接收 `HttpServletResponse` | 13 个文件 |
| `MultipartFile` 上传入口 | 23 个文件 |

“请求体没有 `@Valid`”本身不证明 DTO 一定声明了约束，因此台账把它记录为复核候选，而不是直接
定性为缺陷。课程中的正确合同是：需要约束时在 DTO 上声明约束，并在入口用 `@Valid` 触发校验，
再由统一异常处理返回稳定、去敏的错误结构。

匿名放行同样不能靠数量直接判错。后续必须逐入口确认匿名业务必要性、替代认证、授权、速率限制、
重放防护和审计，而不是把自定义注解当成安全证明。

### 5.3 异常与类规模

| 信号 | 文件数 | 证据位置数 |
| --- | ---: | ---: |
| 捕获 `Exception` / `Throwable` | 111 | 台账按文件合并 |
| 声明宽泛 `throws Exception` / `Throwable` | 37 | 台账按文件合并 |
| 把 `e.getMessage()` 写入响应 | 16 | 54 |
| 超过 500 LOC 的 Controller | 11 | 11 |

11 个超大 Controller 中，`Fyb4WindowsController` 为 2235 LOC，`SwtPadMeetingController` 为
1071 LOC，`TsxxSearchController` 为 952 LOC。课程示例只保留 HTTP 适配、参数校验和业务委派，
不会复制这些类中的大段业务编排。

## 6. 请求管线结论

### 6.1 Filter 注册顺序

| 顺序 | 配置 | 运行状态与职责 |
| ---: | --- | --- |
| 1 | `XssFilterConfig` | 全路径包装请求并变形输入字符 |
| 2 | `DesCryptoFilterConfig` | 全路径旧 3DES 参数/请求体兼容解密 |
| 10 | `CryptoParamEncodeFilterConfig` | 第三方 GET 参数解密 Filter |
| 11 | `CryptoParamEncodeFilterConfig` | 第三方安全检查 Filter |
| 999 | `TokenFilterConfig` | tokenid 兼容登录 Filter |
| 未注册 | `AccessFilterConfig` | `@Configuration` 被注释，访问记录 Filter 不生效 |

`AccessFilter` 本身仍完整复核，因为一旦重新启用会：写入固定 `D:\reqs\` 目录、读取并持久化请求
结构、未关闭 `Files.walk` 的 Stream、按 Content-Length 单次读取请求体，并可能在下游异常后再次
执行 Filter 链。课程只能把这些行为作为资源管理、请求体读取和异常传播的反例。

`BodyRequestWrapper` 与 `XssHttpServletRequestWrapper` 的 `ServletInputStream` 始终返回未完成且
未就绪，`setReadListener` 为空，不符合异步 Servlet 读取合同。XSS 防护也不能通过变形输入完成；
现代课程应教授按 HTML、属性、URL、JavaScript 等输出上下文编码，并配合 CSP 和框架默认转义。

### 6.2 认证与 MVC Interceptor

`SpringMvcConfig` 把 3 个 Interceptor 注册到 `/**`：

- `LoginHandler` 对配置排除路径、包含 `/commaction` 的路径和 `NoLoginAuthRequired` 方法放行，
  支持 Session/JWT，但 JWT 失败日志会记录完整 token；
- `StackHandler` 当前无条件返回 `true`，没有实际漏洞修复行为；
- `ThreadHandler` 在 `afterCompletion` 清理分表线程上下文，但源码注释已明确异步线程必须自行清理。

`/task/**` 被登录 Interceptor 的排除列表放行。9 个任务 Controller 因而不能只依赖登录拦截器；
部署层、任务框架自身认证和网络边界仍需单独确认。

`TokenLoginFilter` 还会记录 token、数据库口令和登录结果；checksum 只是
`MD5(username + dt)`，`checkDt` 没有进入主流程，且登录对象设置 `noCheckPwd=true`。这些都是旧兼容
流程证据，不会进入课程的正确认证示例。

### 6.3 任务适配器

9 个任务 Controller 统一通过 `loadData`、`doBusiness` 和可选的 `review`、
`defaultInvokeConfig` 适配任务框架。多数实现捕获异常并把异常对象交给 `FrameTaskResult.fail`；
`HxDataReportController.doBusiness` 则直接返回 `null`。现代示例必须返回明确的成功/失败结果，并
分别验证调度互斥、重试、幂等和异常可观测性。

## 7. 风险候选分布

490 条风险候选的高频类别为：

| 类别 | 文件数 | 教学处理 |
| --- | ---: | --- |
| 字段注入 | 130 | 现代示例改为构造器注入 |
| 捕获顶层异常 | 111 | 改为统一异常边界和稳定错误合同 |
| 请求体未触发校验 | 83 | 结合 DTO 约束继续确认后归一化 |
| 宽泛异常声明 | 37 | 缩小异常合同或交给统一处理 |
| 未限制 HTTP method | 27 | 使用专用映射注解 |
| 文件上传边界 | 23 | 同时验证大小、类型、名称、路径与内容 |
| 匿名访问 | 18 | 逐入口确认认证替代和滥用防护 |
| 异常详情回传 | 16 | 客户端返回稳定错误码，完整异常只进受控日志 |
| 超大 Controller | 11 | 只保留 Web 适配，业务编排下沉 |

其余低频但重要的候选包括硬编码客户端秘密、登录敏感日志、客户端控制解密、无秘密 MD5 checksum、
动态视图名、信任 username 请求头、吞异常、无效安全 Interceptor、线程上下文异步缺口、Filter
资源生命周期和任务结果返回 `null`。

## 8. 后续课程约束

本批只冻结项目事实，不开始查询和编写知识点。后续相关课程必须遵守：

1. 现代稳定 Spring 的构造器注入、专用 HTTP 映射、Bean Validation 和统一异常处理在前。
2. Java 8、Spring Boot 2.3.12 的项目写法只放在旧版补充，并明确运行时边界。
3. 项目中的字段注入、硬编码秘密、敏感日志、输入变形 XSS、宽泛异常和异常详情回传不作为示例。
4. 文件上传、下载、动态视图、匿名入口和认证主体必须先完成安全来源核验，再决定课程深度。
5. 超大 Controller 只抽取最小、去敏、纠正后的适配片段，不能复制完整业务方法。

## 9. 验证与 Stop Boundary

本批正向验证覆盖：

- 3436 个冻结 Java 文件和 7 个 Phase 1B 分片逐字节一致；
- 第 1 批仍为 34/34 个文件、3949 LOC；
- 第 2 批为 150/150 个文件、29713 LOC，3 个分片各 50 条；
- 两批路径零重叠，累计状态为 `reviewed=184`、`unreviewed=3252`；
- `WE-001..WE-490` 连续、唯一，风险和源码证据行号均在冻结 LOC 内；
- 机器角色、最终角色、8 个角色纠正和风险类别汇总一致。

2026-08-03 的最终验证结果：

| 验证 | 结果 |
| --- | --- |
| `npm --prefix docs/backend/java/audit/tooling run check` | `PASS`；Phase 1A、Phase 1B 和前 2 批人工台账均一致 |
| `npm --prefix docs/backend/java/audit/tooling audit` | 0 个已知漏洞 |
| 本批 Markdown、MJS、JSON 定向 `prettier --check` | 通过；JSONL 分片不参与格式化 |
| 在两个空临时目录重建第 2 批，再与正式产物逐文件比较 | 三份结果逐字节一致，manifest SHA-256 均为 `b3f68ea3782ddaeb50595bb071ee2bdcf70cbd4c1fed4522111c08da31041fa3` |
| 临时副本篡改 `records-0001-0050.jsonl` 后运行独立校验器 | 按预期失败：`SHA-256 不一致` |
| 临时副本恢复错误的非活动配置职责并同步分片 SHA-256 | 按预期失败：职责未说明配置当前未激活 |
| `git -C /Users/jian/Desktop/work/TDH/dzzz status --short -- dzzz-app` | 无输出，目标模块保持 clean |

本阶段到此停止，尚未执行：

- Phase 1C 第 3 批业务层或其他后续批次；
- 能力矩阵、项目示例登记、拒绝模式登记和课程覆盖矩阵；
- 外部知识点研究、Java 课程正文、菜单或 Markdown adapter；
- `dzzz-app` 源码修改或任何代码提交。

下一阶段只能从 Phase 1C 第 3 批“业务层”开始，并继续使用当前 snapshot ID；若任一目标源码哈希
变化，必须先重新冻结快照。
