<template>
<header class="app-header">
  <div class="app-header__wrapper">
    <nxt-logo class="app-header__logo" />
    <div class="app-header__info">
      <p>{{ myProfile?.full_name }}</p>
      <p>{{ myProfile?.busy_commissioning?.name }}</p>
    </div>
    <div class="app-header__right">
      <app-location class="app-header__button" />
      <app-network class="app-header__button" />
    </div>
  </div>
</header>
</template>

<script>
import { useAccountStore } from '@nxt/libraries/api-connection';
import { storeToRefs } from 'pinia';

import { NxtLogo } from '@nxt/components';
import AppLocation from './AppLocation.vue';
import AppNetwork from './AppNetwork.vue';

export default {
  setup() {
    const accountStore = useAccountStore();
    const { myProfile } = storeToRefs(accountStore);

    return { myProfile };
  },

  components: { NxtLogo, AppLocation, AppNetwork },
};
</script>

<style lang="scss">
.app-header {
  position: fixed;
  height: $app-header-bar-height;
  width: 100%;
  background: $nxt-color-blue-dark;
  color: $nxt-color-white;
  font-weight: 700;
  z-index: $z-top-bar;

  &__wrapper {
    display: flex;
    height: 100%;
    width: $app-content-width-mobile;
    align-items: center;
    max-width: 1024px;
    margin: 0 auto;

    @media(min-width: $ipad-horizontal) {
      width: $app-content-width-desktop;
    }
  }

  &__logo {
    display: block;
    height: 32px;
    width: auto;
    flex-shrink: 0;

    @media(min-width: $ipad-horizontal) {
      height: 36px;
    }
  }

  &__info {
    font-size: 0.875rem;
    border-left: 2px solid rgba($nxt-color-white, 0.5);
    padding-inline: 8px;
    margin-left: 8px;
    min-width: 0;

    p {
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }
  }

  &__right {
    display: flex;
    flex-shrink: 0;
    margin-left: auto;
  }

  &__button {
    background: none;
    border: none;
    padding: 0.5rem 8px;
    cursor: pointer;
  }
}
</style>
