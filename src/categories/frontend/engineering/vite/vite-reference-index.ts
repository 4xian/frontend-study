import type {
  ReferenceCoverageDepth,
  ReferenceIndexItemManifest,
  ReferenceIndexManifest,
} from '@/common/catalog/types'

type ReferenceDefinition = readonly [
  officialKey: string,
  name: string,
  officialAnchor: string,
  targetAnchor: string,
  depth: ReferenceCoverageDepth,
  aliases?: readonly string[],
]

interface ViteReferenceIndexItem extends ReferenceIndexItemManifest {
  officialKey: string
}

/** 将一组官方定义映射为可搜索、可深链的稳定 Reference 项。 */
function createReferenceItems(
  baseUrl: string,
  entrySlug: string,
  definitions: readonly ReferenceDefinition[],
): ViteReferenceIndexItem[] {
  const entryId = `engineering.vite.reference.${entrySlug}`
  return definitions.map(([officialKey, name, officialAnchor, targetAnchor, depth, aliases]) => ({
    officialKey,
    id: officialKey,
    name,
    aliases,
    officialUrl: `${baseUrl}#${officialAnchor}`,
    depth,
    sourceTag: 'public',
    status: 'available',
    target: { entryId, anchor: targetAnchor },
  }))
}

const sharedItems = createReferenceItems(
  'https://vite.dev/config/shared-options',
  'config-shared',
  [
    ['shared.root', 'root', 'root', '一root', 'detail'],
    ['shared.base', 'base', 'base', '二base', 'detail'],
    ['shared.mode', 'mode', 'mode', '三mode', 'detail'],
    ['shared.input', 'input', 'input', '四input', 'detail'],
    ['shared.define', 'define', 'define', '五define', 'detail'],
    ['shared.plugins', 'plugins', 'plugins', '六plugins', 'detail'],
    ['shared.publicDir', 'publicDir', 'publicdir', '七publicdir', 'merged'],
    ['shared.cacheDir', 'cacheDir', 'cachedir', '八cachedir', 'quick'],
    ['shared.resolve.alias', 'resolve.alias', 'resolve-alias', '九resolvealias', 'detail'],
    ['shared.resolve.dedupe', 'resolve.dedupe', 'resolve-dedupe', '十resolvededupe', 'quick'],
    [
      'shared.resolve.conditions',
      'resolve.conditions',
      'resolve-conditions',
      '十一resolveconditions',
      'quick',
    ],
    [
      'shared.resolve.mainFields',
      'resolve.mainFields',
      'resolve-mainfields',
      '十二resolvemainfields',
      'quick',
    ],
    [
      'shared.resolve.extensions',
      'resolve.extensions',
      'resolve-extensions',
      '十三resolveextensions',
      'quick',
    ],
    [
      'shared.resolve.preserveSymlinks',
      'resolve.preserveSymlinks',
      'resolve-preservesymlinks',
      '十四resolvepreservesymlinks',
      'quick',
    ],
    [
      'shared.resolve.tsconfigPaths',
      'resolve.tsconfigPaths',
      'resolve-tsconfigpaths',
      '十五resolvetsconfigpaths',
      'detail',
    ],
    ['shared.html.cspNonce', 'html.cspNonce', 'html-cspnonce', '十六htmlcspnonce', 'detail'],
    [
      'shared.html.additionalAssetSources',
      'html.additionalAssetSources',
      'html-additionalassetsources',
      '十七htmladditionalassetsources',
      'merged',
    ],
    ['shared.css.modules', 'css.modules', 'css-modules', '十八cssmodules', 'merged'],
    ['shared.css.postcss', 'css.postcss', 'css-postcss', '十九csspostcss', 'merged'],
    [
      'shared.css.preprocessorOptions',
      'css.preprocessorOptions',
      'css-preprocessoroptions',
      '二十csspreprocessoroptions',
      'merged',
    ],
    [
      'shared.css.preprocessorMaxWorkers',
      'css.preprocessorMaxWorkers',
      'css-preprocessormaxworkers',
      '二十一csspreprocessormaxworkers',
      'quick',
    ],
    [
      'shared.json.namedExports',
      'json.namedExports',
      'json-namedexports',
      '二十二jsonnamedexports',
      'quick',
    ],
    ['shared.json.stringify', 'json.stringify', 'json-stringify', '二十三jsonstringify', 'quick'],
    ['shared.oxc', 'oxc', 'oxc', '二十四oxc', 'detail'],
    ['shared.assetsInclude', 'assetsInclude', 'assetsinclude', '二十五assetsinclude', 'merged'],
    ['shared.logLevel', 'logLevel', 'loglevel', '二十六loglevel', 'quick'],
    ['shared.customLogger', 'customLogger', 'customlogger', '二十七customlogger', 'merged'],
    ['shared.clearScreen', 'clearScreen', 'clearscreen', '二十八clearscreen', 'quick'],
    ['shared.envDir', 'envDir', 'envdir', '二十九envdir', 'detail'],
    ['shared.envPrefix', 'envPrefix', 'envprefix', '三十envprefix', 'detail'],
    ['shared.appType', 'appType', 'apptype', '三十一apptype', 'quick'],
    ['shared.future', 'future', 'future', '三十二future', 'quick'],
  ] as const,
)

