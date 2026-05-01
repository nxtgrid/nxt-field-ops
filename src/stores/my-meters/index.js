import { defineStore } from 'pinia';
import { useAccountStore } from '@nxt/libraries/api-connection';

import { supabaseRepo } from '@/repo/supabaseRepo';

export const useMyMetersStore = defineStore('my-meters', {
  state: () => ({
    _myMeters: [],
  }),

  getters: {
    myMeters: state => state._myMeters,
  },

  actions: {
    fetchMyMeters() {
      const accountStore = useAccountStore();
      const grid_id = accountStore.myProfile.busy_commissioning?.id;
      if(!grid_id) return;
      supabaseRepo
        .getMyMeters(grid_id, accountStore.myProfile.id)
        .then(meters => this._myMeters = meters)
      ;
    },
  },
});
