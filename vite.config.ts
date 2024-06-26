import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'path';
import dfxJson from './dfx.json';
import fs from 'fs';
import prismjs from 'vite-plugin-prismjs';
import pluginContent from '@originjs/vite-plugin-content';

const isDev = process.env['DFX_NETWORK'] !== 'ic';
import WindiCSS from 'vite-plugin-windicss';
type Network = 'ic' | 'local';
interface CanisterIds {
    [key: string]: { [key in Network]: string };
}

// let canisterIds: CanisterIds;
// try {
//   canisterIds = JSON.parse(
//     fs
//       .readFileSync(
//         "./canister_ids.json"
//       )
//       .toString()
//   );
// } catch (e) {
//   console.error("\n⚠️  Before starting the dev server run: dfx deploy\n\n");
// }

// List of all aliases for canisters
// This will allow us to: import { canisterName } from "canisters/canisterName"
const aliases = Object.entries(dfxJson.canisters).reduce((acc, [name, _value]) => {
    // Get the network name, or `local` by default.
    const networkName = process.env['DFX_NETWORK'] || 'local';
    const outputRoot = path.join(__dirname, '.dfx', networkName, 'canisters', name);
    return {
        ...acc,
        ['canisters/' + name]: path.join(outputRoot, 'index' + '.js'),
    };
}, {});

// Generate canister ids, required by the generated canister code in .dfx/local/canisters/*
// This strange way of JSON.stringifying the value is required by vite
// const canisterDefinitions = Object.entries(canisterIds).reduce(
//   (acc, [key, val]) => ({
//     ...acc,
//     [`process.env.${key.toUpperCase()}_CANISTER_ID`]: isDev
//       ? JSON.stringify(val.local)
//       : JSON.stringify(val.ic),
//   }),
//   {}
// );

// Gets the port dfx is running on from dfx.json
// const DFX_PORT = dfxJson.networks.local.bind.split(":")[1];

// See guide on how to configure Vite at:
// https://vitejs.dev/config/
export default defineConfig({
    publicDir: 'public',
    base: '/',
    optimizeDeps: {
        include: ['ethers', 'arweave'],
        esbuildOptions: {
            target: 'esnext', // you can also use 'es2020' here
        },
    },
    plugins: [
        vue(),
        pluginContent(),
        WindiCSS(),
        prismjs({
            languages: 'all',
            plugins: ['line-numbers', 'copy-to-clipboard'],
            css: true,
        }),
    ],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                additionalData: `@import "${path.resolve(
                    __dirname,
                    '/frontend/assets/less/public.less',
                )}";`,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/frontend'),
            'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
            // Here we tell Vite the "fake" modules that we want to define
            ...aliases,
        },
        mainFields: ['module'],
    },
    server: {
        hmr: true,
        host: '0.0.0.0',
        port: 3000,
        fs: {
            allow: ['.'],
        },
        proxy: {
            // This proxies all http requests made to /api to our running dfx instance
            // '/bv1': {
            //   target: CONFIG.axiosBaseUrl,
            //   changeOrigin: true,
            //   rewrite: (path) => path.replace(/^\/bv1/, '')
            // }
            // '/top': {
            //   target: 'http://47.96.136.173:1323',
            //   changeOrigin: true,
            //   rewrite: (path) => path.replace(/^\/top/, '')
            // }
        },
    },
    define: {
        // Here we can define global constants
        // This is required for now because the code generated by dfx relies on process.env being set
        // ...canisterDefinitions,
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env': process.env,
    },
    build: {
        target: 'esnext',
        polyfillModulePreload: true,
        // assetsInlineLimit: 0,
        // cssCodeSplit: false
        rollupOptions: {
            output: {
                manualChunks: {
                    codemirror: [
                        // Split CodeMirror code.
                        'vue-codemirror6',
                        'codemirror',
                        '@codemirror/autocomplete',
                        '@codemirror/commands',
                        '@codemirror/language',
                        '@codemirror/lint',
                        '@codemirror/search',
                        '@codemirror/state',
                        '@codemirror/view',
                    ],
                    'codemirror-lang': ['@codemirror/lang-javascript'],
                },
            },
        },
    },
});
