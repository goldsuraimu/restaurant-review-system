<template>
  <div class="container">
    <div class="row g-3">
      <div class="col-10 col-md-8 col-lg-8 mx-auto" id="profile-panel">
        <h1 class="text-center mt-3 mb-4">使用者資料</h1>

        <ProfileRow label="使用者名稱">
          {{ displayProfile?.username }}
        </ProfileRow>

        <ProfileRow label="真實姓名">
          {{ displayProfile?.realName }}
        </ProfileRow>

        <ProfileRow label="暱稱">
          {{ displayProfile?.nickname }}
        </ProfileRow>

        <ProfileRow label="性別">
          {{ displayProfile?.gender }}
        </ProfileRow>

        <ProfileRow label="生日">
          {{ displayProfile?.birthday }}
        </ProfileRow>

        <ProfileRow label="電話">
          {{ displayProfile?.phone }}
        </ProfileRow>

        <ProfileRow label="住址">
          {{ displayProfile?.address }}
        </ProfileRow>

        <ProfileRow label="電子郵件">
          {{ displayProfile?.email }}
        </ProfileRow>

        <div class="col-10 col-md-8 col-lg-8 mx-auto text-center mb-5">
          <RouterLink :to="{ name: 'EditProfile' }" class="btn mt-3" id="btn-edit">
            編輯資料
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify';

import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'

import ProfileRow from '@/components/user/ProfileRow.vue'
import type { Gender } from '@/types/user'

const authStore = useAuthStore()
const { userProfile } = storeToRefs(authStore)

const flash = useFlashStore()

// 初次進入頁面才抓
onMounted(() => {
  authStore.ensureMyProfile()

  if (!flash.message || !flash.type) return

  toast[flash.type](flash.message)

  flash.clear()
})

// 性別顯示對照
const genderMap: Record<Gender, string> = {
  male: '男性',
  female: '女性',
  other: '其他'
}

// 顯示用資料（UI 專用）
const displayProfile = computed(() => {
  if (!userProfile.value) return null

  return {
    ...userProfile.value,
    realName: userProfile.value.realName || '—',
    nickname: userProfile.value.nickname || '—',
    gender: userProfile.value.gender
      ? genderMap[userProfile.value.gender]
      : '—',
    birthday: userProfile.value.birthday || '—',
    phone: userProfile.value.phone || '—',
    address: userProfile.value.address || '—'
  }
})
</script>

<style scoped>
.container {
  position: relative;
  top: -200px;
}

#profile-panel {
  padding: 0 15px;
  background-color: #FFCBB3;
  border: 1px solid #FF9D6F;
  border-radius: 25px;
  box-shadow: 10px 10px 10px -6px #9b4b4b;
}

#btn-edit {
  background-color: #9b4b4b;
  color: #ffffff;
}

#btn-edit:hover {
  background-color: #842B00;
  color: #ccc;
}
</style>