# TeamFlow 完整交付项目

本目录保存现代版与 Java 8 兼容版的 TeamFlow 交付骨架。两套后端共享外部合同、数据库语义、Redis 状态和
RabbitMQ 事件；框架入口与依赖适配分别维护。

当前递进修复已将 C0-C9 的领域、Web、数据、缓存、安全、日志、健康、打包、容器、外部 HTTP、异步、消息和交付
能力接入两套长期项目。现代版与兼容版完整门禁均已通过，最新独立复审为 Standards/Spec `PASS / 0 finding`，
课程一致性收口也已完成。

## 目录

- `contracts/`：API、事件和验收合同。
- `teamflow-modern/`：JDK 25 / Spring Boot 4.1.x 项目。
- `teamflow-legacy/`：Java 8 / Spring Boot 2.3.12 项目。
- `teamflow-frontend/`：Vite 联调界面。
- `compose.yaml`：MySQL、Redis、RabbitMQ 和应用服务。
- `delivery-gate.sh`：构建、镜像、启动、业务和依赖恢复门禁。
- `delivery-smoke.sh`：双版本共享的 HTTP、CORS、OpenAPI、数据状态和依赖恢复请求矩阵。

## 本地门禁

主机需要 Docker、Docker Compose 和 Node.js；Maven 通过 Docker 镜像执行。分别运行：

```bash
bash delivery-gate.sh modern 18080
bash delivery-gate.sh legacy 18081
```

门禁成功时分别输出 `profile=modern gate=PASS` 和 `profile=legacy gate=PASS`。失败报告会保留在 `/tmp`，
成功后临时目录自动删除。

门禁会从临时源码副本构建，并验证 C0-C9 的用户/团队/项目/任务/附件成功与失败路径、字段错误顺序、OpenAPI
成功状态、CORS 预检、安全矩阵、成员变更缓存一致性和基础交付健康；随后验证 C8 的 Partner HTTP 同步/异步
调用、外部失败映射、POST 不重试，以及既有幂等、事务、消息与依赖故障恢复合同。

前端通过 `VITE_TEAMFLOW_API_BASE_URL` 指向对应端口，默认使用现代版 `http://127.0.0.1:18080`。
