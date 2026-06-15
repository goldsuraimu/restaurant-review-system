<template>
  <header>
    <nav class="navbar navbar-light bg-light">
      <div class="container">
        <RouterLink class="navbar-brand" :to="{ name: 'Home' }">
          <img src="/restaurant-list-logo.png"
            width="30" height="30" class="d-inline-block align-top" alt="我的餐廳清單">
          我的餐廳清單
        </RouterLink>
      </div>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
