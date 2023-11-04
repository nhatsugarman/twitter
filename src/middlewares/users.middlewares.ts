import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import httpStatus from '~/contants/httpStatus'
import { USER_MESSAGE } from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { hasPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

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
    password: {
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
    },
    confirm_password: {
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
    },
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
      notEmpty: {
        errorMessage: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          const access_token = value.split(' ')[1]

          if (!access_token) {
            throw new ErrorWithStatus({
              message: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }

          const decode_authorization = await verifyToken({ token: access_token })
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
        notEmpty: {
          errorMessage: USER_MESSAGE.REFRETCH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value }),
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGE.REFRETCH_TOKEN_IS_INVALID,
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
