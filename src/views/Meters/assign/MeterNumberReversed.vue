
<template>
<section class="card">
  <div class="nxt-form-column">
    <label for="meter-reverse">
      Enter the meter number in reverse
    </label>
    <input
      id="meter-reverse"
      type="text"
      autocomplete="off"
      required
      class="nxt-input"
      :class="{ 'nxt-input--error': reference_reversed.length && !isValid }"
      v-model="reference_reversed"
    />
  </div>

  <p class="p mt-0-half">
    {{ IS_DEV ? 'You can skip this step because you\'re in DEVELOPMENT mode.' : 'Note that if you go back this field will be cleared.' }}
  </p>

  <footer class="card-footer">
    <nxt-button
      size="small"
      to="/meters/assign/meter-number"
    >
      Previous
    </nxt-button>
    <nxt-button
      class="pull-right"
      size="small"
      :disabled="!isValid"
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

const IS_DEV = import.meta.env.DEV;

export default {
  setup() {
    const router = useRouter();
    const customersStore = useCustomerStore();
    const reference_reversed = ref('');

    const isValid = computed(() =>
      IS_DEV || customersStore.assignment.external_reference
        .split('').reverse().join('') === reference_reversed.value);

    const toNextStep = () => {
      if(!isValid.value) return;
      router.push('/meters/assign/meter-details');
    };

    return { IS_DEV, reference_reversed, isValid, toNextStep };
  },
};
</script>

