<template>
  <div v-if="!isAuthenticated" class="login-prompt alert-container">
    <p class="message-text">請先登入以發表評論。</p>
    <RouterLink :to="{ name: 'Login', query: { redirect: route.fullPath } }" class="btn-login">立即登入</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const route = useRoute();
</script>

<style scoped>
.alert-container {
  margin-top: 20px;
  padding: 20px;
  font-size: 1rem;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.message-text {
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
}

.btn-login {
  display: inline-block;
  background-color: #9b4b4b;
  color: #fff;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background-color: #842B00;
  color: #fff;
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-login:focus {
  outline: none;
  box-shadow: 0 0 3px 3px rgba(0, 123, 255, 0.6);
}
</style>