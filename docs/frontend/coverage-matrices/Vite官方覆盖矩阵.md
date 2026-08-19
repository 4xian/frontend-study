# Vite 官方覆盖矩阵

> 官方冻结版本：Vite 8.2.1
> 发布日期：2026-08-06
> 核验日期：2026-08-07
> 官方源码提交：`421615865dad3ed39137d17281814fc78a41246c`
> 官方文档源码标识：`5e7fe129`
> 稳定分母：175；available：175；planned：0
> 状态：Gate V 已通过，进入维护

## 稳定集合口径

稳定分母来自 Vite 8.2.1 tag 的 Config Reference、Plugin API、JavaScript API、HMR API、Features、
Assets、Env 与公开构建边界。标为 experimental/deprecated 的名称只进入观察范围；CLI 与迁移作为第
12 个合并 Reference 页面提供，但不是可枚举 API 分母。

| Reference | available |
| --- | ---: |
| Shared Options | 32 |
| Server Options | 20 |
| Build Options | 26 |
| Preview Options | 9 |
| Dependency Optimization | 6 |
| SSR / Worker Options | 9 |
| Plugin API | 20 |
| HMR API | 9 |
| JavaScript API | 19 |
| Features / Assets / Env | 21 |
| Build Boundaries | 4 |
| **合计** | **175** |

## 稳定官方集合

