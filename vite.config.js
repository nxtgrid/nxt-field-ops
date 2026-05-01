import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
// import vueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
  server:{
    port: 4100,
  },

  plugins: [
    vue(),
    VitePWA({
      devOptions: {
        enabled: false, // Set this to `true` if you want to test SW locally
      },
      registerType: 'prompt',
      // includeAssets: [],
      manifest: {
        'name': 'NXT Field Ops',
        'short_name': 'NXT Field Ops',
        'description': 'The NXT field ops assistance PWA',
        'icons': [
          {
            'src': '/android-chrome-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
          },
          {
            'src': '/android-chrome-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
          },
        ],
        'theme_color': '#13253f',
        'background_color': '#ffffff',
        'display': 'standalone',
      },
      workbox: {
        globPatterns: [ '**/*.{js,css,html,png,svg,woff2}' ],
      },
    }),
    // vueDevTools(),
    visualizer(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@nxt': mode === 'development' ?  fileURLToPath(new URL('../nxt-ui-components/shared', import.meta.url)) : 'nxt-shared/shared',
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        additionalData: `
          @use "@nxt/styles/modules/variables" as *;
          @use "@nxt/styles/modules/mixins" as *;
        `,
      },
    },
  },
});
