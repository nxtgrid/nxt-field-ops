<template>
<div class="metering-hw-status">
  <span
    class="metering-hw-status__icon"
    :class="`metering-hw-status--${ displayStatus.color }`"
  >
    <mdi-icon :name="displayStatus.icon"/>
  </span>
  <span>
    {{ displayStatus.text }}
  </span>
</div>
</template>

<script>
import { compoundInstallStatus } from '@nxt/libraries/metering-helpers';

export default {
  props: {
    meter: {
      type: Object,
      required: true,
    },
  },

  computed: {
    displayStatus() {
      const installStatus = compoundInstallStatus(
        false,
        this.meter.metering_hardware_install_sessions?.metering_hardware_imports?.metering_hardware_import_status,
        this.meter.metering_hardware_install_sessions?.meter_commissionings?.meter_commissioning_status,
      );

      if(installStatus === 'SUCCESSFUL') return {
        text: 'Installed',
        color: 'green',
        icon: 'mdiCheckAll',
      };
      if(installStatus === 'FAILED') return {
        text: 'Install failed',
        color: 'red',
        icon: 'mdiCloseThick',
      };
      if(installStatus === null) return {
        text: 'Install status unknown',
        color: 'orange',
        icon: 'mdiAlertOutline',
      };
      return {
        text: installStatus === 'PENDING' ? 'Processing...' : 'Installing...',
        color: 'blue',
        icon: 'mdiClockOutline',
      };
    },
  },
};
</script>

<style lang="scss">
.metering-hw-status {
  display: flex;
  column-gap: 4px;
  align-items: center;

  &__icon {
    position: relative;
    width: 24px;
    height: 16px;
    flex-shrink: 0;

    svg {
      position: absolute;
      top: -6px;
    }
  }

  &--green {
    color: $nxt-color-success;
  }

  &--orange {
    color: $nxt-color-warn;
  }

  &--red {
    color: $nxt-color-error;
  }

  &--blue {
    color: $nxt-color-blue-highlight;
  }
}
</style>
