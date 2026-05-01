<template>
<app-shell-public v-if="route.meta.public" />
<app-shell v-else-if="isLoggedIn" />
<login-overlay v-else />
<sw-reload-prompt />
</template>

<script>
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@nxt/libraries/api-connection';

import { LoginOverlay, SwReloadPrompt } from '@nxt/components';
import AppShellPublic from './AppShellPublic.vue';
import AppShell from './AppShell.vue';

export default {
  setup() {
    const route = useRoute();
    const { isLoggedIn } = storeToRefs(useAccountStore());

    return { route, isLoggedIn };
  },

  components: { AppShell, AppShellPublic, LoginOverlay, SwReloadPrompt },
};
</script>
