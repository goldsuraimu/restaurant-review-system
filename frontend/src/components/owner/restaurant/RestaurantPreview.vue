<template>
  <div class="page">
    <div class="banner"></div>
    <div>
      <h1 class="mb-1 restaurant-show-title truncate-title" :title="restaurant.name">{{ restaurant.name }}</h1>

      <p v-if="restaurant?.nameEn" class="restaurant-name-en mt-2">
        {{ restaurant?.nameEn }}
      </p>
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-10 mx-auto">

            <div class="mb-1">
              <span class="text-secondary">
                <FontAwesomeIcon :icon="['fas', 'star']" class="me-2" />
                評分：
              </span>
              <span class="text-danger mx-2">
                {{ restaurant.rating ?? '尚未評分' }}
              </span>
            </div>

            <p class="mb-1">
              <span class="text-secondary">
                <FontAwesomeIcon :icon="['fas', 'utensils']" class="me-2" />
                類別：
              </span>
              {{ restaurant.category }}
            </p>

            <p class="mb-1 address-row" :title="restaurant.location">
              <span class="text-secondary label">
                <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="me-2" />
                地址：
              </span>

              <span class="address-text-wrapper">
                <span class="address-text">
                  {{ restaurant.location }}
                </span>
                <a v-if="restaurant.location" class="map-link">
                  <img src="/google-map.png" alt="Google Map" class="map-icon" />
                </a>
              </span>
            </p>

            <p class="mb-1">
              <span class="text-secondary">
                <FontAwesomeIcon :icon="['fas', 'mobile-alt']" class="me-2" />
                電話：
              </span>
              {{ restaurant.phone }}
            </p>

            <div class="mb-1">
              <span class="text-secondary ">
                <FontAwesomeIcon :icon="['fas', 'book']" class="me-2" />
                介紹：
              </span>
              <br />
              <p class="mt-3 mb-5 description-text">
                {{ restaurant.description }}
              </p>
            </div>

            <h2 class="mt-5 text-center">
              <FontAwesomeIcon :icon="['fas', 'utensils']" class="me-2" />
              展示
            </h2>

            <ImageViewerWrapper :background="wrapperBackground">
              <ImageViewer 
                :images="restaurant.galleryImages"
                @request-fullscreen="openFullscreen(restaurant.galleryImages, $event)" 
              />
            </ImageViewerWrapper>

            <h2 class="mt-5 text-center">
              <FontAwesomeIcon :icon="['fas', 'table-list']" class="me-2" />
              菜單
            </h2>

            <ImageViewerWrapper :background="wrapperBackground">
              <ImageViewer 
                :images="restaurant.menuImages"
                @request-fullscreen="openFullscreen(restaurant.menuImages, $event)" 
              />
            </ImageViewerWrapper>

          </div>

        </div>
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
import { ref } from 'vue'

import ImageViewer from '@/components/common/ImageLightbox/ImageViewer.vue'
import ImageViewerWrapper from '@/components/common/ImageLightbox/ImageViewerWrapper.vue'
import ImageViewerFullscreen from '@/components/common/ImageLightbox/ImageViewerFullscreen.vue'

import type { RestaurantImage } from '@/types/restaurant'

// Fullscreen Lightbox
const fullscreenVisible = ref(false)
const fullscreenIndex = ref(0)
const activeFullscreenImages = ref<RestaurantImage[]>([])
const wrapperBackground = 'rgba(255,255,255,0.5)';

defineProps<{
  restaurant: {
    name: string
    nameEn?:string
    category: string
    location: string
    phone?: string
    description?: string
    rating?: number | null
    galleryImages: RestaurantImage[]
    menuImages: RestaurantImage[]
  }
}>()


// 打開全螢幕檢視
function openFullscreen(
  images: RestaurantImage[],
  index: number
) {
  activeFullscreenImages.value = images
  fullscreenIndex.value = index
  fullscreenVisible.value = true
}


</script>

<style scoped> 
.truncate-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page {
  background: white;
}

.banner {
  z-index: 0;
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
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.address-text {
  min-width: 0;

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