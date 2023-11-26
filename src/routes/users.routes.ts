import { Router } from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController
} from '~/controllers/user.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotTokenValidator
} from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validate(registerValidator), registerController)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController)

usersRouter.post('/verify-email', emailVerifyTokenValidator, emailVerifyController)

usersRouter.post('/resend-verify-email', accessTokenValidator, resendEmailVerifyController)

usersRouter.post('/forgot-password', forgotPasswordValidator, forgotPasswordController)

usersRouter.post('/verify-forgot-password', verifyForgotTokenValidator, forgotPasswordController)

usersRouter.post('/reset-password', resetPasswordValidator, resetPasswordController)

usersRouter.get('/me', accessTokenValidator, meController)

export default usersRouter