const serverItems = createReferenceItems(
  'https://vite.dev/config/server-options',
  'config-server',
  [
    ['server.host', 'server.host', 'server-host', '一serverhost', 'detail'],
    [
      'server.allowedHosts',
      'server.allowedHosts',
      'server-allowedhosts',
      '二serverallowedhosts',
      'detail',
      ['Host allowlist', '主机允许列表'],
    ],
    ['server.port', 'server.port', 'server-port', '三serverport', 'detail'],
    ['server.strictPort', 'server.strictPort', 'server-strictport', '四serverstrictport', 'quick'],
    ['server.https', 'server.https', 'server-https', '五serverhttps', 'quick'],
    ['server.open', 'server.open', 'server-open', '六serveropen', 'quick'],
    ['server.proxy', 'server.proxy', 'server-proxy', '七serverproxy', 'detail'],
    ['server.cors', 'server.cors', 'server-cors', '八servercors', 'detail'],
    ['server.headers', 'server.headers', 'server-headers', '九serverheaders', 'quick'],
    ['server.hmr', 'server.hmr', 'server-hmr', '十serverhmr', 'detail'],
    ['server.ws', 'server.ws', 'server-ws', '十一serverws', 'detail'],
    [
      'server.forwardConsole',
      'server.forwardConsole',
      'server-forwardconsole',
      '十二serverforwardconsole',
      'merged',
    ],
    ['server.warmup', 'server.warmup', 'server-warmup', '十三serverwarmup', 'merged'],
    ['server.watch', 'server.watch', 'server-watch', '十四serverwatch', 'merged'],
    [
      'server.middlewareMode',
      'server.middlewareMode',
      'server-middlewaremode',
      '十五servermiddlewaremode',
      'detail',
    ],
    ['server.fs.strict', 'server.fs.strict', 'server-fs-strict', '十六serverfsstrict', 'quick'],
    ['server.fs.allow', 'server.fs.allow', 'server-fs-allow', '十七serverfsallow', 'detail'],
    ['server.fs.deny', 'server.fs.deny', 'server-fs-deny', '十八serverfsdeny', 'detail'],
    ['server.origin', 'server.origin', 'server-origin', '十九serverorigin', 'quick'],
    [
      'server.sourcemapIgnoreList',
      'server.sourcemapIgnoreList',
      'server-sourcemapignorelist',
      '二十serversourcemapignorelist',
      'quick',
    ],
  ] as const,
)

