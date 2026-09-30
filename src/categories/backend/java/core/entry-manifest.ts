import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const javaCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'development-environment-and-runtime',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/development-environment-and-runtime.md',
    ),
    load: async () =>
      (await import('./learn/development-environment-and-runtime.md?content-entry')).default,
  },
  {
    slug: 'compilation-and-execution',
    meta: getContentMeta('src/categories/backend/java/core/learn/compilation-and-execution.md'),
    load: async () => (await import('./learn/compilation-and-execution.md?content-entry')).default,
  },
  {
    slug: 'error-localization',
    meta: getContentMeta('src/categories/backend/java/core/learn/error-localization.md'),
    load: async () => (await import('./learn/error-localization.md?content-entry')).default,
  },
  {
    slug: 'breakpoint-debugging',
    meta: getContentMeta('src/categories/backend/java/core/learn/breakpoint-debugging.md'),
    load: async () => (await import('./learn/breakpoint-debugging.md?content-entry')).default,
  },
  {
    slug: 'variables-and-assignment',
    meta: getContentMeta('src/categories/backend/java/core/learn/variables-and-assignment.md'),
    load: async () => (await import('./learn/variables-and-assignment.md?content-entry')).default,
  },
  {
    slug: 'variables-types-and-operators',
    meta: getContentMeta('src/categories/backend/java/core/learn/variables-types-and-operators.md'),
    load: async () =>
      (await import('./learn/variables-types-and-operators.md?content-entry')).default,
  },
  {
    slug: 'type-conversion',
    meta: getContentMeta('src/categories/backend/java/core/learn/type-conversion.md'),
    load: async () => (await import('./learn/type-conversion.md?content-entry')).default,
  },
  {
    slug: 'operators-and-expressions',
    meta: getContentMeta('src/categories/backend/java/core/learn/operators-and-expressions.md'),
    load: async () => (await import('./learn/operators-and-expressions.md?content-entry')).default,
  },
  {
    slug: 'control-flow',
    meta: getContentMeta('src/categories/backend/java/core/learn/control-flow.md'),
    load: async () => (await import('./learn/control-flow.md?content-entry')).default,
  },
  {
    slug: 'loop-control',
    meta: getContentMeta('src/categories/backend/java/core/learn/loop-control.md'),
    load: async () => (await import('./learn/loop-control.md?content-entry')).default,
  },
  {
    slug: 'methods-parameters-and-scope',
    meta: getContentMeta('src/categories/backend/java/core/learn/methods-parameters-and-scope.md'),
    load: async () =>
      (await import('./learn/methods-parameters-and-scope.md?content-entry')).default,
  },
  {
    slug: 'parameter-passing',
    meta: getContentMeta('src/categories/backend/java/core/learn/parameter-passing.md'),
    load: async () => (await import('./learn/parameter-passing.md?content-entry')).default,
  },
  {
    slug: 'arrays-and-varargs',
    meta: getContentMeta('src/categories/backend/java/core/learn/arrays-and-varargs.md'),
    load: async () => (await import('./learn/arrays-and-varargs.md?content-entry')).default,
  },
  {
    slug: 'strings-encoding-and-text-matching',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/strings-encoding-and-text-matching.md',
    ),
    load: async () =>
      (await import('./learn/strings-encoding-and-text-matching.md?content-entry')).default,
  },
  {
    slug: 'command-line-task-manager-project',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/command-line-task-manager-project.md',
    ),
    load: async () =>
      (await import('./learn/command-line-task-manager-project.md?content-entry')).default,
  },
  {
    slug: 'classes-objects-and-immutability',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/classes-objects-and-immutability.md',
    ),
    load: async () =>
      (await import('./learn/classes-objects-and-immutability.md?content-entry')).default,
  },
  {
    slug: 'constructors-and-this',
    meta: getContentMeta('src/categories/backend/java/core/learn/constructors-and-this.md'),
    load: async () => (await import('./learn/constructors-and-this.md?content-entry')).default,
  },
  {
    slug: 'encapsulation-and-access-control',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/encapsulation-and-access-control.md',
    ),
    load: async () =>
      (await import('./learn/encapsulation-and-access-control.md?content-entry')).default,
  },
  {
    slug: 'static-and-final',
    meta: getContentMeta('src/categories/backend/java/core/learn/static-and-final.md'),
    load: async () => (await import('./learn/static-and-final.md?content-entry')).default,
  },
  {
    slug: 'enums-and-finite-values',
    meta: getContentMeta('src/categories/backend/java/core/learn/enums-and-finite-values.md'),
    load: async () => (await import('./learn/enums-and-finite-values.md?content-entry')).default,
  },
  {
    slug: 'task-domain-modeling-project',
    meta: getContentMeta('src/categories/backend/java/core/learn/task-domain-modeling-project.md'),
    load: async () =>
      (await import('./learn/task-domain-modeling-project.md?content-entry')).default,
  },
  {
    slug: 'interfaces-inheritance-and-polymorphism',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/interfaces-inheritance-and-polymorphism.md',
    ),
    load: async () =>
      (await import('./learn/interfaces-inheritance-and-polymorphism.md?content-entry')).default,
  },
  {
    slug: 'abstract-classes-and-interfaces',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/abstract-classes-and-interfaces.md',
    ),
    load: async () =>
      (await import('./learn/abstract-classes-and-interfaces.md?content-entry')).default,
  },
  {
    slug: 'polymorphism',
    meta: getContentMeta('src/categories/backend/java/core/learn/polymorphism.md'),
    load: async () => (await import('./learn/polymorphism.md?content-entry')).default,
  },
  {
    slug: 'object-equals-and-hashcode',
    meta: getContentMeta('src/categories/backend/java/core/learn/object-equals-and-hashcode.md'),
    load: async () => (await import('./learn/object-equals-and-hashcode.md?content-entry')).default,
  },
  {
    slug: 'record-classes',
    meta: getContentMeta('src/categories/backend/java/core/learn/record-classes.md'),
    load: async () => (await import('./learn/record-classes.md?content-entry')).default,
  },
  {
    slug: 'task-notification-strategy',
    meta: getContentMeta('src/categories/backend/java/core/learn/task-notification-strategy.md'),
    load: async () => (await import('./learn/task-notification-strategy.md?content-entry')).default,
  },
  {
    slug: 'generics-and-type-safety',
    meta: getContentMeta('src/categories/backend/java/core/learn/generics-and-type-safety.md'),
    load: async () => (await import('./learn/generics-and-type-safety.md?content-entry')).default,
  },
  {
    slug: 'collections-and-iteration-contracts',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/collections-and-iteration-contracts.md',
    ),
    load: async () =>
      (await import('./learn/collections-and-iteration-contracts.md?content-entry')).default,
  },
  {
    slug: 'sets-and-uniqueness',
    meta: getContentMeta('src/categories/backend/java/core/learn/sets-and-uniqueness.md'),
    load: async () => (await import('./learn/sets-and-uniqueness.md?content-entry')).default,
  },
  {
    slug: 'maps-and-key-value-associations',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/maps-and-key-value-associations.md',
    ),
    load: async () =>
      (await import('./learn/maps-and-key-value-associations.md?content-entry')).default,
  },
  {
    slug: 'collection-iteration-and-safe-removal',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/collection-iteration-and-safe-removal.md',
    ),
    load: async () =>
      (await import('./learn/collection-iteration-and-safe-removal.md?content-entry')).default,
  },
  {
    slug: 'task-collection-query-project',
    meta: getContentMeta('src/categories/backend/java/core/learn/task-collection-query-project.md'),
    load: async () =>
      (await import('./learn/task-collection-query-project.md?content-entry')).default,
  },
  {
    slug: 'comparable-and-comparator',
    meta: getContentMeta('src/categories/backend/java/core/learn/comparable-and-comparator.md'),
    load: async () => (await import('./learn/comparable-and-comparator.md?content-entry')).default,
  },
  {
    slug: 'date-time-and-time-zones',
    meta: getContentMeta('src/categories/backend/java/core/learn/date-time-and-time-zones.md'),
    load: async () => (await import('./learn/date-time-and-time-zones.md?content-entry')).default,
  },
  {
    slug: 'bigdecimal',
    meta: getContentMeta('src/categories/backend/java/core/learn/bigdecimal.md'),
    load: async () => (await import('./learn/bigdecimal.md?content-entry')).default,
  },
  {
    slug: 'project-progress-report',
    meta: getContentMeta('src/categories/backend/java/core/learn/project-progress-report.md'),
    load: async () => (await import('./learn/project-progress-report.md?content-entry')).default,
  },
  {
    slug: 'exceptions-and-cause-chains',
    meta: getContentMeta('src/categories/backend/java/core/learn/exceptions-and-cause-chains.md'),
    load: async () =>
      (await import('./learn/exceptions-and-cause-chains.md?content-entry')).default,
  },
  {
    slug: 'io-files-and-resource-ownership',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/io-files-and-resource-ownership.md',
    ),
    load: async () =>
      (await import('./learn/io-files-and-resource-ownership.md?content-entry')).default,
  },
  {
    slug: 'file-reading-and-writing',
    meta: getContentMeta('src/categories/backend/java/core/learn/file-reading-and-writing.md'),
    load: async () => (await import('./learn/file-reading-and-writing.md?content-entry')).default,
  },
  {
    slug: 'null-optional-and-failure-semantics',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/null-optional-and-failure-semantics.md',
    ),
    load: async () =>
      (await import('./learn/null-optional-and-failure-semantics.md?content-entry')).default,
  },
  {
    slug: 'text-building-and-formatting',
    meta: getContentMeta('src/categories/backend/java/core/learn/text-building-and-formatting.md'),
    load: async () =>
      (await import('./learn/text-building-and-formatting.md?content-entry')).default,
  },
  {
    slug: 'task-list-import-export-project',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/task-list-import-export-project.md',
    ),
    load: async () =>
      (await import('./learn/task-list-import-export-project.md?content-entry')).default,
  },
  {
    slug: 'http-uri-and-request-response-basics',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/http-uri-and-request-response-basics.md',
    ),
    load: async () =>
      (await import('./learn/http-uri-and-request-response-basics.md?content-entry')).default,
  },
  {
    slug: 'transactions-and-idempotency',
    meta: getContentMeta('src/categories/backend/java/core/learn/transactions-and-idempotency.md'),
    load: async () =>
      (await import('./learn/transactions-and-idempotency.md?content-entry')).default,
  },
  {
    slug: 'json-and-data-contracts',
    meta: getContentMeta('src/categories/backend/java/core/learn/json-and-data-contracts.md'),
    load: async () => (await import('./learn/json-and-data-contracts.md?content-entry')).default,
  },
  {
    slug: 'task-api-design-project',
    meta: getContentMeta('src/categories/backend/java/core/learn/task-api-design-project.md'),
    load: async () => (await import('./learn/task-api-design-project.md?content-entry')).default,
  },
  {
    slug: 'unified-api-contract',
    meta: getContentMeta('src/categories/backend/java/core/learn/unified-api-contract.md'),
    load: async () => (await import('./learn/unified-api-contract.md?content-entry')).default,
  },
  {
    slug: 'first-spring-boot-web-api',
    meta: getContentMeta('src/categories/backend/java/core/learn/first-spring-boot-web-api.md'),
    load: async () => (await import('./learn/first-spring-boot-web-api.md?content-entry')).default,
  },
  {
    slug: 'spring-boot-and-configuration',
    meta: getContentMeta('src/categories/backend/java/core/learn/spring-boot-and-configuration.md'),
    load: async () =>
      (await import('./learn/spring-boot-and-configuration.md?content-entry')).default,
  },
  {
    slug: 'dependency-injection-and-bean-lifecycle',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/dependency-injection-and-bean-lifecycle.md',
    ),
    load: async () =>
      (await import('./learn/dependency-injection-and-bean-lifecycle.md?content-entry')).default,
  },
  {
    slug: 'maven-project-model',
    meta: getContentMeta('src/categories/backend/java/core/learn/maven-project-model.md'),
    load: async () => (await import('./learn/maven-project-model.md?content-entry')).default,
  },
  {
    slug: 'lambda-stream-and-collectors',
    meta: getContentMeta('src/categories/backend/java/core/learn/lambda-stream-and-collectors.md'),
    load: async () =>
      (await import('./learn/lambda-stream-and-collectors.md?content-entry')).default,
  },
  {
    slug: 'stream-processing',
    meta: getContentMeta('src/categories/backend/java/core/learn/stream-processing.md'),
    load: async () => (await import('./learn/stream-processing.md?content-entry')).default,
  },
  {
    slug: 'relational-data-and-sql-foundations',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/relational-data-and-sql-foundations.md',
    ),
    load: async () =>
      (await import('./learn/relational-data-and-sql-foundations.md?content-entry')).default,
  },
  {
    slug: 'sql-queries',
    meta: getContentMeta('src/categories/backend/java/core/learn/sql-queries.md'),
    load: async () => (await import('./learn/sql-queries.md?content-entry')).default,
  },
  {
    slug: 'database-migrations',
    meta: getContentMeta('src/categories/backend/java/core/learn/database-migrations.md'),
    load: async () => (await import('./learn/database-migrations.md?content-entry')).default,
  },
  {
    slug: 'testing-with-junit-and-mocks',
    meta: getContentMeta('src/categories/backend/java/core/learn/testing-with-junit-and-mocks.md'),
    load: async () =>
      (await import('./learn/testing-with-junit-and-mocks.md?content-entry')).default,
  },
  {
    slug: 'controller-testing-mockmvc-and-test-slices',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/controller-testing-mockmvc-and-test-slices.md',
    ),
    load: async () =>
      (await import('./learn/controller-testing-mockmvc-and-test-slices.md?content-entry')).default,
  },
  {
    slug: 'integration-testing-with-spring-boot',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/integration-testing-with-spring-boot.md',
    ),
    load: async () =>
      (await import('./learn/integration-testing-with-spring-boot.md?content-entry')).default,
  },
  {
    slug: 'password-and-login',
    meta: getContentMeta('src/categories/backend/java/core/learn/password-and-login.md'),
    load: async () => (await import('./learn/password-and-login.md?content-entry')).default,
  },
  {
    slug: 'jwt-authentication',
    meta: getContentMeta('src/categories/backend/java/core/learn/jwt-authentication.md'),
    load: async () => (await import('./learn/jwt-authentication.md?content-entry')).default,
  },
  {
    slug: 'roles-and-permissions',
    meta: getContentMeta('src/categories/backend/java/core/learn/roles-and-permissions.md'),
    load: async () => (await import('./learn/roles-and-permissions.md?content-entry')).default,
  },
  {
    slug: 'logging-and-observability',
    meta: getContentMeta('src/categories/backend/java/core/learn/logging-and-observability.md'),
    load: async () => (await import('./learn/logging-and-observability.md?content-entry')).default,
  },
  {
    slug: 'health-checks-and-graceful-shutdown',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/health-checks-and-graceful-shutdown.md',
    ),
    load: async () =>
      (await import('./learn/health-checks-and-graceful-shutdown.md?content-entry')).default,
  },
  {
    slug: 'application-packaging',
    meta: getContentMeta('src/categories/backend/java/core/learn/application-packaging.md'),
    load: async () => (await import('./learn/application-packaging.md?content-entry')).default,
  },
  {
    slug: 'containerized-deployment',
    meta: getContentMeta('src/categories/backend/java/core/learn/containerized-deployment.md'),
    load: async () => (await import('./learn/containerized-deployment.md?content-entry')).default,
  },
  {
    slug: 'testing-and-delivery-check',
    meta: getContentMeta('src/categories/backend/java/core/learn/testing-and-delivery-check.md'),
    load: async () => (await import('./learn/testing-and-delivery-check.md?content-entry')).default,
  },
  {
    slug: 'external-http-calls',
    meta: getContentMeta('src/categories/backend/java/core/learn/external-http-calls.md'),
    load: async () => (await import('./learn/external-http-calls.md?content-entry')).default,
  },
  {
    slug: 'http-clients-and-integration-resilience',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/http-clients-and-integration-resilience.md',
    ),
    load: async () =>
      (await import('./learn/http-clients-and-integration-resilience.md?content-entry')).default,
  },
  {
    slug: 'events-async-scheduling-and-retry',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/events-async-scheduling-and-retry.md',
    ),
    load: async () =>
      (await import('./learn/events-async-scheduling-and-retry.md?content-entry')).default,
  },
  {
    slug: 'scheduled-tasks',
    meta: getContentMeta('src/categories/backend/java/core/learn/scheduled-tasks.md'),
    load: async () => (await import('./learn/scheduled-tasks.md?content-entry')).default,
  },
  {
    slug: 'message-queue-boundaries',
    meta: getContentMeta('src/categories/backend/java/core/learn/message-queue-boundaries.md'),
    load: async () => (await import('./learn/message-queue-boundaries.md?content-entry')).default,
  },
  {
    slug: 'rabbitmq-message-send-receive',
    meta: getContentMeta('src/categories/backend/java/core/learn/rabbitmq-message-send-receive.md'),
    load: async () =>
      (await import('./learn/rabbitmq-message-send-receive.md?content-entry')).default,
  },
  {
    slug: 'reliable-consumption-and-idempotency',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/reliable-consumption-and-idempotency.md',
    ),
    load: async () =>
      (await import('./learn/reliable-consumption-and-idempotency.md?content-entry')).default,
  },
  {
    slug: 'concurrent-updates-and-consistency',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/concurrent-updates-and-consistency.md',
    ),
    load: async () =>
      (await import('./learn/concurrent-updates-and-consistency.md?content-entry')).default,
  },
  {
    slug: 'async-notification-pipeline',
    meta: getContentMeta('src/categories/backend/java/core/learn/async-notification-pipeline.md'),
    load: async () =>
      (await import('./learn/async-notification-pipeline.md?content-entry')).default,
  },
  {
    slug: 'teamflow-complete-delivery',
    meta: getContentMeta('src/categories/backend/java/core/learn/teamflow-complete-delivery.md'),
    load: async () => (await import('./learn/teamflow-complete-delivery.md?content-entry')).default,
  },
  {
    slug: 'openapi-documentation-and-api-integration',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/openapi-documentation-and-api-integration.md',
    ),
    load: async () =>
      (await import('./learn/openapi-documentation-and-api-integration.md?content-entry')).default,
  },
  {
    slug: 'project-and-task-api-project',
    meta: getContentMeta('src/categories/backend/java/core/learn/project-and-task-api-project.md'),
    load: async () =>
      (await import('./learn/project-and-task-api-project.md?content-entry')).default,
  },
  {
    slug: 'spring-mvc-and-servlet-boundaries',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/spring-mvc-and-servlet-boundaries.md',
    ),
    load: async () =>
      (await import('./learn/spring-mvc-and-servlet-boundaries.md?content-entry')).default,
  },
  {
    slug: 'request-parameters-and-type-conversion',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/request-parameters-and-type-conversion.md',
    ),
    load: async () =>
      (await import('./learn/request-parameters-and-type-conversion.md?content-entry')).default,
  },
  {
    slug: 'request-body-and-json-binding',
    meta: getContentMeta('src/categories/backend/java/core/learn/request-body-and-json-binding.md'),
    load: async () =>
      (await import('./learn/request-body-and-json-binding.md?content-entry')).default,
  },
  {
    slug: 'response-and-status-codes',
    meta: getContentMeta('src/categories/backend/java/core/learn/response-and-status-codes.md'),
    load: async () => (await import('./learn/response-and-status-codes.md?content-entry')).default,
  },
  {
    slug: 'request-validation',
    meta: getContentMeta('src/categories/backend/java/core/learn/request-validation.md'),
    load: async () => (await import('./learn/request-validation.md?content-entry')).default,
  },
  {
    slug: 'unified-api-response',
    meta: getContentMeta('src/categories/backend/java/core/learn/unified-api-response.md'),
    load: async () => (await import('./learn/unified-api-response.md?content-entry')).default,
  },
  {
    slug: 'global-exception-handling',
    meta: getContentMeta('src/categories/backend/java/core/learn/global-exception-handling.md'),
    load: async () => (await import('./learn/global-exception-handling.md?content-entry')).default,
  },
  {
    slug: 'user-and-team-api-project',
    meta: getContentMeta('src/categories/backend/java/core/learn/user-and-team-api-project.md'),
    load: async () => (await import('./learn/user-and-team-api-project.md?content-entry')).default,
  },
  {
    slug: 'file-upload-and-download',
    meta: getContentMeta('src/categories/backend/java/core/learn/file-upload-and-download.md'),
    load: async () => (await import('./learn/file-upload-and-download.md?content-entry')).default,
  },
  {
    slug: 'cors-and-frontend-integration',
    meta: getContentMeta('src/categories/backend/java/core/learn/cors-and-frontend-integration.md'),
    load: async () =>
      (await import('./learn/cors-and-frontend-integration.md?content-entry')).default,
  },
  {
    slug: 'mybatis-and-mybatis-plus',
    meta: getContentMeta('src/categories/backend/java/core/learn/mybatis-and-mybatis-plus.md'),
    load: async () => (await import('./learn/mybatis-and-mybatis-plus.md?content-entry')).default,
  },
  {
    slug: 'mybatis-query-mapping',
    meta: getContentMeta('src/categories/backend/java/core/learn/mybatis-query-mapping.md'),
    load: async () => (await import('./learn/mybatis-query-mapping.md?content-entry')).default,
  },
  {
    slug: 'mybatis-write-and-dynamic-sql',
    meta: getContentMeta('src/categories/backend/java/core/learn/mybatis-write-and-dynamic-sql.md'),
    load: async () =>
      (await import('./learn/mybatis-write-and-dynamic-sql.md?content-entry')).default,
  },
  {
    slug: 'user-and-team-persistence-project',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/user-and-team-persistence-project.md',
    ),
    load: async () =>
      (await import('./learn/user-and-team-persistence-project.md?content-entry')).default,
  },
  {
    slug: 'mybatis-plus',
    meta: getContentMeta('src/categories/backend/java/core/learn/mybatis-plus.md'),
    load: async () => (await import('./learn/mybatis-plus.md?content-entry')).default,
  },
  {
    slug: 'mybatis-plus-pagination-and-filtering',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/mybatis-plus-pagination-and-filtering.md',
    ),
    load: async () =>
      (await import('./learn/mybatis-plus-pagination-and-filtering.md?content-entry')).default,
  },
  {
    slug: 'database-transactions',
    meta: getContentMeta('src/categories/backend/java/core/learn/database-transactions.md'),
    load: async () => (await import('./learn/database-transactions.md?content-entry')).default,
  },
  {
    slug: 'project-and-task-persistence-project',
    meta: getContentMeta(
      'src/categories/backend/java/core/learn/project-and-task-persistence-project.md',
    ),
    load: async () =>
      (await import('./learn/project-and-task-persistence-project.md?content-entry')).default,
  },
  {
    slug: 'redis-web-integration',
    meta: getContentMeta('src/categories/backend/java/core/learn/redis-web-integration.md'),
    load: async () => (await import('./learn/redis-web-integration.md?content-entry')).default,
  },
  {
    slug: 'cache-reading',
    meta: getContentMeta('src/categories/backend/java/core/learn/cache-reading.md'),
    load: async () => (await import('./learn/cache-reading.md?content-entry')).default,
  },
  {
    slug: 'cache-invalidation',
    meta: getContentMeta('src/categories/backend/java/core/learn/cache-invalidation.md'),
    load: async () => (await import('./learn/cache-invalidation.md?content-entry')).default,
  },
  {
    slug: 'verification-code',
    meta: getContentMeta('src/categories/backend/java/core/learn/verification-code.md'),
    load: async () => (await import('./learn/verification-code.md?content-entry')).default,
  },
  {
    slug: 'api-idempotency',
    meta: getContentMeta('src/categories/backend/java/core/learn/api-idempotency.md'),
    load: async () => (await import('./learn/api-idempotency.md?content-entry')).default,
  },
  {
    slug: 'task-query-cache-project',
    meta: getContentMeta('src/categories/backend/java/core/learn/task-query-cache-project.md'),
    load: async () => (await import('./learn/task-query-cache-project.md?content-entry')).default,
  },
]
