<template>
  <div class="col">
    <div class="card mb-3">

      <!-- 圖片 -->
      <div class="skeleton skeleton-img"></div>

      <div class="card-body p-3">

        <!-- 名稱 -->
        <div class="skeleton skeleton-title"></div>

        <!-- 分類 -->
        <div class="skeleton skeleton-category"></div>

        <!-- 評分 -->
        <div class="skeleton skeleton-badge"></div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-img {
  width: 100%;
  height: 160px;
  border-radius: 0;
}

.skeleton-title {
  width: 70%;
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-category {
  width: 50%;
  height: 12px;
  margin-bottom: 10px;
}

.skeleton-badge {
  width: 60px;
  height: 20px;
  border-radius: 999px;
}
</style>