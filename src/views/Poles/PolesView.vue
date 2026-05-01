<template>
<section class="card">
  <header class="card-header">
    <h2 class="h2">Poles</h2>
  </header>
  <nxt-button
    size="small"
    to="/poles/tag/"
  >
    Tag a pole
  </nxt-button>
</section>

<section
  v-if="polesStore.unsyncedPoles.length"
  class="card mt-1"
>
  <header class="card-header">
    <h2 class="h2">
      Unsynced poles
    </h2>
    <div class="card-header__actions">
      <nxt-button
        icon-only
        icon-name="mdiTrashCanOutline"
        :disabled="syncing"
        @click="deleteUnsyncedPoles"
      />
      <nxt-button
        icon-only
        icon-name="mdiCloudUploadOutline"
        :disabled="syncing"
        @click="doSyncPoles"
      />
    </div>
  </header>
  <table class="tommaso-table">
    <thead>
      <tr>
        <th>Pole tag</th>
        <th>Lat Long</th>
        <th>Accuracy</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="pole in polesStore.unsyncedPoles"
        :key="pole.external_reference"
      >
        <tr>
          <td>
            {{ pole.external_reference }}
          </td>
          <td>
            {{ prettyPrintLatLong(pole.location_geom) }}
          </td>
          <td>
            {{ Math.round(pole.location_accuracy * 10) / 10 }}
          </td>
          <td>
            <button
              v-if="pole.syncError"
              class="table-icon text-error"
              @click="doOpenErrorRow(pole.external_reference)"
            >
              <mdi-icon
                :scale="20"
                name="mdiCloudAlertOutline"
              />
            </button>
            <button
              v-else
              class="table-icon"
              @click="doDeleteUnsyncedPole(pole.external_reference)"
            >
              <mdi-icon
                :scale="20"
                name="mdiTrashCanOutline"
              />
            </button>
          </td>
        </tr>
        <tr
          v-if="openErrorRowRef === pole.external_reference"
          class="tr-expandable"
        >
          <td colspan="3" class="p">
            Error: {{ pole.syncError }}
          </td>
          <td>
            <button
              class="table-icon"
              @click="doDeleteUnsyncedPole(pole.external_reference)"
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

<section class="card mt-1">
  <header class="card-header">
    <h2 class="h2">
      Poles in the cloud
    </h2>
    <div class="card-header__actions">
      <nxt-button
        icon-only
        icon-name="mdiCloudRefreshOutline"
        @click="doFetchCloudPoles"
      />
    </div>
  </header>
  <table class="tommaso-table">
    <thead>
      <tr>
        <th>Pole tag</th>
        <th>Lat Long</th>
        <th>Meters</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="pole in polesStore.cloudPoles"
        :key="pole.id"
      >
        <tr>
          <td>
            {{ pole.external_reference }}
          </td>
          <td>
            {{ pole.location_geom.coordinates[1] + ', ' + pole.location_geom.coordinates[0] }}
          </td>
          <td>
            {{ pole.meters.length }}
          </td>
          <td>
            <button
              v-if="pole.meters.length"
              class="table-icon"
              @click="doOpenPoleRow(pole.id)"
            >
              <mdi-icon
                :scale="20"
                name="mdiChevronDown"
                :style="openPoleRowId === pole.id ? 'transform: rotate(180deg);' : ''"
              />
            </button>
          </td>
        </tr>
        <tr
          v-if="openPoleRowId === pole.id"
          class="tr-expandable"
        >
          <td colspan="4" class="p">
            <span class="text-bold">Meters:</span>
            <br>
            {{ pole.meters.reduce((accStr, { external_reference }, index) =>
              accStr + (index > 0 ? ', ' : '') + external_reference, '') }}
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</section>
</template>

<script>
import { ref } from 'vue';
import { useOnline } from '@vueuse/core';
import { useToast } from 'vue-toastification';
import { usePolesStore } from '@/stores/poles';

export default {
  setup() {
    const isOnline = useOnline();
    const $toast = useToast();
    const polesStore = usePolesStore();
    const syncing = ref(false);

    const prettyPrintLatLong = ({ coordinates: [ longitude, latitude ] }) =>
      Math.round(latitude * 100000) / 100000 + ', ' + Math.round(longitude * 100000) / 100000;

    const openPoleRowId = ref();
    const doOpenPoleRow = id => {
      if(openPoleRowId.value === id) openPoleRowId.value = undefined;
      else openPoleRowId.value = id;
    };

    const openErrorRowRef = ref();
    const doOpenErrorRow = reference => {
      if(openErrorRowRef.value === reference) openErrorRowRef.value = undefined;
      else openErrorRowRef.value = reference;
    };

    const doSyncPoles = async () => {
      if(!isOnline.value) {
        $toast.warning('Can\'t sync when offline');
        return;
      }
      syncing.value = true;
      await polesStore.uploadPoles();
      syncing.value = false;
    };

    const doFetchCloudPoles = () => {
      if(!isOnline.value) {
        $toast.warning('Can\'t sync when offline');
        return;
      }
      polesStore.fetchCloudPoles();
    };

    const deleteUnsyncedPoles = () => {
      if(confirm('This will remove all unsynced poles. Are you sure you want to continue?'))
        polesStore.clearUnsyncedPoles();
    };

    const doDeleteUnsyncedPole = reference => {
      if(confirm(`Are you sure you want to delete meter ${ reference }`))
        polesStore.removeUnsyncedPole(reference);
    };

    return {
      polesStore,
      doFetchCloudPoles,
      doSyncPoles,
      syncing,
      prettyPrintLatLong,
      openPoleRowId,
      doOpenPoleRow,
      openErrorRowRef,
      doOpenErrorRow,
      deleteUnsyncedPoles,
      doDeleteUnsyncedPole,
    };
  },
};
</script>
