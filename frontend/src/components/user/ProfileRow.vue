<template>
  <div class="mb-3 row">
    <label class="col-sm-2 col-form-label">{{ label }}:</label>
    <div class="col-10 col-sm-8 col-lg-8 d-flex align-items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>
