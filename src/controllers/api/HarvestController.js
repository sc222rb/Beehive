/**
 * @file Defines the Harvest Controller class.
 * @module HarvestController
 * @author Sayaka Chishiki Jakobsson
 */

import { HarvestModel } from '../../models/HarvestModel.js'
import { SubscriptionModel } from '../../models/SubscriptionModel.js'
import createError from 'http-errors'
import fetch from 'node-fetch'

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
   * @param {string} id - The ID of the harvest document to load.
   * @returns {Promise<void>} - Promise that resolves when the hive document is loaded and attached to the request object.
   */
  async loadDocument (req, res, next, id) {
    try {
      const harvestDoc = await HarvestModel.findById(id)
      if (!harvestDoc) {
        // If no document is found, return a 404 status with a message.
        return next(createError(404, 'harvest not found'))
      }

      req.doc = harvestDoc
      next()
    } catch (error) {
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

      await this.notifySubscribers(hiveId, harvestDoc)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Notify subscribers about a new harvest.
   *
   * @param {string} hiveId - ID of the hive.
   * @param {object} harvestDoc - Newly created harvest object.
   */
  async notifySubscribers (hiveId, harvestDoc) {
    try {
      const subscriptions = await SubscriptionModel.find({ hiveId })
      for (const subscription of subscriptions) {
        console.log(`Notifying subscriber at ${subscription.postUrl}`)
        const payload = {
          eventType: 'new_harvest',
          data: harvestDoc
        }
        const response = await fetch(subscription.postUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          console.error(`Failed to notify subscriber at ${subscription.postUrl}: ${response.statusText}`)
          // Optionally handle retry logic or error handling here
        } else {
          console.log(`Successfully notified subscriber at ${subscription.postUrl}`)
        }
      }
    } catch (error) {
      console.error('Error notifying subscribers:', error)
    }
  }

  /**
   * Subscribe to harvest report notifications for a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async subscribe (req, res, next) {
    try {
      const { postUrl } = req.body
      const hiveId = req.doc.id

      const subscriptionDoc = await SubscriptionModel.create({
        hiveId,
        postUrl
      })

      const location = new URL(`${req.protocol}://${req.get('host')}${req.baseUrl}/${subscriptionDoc.id}`)

      const subscriptionObj = subscriptionDoc.toObject()
      subscriptionObj._links = {
        self: { href: location.href },
        unsubscribe: { href: location.href, method: 'DELETE' }
      }
      res
        .location(location.href)
        .status(201)
        .json(subscriptionObj)
    } catch (error) {
      next(createError(500, 'Failed to subscribe to harvest reports', { cause: error }))
    }
  }

  /**
   * Unsubscribe from harvest report notifications for a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async unsubscribe (req, res, next) {
    try {
      const hiveId = req.doc.id

      await SubscriptionModel.deleteMany({ hiveId })
      res
        .status(204)
        .end()
    } catch (error) {
      next(createError(500, 'Failed to unsubscribe from harvest reports', { cause: error }))
    }
  }

  /**
   * Get list of harvest report subscriptions for a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async listSubscriptions (req, res, next) {
    try {
      const hiveId = req.doc.id
      const subscriptions = await SubscriptionModel.find({ hiveId })

      const subscriptionObjs = subscriptions.map(subscription => {
        const subscriptionObj = subscription.toObject()
        subscriptionObj._links = {
          self: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${subscription.id}` },
          unsubscribe: { href: `${req.protocol}://${req.get('host')}${req.baseUrl}/${subscription.id}`, method: 'DELETE' }
        }
        return subscriptionObj
      })

      res
        .status(200)
        .json(subscriptionObjs)
    } catch (error) {
      next(createError(500, 'Failed to fetch harvest report subscriptions', { cause: error }))
    }
  }

  /**
   * Sends a JSON response containing harvest of a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  async find (req, res, next) {
    res.json(req.doc)
  }
}
