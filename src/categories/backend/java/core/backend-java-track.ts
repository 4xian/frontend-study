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
          summary: '理解源码如何组织和运行，并掌握值、控制流、方法、数组与字符串。',
          topics: ['源码结构', '类型与控制流', '方法、数组与字符串'],
          entries: [
            {
              id: 'backend.java.learn.basics.packages-imports-and-source-structure',
              status: 'available',
            },
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
          summary: '用对象、抽象类型和元数据建立可维护的 Java 合同。',
          topics: [
            '类与对象',
            '构造方法与 this',
            '封装与访问控制',
            'static 与 final',
            '枚举与注解',
            '抽象与多态',
            'Object 合同',
            '异常与泛型',
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
            {
              id: 'backend.java.learn.basics.debugging-stack-traces-and-javadoc',
              status: 'available',
            },
            {
              id: 'backend.java.learn.basics.annotations-and-metadata',
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
        {
          id: 'build-model',
          title: '项目与构建模型',
          summary: '理解 Java 项目的构建模型，并建立第一条自动化测试反馈环。',
          topics: ['Maven', '依赖管理', '多模块结构', 'JUnit 测试'],
          entries: [
            {
              id: 'backend.java.learn.basics.first-automated-test-with-junit',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '从数据与协议进入分层、测试、Spring Web 和持久化。',
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
          ],
        },
        {
          id: 'data-and-protocols',
          title: '数据与协议基础',
          summary: '用稳定的数据合同连接集合处理、HTTP 与关系数据。',
          topics: [
            'Stream',
            '标识与分页',
            'JSON',
            'HTTP',
            'Spring Boot Web API',
            'Bean Validation',
            'SQL',
          ],
          entries: [
            {
              id: 'backend.java.learn.intermediate.identifiers-equality-and-pagination',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.bean-validation-and-input-contracts',
              status: 'available',
            },
          ],
        },
        {
          id: 'architecture-and-feedback',
          title: '分层与反馈环',
          summary: '建立职责清晰的业务边界、错误合同和可重复测试。',
          topics: [
            '分层架构',
            'DTO',
            'MySQL 持久化',
            '错误与日志',
            'JUnit 与 Mockito',
            'Controller 测试',
            'OpenAPI',
          ],
          entries: [
            {
              id: 'backend.java.learn.intermediate.layers-dto-and-service-boundaries',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.spring-boot-mysql-mybatis-persistence-bridge',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.errors-results-and-logging',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.testing-with-junit-and-mocks',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.controller-testing-mockmvc-and-test-slices',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.openapi-documentation-and-api-integration',
              status: 'available',
            },
          ],
        },
        {
          id: 'model-and-service-design',
          title: '模型与服务设计',
          summary: '连接生成代码、业务协作模式和领域建模。',
          topics: ['Lombok', '服务模式', '领域值'],
          entries: [
            {
              id: 'backend.java.learn.intermediate.lombok-and-generated-contracts',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.service-design-patterns',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.domain-values-trees-and-mapping',
              status: 'available',
            },
          ],
        },
        {
          id: 'database-specialty-candidates',
          title: '数据库专项迁移候选',
          summary: '保留旧稳定页面与 URL；完整内容将在数据库独立专项重新冻结。',
          topics: ['SQL', 'MyBatis'],
          entries: [
            {
              id: 'backend.java.learn.intermediate.relational-data-and-sql-foundations',
              status: 'available',
            },
            {
              id: 'backend.java.learn.intermediate.mybatis-and-mybatis-plus',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '处理并发、集成、资源、安全和现代化迁移边界。',
      categories: [
        {
          id: 'cross-cutting-and-concurrency',
          title: '横切与并发状态',
          summary: '显式管理代理、线程、上下文、异步任务与缓存一致性。',
          topics: ['反射与 AOP', '并发与锁', '线程上下文', '异步与重试', '缓存'],
          entries: [
            {
              id: 'backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.concurrency-locks-and-shared-state',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.thread-context-and-cleanup',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.events-async-scheduling-and-retry',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.cache-and-consistency',
              status: 'available',
            },
          ],
        },
        {
          id: 'integration-and-resources',
          title: '集成与资源生命周期',
          summary: '为实时通信、数据、网络、文件和进程资源建立可验证边界。',
          topics: ['WebSocket', '数据分片', 'HTTP 客户端', '文件与流', 'JVM 可观测性'],
          entries: [
            {
              id: 'backend.java.learn.advanced.websocket-and-realtime-lifecycle',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.database-sharding-and-sql-boundaries',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.http-clients-and-integration-resilience',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.file-storage-and-archive-boundaries',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.binary-streams-media-and-backpressure',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.process-jvm-and-observability',
              status: 'available',
            },
          ],
        },
        {
          id: 'application-security',
          title: '应用安全边界',
          summary: '从资源授权、不可信输入和秘密管理建立现代安全主线。',
          topics: ['认证与授权', 'JWT', '密码学与秘密', '输入与 API 暴露'],
          entries: [
            {
              id: 'backend.java.learn.advanced.authentication-authorization-and-jwt',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.cryptography-secrets-and-license-verification',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.secure-input-and-api-exposure',
              status: 'available',
            },
          ],
        },
        {
          id: 'architecture-modernization',
          title: '架构协作与现代化',
          summary: '组织复杂协作流程，并隔离 legacy 版本与迁移风险。',
          topics: ['责任链与注册表', '工厂与状态机', 'Legacy 隔离', '现代化迁移'],
          entries: [
            {
              id: 'backend.java.learn.advanced.chains-registries-and-state-machines',
              status: 'available',
            },
            {
              id: 'backend.java.learn.advanced.legacy-isolation-and-modernization',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
