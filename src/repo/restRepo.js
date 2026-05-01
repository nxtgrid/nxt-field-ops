import { baseOpsRestRepo } from '@nxt/libraries/api-connection';

export const restRepo = {
  ...baseOpsRestRepo,

  assignMeter(json) {
    return this.fetcher
      .post('meters/assign-one', { json, timeout: 30000 })
      .json()
      .catch(this.unwrapError)
    ;
  },
};
