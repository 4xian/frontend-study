import type { ReferenceTrackManifest } from '@/common/catalog/types'

export const engineeringTypeScriptReferenceManifest: ReferenceTrackManifest = {
  groups: [
    {
      id: 'handbook-v2',
      title: 'Handbook v2',
      summary: '语言基础、类、模块与类型操作符。',
      entryIds: ['engineering.typescript.reference.language-foundations'],
    },
    {
      id: 'general-reference',
      title: 'General Reference',
      summary: '声明、兼容性、推导与平台语法边界。',
      entryIds: ['engineering.typescript.reference.language-reference'],
    },
    {
      id: 'utility-types',
      title: 'Utility Types',
      summary: '官方稳定 Utility Type 签名与推导边界。',
      entryIds: ['engineering.typescript.reference.utility-types'],
    },
    {
      id: 'modules-reference',
      title: 'Modules Reference',
      summary: '模块 host、解析模式、包入口与 ESM/CJS 互操作。',
      entryIds: ['engineering.typescript.reference.modules-reference'],
    },
    {
      id: 'declaration-files',
      title: 'Declaration Files',
      summary: '声明建模、模板、发布与消费边界。',
      entryIds: [
        'engineering.typescript.reference.declaration-foundations',
        'engineering.typescript.reference.declaration-authoring-publishing',
        'engineering.typescript.reference.declaration-module-templates',
        'engineering.typescript.reference.declaration-global-templates',
      ],
    },
    {
      id: 'project-config',
      title: 'Project Config',
      summary: '项目配置、引用构建、watch 与外部构建工具接口。',
      entryIds: ['engineering.typescript.reference.project-config'],
    },
    {
      id: 'tsconfig',
      title: 'TSConfig',
      summary: '编译输入、检查、模块解析、输出、构建与语言环境配置。',
      entryIds: [
        'engineering.typescript.reference.tsconfig-project-input',
        'engineering.typescript.reference.tsconfig-javascript-acquisition',
        'engineering.typescript.reference.tsconfig-project-build',
        'engineering.typescript.reference.tsconfig-emit-declarations',
        'engineering.typescript.reference.tsconfig-diagnostics-safety',
        'engineering.typescript.reference.tsconfig-modules-resolution',
        'engineering.typescript.reference.tsconfig-language-jsx',
        'engineering.typescript.reference.tsconfig-strictness',
        'engineering.typescript.reference.tsconfig-emit-output',
        'engineering.typescript.reference.tsconfig-module-paths',
        'engineering.typescript.reference.tsconfig-type-environment',
        'engineering.typescript.reference.tsconfig-build-watch',
      ],
    },
  ],
}
