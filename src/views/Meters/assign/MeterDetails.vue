<template>
<section class="card">
  <header class="card-header">
    <h2 class="h2">
      Meter {{ customersStore.assignment.external_reference }}
    </h2>
  </header>

  <div class="nxt-form-column" v-if="!customersStore.isSingleMeterSetup">
    <label for="meter-type-select">
      Meter type
    </label>
    <select
      id="meter-type-select"
      class="nxt-input nxt-select"
      v-model="meter_type"
      :disabled="validMeterTypeOptions.length < 2"
    >
      <option
        v-for="({ label, value }) in validMeterTypeOptions"
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </select>
    <p
      v-if="!!alreadyHasAMeterOfType"
      class="p text-small mt-0-half"
    >
      Meter type selection limited because this connection already has a meter of type {{ alreadyHasAMeterOfType }}.
    </p>
  </div>

  <div
    v-if="gridSupportsThreePhase"
    class="nxt-form-column mt-1"
  >
    <label for="meter-phase-select">
      Meter phase
    </label>
    <select
      id="meter-phase-select"
      class="nxt-input nxt-select"
      v-model="meter_phase"
      :disabled="validMeterPhaseOptions.length < 2"
    >
      <option
        v-for="({ label, value }) in validMeterPhaseOptions"
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </select>
  </div>

  <!-- <div class="nxt-form-column mt-1">
    <label for="pole-select">
      Pole
    </label>
    <select
      id="pole-select"
      class="nxt-input nxt-select"
      v-model="pole_id"
    >
      <option :value="null" disabled>
        Please select a pole
      </option>
      <option
        v-for="pole in polesStore.cloudPoles"
        :key="pole.id"
        :value="pole.id"
      >
        {{ pole.external_reference }}
      </option>
    </select>
  </div> -->

  <div class="nxt-form-column mt-1">
    <label for="pole-choice">Pole</label>
    <input
      id="pole-choice"
      list="pole-list"
      class="nxt-input"
      placeholder="Please select a pole"
      v-model="poleExternalReference"
      required
      autocomplete="off"
    />
    <!-- Consider using https://vue-multiselect.js.org/ -->
    <datalist id="pole-list">
      <option
        v-for="{ id, external_reference } in polesStore.cloudPoles"
        :key="id"
        :value="external_reference"
      ></option>
    </datalist>
  </div>

  <footer class="card-footer">
    <nxt-button
      size="small"
      to="/meters/assign/meter-number-reversed"
    >
      Previous
    </nxt-button>
    <nxt-button
      size="small"
      class="pull-right"
      :disabled="!pole_id"
      @click="doAssign"
    >
      Assign
    </nxt-button>
  </footer>
</section>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '@/stores/customers';
import { useAccountStore } from '@nxt/libraries/api-connection';
import { usePolesStore } from '@/stores/poles';

const METER_TYPE_OPTIONS = [
  {
    label: 'HPS',
    value: 'HPS',
  },
  {
    label: 'FS',
    value: 'FS',
  },
];

const METER_PHASE_OPTIONS = [
  {
    label: 'Single Phase',
    value: 'SINGLE_PHASE',
  },
  {
    label: 'Three Phase',
    value: 'THREE_PHASE',
  },
];

export default {
  setup() {
    const router = useRouter();
    const customersStore = useCustomerStore();
    const accountStore = useAccountStore();
    const polesStore = usePolesStore();

    const gridSupportsThreePhase = computed(() => accountStore.myProfile?.busy_commissioning.is_three_phase_supported);
    const alreadyHasAMeterOfType = computed(() =>
      customersStore.connectionForMeterAssignment.meters?.[0]?.meter_type);
    const validMeterTypeOptions = computed(() =>
      METER_TYPE_OPTIONS.filter(({ value }) => value !== alreadyHasAMeterOfType.value));
    const validMeterPhaseOptions = computed(() => {
      if(customersStore.isSingleMeterSetup) return METER_PHASE_OPTIONS;
      if(meter_type.value === 'HPS') return METER_PHASE_OPTIONS.filter(({ value }) => value !== 'THREE_PHASE');
      return METER_PHASE_OPTIONS;
    });
    const recommendedMeterPhaseOption = computed(() => {
      if(
        meter_type.value === 'FS' &&
        customersStore.connectionForMeterAssignment.metersToInstall.length === 1 &&
        customersStore.connectionForMeterAssignment.metersToInstall[0].meter_phase === 'THREE_PHASE'
      ) return 'THREE_PHASE';
      return validMeterPhaseOptions.value[0].value;
    });

    const meter_type = computed({
      get: () => customersStore.assignment.meter_type,
      set: customersStore.setMeterTypeForAssignment,
    });

    meter_type.value = validMeterTypeOptions.value[0].value;

    const meter_phase = computed({
      get: () => customersStore.assignment.meter_phase,
      set: customersStore.setMeterPhaseForAssignment,
    });

    meter_phase.value = recommendedMeterPhaseOption.value;

    /**
     * Pole id with external reference matching
    **/

    const pole_id = computed({
      get: () => customersStore.assignment.pole_id,
      set: customersStore.setPoleIdForAssignment,
    });

    const poleExternalReference = ref();

    watch(poleExternalReference, newVal => {
      const pole = polesStore.cloudPoles.find(({ external_reference }) => external_reference === newVal);
      if(pole) pole_id.value = pole.id;
      else pole_id.value = undefined;
    });

    const doAssign = () => {
      if(!pole_id.value) return;
      customersStore.storeAssignedMeter();
      router.push('/meters');
    };

    return {
      customersStore,
      polesStore,
      gridSupportsThreePhase,
      alreadyHasAMeterOfType,
      validMeterTypeOptions,
      validMeterPhaseOptions,
      meter_type,
      meter_phase,
      pole_id,
      poleExternalReference,
      doAssign,
    };
  },
};
</script>
