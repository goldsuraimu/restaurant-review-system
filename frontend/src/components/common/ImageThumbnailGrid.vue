<template>
  <div class="d-flex gap-2 flex-wrap mb-2" v-if="props.images?.length">
    <div class="thumbnail-wrapper" v-for="(img, i) in images" :key="img.uuid">
      <img 
        :src="
          img.publicId 
            ? getThumbnailUrl(img.publicId)
            : img.url || ''
        " 
        class="thumbnail"
        :class="{ clickable: props.clickable }"
        @click="props.clickable && emit('open', i)" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getThumbnailUrl } from '@/utils/cloudinary';

import type { BaseImage } from '@/types';

const props = withDefaults(defineProps<{
  images: BaseImage[];
  clickable?: boolean;
}>(), {
  clickable: true
});

const emit = defineEmits<{
  (e: 'open', index: number): void;
}>();

</script>

<style scoped>
.thumbnail {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.thumbnail.clickable {
  cursor: pointer;
}

.thumbnail-wrapper {
  position: relative;
}

</style>