const buildItems = createReferenceItems('https://vite.dev/config/build-options', 'config-build', [
  ['build.target', 'build.target', 'build-target', '一buildtarget', 'detail'],
  [
    'build.modulePreload',
    'build.modulePreload',
    'build-modulepreload',
    '二buildmodulepreload',
    'detail',
  ],
  ['build.outDir', 'build.outDir', 'build-outdir', '三buildoutdir', 'detail'],
  ['build.assetsDir', 'build.assetsDir', 'build-assetsdir', '四buildassetsdir', 'merged'],
  [
    'build.assetsInlineLimit',
    'build.assetsInlineLimit',
    'build-assetsinlinelimit',
    '五buildassetsinlinelimit',
    'detail',
  ],
  [
    'build.cssCodeSplit',
    'build.cssCodeSplit',
    'build-csscodesplit',
    '六buildcsscodesplit',
    'merged',
  ],
  ['build.cssTarget', 'build.cssTarget', 'build-csstarget', '七buildcsstarget', 'merged'],
  ['build.cssMinify', 'build.cssMinify', 'build-cssminify', '八buildcssminify', 'merged'],
  ['build.sourcemap', 'build.sourcemap', 'build-sourcemap', '九buildsourcemap', 'detail'],
  [
    'build.rolldownOptions',
    'build.rolldownOptions',
    'build-rolldownoptions',
    '十buildrolldownoptions',
    'detail',
  ],
  [
    'build.dynamicImportVarsOptions',
    'build.dynamicImportVarsOptions',
    'build-dynamicimportvarsoptions',
    '十一builddynamicimportvarsoptions',
    'merged',
  ],
  ['build.lib', 'build.lib', 'build-lib', '十二buildlib', 'detail'],
  ['build.license', 'build.license', 'build-license', '十三buildlicense', 'detail'],
  ['build.manifest', 'build.manifest', 'build-manifest', '十四buildmanifest', 'merged'],
  ['build.ssrManifest', 'build.ssrManifest', 'build-ssrmanifest', '十五buildssrmanifest', 'merged'],
  ['build.ssr', 'build.ssr', 'build-ssr', '十六buildssr', 'detail'],
  ['build.emitAssets', 'build.emitAssets', 'build-emitassets', '十七buildemitassets', 'quick'],
  [
    'build.ssrEmitAssets',
    'build.ssrEmitAssets',
    'build-ssremitassets',
    '十八buildssremitassets',
    'quick',
  ],
  ['build.minify', 'build.minify', 'build-minify', '十九buildminify', 'merged'],
  [
    'build.terserOptions',
    'build.terserOptions',
    'build-terseroptions',
    '二十buildterseroptions',
    'quick',
  ],
  ['build.write', 'build.write', 'build-write', '二十一buildwrite', 'quick'],
  [
    'build.emptyOutDir',
    'build.emptyOutDir',
    'build-emptyoutdir',
    '二十二buildemptyoutdir',
    'quick',
  ],
  [
    'build.copyPublicDir',
    'build.copyPublicDir',
    'build-copypublicdir',
    '二十三buildcopypublicdir',
    'quick',
  ],
  [
    'build.reportCompressedSize',
    'build.reportCompressedSize',
    'build-reportcompressedsize',
    '二十四buildreportcompressedsize',
    'quick',
  ],
  [
    'build.chunkSizeWarningLimit',
    'build.chunkSizeWarningLimit',
    'build-chunksizewarninglimit',
    '二十五buildchunksizewarninglimit',
    'quick',
  ],
  ['build.watch', 'build.watch', 'build-watch', '二十六buildwatch', 'quick'],
] as const)

const previewItems = createReferenceItems(
  'https://vite.dev/config/preview-options',
  'config-preview',
  [
    ['preview.host', 'preview.host', 'preview-host', '一previewhost', 'merged'],
    [
      'preview.allowedHosts',
      'preview.allowedHosts',
      'preview-allowedhosts',
      '二previewallowedhosts',
      'detail',
    ],
    ['preview.port', 'preview.port', 'preview-port', '三previewport', 'detail'],
    [
      'preview.strictPort',
      'preview.strictPort',
      'preview-strictport',
      '四previewstrictport',
      'quick',
    ],
    ['preview.https', 'preview.https', 'preview-https', '五previewhttps', 'quick'],
    ['preview.open', 'preview.open', 'preview-open', '六previewopen', 'quick'],
    ['preview.proxy', 'preview.proxy', 'preview-proxy', '七previewproxy', 'merged'],
    ['preview.cors', 'preview.cors', 'preview-cors', '八previewcors', 'quick'],
    ['preview.headers', 'preview.headers', 'preview-headers', '九previewheaders', 'quick'],
  ] as const,
)

