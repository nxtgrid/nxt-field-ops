<template>
<div>
  <dl>
    <dt>Latitude</dt>
    <dd>{{ myLocation.latitude ?? 'Unknown' }}</dd>
    <dt>Longitude</dt>
    <dd>{{ myLocation.longitude ?? 'Unknown' }}</dd>
    <dt>Accuracy</dt>
    <dd>
      <template v-if="!myLocation.accuracy">Unknown</template>
      <template v-else>
        <span
          class="acc-status"
          :style="{ 'background-color': myLocationStore.accuracyColor }"
        ></span>
        {{ Math.round(myLocation.accuracy * 10) / 10 }} m
      </template>
    </dd>
    <dt>Last update</dt>
    <dd>{{ realtimeAgo }}</dd>
  </dl>
  <p v-if="status.message" class="p location-status-message">{{ status.message }}</p>
</div>
</template>

<script>
import { useMyLocationStore } from '@/stores/my-location';
import { computed, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { timeAgo } from '@nxt/libraries/date-helpers';

export default {
  setup() {
    const myLocationStore = useMyLocationStore();
    const { myLocation, status } = storeToRefs(myLocationStore);

    let secondInterval;
    const counter = ref(0);
    const increment = () => { counter.value++; };
    secondInterval = setInterval(increment, 1000);

    const realtimeAgo = computed(() => {
      counter.value;
      return timeAgo(myLocationStore.updatedAt);
    });

    onBeforeUnmount(() => {
      clearInterval(secondInterval);
    });

    return { myLocationStore, myLocation, realtimeAgo, status };
  },
};
</script>

<style lang="scss" scoped>
dl {
  max-width: 300px;
  margin: 0;
  display: grid;
  row-gap: 0.5rem;
  column-gap: 16px;
  grid-template-columns: 1fr 2fr;
}

dt {
  font-weight: 700;
}

dd {
  margin: 0;
  display: flex;
  align-items: center;
}

.acc-status {
  width: 1rem;
  height: 1rem;
  margin-right: 8px;
  border-radius: 100%;
}

.location-status-message {
  margin-top: 0.5rem;
  border: thin solid $nxt-color-blue-focusring;
  border-radius: 4px;
  background-color: rgba($nxt-color-blue-focusring, 15%);
  font-size: 0.875rem;
  padding: 0.25rem 4px;
  text-align: center;
  color: $nxt-color-blue-highlight;
}
</style>
