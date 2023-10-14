import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import usersServices from '~/services/users.services'

export function loginValidator(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }

  next()
}

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