const dependencyItems = createReferenceItems(
  'https://vite.dev/config/dep-optimization-options',
  'config-dependency-optimization',
  [
    [
      'optimizeDeps.entries',
      'optimizeDeps.entries',
      'optimizedeps-entries',
      '一optimizedepsentries',
      'detail',
    ],
    [
      'optimizeDeps.exclude',
      'optimizeDeps.exclude',
      'optimizedeps-exclude',
      '二optimizedepsexclude',
      'detail',
    ],
    [
      'optimizeDeps.include',
      'optimizeDeps.include',
      'optimizedeps-include',
      '三optimizedepsinclude',
      'detail',
    ],
    [
      'optimizeDeps.rolldownOptions',
      'optimizeDeps.rolldownOptions',
      'optimizedeps-rolldownoptions',
      '四optimizedepsrolldownoptions',
      'detail',
    ],
    [
      'optimizeDeps.force',
      'optimizeDeps.force',
      'optimizedeps-force',
      '五optimizedepsforce',
      'detail',
    ],
    [
      'optimizeDeps.noDiscovery',
      'optimizeDeps.noDiscovery',
      'optimizedeps-nodiscovery',
      '六optimizedepsnodiscovery',
      'detail',
    ],
  ] as const,
)

const ssrWorkerItems = [
  ...createReferenceItems('https://vite.dev/config/ssr-options', 'config-ssr-worker', [
    ['ssr.external', 'ssr.external', 'ssr-external', '一ssrexternal', 'detail'],
    ['ssr.noExternal', 'ssr.noExternal', 'ssr-noexternal', '二ssrnoexternal', 'detail'],
    ['ssr.target', 'ssr.target', 'ssr-target', '三ssrtarget', 'detail'],
    [
      'ssr.resolve.conditions',
      'ssr.resolve.conditions',
      'ssr-resolve-conditions',
      '四ssrresolveconditions',
      'quick',
    ],
    [
      'ssr.resolve.externalConditions',
      'ssr.resolve.externalConditions',
      'ssr-resolve-externalconditions',
      '五ssrresolveexternalconditions',
      'quick',
    ],
    [
      'ssr.resolve.mainFields',
      'ssr.resolve.mainFields',
      'ssr-resolve-mainfields',
      '六ssrresolvemainfields',
      'quick',
    ],
  ] as const),
  ...createReferenceItems('https://vite.dev/config/worker-options', 'config-ssr-worker', [
    ['worker.format', 'worker.format', 'worker-format', '七workerformat', 'detail'],
    ['worker.plugins', 'worker.plugins', 'worker-plugins', '八workerplugins', 'merged'],
    [
      'worker.rolldownOptions',
      'worker.rolldownOptions',
      'worker-rolldownoptions',
      '九workerrolldownoptions',
      'merged',
    ],
  ] as const),
]

const pluginItems = createReferenceItems('https://vite.dev/guide/api-plugin', 'plugin-api', [
  ['plugin.config', 'config', 'config', '一config', 'detail'],
  ['plugin.configResolved', 'configResolved', 'configresolved', '二configresolved', 'detail'],
  ['plugin.configureServer', 'configureServer', 'configureserver', '三configureserver', 'detail'],
  [
    'plugin.configurePreviewServer',
    'configurePreviewServer',
    'configurepreviewserver',
    '四configurepreviewserver',
    'merged',
  ],
  [
    'plugin.transformIndexHtml',
    'transformIndexHtml',
    'transformindexhtml',
    '五transformindexhtml',
    'detail',
  ],
  ['plugin.handleHotUpdate', 'handleHotUpdate', 'handlehotupdate', '六handlehotupdate', 'detail'],
  ['plugin.resolveId', 'resolveId', 'rolldown-hooks', '七resolveid', 'detail'],
  ['plugin.load', 'load', 'rolldown-hooks', '八load', 'detail'],
  ['plugin.transform', 'transform', 'rolldown-hooks', '九transform', 'detail'],
  ['plugin.buildStart', 'buildStart', 'rolldown-hooks', '十buildstart', 'merged'],
  ['plugin.buildEnd', 'buildEnd', 'rolldown-hooks', '十一buildend', 'merged'],
  ['plugin.closeBundle', 'closeBundle', 'rolldown-hooks', '十二closebundle', 'quick'],
  ['plugin.moduleParsed', 'moduleParsed', 'rolldown-hooks', '十三moduleparsed', 'quick'],
  ['plugin.enforce', 'enforce', 'plugin-ordering', '十四enforce', 'detail'],
  ['plugin.apply', 'apply', 'conditional-application', '十五apply', 'detail'],
  [
    'plugin.contextMeta',
    'Plugin Context Meta',
    'plugin-context-meta',
    '十六plugin-context-meta',
    'quick',
  ],
  [
    'plugin.outputBundleMetadata',
    'Output Bundle Metadata',
    'output-bundle-metadata',
    '十七output-bundle-metadata',
    'quick',
  ],
  [
    'plugin.pathNormalization',
    'Path Normalization',
    'path-normalization',
    '十八path-normalization',
    'quick',
  ],
  ['plugin.hookFilters', 'Hook Filters', 'hook-filters', '十九hook-filters', 'merged'],
  [
    'plugin.clientServerCommunication',
    'Client-server Communication',
    'client-server-communication',
    '二十client-server-communication',
    'merged',
  ],
] as const)

