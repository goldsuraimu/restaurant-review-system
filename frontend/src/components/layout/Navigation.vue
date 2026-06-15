<template>
  <header>
    <nav class="navbar navbar-light bg-light">
      <div class="container">
        <RouterLink class="navbar-brand" :to="{ name: 'Home' }">
          <img src="/restaurant-list-logo.png"
            width="30" height="30" class="d-inline-block align-top" alt="我的餐廳清單">
          我的餐廳清單
        </RouterLink>
        <p class="mt-2" v-if="authUser && isAuthenticated">
          <span class="username router-link" @click="toggleSidebar">
            歡迎! {{ authUser.nickname ? authUser.nickname : authUser.username }}
          </span>
        </p>
        <p class="mt-2" v-else>
          <RouterLink class="no-underline  router-link" :to="{ name: 'Login' }">登入</RouterLink>
          /
          <RouterLink class="no-underline  router-link" :to="{ name: 'Register' }">註冊</RouterLink>
        </p>
      </div>
      <!-- 側邊欄 -->
      <div v-if="showSidebar && authUser && isAuthenticated" class="sidebar-overlay" @click.self="closeSidebar">
        <div class="sidebar">
          <h5 class="mb-3">你好! {{ authUser.nickname ? authUser.nickname : authUser.username }}</h5>
          <ul>
            <li>
              <FontAwesomeIcon :icon="['fas', 'address-card']" class="me-2" />
              <RouterLink :to="{ name: 'UserProfile' }" @click="closeSidebar">個人資料</RouterLink>
            </li>

            <li v-if="canApplyBecomeOwner">
              <FontAwesomeIcon :icon="['fas', 'store']" class="me-2" />

              <RouterLink :to="{ name: 'BecomeOwner' }" @click="closeSidebar">
                成為店主
              </RouterLink>
            </li>

            <li v-if="canAccessDashboard">
              <FontAwesomeIcon :icon="['fas', 'gauge-high']" class="me-2" />

              <RouterLink :to="dashboardRoute" @click="closeSidebar">
                後台管理
              </RouterLink>
            </li>

            <li>
              <FontAwesomeIcon :icon="['fas', 'arrow-right-from-bracket']" class="me-2" />
              <a href="#" @click.prevent="logout">登出</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, type RouteLocationRaw, } from 'vue-router'

import { useAuthStore } from '@/stores/auth';

import {
  canAccessOwnerDashboard,
  canBecomeOwner,
  isAdmin,
} from '@/utils/permissions/user-permissions'


const authStore = useAuthStore();
const { isAuthenticated, authUser } = storeToRefs(authStore);
const router = useRouter()

// 控制側邊欄顯示
const showSidebar = ref(false)

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}
const closeSidebar = () => {
  showSidebar.value = false
}

// 是否可申請店主
const canAccessDashboard = computed(() => {
  return authUser.value ? canAccessOwnerDashboard(authUser.value.role) : false
})

const canApplyBecomeOwner = computed(() => {
  return authUser.value ? canBecomeOwner(authUser.value.role) : false
})

// 後台路由
const dashboardRoute = computed<RouteLocationRaw>(() => {

  if (isAdmin(authUser.value?.role)) {
    return {
      name: 'AdminDashboard',
    }
  }

  return {
    name: 'OwnerDashboard',
  }
})

const logout = async() => {
  await authStore.logout()
  closeSidebar()
  router.push({ name: 'Login' })
}


</script>

<style scoped>
.no-underline {
  text-decoration: none;
}

.router-link {
  color: #000;
  border-bottom: 1px solid transparent;
  transition: 
    border-bottom 0.2s linear,
    color 0.2s linear;
}

.router-link:hover{
  border-bottom: 1px solid #4592af;
  color: #4592af;
} 

.username {
  cursor: pointer;
  color: #000;
  font-weight: bold;
}

.username:hover {
  color: #4592af;
}

/* 側邊欄樣式 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
  z-index: 1050;
}

.sidebar {
  width: 250px;
  background: #fce2cf;
  padding: 20px;
  height: 100%;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 15px 0;
}

.sidebar a {
  color: #000;
  text-decoration: none;
}

.sidebar a:hover {
  color: #4592af;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>