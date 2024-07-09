/**
 * @file Defines the Hive Controller class.
 * @module HiveController
 * @author Sayaka Chishiki Jakobsson
 */

import { HiveModel } from '../../models/HiveModel.js'
import createError from 'http-errors'
import http from 'node:http'
import mongoose from 'mongoose'

/**
 * Encapsulates a controller.
 */
export class HiveController {
  /**
   * Loads a hive document and attaches it to the request object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The ID of the hive document to load.
   * @returns {Promise<void>} - Promise that resolves when the hive document is loaded and attached to the request object.
   */
  async loadHiveDocument (req, res, next, id) {
    try {
      // Get the hive document.
      const hiveDoc = await HiveModel.findById(id)
      if (!hiveDoc) {
        // If no document is found, return a 404 status with a message.
        return next(createError(404, 'Hive not found'))
      }

      req.doc = hiveDoc
      next()
    } catch (error) {
      // Check if the error is a CastError and if it pertains to an ObjectId.
      if (error instanceof mongoose.Error.CastError && error.kind === 'ObjectId') {
        return next(createError(404, 'Hive not found'))
      }

      // Pass any other errors to the next middleware.
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      const hiveObj = req.doc.toObject()
      hiveObj._links = {
        self: { href: `${req.protocol}://${req.get('host')}${req.originalUrl}` },
        update: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${req.doc.id}`, method: 'PUT' },
        delete: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${req.doc.id}`, method: 'DELETE' }
      }
      res.json(hiveObj)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing all hives.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const hives = await HiveModel.find()
      const hiveObjs = hives.map(hive => {
        const hiveObj = hive.toObject()
        hiveObj._links = {
          self: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${hive.id}` }
        }
        return hiveObj
      })

      res.json(hiveObjs)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const { name, location } = req.body

      const hiveDoc = await HiveModel.create({
        name,
        location
      })

      const resourceLocation = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${hiveDoc.id}`
      )

      const hiveObj = hiveDoc.toObject()
      hiveObj._links = {
        self: { href: resourceLocation.href },
        update: { href: `${resourceLocation.href}`, method: 'PUT' },
        delete: { href: `${resourceLocation.href}`, method: 'DELETE' }
      }

      res
        .location(resourceLocation.href)
        .status(201)
        .json(hiveObj)
    } catch (error) {
      let httpStatusCode = 500
      let message = http.STATUS_CODES[httpStatusCode]

      if (error.name === 'ValidationError') {
        // Validation error(s).
        httpStatusCode = 400
        message = 'Invalid input'
      }
      next(createError(httpStatusCode, message, { cause: error }))
    }
  }

  /**
   * Updates a specific hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      req.doc.name = req.body.name
      req.doc.location = req.body.location

      await req.doc.save()

      res
        .status(204)
        .end()
    } catch (error) {
      let httpStatusCode = 500
      let message = http.STATUS_CODES[httpStatusCode]

      if (error.name === 'ValidationError') {
        // Validation error(s).
        httpStatusCode = 400
        message = 'Invalid input'
      }
      next(createError(httpStatusCode, message, { cause: error }))
    }
  }

  /**
   * Deletes the specified hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await req.doc.deleteOne()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
