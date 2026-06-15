<template>
  <div class="banner"></div>
  <div class="container">
    <div class="row g-3">
      <div class="col-10 col-md-8 col-lg-8 mx-auto" id="register-panel">
        <form @submit.prevent="handleSubmit">
          <h1 class="text-center mt-3 mb-4">註冊</h1>

          <!-- 表單層錯誤 -->
          <div v-if="fieldErrors.general" class="alert alert-danger mb-4" role="alert">
            {{ fieldErrors.general }}
          </div>

          <!-- 使用者名稱（帳號 ID） -->
          <div class="mb-3 row">
            <label for="username" class="col-sm-2 col-form-label">
              <span class="text-danger">*</span>
              使用者名稱:
            </label>
            <div class="col-6 col-sm-6 col-lg-4">
              <input type="text" class="form-control" :class="{ 'is-invalid': username && !isValidUsername }"
                id="username" v-model="username" placeholder="英文或數字，3~20 字" maxlength="20" required>
              <div v-if="usernameError" class="invalid-feedback">{{ usernameError }}</div>
            </div>
          </div>

          <!-- 姓名欄位 -->
          <div class="mb-3 row">
            <label for="realName" class="col-sm-2 col-form-label">真實姓名:</label>
            <div class="col-6 col-sm-6  col-lg-4 ">
              <input type="text" class="form-control" :class="{ 'is-invalid': realName && !isValidRealName }"
                id="realName" v-model="realName" placeholder="2~30 個中英文或空格" maxlength="30">
              <div v-if="realNameError" class="invalid-feedback">{{ realNameError }}</div>
            </div>
          </div>

          <!-- 暱稱 -->
          <div class="mb-3 row">
            <label for="nickname" class="col-sm-2 col-form-label">暱稱:</label>
            <div class="col-6 col-sm-6  col-lg-4 ">
              <input type="text" class="form-control" :class="{ 'is-invalid': nickname && !isValidNickname }"
                v-model="nickname" placeholder="這將顯示在評論中" maxlength="30">
              <div v-if="nicknameError" class="invalid-feedback">{{ nicknameError }}</div>
            </div>
          </div>

          <!-- 性別欄位 -->
          <div class="mb-3 row">
            <label class="col-sm-2 col-form-label">性別:</label>
            <div class="col-10 col-sm-8  col-lg-8 ">

              <div class="form-check">
                <input class="form-check-input" type="radio" value="" v-model="gender" id="gender-none" />
                <label class="form-check-label" for="gender-none">
                  不填
                </label>
              </div>

              <div class="form-check" v-for="opt in genderOptions" :key="`gender-${opt.value}`">
                <input class="form-check-input" type="radio" :value="opt.value" v-model="gender"
                  :id="`gender-${opt.value}`" />
                <label class="form-check-label" :for="`gender-${opt.value}`">
                  {{ opt.label }}
                </label>
              </div>

              <small class="text-muted d-block">
                可選填，若設定後未來將無法清除（僅可修改）
              </small>
              <div v-if="genderError" class="invalid-feedback">{{ genderError }}</div>
            </div>
          </div>

          <!-- 生日欄位 -->
          <div class="mb-3 row">
            <label for="birthday" class="col-sm-2 col-form-label">生日:</label>
            <div class="col-6 col-sm-6  col-lg-4 ">
              <div class="d-flex gap-2 align-items-center">
                <input type="date" id="birthday" name="birthday" :class="{ 'is-invalid': birthday && !isValidBirthday }"
                  v-model="birthday" :max="today" :min="minDate" />
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="birthday = ''">
                  清除
                </button>
              </div>
              <small class="text-muted d-block">
                生日設定後不可再修改
              </small>
              <div v-if="birthdayError" class="invalid-feedback">{{ birthdayError }}</div>
            </div>
          </div>

          <!-- 電話欄位 -->
          <div class="mb-3 row">
            <label for="phone" class="col-sm-2 col-form-label">電話:</label>
            <div class="col-6 col-sm-6  col-lg-4 ">
              <input type="tel" class="form-control" :class="{ 'is-invalid': phone && !isValidPhone }" id="phone"
                v-model="phone" placeholder="手機或家用電話(9~10位數字)" maxlength="15">
              <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
            </div>
          </div>

          <!-- 住址欄位 -->
          <div class="mb-3 row">
            <label for="address" class="col-sm-2 col-form-label">住址:</label>
            <div class="col-10 col-sm-8 col-lg-8 ">
              <input type="text" class="form-control" :class="{ 'is-invalid': address && !isValidAddress }" id="address"
                v-model="address" placeholder="請輸入住址" minlength="5" maxlength="100">
              <div v-if="addressError" class="invalid-feedback">{{ addressError }}</div>
            </div>
          </div>

          <!-- 郵件欄位 -->
          <div class="mb-3 row">
            <label for="email" class="col-sm-2 col-form-label">
              <span class="text-danger">*</span>
              電子郵件:
            </label>
            <div class="col-10 col-sm-8 col-lg-8 ">
              <input type="email" class="form-control" :class="{ 'is-invalid': email && !isValidEmail }" id="email"
                v-model="email" placeholder="請輸入電子郵件" required>
              <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
            </div>
          </div>

          <!-- 密碼欄位 -->
          <div class="mb-3 row">
            <label for="password" class="col-sm-2 col-form-label">
              <span class="text-danger">*</span>
              密碼:
            </label>
            <div class="col-8 col-sm-6 col-lg-6 ">
              <input type="password" class="form-control" :class="{ 'is-invalid': password && !isValidPassword }"
                id="password" v-model="password" placeholder="至少 8 個字" required>
              <div v-if="passwordError" class="invalid-feedback">{{ passwordError }}</div>
            </div>
          </div>

          <!-- 確認密碼 -->
          <div class="mb-3 row">
            <label for="confirmPassword" class="col-sm-2 col-form-label">
              <span class="text-danger">*</span>
              密碼確認:
            </label>
            <div class="col-8 col-sm-6 col-lg-6 ">
              <input id="confirmPassword" v-model="confirmPassword" type="password" class="form-control"
                :class="{ 'is-invalid': confirmPassword && !isPasswordConfirmed }" placeholder="請再輸入一次密碼" />
              <div class="invalid-feedback">兩次輸入的密碼不相符。</div>
            </div>
          </div>
          <div class="col-12 text-center mb-5">
            <LoadingSpinner v-if="isRegistering" :text="spinnerText" />

            <button type="submit" id="btn-register" class="btn mt-3" :disabled="!isFormValid || isRegistering">
              註冊
            </button>
          </div>
        </form>
        <p class="text-center mt-2 col-10 col-md-8 col-lg-8 mx-auto">
          已經有帳號？
          <RouterLink to="/login">點此登入</RouterLink>
        </p>
      </div>

    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';

