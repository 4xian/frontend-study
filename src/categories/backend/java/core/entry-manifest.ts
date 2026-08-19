import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnDevelopmentEnvironmentAndRuntimeMeta } from './learn/development-environment-and-runtime.md?catalog-meta'
import { meta as learnCompilationAndExecutionMeta } from './learn/compilation-and-execution.md?catalog-meta'
import { meta as learnErrorLocalizationMeta } from './learn/error-localization.md?catalog-meta'
import { meta as learnBreakpointDebuggingMeta } from './learn/breakpoint-debugging.md?catalog-meta'
import { meta as learnPackagesImportsAndSourceStructureMeta } from './learn/packages-imports-and-source-structure.md?catalog-meta'
import { meta as learnVariablesAndAssignmentMeta } from './learn/variables-and-assignment.md?catalog-meta'
import { meta as learnVariablesTypesAndOperatorsMeta } from './learn/variables-types-and-operators.md?catalog-meta'
import { meta as learnTypeConversionMeta } from './learn/type-conversion.md?catalog-meta'
import { meta as learnOperatorsAndExpressionsMeta } from './learn/operators-and-expressions.md?catalog-meta'
import { meta as learnControlFlowMeta } from './learn/control-flow.md?catalog-meta'
import { meta as learnLoopControlMeta } from './learn/loop-control.md?catalog-meta'
import { meta as learnMethodsParametersAndScopeMeta } from './learn/methods-parameters-and-scope.md?catalog-meta'
import { meta as learnParameterPassingMeta } from './learn/parameter-passing.md?catalog-meta'
import { meta as learnArraysAndVarargsMeta } from './learn/arrays-and-varargs.md?catalog-meta'
import { meta as learnStringsEncodingAndTextMatchingMeta } from './learn/strings-encoding-and-text-matching.md?catalog-meta'
import { meta as learnCommandLineTaskManagerProjectMeta } from './learn/command-line-task-manager-project.md?catalog-meta'
import { meta as learnClassesObjectsAndImmutabilityMeta } from './learn/classes-objects-and-immutability.md?catalog-meta'
import { meta as learnConstructorsAndThisMeta } from './learn/constructors-and-this.md?catalog-meta'
import { meta as learnEncapsulationAndAccessControlMeta } from './learn/encapsulation-and-access-control.md?catalog-meta'
import { meta as learnStaticAndFinalMeta } from './learn/static-and-final.md?catalog-meta'
import { meta as learnEnumsAndFiniteValuesMeta } from './learn/enums-and-finite-values.md?catalog-meta'
import { meta as learnTaskDomainModelingProjectMeta } from './learn/task-domain-modeling-project.md?catalog-meta'
import { meta as learnInterfacesInheritanceAndPolymorphismMeta } from './learn/interfaces-inheritance-and-polymorphism.md?catalog-meta'
import { meta as learnAbstractClassesAndInterfacesMeta } from './learn/abstract-classes-and-interfaces.md?catalog-meta'
import { meta as learnPolymorphismMeta } from './learn/polymorphism.md?catalog-meta'
import { meta as learnObjectEqualsAndHashCodeMeta } from './learn/object-equals-and-hashcode.md?catalog-meta'
import { meta as learnRecordClassesMeta } from './learn/record-classes.md?catalog-meta'
import { meta as learnTaskNotificationStrategyMeta } from './learn/task-notification-strategy.md?catalog-meta'
import { meta as learnGenericsAndTypeSafetyMeta } from './learn/generics-and-type-safety.md?catalog-meta'
import { meta as learnDebuggingStackTracesAndJavadocMeta } from './learn/debugging-stack-traces-and-javadoc.md?catalog-meta'
import { meta as learnAnnotationsAndMetadataMeta } from './learn/annotations-and-metadata.md?catalog-meta'
import { meta as learnCollectionsAndIterationContractsMeta } from './learn/collections-and-iteration-contracts.md?catalog-meta'
import { meta as learnSetsAndUniquenessMeta } from './learn/sets-and-uniqueness.md?catalog-meta'
import { meta as learnMapsAndKeyValueAssociationsMeta } from './learn/maps-and-key-value-associations.md?catalog-meta'
import { meta as learnCollectionIterationAndSafeRemovalMeta } from './learn/collection-iteration-and-safe-removal.md?catalog-meta'
import { meta as learnTaskCollectionQueryProjectMeta } from './learn/task-collection-query-project.md?catalog-meta'
import { meta as learnComparableAndComparatorMeta } from './learn/comparable-and-comparator.md?catalog-meta'
import { meta as learnDateTimeAndTimeZonesMeta } from './learn/date-time-and-time-zones.md?catalog-meta'
import { meta as learnBigDecimalMeta } from './learn/bigdecimal.md?catalog-meta'
import { meta as learnProjectProgressReportMeta } from './learn/project-progress-report.md?catalog-meta'
import { meta as learnExceptionsAndCauseChainsMeta } from './learn/exceptions-and-cause-chains.md?catalog-meta'
import { meta as learnIoFilesAndResourceOwnershipMeta } from './learn/io-files-and-resource-ownership.md?catalog-meta'
import { meta as learnFileReadingAndWritingMeta } from './learn/file-reading-and-writing.md?catalog-meta'
import { meta as learnNullOptionalAndFailureSemanticsMeta } from './learn/null-optional-and-failure-semantics.md?catalog-meta'
import { meta as learnTextBuildingAndFormattingMeta } from './learn/text-building-and-formatting.md?catalog-meta'
import { meta as learnTaskListImportExportProjectMeta } from './learn/task-list-import-export-project.md?catalog-meta'
import { meta as learnHttpUriAndRequestResponseBasicsMeta } from './learn/http-uri-and-request-response-basics.md?catalog-meta'
import { meta as learnTransactionsAndIdempotencyMeta } from './learn/transactions-and-idempotency.md?catalog-meta'
import { meta as learnJsonAndDataContractsMeta } from './learn/json-and-data-contracts.md?catalog-meta'
import { meta as learnTaskApiDesignProjectMeta } from './learn/task-api-design-project.md?catalog-meta'
import { meta as learnUnifiedApiContractMeta } from './learn/unified-api-contract.md?catalog-meta'
import { meta as learnFirstSpringBootWebApiMeta } from './learn/first-spring-boot-web-api.md?catalog-meta'
import { meta as learnMavenProjectModelMeta } from './learn/maven-project-model.md?catalog-meta'
import { meta as learnFirstAutomatedTestWithJunitMeta } from './learn/first-automated-test-with-junit.md?catalog-meta'
import { meta as learnLambdaStreamAndCollectorsMeta } from './learn/lambda-stream-and-collectors.md?catalog-meta'
import { meta as learnStreamProcessingMeta } from './learn/stream-processing.md?catalog-meta'
import { meta as learnIdentifiersEqualityAndPaginationMeta } from './learn/identifiers-equality-and-pagination.md?catalog-meta'
import { meta as learnRelationalDataAndSqlFoundationsMeta } from './learn/relational-data-and-sql-foundations.md?catalog-meta'
import { meta as learnLayersDtoAndServiceBoundariesMeta } from './learn/layers-dto-and-service-boundaries.md?catalog-meta'
import { meta as learnSpringBootMysqlMybatisPersistenceBridgeMeta } from './learn/spring-boot-mysql-mybatis-persistence-bridge.md?catalog-meta'
import { meta as learnErrorsResultsAndLoggingMeta } from './learn/errors-results-and-logging.md?catalog-meta'
import { meta as learnTestingWithJunitAndMocksMeta } from './learn/testing-with-junit-and-mocks.md?catalog-meta'
import { meta as learnControllerTestingMockmvcAndTestSlicesMeta } from './learn/controller-testing-mockmvc-and-test-slices.md?catalog-meta'
import { meta as learnOpenapiDocumentationAndApiIntegrationMeta } from './learn/openapi-documentation-and-api-integration.md?catalog-meta'
import { meta as learnSpringBootAndConfigurationMeta } from './learn/spring-boot-and-configuration.md?catalog-meta'
import { meta as learnDependencyInjectionAndBeanLifecycleMeta } from './learn/dependency-injection-and-bean-lifecycle.md?catalog-meta'
import { meta as learnSpringMvcAndServletBoundariesMeta } from './learn/spring-mvc-and-servlet-boundaries.md?catalog-meta'
import { meta as learnRequestParametersAndTypeConversionMeta } from './learn/request-parameters-and-type-conversion.md?catalog-meta'
import { meta as learnRequestBodyAndJsonBindingMeta } from './learn/request-body-and-json-binding.md?catalog-meta'
import { meta as learnResponseAndStatusCodesMeta } from './learn/response-and-status-codes.md?catalog-meta'
import { meta as learnRequestValidationMeta } from './learn/request-validation.md?catalog-meta'
import { meta as learnUnifiedApiResponseMeta } from './learn/unified-api-response.md?catalog-meta'
import { meta as learnBeanValidationAndInputContractsMeta } from './learn/bean-validation-and-input-contracts.md?catalog-meta'
import { meta as learnMybatisAndMybatisPlusMeta } from './learn/mybatis-and-mybatis-plus.md?catalog-meta'
import { meta as learnLombokAndGeneratedContractsMeta } from './learn/lombok-and-generated-contracts.md?catalog-meta'
import { meta as learnServiceDesignPatternsMeta } from './learn/service-design-patterns.md?catalog-meta'
import { meta as learnDomainValuesTreesAndMappingMeta } from './learn/domain-values-trees-and-mapping.md?catalog-meta'
import { meta as learnReflectionAopAndCrossCuttingContractsMeta } from './learn/reflection-aop-and-cross-cutting-contracts.md?catalog-meta'
import { meta as learnConcurrencyLocksAndSharedStateMeta } from './learn/concurrency-locks-and-shared-state.md?catalog-meta'
import { meta as learnThreadContextAndCleanupMeta } from './learn/thread-context-and-cleanup.md?catalog-meta'
import { meta as learnEventsAsyncSchedulingAndRetryMeta } from './learn/events-async-scheduling-and-retry.md?catalog-meta'
import { meta as learnCacheAndConsistencyMeta } from './learn/cache-and-consistency.md?catalog-meta'
import { meta as learnWebsocketAndRealtimeLifecycleMeta } from './learn/websocket-and-realtime-lifecycle.md?catalog-meta'
import { meta as learnDatabaseShardingAndSqlBoundariesMeta } from './learn/database-sharding-and-sql-boundaries.md?catalog-meta'
import { meta as learnHttpClientsAndIntegrationResilienceMeta } from './learn/http-clients-and-integration-resilience.md?catalog-meta'
import { meta as learnFileStorageAndArchiveBoundariesMeta } from './learn/file-storage-and-archive-boundaries.md?catalog-meta'
import { meta as learnBinaryStreamsMediaAndBackpressureMeta } from './learn/binary-streams-media-and-backpressure.md?catalog-meta'
import { meta as learnProcessJvmAndObservabilityMeta } from './learn/process-jvm-and-observability.md?catalog-meta'
import { meta as learnAuthenticationAuthorizationAndJwtMeta } from './learn/authentication-authorization-and-jwt.md?catalog-meta'
import { meta as learnCryptographySecretsAndLicenseVerificationMeta } from './learn/cryptography-secrets-and-license-verification.md?catalog-meta'
import { meta as learnSecureInputAndApiExposureMeta } from './learn/secure-input-and-api-exposure.md?catalog-meta'
import { meta as learnChainsRegistriesAndStateMachinesMeta } from './learn/chains-registries-and-state-machines.md?catalog-meta'
import { meta as learnLegacyIsolationAndModernizationMeta } from './learn/legacy-isolation-and-modernization.md?catalog-meta'

