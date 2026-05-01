
<template>
<section class="card">
  <p class="p mb-1" v-html="installText"></p>
  <div class="nxt-form-column">
    <label for="meter">
      Enter the meter number
    </label>
    <input
      id="meter"
      type="text"
      :autocomplete="IS_DEV ? 'on' : 'off'"
      required
      class="nxt-input"
      :class="{ 'nxt-input--error': hasBlurred && error }"
      v-model="external_reference"
      @blur="hasBlurred = external_reference.length ? true : false"
    />
  </div>

  <p class="p mt-0-half text-error">
    {{ (hasBlurred && error) || '&nbsp;' }}
  </p>

  <footer class="card-footer">
    <nxt-button
      size="small"
      to="/meters/select-customer"
    >
      Cancel
    </nxt-button>
    <nxt-button
      class="pull-right"
      size="small"
      :disabled="!external_reference.length || error"
      @click="toNextStep"
    >
      Next
    </nxt-button>
  </footer>
</section>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '@/stores/customers';
import { validateCalinMeterNumber } from '@nxt/libraries/validators';

const IS_DEV = import.meta.env.DEV;

export default {
  setup() {
    const router = useRouter();
    const customersStore = useCustomerStore();

    const installText = computed(() => {
      const toInstall = customersStore.connectionForMeterAssignment.metersToInstall;
      if(customersStore.isSingleMeterSetup)
        return `This customer has requested you to install a ${ toInstall[0].meter_phase === 'THREE_PHASE' ? 'Three Phase' : 'Single Phase' } meter.`;
      const getMeterText = ({ meter_type, meter_phase }) =>
        `<strong>${ meter_phase === 'THREE_PHASE' ? 'Three Phase ' : '' }${ meter_type === 'FS' ? 'Full Service' : 'High Priority Service' }</strong>`;
      if(toInstall.length === 1)
        return `This customer has requested you to install a ${ getMeterText(toInstall[0]) } meter.`;
      return `This customer has requested you to install a ${ getMeterText(toInstall[0]) } and a ${ getMeterText(toInstall[1]) } meter. Assign one of them now.`;
    });

    const external_reference = computed({
      get: () => customersStore.assignment.external_reference,
      set: customersStore.setExternalReferenceForAssignment,
    });
    const hasBlurred = ref(false);

    const error = computed(() => {
      if(!external_reference.value.length) return null;

      const baseValidationError = validateCalinMeterNumber(external_reference.value);
      if(baseValidationError) return baseValidationError;

      if(customersStore.allCloudMeterNumbers.includes(external_reference.value))
        return 'The meter with this number is already in use.';
      if(customersStore.allUnsyncedMeterNumbers.includes(external_reference.value))
        return 'You have already used this meter number';
      if(!customersStore.unassignedMeters.includes(external_reference.value))
        return 'This meter number does not exist in our inventory.';
      return null;
    });

    const toNextStep = () => {
      if(!external_reference.value.length || error.value) return;
      router.push('/meters/assign/meter-number-reversed');
    };

    return { IS_DEV, installText, external_reference, hasBlurred, error, toNextStep };
  },
};
</script>