import { useAuthStore } from '@/stores/auth';

import { mapRegisterErrorToFields } from '@/api/error/field/register-error.mapper';
import { getFieldError } from '@/utils/form'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { isReasonFailure } from '@/utils/type-guards'

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

import type { RegisterRequest, RegisterFormState } from '@/types/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore()
const { isRegistering } = storeToRefs(authStore);
const { register, login } = authStore;

// #region 表單欄位狀態
const username = ref<string>('')
const realName = ref<string>('')
const nickname = ref<string>('')
const gender = ref<RegisterFormState['gender'] | ''>('');
const birthday = ref<string>('')
const phone = ref<string>('')
const address = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')
// #endregion

const spinnerText = ref<string>('註冊中...')
const fieldErrors = reactive<Record<string, string>>({});

// 性別選項
const genderOptions = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' },
]

// 儲存最小日期
const minDate = ref<string>('1900-01-01');
// 儲存最大日期
const today = ref<string>(new Date().toISOString().slice(0, 10));

const usernamepattern = /^[a-zA-Z0-9_]{3,20}$/;
const realNamePattern = /^[A-Za-z\u4E00-\u9FFF·\s]{2,30}$/
const phonePattern = /^0[2-9]\d{7,8}$/
const addressPattern = /^.{5,100}$/
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

// #region 欄位驗證
const isValidUsername = computed(() => usernamepattern.test(username.value))
const isValidRealName = computed(() =>
  realName.value === '' || realNamePattern.test(realName.value)
);

const isValidNickname = computed(() => {
  const value = nickname.value

  // 完全沒填 → 合法
  if (!value) return true

  // 去掉前後空白後長度
  const trimmedLength = value.trim().length

  // 只填空白 → 不合法
  if (trimmedLength === 0) return false

  // 有填字且長度 <= 30  → 合法
  return trimmedLength <= 30
})

const isValidGender = computed(() =>
  gender.value === '' ||
  ['male', 'female', 'other'].includes(gender.value)
);

const isValidBirthday = computed(() => {
  if (!birthday.value) return true

  return birthday.value >= minDate.value &&
    birthday.value <= today.value
})

const isValidPhone = computed(() => {
  if (!phone.value) return true; // 選填欄位，沒填算通過

  // 防呆：先移除所有非數字的字元（如空空白、連字號 -、括號 ()）
  const cleaned = phone.value.replace(/\D/g, '');

  // 檢查過濾後的純數字是否符合台灣電話規則
  return phonePattern.test(cleaned);
});

const isValidAddress = computed(() =>
  address.value === '' || addressPattern.test(address.value)
);

