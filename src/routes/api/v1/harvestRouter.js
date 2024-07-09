/**
 * @file Defines the harvest router.
 * @module routes/harvestRouter
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import { HarvestController } from '../../../controllers/api/HarvestController.js'
import { authenticateJWT } from '../../../middlewares/auth.js'

export const router = express.Router({ mergeParams: true })

const controller = new HarvestController()
// Map HTTP verbs and route paths to controller actions.

// Middleware to ensure hiveId is accessible
router.use((req, res, next) => {
  req.hiveId = req.params.id
  next()
})

// Provide req.hive to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadHiveDocument(req, res, next, id))

/**
 * @openapi
 * /api/v1/hives/{id}/harvests:
 *   post:
 *     summary: Create a new harvest for the hive
 *     description: Creates a new harvest record for a specified hive.
 *     tags:
 *       - Harvests
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive to delete
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               harvest:
 *                 type: number
 *                 description: amount of the harvest
 *     responses:
 *       '201':
 *         description: Harvest created successfully
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post('/',
  authenticateJWT,
  (req, res, next) => controller.create(req, res, next)
)
