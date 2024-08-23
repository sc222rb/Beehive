/**
 * @file Defines the Status Controller class.
 * @module StatusController
 * @author Sayaka Chishiki Jakobsson
 */

import { StatusModel } from '../../models/StatusModel.js'
import createError from 'http-errors'
import http from 'node:http'
import mongoose from 'mongoose'

/**
 * Encapsulates a controller.
 */
export class StatusController {
  /**
   * Loads a hive document and attaches it to the request object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The ID of the hive document to load.
   * @returns {Promise<void>} - Promise that resolves when the hive document is loaded and attached to the request object.
   */
  async loadDocument (req, res, next, id) {
    try {
      // Get the status document.
      const statusDoc = await StatusModel.findById(id)
      if (!statusDoc) {
        // If no document is found, return a 404 status with a message.
        return next(createError(404, 'Status not found'))
      }

      req.doc = statusDoc
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing status of a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async find (req, res, next) {
    try {
      const statusObj = req.doc.toObject()
      statusObj._links = {
        self: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${req.doc.id}` },
        allStatuses: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}` },
        createStatus: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}`, method: 'POST' }
      }
      res.json(statusObj)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing status of alla hives.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const statuses = await StatusModel.find()

      const statusObjs = statuses.map(status => {
        const statusObj = status.toObject()
        statusObj._links = {
          self: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${status.id}` }
        }
        return statusObj
      })

      res.json(statusObjs)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new status.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const { hiveId, humidity, weight, temperature, hiveFlow, timestamp } = req.body

      const statusDoc = await StatusModel.create({
        hiveId,
        humidity,
        weight,
        temperature,
        hiveFlow,
        timestamp
      })

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${statusDoc.id}`
      )
      const statusObj = statusDoc.toObject()
      statusObj._links = {
        self: { href: location.href }
      }

      res
        .location(location.href)
        .status(201)
        .json(statusObj)
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
   * Sends a JSON response containing the status of a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async getStatus (req, res, next) {
    try {
      const { id } = req.doc.id
      // Get the status document.
      const latestHumidity = await StatusModel.findOne({ id, humidity: { $exists: true } }).sort({ timestamp: -1 })
      const latestWeight = await StatusModel.findOne({ id, weight: { $exists: true } }).sort({ timestamp: -1 })
      const latestTemperature = await StatusModel.findOne({ id, temperature: { $exists: true } }).sort({ timestamp: -1 })

      const statusObj = {
        id,
        location: req.doc.location,
        humidity: latestHumidity?.humidity,
        weight: latestWeight?.weight,
        temperature: latestTemperature?.temperature,
        _links: {
          self: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${req.doc.id}` },
          allStatuses: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}` },
          createStatus: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}`, method: 'POST' }
        }
      }
      res.json(statusObj)
    } catch (error) {
      // If the hive document is not found, throw an error.
      if (error instanceof mongoose.Error.CastError && error.kind === 'ObjectId') {
        return next(createError(404, 'Hive not found'))
      }
      next(error)
    }
  }

  /**
   * Fetches data for a specific type (humidity or weight) for a hive and sends it in the response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} dataType - The type of data to fetch (e.g., 'humidity', 'weight').
   * @param {string} dataField - The database field name to query for (e.g., 'humidity', 'weight').
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async getData (req, res, next, dataType, dataField) {
    try {
      const hiveId = req.doc.id

      const query = { hiveId, [dataField]: { $exists: true } }
      const { from, to } = req.query

      // Apply date filters if provided
      if (from && to) {
        query.timestamp = { $gte: new Date(from), $lte: new Date(to) }
      } else if (from) {
        query.timestamp = { $gte: new Date(from) }
      } else if (to) {
        query.timestamp = { $lte: new Date(to) }
      }

      // Fetch data for the specified hive and optional date range
      const data = await StatusModel.find(query, `timestamp ${dataField}`)

      // If no data found, return 404
      if (!data || data.length === 0) {
        return res.status(404).json({ message: `${dataType} data not found for the specified hive` })
      }

      // Add HATEOAS links
      const dataObjs = data.map(dataItem => {
        const dataObj = dataItem.toObject()
        dataObj._links = {
          self: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${dataItem.id}` }
        }
        return dataObj
      })

      // Return the data
      res.json(dataObjs)
    } catch (error) {
      // If the hive document is not found, throw an error.
      if (error instanceof mongoose.Error.CastError && error.kind === 'ObjectId') {
        return next(createError(404, 'Hive not found'))
      }
      next(error)
    }
  }
}
