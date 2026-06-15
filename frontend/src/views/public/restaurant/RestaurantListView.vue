<template>
  <SearchBar v-model="keyword" :searchTitle="searchTitle" :placeholder="placeholder" :ariaLabel="ariaLabel" />

  <div class="container mt-5">

    <!-- 排序選單 -->
    <div class="container mb-3">
      <div class="row">
        <div class="col-md-4 col-12 ms-auto">
          <select class="form-select" v-model="sortValue">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="listError" class="text-danger text-center ">
      載入失敗：{{ listError }}
    </div>
    <div v-else class="row">
      <div class="col-md-10 col-12 mx-auto">
        <p v-if="keyword && !isInitialLoading" class="fst-italic text-muted">
          搜尋關鍵字: {{ keyword }} ， 共 {{ pageInfo.total }} 筆資料
        </p>

        <div class="row row-cols-1 row-cols-sm-3">
          <!-- skeleton -->
          <template v-if="isInitialLoading">
            <RestaurantCardSkeleton v-for="i in PAGE_SIZE" :key="i" />
          </template>

          <!-- 實際資料 -->
          <template v-else>
            <RestaurantCard v-for="restaurant in restaurantList" :key="restaurant.uuid" :restaurant="restaurant" />
          </template>
        </div>
      </div>
    </div>
  </div>
  <Pagination :pageInfo="pageInfo" @update:page="onPageChange" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRestaurantStore } from '@/stores/restaurants';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useSearchKeyword } from '@/composables/data/useSearchKeyword';
import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message';

import SearchBar from '@/components/common/SearchBar.vue';
import RestaurantCard from '@/components/public/restaurant/RestaurantCard.vue';
import RestaurantCardSkeleton from '@/components/common/skeleton/RestaurantCardSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue';

import type { RestaurantSort } from '@/types/restaurant';
import type { SortOrder } from '@/types/common/list-query';

const route = useRoute()
const router = useRouter()
const restaurantStore = useRestaurantStore()
const {
  restaurantList,
  isFetchingList,
  pageInfo,
} = storeToRefs(restaurantStore)
const { fetchRestaurants } = useRestaurantStore()
const { keyword, keywordList } = useSearchKeyword()

const searchTitle = '尋找餐廳:';
const placeholder = '請輸入餐廳名稱、地址、食物類型...';
const ariaLabel = '餐廳名稱...';

const listError = ref<string | null>(null);

const isInitialLoading = computed(() =>
  isFetchingList.value && restaurantList.value.length === 0
)
//#region 頁碼相關

// 單頁資料數量
const PAGE_SIZE = 12

// 頁碼隨路由參數page變化
const page = computed(() => {
  const p = Number(route.query.page)
  return isNaN(p) || p <= 0 ? 1 : p
})

// 處理頁面變更
function onPageChange(page: number) {
  router.push({ query: { ...route.query, page } })
}
// #endregion



// #region 排序相關
const validSorts: RestaurantSort[] = ['relevance', 'createdAt', 'rating', 'ratingCount', 'reviewCount'];
const validOrders: SortOrder[] = ['asc', 'desc'];

function isValidSort(sort: any): sort is RestaurantSort {
  return validSorts.includes(sort);
}

function isValidOrder(order: any): order is SortOrder {
  return validOrders.includes(order);
}


// 取得安全值（fallback 預設）
function safeSortOrder(sort: any, order: any): { sort: RestaurantSort; order: SortOrder } {
  const s = isValidSort(sort) ? sort : 'createdAt';
  const o = isValidOrder(order) ? order : 'desc';
  return { sort: s, order: o };
}

const sortOptions = computed(() => {
  const options = [
    { label: '最新 → 最舊', value: 'createdAt_desc' },
    { label: '最舊 → 最新', value: 'createdAt_asc' },
    { label: '評分最高 → 最低', value: 'rating_desc' },
    { label: '評分最低 → 最高', value: 'rating_asc' },
    { label: '評分數最多 → 最少', value: 'ratingCount_desc' },
    { label: '評分數最少 → 最多', value: 'ratingCount_asc' },
    { label: '評論數最多 → 最少', value: 'reviewCount_desc' },
    { label: '評論數最少 → 最多', value: 'reviewCount_asc' },
  ]

  if (keyword.value) {
    options.unshift({ label: '最相關', value: 'relevance_desc' })
  }

  return options
})

// UI 用的 value，例如：rating_desc
const sortValue = computed<string>({
  get() {
    const { sort, order } = safeSortOrder(route.query.sort, route.query.order);
    return `${sort}_${order}`;
  },
  set(val) {
    if (!val) {
      router.push({
        query: {
          ...route.query,
          sort: undefined,
          order: undefined,
          page: 1,
        },
      })
      return
    }

    const [sort, order] = val.split('_')

    if (sort === 'relevance' && !keyword.value) {
      router.push({
        query: {
          ...route.query,
          sort: 'createdAt',
          order: 'desc',
          page: 1,
        },
      })
      return
    }


    router.push({
      query: {
        ...route.query,
        sort,
        order,
        page: 1,
      },
    })
  },
})
// #endregion


// 獲取餐廳列表
async function fetch() {
  listError.value = null

  // 從 route 或 sortValue 得到安全的排序
  const { sort, order } = safeSortOrder(route.query.sort, route.query.order);

  const result = await fetchRestaurants({
    q: keywordList.value,
    page: page.value,
    limit: PAGE_SIZE,
    sort,
    order,
  })

  if (!result.ok) {
    listError.value = resolveErrorMessage(
      result.error,
      '目前無法取得餐廳列表'
    )
    return
  }
}

// 監聽路由參數的變化，重新獲取餐廳列表
watch(
  () => [route.query.q, route.query.page, route.query.sort, route.query.order],
  fetch,
  { immediate: true }
)
</script>


<style scoped>
.form-select {
  cursor: pointer;
}

select:hover,
select:focus {
  border-color: #4592af;
  background-color: #f8f9fa;
  box-shadow: 0 0 0 0.2rem rgba(111, 188, 233, 0.438);
}
</style>