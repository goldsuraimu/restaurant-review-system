<template>
  <li class="item skeleton-item">

    <div class="left">
      <div class="skeleton skeleton-name"></div>
      <div class="skeleton skeleton-meta"></div>
    </div>

    <div class="actions">
      <div class="skeleton skeleton-btn"></div>
      <div class="skeleton skeleton-btn"></div>
      <div class="skeleton skeleton-btn"></div>
    </div>

  </li>
</template>

<style scoped>
.skeleton-item {
  pointer-events: none;
}

.left {
  flex: 1;
  min-width: 0;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 名稱 */
.skeleton-name {
  width: 180px;
  height: 18px;
  margin-bottom: 8px;
}

/* meta */
.skeleton-meta {
  width: 260px;
  height: 14px;
}

/* 按鈕 */
.skeleton-btn {
  width: 64px;
  height: 32px;
  border-radius: 8px;
}
</style>