import { defineStore } from 'pinia';

const IS_DEV = import.meta.env.DEV;
const MAXIMUM_WAIT_TIME = 60 * 1000;
const FINETUNING_TIME = 10 * 1000;
const ACCURACY_THRESHOLD = 10;
const ACCURACY_IMMEDIATE_ACCEPT_THRESHOLD = 5; // meters

let geoWatcher;
let finetuningTimeout;
let longTimeout;
let continueInBackgroundTimeout;

export const useMyLocationStore = defineStore('my-location', {
  state: () => ({
    _latitude: null,
    _longitude: null,
    _accuracy: null,
    _updatedAt: null,
    _status: {
      message: null,
      isWatching: false,
      isAcceptable: false,
    },
    _waitForConfirm: false,
  }),

  getters: {
    latitude: state => state._latitude,
    longitude: state => state._longitude,
    accuracy: state => state._accuracy,
    updatedAt: state => state._updatedAt,
    status: state => state._status,
    myLocation: state => ({
      latitude: state._latitude,
      longitude: state._longitude,
      accuracy: state._accuracy,
      updatedAt: state._updatedAt,
    }),
    accuracyColor: state => {
      if(!state._accuracy) return 'crimson';
      return state._accuracy >= 100 ? 'crimson'
        : state._accuracy <= ACCURACY_THRESHOLD ? '#18bd5b'
          : 'orange';
    },
    waitForConfirm: state => state._waitForConfirm,
  },

  actions: {
    startFineTuning() {
      this._status.message = 'Finetuning accuracy...';
      finetuningTimeout = setTimeout(() => {
        this.allowNext('Acceptable accuracy');
      }, FINETUNING_TIME);
    },

    onGeoUpdate({ coords: { latitude, longitude, accuracy } }) {
      this._latitude = latitude;
      this._longitude = longitude;
      this._accuracy = accuracy;
      this._updatedAt = new Date();

      if(this._status.isAcceptable) return;

      if(IS_DEV) {
        this.allowNext('Allowed because in DEVELOPMENT mode');
      }
      else if(accuracy <= ACCURACY_IMMEDIATE_ACCEPT_THRESHOLD) {
        this.allowNext('Good accuracy');
      }
      else if(accuracy <= ACCURACY_THRESHOLD) {
        if(!finetuningTimeout) this.startFineTuning();
      }
      else {
        clearTimeout(finetuningTimeout);
        this._status.message = `Accuracy improving. Must be less than ${ ACCURACY_THRESHOLD } m.`;
      }
    },

    onGeoError(err) {
      this._status.message = `Error: ${ err.message }`;
    },

    stopLocationWatch() {
      navigator.geolocation.clearWatch(geoWatcher);
      this._status.isWatching = false;
      this._waitForConfirm = false;
      clearTimeout(continueInBackgroundTimeout);
    },

    startLocationWatch({ waitForConfirm = false }) {
      if(!navigator?.geolocation) {
        this._status.message = 'Geolocation is not supported by your browser.';
        return;
      }

      this.status.isAcceptable = false;
      this._status.isWatching = true;
      this._waitForConfirm = waitForConfirm;
      this._status.message = 'Determining your location...';

      geoWatcher = navigator.geolocation.watchPosition(this.onGeoUpdate, this.onGeoError, { enableHighAccuracy: true });

      // The long timeout lets accuracy pass if we've waited a long time
      longTimeout = setTimeout(() => {
        if(this._longitude) {
          this.allowNext('Accuracy could not be improved any further.');
        }
        else {
          this._status.message = 'Couldn\'t get a location';
        }
        this.stopLocationWatch();
      }, MAXIMUM_WAIT_TIME);
    },

    allowNext(statusText) {
      clearTimeout(finetuningTimeout);
      clearTimeout(longTimeout);
      this._status.isAcceptable = true;
      this._status.message = statusText;

      if(!this._waitForConfirm)
        continueInBackgroundTimeout = setTimeout(() => {
          this.stopLocationWatch();
          this._status.message = null;
        }, FINETUNING_TIME);
    },

    clearAllWatchers() {
      clearTimeout(finetuningTimeout);
      clearTimeout(longTimeout);
      this.stopLocationWatch();
      this._status.message = null;
    },
  },

  persist: {
    pick: [ '_latitude', '_longitude', '_accuracy', '_updatedAt' ],
    afterHydrate: ({ store }) => {
      store._updatedAt = new Date(store._updatedAt);
    },
  },
});