export const javaCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'development-environment-and-runtime',
    meta: learnDevelopmentEnvironmentAndRuntimeMeta,
    load: async () =>
      (await import('./learn/development-environment-and-runtime.md?content-entry')).default,
  },
  {
    slug: 'compilation-and-execution',
    meta: learnCompilationAndExecutionMeta,
    load: async () => (await import('./learn/compilation-and-execution.md?content-entry')).default,
  },
  {
    slug: 'error-localization',
    meta: learnErrorLocalizationMeta,
    load: async () => (await import('./learn/error-localization.md?content-entry')).default,
  },
  {
    slug: 'breakpoint-debugging',
    meta: learnBreakpointDebuggingMeta,
    load: async () => (await import('./learn/breakpoint-debugging.md?content-entry')).default,
  },
  {
    slug: 'packages-imports-and-source-structure',
    meta: learnPackagesImportsAndSourceStructureMeta,
    load: async () =>
      (await import('./learn/packages-imports-and-source-structure.md?content-entry')).default,
  },
  {
    slug: 'variables-and-assignment',
    meta: learnVariablesAndAssignmentMeta,
    load: async () => (await import('./learn/variables-and-assignment.md?content-entry')).default,
  },
  {
    slug: 'variables-types-and-operators',
    meta: learnVariablesTypesAndOperatorsMeta,
    load: async () =>
      (await import('./learn/variables-types-and-operators.md?content-entry')).default,
  },
  {
    slug: 'type-conversion',
    meta: learnTypeConversionMeta,
    load: async () => (await import('./learn/type-conversion.md?content-entry')).default,
  },
  {
    slug: 'operators-and-expressions',
    meta: learnOperatorsAndExpressionsMeta,
    load: async () => (await import('./learn/operators-and-expressions.md?content-entry')).default,
  },
  {
    slug: 'control-flow',
    meta: learnControlFlowMeta,
    load: async () => (await import('./learn/control-flow.md?content-entry')).default,
  },
  {
    slug: 'loop-control',
    meta: learnLoopControlMeta,
    load: async () => (await import('./learn/loop-control.md?content-entry')).default,
  },
  {
    slug: 'methods-parameters-and-scope',
    meta: learnMethodsParametersAndScopeMeta,
    load: async () =>
      (await import('./learn/methods-parameters-and-scope.md?content-entry')).default,
  },
  {
    slug: 'parameter-passing',
    meta: learnParameterPassingMeta,
    load: async () => (await import('./learn/parameter-passing.md?content-entry')).default,
  },
  {
    slug: 'arrays-and-varargs',
    meta: learnArraysAndVarargsMeta,
    load: async () => (await import('./learn/arrays-and-varargs.md?content-entry')).default,
  },
  {
    slug: 'strings-encoding-and-text-matching',
    meta: learnStringsEncodingAndTextMatchingMeta,
    load: async () =>
      (await import('./learn/strings-encoding-and-text-matching.md?content-entry')).default,
  },
  {
    slug: 'command-line-task-manager-project',
    meta: learnCommandLineTaskManagerProjectMeta,
    load: async () =>
      (await import('./learn/command-line-task-manager-project.md?content-entry')).default,
  },
  {
    slug: 'classes-objects-and-immutability',
    meta: learnClassesObjectsAndImmutabilityMeta,
    load: async () =>
      (await import('./learn/classes-objects-and-immutability.md?content-entry')).default,
  },
  {
    slug: 'constructors-and-this',
    meta: learnConstructorsAndThisMeta,
    load: async () => (await import('./learn/constructors-and-this.md?content-entry')).default,
  },
  {
    slug: 'encapsulation-and-access-control',
    meta: learnEncapsulationAndAccessControlMeta,
    load: async () =>
      (await import('./learn/encapsulation-and-access-control.md?content-entry')).default,
  },
  {
    slug: 'static-and-final',
    meta: learnStaticAndFinalMeta,
    load: async () => (await import('./learn/static-and-final.md?content-entry')).default,
  },
  {
    slug: 'enums-and-finite-values',
    meta: learnEnumsAndFiniteValuesMeta,
    load: async () => (await import('./learn/enums-and-finite-values.md?content-entry')).default,
  },
  {
    slug: 'task-domain-modeling-project',
    meta: learnTaskDomainModelingProjectMeta,
    load: async () =>
      (await import('./learn/task-domain-modeling-project.md?content-entry')).default,
  },
  {
    slug: 'interfaces-inheritance-and-polymorphism',
    meta: learnInterfacesInheritanceAndPolymorphismMeta,
    load: async () =>
      (await import('./learn/interfaces-inheritance-and-polymorphism.md?content-entry')).default,
  },
  {
    slug: 'abstract-classes-and-interfaces',
    meta: learnAbstractClassesAndInterfacesMeta,
    load: async () =>
      (await import('./learn/abstract-classes-and-interfaces.md?content-entry')).default,
  },
  {
    slug: 'polymorphism',
    meta: learnPolymorphismMeta,
    load: async () => (await import('./learn/polymorphism.md?content-entry')).default,
  },
  {
    slug: 'object-equals-and-hashcode',
    meta: learnObjectEqualsAndHashCodeMeta,
    load: async () => (await import('./learn/object-equals-and-hashcode.md?content-entry')).default,
  },
  {
    slug: 'record-classes',
    meta: learnRecordClassesMeta,
    load: async () => (await import('./learn/record-classes.md?content-entry')).default,
  },
  {
    slug: 'task-notification-strategy',
    meta: learnTaskNotificationStrategyMeta,
    load: async () => (await import('./learn/task-notification-strategy.md?content-entry')).default,
  },
  {
    slug: 'generics-and-type-safety',
    meta: learnGenericsAndTypeSafetyMeta,
    load: async () => (await import('./learn/generics-and-type-safety.md?content-entry')).default,
  },
  {
    slug: 'debugging-stack-traces-and-javadoc',
    meta: learnDebuggingStackTracesAndJavadocMeta,
    load: async () =>
      (await import('./learn/debugging-stack-traces-and-javadoc.md?content-entry')).default,
  },
  {
    slug: 'annotations-and-metadata',
    meta: learnAnnotationsAndMetadataMeta,
    load: async () => (await import('./learn/annotations-and-metadata.md?content-entry')).default,
  },
  {
    slug: 'collections-and-iteration-contracts',
    meta: learnCollectionsAndIterationContractsMeta,
    load: async () =>
      (await import('./learn/collections-and-iteration-contracts.md?content-entry')).default,
  },
  {
    slug: 'sets-and-uniqueness',
    meta: learnSetsAndUniquenessMeta,
    load: async () => (await import('./learn/sets-and-uniqueness.md?content-entry')).default,
  },
  {
    slug: 'maps-and-key-value-associations',
    meta: learnMapsAndKeyValueAssociationsMeta,
    load: async () =>
      (await import('./learn/maps-and-key-value-associations.md?content-entry')).default,
  },
  {
    slug: 'collection-iteration-and-safe-removal',
    meta: learnCollectionIterationAndSafeRemovalMeta,
    load: async () =>
      (await import('./learn/collection-iteration-and-safe-removal.md?content-entry')).default,
  },
  {
    slug: 'task-collection-query-project',
    meta: learnTaskCollectionQueryProjectMeta,
    load: async () =>
      (await import('./learn/task-collection-query-project.md?content-entry')).default,
  },
  {
    slug: 'comparable-and-comparator',
    meta: learnComparableAndComparatorMeta,
    load: async () => (await import('./learn/comparable-and-comparator.md?content-entry')).default,
  },
  {
    slug: 'date-time-and-time-zones',
    meta: learnDateTimeAndTimeZonesMeta,
    load: async () => (await import('./learn/date-time-and-time-zones.md?content-entry')).default,
  },
  {
    slug: 'bigdecimal',
    meta: learnBigDecimalMeta,
    load: async () => (await import('./learn/bigdecimal.md?content-entry')).default,
  },
  {
    slug: 'project-progress-report',
    meta: learnProjectProgressReportMeta,
    load: async () => (await import('./learn/project-progress-report.md?content-entry')).default,
  },
  {
    slug: 'exceptions-and-cause-chains',
    meta: learnExceptionsAndCauseChainsMeta,
    load: async () =>
      (await import('./learn/exceptions-and-cause-chains.md?content-entry')).default,
  },
  {
    slug: 'io-files-and-resource-ownership',
    meta: learnIoFilesAndResourceOwnershipMeta,
    load: async () =>
      (await import('./learn/io-files-and-resource-ownership.md?content-entry')).default,
  },
  {
    slug: 'file-reading-and-writing',
    meta: learnFileReadingAndWritingMeta,
    load: async () => (await import('./learn/file-reading-and-writing.md?content-entry')).default,
  },
  {
    slug: 'null-optional-and-failure-semantics',
    meta: learnNullOptionalAndFailureSemanticsMeta,
    load: async () =>
      (await import('./learn/null-optional-and-failure-semantics.md?content-entry')).default,
  },
  {
    slug: 'text-building-and-formatting',
    meta: learnTextBuildingAndFormattingMeta,
    load: async () =>
      (await import('./learn/text-building-and-formatting.md?content-entry')).default,
  },
  {
    slug: 'task-list-import-export-project',
    meta: learnTaskListImportExportProjectMeta,
    load: async () =>
      (await import('./learn/task-list-import-export-project.md?content-entry')).default,
  },
  {
    slug: 'http-uri-and-request-response-basics',
    meta: learnHttpUriAndRequestResponseBasicsMeta,
    load: async () =>
      (await import('./learn/http-uri-and-request-response-basics.md?content-entry')).default,
  },
  {
    slug: 'transactions-and-idempotency',
    meta: learnTransactionsAndIdempotencyMeta,
    load: async () =>
      (await import('./learn/transactions-and-idempotency.md?content-entry')).default,
  },
  {
    slug: 'json-and-data-contracts',
    meta: learnJsonAndDataContractsMeta,
    load: async () => (await import('./learn/json-and-data-contracts.md?content-entry')).default,
  },
  {
    slug: 'task-api-design-project',
    meta: learnTaskApiDesignProjectMeta,
    load: async () => (await import('./learn/task-api-design-project.md?content-entry')).default,
  },
  {
    slug: 'unified-api-contract',
    meta: learnUnifiedApiContractMeta,
    load: async () => (await import('./learn/unified-api-contract.md?content-entry')).default,
  },
  {
    slug: 'first-spring-boot-web-api',
    meta: learnFirstSpringBootWebApiMeta,
    load: async () => (await import('./learn/first-spring-boot-web-api.md?content-entry')).default,
  },
  {
    slug: 'spring-boot-and-configuration',
    meta: learnSpringBootAndConfigurationMeta,
    load: async () =>
      (await import('./learn/spring-boot-and-configuration.md?content-entry')).default,
  },
  {
    slug: 'dependency-injection-and-bean-lifecycle',
    meta: learnDependencyInjectionAndBeanLifecycleMeta,
    load: async () =>
      (await import('./learn/dependency-injection-and-bean-lifecycle.md?content-entry')).default,
  },
  {
    slug: 'maven-project-model',
    meta: learnMavenProjectModelMeta,
    load: async () => (await import('./learn/maven-project-model.md?content-entry')).default,
  },
  {
    slug: 'first-automated-test-with-junit',
    meta: learnFirstAutomatedTestWithJunitMeta,
    load: async () =>
      (await import('./learn/first-automated-test-with-junit.md?content-entry')).default,
  },
  {
    slug: 'lambda-stream-and-collectors',
    meta: learnLambdaStreamAndCollectorsMeta,
    load: async () =>
      (await import('./learn/lambda-stream-and-collectors.md?content-entry')).default,
  },
  {
    slug: 'stream-processing',
    meta: learnStreamProcessingMeta,
    load: async () => (await import('./learn/stream-processing.md?content-entry')).default,
  },
  {
    slug: 'identifiers-equality-and-pagination',
    meta: learnIdentifiersEqualityAndPaginationMeta,
    load: async () =>
      (await import('./learn/identifiers-equality-and-pagination.md?content-entry')).default,
  },
  {
    slug: 'relational-data-and-sql-foundations',
    meta: learnRelationalDataAndSqlFoundationsMeta,
    load: async () =>
      (await import('./learn/relational-data-and-sql-foundations.md?content-entry')).default,
  },
  {
    slug: 'layers-dto-and-service-boundaries',
    meta: learnLayersDtoAndServiceBoundariesMeta,
    load: async () =>
      (await import('./learn/layers-dto-and-service-boundaries.md?content-entry')).default,
  },
  {
    slug: 'spring-boot-mysql-mybatis-persistence-bridge',
    meta: learnSpringBootMysqlMybatisPersistenceBridgeMeta,
    load: async () =>
      (await import('./learn/spring-boot-mysql-mybatis-persistence-bridge.md?content-entry'))
        .default,
  },
  {
    slug: 'errors-results-and-logging',
    meta: learnErrorsResultsAndLoggingMeta,
    load: async () => (await import('./learn/errors-results-and-logging.md?content-entry')).default,
  },
  {
    slug: 'testing-with-junit-and-mocks',
    meta: learnTestingWithJunitAndMocksMeta,
    load: async () =>
      (await import('./learn/testing-with-junit-and-mocks.md?content-entry')).default,
  },
  {
    slug: 'controller-testing-mockmvc-and-test-slices',
    meta: learnControllerTestingMockmvcAndTestSlicesMeta,
    load: async () =>
      (await import('./learn/controller-testing-mockmvc-and-test-slices.md?content-entry')).default,
  },
  {
    slug: 'openapi-documentation-and-api-integration',
    meta: learnOpenapiDocumentationAndApiIntegrationMeta,
    load: async () =>
      (await import('./learn/openapi-documentation-and-api-integration.md?content-entry')).default,
  },
  {
    slug: 'spring-mvc-and-servlet-boundaries',
    meta: learnSpringMvcAndServletBoundariesMeta,
    load: async () =>
      (await import('./learn/spring-mvc-and-servlet-boundaries.md?content-entry')).default,
  },
  {
    slug: 'request-parameters-and-type-conversion',
    meta: learnRequestParametersAndTypeConversionMeta,
    load: async () =>
      (await import('./learn/request-parameters-and-type-conversion.md?content-entry')).default,
  },
  {
    slug: 'request-body-and-json-binding',
    meta: learnRequestBodyAndJsonBindingMeta,
    load: async () =>
      (await import('./learn/request-body-and-json-binding.md?content-entry')).default,
  },
  {
    slug: 'response-and-status-codes',
    meta: learnResponseAndStatusCodesMeta,
    load: async () => (await import('./learn/response-and-status-codes.md?content-entry')).default,
  },
  {
    slug: 'request-validation',
    meta: learnRequestValidationMeta,
    load: async () => (await import('./learn/request-validation.md?content-entry')).default,
  },
  {
    slug: 'unified-api-response',
    meta: learnUnifiedApiResponseMeta,
    load: async () => (await import('./learn/unified-api-response.md?content-entry')).default,
  },
  {
    slug: 'bean-validation-and-input-contracts',
    meta: learnBeanValidationAndInputContractsMeta,
    load: async () =>
      (await import('./learn/bean-validation-and-input-contracts.md?content-entry')).default,
  },
  {
    slug: 'mybatis-and-mybatis-plus',
    meta: learnMybatisAndMybatisPlusMeta,
    load: async () => (await import('./learn/mybatis-and-mybatis-plus.md?content-entry')).default,
  },
  {
    slug: 'lombok-and-generated-contracts',
    meta: learnLombokAndGeneratedContractsMeta,
    load: async () =>
      (await import('./learn/lombok-and-generated-contracts.md?content-entry')).default,
  },
  {
    slug: 'service-design-patterns',
    meta: learnServiceDesignPatternsMeta,
    load: async () => (await import('./learn/service-design-patterns.md?content-entry')).default,
  },
  {
    slug: 'domain-values-trees-and-mapping',
    meta: learnDomainValuesTreesAndMappingMeta,
    load: async () =>
      (await import('./learn/domain-values-trees-and-mapping.md?content-entry')).default,
  },
  {
    slug: 'reflection-aop-and-cross-cutting-contracts',
    meta: learnReflectionAopAndCrossCuttingContractsMeta,
    load: async () =>
      (await import('./learn/reflection-aop-and-cross-cutting-contracts.md?content-entry')).default,
  },
  {
    slug: 'concurrency-locks-and-shared-state',
    meta: learnConcurrencyLocksAndSharedStateMeta,
    load: async () =>
      (await import('./learn/concurrency-locks-and-shared-state.md?content-entry')).default,
  },
  {
    slug: 'thread-context-and-cleanup',
    meta: learnThreadContextAndCleanupMeta,
    load: async () => (await import('./learn/thread-context-and-cleanup.md?content-entry')).default,
  },
  {
    slug: 'events-async-scheduling-and-retry',
    meta: learnEventsAsyncSchedulingAndRetryMeta,
    load: async () =>
      (await import('./learn/events-async-scheduling-and-retry.md?content-entry')).default,
  },
  {
    slug: 'cache-and-consistency',
    meta: learnCacheAndConsistencyMeta,
    load: async () => (await import('./learn/cache-and-consistency.md?content-entry')).default,
  },
  {
    slug: 'websocket-and-realtime-lifecycle',
    meta: learnWebsocketAndRealtimeLifecycleMeta,
    load: async () =>
      (await import('./learn/websocket-and-realtime-lifecycle.md?content-entry')).default,
  },
  {
    slug: 'database-sharding-and-sql-boundaries',
    meta: learnDatabaseShardingAndSqlBoundariesMeta,
    load: async () =>
      (await import('./learn/database-sharding-and-sql-boundaries.md?content-entry')).default,
  },
  {
    slug: 'http-clients-and-integration-resilience',
    meta: learnHttpClientsAndIntegrationResilienceMeta,
    load: async () =>
      (await import('./learn/http-clients-and-integration-resilience.md?content-entry')).default,
  },
  {
    slug: 'file-storage-and-archive-boundaries',
    meta: learnFileStorageAndArchiveBoundariesMeta,
    load: async () =>
      (await import('./learn/file-storage-and-archive-boundaries.md?content-entry')).default,
  },
  {
    slug: 'binary-streams-media-and-backpressure',
    meta: learnBinaryStreamsMediaAndBackpressureMeta,
    load: async () =>
      (await import('./learn/binary-streams-media-and-backpressure.md?content-entry')).default,
  },
  {
    slug: 'process-jvm-and-observability',
    meta: learnProcessJvmAndObservabilityMeta,
    load: async () =>
      (await import('./learn/process-jvm-and-observability.md?content-entry')).default,
  },
  {
    slug: 'authentication-authorization-and-jwt',
    meta: learnAuthenticationAuthorizationAndJwtMeta,
    load: async () =>
      (await import('./learn/authentication-authorization-and-jwt.md?content-entry')).default,
  },
  {
    slug: 'cryptography-secrets-and-license-verification',
    meta: learnCryptographySecretsAndLicenseVerificationMeta,
    load: async () =>
      (await import('./learn/cryptography-secrets-and-license-verification.md?content-entry'))
        .default,
  },
  {
    slug: 'secure-input-and-api-exposure',
    meta: learnSecureInputAndApiExposureMeta,
    load: async () =>
      (await import('./learn/secure-input-and-api-exposure.md?content-entry')).default,
  },
  {
    slug: 'chains-registries-and-state-machines',
    meta: learnChainsRegistriesAndStateMachinesMeta,
    load: async () =>
      (await import('./learn/chains-registries-and-state-machines.md?content-entry')).default,
  },
  {
    slug: 'legacy-isolation-and-modernization',
    meta: learnLegacyIsolationAndModernizationMeta,
    load: async () =>
      (await import('./learn/legacy-isolation-and-modernization.md?content-entry')).default,
  },
]
