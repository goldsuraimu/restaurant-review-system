import type { Request, Response, NextFunction } from 'express';

import * as userService  from '#/services/user/user.service';

/**
 * GET /users/me
 * 取得目前使用者的基本資料
 * - 需要驗證使用者身份
 * - 回傳使用者的 uuiid、username、role、nickname 
 * - 錯誤處理：驗證失敗、服務層錯誤等
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getCurrentUser(req.auth.uuid)
    res.status(200).json({ result: user });
  } catch (err: unknown) {
    next(err);
  }
}

/** 
 * GET /users/profile
 * 取得目前使用者的詳細資料
 * - 需要驗證使用者身份
 * - 回傳使用者的 uuid、username、nickname等基本資料
 * - 錯誤處理：驗證失敗、服務層錯誤等
 */
export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getMyProfile(
      req.auth.uuid
    );

    res.status(200).json({ result: profile });
  } catch (err: unknown) {
    next(err);
  }
}


/** 
 * PUT /users/me
 * 更新目前使用者的基本資料
 * - 需要驗證使用者身份
 * - 接收 JSON 格式的請求，包含可更新的使用者資料欄位（例如：nickname）
 * - 回傳更新後的使用者基本資料
 * - 錯誤處理：驗證失敗、資料驗證錯誤、服務層錯誤等
 */
export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userUuid = req.auth.uuid;
    const payload = req.body;

    const updatedUser = await userService.updateMyProfile(
      userUuid,
      payload
    );

    res.status(200).json({ result: updatedUser });
  } catch (err: unknown) {
    next(err);
  }
}


/**
 * PATCH /users/me/role/owner
 * 成為店主 * - 需要驗證使用者身份
 * - 將目前使用者的角色更新為店主（owner）
 * - 回傳更新後的使用者基本資料
 * - 錯誤處理：驗證失敗、服務層錯誤等
 */

export async function becomeOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const result =
      await userService.becomeOwner(
        req.auth.uuid
      )

    const isProduction = process.env.NODE_ENV === 'production';
    // Vercel(frontend) + Render(backend) 為跨站部署，
    // SameSite=None 才能讓瀏覽器攜帶 Cookie。
    // 若前後端共用主網域（如 app.example.com / api.example.com），
    // 建議改回 sameSite: 'lax' 以提升 CSRF 防護。
    res
      .cookie(
        'access_token',
        result.accessToken,
        {
          httpOnly: true,
          sameSite: isProduction ? 'none' : 'lax',
          secure: isProduction,
          maxAge: 15 * 60 * 1000, // 15分鐘
        }
      )
      .status(200)
      .json({
        result: result.user,
      })

  } catch (err: unknown) {

    next(err)
  }
}