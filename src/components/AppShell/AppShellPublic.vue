<template>
<main class="center-content">
  <router-view :key="route.path" class="centered-route" />
</main>
</template>

<script>
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    return { route };
  },
};
</script>

<style lang="scss">
.centered-route {
  width: $dashboard-content-width-mobile;
  max-width: 460px;
}
</style>
