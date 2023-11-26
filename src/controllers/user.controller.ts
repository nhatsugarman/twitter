import { Request, Response } from 'express'
import { ForgotPasswordReqBody, UserRegisterBody } from '~/models/request/User.request'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import User, { UserVerifyState } from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { USER_MESSAGE } from '~/contants/messages'
import httpStatus from '~/contants/httpStatus'
import { TokenType } from '~/contants/enums'
import { json } from 'stream/consumers'

// Handle logic and return
export async function loginController(req: Request, res: Response) {
  try {
    const user = req.user as User
    const user_id = user._id as ObjectId

    const result = await usersServices.login(user_id.toString())

    res.json({
      message: 'Login successfull',
      result
    })
  } catch (error) {
    throw new Error('Login Failed')
  }
}

export async function registerController(req: Request<ParamsDictionary, any, UserRegisterBody, any>, res: Response) {
  try {
    const result = await usersServices.register(req.body)

    return res.json({
      message: 'Register success',
      result
    })
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body
    const result = await usersServices.logout(refresh_token)

    return res.json(result)
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}

export async function emailVerifyController(req: Request, res: Response) {
  try {
    const { user_id } = (req as any).decoded_email_verify_token
    const user = (await databaseService.users.findOne({ _id: new ObjectId(user_id) })) as any

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: USER_MESSAGE.USER_NOT_FOUND
      })
    }

    if (user.email_verify_token === '') {
      return res.json({
        message: USER_MESSAGE.EMAIL_VERIFY
      })
    }

    const result = await usersServices.verifyEmail(user_id)

    return res.json({
      message: USER_MESSAGE.EMAIL_VERIFY_SUCCESS,
      result
    })
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}

export async function resendEmailVerifyController(req: Request, res: Response) {
  try {
    const { user_id } = (req as any).decoded_authorization
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: USER_MESSAGE.USER_NOT_FOUND
      })
    }

    if (user.verify === UserVerifyState.Verified) {
      return res.json({
        message: USER_MESSAGE.EMAIL_VERIFY_BEFORE
      })
    }

    const result = await usersServices.resendVerifyEmail(user_id)

    return res.json({
      message: USER_MESSAGE.EMAIL_VERIFY_SUCCESS,
      result
    })
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}

export async function forgotPasswordController(
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) {
  try {
    const { _id } = req.user as User

    const result = await usersServices.fotgotPassword(String(_id))

    return res.json(result)
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}

export async function verifyForgotPasswordController(
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) {
  try {
    return res.json({
      message: 'Verify success'
    })
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}
export async function resetPasswordController(req: any, res: Response) {
  try {
    const { user_id } = req.decode_forgot_token as any
    const { password } = req.body

    const result = await usersServices.resetPassword(user_id, password)

    return res.json(result)
  } catch (error) {
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}
