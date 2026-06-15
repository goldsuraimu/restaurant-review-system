<template>
  <div class="admin-dashboard">
    <h1>管理員後台</h1>

    <div class="cards">

      <div class="card">
        <h3>待審核餐廳</h3>
        <p class="count">{{ pendingCount }}</p>

        <RouterLink :to="{ name: 'AdminRestaurantReview' }" class="btn">
          前往審核
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useAdminDashboardStore,
} from '@/stores/admin-dashboard'

const dashboardStore = useAdminDashboardStore()

const {
  summary,
} = storeToRefs(dashboardStore)

const pendingCount =
  computed(() => {
    return (
      summary.value
        ?.pendingRestaurantCount
      ?? 0
    )
  })

onMounted(async () => {
  await dashboardStore.loadSummary()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 30px;
}

.cards {
  display: flex;
  gap: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 220px;
}

.count {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
}

.btn {
  display: inline-block;
  background: #E85D2A;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  text-decoration: none;
}
</style>