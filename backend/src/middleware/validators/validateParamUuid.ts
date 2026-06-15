import { Request, Response, NextFunction } from 'express'
import { validate as isUuid } from 'uuid'
import { ApiError } from '#/utils/api-error'

export function validateParamUuid(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req.params[paramName]

    if (!value || Array.isArray(value) || !isUuid(value)) {
      throw new ApiError(`無效的 ${paramName}`, {
        status: 400,
        code: 'INVALID_UUID',
      })
    }

    next()
  }
}