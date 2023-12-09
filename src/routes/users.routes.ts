import { Router } from 'express'
import {
  emailVerifyController,
  followController,
  forgotPasswordController,
  getProfileController,
  loginController,
  logoutController,
  meController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController
} from '~/controllers/user.controller'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeBody } from '~/models/request/User.request'
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

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'cover_photo',
    'avatar'
  ]),
  updateMeController
)

usersRouter.get('/:username', getProfileController)

usersRouter.get('/follow', accessTokenValidator, verifiedUserValidator, followValidator, followController)

usersRouter.get('/follow/:user_id', accessTokenValidator, verifiedUserValidator, unfollowValidator, unfollowController)

usersRouter.put('/change-password', accessTokenValidator, verifiedUserValidator, unfollowValidator, unfollowController)

export default usersRouter
