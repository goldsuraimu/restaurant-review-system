<template>
  <div class="owner-layout">
    <!-- 手機版 Header -->
    <header class="mobile-header">
      <button class="menu-btn" @click="toggleSidebar">☰</button>
      <span class="mobile-title">業者後台</span>
    </header>

    <!-- 遮罩（手機用） -->
    <div v-if="isSidebarOpen" class="overlay" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <h3 class="sidebar-title">業者後台</h3>

      <ul class="menu-main">
        <li>
          <RouterLink :to="{ name: 'OwnerDashboard' }" class="sidebar-link" active-class="active" @click="closeSidebar">
            Dashboard
          </RouterLink>
        </li>

        <li>
          <RouterLink :to="{ name: 'OwnerRestaurants' }" class="sidebar-link" active-class="active"
            @click="closeSidebar">
            我的餐廳
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

    <!-- 主要內容 -->
    <section class="main-content">
      <RouterView />
    </section>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth';

const router = useRouter()

const authStore = useAuthStore();

const isSidebarOpen = ref(false)


async function logout () {
  await authStore.logout()
  closeSidebar()
  router.push({ name: 'Login' })
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleResize() {
  if (window.innerWidth > 768) {
    closeSidebar()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

</script>

<style scoped>
.owner-layout {
  display: flex;
  min-height: 100vh;
  background-color: #FFF6F1;
}

/* ===== Sidebar ===== */
.sidebar {
  width: 220px;
  background: #FFF0E8;
  border-right: 1px solid #F2D4C7;
  border-radius: 0 20px 20px 0;
  padding: 30px 20px;
}

.sidebar-title {
  text-align: center;
  color: #5A2A18;
  font-weight: 700;
  margin-bottom: 30px;
}

.menu-main,
.menu-secondary {
  list-style: none;
  padding: 0;
}

.menu-secondary {
  margin-top: 40px;
}

.sidebar-link {
  display: block;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  color: #5A2A18;
  transition: all .2s ease;
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

/* ===== Main Content ===== */
.main-content {
  flex: 1;
  padding: 30px;

  min-width: 0
}

/* ===== 手機版 ===== */
.mobile-header {
  display: none;
}

/* 遮罩 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9;
}

/* RWD */
@media (max-width: 768px) {
  .owner-layout {
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background-color: #FFCBB3;
    color: #842B00;
    font-weight: bold;
  }

  .menu-btn {
    font-size: 22px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 10;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    padding: 20px;
  }
}
</style>
