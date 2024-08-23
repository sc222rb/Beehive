/**
 * @file Defines the status router.
 * @module routes/statusRouter
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import { StatusController } from '../../../controllers/api/StatusController.js'
import { authenticateJWT } from '../../../middlewares/auth.js'

export const router = express.Router({ mergeParams: true })

const controller = new StatusController()
// Map HTTP verbs and route paths to controller actions.

// Provide req.doc to the route if :statusId is present in the route path.
router.param('id', (req, res, next, id) => controller.loadDocument(req, res, next, id))

/**
 * @openapi
 * /api/v1/hives/{id}/status:
 *   post:
 *     summary: Create a new status for a hive
 *     description: Creates a new status record for a specified hive.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
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
 *               hiveId:
 *                 type: string
 *                 description: ID of the hive
 *                 example: "60d0fe4f5311236168a10923"
 *               humidity:
 *                 type: number
 *                 description: Humidity level in the hive
 *                 example: 55.5
 *               weight:
 *                 type: number
 *                 description: Weight of the hive
 *                 example: 75.3
 *               temperature:
 *                 type: number
 *                 description: Temperature in the hive
 *                 example: 35.2
 *               hiveFlow:
 *                 type: number
 *                 description: Hive flow rate
 *                 example: 10.5
 *     responses:
 *       201:
 *         description: Status created successfully
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
 * /api/v1/hives/{id}/status:
 *   get:
 *     summary: Get the status of a hive
 *     description: Retrieves the latest status of a specified hive, including humidity, weight, and temperature.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A JSON object containing the status of the hive.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hiveId:
 *                   type: string
 *                   description: ID of the hive
 *                   example: "60d0fe4f5311236168a109ca"
 *                 location:
 *                   type: string
 *                   description: Location of the hive.
 *                   example: "KalrmarField1"
 *                 humidity:
 *                   type: number
 *                   description: The latest humidity value of the hive.
 *                   example: 55.5
 *                 weight:
 *                   type: number
 *                   description: The latest weight value of the hive.
 *                   example: 75.3
 *                 temperature:
 *                   type: number
 *                   description: The latest temperature value of the hive.
 *                   example: 35.2
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hive not found
 *       500:
 *         description: Internal server error
 */
router.get('/',
  authenticateJWT,
  (req, res, next) => controller.getStatus(req, res, next)
)

/**
 * @openapi
 * /api/v1/hives/{id}/status/humidity:
 *   get:
 *     summary: Fetch humidity data for a hive
 *     description: Retrieves humidity data for a specified hive within an optional date range.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
 *         schema:
 *           type: string
 *       - name: from
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date/time for filtering data (inclusive).
 *       - name: to
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date/time for filtering data (inclusive).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of humidity data objects.
 *       400:
 *         description: Bad request
 *       404:
 *         description: No humidity data found for the specified hive or date range.
 *       500:
 *         description: Internal server error
 */
router.get('/humidity',
  authenticateJWT,
  (req, res, next) => controller.getData(req, res, next, 'Humidity', 'humidity')
)

/**
 * @openapi
 * /api/v1/hives/{id}/status/weight:
 *   get:
 *     summary: Fetch weight data for a hive
 *     description: Retrieves weight data for a specified hive within an optional date range.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
 *         schema:
 *           type: string
 *       - name: from
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date/time for filtering data (inclusive).
 *       - name: to
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date/time for filtering data (inclusive).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of weight data objects.
 *       400:
 *         description: Bad request
 *       404:
 *         description: No weight data found for the specified hive or date range.
 *       500:
 *         description: Internal server error
 */
router.get('/weight',
  authenticateJWT,
  (req, res, next) => controller.getData(req, res, next, 'Weight', 'weight')
)

/**
 * @openapi
 * /api/v1/hives/{id}/status/temperature:
 *   get:
 *     summary: Fetch temperature data for a hive
 *     description: Retrieves temperature data for a specified hive within an optional date range.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
 *         schema:
 *           type: string
 *       - name: from
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date/time for filtering data (inclusive).
 *       - name: to
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date/time for filtering data (inclusive).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of temperature data objects.
 *       400:
 *         description: Bad request
 *       404:
 *         description: No temperature data found for the specified hive or date range.
 *       500:
 *         description: Internal server error
 */
router.get('/temperature',
  authenticateJWT,
  (req, res, next) => controller.getData(req, res, next, 'Temperature', 'temperature')
)

/**
 * @openapi
 * /api/v1/hives/{id}/status/hiveFlow:
 *   get:
 *     summary: Fetch hive flow data for a hive
 *     description: Retrieves hive flow data for a specified hive within an optional date range.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
 *         schema:
 *           type: string
 *       - name: from
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date/time for filtering data (inclusive).
 *       - name: to
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date/time for filtering data (inclusive).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of hive flow data objects.
 *       400:
 *         description: Bad request
 *       404:
 *         description: No hive flow data found for the specified hive or date range.
 *       500:
 *         description: Internal server error
 */
router.get('/hiveFlow',
  authenticateJWT,
  (req, res, next) => controller.getData(req, res, next, 'Hive Flow', 'hiveFlow')
)

/**
 * @openapi
 * /api/v1/hives/{id}/status/{statusId}:
 *   get:
 *     summary: Get a specific status of a hive
 *     description: Retrieves a specific status record of a hive by its ID, including the details such as humidity, weight, temperature, and more.
 *     tags:
 *       - Status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the hive
 *         schema:
 *           type: string
 *       - name: statusId
 *         in: path
 *         required: true
 *         description: ID of the status record
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A JSON object containing the details of the specified status record.
 *       404:
 *         description: Status not found or Hive not found.
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:statusId',
  (req, res, next) => controller.find(req, res, next)
)
