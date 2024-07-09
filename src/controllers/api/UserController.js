/**
 * @file Defines the UserController class.
 * @module UserController
 * @author Sayaka Chishiki Jakobsson
 */

import { UserModel } from '../../models/UserModel.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Provide req.user to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the user to load.
   */
  async loadUserDocument (req, res, next, id) {
    try {
      // Get the user document.
      const userDoc = await UserModel.findById(id)

      // If the user document is not found, throw an error.
      if (!userDoc) {
        const error = new Error('The user you requested does not exist.')
        error.status = 404
        throw error
      }

      // Provide the user document to req.
      req.doc = userDoc

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      res.json(req.doc)
    } catch (error) {
      next(error)
    }
  }
}
