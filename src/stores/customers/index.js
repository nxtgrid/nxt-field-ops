import { defineStore } from 'pinia';
import { wait } from '@nxt/libraries/wait';
import { useAccountStore } from '@nxt/libraries/api-connection';
import { supabaseRepo } from '@/repo/supabaseRepo';
import { restRepo } from '@/repo/restRepo';
import { getAssignableCustomers, getAssignableCustomers_SM, inferMetersToInstallPerConnection } from './helpers/get-assignable-customers';
import { mergeUnsyncedMetersOnCloudCustomers } from './helpers/merge-unsynced-meters-on-cloud-customers';

const INITIAL_ASSIGNMENT = {
  customer_id: null,
  connection_id: null,
  pole_id: null,

  external_reference: '',
  meter_type: null,
  meter_phase: null,

  syncStatus: 'PENDING',
  syncError: undefined,
};

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    _cloudCustomers: [],
    _unsyncedMeters: [],
    _unassignedMeters: [],
    _assignment: { ...INITIAL_ASSIGNMENT },
    // @DUAL-SUPPORT
    _isSingleMeterSetup: false,
  }),

  getters: {
    cloudCustomers: state => state._cloudCustomers,
    unsyncedMeters: state => state._unsyncedMeters,
    unassignedMeters: state => state._unassignedMeters,
    customersWithAllMeters: state => mergeUnsyncedMetersOnCloudCustomers(state._cloudCustomers, state._unsyncedMeters),
    assignableAndBlockedCustomers(state) {
      return state._isSingleMeterSetup ? getAssignableCustomers_SM(this.customersWithAllMeters)
        : getAssignableCustomers(this.customersWithAllMeters);
    },
    getCustomerById: state => _id => state._cloudCustomers
      .find(({ id }) => id === _id),

    // Assignment
    assignment: state => state._assignment,
    customerForMeterAssignment(state) {
      return this.customersWithAllMeters
        .find(({ id }) => id === state._assignment.customer_id);
    },
    connectionForMeterAssignment(state) {
      const connection = this.customerForMeterAssignment?.connections
        .find(({ id }) => id === state._assignment.connection_id);
      return inferMetersToInstallPerConnection(connection);
    },
    allCloudMeterNumbers: state => state._cloudCustomers
      .flatMap(({ connections }) => connections
        .flatMap(({ meters }) => meters
          .map(({ external_reference }) => external_reference))),
    allUnsyncedMeterNumbers: state => state._unsyncedMeters
      .map(({ external_reference }) => external_reference),
    // @DUAL-SUPPORT
    isSingleMeterSetup: state => state._isSingleMeterSetup,
  },

  actions: {
    fetchCloudCustomers() {
      const grid_id = useAccountStore().myProfile.busy_commissioning?.id;
      if(!grid_id) return;
      supabaseRepo
        .fetchAllGridData(grid_id)
        .then(({ uses_dual_meter_setup, customers, unassignedMeters }) => {
          // @DUAL-SUPPORT
          this._isSingleMeterSetup = !uses_dual_meter_setup;
          this._unassignedMeters = unassignedMeters;
          this._cloudCustomers = customers;
        })
      ;
    },

    setCustomerIdForAssignment(id) {
      this._assignment.customer_id = id;
    },

    setConnectionIdForAssignment(id) {
      this._assignment.connection_id = id;
    },

    setPoleIdForAssignment(id) {
      this._assignment.pole_id = id;
    },

    setExternalReferenceForAssignment(reference) {
      this._assignment.external_reference = reference;
    },

    setMeterTypeForAssignment(type) {
      this._assignment.meter_type = type;
    },

    setMeterPhaseForAssignment(phase) {
      this._assignment.meter_phase = phase;
    },

    clearAssignment() {
      this._assignment = { ...INITIAL_ASSIGNMENT };
    },

    storeAssignedMeter() {
      this._unsyncedMeters = [ ...this._unsyncedMeters, { ...this._assignment } ];
      this.clearAssignment();
    },

    clearUnsyncedMeters() {
      this._unsyncedMeters = [];
    },

    removeUnsyncedMeter(reference) {
      this._unsyncedMeters = this._unsyncedMeters
        .filter(({ external_reference }) => external_reference !== reference );
    },

    async uploadUnsyncedMeters() {
      const allPromises = this._unsyncedMeters
        .map(meter => restRepo
          .assignMeter(meter)
          .then(() => {
            meter.syncStatus = 'SUCCESSFUL';
            return meter.syncStatus;
          })
          .catch(err => {
            console.error('Error syncing meter', err);
            meter.syncStatus = 'FAILED';
            meter.syncError = err.message;
            return meter.syncStatus;
          }),
        )
      ;

      const syncResults = await Promise.allSettled(allPromises);
      await wait(1000); // Extra wait for clear interface

      this._unsyncedMeters = this._unsyncedMeters
      // To clean up, we filter out all successful uploads
        .filter(({ syncStatus }) => syncStatus !== 'SUCCESSFUL')
      // We also reset all sync statuses of the remaining unsynced meters
        .map(meter => ({ ...meter, syncStatus: 'PENDING' }))
      ;
      // And then we refetch the cloud data to have everything fresh
      this.fetchCloudCustomers();

      return syncResults.reduce((accObj, { status, value }) => {
        if(status === 'fulfilled' && value === 'SUCCESSFUL')
          return { ...accObj, successful: accObj.successful + 1 };
        return { ...accObj, failed: accObj.failed + 1 };
      }, { successful: 0, failed: 0 });
    },
  },

  persist: true,
});
