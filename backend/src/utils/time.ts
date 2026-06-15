import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 根據時區計算相關的時間參數
 */
export function getTimezoneContext(timezone: string = 'Asia/Taipei', days: number = 7) {

  const tzNow = dayjs().tz(timezone)

  const labels = []
  for (let i = days - 1; i >= 0; i--) {
    labels.push(tzNow.subtract(i, 'day').format('YYYY-MM-DD'))
  }

  return {
    startOfToday: tzNow.startOf('day').toDate(),
    startOfNextDay: tzNow.add(1, 'day').startOf('day').toDate(),

    sqlOffset: tzNow.format('Z'),

    // 轉成豪秒時間戳
    since: tzNow.subtract(days - 1, 'day').startOf('day').valueOf(),
    until: tzNow.add(1, 'day').startOf('day').valueOf(),

    labels
  }
}
