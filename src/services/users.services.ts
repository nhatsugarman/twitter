import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { UserRegisterBody } from '~/models/request/User.request'
import { hasPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/contants/enums'

class UsersServices {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: '15m'
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      }
    })
  }

  private signAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: UserRegisterBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hasPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()

    const [access_token, refresh_token] = await this.signAndRefreshToken(user_id)

    return { access_token, refresh_token }
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })

    return Boolean(user)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAndRefreshToken(user_id)

    return {
      access_token,
      refresh_token
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
