<template>
  <div class="container">
    <div class="col-12 col-md-10 mx-auto">

      <!-- title -->
      <div class="skeleton skel-title"></div>

      <!-- rating -->
      <div class="skeleton skel-line w-40"></div>

      <!-- info rows -->
      <div class="skeleton skel-line w-60"></div>
      <div class="skeleton skel-line w-80"></div>
      <div class="skeleton skel-line w-50"></div>

      <!-- description -->
      <div class="skeleton skel-line"></div>
      <div class="skeleton skel-line"></div>
      <div class="skeleton skel-line w-70"></div>

      <!-- image block -->
      <div class="skeleton skel-image"></div>

    </div>
  </div>
</template>

<style scoped>
.skel-title {
  width: 60%;
  height: 28px;
  margin-bottom: 16px;
}

.skel-line {
  height: 14px;
  margin-bottom: 10px;
}

.w-40 {
  width: 40%;
}

.w-50 {
  width: 50%;
}

.w-60 {
  width: 60%;
}

.w-70 {
  width: 70%;
}

.w-80 {
  width: 80%;
}

.skel-image {
  width: 100%;
  height: 200px;
  margin-top: 20px;
  border-radius: 12px;
}
</style>