<template>
  <div class="modal fade" :class="{ show: isVisible }" :style="{ display: isVisible ? 'block' : 'none' }" tabindex="-1"
    role="dialog" aria-modal="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="cancel"></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancel">
            取消
          </button>
          <button type="button" class="btn btn-danger" @click="confirm">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 背景遮罩 -->
  <div class="modal-backdrop fade" :class="{ show: isVisible }" v-if="isVisible"></div>
</template>

<script setup lang="ts">
import { useConfirmModalContext } from '@/composables/ui/useConfirmModal'

const { isVisible, title, message, confirm, cancel } = useConfirmModalContext()
</script>
