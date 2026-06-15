<template>
  <div class="become-owner-page">

    <div class="card">

      <h1 class="title">
        成為店主
      </h1>

      <p class="description">
        成為店主後，你可以建立與管理自己的餐廳資料，
        並使用店主管理功能。
      </p>

      <div class="agreement-box">

        <h2 class="agreement-title">
          店主同意條款
        </h2>

        <ul class="agreement-list">
          <li>
            我確認所提交的餐廳資訊皆為真實內容。
          </li>

          <li>
            我理解平台有權審核、下架不符合規範之內容。
          </li>

          <li>
            我同意遵守平台使用規範與相關法律責任。
          </li>
        </ul>

      </div>

      <label class="checkbox-wrapper">

        <input v-model="agreed" type="checkbox">

        <span>
          我已閱讀並同意上述條款
        </span>

      </label>

      <button 
        class="submit-btn" 
        :disabled="!agreed || isBecomingOwner" 
        @click="handleBecomeOwner"
      >
        {{
          isBecomingOwner
            ? '處理中...'
            : '確認成為店主'
        }}
      </button>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'

import { ToastType } from '@/constants/toast'
import { isReasonFailure } from '@/utils/type-guards'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { AUTH_ERROR_MESSAGE_MAP } from '@/api/error/business/auth/auth-error.messages'



const router = useRouter()

const flash = useFlashStore()

const authStore = useAuthStore()

const {
  isBecomingOwner,
} = storeToRefs(authStore)

const agreed = ref(false)

async function handleBecomeOwner() {

  if (!agreed.value) {
    return
  }

  const result =
    await authStore.becomeOwner()

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'UPDATING_PROFILE') return;
    } else {

      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // business
      if (resolveBusinessError(result.error, AUTH_ERROR_MESSAGE_MAP)) return
    }
  }

  flash.set({
    type: ToastType.SUCCESS,
    message: '已成功成為店主'
  })

  router.push({ name: 'OwnerDashboard' })

}

</script>

<style scoped>
.become-owner-page {
  min-height: calc(100vh - 80px);

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 40px 20px;

  background:
    linear-gradient(180deg,
      #fff8f4 0%,
      #fff1e8 100%);
}

.card {
  width: 100%;
  max-width: 680px;

  background: white;

  border-radius: 20px;

  padding: 36px;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08);

  border: 1px solid #f5d6c8;
}

.title {
  font-size: 2rem;
  font-weight: 700;

  color: #842b00;

  margin-bottom: 16px;
}

.description {
  color: #5a2a18;

  line-height: 1.8;

  margin-bottom: 28px;
}

.agreement-box {
  background: #fff7f3;

  border: 1px solid #f2d4c7;

  border-radius: 14px;

  padding: 22px;

  margin-bottom: 24px;
}

.agreement-title {
  font-size: 1.1rem;
  font-weight: 700;

  color: #842b00;

  margin-bottom: 14px;
}

.agreement-list {
  margin: 0;
  padding-left: 20px;

  color: #5a2a18;

  line-height: 1.9;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;

  margin-bottom: 28px;

  color: #5a2a18;

  cursor: pointer;
}

.submit-btn {
  width: 100%;

  border: none;

  border-radius: 12px;

  padding: 14px 18px;

  font-size: 1rem;
  font-weight: 700;

  color: white;

  background: #e85d2a;

  transition:
    background 0.2s ease,
    opacity 0.2s ease,
    transform 0.15s ease;

  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background: #cf4f22;

  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

@media (max-width: 768px) {

  .card {
    padding: 24px;
  }

  .title {
    font-size: 1.6rem;
  }
}
</style>