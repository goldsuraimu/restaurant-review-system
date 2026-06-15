<template>
  <div id="dashboard-panel">
    <h1 class="title">業者後台</h1>

    <!-- KPI 分區（OVERVIEW + HEALTH + PERFORMANCE） -->

    <!-- ===== OVERVIEW ===== -->
    <div class="section">
      <h3>概覽</h3>

      <!-- Skeleton -->
      <div v-if="isFetching" class="stats">
        <SkeletonStatCard v-for="i in 3" :key="i" />
      </div>

      <div v-else class="stats">
        <div class="stat-card">
          <h4>我的餐廳</h4>
          <p class="stat-number">{{ kpi.restaurantCount }}</p>
        </div>

        <div class="stat-card">
          <h4>今日新增評論</h4>
          <p class="stat-number">{{ kpi.todayReviewsCount }}</p>
        </div>

        <div class="stat-card">
          <h4>平均評分</h4>
          <p class="stat-number" :class="avgRatingLevel">
            <FontAwesomeIcon :icon="['fas', avgRatingIcon]" class="icon" />
            {{ kpi.avgRating }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- ===== HEALTH ===== -->
    <div class="section">
      <h3>營運健康度</h3>

      <div v-if="isFetching" class="stats">
        <SkeletonStatCard v-for="i in 4" :key="i" />
      </div>

      <div v-else class="stats">
        <div class="stat-card">
          <h4>待回覆評論</h4>
          <p class="stat-number" :class="unrepliedLevel">{{ kpi.unrepliedCount }}</p>
        </div>

        <div class="stat-card">
          <h4>回覆率</h4>
          <p class="stat-number" :class="replyRateLevel">
            <FontAwesomeIcon :icon="['fas', replyRateIcon]" class="icon" />
            {{ replyRateText }}
          </p>
        </div>

        <div class="stat-card">
          <h4>慢回覆率</h4>
          <p class="stat-number" :class="slowReplyRateLevel">
            <FontAwesomeIcon :icon="['fas', slowReplyRateIcon]" class="icon" />
            {{ slowReplyRateText }}
          </p>
        </div>

        <div class="stat-card">
          <h4>平均回覆時間</h4>
          <p class="stat-number" :class="avgReplyLevel">
            <FontAwesomeIcon :icon="['fas', avgReplyLevelIcon]" class="icon" />
            {{ avgReplyTimeText }}
          </p>
        </div>
      </div>
    </div>

   <!-- ===== PERFORMANCE ===== -->
    <div class="section">
      <h3>回覆時間分佈</h3>

      <div v-if="isFetching" class="stats">
        <SkeletonStatCard v-for="i in 2" :key="i" />
      </div>

      <div v-else class="stats">
        <div class="stat-card">
          <h4>P50</h4>
          <p class="stat-number" :class="p50Level">
            <FontAwesomeIcon :icon="['fas', p50Icon]" class="icon" />
            {{ p50Text }}
          </p>
        </div>

        <div class="stat-card">
          <h4>P90</h4>
          <p class="stat-number" :class="p90Level">
            <FontAwesomeIcon :icon="['fas', p90Icon]" class="icon" />
            {{ p90Text }}
          </p>
        </div>
      </div>
    </div>

    <div class="section card">
      <div class="section-header">
        <h3>評論趨勢</h3>
      </div>
        <ReviewTrendChart 
          :data="reviewTrend"
          :is-fetching="isFetching" 
        />
    </div>

    <div class="section card">
      <div class="section-header">
        <h3>餐廳評分分布（Top 5）</h3>

        <RouterLink :to="{ name: 'OwnerRestaurantRatingList' }" class="link-btn">
          查看全部 →
        </RouterLink>
      </div>

      <RestaurantRatingChart 
        :data="ratingDistribution" 
        :is-fetching="isFetching"
      />
    </div>

    <!-- 待回覆區 -->
    <div class="section">

      <div class="section-header">
        <h3>待回覆評論</h3>

        <RouterLink :to="{ name: 'OwnerAllReviews', query: { unreplied: 'true' } }" class="link">
          查看全部 →
        </RouterLink>
      </div>

      <ul v-if="isFetching" class="review-list">
        <ReviewItemAdminSkeleton v-for="i in 5" :key="i" />
      </ul>

      <ul v-else-if="reviews.length" class="review-list">
        <ReviewItem 
          v-for="review in reviews.slice(0, 5)" 
          :key="review.uuid" 
          :review="review" 
          show-restaurant
          mode="preview" 
        />
      </ul>

      <div v-else class="empty">
        沒有待回覆評論
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify';

import { useOwnerReviewsStore } from '@/stores/owner-reviews'
import { useOwnerDashboardStore } from '@/stores/owner-dashboard'
import { useFlashStore } from '@/stores/flash'

import { useOwnerDashboardStats } from '@/composables/form/owner/useOwnerDashboardStats'

import ReviewItem from '@/components/owner/review/ReviewItem.vue'
import ReviewTrendChart from '@/components/owner/dashboard/ReviewTrendChart.vue'
import RestaurantRatingChart from '@/components/owner/dashboard/RestaurantRatingChart.vue'
import SkeletonStatCard from '@/components/common/skeleton/SkeletonStatCard.vue'
import ReviewItemAdminSkeleton from '@/components/common/skeleton/ReviewItemAdminSkeleton.vue'

// store
const reviewsStore = useOwnerReviewsStore()

const flash = useFlashStore()

const dashboardStore = useOwnerDashboardStore()

const { loadDashboard } = dashboardStore

const {
  kpi,
  reviewTrend,
  ratingDistribution,
  isFetching,
} = storeToRefs(dashboardStore)

const cacheKey = computed(() =>
  reviewsStore.buildKey({
    restaurantUuid: undefined,
    query: {
      sort: 'createdAt_desc',
      unreplied: true,
      limit: 5,
      page: 1
    }
  })
)
const reviews = computed(() =>
  reviewsStore.getReviews(cacheKey.value)
)

onMounted(() => {
  reviewsStore.loadReviews(cacheKey.value, {
    query: {
      page: 1,
      limit: 5,
      unreplied: true
    }
  })

  loadDashboard({
    ratingLimit: 5
  })

  // 處理從同意成為業者頁面跳轉回來的成功訊息
  if (!flash.message || !flash.type) return

  toast[flash.type](flash.message)

  flash.clear()
})


const {
  avgRatingLevel,
  avgRatingIcon,

  replyRateLevel,
  replyRateIcon,
  replyRateText,

  slowReplyRateLevel,
  slowReplyRateIcon,
  slowReplyRateText,

  unrepliedLevel,


  avgReplyLevel,
  avgReplyLevelIcon,
  avgReplyTimeText,

  p50Level,
  p50Icon,
  p50Text,

  p90Level,
  p90Icon,
  p90Text
} = useOwnerDashboardStats(kpi)
</script>

<style scoped>
#dashboard-panel {
  padding: 20px;
  background-color: #FFF3E6;
  border-radius: 20px;
}

/* stats */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff5f0;
  padding: 16px;
  border-radius: 14px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #842B00;
  margin-top: 8px;
}

.stat-number.warn {
  color: #E85D2A;
}

.stat-number.good {
  color: #28a745;
}

.stat-number.ok {
  color: #ffc107;
}

.stat-number.bad {
  color: #dc3545;
}

.stat-number.none {
  color: #999;
}

.icon {
  margin-right: 6px;
}

/* section card */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* section */
.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.link {
  color: #E85D2A;
  font-size: 0.9rem;
  text-decoration: none;
}

.link-btn {
  border: none;
  background: transparent;
  color: #E85D2A;
  cursor: pointer;
  font-size: 0.9rem;
}

/* list */
.review-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>