| officialKey | 名称 | 分类 | 深度 | 官方 URL | 站内目标 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| shared.root | root | Shared Options | detail | https://vite.dev/config/shared-options#root | config-shared#root | available |
| shared.base | base | Shared Options | detail | https://vite.dev/config/shared-options#base | config-shared#base | available |
| shared.mode | mode | Shared Options | detail | https://vite.dev/config/shared-options#mode | config-shared#mode | available |
| shared.input | input | Shared Options | detail | https://vite.dev/config/shared-options#input | config-shared#input | available |
| shared.define | define | Shared Options | detail | https://vite.dev/config/shared-options#define | config-shared#define | available |
| shared.plugins | plugins | Shared Options | detail | https://vite.dev/config/shared-options#plugins | config-shared#plugins | available |
| shared.publicDir | publicDir | Shared Options | merged | https://vite.dev/config/shared-options#publicdir | config-shared#publicdir | available |
| shared.cacheDir | cacheDir | Shared Options | quick | https://vite.dev/config/shared-options#cachedir | config-shared#cachedir | available |
| shared.resolve.alias | resolve.alias | Shared Options | detail | https://vite.dev/config/shared-options#resolve-alias | config-shared#resolvealias | available |
| shared.resolve.dedupe | resolve.dedupe | Shared Options | quick | https://vite.dev/config/shared-options#resolve-dedupe | config-shared#resolvededupe | available |
| shared.resolve.conditions | resolve.conditions | Shared Options | quick | https://vite.dev/config/shared-options#resolve-conditions | config-shared#resolveconditions | available |
| shared.resolve.mainFields | resolve.mainFields | Shared Options | quick | https://vite.dev/config/shared-options#resolve-mainfields | config-shared#resolvemainfields | available |
| shared.resolve.extensions | resolve.extensions | Shared Options | quick | https://vite.dev/config/shared-options#resolve-extensions | config-shared#resolveextensions | available |
| shared.resolve.preserveSymlinks | resolve.preserveSymlinks | Shared Options | quick | https://vite.dev/config/shared-options#resolve-preservesymlinks | config-shared#resolvepreservesymlinks | available |
| shared.resolve.tsconfigPaths | resolve.tsconfigPaths | Shared Options | detail | https://vite.dev/config/shared-options#resolve-tsconfigpaths | config-shared#resolvetsconfigpaths | available |
| shared.html.cspNonce | html.cspNonce | Shared Options | detail | https://vite.dev/config/shared-options#html-cspnonce | config-shared#htmlcspnonce | available |
| shared.html.additionalAssetSources | html.additionalAssetSources | Shared Options | merged | https://vite.dev/config/shared-options#html-additionalassetsources | config-shared#htmladditionalassetsources | available |
| shared.css.modules | css.modules | Shared Options | merged | https://vite.dev/config/shared-options#css-modules | config-shared#cssmodules | available |
| shared.css.postcss | css.postcss | Shared Options | merged | https://vite.dev/config/shared-options#css-postcss | config-shared#csspostcss | available |
| shared.css.preprocessorOptions | css.preprocessorOptions | Shared Options | merged | https://vite.dev/config/shared-options#css-preprocessoroptions | config-shared#csspreprocessoroptions | available |
| shared.css.preprocessorMaxWorkers | css.preprocessorMaxWorkers | Shared Options | quick | https://vite.dev/config/shared-options#css-preprocessormaxworkers | config-shared#csspreprocessormaxworkers | available |
| shared.json.namedExports | json.namedExports | Shared Options | quick | https://vite.dev/config/shared-options#json-namedexports | config-shared#jsonnamedexports | available |
| shared.json.stringify | json.stringify | Shared Options | quick | https://vite.dev/config/shared-options#json-stringify | config-shared#jsonstringify | available |
| shared.oxc | oxc | Shared Options | detail | https://vite.dev/config/shared-options#oxc | config-shared#oxc | available |
| shared.assetsInclude | assetsInclude | Shared Options | merged | https://vite.dev/config/shared-options#assetsinclude | config-shared#assetsinclude | available |
| shared.logLevel | logLevel | Shared Options | quick | https://vite.dev/config/shared-options#loglevel | config-shared#loglevel | available |
| shared.customLogger | customLogger | Shared Options | merged | https://vite.dev/config/shared-options#customlogger | config-shared#customlogger | available |
| shared.clearScreen | clearScreen | Shared Options | quick | https://vite.dev/config/shared-options#clearscreen | config-shared#clearscreen | available |
| shared.envDir | envDir | Shared Options | detail | https://vite.dev/config/shared-options#envdir | config-shared#envdir | available |
| shared.envPrefix | envPrefix | Shared Options | detail | https://vite.dev/config/shared-options#envprefix | config-shared#envprefix | available |
| shared.appType | appType | Shared Options | quick | https://vite.dev/config/shared-options#apptype | config-shared#apptype | available |
| shared.future | future | Shared Options | quick | https://vite.dev/config/shared-options#future | config-shared#future | available |
| server.host | server.host | Server Options | detail | https://vite.dev/config/server-options#server-host | config-server#serverhost | available |
| server.allowedHosts | server.allowedHosts | Server Options | detail | https://vite.dev/config/server-options#server-allowedhosts | config-server#serverallowedhosts | available |
| server.port | server.port | Server Options | detail | https://vite.dev/config/server-options#server-port | config-server#serverport | available |
| server.strictPort | server.strictPort | Server Options | quick | https://vite.dev/config/server-options#server-strictport | config-server#serverstrictport | available |
| server.https | server.https | Server Options | quick | https://vite.dev/config/server-options#server-https | config-server#serverhttps | available |
| server.open | server.open | Server Options | quick | https://vite.dev/config/server-options#server-open | config-server#serveropen | available |
| server.proxy | server.proxy | Server Options | detail | https://vite.dev/config/server-options#server-proxy | config-server#serverproxy | available |
| server.cors | server.cors | Server Options | detail | https://vite.dev/config/server-options#server-cors | config-server#servercors | available |
| server.headers | server.headers | Server Options | quick | https://vite.dev/config/server-options#server-headers | config-server#serverheaders | available |
| server.hmr | server.hmr | Server Options | detail | https://vite.dev/config/server-options#server-hmr | config-server#serverhmr | available |
| server.ws | server.ws | Server Options | detail | https://vite.dev/config/server-options#server-ws | config-server#serverws | available |
| server.forwardConsole | server.forwardConsole | Server Options | merged | https://vite.dev/config/server-options#server-forwardconsole | config-server#serverforwardconsole | available |
| server.warmup | server.warmup | Server Options | merged | https://vite.dev/config/server-options#server-warmup | config-server#serverwarmup | available |
| server.watch | server.watch | Server Options | merged | https://vite.dev/config/server-options#server-watch | config-server#serverwatch | available |
| server.middlewareMode | server.middlewareMode | Server Options | detail | https://vite.dev/config/server-options#server-middlewaremode | config-server#servermiddlewaremode | available |
| server.fs.strict | server.fs.strict | Server Options | quick | https://vite.dev/config/server-options#server-fs-strict | config-server#serverfsstrict | available |
| server.fs.allow | server.fs.allow | Server Options | detail | https://vite.dev/config/server-options#server-fs-allow | config-server#serverfsallow | available |
| server.fs.deny | server.fs.deny | Server Options | detail | https://vite.dev/config/server-options#server-fs-deny | config-server#serverfsdeny | available |
| server.origin | server.origin | Server Options | quick | https://vite.dev/config/server-options#server-origin | config-server#serverorigin | available |
| server.sourcemapIgnoreList | server.sourcemapIgnoreList | Server Options | quick | https://vite.dev/config/server-options#server-sourcemapignorelist | config-server#serversourcemapignorelist | available |
| build.target | build.target | Build Options | detail | https://vite.dev/config/build-options#build-target | config-build#buildtarget | available |
| build.modulePreload | build.modulePreload | Build Options | detail | https://vite.dev/config/build-options#build-modulepreload | config-build#buildmodulepreload | available |
| build.outDir | build.outDir | Build Options | detail | https://vite.dev/config/build-options#build-outdir | config-build#buildoutdir | available |
| build.assetsDir | build.assetsDir | Build Options | merged | https://vite.dev/config/build-options#build-assetsdir | config-build#buildassetsdir | available |
| build.assetsInlineLimit | build.assetsInlineLimit | Build Options | detail | https://vite.dev/config/build-options#build-assetsinlinelimit | config-build#buildassetsinlinelimit | available |
| build.cssCodeSplit | build.cssCodeSplit | Build Options | merged | https://vite.dev/config/build-options#build-csscodesplit | config-build#buildcsscodesplit | available |
| build.cssTarget | build.cssTarget | Build Options | merged | https://vite.dev/config/build-options#build-csstarget | config-build#buildcsstarget | available |
| build.cssMinify | build.cssMinify | Build Options | merged | https://vite.dev/config/build-options#build-cssminify | config-build#buildcssminify | available |
| build.sourcemap | build.sourcemap | Build Options | detail | https://vite.dev/config/build-options#build-sourcemap | config-build#buildsourcemap | available |
| build.rolldownOptions | build.rolldownOptions | Build Options | detail | https://vite.dev/config/build-options#build-rolldownoptions | config-build#buildrolldownoptions | available |
| build.dynamicImportVarsOptions | build.dynamicImportVarsOptions | Build Options | merged | https://vite.dev/config/build-options#build-dynamicimportvarsoptions | config-build#builddynamicimportvarsoptions | available |
| build.lib | build.lib | Build Options | detail | https://vite.dev/config/build-options#build-lib | config-build#buildlib | available |
| build.license | build.license | Build Options | detail | https://vite.dev/config/build-options#build-license | config-build#buildlicense | available |
| build.manifest | build.manifest | Build Options | merged | https://vite.dev/config/build-options#build-manifest | config-build#buildmanifest | available |
| build.ssrManifest | build.ssrManifest | Build Options | merged | https://vite.dev/config/build-options#build-ssrmanifest | config-build#buildssrmanifest | available |
| build.ssr | build.ssr | Build Options | detail | https://vite.dev/config/build-options#build-ssr | config-build#buildssr | available |
| build.emitAssets | build.emitAssets | Build Options | quick | https://vite.dev/config/build-options#build-emitassets | config-build#buildemitassets | available |
| build.ssrEmitAssets | build.ssrEmitAssets | Build Options | quick | https://vite.dev/config/build-options#build-ssremitassets | config-build#buildssremitassets | available |
| build.minify | build.minify | Build Options | merged | https://vite.dev/config/build-options#build-minify | config-build#buildminify | available |
| build.terserOptions | build.terserOptions | Build Options | quick | https://vite.dev/config/build-options#build-terseroptions | config-build#buildterseroptions | available |
| build.write | build.write | Build Options | quick | https://vite.dev/config/build-options#build-write | config-build#buildwrite | available |
| build.emptyOutDir | build.emptyOutDir | Build Options | quick | https://vite.dev/config/build-options#build-emptyoutdir | config-build#buildemptyoutdir | available |
| build.copyPublicDir | build.copyPublicDir | Build Options | quick | https://vite.dev/config/build-options#build-copypublicdir | config-build#buildcopypublicdir | available |
| build.reportCompressedSize | build.reportCompressedSize | Build Options | quick | https://vite.dev/config/build-options#build-reportcompressedsize | config-build#buildreportcompressedsize | available |
| build.chunkSizeWarningLimit | build.chunkSizeWarningLimit | Build Options | quick | https://vite.dev/config/build-options#build-chunksizewarninglimit | config-build#buildchunksizewarninglimit | available |
| build.watch | build.watch | Build Options | quick | https://vite.dev/config/build-options#build-watch | config-build#buildwatch | available |
| preview.host | preview.host | Preview Options | merged | https://vite.dev/config/preview-options#preview-host | config-preview#previewhost | available |
| preview.allowedHosts | preview.allowedHosts | Preview Options | detail | https://vite.dev/config/preview-options#preview-allowedhosts | config-preview#previewallowedhosts | available |
| preview.port | preview.port | Preview Options | detail | https://vite.dev/config/preview-options#preview-port | config-preview#previewport | available |
| preview.strictPort | preview.strictPort | Preview Options | quick | https://vite.dev/config/preview-options#preview-strictport | config-preview#previewstrictport | available |
| preview.https | preview.https | Preview Options | quick | https://vite.dev/config/preview-options#preview-https | config-preview#previewhttps | available |
| preview.open | preview.open | Preview Options | quick | https://vite.dev/config/preview-options#preview-open | config-preview#previewopen | available |
| preview.proxy | preview.proxy | Preview Options | merged | https://vite.dev/config/preview-options#preview-proxy | config-preview#previewproxy | available |
| preview.cors | preview.cors | Preview Options | quick | https://vite.dev/config/preview-options#preview-cors | config-preview#previewcors | available |
| preview.headers | preview.headers | Preview Options | quick | https://vite.dev/config/preview-options#preview-headers | config-preview#previewheaders | available |
| optimizeDeps.entries | optimizeDeps.entries | Dependency Optimization | detail | https://vite.dev/config/dep-optimization-options#optimizedeps-entries | config-dependency-optimization#optimizedepsentries | available |
| optimizeDeps.exclude | optimizeDeps.exclude | Dependency Optimization | detail | https://vite.dev/config/dep-optimization-options#optimizedeps-exclude | config-dependency-optimization#optimizedepsexclude | available |
| optimizeDeps.include | optimizeDeps.include | Dependency Optimization | detail | https://vite.dev/config/dep-optimization-options#optimizedeps-include | config-dependency-optimization#optimizedepsinclude | available |
| optimizeDeps.rolldownOptions | optimizeDeps.rolldownOptions | Dependency Optimization | detail | https://vite.dev/config/dep-optimization-options#optimizedeps-rolldownoptions | config-dependency-optimization#optimizedepsrolldownoptions | available |
| optimizeDeps.force | optimizeDeps.force | Dependency Optimization | detail | https://vite.dev/config/dep-optimization-options#optimizedeps-force | config-dependency-optimization#optimizedepsforce | available |
| optimizeDeps.noDiscovery | optimizeDeps.noDiscovery | Dependency Optimization | detail | https://vite.dev/config/dep-optimization-options#optimizedeps-nodiscovery | config-dependency-optimization#optimizedepsnodiscovery | available |
| ssr.external | ssr.external | SSR / Worker Options | detail | https://vite.dev/config/ssr-options#ssr-external | config-ssr-worker#ssrexternal | available |
| ssr.noExternal | ssr.noExternal | SSR / Worker Options | detail | https://vite.dev/config/ssr-options#ssr-noexternal | config-ssr-worker#ssrnoexternal | available |
| ssr.target | ssr.target | SSR / Worker Options | detail | https://vite.dev/config/ssr-options#ssr-target | config-ssr-worker#ssrtarget | available |
| ssr.resolve.conditions | ssr.resolve.conditions | SSR / Worker Options | quick | https://vite.dev/config/ssr-options#ssr-resolve-conditions | config-ssr-worker#ssrresolveconditions | available |
| ssr.resolve.externalConditions | ssr.resolve.externalConditions | SSR / Worker Options | quick | https://vite.dev/config/ssr-options#ssr-resolve-externalconditions | config-ssr-worker#ssrresolveexternalconditions | available |
| ssr.resolve.mainFields | ssr.resolve.mainFields | SSR / Worker Options | quick | https://vite.dev/config/ssr-options#ssr-resolve-mainfields | config-ssr-worker#ssrresolvemainfields | available |
| worker.format | worker.format | SSR / Worker Options | detail | https://vite.dev/config/worker-options#worker-format | config-ssr-worker#workerformat | available |
| worker.plugins | worker.plugins | SSR / Worker Options | merged | https://vite.dev/config/worker-options#worker-plugins | config-ssr-worker#workerplugins | available |
| worker.rolldownOptions | worker.rolldownOptions | SSR / Worker Options | merged | https://vite.dev/config/worker-options#worker-rolldownoptions | config-ssr-worker#workerrolldownoptions | available |
| plugin.config | config | Plugin API | detail | https://vite.dev/guide/api-plugin#config | plugin-api#config | available |
| plugin.configResolved | configResolved | Plugin API | detail | https://vite.dev/guide/api-plugin#configresolved | plugin-api#configresolved | available |
| plugin.configureServer | configureServer | Plugin API | detail | https://vite.dev/guide/api-plugin#configureserver | plugin-api#configureserver | available |
| plugin.configurePreviewServer | configurePreviewServer | Plugin API | merged | https://vite.dev/guide/api-plugin#configurepreviewserver | plugin-api#configurepreviewserver | available |
| plugin.transformIndexHtml | transformIndexHtml | Plugin API | detail | https://vite.dev/guide/api-plugin#transformindexhtml | plugin-api#transformindexhtml | available |
| plugin.handleHotUpdate | handleHotUpdate | Plugin API | detail | https://vite.dev/guide/api-plugin#handlehotupdate | plugin-api#handlehotupdate | available |
| plugin.resolveId | resolveId | Plugin API | detail | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#resolveid | available |
| plugin.load | load | Plugin API | detail | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#load | available |
| plugin.transform | transform | Plugin API | detail | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#transform | available |
| plugin.buildStart | buildStart | Plugin API | merged | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#buildstart | available |
| plugin.buildEnd | buildEnd | Plugin API | merged | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#buildend | available |
| plugin.closeBundle | closeBundle | Plugin API | quick | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#closebundle | available |
| plugin.moduleParsed | moduleParsed | Plugin API | quick | https://vite.dev/guide/api-plugin#rolldown-hooks | plugin-api#moduleparsed | available |
| plugin.enforce | enforce | Plugin API | detail | https://vite.dev/guide/api-plugin#plugin-ordering | plugin-api#enforce | available |
| plugin.apply | apply | Plugin API | detail | https://vite.dev/guide/api-plugin#conditional-application | plugin-api#apply | available |
| plugin.contextMeta | Plugin Context Meta | Plugin API | quick | https://vite.dev/guide/api-plugin#plugin-context-meta | plugin-api#plugin-context-meta | available |
| plugin.outputBundleMetadata | Output Bundle Metadata | Plugin API | quick | https://vite.dev/guide/api-plugin#output-bundle-metadata | plugin-api#output-bundle-metadata | available |
| plugin.pathNormalization | Path Normalization | Plugin API | quick | https://vite.dev/guide/api-plugin#path-normalization | plugin-api#path-normalization | available |
| plugin.hookFilters | Hook Filters | Plugin API | merged | https://vite.dev/guide/api-plugin#hook-filters | plugin-api#hook-filters | available |
| plugin.clientServerCommunication | Client-server Communication | Plugin API | merged | https://vite.dev/guide/api-plugin#client-server-communication | plugin-api#client-server-communication | available |
| hmr.accept | hot.accept | HMR API | detail | https://vite.dev/guide/api-hmr#hot-accept-cb | hmr-api#hotaccept | available |
| hmr.dispose | hot.dispose | HMR API | detail | https://vite.dev/guide/api-hmr#hot-dispose-cb | hmr-api#hotdispose | available |
| hmr.prune | hot.prune | HMR API | merged | https://vite.dev/guide/api-hmr#hot-prune-cb | hmr-api#hotprune | available |
| hmr.data | hot.data | HMR API | detail | https://vite.dev/guide/api-hmr#hot-data | hmr-api#hotdata | available |
| hmr.decline | hot.decline | HMR API | quick | https://vite.dev/guide/api-hmr#hot-decline | hmr-api#hotdecline | available |
| hmr.invalidate | hot.invalidate | HMR API | detail | https://vite.dev/guide/api-hmr#hot-invalidate-message | hmr-api#hotinvalidate | available |
| hmr.on | hot.on | HMR API | merged | https://vite.dev/guide/api-hmr#hot-on-event-cb | hmr-api#hoton | available |
| hmr.off | hot.off | HMR API | quick | https://vite.dev/guide/api-hmr#hot-off-event-cb | hmr-api#hotoff | available |
| hmr.send | hot.send | HMR API | quick | https://vite.dev/guide/api-hmr#hot-send-event-data | hmr-api#hotsend | available |
| js.createServer | createServer | JavaScript API | detail | https://vite.dev/guide/api-javascript#createserver | javascript-api#createserver | available |
| js.inlineConfig | InlineConfig | JavaScript API | merged | https://vite.dev/guide/api-javascript#inlineconfig | javascript-api#inlineconfig | available |
| js.resolvedConfig | ResolvedConfig | JavaScript API | merged | https://vite.dev/guide/api-javascript#resolvedconfig | javascript-api#resolvedconfig | available |
| js.viteDevServer | ViteDevServer | JavaScript API | detail | https://vite.dev/guide/api-javascript#vitedevserver | javascript-api#vitedevserver | available |
| js.build | build | JavaScript API | detail | https://vite.dev/guide/api-javascript#build | javascript-api#build | available |
| js.preview | preview | JavaScript API | detail | https://vite.dev/guide/api-javascript#preview | javascript-api#preview | available |
| js.previewServer | PreviewServer | JavaScript API | merged | https://vite.dev/guide/api-javascript#previewserver | javascript-api#previewserver | available |
| js.resolveConfig | resolveConfig | JavaScript API | detail | https://vite.dev/guide/api-javascript#resolveconfig | javascript-api#resolveconfig | available |
| js.mergeConfig | mergeConfig | JavaScript API | merged | https://vite.dev/guide/api-javascript#mergeconfig | javascript-api#mergeconfig | available |
| js.searchForWorkspaceRoot | searchForWorkspaceRoot | JavaScript API | quick | https://vite.dev/guide/api-javascript#searchforworkspaceroot | javascript-api#searchforworkspaceroot | available |
| js.loadEnv | loadEnv | JavaScript API | detail | https://vite.dev/guide/api-javascript#loadenv | javascript-api#loadenv | available |
| js.normalizePath | normalizePath | JavaScript API | quick | https://vite.dev/guide/api-javascript#normalizepath | javascript-api#normalizepath | available |
| js.transformWithOxc | transformWithOxc | JavaScript API | merged | https://vite.dev/guide/api-javascript#transformwithoxc | javascript-api#transformwithoxc | available |
| js.transformWithEsbuild | transformWithEsbuild | JavaScript API | quick | https://vite.dev/guide/api-javascript#transformwithesbuild | javascript-api#transformwithesbuild | available |
| js.loadConfigFromFile | loadConfigFromFile | JavaScript API | merged | https://vite.dev/guide/api-javascript#loadconfigfromfile | javascript-api#loadconfigfromfile | available |
| js.version | version | JavaScript API | quick | https://vite.dev/guide/api-javascript#version | javascript-api#version | available |
| js.rolldownVersion | rolldownVersion | JavaScript API | quick | https://vite.dev/guide/api-javascript#rolldownversion | javascript-api#rolldownversion | available |
| js.esbuildVersion | esbuildVersion | JavaScript API | quick | https://vite.dev/guide/api-javascript#esbuildversion | javascript-api#esbuildversion | available |
| js.rollupVersion | rollupVersion | JavaScript API | quick | https://vite.dev/guide/api-javascript#rollupversion | javascript-api#rollupversion | available |
| features.dependencies | npm Dependency Resolving and Pre-Bundling | Features / Assets / Env | merged | https://vite.dev/guide/features#npm-dependency-resolving-and-pre-bundling | features-assets-env#npm-dependency-resolving-and-pre-bundling | available |
| features.hmr | Hot Module Replacement | Features / Assets / Env | merged | https://vite.dev/guide/features#hot-module-replacement | features-assets-env#hot-module-replacement | available |
| features.typescript | TypeScript | Features / Assets / Env | merged | https://vite.dev/guide/features#typescript | features-assets-env#typescript | available |
| features.html | HTML | Features / Assets / Env | quick | https://vite.dev/guide/features#html | features-assets-env#html | available |
| features.frameworks | Frameworks | Features / Assets / Env | quick | https://vite.dev/guide/features#frameworks | features-assets-env#frameworks | available |
| features.jsx | JSX | Features / Assets / Env | quick | https://vite.dev/guide/features#jsx | features-assets-env#jsx | available |
| features.css | CSS | Features / Assets / Env | merged | https://vite.dev/guide/features#css | features-assets-env#css | available |
| features.json | JSON | Features / Assets / Env | quick | https://vite.dev/guide/features#json | features-assets-env#json | available |
| features.glob | Glob Import | Features / Assets / Env | detail | https://vite.dev/guide/features#glob-import | features-assets-env#glob-import | available |
| features.dynamicImport | Dynamic Import | Features / Assets / Env | detail | https://vite.dev/guide/features#dynamic-import | features-assets-env#dynamic-import | available |
| features.wasm | WebAssembly | Features / Assets / Env | quick | https://vite.dev/guide/features#webassembly | features-assets-env#webassembly | available |
| features.worker | Web Workers | Features / Assets / Env | detail | https://vite.dev/guide/features#web-workers | features-assets-env#web-workers | available |
| features.csp | Content Security Policy | Features / Assets / Env | detail | https://vite.dev/guide/features#content-security-policy-csp | features-assets-env#content-security-policy | available |
| features.license | License | Features / Assets / Env | merged | https://vite.dev/guide/features#license | features-assets-env#license | available |
| features.buildOptimizations | Build Optimizations | Features / Assets / Env | merged | https://vite.dev/guide/features#build-optimizations | features-assets-env#build-optimizations | available |
| assets.import | Importing Asset as URL | Features / Assets / Env | detail | https://vite.dev/guide/assets#importing-asset-as-url | features-assets-env#importing-asset-as-url | available |
| assets.raw | Importing Asset as String | Features / Assets / Env | merged | https://vite.dev/guide/assets#importing-asset-as-string | features-assets-env#importing-asset-as-string | available |
| assets.worker | Importing Script as a Worker | Features / Assets / Env | detail | https://vite.dev/guide/assets#importing-script-as-a-worker | features-assets-env#importing-script-as-a-worker | available |
| assets.publicDir | The public Directory | Features / Assets / Env | detail | https://vite.dev/guide/assets#the-public-directory | features-assets-env#the-public-directory | available |
| env.importMeta | Env Variables | Features / Assets / Env | detail | https://vite.dev/guide/env-and-mode#env-variables | features-assets-env#env-variables | available |
| env.mode | Modes | Features / Assets / Env | detail | https://vite.dev/guide/env-and-mode#modes | features-assets-env#modes | available |
| boundary.rollup | Rollup compatibility | Build Boundaries | detail | https://vite.dev/guide/api-plugin#rolldown-plugin-compatibility | build-rollup-boundary#rollup-compatibility | available |
| boundary.rolldown | Rolldown plugin compatibility | Build Boundaries | detail | https://vite.dev/guide/api-plugin#rolldown-plugin-compatibility | build-rollup-boundary#rolldown-plugin-compatibility | available |
| boundary.vuePlugin | @vitejs/plugin-vue | Build Boundaries | quick | https://vite.dev/guide/api-plugin#plugins-config | build-rollup-boundary#vitejsplugin-vue | available |
| boundary.node | Node.js baseline | Build Boundaries | quick | https://vite.dev/guide/api-plugin#authoring-a-plugin | build-rollup-boundary#nodejs-baseline | available |

