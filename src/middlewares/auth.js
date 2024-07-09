/**
 * @file Authentication and authorization middlewares.
 * @module middlewares/auth
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import http from 'node:http'
import { JsonWebToken } from '../lib/JsonWebToken.js'

/**
 * Authenticates a request based on a JSON Web Token (JWT).
 *
 * This middleware checks the authorization header of the request, verifies the authentication scheme,
 * decodes the JWT using the provided secret key, and attaches the decoded user object to the `req.user` property.
 * If the authentication fails, an unauthorized response with a 401 Unauthorized status code is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    req.user = await JsonWebToken.decodeUser(token, process.env.ACCESS_TOKEN_SECRET)

    next()
  } catch (error) {
    // Authentication failed.
    const statusCode = 401
    const err = new Error(http.STATUS_CODES[statusCode])
    err.status = statusCode
    err.cause = error

    next(err)
  }
}
