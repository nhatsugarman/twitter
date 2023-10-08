import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'

// Handle logic and return
export function loginController(req: Request, res: Response) {
  res.json({
    message: 'Login successfull'
  })
}

export async function registerController(req: Request, res: Response) {
  const { email, password } = req.body

  try {
    const result = await usersServices.register({ email, password })

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
