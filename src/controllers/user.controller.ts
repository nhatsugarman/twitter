import { Request, Response } from 'express'
import { UserRegisterBody } from '~/models/request/User.request'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'

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
