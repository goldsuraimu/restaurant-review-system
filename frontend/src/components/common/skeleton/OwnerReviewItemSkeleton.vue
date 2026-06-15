<template>
  <li class="review-skeleton">

    <div class="review-content">

      <!-- header -->
      <div class="review-header">
        <div class="skeleton-box name skeleton"></div>
        <div class="skeleton-box stars skeleton"></div>
      </div>

      <!-- restaurant -->
      <div v-if="showRestaurant" class="skeleton-box restaurant skeleton"></div>

      <!-- content -->
      <div class="skeleton-box line skeleton"></div>
      <div class="skeleton-box line short skeleton"></div>

      <!-- images -->
      <div class="skeleton-images">
        <div v-for="i in 3" :key="i" class="skeleton-box img skeleton"></div>
      </div>

      <!-- time -->
      <div class="skeleton-box time skeleton"></div>

    </div>

    <!-- reply -->
    <div class="owner-reply-skeleton">
      <div class="skeleton-box reply-title skeleton"></div>
      <div class="skeleton-box reply-line skeleton"></div>
    </div>

  </li>
</template>

<script setup lang="ts">
defineProps<{ showRestaurant?: boolean }>()
</script>

<style scoped>
.review-skeleton {
  background: #FFE7DB;
  padding: 15px 20px;
  border-radius: 15px;

  display: block;
}

/* skeleton shape only */
.skeleton-box {
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
}

/* header */
.name {
  width: 120px;
  height: 14px;
}

.stars {
  width: 80px;
  height: 12px;
}

/* restaurant */
.restaurant {
  width: 140px;
  height: 12px;
  margin-top: 6px;
}

/* content */
.line {
  height: 12px;
  margin-top: 8px;
  width: 100%;
}

.short {
  width: 70%;
}

/* images */
.skeleton-images {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.img {
  width: 60px;
  height: 60px;
}

/* time */
.time {
  width: 100px;
  height: 10px;
  margin-top: 10px;
}

/* reply */
.owner-reply-skeleton {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 217, 192, 0.4);
}

.reply-title {
  width: 120px;
  height: 12px;
  margin-bottom: 8px;
}

.reply-line {
  width: 80%;
  height: 12px;
}
</style>