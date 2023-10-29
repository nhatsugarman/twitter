import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import httpStatus from '~/contants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export function defaultErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ messsage: err.message, errorInfo: omit(err, ['stack']) })
}
