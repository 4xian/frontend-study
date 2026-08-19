import type { LearningTrackManifest } from '@/common/catalog/types'

export const engineeringTypeScriptTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从类型检查与推导开始，建立对象、函数、联合和模块的基础模型。',
      categories: [
        {
          id: 'language-foundations',
          title: '语言与类型基础',
          summary: '理解 TypeScript 如何检查 JavaScript，并用类型描述常见数据与函数合同。',
          topics: ['类型系统', '类型推导', '常用类型', '对象', '数组', '元组', '函数'],
          entries: [
            {
              id: 'engineering.typescript.learn.basics.type-system-and-inference',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.everyday-types',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.objects-arrays-tuples',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.functions',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.unions-and-literals',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.narrowing',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.aliases-and-interfaces',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.basics.modules',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '组合类型操作，并处理结构兼容、第三方声明、模块解析和错误值。',
      categories: [
        {
          id: 'type-operations-and-engineering',
          title: '类型操作与工程边界',
          summary: '从泛型关系逐步进入属性变换、类型分支与模块解析。',
          topics: ['泛型', '类型操作符', '映射类型', '条件类型', '模块解析', '错误处理'],
          entries: [
            {
              id: 'engineering.typescript.learn.intermediate.generics-and-constraints',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.keyof-typeof-indexed-access',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.mapped-types',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.conditional-types',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.template-literal-types',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.classes-and-compatibility',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.module-resolution-and-packages',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.intermediate.unknown-never-and-errors',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '设计可发布类型合同、声明输出、包入口和分层工程配置。',
      categories: [
        {
          id: 'library-contracts-and-tooling',
          title: '库合同与工具链',
          summary: '控制复杂类型、声明发布、工程性能和框架嵌入边界。',
          topics: ['infer', '类型设计', '声明文件', '包导出', '项目引用', '类型性能', 'Vue/TSX'],
          entries: [
            {
              id: 'engineering.typescript.learn.advanced.infer-and-distribution',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.type-design',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.declaration-files',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.package-exports',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.tsconfig-layering',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.type-performance',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.library-author-boundaries',
              status: 'available',
            },
            {
              id: 'engineering.typescript.learn.advanced.framework-type-integration',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
