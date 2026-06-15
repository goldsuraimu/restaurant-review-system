<template>
  <RouterView />
</template>

<script setup lang="ts">
import { provideConfirmModal } from '@/composables/ui/useConfirmModal'

// 提供 ConfirmModal 的上下文
provideConfirmModal();

</script>


<style scoped></style>
