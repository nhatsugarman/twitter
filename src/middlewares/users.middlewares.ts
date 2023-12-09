import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import httpStatus from '~/contants/httpStatus'
import { USER_MESSAGE } from '~/contants/messages'
import { REGEX_USERNAME } from '~/contants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { UserVerifyState } from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { hasPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const forgotPasswordSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          status: httpStatus.UNAUTHORIZED,
          message: 'Forgot token is required'
        })
      }

      try {
        const decode_forgot_token = await verifyToken({
          token: value,
          secretOrPublickey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })

        const { user_id } = decode_forgot_token

        const user = await databaseService.users.findOne({ _id: new Object(user_id) })

        if (user === null) {
          throw new ErrorWithStatus({
            message: USER_MESSAGE.USER_NOT_FOUND,
            status: httpStatus.UNAUTHORIZED
          })
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            status: httpStatus.UNAUTHORIZED,
            message: 'Invalid'
          })
        }

        req.decode_forgot_token = decode_forgot_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USER_MESSAGE.REFRETCH_TOKEN_IS_INVALID,
            status: 401
          })
        }

        throw error
      }
    }
  }
}

const passwordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 5,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 1,
      minLowercase: 1,
      minSymbols: 1,
      minUppercase: 1,
      minNumbers: 1
    },
    errorMessage: 'Password must be at least 6 characters long and containt at least'
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 5,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 1,
      minLowercase: 1,
      minSymbols: 1,
      minUppercase: 1,
      minNumbers: 1
    },
    errorMessage: 'Password must be at least 6 characters long and containt at least'
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password')
      }

      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 1,
      max: 256
    }
  },
  trim: true
}

const dateOfBirthSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'User not found',
          status: httpStatus.NOT_FOUND
        })
      }

      const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })

      if (followed_user === null) {
        throw new ErrorWithStatus({
          message: 'User not found',
          status: httpStatus.NOT_FOUND
        })
      }
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value, password: hasPassword(req.body.password) })

            if (user === null) {
              throw new Error(USER_MESSAGE.EMAIL_OR_PASSWORD_ERROR)
            }

            req.user = user

            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: true,
        isLength: {
          options: {
            min: 5,
            max: 50
          },
          errorMessage: USER_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_6_50
        },
        isStrongPassword: {
          options: {
            minLength: 1,
            minLowercase: 1,
            minSymbols: 1,
            minUppercase: 1,
            minNumbers: 1
          },
          errorMessage: USER_MESSAGE.PASSWORD_MUST_BE_A_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = checkSchema(
  {
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 256
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const isEmailExist = await usersServices.checkEmailExist(value)

          if (isEmailExist) {
            throw new Error('Email already existed')
          }

          return true
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  },
  ['body']
)

export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          const access_token = (value ?? '').split(' ')[1]

          if (!access_token) {
            throw new ErrorWithStatus({
              message: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }

          const decode_authorization = await verifyToken({
            token: access_token,
            secretOrPublickey: process.env.JWT_SECRET_ACCESS_TOKEN as string
          })
          req.decode_authorization = decode_authorization
          return true
        }
      }
    }
  })
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.REFRETCH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }

            try {
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRESH_TOKEN_NOT_EXIST,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              req.decode_refresh_token = decode_refresh_token

              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRETCH_TOKEN_IS_INVALID,
                  status: 401
                })
              }

              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: httpStatus.UNAUTHORIZED,
                message: USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED
              })
            }

            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublickey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              if (!decoded_email_verify_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRETCH_TOKEN_IS_INVALID,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              req.decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: USER_MESSAGE.REFRETCH_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: true,
        isEmail: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = databaseService.users.findOne({ email: value })

            if (user === null) {
              throw new Error(USER_MESSAGE.USER_NOT_FOUND)
            }

            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: httpStatus.UNAUTHORIZED,
                message: 'Forgot token is required'
              })
            }

            try {
              const decode_forgot_token = await verifyToken({
                token: value,
                secretOrPublickey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })

              const { user_id } = decode_forgot_token

              const user = await databaseService.users.findOne({ _id: new Object(user_id) })

              if (user === null) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.USER_NOT_FOUND,
                  status: httpStatus.UNAUTHORIZED
                })
              }

              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  status: httpStatus.UNAUTHORIZED,
                  message: 'Invalid'
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRETCH_TOKEN_IS_INVALID,
                  status: 401
                })
              }

              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization

  if (verify !== UserVerifyState.Verified) {
    return next(
      new ErrorWithStatus({
        message: 'User is not verifed',
        status: httpStatus.FORBIDDEN
      })
    )
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        optional: true,
        isString: {
          errorMessage: 'Bio is string'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: 'Bio must be 1 to 200 characters'
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: 'Bio is string'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: 'Bio must be 1 to 200 characters'
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: 'Bio is string'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: 'Bio must be 1 to 200 characters'
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: 'Bio is string'
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error('Invalid')
            }

            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw Error('User name is existed')
            }
          }
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: 'Bio is string'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: 'Bio must be 1 to 200 characters'
        }
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: 'Bio is string'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: 'Bio must be 1 to 200 characters'
        }
      }
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = req.decoded_authorization

          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

          if (!user) {
            throw new ErrorWithStatus({
              status: httpStatus.NOT_FOUND,
              message: 'User not found'
            })
          }

          const { password } = user

          const isMatch = hasPassword(value) === password
          if (!isMatch) {
            throw new ErrorWithStatus({
              status: httpStatus.NOT_FOUND,
              message: 'Not match'
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)