const hmrItems = createReferenceItems('https://vite.dev/guide/api-hmr', 'hmr-api', [
  ['hmr.accept', 'hot.accept', 'hot-accept-cb', '一hotaccept', 'detail'],
  ['hmr.dispose', 'hot.dispose', 'hot-dispose-cb', '二hotdispose', 'detail'],
  ['hmr.prune', 'hot.prune', 'hot-prune-cb', '三hotprune', 'merged'],
  ['hmr.data', 'hot.data', 'hot-data', '四hotdata', 'detail'],
  ['hmr.decline', 'hot.decline', 'hot-decline', '五hotdecline', 'quick'],
  ['hmr.invalidate', 'hot.invalidate', 'hot-invalidate-message', '六hotinvalidate', 'detail'],
  ['hmr.on', 'hot.on', 'hot-on-event-cb', '七hoton', 'merged'],
  ['hmr.off', 'hot.off', 'hot-off-event-cb', '八hotoff', 'quick'],
  ['hmr.send', 'hot.send', 'hot-send-event-data', '九hotsend', 'quick'],
] as const)

const javascriptItems = createReferenceItems(
  'https://vite.dev/guide/api-javascript',
  'javascript-api',
  [
    ['js.createServer', 'createServer', 'createserver', '一createserver', 'detail'],
    ['js.inlineConfig', 'InlineConfig', 'inlineconfig', '二inlineconfig', 'merged'],
    ['js.resolvedConfig', 'ResolvedConfig', 'resolvedconfig', '三resolvedconfig', 'merged'],
    ['js.viteDevServer', 'ViteDevServer', 'vitedevserver', '四vitedevserver', 'detail'],
    ['js.build', 'build', 'build', '五build', 'detail'],
    ['js.preview', 'preview', 'preview', '六preview', 'detail'],
    ['js.previewServer', 'PreviewServer', 'previewserver', '七previewserver', 'merged'],
    ['js.resolveConfig', 'resolveConfig', 'resolveconfig', '八resolveconfig', 'detail'],
    ['js.mergeConfig', 'mergeConfig', 'mergeconfig', '九mergeconfig', 'merged'],
    [
      'js.searchForWorkspaceRoot',
      'searchForWorkspaceRoot',
      'searchforworkspaceroot',
      '十searchforworkspaceroot',
      'quick',
    ],
    ['js.loadEnv', 'loadEnv', 'loadenv', '十一loadenv', 'detail'],
    ['js.normalizePath', 'normalizePath', 'normalizepath', '十二normalizepath', 'quick'],
    [
      'js.transformWithOxc',
      'transformWithOxc',
      'transformwithoxc',
      '十三transformwithoxc',
      'merged',
    ],
    [
      'js.transformWithEsbuild',
      'transformWithEsbuild',
      'transformwithesbuild',
      '十四transformwithesbuild',
      'quick',
    ],
    [
      'js.loadConfigFromFile',
      'loadConfigFromFile',
      'loadconfigfromfile',
      '十五loadconfigfromfile',
      'merged',
    ],
    ['js.version', 'version', 'version', '十六version', 'quick'],
    ['js.rolldownVersion', 'rolldownVersion', 'rolldownversion', '十七rolldownversion', 'quick'],
    ['js.esbuildVersion', 'esbuildVersion', 'esbuildversion', '十八esbuildversion', 'quick'],
    ['js.rollupVersion', 'rollupVersion', 'rollupversion', '十九rollupversion', 'quick'],
  ] as const,
)

