<template>
<template v-if="customerForMeterAssignment">
  <section class="card mb-1">
    <h2 class="h2">
      Assign meter to {{ customerForMeterAssignment.full_name }}
    </h2>
    <div class="assign-progress">
      <div
        class="assign-progress__bar"
        :style="{ width: progressBarWidth }"
      ></div>
    </div>
  </section>

  <router-view />
</template>
</template>

<script>
import { computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCustomerStore } from '@/stores/customers';

const NUM_STEPS = 3;

export default {
  setup() {
    const router = useRouter();
    const customersStore = useCustomerStore();
    const { customerForMeterAssignment } = storeToRefs(customersStore);

    const progressBarWidth = computed(() => {
      const step = router.currentRoute.value.meta.step;
      return (5 + Math.ceil((95 / NUM_STEPS) * (step - 1))) + '%';
    });

    // Throw back if no customer selected
    if(!customersStore.assignment.customer_id) {
      router.replace('/meters/select-customer');
    }

    onUnmounted(customersStore.clearAssignment);

    return { customerForMeterAssignment, progressBarWidth };
  },
};
</script>

<style lang="scss">
.assign-progress {
  position: relative;
  height: 0.5rem;
  border: thin solid #dbdbdb;
  margin-top: 0.5rem;
  border-radius: 0.25rem;
  overflow: hidden;
  background-color: rgba( $nxt-color-blue-highlight, 0.25);

  &__bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: $nxt-color-blue-highlight;
    transition: width 400ms $ease--out-expo;
  }
}
</style>
