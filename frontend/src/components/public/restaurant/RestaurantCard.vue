<template>
  <div class="col">
    <RouterLink :to="{ name: 'RestaurantDetail', params: { uuid: restaurant.uuid } }" class="text-secondary">
      <div class="card mb-3">
        <img class="card-img-top" :src="restaurant?.coverImage?.publicId ? getCoverUrl(restaurant.coverImage.publicId) : '' " :alt="restaurant.name" />
        <div class="card-body p-3">
          <h6 class="card-title mb-1">{{ restaurant.name }}</h6>

          <div class="restaurant-category mb-1">
            <FontAwesomeIcon :icon="['fas', 'utensils']" class="me-2" />
            {{ restaurant.category }}
          </div>

          <span v-if="restaurant.rating !== null" class="badge rounded-pill bg-danger">
            {{ restaurant.rating }}
            <FontAwesomeIcon icon="star" class="fa-xs" style="color: gold;" />
          </span>

          <span v-else class="badge rounded-pill bg-danger">
            {{ '尚未評分' }}
          </span>

        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { getCoverUrl } from '@/utils/cloudinary';

import type { RestaurantPublicListItem } from '@/types/restaurant/restaurant.types'

const props = defineProps<{
  restaurant: RestaurantPublicListItem
}>()

</script>

<style></style>