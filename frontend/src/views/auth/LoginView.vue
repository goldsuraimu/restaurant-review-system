<template>
  <div class="banner"></div>
  <div class="container">
    <div class="row g-3">
      <div class="col-10 col-md-6 col-lg-4 mx-auto" id="login-panel">
        <form @submit.prevent="handleSubmit">
          <h1 class="text-center mt-3 ">登入</h1>

          <!-- 表單層錯誤 -->
          <div v-if="fieldErrors.general" class="alert alert-danger mb-4" role="alert">
            {{ fieldErrors.general }}
          </div>

          <label for="email" class="form-label">電子郵件:</label>
          <input type="email" class="form-control" id="email" v-model="email" placeholder="請輸入電子郵件" required>
          <label for="password" class="form-label mt-3">密碼:</label>
          <input type="password" class="form-control" id="password" v-model="password" placeholder="請輸入密碼" required>
          <div class="col-12">
            <LoadingSpinner v-if="isLogging" :text="spinnerText" />

            <button id="btn-login" class="btn mt-3" type="submit">登入</button>
          </div>
        </form>
        <div class="col-12 text-center">
          <p class="mt-3">還沒有帳號？<RouterLink :to="{ name: 'Register' }">註冊新帳號</RouterLink>
          </p>
        </div>
        <div class="col-12 text-center">
          <p class="mt-3">返回首頁？<RouterLink :to="{ name: 'Home' }">回首頁</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth';

import { mapLoginErrorToFields } from '@/api/error/field/login-error.mapper';
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { isReasonFailure } from '@/utils/type-guards'

import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

import type { LoginRequest } from '@/types/auth'


const authStore = useAuthStore()
const { isLogging } = storeToRefs(authStore);
const { login } = authStore;

const router = useRouter();
const route = useRoute();

const email = ref<string>('')
const password = ref<string>('');
const spinnerText = ref<string>('登入中...')

const fieldErrors = reactive<Record<string, string>>({});


async function handleSubmit() {
  const payload: LoginRequest = {
    email: email.value.trim(),
    password: password.value.trim()
  };
  const result = await login(payload);

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'LOGGING_IN') return;
    } else {
      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // field
      const mapped = mapLoginErrorToFields(result.error)
      Object.assign(fieldErrors, mapped);
    }

    return
  }

  const redirectTo =
    typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/';

  router.replace(redirectTo)
}

</script>

<style scoped>
.container {
  position: relative;
  top: -200px;
}

#login-panel {
  padding: 0 20px;
  background-color: #FFCBB3;
  border: 1px solid #FF9D6F;
  border-radius: 25px;
  box-shadow: 10px 10px 10px -6px #9b4b4b;
}

#login-panel input[type="email"],
#login-panel input[type="password"] {
  border: 2px solid #FFCBB3;
}

#login-panel input[type="email"]:focus,
#login-panel input[type="password"]:focus {
  border: 2px solid #844200;
  box-shadow: 0 0 5px rgba(25, 135, 84, 0.5);
}

#btn-login {
  background-color: #9b4b4b;
  color: #ffffff;
}

#btn-login:hover {
  background-color: #842B00;
  color: #ccc;
}
</style>
