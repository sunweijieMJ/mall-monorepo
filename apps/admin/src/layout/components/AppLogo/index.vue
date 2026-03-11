<template>
  <img
    v-if="showIcon"
    src="@/assets/images/common/logo.png"
    alt="Logo"
    class="logo-image"
  />
  <h1 v-if="showTitle && title" class="logo-text">{{ title }}</h1>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  showIcon?: boolean;
  showTitle?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '',
  showIcon: true,
  showTitle: true,
});
</script>

<style scoped lang="scss">
.logo-image {
  width: 36px;
  height: 36px;
  object-fit: cover;
}

.logo-text {
  color: var(--colorTextHeading);
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}
</style>
