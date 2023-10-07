import { Router } from 'express'
import { loginController } from '~/controllers/user.controller'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
