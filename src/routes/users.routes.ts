import { Router } from 'express'
import {
  emailVerifyController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController
} from '~/controllers/user.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validate(registerValidator), registerController)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController)

usersRouter.post('/verify-email', emailVerifyTokenValidator, emailVerifyController)

usersRouter.post('/resend-verify-email', accessTokenValidator, resendEmailVerifyController)

export default usersRouter
