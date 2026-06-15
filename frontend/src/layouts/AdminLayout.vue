<template>
  <div class="admin-layout">

    <!-- 手機 header -->
    <header class="mobile-header">
      <button class="menu-btn" @click="toggleSidebar">☰</button>
      <span>管理後台</span>
    </header>

    <div v-if="isOpen" class="overlay" @click="closeSidebar"></div>

    <aside class="sidebar" :class="{ open: isOpen }">
      <h3 class="sidebar-title">管理後台</h3>

      <ul class="menu-main">
        <li>
          <RouterLink :to="{ name: 'AdminDashboard' }" class="sidebar-link" 
          active-class="active"
          @click="closeSidebar">
            Dashboard
          </RouterLink>
        </li>

        <li>
          <RouterLink :to="{ name: 'AdminRestaurantReview' }" class="sidebar-link" 
          active-class="active"
          @click="closeSidebar">
            餐廳審核
          </RouterLink>
        </li>
      </ul>

      <ul class="menu-secondary">
        <li>
          <RouterLink :to="{ name: 'Home' }" class="sidebar-link sidebar-link--secondary" @click="closeSidebar">
            回到首頁
          </RouterLink>
        </li>

        <li>
          <a href="#" class="sidebar-link sidebar-link--secondary" @click.prevent="logout">
            登出
          </a>
        </li>
      </ul>
    </aside>

    <main class="content">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

const router = useRouter()

const authStore = useAuthStore();

const isOpen = ref(false)

function toggleSidebar() {
  isOpen.value = !isOpen.value
}

async function logout() {
  await authStore.logout()
  closeSidebar()
  router.push({ name: 'Login' })
}

function closeSidebar() {
  isOpen.value = false
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #FFF6F1;
}

.sidebar {
  width: 220px;
  background: #FFF0E8;
  border-right: 1px solid #F2D4C7;
  padding: 30px 20px;
}

.sidebar-title {
  text-align: center;
  color: #5A2A18;
  font-weight: 700;
  margin-bottom: 30px;
}

.sidebar-link {
  display: block;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  color: #5A2A18;
  text-decoration: none;
}

.sidebar-link:hover {
  background: #FFE1D4;
}

.sidebar-link.active {
  background: #E85D2A;
  color: white;
}

.sidebar-link--secondary {
  opacity: 0.7;
  font-weight: normal;
}

.menu-main,
.menu-secondary {
  list-style: none;
  padding: 0;
}

.menu-secondary {
  margin-top: 40px;
}

.content {
  flex: 1;
  padding: 30px;

  min-width: 0
}

.mobile-header {
  display: none;
}

.menu-btn {
  font-size: 22px;
  background: none;
  border: none;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background: #FFCBB3;
    color: #842B00;
    font-weight: bold;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    transform: translateX(-100%);
    transition: .3s;
    z-index: 1050;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>