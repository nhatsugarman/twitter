import { Request, Response } from 'express'

// Handle logic and return
export function loginController(req: Request, res: Response) {
  res.json({
    message: 'Login successfull'
  })
}
