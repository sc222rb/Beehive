/**
 * @file Defines the Harvest Controller class.
 * @module HarvestController
 * @author Sayaka Chishiki Jakobsson
 */

import { HiveModel } from '../../models/HiveModel.js'
import { HarvestModel } from '../../models/HarvestModel.js'
import createError from 'http-errors'
import mongoose from 'mongoose'

/**
 * Encapsulates a controller.
 */
export class HarvestController {
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
      const { id } = req.params
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
   * Creates a new hervest for the hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const { harvest } = req.body

      const hiveId = req.doc.id
      const harvestDoc = await HarvestModel.create({
        hiveId,
        harvest
      })
      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${harvestDoc.id}`
      )

      const harvestObj = harvestDoc.toObject()
      harvestObj._links = {
        self: { href: location.href }
      }

      res
        .location(location.href)
        .status(201)
        .json(harvestObj)
    } catch (error) {
      next(error)
    }
  }
}
