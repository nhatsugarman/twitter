import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { USER_MESSAGE } from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: USER_MESSAGE.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })

          if (user === null) {
            throw new Error(USER_MESSAGE.USER_NOT_FOUND)
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
  })
)

export const registerValidator = checkSchema({
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
})
