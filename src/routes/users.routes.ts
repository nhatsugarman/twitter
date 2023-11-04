import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/user.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validate(registerValidator), registerController)
usersRouter.post('logout', accessTokenValidator, refreshTokenValidator, logoutController)

export default usersRouter
