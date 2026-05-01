<template>
<section class="card">
  <header class="card-header">
    <h2 class="h2">
      Select a customer
    </h2>
    <div class="card-header__actions">
      <nxt-button
        title="Refresh customers"
        icon-only
        icon-name="mdiCloudRefreshOutline"
        @click="doFetchCloudData"
      />
    </div>
  </header>
  <table class="tommaso-table tommaso-table--clickable">
    <thead>
      <tr>
        <th>Name</th>
        <th>Meter{{ isSingleMeterSetup ? '' : 's' }}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="customer in assignableCustomersWithDistance"
        :key="customer.id"
        @click="selectCustomer(customer)"
      >
        <td>
          {{ customer.full_name }}
        </td>
        <td>
          <div class="mini-pill-wrapper">
            <span v-if="customer.distanceToMe" class="mini-pill mini-pill--distance">
              <mdi-icon
                name="mdiCrosshairsGps"
                :scale="16"
              />
              {{ customer.formattedDistanceToMe }}
            </span>
            <span
              v-for="(meter, index) in inferMeterPills(customer)"
              :key="index"
              class="mini-pill"
              :class="[ meter.installed ? 'mini-pill--installed' : 'mini-pill--to-install' ]"
            >
              {{ isSingleMeterSetup ? meter.meter_phase === 'SINGLE_PHASE' ? 'Single Phase' : 'Three Phase' : meter.meter_type }}
              <mdi-icon
                v-if="meter.installed"
                :name="meter.unsynced ? 'mdiCellphone' : 'mdiCheckBold'"
                :scale="16"
              />
            </span>
          </div>
        </td>
        <td>
          <mdi-icon
            style="transform: rotate(-90deg);"
            name="mdiChevronDown"
            :scale="20"
          />
        </td>
      </tr>
    </tbody>
  </table>
</section>

<section class="card mt-1">
  <header class="card-header">
    <h2 class="h2">
      Unassignable customers
    </h2>
  </header>
  <table class="tommaso-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="customer in assignableAndBlockedCustomers.unassignable"
        :key="customer.id"
      >
        <td>
          {{ customer.full_name }}
        </td>
        <td>
          <div class="mini-pill-wrapper">
            <span
              v-if="!customer.connections.length"
              class="mini-pill mini-pill--warn"
            >
              No connection
            </span>
            <span
              v-else-if=!customer.hasPaidFees
              class="mini-pill mini-pill--warn"
            >
              Unpaid fees
            </span>
            <template v-else-if="!customer.hasMetersToInstall">
              <span
                v-for="(meter, index) in inferMeterPills(customer)"
                :key="index"
                class="mini-pill"
                :class="[ meter.installed ? 'mini-pill--installed' : 'mini-pill--to-install' ]"
              >
                {{ isSingleMeterSetup ? meter.meter_phase === 'SINGLE_PHASE' ? 'Single Phase' : 'Three Phase' : meter.meter_type }}
                <mdi-icon
                  v-if="meter.installed"
                  :name="meter.unsynced ? 'mdiCellphone' : 'mdiCheckBold'"
                  :scale="16"
                />
              </span>
            </template>
            <span
              v-else
              class="mini-pill mini-pill--warn"
            >
              Unknown
            </span>
          </div>
        </td>

      </tr>
    </tbody>
  </table>
</section>
</template>

<script>
import { computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useOnline } from '@vueuse/core';
import { useToast } from 'vue-toastification';
import { useCustomerStore } from '@/stores/customers';
import { usePolesStore } from '@/stores/poles';
import { useMyLocationStore } from '@/stores/my-location';
import { storeToRefs } from 'pinia';
import { compose, prop, reverse, sortBy } from 'ramda';
import distance from '@turf/distance';

// eslint-disable-next-line no-unused-vars
const sortByType = compose(
  reverse,
  sortBy(prop('meter_type')),
);

const sortByDistance = compose(
  sortBy(prop('distanceToMe')),
);

const formatDistanceToMe = distanceMeters => {
  if(distanceMeters > 100000) return '100+ km';
  if(distanceMeters > 20000) return Math.round(distanceMeters / 1000) + ' km';
  if(distanceMeters > 1000) return (Math.round(distanceMeters / 100) / 10) + ' km';
  return distanceMeters + ' m';
};

export default {
  setup() {
    const router = useRouter();
    const isOnline = useOnline();
    const $toast = useToast();
    const customersStore = useCustomerStore();
    const myLocationStore = useMyLocationStore();
    const polesStore = usePolesStore();
    const { isSingleMeterSetup, assignableAndBlockedCustomers } = storeToRefs(customersStore);

    const assignableCustomersWithDistance = computed(() => {
      if(!myLocationStore.longitude) return customersStore.assignableAndBlockedCustomers.assignable;
      const withDistance = customersStore.assignableAndBlockedCustomers.assignable
        .map(customer => {
          const kilometers = distance(
            [ myLocationStore.longitude, myLocationStore.latitude ],
            [ customer.longitude, customer.latitude ],
          );
          const meters = Math.round(kilometers * 1000);
          return {
            ...customer,
            distanceToMe: meters,
            formattedDistanceToMe: formatDistanceToMe(meters),
          };
        })
      ;
      return sortByDistance(withDistance);
    });

    const inferMeterPills = customer => {
      const meterTypesToInstall = customer.connections
        .flatMap(({ metersToInstall }) => metersToInstall)
        .map(({ meter_type, meter_phase }) => ({ meter_type, meter_phase, installed: false }))
      ;
      const meterTypesInstalled = customer.connections
        .flatMap(({ meters }) => meters)
        .map(({ meter_type, meter_phase, unsynced }) => ({ meter_type, meter_phase, unsynced, installed: true }))
      ;
      return [ ...meterTypesToInstall, ...meterTypesInstalled ];
    };

    customersStore.clearAssignment();

    const doFetchCloudData = () => {
      if(!isOnline.value) {
        $toast.warning('Can\'t sync when offline');
        return;
      }
      customersStore.fetchCloudCustomers();
      polesStore.fetchCloudPoles();
    };

    const selectCustomer = ({ id, connections }) => {
      customersStore.setCustomerIdForAssignment(id);
      if(connections.length === 1) {
        customersStore.setConnectionIdForAssignment(connections[0].id);
        router.push('/meters/assign/meter-number');
      }
      else {
        alert('NXT Field Ops currently cannnot handle customers with multiple connections!');
      }
    };

    myLocationStore.startLocationWatch({ waitForConfirm: false });

    onBeforeUnmount(myLocationStore.clearAllWatchers);

    return { isSingleMeterSetup, assignableCustomersWithDistance, assignableAndBlockedCustomers, inferMeterPills, doFetchCloudData, selectCustomer };
  },
};
</script>

<style lang="scss">
  .mini-pill-wrapper {
    display: flex;
    align-items: center;
    column-gap: 4px;
    row-gap: 4px;
    flex-wrap: wrap;
  }

  .mini-pill {
    display: flex;
    align-items: center;
    column-gap: 2px;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 8px 3px;
    color: $nxt-color-white;
    border-radius: 12px;
    text-wrap: nowrap;

    &--to-install {
      background-color: $nxt-color-blue-highlight;
    }

    &--installed {
      background-color: $nxt-color-success;
    }

    &--warn {
      background-color: $nxt-color-warn;
    }

    &--distance {
      background-color: $nxt-color-blue;
    }

    svg {
      margin-top: -3px;
      margin-bottom: -1px;
    }
  }
</style>
