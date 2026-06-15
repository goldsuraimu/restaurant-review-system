<template>
  <div class="container">
    <div class="row g-3">
      <form @submit.prevent="handleSubmit" class="col-10 col-md-8 col-lg-8 mx-auto" id="edit-panel">
        <h1 class="text-center mt-3 mb-4">編輯個人資料</h1>

        <!-- 表單層錯誤 -->
        <div v-if="fieldErrors.general" class="alert alert-danger mb-4" role="alert">
          {{ fieldErrors.general }}
        </div>

        <!-- 使用者名稱欄位 (不可編輯) -->
        <div class="mb-3 row">
          <label class="col-sm-2 col-form-label">使用者名稱:</label>
          <div class="col-6 col-sm-6 col-lg-4">
            <p class="form-control-plaintext">{{ userProfile?.username }}</p>
          </div>
        </div>

        <!-- 姓名欄位 -->
        <div class="mb-3 row">
          <label for="realName" class="col-sm-2 col-form-label">真實姓名:</label>
          <div class="col-6 col-sm-6  col-lg-4 ">
            <input type="text" class="form-control" :class="{ 'is-invalid': editableUser.realName && !isValidRealName }"
              id="realName" v-model="editableUser.realName" placeholder="2~30 個中英文或空格" maxlength="30">
            <div v-if="realNameError" class="invalid-feedback">{{ realNameError }}</div>
          </div>
        </div>

        <!-- 暱稱 -->
        <div class="mb-3 row">
          <label for="nickname" class="col-sm-2 col-form-label">暱稱:</label>
          <div class="col-6 col-sm-6  col-lg-4 ">
            <input type="text" class="form-control" :class="{ 'is-invalid': editableUser.nickname && !isValidNickname }"
              v-model="editableUser.nickname" placeholder="這將顯示在評論中" maxlength="30">
            <div v-if="nicknameError" class="invalid-feedback">{{ nicknameError }}</div>
          </div>
        </div>

        <!-- 性別欄位 -->
        <div class="mb-3 row">
          <label class="col-sm-2 col-form-label">性別:</label>
          <div class="col-6 col-sm-6  col-lg-4 ">
            <div class="form-check" v-for="opt in genderOptions" :key="`gender-${opt.value}`">
              <input class="form-check-input" type="radio" :value="opt.value" v-model="editableUser.gender"
                :id="`gender-${opt.value}`" />
              <label class="form-check-label" :for="`gender-${opt.value}`">
                {{ opt.label }}
              </label>
            </div>
            <small class="text-muted d-block">
              性別設定後不可清空，但可修改
            </small>
            <div v-if="genderError" class="invalid-feedback">{{ genderError }}</div>
          </div>
        </div>

        <!-- 生日欄位 -->
        <div class="mb-3 row">
          <label for="birthday" class="col-sm-2 col-form-label">生日:</label>
          <div class="col-6 col-sm-6 col-lg-4">
            <input type="date" class="form-control" id="birthday"
              :class="{ 'is-invalid': editableUser.birthday && !isValidBirthday }" v-model="editableUser.birthday"
              :max="today" :min="minDate" :disabled="isBirthdayLocked" />
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
            <input type="tel" class="form-control" :class="{ 'is-invalid': editableUser.phone && !isValidPhone }"
              id="phone" v-model="editableUser.phone" placeholder="手機或家用電話(9~10位數字)" maxlength="15">
            <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
          </div>
        </div>

        <!-- 住址欄位 -->
        <div class="mb-3 row">
          <label for="address" class="col-sm-2 col-form-label">住址:</label>
          <div class="col-10 col-sm-8 col-lg-8 ">
            <input type="text" class="form-control" :class="{ 'is-invalid': editableUser.address && !isValidAddress }"
              id="address" v-model="editableUser.address" placeholder="請輸入住址" minlength="5" maxlength="100">
            <div v-if="addressError" class="invalid-feedback">{{ addressError }}</div>
          </div>
        </div>

        <!-- 郵件欄位 -->
        <div class="mb-3 row">
          <label for="email" class="col-sm-2 col-form-label">電子郵件:</label>
          <div class="col-10 col-sm-8 col-lg-8 d-flex align-items-center">{{ userProfile?.email }}</div>
        </div>

        <div class="col-12 text-center mb-5">
          <LoadingSpinner v-if="isUpdatingProfile" :text="spinnerText" />

          <button type="submit" id="btn-edit" class="btn mt-3"
            :disabled="!isFormValid || !isFormChanged || isUpdatingProfile">
            保存變更
          </button>
        </div>
      </form>
    </div>
    <div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia';

