<template>
<section class="card">
  <header class="card-header">
    <h2 class="h2">Meter assignment</h2>
  </header>
  <nxt-button
    to="/meters/select-customer"
    size="small"
  >
    Assign a meter to a customer
  </nxt-button>
</section>

<section
  v-if="customersStore.unsyncedMeters.length"
  class="card mt-1"
>
  <header class="card-header">
    <h2 class="h2">
      Unsynced meters
    </h2>
    <div class="card-header__actions">
      <nxt-button
        icon-only
        icon-name="mdiTrashCanOutline"
        :disabled="syncing"
        @click="doDeleteUnsyncedMeters"
      />
      <nxt-button
        icon-only
        icon-name="mdiCloudUploadOutline"
        :disabled="syncing"
        @click="doSyncMeters"
      />
    </div>
  </header>
  <table class="tommaso-table">
    <thead>
      <tr>
        <th>Meter</th>
        <th>Type</th>
        <th>Customer</th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="meter in customersStore.unsyncedMeters"
        :key="meter.external_reference"
      >
        <tr>
          <td>
            {{ meter.external_reference }}
          </td>
          <td>
            {{ customersStore.isSingleMeterSetup ? meter.meter_phase === 'SINGLE_PHASE' ? 'Single Phase' : 'Three Phase' : meter.meter_type }}
          </td>
          <td>
            {{ customersStore.getCustomerById(meter.customer_id)?.full_name }}
          </td>
          <td>
            <template v-if="syncing">
              <span
                v-if="meter.syncStatus === 'SUCCESSFUL'"
                class="table-icon text-success"
              >
                <mdi-icon
                  :scale="20"
                  name="mdiCloudCheckOutline"
                />
              </span>
              <span
                v-else-if="meter.syncStatus === 'FAILED'"
                class="table-icon text-error"
              >
                <mdi-icon
                  :scale="20"
                  name="mdiCloudAlertOutline"
                />
              </span>
              <span
                v-else
                class="table-icon text-busy"
              >
                <mdi-icon
                  :scale="20"
                  name="mdiCloudSyncOutline"
                />
              </span>
            </template>
            <template v-else>
              <button
                v-if="meter.syncError"
                class="table-icon text-error"
                @click="doOpenMeterRow(meter.external_reference)"
              >
                <mdi-icon
                  :scale="20"
                  name="mdiCloudAlertOutline"
                />
              </button>
              <button
                v-else
                class="table-icon"
                @click="doDeleteUnsyncedMeter(meter.external_reference)"
              >
                <mdi-icon
                  :scale="20"
                  name="mdiTrashCanOutline"
                />
              </button>
            </template>
          </td>
        </tr>
        <tr
          v-if="openMeterRowRef === meter.external_reference"
          class="tr-expandable"
        >
          <td colspan="3" class="p">
            Error: {{ meter.syncError }}
            <br>
            Connection: {{ meter.connection_id }}
          </td>
          <td>
            <button
              class="table-icon"
              @click="doDeleteUnsyncedMeter(meter.external_reference)"
              v-wave
            >
              <mdi-icon
                :scale="20"
                name="mdiTrashCanOutline"
              />
            </button>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</section>

<my-installed-meters />
</template>

<script>
import { ref } from 'vue';
import { useOnline } from '@vueuse/core';
import { useToast } from 'vue-toastification';
import { useCustomerStore } from '@/stores/customers';
import { useMyMetersStore } from '@/stores/my-meters';

import MyInstalledMeters from '@/components/MyInstalledMeters/MyInstalledMeters.vue';

export default {
  setup() {
    const customersStore = useCustomerStore();
    const myMetersStore = useMyMetersStore();
    const isOnline = useOnline();
    const $toast = useToast();

    const syncing = ref(false);
    const openMeterRowRef = ref();
    const doOpenMeterRow = reference => {
      if(openMeterRowRef.value === reference) openMeterRowRef.value = undefined;
      else openMeterRowRef.value = reference;
    };

    const doSyncMeters = async () => {
      if(!isOnline.value) {
        $toast.warning('Can\'t sync when offline');
        return;
      }
      $toast.info('Syncing started'); // @TEMPORARY
      syncing.value = true;
      const results = await customersStore.uploadUnsyncedMeters();
      if(!results.failed) {
        $toast.success('All meters uploaded successfully');
      }
      else {
        $toast.error(`${ results.failed } out of ${ results.failed + results.successful } meters failed to upload.`);
      }
      syncing.value = false;
      myMetersStore.fetchMyMeters();
    };

    const doDeleteUnsyncedMeters = () => {
      if(confirm('This will remove all unsynced meters. Are you sure you want to continue?'))
        customersStore.clearUnsyncedMeters();
    };

    const doDeleteUnsyncedMeter = reference => {
      if(confirm(`Are you sure you want to delete meter ${ reference }`))
        customersStore.removeUnsyncedMeter(reference);
    };

    return {
      customersStore,
      doSyncMeters,
      syncing,
      openMeterRowRef,
      doOpenMeterRow,
      doDeleteUnsyncedMeters,
      doDeleteUnsyncedMeter,
    };
  },

  components: { MyInstalledMeters },
};
</script>
