import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import type { PluginOption } from 'vite';
import viteCompression from 'vite-plugin-compression';
import mkcert from 'vite-plugin-mkcert';
import { VueMcp } from 'vite-plugin-vue-mcp';
import { devServer } from './config/devServer';

/**
 * 现代浏览器兼容性填充
 */
const modernLegacyPolyfills = [
  'core-js/es/array/at',
  'core-js/es/array/find-last',
  'core-js/es/array/find-last-index',
  'core-js/es/array/to-reversed',
  'core-js/es/array/to-sorted',
  'core-js/es/array/to-spliced',
  'core-js/es/typed-array/at',
  'core-js/es/typed-array/find-last',
  'core-js/es/typed-array/find-last-index',
  'core-js/es/typed-array/to-reversed',
  'core-js/es/typed-array/to-sorted',
  'core-js/es/string/replace-all',
  'core-js/es/object/has-own',
  'core-js/es/promise/any',
];

/**
 * 生成插件
 * @param mode - 模式
 * @returns 插件
 */
function generatePlugins(mode: string): PluginOption[] {
  const isProd = mode === 'production';

  const plugins: PluginOption[] = [
    vue(),
    vueJsx(),
    VueMcp(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
    codeInspectorPlugin({
      bundler: 'vite',
    }),
  ];

  if (isProd) {
    plugins.push(
      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: modernLegacyPolyfills,
        additionalModernPolyfills: modernLegacyPolyfills,
      }),
      viteCompression({
        verbose: true, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用压缩
        threshold: 10240, // 体积大于阈值时才会被压缩，单位为 b，默认为 10kb
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 生成的压缩包后缀
        deleteOriginFile: false, // 是否删除原文件
      }),
    );

    if (process.env.VITE_UPLOAD_TO_SENTRY) {
      plugins.push(
        // 上传到sentry平台
        sentryVitePlugin({
          org: process.env.VITE_SENTRY_ORG,
          project: process.env.VITE_SENTRY_PROJECT,
          authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
          telemetry: false,
        }),
      );
    }
    if (process.env.VITE_ENABLE_ANALYZER) {
      plugins.push(
        // 打包产物分析
        visualizer({
          title: 'Vite Bundle Visualizer',
          open: true,
          brotliSize: true,
          gzipSize: true,
          sourcemap: false,
          template: 'treemap',
          filename: 'dist/analyzer.html',
        }),
      );
    }
  } else {
    if (process.env.VITE_ENABLE_HTTPS) {
      plugins.push(mkcert());
    }
  }

  return plugins;
}

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    /** 开发服务器配置 */
    server: devServer(),
    /** 插件配置 */
    plugins: generatePlugins(mode),
    /** 路径别名配置 */
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    /** css配置 */
    css: {
      preprocessorOptions: {
        scss: {
          // 配置全局scss
          // additionalData: '@use "@/styles/index.scss" as *;',
        },
      },
      devSourcemap: true, // 开发环境启用sourcemap
    },
    /** 构建配置 */
    build: {
      sourcemap: true, // 生成 sourcemap
      assetsInlineLimit: 4 * 1024, // 内联资源限制
      outDir: 'dist', // 打包目录名称
      assetsDir: 'static/assets', // 资源目录名称
      cssCodeSplit: true, // CSS 代码分割
      cssMinify: 'lightningcss', // CSS 压缩
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 100 * 1024, // 最小拆分大小
          manualChunks: {
            'utils-vendor': ['lodash-es', 'dayjs', 'axios'],
            'vue-vendor': [
              'vue',
              'vue-router',
              'vue-i18n',
              'pinia',
              'pinia-plugin-persistedstate',
            ],
          },
          entryFileNames: `static/js/[name].[hash].js`, // 入口文件名称
          chunkFileNames: `static/js/[name].[hash].js`, // 分块文件名称
          assetFileNames: ({ names }) => {
            // 资源文件名称
            const fileName = names?.[0] ?? '';
            if (/\.(css)$/.test(fileName)) {
              return 'static/css/[name].[hash].[ext]';
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/.test(fileName)) {
              return 'static/fonts/[name].[hash].[ext]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(fileName)) {
              return 'static/img/[name].[hash].[ext]';
            }
            return 'static/assets/[name].[hash].[ext]';
          },
        },
      },
    },
  });
};
