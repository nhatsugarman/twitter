import httpStatus from '~/contants/httpStatus'
import { USER_MESSAGE } from '~/contants/messages'

export type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorType

  constructor({ message = USER_MESSAGE.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorType }) {
    super({ status: httpStatus.UNPROCESSABELE_ENTITY, message })

    this.errors = errors
  }
}