const isValidEmail = computed(() => emailPattern.test(email.value))
const isValidPassword = computed(() => password.value.length >= 8)
const isPasswordConfirmed = computed(() =>
  password.value !== '' && password.value === confirmPassword.value
)

// 統一表單驗證
const isFormValid = computed(() =>
  isValidUsername.value &&
  isValidRealName.value &&
  isValidNickname.value &&
  isValidGender.value &&
  isValidBirthday.value &&
  isValidPhone.value &&
  isValidAddress.value &&
  isValidEmail.value &&
  isValidPassword.value &&
  isPasswordConfirmed.value
)
// #endregion

// #region 統一管理前後端錯誤
const realNameError = computed(() =>
  getFieldError('realName', isValidRealName.value, '姓名格式錯誤（僅限 2~30 個中英文或空格）。', fieldErrors)
)
const usernameError = computed(() =>
  getFieldError('username', isValidUsername.value, '使用者名稱格式錯誤（僅限英文與數字，長度 3~20）。', fieldErrors)
)
const nicknameError = computed(() =>
  getFieldError('nickname', isValidNickname.value, '暱稱格式錯誤（僅限 1~30 個字，不可為空白）。', fieldErrors)
)
const genderError = computed(() =>
  getFieldError('gender', isValidGender.value, '請選擇有效的性別。', fieldErrors)
)
const birthdayError = computed(() =>
  getFieldError('birthday', isValidBirthday.value, '請輸入 1900-01-01 至今天之間的日期。', fieldErrors)
)
const phoneError = computed(() =>
  getFieldError('phone', isValidPhone.value, '請輸入正確的台灣手機號碼(10碼)或市內電話(含區碼9~10碼)。', fieldErrors)
)
const addressError = computed(() =>
  getFieldError('address', isValidAddress.value, '地址格式錯誤( 5~100 字）。', fieldErrors)
)
const passwordError = computed(() =>
  getFieldError('password', isValidPassword.value, '密碼長度至少 8 個字。', fieldErrors)
)
const emailError = computed(() =>
  getFieldError('email', isValidEmail.value, '請輸入有效的電子郵件。', fieldErrors)
)
// #endregion


// #region 監聽每個欄位變動，使用者修改就清掉對應的後端錯誤
watch(username, () => { if (fieldErrors.username) delete fieldErrors.username })
watch(realName, () => { if (fieldErrors.realName) delete fieldErrors.realName })
watch(nickname, () => { if (fieldErrors.nickname) delete fieldErrors.nickname })
watch(gender, () => { if (fieldErrors.gender) delete fieldErrors.gender })
watch(birthday, () => { if (fieldErrors.birthday) delete fieldErrors.birthday })
watch(phone, () => { if (fieldErrors.phone) delete fieldErrors.phone })
watch(address, () => { if (fieldErrors.address) delete fieldErrors.address })
watch(email, () => { if (fieldErrors.email) delete fieldErrors.email })
watch(password, () => { if (fieldErrors.password) delete fieldErrors.password })
// #endregion


// #region 提交表單
async function handleSubmit() {
  // 前端表單驗證（防 disable 被移除）
  if (!isFormValid.value) return

  const payload: RegisterRequest = {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value,

    // 以下為可選欄位
    realName: realName.value.trim() || undefined,
    nickname: nickname.value.trim() || undefined,
    gender: gender.value === '' ? undefined : gender.value,
    birthday: birthday.value || undefined,
    phone: phone.value ? phone.value.replace(/\D/g, '') : undefined, 
    address: address.value.trim() || undefined,

  }

  const result = await register(payload);

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'REGISTERING') return;
    } else {
      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // field
      const mapped = mapRegisterErrorToFields(result.error);
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      Object.assign(fieldErrors, mapped)
    }

    return
  }

  toast.success('註冊成功，已自動登入');

  const loginResult = await login({
    email: payload.email,
    password: payload.password
  });

  if (loginResult.ok) {
    const redirectTo =
      typeof route.query.redirect === 'string' &&
        route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/';

    router.replace(redirectTo);
  }
};
// #endregion 
</script>

<style scoped>
.container {
  position: relative;
  top: -200px;
}

#register-panel {
  padding: 0 15px;
  background-color: #FFCBB3;
  border: 1px solid #FF9D6F;
  border-radius: 25px;
  box-shadow: 10px 10px 10px -6px #9b4b4b;
}

input.form-control {
  border: 2px solid #FFCBB3;
}

input.form-control:focus {
  border: 2px solid #BB5E00;
  box-shadow: 0 0 5px rgba(25, 135, 84, 0.5);
}

#btn-register {
  background-color: #9b4b4b;
  color: #ffffff;
}

#btn-register:hover {
  background-color: #842B00;
  color: #ccc;
}
</style>