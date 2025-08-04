import { describe, test, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import { getJWTPrivateKey, getJWTPublicKey, createUserJWT } from '../src/jwt.js'

describe('JWT helpers', () => {
  test('getJWTPrivateKey returns a string', () => {
    const key = getJWTPrivateKey()
    expect(typeof key).toBe('string')
    expect(key).toContain('-----BEGIN RSA PRIVATE KEY-----')
  })

  test('getJWTPublicKey returns a string', () => {
    const key = getJWTPublicKey()
    expect(typeof key).toBe('string')
    expect(key).toContain('-----BEGIN PUBLIC KEY-----')
  })

  describe('createUserJWT', () => {
    test('throws if iss is not provided', () => {
      expect(() => createUserJWT({})).toThrow('Must specify issuer (iss)')
    })

    test('creates a valid JWT', () => {
      const token = createUserJWT({ iss: 'test-issuer' })
      const publicKey = getJWTPublicKey()
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] })

      expect(decoded).toBeDefined()
      expect(decoded.iss).toBe('test-issuer')
      expect(decoded.sub).toBe('test-helper-iss')
      expect(decoded.aud).toBe('test-helper-aud')
    })

    test('allows overriding default claims', () => {
      const overrides = {
        iss: 'custom-issuer',
        sub: 'custom-subject',
        aud: 'custom-audience'
      }
      const token = createUserJWT(overrides)
      const publicKey = getJWTPublicKey()
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] })

      expect(decoded.iss).toBe(overrides.iss)
      expect(decoded.sub).toBe(overrides.sub)
      expect(decoded.aud).toBe(overrides.aud)
    })
  })
})
