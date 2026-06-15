<template>
  <div class="page">

    <!-- ===== Header ===== -->
    <div class="header">
      <h2>餐廳評分列表</h2>
      <p class="sub">查看所有餐廳的評分與排名</p>

      <!-- Bayesian 說明 -->
      <div class="formula">
        排名依據：
        Bayesian Rating =
        (v / (v + m)) × R + (m / (v + m)) × C
        <br />
        <span class="formula-sub">
          R=平均評分，v=評論數，C=全體平均，m=最低門檻(10)
        </span>
      </div>
    </div>

    <div class="rating-card">

      <LoadingSpinner v-if="isLoading" text="載入餐廳評分資料..." />

      <div v-else-if="errorMessage" class="text-danger text-center my-5">
        {{ errorMessage }}
      </div>

      <div v-else-if="!isLoading && list.length === 0 && !errorMessage" class="empty">
        尚無餐廳評分資料
      </div>

      <template v-else>

        <table class="rating-table desktop-only">
          <thead>
            <tr>
              <th>排名</th>
              <th>餐廳名稱</th>
              <th>評分</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="r in list" :key="r.restaurantUuid">

              <td class="rank">

                <FontAwesomeIcon v-if="r.rank === 1" :icon="['fas', 'crown']" class="rank-icon gold" />
                <FontAwesomeIcon v-else-if="r.rank === 2" :icon="['fas', 'medal']" class="rank-icon silver" />
                <FontAwesomeIcon v-else-if="r.rank === 3" :icon="['fas', 'medal']" class="rank-icon bronze" />

                <span v-else>
                  #{{ r.rank }}
                </span>

              </td>

              <td>{{ r.restaurantName }}</td>

              <td>
                <div class="rating-block">

                  <!-- 星星 -->
                  <ReviewStars :rating="r.avgRating" />

                  <span class="rating">
                    {{ r.avgRating ?? '-' }}
                  </span>

                  <!-- 評論數 -->
                  <span class="count">
                    ({{ r.reviewCount }})
                  </span>

                </div>
              </td>

            </tr>
          </tbody>
        </table>


        <div class="mobile-list mobile-only">

          <div v-for="r in list" :key="r.restaurantUuid" class="mobile-card">

            <div class="mobile-top">
              <div class="mobile-rank">

                <FontAwesomeIcon v-if="r.rank === 1" :icon="['fas', 'crown']" class="rank-icon gold" />
                <FontAwesomeIcon v-else-if="r.rank === 2" :icon="['fas', 'medal']" class="rank-icon silver" />
                <FontAwesomeIcon v-else-if="r.rank === 3" :icon="['fas', 'medal']" class="rank-icon bronze" />

                <span v-else>#{{ r.rank }}</span>
              </div>

              <div class="mobile-name">
                {{ r.restaurantName }}
              </div>
            </div>

            <div class="mobile-bottom">
              <ReviewStars :rating="r.avgRating" />

              <span class="rating">
                {{ r.avgRating ?? '-' }}
              </span>

              <span class="count">
                ({{ r.reviewCount }})
              </span>
            </div>

          </div>
        </div>

      </template>


      <Pagination v-if="meta" :page-info="meta" colorBg="#FFFFFF" colorText="#5A2A18" colorActiveBg="#E85D2A"
        colorActiveText="#fff" @update:page="handlePageChange" />

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message'

import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ReviewStars from '@/components/review/ReviewStars.vue'

import { useOwnerRestaurantRatingStore } from '@/stores/owner-restaurant-rating'


// route
const route = useRoute()
const router = useRouter()

// store
const store = useOwnerRestaurantRatingStore()

const {
  list,
  meta,
  isLoading
} = storeToRefs(store)

const { load } = store

// state

// 頁碼隨路由參數page變化
const page = computed(() => {
  const p = Number(route.query.page)
  return Number.isInteger(p) && p > 0 ? p : 1
})

// UI state
const errorMessage = ref<string | null>(null)


// 自動刷新
watch(
  () => [route.query.page],
  () => {
    refresh()

  },
  { immediate: true }
)

async function refresh() {
  errorMessage.value = null

  const result = await load(
    {
      page: page.value,
      limit: 10
    }
  )
  
  if (!result.ok) {
    errorMessage.value = resolveErrorMessage(
      result.error,
      '目前無法取得評論，請稍後再試'
    )
  }
}


function handlePageChange(p: number) {
  router.push({
    query: {
      ...route.query,
      page: p
    }
  })
}

</script>

<style scoped>
.page {
  padding: 20px;
}

/* ===== header ===== */
.header {
  margin-bottom: 16px;
}

.sub {
  color: #888;
  font-size: 0.9rem;
}

.formula {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #555;
  background: #fff7f2;
  padding: 8px 12px;
  border-radius: 8px;
}

.formula-sub {
  font-size: 0.8rem;
  color: #999;
}

/* ===== card ===== */
.rating-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

}

/* ===== TABLE (desktop) ===== */

.rating-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.rating-table th {
  text-align: left;
  padding: 10px;
  border-bottom: 2px solid #f0f0f0;
  color: #666;
}

.rating-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f5f5f5;
}

.rating-table td:nth-child(2) {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}

/* ===== MOBILE CARD ===== */

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}

.mobile-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mobile-name {
  font-weight: 600;
  margin-left: 8px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  min-width: 0;
  max-width: 100%;
}

.mobile-bottom {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ===== RANK / STARS (共用) ===== */

.rank {
  width: 60px;
  color: #999;
}

.rating-block {
  display: flex;
  align-items: center;
  gap: 6px;

  flex-wrap: wrap;
  min-width: 0;
}

.rating {
  font-weight: 600;
  color: #842B00;
  white-space: nowrap;
}

.count {
  color: #888;
  font-size: 0.85rem;
  white-space: nowrap;
}

.rank-icon {
  font-size: 1.2rem;
}

.gold {
  color: #FFD700;
}

.silver {
  color: #C0C0C0;
}

.bronze {
  color: #CD7F32;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #999;
}

/* ===== RESPONSIVE SWITCH ===== */

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {

  .page {
    padding: 12px;
  }

  .rating-card {
    padding: 12px;
    border-radius: 10px;
  }

  /* switch */
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .formula {
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .formula-sub {
    display: block;
    margin-top: 4px;
  }
}
</style>