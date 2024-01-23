import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// 引入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// 导入对应包
import ElementPlus from 'unplugin-element-plus/vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import fs from 'fs';
import path from 'path';
import os from 'os';

let https: any = undefined;
let hmr = true;
let network = os.networkInterfaces()
for (let dev in network) {
    let iface = network[dev]!
    for (let i = 0; i < iface.length; i++) {
        let alias = iface[i]
        if (alias.address == '51.161.87.222') {
            hmr = false;
            /*
            https = {
                cert: fs.readFileSync('/root/tokenizk-project-space/ssl/tokenizk_finance.crt'),
                key: fs.readFileSync('/root/tokenizk-project-space/ssl/tokenizk_finance.key'),
            };
            */
            break;
        }
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    define: {

    },
    plugins: [
        vue(),
        vueJsx(),
        // 配置插件
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [
                // 1、配置elementPlus 采用 sass 样式配色系统
                // ElementPlusResolver({ importStyle: 'sass' })
                ElementPlusResolver()
            ],
        }),
        // 按需定制主题配置
        ElementPlus({
            useSource: true,
        }),
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: '__tla',
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: i => `__tla_${i}`
        }),
        // crossOriginIsolation()
    ],
    resolve: {
        // 实际的路径转换  @ -> src
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                // 2、自动导入定制化样式文件进行样式覆盖
                additionalData: `
                @use "@/styles/element/index.scss" as *;
                @use "@/styles/var.scss" as *;
              `,
            }
        }
    },
    server: {
        port: 80,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Resource-Policy": "same-site",
            "Access-Control-Allow-Origin": "*"
        },
        https,
        hmr
    },
    optimizeDeps: {
        include: ['buffer']
    }
})