const featureItems = [
  ...createReferenceItems('https://vite.dev/guide/features', 'features-assets-env', [
    [
      'features.dependencies',
      'npm Dependency Resolving and Pre-Bundling',
      'npm-dependency-resolving-and-pre-bundling',
      '一npm-dependency-resolving-and-pre-bundling',
      'merged',
    ],
    [
      'features.hmr',
      'Hot Module Replacement',
      'hot-module-replacement',
      '二hot-module-replacement',
      'merged',
    ],
    ['features.typescript', 'TypeScript', 'typescript', '三typescript', 'merged'],
    ['features.html', 'HTML', 'html', '四html', 'quick'],
    ['features.frameworks', 'Frameworks', 'frameworks', '五frameworks', 'quick'],
    ['features.jsx', 'JSX', 'jsx', '六jsx', 'quick'],
    ['features.css', 'CSS', 'css', '七css', 'merged'],
    ['features.json', 'JSON', 'json', '八json', 'quick'],
    ['features.glob', 'Glob Import', 'glob-import', '九glob-import', 'detail'],
    ['features.dynamicImport', 'Dynamic Import', 'dynamic-import', '十dynamic-import', 'detail'],
    ['features.wasm', 'WebAssembly', 'webassembly', '十一webassembly', 'quick'],
    ['features.worker', 'Web Workers', 'web-workers', '十二web-workers', 'detail'],
    [
      'features.csp',
      'Content Security Policy',
      'content-security-policy-csp',
      '十三content-security-policy',
      'detail',
    ],
    ['features.license', 'License', 'license', '十四license', 'merged'],
    [
      'features.buildOptimizations',
      'Build Optimizations',
      'build-optimizations',
      '十五build-optimizations',
      'merged',
    ],
  ] as const),
  ...createReferenceItems('https://vite.dev/guide/assets', 'features-assets-env', [
    [
      'assets.import',
      'Importing Asset as URL',
      'importing-asset-as-url',
      '十六importing-asset-as-url',
      'detail',
    ],
    [
      'assets.raw',
      'Importing Asset as String',
      'importing-asset-as-string',
      '十七importing-asset-as-string',
      'merged',
    ],
    [
      'assets.worker',
      'Importing Script as a Worker',
      'importing-script-as-a-worker',
      '十八importing-script-as-a-worker',
      'detail',
    ],
    [
      'assets.publicDir',
      'The public Directory',
      'the-public-directory',
      '十九the-public-directory',
      'detail',
    ],
  ] as const),
  ...createReferenceItems('https://vite.dev/guide/env-and-mode', 'features-assets-env', [
    ['env.importMeta', 'Env Variables', 'env-variables', '二十env-variables', 'detail'],
    ['env.mode', 'Modes', 'modes', '二十一modes', 'detail'],
  ] as const),
]

const boundaryItems = createReferenceItems(
  'https://vite.dev/guide/api-plugin',
  'build-rollup-boundary',
  [
    [
      'boundary.rollup',
      'Rollup compatibility',
      'rolldown-plugin-compatibility',
      '一rollup-compatibility',
      'detail',
    ],
    [
      'boundary.rolldown',
      'Rolldown plugin compatibility',
      'rolldown-plugin-compatibility',
      '二rolldown-plugin-compatibility',
      'detail',
    ],
    ['boundary.vuePlugin', '@vitejs/plugin-vue', 'plugins-config', '三vitejsplugin-vue', 'quick'],
    ['boundary.node', 'Node.js baseline', 'authoring-a-plugin', '四nodejs-baseline', 'quick'],
  ] as const,
)

export const viteStableReferenceItems = [
  ...sharedItems,
  ...serverItems,
  ...buildItems,
  ...previewItems,
  ...dependencyItems,
  ...ssrWorkerItems,
  ...pluginItems,
  ...hmrItems,
  ...javascriptItems,
  ...featureItems,
  ...boundaryItems,
]

