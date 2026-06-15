import { createLogger, format, transports, Logger } from 'winston'
import path from 'path'
import fs from 'fs'
import type { TransformableInfo } from 'logform'

// 確保 logs 資料夾存在
const logDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

/**
 * 開發環境：可讀格式
 */
const devFormat = format.printf((info: TransformableInfo) => {
  const {
    timestamp,
    level,
    message,
    stack,
    cause,
    ...meta
  } = info as TransformableInfo & {
    cause?: unknown
  }

  let log = `[${timestamp}] ${level}: ${message}`

  if (stack) {
    log += `\n${stack}`
  }

  if (cause) {
    log += `\n--- caused by ---\n${String(cause)}`
  }

  if (Object.keys(meta).length > 0) {
    log += `\nmeta: ${JSON.stringify(meta, null, 2)}`
  }

  return log
})

// 正式環境：JSON（給 log 系統吃）
const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
)

const logger: Logger = createLogger({
  level: 'info',
  format:
    process.env.NODE_ENV === 'production'
      ? prodFormat
      : format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        devFormat
      ),
  defaultMeta: { service: 'api-service' },
  transports: [
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
})

// 開發環境才印 console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        devFormat
      ),
    })
  )
}

export default logger
