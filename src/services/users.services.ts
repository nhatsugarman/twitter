import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { UserRegisterBody } from '~/models/request/User.request'
import { hasPassword } from '~/utils/crypto'

class UsersServices {
  async register(payload: UserRegisterBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hasPassword(payload.password)
      })
    )

    return result
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })

    return Boolean(user)
  }
}

const usersServices = new UsersServices()
export default usersServices
