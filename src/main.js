import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import router from './router';
import { nxtVue } from '@nxt/nxt-vue';
import mdiIcons from '@/lib/icon-list';

import AppLoader from '@/components/AppShell/AppLoader.vue';

import 'normalize.css';
import '@/assets/scss/index.scss';

dayjs.extend(relativeTime);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(AppLoader)
  .use(pinia)
  .use(router)
  .use(nxtVue, { mdiIcons })
  .mount('#app')
;