export const viteReferenceIndexManifest: ReferenceIndexManifest = {
  appliesTo: 'Vite 8.2.1',
  verifiedAt: '2026-08-07',
  groups: [
    {
      id: 'configuration',
      title: 'Configuration',
      sections: [
        { id: 'shared', title: 'Shared Options', items: sharedItems },
        { id: 'server', title: 'Server Options', items: serverItems },
        { id: 'build', title: 'Build Options', items: buildItems },
        { id: 'preview', title: 'Preview Options', items: previewItems },
        { id: 'dependency-optimization', title: 'Dependency Optimization', items: dependencyItems },
        { id: 'ssr-worker', title: 'SSR & Worker', items: ssrWorkerItems },
      ],
    },
    {
      id: 'programmatic-api',
      title: 'Programmatic API',
      sections: [
        { id: 'plugin-api', title: 'Plugin API', items: pluginItems },
        { id: 'hmr-api', title: 'HMR API', items: hmrItems },
        { id: 'javascript-api', title: 'JavaScript API', items: javascriptItems },
      ],
    },
    {
      id: 'features-and-boundaries',
      title: 'Features & Boundaries',
      sections: [
        { id: 'features-assets-env', title: 'Features、Assets 与 Env', items: featureItems },
        { id: 'build-boundary', title: '构建工具边界', items: boundaryItems },
      ],
    },
  ],
  observationScopes: [
    {
      id: 'experimental',
      title: 'Experimental',
      status: 'experimental',
      count: 8,
      items: [
        {
          id: 'css.devSourcemap',
          name: 'css.devSourcemap',
          officialUrl: 'https://vite.dev/config/shared-options#css-devsourcemap',
        },
        {
          id: 'css.transformer',
          name: 'css.transformer',
          officialUrl: 'https://vite.dev/config/shared-options#css-transformer',
        },
        {
          id: 'css.lightningcss',
          name: 'css.lightningcss',
          officialUrl: 'https://vite.dev/config/shared-options#css-lightningcss',
        },
        {
          id: 'devtools',
          name: 'devtools',
          officialUrl: 'https://vite.dev/config/shared-options#devtools',
        },
        {
          id: 'build.chunkImportMap',
          name: 'build.chunkImportMap',
          officialUrl: 'https://vite.dev/config/build-options#build-chunkimportmap',
        },
        {
          id: 'optimizeDeps.holdUntilCrawlEnd',
          name: 'optimizeDeps.holdUntilCrawlEnd',
          officialUrl:
            'https://vite.dev/config/dep-optimization-options#optimizedeps-holduntilcrawlend',
        },
        {
          id: 'optimizeDeps.needsInterop',
          name: 'optimizeDeps.needsInterop',
          officialUrl: 'https://vite.dev/config/dep-optimization-options#optimizedeps-needsinterop',
        },
        {
          id: 'preprocessCSS',
          name: 'preprocessCSS',
          officialUrl: 'https://vite.dev/guide/api-javascript#preprocesscss',
        },
      ],
    },
    {
      id: 'deprecated',
      title: 'Deprecated',
      status: 'deprecated',
      count: 7,
      items: [
        {
          id: 'esbuild',
          name: 'esbuild',
          officialUrl: 'https://vite.dev/config/shared-options#esbuild',
        },
        {
          id: 'build.polyfillModulePreload',
          name: 'build.polyfillModulePreload',
          officialUrl: 'https://vite.dev/config/build-options#build-polyfillmodulepreload',
        },
        {
          id: 'build.rollupOptions',
          name: 'build.rollupOptions',
          officialUrl: 'https://vite.dev/config/build-options#build-rollupoptions',
        },
        {
          id: 'optimizeDeps.esbuildOptions',
          name: 'optimizeDeps.esbuildOptions',
          officialUrl:
            'https://vite.dev/config/dep-optimization-options#optimizedeps-esbuildoptions',
        },
        {
          id: 'optimizeDeps.disabled',
          name: 'optimizeDeps.disabled',
          officialUrl: 'https://vite.dev/config/dep-optimization-options#optimizedeps-disabled',
        },
        {
          id: 'worker.rollupOptions',
          name: 'worker.rollupOptions',
          officialUrl: 'https://vite.dev/config/worker-options#worker-rollupoptions',
        },
        {
          id: 'server.hmr.websocket-options',
          name: 'server.hmr WebSocket 子选项',
          officialUrl: 'https://vite.dev/config/server-options#server-hmr',
        },
      ],
    },
    {
      id: 'external-evidence',
      title: '外部环境证据',
      status: 'deferred',
      count: 4,
      items: [
        { id: 'real-deployment', name: '真实部署平台与 CDN' },
        { id: 'managed-https', name: '托管 HTTPS 与证书' },
        { id: 'enterprise-controls', name: '组织级 host 与网络控制' },
        { id: 'production-benchmark', name: '固定环境生产性能基准' },
      ],
    },
  ],
}
