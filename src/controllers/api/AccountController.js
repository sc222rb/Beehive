/**
 * @file Defines the AccountController class.
 * @module AccountController
 * @author Sayaka Chishiki Jakobbsson
 */

import http from 'node:http'
import { JsonWebToken } from '../../lib/JsonWebToken.js'
import { UserModel } from '../../models/UserModel.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      const userDoc = await UserModel.authenticate(req.body.username, req.body.password)
      const user = userDoc.toObject()

      // Create the access token with the shorter lifespan.
      const accessToken = await JsonWebToken.encodeUser(user,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_LIFE
      )

      res
        .status(200)
        .json({
          access_token: accessToken
        })
    } catch (error) {
      // Authentication failed.
      next(createError(401, 'Unauthorized', { cause: error }))
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const { username, password } = req.body

      const userDoc = await UserModel.create({
        username,
        password
      })

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${userDoc.id}`
      )

      const userObj = userDoc.toObject()
      userObj._links = {
        self: { href: location.href },
        login: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/login` }
      }

      res
        .location(location.href)
        .status(201)
        .json(userObj)
    } catch (error) {
      let httpStatusCode = 500
      let message = http.STATUS_CODES[httpStatusCode]

      if (error.code === 11_000) {
        // Duplicated keys.
        httpStatusCode = 409
        message = 'Duplicate key error'
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        httpStatusCode = 400
        message = 'Invalid input'
      }

      next(createError(httpStatusCode, message, { cause: error }))
    }
  }
}