## 观察与限制范围

| 范围 | 状态 | 数量 | 项目 |
| --- | --- | ---: | --- |
| CSS / DevTools / build / optimizeDeps / preprocessCSS | experimental | 8 | `css.devSourcemap`、`css.transformer`、`css.lightningcss`、`devtools`、`build.chunkImportMap`、`optimizeDeps.holdUntilCrawlEnd`、`optimizeDeps.needsInterop`、`preprocessCSS` |
| 旧转换与底层配置 | deprecated | 7 | `esbuild`、`build.polyfillModulePreload`、`build.rollupOptions`、`optimizeDeps.esbuildOptions`、`optimizeDeps.disabled`、`worker.rollupOptions`、旧 `server.hmr` WebSocket 子项 |
| 外部环境证据 | deferred | 4 | 真实部署/CDN、托管 HTTPS、组织级网络控制、固定环境性能基准 |

## 双向差集与 Gate 统计

- 覆盖矩阵稳定键：175；`viteStableReferenceItems`：175；双向差集：0。
- available target：175；唯一 target：175；12 个 Reference entry 全部存在，稳定索引使用其中 11 页。
- 课程：24/24 available（V1/V2/V3 各 8）；planned：0。
- experimental/deprecated 不进入稳定分母；deferred 项不写成已运行。
- 质量检查、浏览器证据和最终 Standards/Spec 均已通过，Gate V 已关闭。
