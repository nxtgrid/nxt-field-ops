<template>
<section v-if="myMetersStore.myMeters.length" class="card mt-1">
  <header class="card-header">
    <h2 class="h2">
      My installed meters
    </h2>
  </header>
  <div class="table-scroller">
    <table class="tommaso-table">
      <thead>
        <tr>
          <th>Meter</th>
          <th>Customer</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="meter in myMetersStore.myMeters"
          :key="meter.external_reference"
        >
          <tr>
            <td>
              {{ meter.external_reference }}
            </td>
            <td>
              {{ meter.connection.customer.full_name }}
            </td>
            <td>
              <meter-status-cell :meter="meter" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</section>
</template>

<script>
import { useMyMetersStore } from '@/stores/my-meters';
import MeterStatusCell from './MeterStatusCell.vue';

export default {
  setup() {
    const myMetersStore = useMyMetersStore();
    return { myMetersStore };
  },

  components: { MeterStatusCell },
};
</script>
