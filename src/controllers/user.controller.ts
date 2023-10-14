import { Request, Response } from 'express'
import { UserRegisterBody } from '~/models/request/User.request'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'

// Handle logic and return
export function loginController(req: Request, res: Response) {
  res.json({
    message: 'Login successfull'
  })
}

export async function registerController(req: Request<ParamsDictionary, any, UserRegisterBody, any>, res: Response) {
  const { email, password } = req.body

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
