<template>
<button
  class="online-globe"
  @click="showInfo = !showInfo"
>
  <mdi-icon :name="network.isOnline ? 'mdiWeb' : 'mdiWebOff'" />
  <span class="online-globe__text">{{ network.isOnline ? 'ONLINE' : 'OFFLINE' }}</span>
  <div
    v-if="showInfo"
    class="network-info"
  >
    <p class="text-bold">
      NXT Field Ops v{{ version }}
    </p>
    <pre>{{ browser }}</pre>
    <p class="text-bold mt-1">
      Network info:
    </p>
    <pre>{{ network }}</pre>
  </div>
</button>
</template>

<script>
import Bowser from 'bowser';
import { ref, reactive } from 'vue';
import { useNetwork } from '@vueuse/core';
import { useAccountStore } from '@nxt/libraries/api-connection';
import { useCustomerStore } from '@/stores/customers';
import { usePolesStore } from '@/stores/poles';
import { useMyMetersStore } from '@/stores/my-meters';
import { version } from '../../../package.json';

export default {
  setup() {
    const showInfo = ref(false);
    const network = reactive(useNetwork());
    const accountStore = useAccountStore();
    const customersStore = useCustomerStore();
    const polesStore = usePolesStore();
    const myMetersStore = useMyMetersStore();

    const fetchFreshData = async () => {
      await accountStore.fetchMyProfile();
      polesStore.fetchCloudPoles();
      customersStore.fetchCloudCustomers();
      myMetersStore.fetchMyMeters();
    };

    if(network.isOnline) fetchFreshData();

    const browser = Bowser.parse(navigator.userAgent);

    return { showInfo, version, network, browser };
  },
};
</script>

<style lang="scss">
.online-globe {
  position: relative;

  &__text {
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    font-size: 8px;
    line-height: 1;
    margin-top: -10px;
  }
}

.network-info {
  position: absolute;
  text-align: left;
  top: calc(100% + 0.5rem);
  right: 0;
  padding: 0.5rem 8px;
  background: white;
  color: black;
  border-radius: 4px;
  border: 2px solid $nxt-color-blue;
  font-size: 0.8125rem;

  pre {
    margin: 0;
  }
}
</style>
