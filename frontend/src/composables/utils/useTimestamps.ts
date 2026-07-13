import { ref, computed, onMounted, onBeforeUnmount, unref } from 'vue'
import type { Ref } from 'vue';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

// 語言包
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/en'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

// 根據使用者瀏覽器語言切換語系（ex: zh-TW / en-US）
const userLang = navigator.language.toLowerCase()
if (['zh-tw', 'en'].includes(userLang)) {
  dayjs.locale(userLang)
} else {
  dayjs.locale('en') // fallback
}

type MaybeRef<T> = T | Ref<T>
type MaybeNullRef<T> = T | null | Ref<T | null>


export function useTimestamps(
  createdAt: MaybeRef<string | Date>,
  updatedAt?: MaybeNullRef<string | Date>,
) {
  const now = ref(Date.now()) // 用來強制更新

  // 每分鐘刷新一次
  let timer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 60 * 1000)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  // 使用者的時區
  const userTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone

  const createdTime = computed(() => unref(createdAt))

  const updatedTime = computed(() => unref(updatedAt))

  const relativeTimeText = computed(() => {
    now.value

    if (!createdTime.value) {
      return ''
    }

    return dayjs
      .utc(createdTime.value)
      .tz(userTimezone)
      .fromNow()
  })

  const isEdited = computed(() => {
    if (!updatedTime.value) {
      return false
    }

    return (
      dayjs(updatedTime.value).valueOf() !==
      dayjs(createdTime.value).valueOf()
    )
  })

  // 顯示的時間：如果有編輯，顯示更新時間；否則顯示創建時間
  const displayedTime = computed(() => {
    
    const time = isEdited.value
      ? updatedTime.value
      : createdTime.value

    if (!time) {
      return ''
    }

    return dayjs
      .utc(time)
      .tz(userTimezone)
      .format('YYYY-MM-DD HH:mm')
  })

  // 顯示的創建時間（總是顯示建立時間）
  const originalCreatedAt = computed(() => {
    if (!createdTime.value) {
      return ''
    }

    return dayjs
      .utc(createdTime.value)
      .tz(userTimezone)
      .format('YYYY-MM-DD HH:mm')
  })

  const originalUpdatedAt = computed(() => {
    if (!updatedTime.value) {
      return ''
    }

    return dayjs
      .utc(updatedTime.value)
      .tz(userTimezone)
      .format('YYYY-MM-DD HH:mm')
  })

  return {
    relativeTime: relativeTimeText,
    displayedTime,
    originalCreatedAt,
    originalUpdatedAt,
    isEdited,
  }
}
