<template>
  <div class="card review-card  mb-3 p-3">

    <!-- header -->
    <div class="header">
      <!-- <div class="skeleton avatar"></div> -->

      <div class="header-info">
        <div class="skeleton name"></div>
        <div class="skeleton time"></div>
      </div>

      <div class="skeleton rating"></div>
    </div>

    <!-- content -->
    <div class="content">
      <div class="skeleton line"></div>
      <div class="skeleton line short"></div>
    </div>

    <!-- images -->
    <div class="images">
      <div v-for="i in 3" :key="i" class="skeleton img"></div>
    </div>

    <!-- reply -->
    <div class="reply">
      <div class="skeleton reply-title"></div>
      <div class="skeleton line"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.review-card {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
}

/* header */
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.header-info {
  flex: 1;
}

.name {
  width: 120px;
  height: 12px;
  margin-bottom: 6px;
}

.time {
  width: 80px;
  height: 10px;
}

.rating {
  width: 50px;
  height: 12px;
}

/* content */
.line {
  height: 12px;
  margin-bottom: 6px;
}

.line.short {
  width: 70%;
}

/* images */
.images {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

/* reply */
.reply {
  margin-top: 12px;
}

.reply-title {
  width: 100px;
  height: 10px;
  margin-bottom: 6px;
}
</style>