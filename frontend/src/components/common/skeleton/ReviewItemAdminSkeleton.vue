<template>
  <li class="review-item">
      <div class="review-content">

        <div class="review-header">
          <div class="skeleton skeleton-name"></div>
          <div class="skeleton skeleton-stars"></div>
        </div>

        <div v-for="i in 2" :key="i" class="skeleton skeleton-line"></div>

        <div class="skeleton-images">
          <div v-for="i in 3" :key="i" class="skeleton skeleton-img"></div>
        </div>

        <div class="skeleton skeleton-time"></div>

      </div>
  </li>
</template>

<script setup lang="ts">
</script>

<style scoped>
.review-item {
  background: #FFE7DB;
  padding: 15px 20px;
  border-radius: 15px;
}

.skeleton-name {
  width: 120px;
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-stars {
  width: 80px;
  height: 12px;
  margin-bottom: 10px;
}

.skeleton-line {
  height: 12px;
  margin-bottom: 6px;
}

.skeleton-images {
  display: flex;
  gap: 6px;
  margin: 8px 0;
}

.skeleton-img {
  width: 60px;
  height: 60px;
}

.skeleton-time {
  width: 100px;
  height: 10px;
  margin-top: 8px;
}
</style>