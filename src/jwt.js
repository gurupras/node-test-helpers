const moment = require('moment')
const NodeRSA = require('node-rsa')
const jwt = require('jsonwebtoken')

const rsaKey = new NodeRSA({ b: 512 })
const privateKey = rsaKey.exportKey('private')
const publicKey = rsaKey.exportKey('public')

function getJWTPrivateKey () {
  return privateKey
}

function getJWTPublicKey () {
  return publicKey
}

function createUserJWT ({
  sub = 'test-helper-iss',
  iss,
  aud = 'test-helper-aud',
  iat = moment.utc().valueOf() / 1000,
  exp = moment.utc().add(5, 'm').valueOf() / 1000
}) {
  if (!iss) {
    throw new Error('Must specify issuer (iss)')
  }
  const clientPayload = {
    iss,
    sub,
    aud,
    iat,
    exp
  }
  return jwt.sign(clientPayload, getJWTPrivateKey(), { algorithm: 'RS256' })
}

module.exports = {
  getJWTPrivateKey,
  getJWTPublicKey,
  createUserJWT
}
