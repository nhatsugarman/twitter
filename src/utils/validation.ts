import express, { Request, Response, NextFunction } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatus from '~/contants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req)
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    }

    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })

    for (const key in errorObject) {
      const { msg } = errorObject[key]

      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABELE_ENTITY) {
        return next(msg)
      }

      entityError.errors[key] = errorObject[key]
    }

    next(entityError)
  }
}
