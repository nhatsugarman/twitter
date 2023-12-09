import { ParamsDictionary } from 'express-serve-static-core'

export interface UserRegisterBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface UpdateMeBody {
  name: string
  date_of_birth: string
  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnfollowReqParams extends ParamsDictionary {
  user_id: string
}
