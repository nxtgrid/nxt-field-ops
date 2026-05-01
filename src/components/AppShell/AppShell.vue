<template>
<app-header />
<app-buttons
  :buttons="buttons"
  :custom-active-route="customActiveRoute"
/>

<main class="main-content">
  <div class="main-content__padded">
    <router-view />
  </div>
</main>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAccountStore } from '@nxt/libraries/api-connection';

import AppHeader from './AppHeader.vue';
import { AppButtons } from '@nxt/components';

export default {
  setup() {
    const route = useRoute();
    const accountStore = useAccountStore();
    const customActiveRoute = computed(() => {
      if(route.path === '/') return 'home';
      if(route.path.includes('meters')) return 'meters';
      if(route.path.includes('poles')) return 'poles';
      return undefined;
    });

    const buttons = computed(() => [
      {
        title: 'Home',
        icon: 'mdiHomeOutline',
        to: '/',
        customActiveRoute: 'home',
      },
      {
        title: 'Assign meters',
        icon: 'mdiPlusNetworkOutline',
        to: '/meters/',
        customActiveRoute: 'meters',
        hideWhen: !accountStore.myProfile?.busy_commissioning?.id,
      },
      {
        title: 'Poles',
        icon: 'mdiSignPole',
        to: '/poles/',
        customActiveRoute: 'poles',
        hideWhen: !accountStore.myProfile?.busy_commissioning?.id ||
          !accountStore.isNxtGridMember,
      },
      {
        title: 'Log out',
        icon: 'mdiLogout',
        action: accountStore.doLogOut,
      },
    ]);

    return { buttons, customActiveRoute };
  },

  components: { AppHeader, AppButtons },
};

</script>

<style lang="scss">
.main-content {
  position: relative;
  width: 100%;
  border-top: $app-header-bar-height solid transparent;
  padding-bottom: $app-buttons-height;

  &__padded {
    width: $app-content-width-mobile;
    margin: 0 auto;
    padding-block: 1rem;
    max-width: 1024px;
  }

  @media(min-width: $ipad-horizontal) {
    &__padded {
      width: $app-content-width-desktop;
    }
  }
}
</style>
