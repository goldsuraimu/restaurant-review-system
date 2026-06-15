<template>
  <div class="stars-wrapper">
    <FontAwesomeIcon v-for="i in 5" :key="i" :icon="getStarIcon(i)" class="star" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rating: number | null
}>()

const safeRating = computed(() => props.rating ?? 0)

function getStarIcon(i: number) {
  const rating = safeRating.value

  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  if (i <= full) return ['fas', 'star']
  if (i === full + 1 && half) return ['fas', 'star-half-alt']
  return ['far', 'star']
}
</script>

<style scoped>

.stars-wrapper {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 2px;
  min-width: 80px;
  /* 避免被擠到變形 */
}

.star {
  color: gold;
  margin-right: 0;
  flex-shrink: 0;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .stars-wrapper {
    gap: 1px;
    min-width: auto;
  }

  .star {
    font-size: 0.85rem;
  }
}
</style>