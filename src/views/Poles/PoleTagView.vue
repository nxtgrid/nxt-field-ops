<template>
<section class="card">
  <header class="card-header">
    <h2 class="h2">
      Tag a pole
    </h2>
  </header>

  <div class="nxt-form-column">
    <label for="pole-tag">
      Enter the unique reference as tagged on the pole
    </label>
    <input
      id="pole-tag"
      type="text"
      autocomplete="off"
      required
      class="nxt-input"
      :class="{
        'nxt-input--blurred': isTypingInReversed,
        'nxt-input--error': hasBlurred && error
      }"
      v-model="poleInput.external_reference"
      @blur="hasBlurred = poleInput.external_reference.length ? true : false"
    />
  </div>

  <p class="p mt-0-half text-error">
    {{ (hasBlurred && error) || '&nbsp;' }}
  </p>

  <div class="nxt-form-column mt-0-half">
    <label for="pole-tag-reversed">
      Enter the same reference but in reverse
    </label>
    <input
      id="pole-tag-reversed"
      type="text"
      autocomplete="off"
      required
      class="nxt-input"
      v-model="poleInput.reference_reversed"
      @focus="isTypingInReversed = true"
      @blur="isTypingInReversed = false"
      :class="{ 'nxt-input--error': stringsValid === false }"
    />
  </div>

  <location-info-list class="mt-1" />
  <nxt-button
    v-if="myLocationStore.waitForConfirm"
    class="mt-0-half"
    size="tiny"
    variant="primary"
    :disabled="!myLocationStore.status.isAcceptable"
    @click="doConfirmLocation"
  >
    {{ myLocationStore.status.isAcceptable ? 'Use this location' : 'Please wait...' }}
  </nxt-button>

  <footer class="card-footer">
    <nxt-button
      size="small"
      @click="doTagPole"
      :disabled="!canSubmit"
    >
      Submit
    </nxt-button>
    <nxt-button
      size="small"
      to="/poles/"
    >
      Cancel
    </nxt-button>
  </footer>
</section>
</template>

<script>
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@nxt/libraries/api-connection';
import { useMyLocationStore } from '@/stores/my-location';
import { usePolesStore } from '@/stores/poles';

import LocationInfoList from '@/components/LocationInfoList.vue';

export default {
  setup() {
    const router = useRouter();
    const accountStore = useAccountStore();
    const myLocationStore = useMyLocationStore();
    const polesStore = usePolesStore();
    const hasBlurred = ref(false);

    const poleInput = reactive({
      external_reference: '',
      reference_reversed: '',
      location_geom: {
        type: 'Point',
        // Coordinates are [ longitude, latitude ]
        coordinates: [ null, null ],
      },
      location_accuracy: null,
    });

    const gridId = computed(() => accountStore.myProfile?.busy_commissioning.id);

    const error = computed(() => {
      const numDigits = poleInput.external_reference.length;
      if(!numDigits) return null;
      if(numDigits !== 6)
        return 'Reference should be exactly 6 digits long.';
      if(polesStore.allPoleReferences.includes(poleInput.external_reference))
        return 'This reference is already in use.';
      return null;
    });

    const isTypingInReversed = ref(false);
    const stringsValid = computed(() => {
      if(!poleInput.external_reference.length || !poleInput.reference_reversed.length) return;
      return poleInput.external_reference.split('').reverse().join('') === poleInput.reference_reversed;
    });

    const canSubmit = computed(() =>
      gridId.value && !error.value && stringsValid.value && poleInput.location_geom.coordinates[0] !== null);

    /**
     * Location
    **/
    myLocationStore.startLocationWatch({ waitForConfirm: true });

    const doConfirmLocation = () => {
      myLocationStore.clearAllWatchers();
      poleInput.location_geom.coordinates[0] = myLocationStore.longitude;
      poleInput.location_geom.coordinates[1] = myLocationStore.latitude;
      poleInput.location_accuracy = myLocationStore.accuracy;
    };

    onBeforeUnmount(myLocationStore.clearAllWatchers);

    const doTagPole = () => {
      if(!canSubmit.value) return;
      const { external_reference, location_geom, location_accuracy } = poleInput;
      polesStore.addUnsyncedPole({
        external_reference,
        grid_id: gridId,
        location_geom,
        location_accuracy,
      });
      router.push('/poles');
    };

    return { myLocationStore, poleInput, hasBlurred, error, stringsValid, isTypingInReversed, canSubmit, doConfirmLocation, doTagPole, gridId };
  },

  components: { LocationInfoList },
};
</script>

<style lang="scss">
.nxt-input--blurred {
  filter: blur(4px);
}
</style>
