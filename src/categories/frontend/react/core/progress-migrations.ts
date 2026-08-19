import type { EntryProgressMigration } from '@/common/progress/progress'

export const reactCoreProgressMigrations: EntryProgressMigration[] = [
  {
    targetEntryId: 'react.core.learn.basics.render-commit-and-state-snapshot',
    sourceEntryIds: [
      'react.core.learn.basics.render-commit-and-state-snapshot',
      'react.core.learn.basics.state-update-queue',
    ],
  },
  {
    targetEntryId: 'react.core.learn.basics.immutable-state-updates',
    sourceEntryIds: [
      'react.core.learn.basics.updating-object-state',
      'react.core.learn.basics.updating-array-state',
    ],
  },
  {
    targetEntryId: 'react.core.learn.basics.react-forms',
    sourceEntryIds: [
      'react.core.learn.basics.controlled-forms',
      'react.core.learn.basics.form-submit-and-default-behavior',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.state-structure',
    sourceEntryIds: [
      'react.core.learn.intermediate.state-structure',
      'react.core.learn.intermediate.derived-values',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.lifting-state-up',
    sourceEntryIds: [
      'react.core.learn.intermediate.lifting-state-up',
      'react.core.learn.intermediate.controlled-and-uncontrolled-components',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.state-preservation-and-reset',
    sourceEntryIds: [
      'react.core.learn.intermediate.state-identity-by-position',
      'react.core.learn.intermediate.resetting-state-with-key',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.use-reducer',
    sourceEntryIds: [
      'react.core.learn.intermediate.use-reducer',
      'react.core.learn.intermediate.action-design',
      'react.core.learn.intermediate.reducer-purity',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.context-providing-and-reading',
    sourceEntryIds: [
      'react.core.learn.intermediate.create-context',
      'react.core.learn.intermediate.use-context',
      'react.core.learn.intermediate.provider-scope-and-overrides',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.dom-refs',
    sourceEntryIds: [
      'react.core.learn.intermediate.dom-refs',
      'react.core.learn.intermediate.callback-refs',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.use-effect',
    sourceEntryIds: [
      'react.core.learn.intermediate.use-effect',
      'react.core.learn.intermediate.effect-cleanup',
      'react.core.learn.intermediate.effect-lifecycle',
    ],
  },
  {
    targetEntryId: 'react.core.learn.intermediate.effect-dependencies',
    sourceEntryIds: [
      'react.core.learn.intermediate.effect-dependencies',
      'react.core.learn.intermediate.removing-effect-dependencies',
    ],
  },
  {
    targetEntryId: 'react.core.learn.advanced.use-resource-reading',
    sourceEntryIds: [
      'react.core.learn.advanced.use-resource-reading',
      'react.core.learn.advanced.use-promise-reading',
    ],
  },
  {
    targetEntryId: 'react.core.learn.advanced.use-transition-pending-action',
    sourceEntryIds: [
      'react.core.learn.advanced.use-transition-pending-action',
      'react.core.learn.advanced.start-transition-background-update',
    ],
  },
  {
    targetEntryId: 'react.core.learn.advanced.form-action-client-submission',
    sourceEntryIds: [
      'react.core.learn.advanced.form-action-client-submission',
      'react.core.learn.advanced.use-form-status-parent-scope',
    ],
  },
]