import { useAuthStore } from '@/stores/auth';
import { useFlashStore } from '@/stores/flash'

import { ToastType } from '@/constants/toast'
import { mapProfileErrorToFields } from '@/api/error/field/profile-error.mapper';
import { getFieldError } from '@/utils/form'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { isReasonFailure } from '@/utils/type-guards'

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

import type {
  EditableProfile,
  EditProfileRequest,
} from '@/types/user';

const router = useRouter()

const authStore = useAuthStore();
const { userProfile, isUpdatingProfile } = storeToRefs(authStore);

const flash = useFlashStore()


// 初次進入頁面才抓 
onMounted(() => {
  authStore.ensureMyProfile()
})

const spinnerText = ref<string>('更新中...')

// 性別選項
const genderOptions = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: '其他' }
]

// 可編輯的使用者資料
const editableUser = reactive<EditableProfile>({
  realName: userProfile.value?.realName ?? '',
  nickname: userProfile.value?.nickname ?? '',
  gender: userProfile.value?.gender ?? '',
  birthday: userProfile.value?.birthday ?? '',
  phone: userProfile.value?.phone ?? '',
  address: userProfile.value?.address ?? '',
})


// 錯誤處理
const fieldErrors = reactive<Record<string, string>>({});


// #region 表單驗證
const realNamePattern = /^[A-Za-z\u4E00-\u9FFF·\s]{2,30}$/
const phonePattern = /^0[2-9]\d{7,8}$/
// 儲存最小日期
const minDate = ref<string>('1900-01-01');
// 儲存最大日期
const today = ref<string>(new Date().toISOString().slice(0, 10));

const isValidRealName = computed(() =>
  editableUser.realName === '' ||
  realNamePattern.test(editableUser.realName)
)

