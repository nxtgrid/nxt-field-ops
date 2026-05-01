<template>
<button
  class="location-target"
  @click="myLocationStore.startLocationWatch({ waitForConfirm: false })"
>
  <mdi-icon :name="iconStyle.icon" :class="iconStyle.class" />
</button>
</template>

<script>
import { useMyLocationStore } from '@/stores/my-location';
import { ref, computed } from 'vue';

const CHECK_LOCATION_TIMING = 5 * 60 * 1000;

export default {
  setup() {
    const myLocationStore = useMyLocationStore();
    const _nowish = ref(new Date());

    setInterval(() => {
      _nowish.value = new Date();
    }, CHECK_LOCATION_TIMING);

    const iconStyle = computed(() => {
      if(!myLocationStore.longitude) return { icon: 'mdiCrosshairsQuestion' };
      if(myLocationStore.status.isWatching) return {
        icon: 'mdiCrosshairsGps',
        class: 'rotating-relaxed',
      };
      if((_nowish.value - myLocationStore.updatedAt) > (CHECK_LOCATION_TIMING - 2000))
        return { icon: 'mdiCrosshairsQuestion' };

      return { icon: 'mdiCrosshairsGps' };
    });

    return { myLocationStore, iconStyle };
  },
};
</script>

