<template>
<section v-if="myProfile" class="card">
  <header class="card-header">
    <h2 class="h2">
      Welcome {{ myProfile.full_name }}
    </h2>
  </header>
  <p v-if="!myProfile.busy_commissioning?.id" class="p mb-1">
    You have <span class="text-bold">not</span> been assigned to a mini-grid to commission meters. Please ask your grid manager to assign you to a grid.
  </p>
  <template v-else>
    <p v-if="isOnline" class="p">
      You are currently <span class="text-bold">online</span>. You can upload meters and poles you have assigned/tagged.
    </p>
    <p v-else class="p">
      You are currently <span class="text-bold">offline</span>. You can assign meters and tag poles, but you need to get to a location with good connectivity to upload them to the cloud.
    </p>
  </template>
</section>

<section class="card mt-1">
  <header class="card-header">
    <h2 class="h2">My location</h2>
  </header>
  <location-info-list />
  <div class="card-footer">
    <nxt-button
      size="tiny"
      :disabled="myLocationStore.status.isWatching"
      @click="myLocationStore.startLocationWatch({ waitForConfirm: false })"
    >
      Updat{{ myLocationStore.status.isWatching ? 'ing...' : 'e' }}
    </nxt-button>
    <nxt-button
      size="tiny"
      :disabled="!myLocationStore.status.isAcceptable"
      @click="shareLocationOnTelegram"
    >
      Share on Telegram
    </nxt-button>
  </div>
</section>
</template>

<script>
import { onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useOnline } from '@vueuse/core';
import { useAccountStore } from '@nxt/libraries/api-connection';
import { useMyLocationStore } from '@/stores/my-location';

import LocationInfoList from '@/components/LocationInfoList.vue';

export default {
  setup() {
    const isOnline = useOnline();
    const accountStore = useAccountStore();
    const myLocationStore = useMyLocationStore();
    const { myProfile } = storeToRefs(accountStore);

    const shareLocationOnTelegram = () => {
      myLocationStore.clearAllWatchers();
      const strArr = [
        `Latitude: ${ myLocationStore.latitude }`,
        `Longitude: ${ myLocationStore.longitude }`,
        `Accuracy: ${ myLocationStore.accuracy }`,
      ];
      const shareText = strArr.join(', ');
      window.open(`tg://msg_url?url=Sharing location:&text=${ shareText }`);
    };

    onBeforeUnmount(myLocationStore.clearAllWatchers);

    return { isOnline, myProfile, myLocationStore, shareLocationOnTelegram };
  },

  components: { LocationInfoList },
};
</script>

<style lang="scss">
.underline {
  text-decoration: underline;
}
</style>
