import jwt from 'jsonwebtoken'

export function signToken({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: any
  privateKey?: string
  options?: jwt.SignOptions
}) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }

      resolve(token as string)
    })
  })
}

export function verifyToken({
  token,
  secretOrPublickey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOrPublickey?: string
}) {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublickey, (error, decode) => {
      if (error) {
        throw reject(error)
      }

      resolve(decode as jwt.JwtPayload)
    })
  })
}