const isValidNickname = computed(() => {
  const value = editableUser.nickname

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
  editableUser.gender === '' ||
  ['male', 'female', 'other'].includes(editableUser.gender)
)

const isBirthdayLocked = computed(() =>
  !!userProfile.value?.birthday
)

const isBirthdayEditable = computed(() => {
  return !isBirthdayLocked.value
})

const isValidBirthday = computed(() => {
  // 如果生日已鎖定且有更動，則不合法 
  if (isBirthdayLocked.value &&
    editableUser.birthday !== userProfile.value?.birthday) {
    return false
  }
  // 沒填生日 → 合法
  if (!editableUser.birthday) return true

  // 有填生日 → 檢查範圍
  return editableUser.birthday >= minDate.value &&
    editableUser.birthday <= today.value
})

const isValidPhone = computed(() => {
  if (!editableUser.phone) return true; // 選填欄位，沒填算通過

  // 防呆：先移除所有非數字的字元（如空空白、連字號 -、括號 ()）
  const cleaned = editableUser.phone.replace(/\D/g, '');

  // 檢查過濾後的純數字是否符合台灣電話規則
  return phonePattern.test(cleaned);
});

const isValidAddress = computed(() =>
  editableUser.address === '' ||
  editableUser.address.trim().length >= 5
)


const isFormValid = computed(() =>
  isValidRealName.value &&
  isValidNickname.value &&
  isValidGender.value &&
  isValidBirthday.value &&
  isValidPhone.value &&
  isValidAddress.value
)
// #endregion 

// #region 統一管理前後端錯誤
const realNameError = computed(() =>
  getFieldError('realName', isValidRealName.value, '姓名格式錯誤，僅限 2~30 個中英文或空格。', fieldErrors)
)
const nicknameError = computed(() =>
  getFieldError('nickname', isValidNickname.value, '暱稱格式錯誤，僅限 1~30 個字，不可為空白。', fieldErrors)
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
  getFieldError('address', isValidAddress.value, '地址太短，請輸入完整地址。', fieldErrors)
)
// #endregion

// #region 監聽器，使用者修改就清掉對應的後端錯誤
watch(() => editableUser.realName, () => { if (fieldErrors.realName) delete fieldErrors.realName })
watch(() => editableUser.nickname, () => { if (fieldErrors.nickname) delete fieldErrors.nickname })
watch(() => editableUser.gender, () => { if (fieldErrors.gender) delete fieldErrors.gender })
watch(() => editableUser.birthday, () => { if (fieldErrors.birthday) delete fieldErrors.birthday })
watch(() => editableUser.phone, () => { if (fieldErrors.phone) delete fieldErrors.phone })
watch(() => editableUser.address, () => { if (fieldErrors.address) delete fieldErrors.address })
// #endregion


const trim = (v: string | null | undefined) => v?.trim() ?? ''

// 專門用來清洗電話號碼的輔助函式
const cleanPhone = (v: string | null | undefined) => v?.replace(/\D/g, '') ?? ''

// 判斷欄位是否有修改
const isFieldChanged = (field: keyof EditableProfile) => {

  // 如果是電話欄位，比對清洗過後的純數字，避免因為連字號「-」或空格導致誤判
  if (field === 'phone') {
    return cleanPhone(editableUser.phone) !== cleanPhone(userProfile.value?.phone)
  }

  const current = trim(editableUser[field])
  const initial = trim(userProfile.value?.[field])
  return current !== initial
}

// 判斷表單是否有修改
const isFormChanged = computed(() => {
  if (!userProfile.value) return false

  const fields: (keyof typeof editableUser)[] = ['realName', 'nickname', 'gender', 'birthday', 'phone', 'address']

  return fields.some(isFieldChanged)
})

watch(
  () => userProfile.value,
  (profile) => {
    if (!profile) return

    editableUser.realName = profile.realName ?? ''
    editableUser.nickname = profile.nickname ?? ''
    editableUser.gender = profile.gender ?? ''
    editableUser.birthday = profile.birthday ?? ''
    editableUser.phone = profile.phone ?? ''
    editableUser.address = profile.address ?? ''
  },
  { immediate: true }
)

// 建立更新資料的 payload (只包含修改過的欄位，且空字串會轉成 null 以表示要清除該欄位)
function buildUpdatePayload() {
  const getFieldPayload = (field: keyof EditableProfile) => {
    if (!isFieldChanged(field)) return undefined


    if (field === 'phone') {
      const cleaned = cleanPhone(editableUser.phone)
      return cleaned === '' ? null : cleaned
    }

    const current = trim(editableUser[field] as string)
    return current === '' ? null : current
  }

  const getGenderPayload = () => {
    if (!isFieldChanged('gender')) return undefined

    const current = editableUser.gender
    return current === '' ? undefined : current
  }

  const getBirthdayPayload = () => {
    if (!isFieldChanged('birthday')) return undefined

    // 已鎖定的話強制不送
    if (!isBirthdayEditable.value) return undefined

    const current = trim(editableUser.birthday)

    return current
  }

  return {
    realName: getFieldPayload('realName'),
    nickname: getFieldPayload('nickname'),
    phone: getFieldPayload('phone'),
    address: getFieldPayload('address'),

    birthday: getBirthdayPayload(),
    gender: getGenderPayload()
  }
}

// 提交表單
async function handleSubmit() {
  // 前端表單驗證（防 disable 被移除）
  if (!isFormValid.value || !isFormChanged.value) return

  const payload: EditProfileRequest = buildUpdatePayload()
  const result = await authStore.updateProfile(payload);

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

      // field
      const mapped = mapProfileErrorToFields(result.error);
      // 清空舊錯誤
      Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
      Object.assign(fieldErrors, mapped)
    }

    return
  }

  flash.set({
    type: ToastType.SUCCESS,
    message: '已成功更新個人資料'
  })

  router.push({ name: 'UserProfile' })
};

</script>

<style scoped>
.container {
  position: relative;
  top: -200px;
}

#edit-panel {
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

#btn-edit {
  background-color: #9b4b4b;
  color: #ffffff;
}

#btn-edit:hover {
  background-color: #842B00;
  color: #ccc;
}
</style>