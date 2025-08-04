import moment from 'moment'
import NodeRSA from 'node-rsa'
import jwt from 'jsonwebtoken'

const rsaKey = new NodeRSA({ b: 2048 })
const privateKey = rsaKey.exportKey('private')
const publicKey = rsaKey.exportKey('public')

export function getJWTPrivateKey (): string {
  return privateKey
}

export function getJWTPublicKey (): string {
  return publicKey
}

interface CreateUserJWTOptions {
  sub?: string;
  iss: string;
  aud?: string;
  iat?: number;
  exp?: number;
}

export function createUserJWT ({
  sub = 'test-helper-iss',
  iss,
  aud = 'test-helper-aud',
  iat = moment.utc().valueOf() / 1000,
  exp = moment.utc().add(5, 'm').valueOf() / 1000,
}: CreateUserJWTOptions): string {
  if (!iss) {
    throw new Error('Must specify issuer (iss)')
  }
  const clientPayload = {
    iss,
    sub,
    aud,
    iat,
    exp,
  }
  return jwt.sign(clientPayload, getJWTPrivateKey(), { algorithm: 'RS256' })
}
