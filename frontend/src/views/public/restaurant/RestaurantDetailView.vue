<template>

  <h1 class="mb-1 restaurant-show-title truncate-title" :title="currentRestaurant?.name">
    {{ currentRestaurant?.name }}
  </h1>

  <!-- 顯示英文名稱 -->
  <p v-if="currentRestaurant?.nameEn" class="restaurant-name-en mt-2">
    {{ currentRestaurant?.nameEn }}
  </p>

  <div class="container">
    <RestaurantDetailSkeleton v-if="isFetchingItem" />
    <div v-else-if="itemError" class="text-danger text-center mb-5">
      載入失敗：{{ itemError }}
    </div>
    <div v-else-if="!isFetchingItem && currentRestaurant" class="row">
      <div class="col-12 col-md-10 mx-auto">

        <div class="mb-1">
          <span class="text-secondary">
            <FontAwesomeIcon :icon="['fas', 'star']" class="me-2" />
            評分：
          </span>
          <span class="text-danger mx-2">
            {{ currentRestaurant.rating ? currentRestaurant.rating : '尚未評分' }}
          </span>

          <ReviewStars :rating="Math.round(currentRestaurant?.rating ?? 0)" />

          <span class="text-xs text-body-secondary ms-2">
            ( {{ currentRestaurant.ratingCount }} )
          </span>
        </div>

        <p class="mb-1">
          <span class="text-secondary">
            <FontAwesomeIcon :icon="['fas', 'utensils']" class="me-2" />
            類別：
          </span>
          {{ currentRestaurant.category }}
        </p>

        <p class="mb-1 address-row" :title="currentRestaurant.location">
          <span class="text-secondary label">
            <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="me-2" />
            地址：
          </span>

          <span class="address-text-wrapper">
            <span class="address-text">
              {{ currentRestaurant.location }}
            </span>
            <a v-if="currentRestaurant?.location"
              :href="generateGoogleMapUrl(currentRestaurant.name, currentRestaurant.location)" class="map-link"
              target="_blank" rel="noopener noreferrer">
              <img src="/google-map.png" alt="Google Map" class="map-icon" />
            </a>
          </span>
        </p>

        <p class="mb-1">
          <span class="text-secondary">
            <FontAwesomeIcon :icon="['fas', 'mobile-alt']" class="me-2" />
            電話：
          </span>
          {{ currentRestaurant.phone }}
        </p>

        <div class="mb-1">
          <span class="text-secondary">
            <FontAwesomeIcon :icon="['fas', 'clock']" class="me-2" />
            發布時間：
          </span>

          <RelativeTime 
            :createdAt="currentRestaurant.createdAt" 
            :updatedAt="currentRestaurant.updatedAt"
            color="#000000"
            mode="absolute" 
            format="date"
          />
        </div>
        
        <div class="mb-1">
          <span class="text-secondary ">
            <FontAwesomeIcon :icon="['fas', 'book']" class="me-2" />
            介紹：
          </span>
          <br />
          <p class="description-text mt-2 mb-5">
            {{ currentRestaurant.description }}
          </p>
        </div>

        <div v-if="displayGallery && displayGallery.length">
          <h2 class="mt-5 text-center">
            <FontAwesomeIcon :icon="['fas', 'utensils']" class="me-2" />
            展示
          </h2>

          <ImageViewerWrapper :background="wrapperBackground">
            <ImageViewer 
              :images="displayGallery || []" 
              @request-fullscreen="openFullscreen(displayGallery, $event)" 
            />
          </ImageViewerWrapper>

        </div>
        <div v-if="currentRestaurant.images.menu.length">
          <h2 class="mt-5 text-center">
            <FontAwesomeIcon :icon="['fas', 'table-list']" class="me-2" />
            菜單
          </h2>

          <ImageViewerWrapper :background="wrapperBackground">
            <ImageViewer 
              :images="currentRestaurant.images.menu || []"
              @request-fullscreen="openFullscreen(currentRestaurant.images.menu || [], $event)" 
            />
          </ImageViewerWrapper>

        </div>

      </div>
    </div>

    <!-- 使用者評論區 -->
    <div class="row">
      <div class="col-12 col-md-10 mx-auto">

        <RestaurantReviews :restaurantUuid="restaurantUuid" :reviewCount="currentRestaurant?.reviewCount"
          :ownerUuid="currentRestaurant?.ownerUuid" />

      </div>
    </div>
  </div>

  <ImageViewerFullscreen 
    v-model:visible="fullscreenVisible" 
    :images="activeFullscreenImages"
    :initialIndex="fullscreenIndex" 
  />

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRestaurantStore } from '@/stores/restaurants';
import { storeToRefs } from 'pinia';
import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message';
import { isValidUUID } from '@/utils/validator'

import RestaurantDetailSkeleton from '@/components/common/skeleton/RestaurantDetailSkeleton.vue'
import ImageViewerWrapper from '@/components/common/ImageLightbox/ImageViewerWrapper.vue';
import ImageViewer from '@/components/common/ImageLightbox/ImageViewer.vue';
import ImageViewerFullscreen from '@/components/common/ImageLightbox/ImageViewerFullscreen.vue'
import RestaurantReviews from '@/components/public/restaurant/RestaurantReviews.vue';
import ReviewStars from '@/components/review/ReviewStars.vue'
import RelativeTime from '@/components/common/RelativeTime.vue'

import type { RestaurantImage } from '@/types/restaurant'

const route = useRoute();
const restaurantStore = useRestaurantStore()
const {
  currentRestaurant,
  isFetchingItem
} = storeToRefs(restaurantStore);
const { fetchRestaurantDetail } = restaurantStore;

const fullscreenVisible = ref(false)
const fullscreenIndex = ref(0)
const activeFullscreenImages = ref<RestaurantImage[]>([])

const itemError = ref<string | null>(null);

const wrapperBackground = 'rgba(255,255,255,0.5)';


const restaurantUuid = route.params.uuid as string

const displayGallery = computed<RestaurantImage[]>(() => {
  const images = currentRestaurant.value?.images
  if (!images) return []

  if (images.cover) {
    return [
      ...images.cover,
      ...images.gallery,
    ]
  }

  return images.gallery
})

const generateGoogleMapUrl = (name?: string, location?: string) => {
  if (!location) return '#'

  const query = encodeURIComponent(`${name ?? ''} ${location}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

// 載入餐廳資料
async function loadRestaurant(uuid: string) {
  itemError.value = null;

  const result = await fetchRestaurantDetail(uuid);

  if (!result.ok) {
    itemError.value = resolveErrorMessage(
      result.error,
      '目前無法取得餐廳資料'
    );
    return;
  }
}

// 打開全螢幕檢視
function openFullscreen(
  images: RestaurantImage[],
  index: number
) {
  activeFullscreenImages.value = images
  fullscreenIndex.value = index
  fullscreenVisible.value = true
}

onMounted(() => {
  if (!isValidUUID(restaurantUuid)) {
    return;
  }

  loadRestaurant(restaurantUuid);
});
</script>

<style scoped>
.truncate-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 整排不換行  */
.address-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 標籤不被壓縮 */
.label {
  flex-shrink: 0;
}

.address-text-wrapper {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.address-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-link {
  flex-shrink: 0;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
}

.text-xs {
  font-size: 0.75rem;
}

.map-icon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}

.description-text {
  margin-top: 12px;

  white-space: pre-line;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>