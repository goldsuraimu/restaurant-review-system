import { defineStore } from 'pinia'
import { ref } from 'vue'
import camelcaseKeys from 'camelcase-keys'

import * as api from '@/api/admin/dashboard.api'

import type {
  AdminDashboardSummary,
} from '@/types/admin'

import type {
  Result,
} from '@/types'

export const useAdminDashboardStore = defineStore(
  'adminDashboard',
  () => {

    const summary =
      ref<AdminDashboardSummary | null>(null)

    const isLoading =
      ref(false)

    async function loadSummary(): Promise<Result<void>> {

      isLoading.value = true

      try {

        const result =
          await api.fetchAdminDashboardSummary()

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
          }
        }

        summary.value =
          camelcaseKeys(
            result.data.result,
            { deep: true }
          )

        return {
          ok: true,
        }

      } finally {
        isLoading.value = false
      }
    }

    return {
      summary,
      isLoading,

      loadSummary,
    }
  }
)