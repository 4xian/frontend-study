import type { LearningTrackManifest } from '@/common/catalog/types'

export const backendJavaTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从 Java 运行过程开始，建立语言、标准库与构建基础。',
      categories: [
        {
          id: 'java-program-start',
          title: 'Java 程序起步',
          summary: '配置开发环境，并建立从源码到程序启动的最短路径。',
          topics: ['JDK 与开发环境', '编译与运行'],
          entries: [
            {
              id: 'backend.java.learn.basics.development-environment-and-runtime',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.compilation-and-execution',
              status: 'available',
            },
          ],
        },
        {
          id: 'debugging-and-troubleshooting',
          title: '调试与排错',
          summary: '从错误反馈缩小范围，再用断点、变量和调用帧观察程序状态。',
          topics: ['错误分类', '诊断证据', '异常栈定位', '断点与单步调试'],
          entries: [
            {
              id: 'backend.java.learn.basics.error-localization',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.breakpoint-debugging',
              status: 'available',
            },
          ],
        },
        {
          id: 'maven-engineering',
          title: 'Maven 工程',
          summary: '用 POM 描述项目、模块和依赖，并通过 Maven 生命周期完成构建。',
          topics: ['Maven 项目', '依赖管理', '多模块构建'],
          entries: [
            {
              id: 'backend.java.learn.basics.maven-project-model',
              status: 'available',
            },
          ],
        },
        {
          id: 'data-and-expressions',
          title: '数据与表达式',
          summary: '用变量保存和更新程序状态，再逐步建立类型与表达式基础。',
          topics: ['变量与赋值', '基本类型', '类型转换', '运算符与表达式', '字面量'],
          entries: [
            {
              id: 'backend.java.learn.basics.variables-and-assignment',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.variables-types-and-operators',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.type-conversion',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.operators-and-expressions',
              status: 'available',
            },
          ],
        },
        {
          id: 'language-runtime',
          title: '语言与运行基础',
          summary: '掌握控制流、方法、数组与字符串，并理解这些能力如何组织程序行为。',
          topics: ['类型与控制流', '方法、数组与字符串'],
          entries: [
            {
              id: 'backend.java.learn.basics.control-flow',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.loop-control',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.methods-parameters-and-scope',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.parameter-passing',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.arrays-and-varargs',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.strings-encoding-and-text-matching',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.command-line-task-manager-project',
              status: 'available',
            },
          ],
        },
        {
          id: 'object-model',
          title: '对象与类型建模',
          summary: '用对象、抽象类型、泛型和数据合同建立可维护的 Java 模型。',
          topics: [
            '类与对象',
            '构造方法与 this',
            '封装与访问控制',
            'static 与 final',
            '枚举',
            '抽象与多态',
            'Object、record 与泛型',
          ],
          entries: [
            {
              id: 'backend.java.learn.basics.classes-objects-and-immutability',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.constructors-and-this',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.encapsulation-and-access-control',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.static-and-final',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.enums-and-finite-values',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.task-domain-modeling-project',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.interfaces-inheritance-and-polymorphism',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.abstract-classes-and-interfaces',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.polymorphism',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.object-equals-and-hashcode',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.record-classes',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.task-notification-strategy',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.generics-and-type-safety',
              status: 'available',
            },
          ],
        },
        {
          id: 'standard-library',
          title: '核心标准库合同',
          summary: '掌握后端处理中最常用的数据、时间与资源边界。',
          topics: [
            '集合与缺失语义',
            '日期时间',
            'I/O 与资源关闭',
            'Lambda',
            'Stream',
            '文本构建与格式化',
          ],
          entries: [
            {
              id: 'backend.java.learn.basics.collections-and-iteration-contracts',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.sets-and-uniqueness',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.maps-and-key-value-associations',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.collection-iteration-and-safe-removal',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.task-collection-query-project',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.comparable-and-comparator',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.date-time-and-time-zones',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.bigdecimal',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.project-progress-report',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.exceptions-and-cause-chains',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.io-files-and-resource-ownership',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.file-reading-and-writing',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.lambda-stream-and-collectors',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.stream-processing',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.null-optional-and-failure-semantics',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.text-building-and-formatting',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.task-list-import-export-project',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.http-uri-and-request-response-basics',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.transactions-and-idempotency',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.json-and-data-contracts',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.task-api-design-project',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.unified-api-contract',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '使用 Spring Boot 构建、持久化、测试并交付 Web API。',
      categories: [
        {
          id: 'spring-boot-rest-api',
          title: 'Spring Boot REST API',
          summary: '从应用启动、配置读取和依赖注入走到请求映射、参数绑定与统一接口响应。',
          topics: [
            'Spring Boot 启动',
            '配置与环境',
            '依赖注入',
            '请求映射',
            '请求参数',
            'JSON 请求体',
            '响应与状态码',
            '参数校验',
            '统一接口响应',
            '文件上传与下载',
            '跨域与前端联调',
            'OpenAPI 与 Swagger UI',
          ],
          entries: [
            {
              id: 'backend.java.learn.intermediate.first-spring-boot-web-api',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.spring-boot-and-configuration',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.request-parameters-and-type-conversion',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.request-body-and-json-binding',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.response-and-status-codes',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.request-validation',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.unified-api-response',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.global-exception-handling',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.user-and-team-api-project',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.file-upload-and-download',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.cors-and-frontend-integration',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.openapi-documentation-and-api-integration',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.project-and-task-api-project',
              status: 'available',
            },
          ],
        },
        {
          id: 'mysql-and-mybatis',
          title: 'MySQL 与 MyBatis',
          summary: '从关系数据建模开始，逐步建立 SQL、迁移、映射、分页和事务能力。',
          topics: [
            '关系数据建模',
            'SQL 查询',
            '数据库迁移',
            'MyBatis 配置',
            '查询映射',
            '写入与动态 SQL',
            '用户与团队持久化',
            'MyBatis-Plus',
            '分页与筛选',
            '事务',
            '项目与任务持久化',
          ],
          entries: [
            {
              id: 'backend.java.learn.intermediate.relational-data-and-sql-foundations',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.sql-queries',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.database-migrations',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.mybatis-and-mybatis-plus',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.mybatis-query-mapping',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.mybatis-write-and-dynamic-sql',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.user-and-team-persistence-project',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.mybatis-plus',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.mybatis-plus-pagination-and-filtering',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.database-transactions',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.project-and-task-persistence-project',
              status: 'available',
            },
          ],
        },
        {
          id: 'redis-web-capabilities',
          title: 'Redis 与 Web 常用能力',
          summary:
            '先建立 Redis 连接与字符串状态边界，再学习缓存生命周期、验证码、接口幂等与任务查询缓存实战。',
          topics: ['Redis Web 集成', '缓存读取', '缓存失效', '验证码', '接口幂等', '任务查询缓存'],
          entries: [
            {
              id: 'backend.java.learn.intermediate.redis-web-integration',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.cache-reading',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.cache-invalidation',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.verification-code',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.api-idempotency',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.task-query-cache-project',
              status: 'available',
            },
          ],
        },
        {
          id: 'testing-security-and-delivery',
          title: '测试、安全与交付',
          summary: '在数据库与缓存主线完成后，建立测试、安全、运行与交付能力。',
          topics: [
            '单元测试',
            'MockMvc 接口测试',
            '集成测试',
            '密码与登录',
            'JWT 认证',
            '角色与权限',
            '日志与可观测性',
            '健康检查与优雅停机',
            '应用打包',
            '容器化部署',
          ],
          entries: [
            {
              id: 'backend.java.learn.intermediate.testing-with-junit-and-mocks',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.integration-testing-with-spring-boot',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.password-and-login',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.jwt-authentication',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.roles-and-permissions',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.logging-and-observability',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.health-checks-and-graceful-shutdown',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.application-packaging',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.containerized-deployment',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.testing-and-delivery-check',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '完成外部服务、异步、消息、并发与 TeamFlow 交付能力。',
      categories: [
        {
          id: 'advanced-web-and-graduation',
          title: '高级 Web 与结课',
          summary: '从外部服务集成开始，继续建立异步、消息、并发与完整交付能力。',
          topics: [
            '外部 HTTP 调用',
            'HTTP 客户端配置',
            '异步任务',
            '定时任务',
            '消息队列边界',
            'RabbitMQ 消息收发',
            '可靠消费与消费幂等',
            '并发更新与一致性',
            '异步通知链路',
            'TeamFlow 完整交付',
          ],
          entries: [
            {
              id: 'backend.java.learn.advanced.external-http-calls',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.http-clients-and-integration-resilience',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.events-async-scheduling-and-retry',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.scheduled-tasks',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.message-queue-boundaries',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.rabbitmq-message-send-receive',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.reliable-consumption-and-idempotency',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.concurrent-updates-and-consistency',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.async-notification-pipeline',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.teamflow-complete-delivery',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
