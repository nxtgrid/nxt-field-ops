import { omit, prop } from 'ramda';
import { defineStore } from 'pinia';
import { supabaseRepo } from '@/repo/supabaseRepo';
import { useAccountStore } from '@nxt/libraries/api-connection';


export const usePolesStore = defineStore('poles', {
  state: () => ({
    _cloudPoles: [],
    _unsyncedPoles: [],
  }),

  getters: {
    cloudPoles: state => state._cloudPoles,
    unsyncedPoles: state => state._unsyncedPoles,
    allPoleReferences: state => [
      ...state._cloudPoles.map(prop('external_reference')),
      ...state._unsyncedPoles.map(prop('external_reference')),
    ],
  },

  actions: {
    fetchCloudPoles() {
      const grid_id = useAccountStore().myProfile.busy_commissioning?.id;
      if(!grid_id) return;
      supabaseRepo.client
        .from('poles')
        .select(`
          id,
          external_reference,
          location_geom,
          location_accuracy,
          meters(
            external_reference
          )
        `)
        .match({ grid_id })
        .then(supabaseRepo.handleResponse)
        .then(poles => { this._cloudPoles = poles; })
      ;
    },

    async uploadPoles() {
      const promiseArray = this._unsyncedPoles.map(pole => supabaseRepo.client
        .from('poles')
        .insert(omit([ 'syncError' ], pole))
        .select('id').maybeSingle()
        .then(supabaseRepo.handleResponse)
        .then(({ id }) => {
          // We tag the LOCAL pole with the id when successful
          pole.id = id;
        })
        .catch(err => {
          pole.syncError = err.message;
          console.error(`Error uploading pole with tag ${ pole.external_reference }`, err);
        }),
      );
      await Promise.allSettled(promiseArray);
      // We can now filter out all LOCAL poles that have an id,
      // since they were successfully uploaded
      this._unsyncedPoles = this._unsyncedPoles.filter(({ id }) => !id);
      // Refetch now uploaded poles
      this.fetchCloudPoles();
    },

    clearCloudPoles() {
      this._cloudPoles = [];
    },

    addUnsyncedPole(pole) {
      this._unsyncedPoles = [ ...this._unsyncedPoles, pole ];
    },

    clearUnsyncedPoles() {
      this._unsyncedPoles = [];
    },

    removeUnsyncedPole(reference) {
      this._unsyncedPoles = this._unsyncedPoles
        .filter(({ external_reference }) => external_reference !== reference );
    },
  },

  persist: true,
});
