<template>
    <div class="skeleton stat-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-number"></div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.stat-card {
  padding: 16px;
  border-radius: 14px;
  text-align: center;
}

/* blocks */
.skeleton-title {
  width: 60%;
  height: 12px;
  margin: 0 auto 10px;
  border-radius: 6px;
}

.skeleton-number {
  width: 40%;
  height: 24px;
  margin: 0 auto;
  border-radius: 6px;
}
</style>