import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import camelcaseKeys from 'camelcase-keys';

import {
  loginApi,
  registerApi,
  logoutApi,
  fetchCurrentUserApi
} from '@/api/auth/auth.api'

import {
  fetchMyProfileApi,
  updateMyProfileApi,
  becomeOwnerApi,
} from '@/api/users/users.api'

import type {
  RegisterRequest,
  LoginRequest
} from '@/types/auth'

import type {
  AuthUser,
  UserProfile,
  EditProfileRequest
} from '@/types/user'

import type {
  ActionReason
} from '@/types/ui';


import type {
  ActionResult
} from '@/types';


export const useAuthStore = defineStore(
  'auth',
  () => {
    const authUser = ref<AuthUser | null>(null);
    const userProfile = ref<UserProfile | null>(null)

    // 狀態旗標
    const isRegistering = ref<boolean>(false);
    const isLogging = ref<boolean>(false);
    const isUpdatingProfile = ref<boolean>(false);
    const isBecomingOwner = ref<boolean>(false);
    const authStatus = ref<
      'AUTHENTICATED' | 'LOGOUT_PENDING' | 'UNAUTHENTICATED'
    >('UNAUTHENTICATED');


    const isAuthenticated = computed(
      () => authStatus.value === 'AUTHENTICATED'
    );

    const isLogoutPending = computed(
      () => authStatus.value === 'LOGOUT_PENDING'
    );


    // 註冊
    async function register(
      payload: RegisterRequest
    ): Promise<ActionResult<void, ActionReason>> {
      if (isRegistering.value) {
        return { ok: false, reason: 'REGISTERING' };
      }

      isRegistering.value = true;
      try {
        const result = await registerApi(payload);

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          };
        }

        authUser.value = camelcaseKeys(result.data.result);
        authStatus.value = 'AUTHENTICATED';
        return { ok: true };
      } finally {
        isRegistering.value = false;
      }
    }

    // 登入
    async function login(
      payload: LoginRequest
    ): Promise<ActionResult<void, ActionReason>> {
      if (isLogging.value) {
        return { ok: false, reason: 'LOGGING_IN' };
      }

      isLogging.value = true;

      try {
        const result = await loginApi(payload);

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
          };
        }

        authUser.value = camelcaseKeys(result.data.result);
        authStatus.value = 'AUTHENTICATED';
        return { ok: true };
      } finally {
        isLogging.value = false;
      }
    }

    //登出
    async function logout(): Promise<ActionResult> {
      authStatus.value = 'LOGOUT_PENDING';

      try {
        await logoutApi();
      } finally {
        authUser.value = null;
        authStatus.value = 'UNAUTHENTICATED';
      }

      return { ok: true };
    }

    //更新使用者資料
    async function updateProfile(
      payload: EditProfileRequest
    ): Promise<ActionResult<void, ActionReason>> {
      if (isUpdatingProfile.value) {
        return { ok: false, reason: 'UPDATING_PROFILE' };
      }
      isUpdatingProfile.value = true;

      try {
        const result = await updateMyProfileApi(payload);

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          };
        }

        userProfile.value = camelcaseKeys(result.data.result)

        if (authUser.value) {
          authUser.value.nickname = result.data.result.nickname ?? undefined
        }

        return { ok: true };
      } finally {
        isUpdatingProfile.value = false;
      }
    }

    //取得目前使用者資料
    async function fetchCurrentUser() {
      // 已登出 or 正在登出，不撈
      if (authStatus.value !== 'UNAUTHENTICATED') return;

      const result = await fetchCurrentUserApi();

      if (!result.ok) {
        logout();
        return;
      }

      authUser.value = camelcaseKeys(result.data.result);
      authStatus.value = 'AUTHENTICATED';
    }

    // 成為店主
    async function becomeOwner():
      Promise<ActionResult<void, ActionReason>> {

      if (isBecomingOwner.value) {
        return {
          ok: false,
          reason: 'UPDATING_PROFILE',
        }
      }

      isBecomingOwner.value = true

      try {

        const result =  await becomeOwnerApi()

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          };
        }

        authUser.value =
          camelcaseKeys(
            result.data.result
          )

        return {
          ok: true,
        }

      } finally {

        isBecomingOwner.value = false
      }
    }

    //取得使用者完整資料  
    async function fetchMyProfile() {
      const result = await fetchMyProfileApi();

      if (!result.ok) {
        return;
      }

      userProfile.value = result.data.result;
    }

    //確保有使用者完整資料
    async function ensureMyProfile() {
      if (userProfile.value) return

      await fetchMyProfile()
    }

    return {
      authUser,
      userProfile,
      isRegistering,
      isLogging,
      isUpdatingProfile,
      isBecomingOwner,
      isAuthenticated,
      register,
      login,
      logout,
      updateProfile,
      fetchCurrentUser,
      becomeOwner,
      fetchMyProfile,
      ensureMyProfile,
    }
  })