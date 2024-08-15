/**
 * @file Defines the hive router.
 * @module routes/hiveRouter
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import { HiveController } from '../../../controllers/api/HiveController.js'
import { authenticateJWT } from '../../../middlewares/auth.js'
import { router as statusRouter } from './statusRouter.js'
import { router as harvestRouter } from './harvestRouter.js'

export const router = express.Router()

const controller = new HiveController()
// Map HTTP verbs and route paths to controller actions.

// Provide req.hive to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadHiveDocument(req, res, next, id))

/**
 * @openapi
 * /api/v1/hives:
 *   get:
 *     summary: Get a list of all hives
 *     description: Returns an array containing details of all hives.
 *     tags:
 *       - Hives
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of hives
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/',
  authenticateJWT,
  (req, res, next) => controller.findAll(req, res, next)
)

/**
 * @openapi
 * /api/v1/hives:
 *   post:
 *     summary: Creates a new hive
 *     description: Creates a new hive with the provided name and location.
 *     tags:
 *       - Hives
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the hive.
 *                 example: Bee Hive
 *               location:
 *                 type: string
 *                 description: The location of the hive.
 *                 example: KalrmarField1
 *     responses:
 *       201:
 *         description: Hive created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authenticateJWT,
  (req, res, next) => controller.create(req, res, next)
)

/**
 * @openapi
 * /api/v1/hives/{id}:
 *   get:
 *     summary: Get a hive by ID
 *     description: Retrieves details of a hive by its unique identifier.
 *     tags:
 *       - Hives
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive to retrieve
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful retrieval of hive
 *       404:
 *         description: Hive not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id',
  authenticateJWT,
  (req, res, next) => controller.find(req, res, next)
)

/**
 * @openapi
 * /api/v1/hives/{id}:
 *   put:
 *     summary: Update a hive by ID
 *     description: Updates details of a hive by its unique identifier.
 *     tags:
 *       - Hives
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive to retrieve
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
 *               name:
 *                 type: string
 *                 description: The name of the hive.
 *                 example: Bee Hive
 *               location:
 *                 type: string
 *                 description: The location of the hive.
 *                 example: wurzburg
 *     responses:
 *       204:
 *         description: Hive updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hive not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
  authenticateJWT,
  (req, res, next) => controller.checkOwnership(req, res, next),
  (req, res, next) => controller.update(req, res, next)
)

/**
 * @openapi
 * /api/v1/hives/{id}:
 *   delete:
 *     summary: Delete a hive by ID
 *     description: Deletes a hive by its unique identifier.
 *     tags:
 *       - Hives
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive to delete
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Hive deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hive not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
  authenticateJWT,
  (req, res, next) => controller.checkOwnership(req, res, next),
  (req, res, next) => controller.delete(req, res, next)
)

// Use the status router for /hives/:id/status routes
router.use('/:id/status', statusRouter)

// Use the harvest router for /hives/:id/harvest routes
router.use('/:id/harvests', harvestRouter)
